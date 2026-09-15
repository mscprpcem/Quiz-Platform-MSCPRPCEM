const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const { Event, Quiz, Question, Participant, QuizAttempt, ScheduledOccurrence, User, EventRegistration } = require('../models');
const { ensureEventsTableSchema } = require('../services/schemaMigration');
const { sendCustomBroadcastEmail, sendEventRegistrationEmail } = require('../services/emailService');
const { uploadImageToAzureBlob } = require('../services/azureBlobService');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'msc_quiz_secret_key_2026';

// Strict admin auth handler
const adminAuth = authMiddleware;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && (file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (PNG, JPG, JPEG, WEBP, GIF, SVG) are allowed.'), false);
    }
  }
});

// ----------------------------------------------------
// POST /api/events/upload-poster (Upload Event Poster to Azure Blob Storage)
// ----------------------------------------------------
router.post('/upload-poster', adminAuth, upload.single('poster'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select an image file to upload.' });
    }

    const uploadResult = await uploadImageToAzureBlob(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'event-poster'
    );

    return res.json({
      success: true,
      message: 'Poster uploaded successfully!',
      url: uploadResult.url,
      blobName: uploadResult.blobName,
      storageType: uploadResult.storageType
    });
  } catch (err) {
    console.error('Error uploading poster image:', err);
    return res.status(500).json({ error: 'Failed to upload image: ' + err.message });
  }
});

// Load static/old events from events.json
let staticEvents = [];
try {
  const jsonPath = path.join(__dirname, '../data/events.json');
  if (fs.existsSync(jsonPath)) {
    staticEvents = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
} catch (e) {
  console.warn('Could not read static events.json:', e.message);
}

// Public base URL for Quiz platform links
const getQuizPlatformBaseUrl = () => {
  return (process.env.PUBLIC_QUIZ_URL || process.env.FRONTEND_URL || 'https://quiz.mscprpcem.tech').replace(/\/+$/, '');
};

// Main Club Website base URL for public event registrations
const getMainWebsiteBaseUrl = () => {
  return (process.env.MAIN_WEBSITE_URL || 'https://www.mscprpcem.tech').replace(/\/+$/, '');
};

const isValidUUID = (val) => {
  return typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
};

const POSTER_PRESETS = [
  { match: 'vision', url: 'https://mscprpcem.blob.core.windows.net/events/VisionX.png' },
  { match: 'spark', url: 'https://mscprpcem.blob.core.windows.net/events/clean_529287766.png' },
  { match: 'dotnet', url: 'https://mscprpcem.blob.core.windows.net/events/12.png' },
  { match: '.net', url: 'https://mscprpcem.blob.core.windows.net/events/12.png' },
  { match: 'gitlit', url: 'https://mscprpcem.blob.core.windows.net/events/gitlit.jpg' },
  { match: 'buildathon', url: 'https://mscprpcem.blob.core.windows.net/events/js_ai.png' },
  { match: 'javascript', url: 'https://mscprpcem.blob.core.windows.net/events/js_ai.png' },
  { match: 'js', url: 'https://mscprpcem.blob.core.windows.net/events/js_ai.png' },
  { match: 'ai', url: 'https://mscprpcem.blob.core.windows.net/events/aiskillfest.png' },
  { match: 'skill', url: 'https://mscprpcem.blob.core.windows.net/events/aiskillfest.png' }
];

function resolveEventPoster(posterUrl, eventName) {
  if (posterUrl && posterUrl.startsWith('http') && !posterUrl.includes('spark-2026.png')) {
    return posterUrl;
  }
  const cleanName = (eventName || '').toLowerCase();
  for (const preset of POSTER_PRESETS) {
    if (cleanName.includes(preset.match)) {
      return preset.url;
    }
  }
  return 'https://mscprpcem.blob.core.windows.net/events/clean_529287766.png';
}

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Formats a date into human-readable event date string in IST like 'Sunday, August 23, 2026'.
 */
function formatEventDateString(dateVal) {
  if (!dateVal) return 'Date Coming Soon';
  const d = (dateVal instanceof Date) ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return typeof dateVal === 'string' ? dateVal : 'Date Coming Soon';
  return d.toLocaleDateString('en-US', {
    timeZone: IST_TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Returns YYYY-MM-DD in IST timezone (guarantees correct calendar date without UTC drift).
 */
function formatDateToIST_YYYYMMDD(dateVal) {
  if (!dateVal) return null;
  const d = (dateVal instanceof Date) ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return null;
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: IST_TIMEZONE }).format(d);
  } catch (e) {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(d.getTime() + istOffset);
    return istDate.toISOString().split('T')[0];
  }
}

/**
 * Formats time in IST like '12:00 AM' or '06:30 PM'.
 */
function formatEventTimeString(dateVal) {
  if (!dateVal) return '';
  const d = (dateVal instanceof Date) ? dateVal : new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Parses user input date defensively into an IST-aware JavaScript Date object.
 */
function parseISTDate(val) {
  if (!val || String(val).trim() === '') return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const str = String(val).trim();

  // If format is YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss without explicit timezone offset
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(str)) {
    const parsed = new Date(`${str}:00`.slice(0, 19) + '+05:30');
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // If format is YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const parsed = new Date(`${str}T00:00:00+05:30`);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Computes event duration (e.g. '1 Day', '3 Day', 'Multi-Day').
 */
function formatEventDuration(startDate, endDate, explicitDuration) {
  if (explicitDuration) return explicitDuration;
  if (!startDate || !endDate) return '1 Day';
  const s = new Date(startDate).getTime();
  const e = new Date(endDate).getTime();
  if (isNaN(s) || isNaN(e) || e <= s) return '1 Day';
  const diffDays = Math.round((e - s) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return '1 Day';
  return `${diffDays} Days`;
}

/**
 * Normalizes an event's date into a numerical millisecond timestamp for chronological sorting.
 * Checks start_date, startDate, start_time, registration_start_date, date, and createdAt.
 */
function getEventSortTimestamp(ev) {
  if (!ev) return 0;
  const candidates = [
    ev.start_date,
    ev.startDate,
    ev.start_time,
    ev.registration_start_date,
    ev.date,
    ev.createdAt
  ];

  for (const candidate of candidates) {
    if (candidate) {
      const parsed = new Date(candidate).getTime();
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }
  return 0;
}

/**
 * Sorts an array of events descending so latest date appears first.
 */
function sortEventsLatestFirst(events) {
  return events.sort((a, b) => {
    const timeA = getEventSortTimestamp(a);
    const timeB = getEventSortTimestamp(b);
    if (timeB !== timeA) {
      return timeB - timeA; // Descending: latest date first
    }
    const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (createdB !== createdA) {
      return createdB - createdA;
    }
    return (a.name || a.title || '').localeCompare(b.name || b.title || '');
  });
}

/**
 * Accurately determines Event Lifecycle Status ('upcoming' | 'live' | 'completed')
 * and Registration Status ('open' | 'closed' | 'completed' | 'pending' | 'full') independently.
 */
function computeEventAndRegStatus(ev, now = new Date(), isLiveNow = false, totalRegCount = 0) {
  const maxRegs = ev.max_registrations ? parseInt(ev.max_registrations, 10) : null;
  const isRegDeadlinePassed = ev.registration_end_date ? new Date(ev.registration_end_date) < now : false;
  const isRegNotStartedYet = ev.registration_start_date ? new Date(ev.registration_start_date) > now : false;
  const isCapacityFull = maxRegs !== null && maxRegs !== undefined && totalRegCount >= maxRegs;

  const rawStatus = (ev.status || 'upcoming').toLowerCase().trim();
  const startDate = ev.start_date ? new Date(ev.start_date) : (ev.startDate ? new Date(ev.startDate) : null);
  const endDate = ev.end_date ? new Date(ev.end_date) : (ev.endDate ? new Date(ev.endDate) : null);

  const isFutureEvent = Boolean(startDate && !isNaN(startDate.getTime()) && startDate > now);
  const isEndDatePassed = Boolean(endDate && !isNaN(endDate.getTime()) ? endDate < now : (startDate && !isNaN(startDate.getTime()) ? startDate < now : false));
  const isExplicitlyCompleted = Boolean((rawStatus === 'completed' || rawStatus === 'past' || rawStatus === 'concluded' || rawStatus === 'cancelled') && !isFutureEvent);

  const isEventCompleted = !isFutureEvent && (isExplicitlyCompleted || (isEndDatePassed && rawStatus !== 'upcoming' && rawStatus !== 'live'));

  // Event Lifecycle Status: 'completed' | 'live' | 'upcoming'
  let eventStatus = 'upcoming';
  if (isEventCompleted) {
    eventStatus = 'completed';
  } else if (isLiveNow || rawStatus === 'live') {
    eventStatus = 'live';
  } else {
    eventStatus = 'upcoming';
  }

  // Registration Status: 'open' | 'closed' | 'completed' | 'pending' | 'full'
  let regStatus = 'open';
  if (isEventCompleted) {
    regStatus = 'completed';
  } else if (ev.is_registration_open === false || isRegDeadlinePassed || rawStatus === 'registration_closed') {
    regStatus = 'closed';
  } else if (isRegNotStartedYet) {
    regStatus = 'pending';
  } else if (isCapacityFull) {
    regStatus = 'full';
  } else {
    regStatus = 'open';
  }

  // Requirements:
  // Accepting Signups -> Show Register
  // Registration Closed -> Hide Register
  // Completed -> Hide Register
  const isRegActive = regStatus === 'open' && !isEventCompleted;

  return {
    eventStatus,
    regStatus,
    isEventCompleted,
    isRegActive,
    isRegEnded: !isRegActive,
    isRegPending: regStatus === 'pending',
    isCapacityFull,
    maxRegs
  };
}

// ----------------------------------------------------
// GET /api/events (Admin / Authenticated Route)
// Returns ALL events (New DB Events + Old Static Events)
// ----------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const baseUrl = getQuizPlatformBaseUrl();
    const now = new Date();
    
    // 1. Fetch all DB events, all quizzes, and registrations
    const [dbEvents, allQuizzes, allRegistrations] = await Promise.all([
      Event.findAll({ order: [['start_date', 'DESC'], ['createdAt', 'DESC']] }).catch(() => []),
      Quiz.findAll({ order: [['createdAt', 'DESC']] }).catch(() => []),
      EventRegistration.findAll({ order: [['createdAt', 'DESC']] }).catch(() => [])
    ]);

    const dbEventNames = new Set(dbEvents.map(e => (e.name || '').toLowerCase().trim()));
    const dbEventIds = new Set(dbEvents.map(e => e.id));

    const formattedEvents = [];

    // Format DB events
    for (const ev of dbEvents) {
      const evNameLower = (ev.name || '').toLowerCase().trim();
      const linkedQuizzes = allQuizzes.filter(q =>
        q.event_id === ev.id || (q.event_name && q.event_name.toLowerCase().trim() === evNameLower)
      );

      const eventRegs = allRegistrations.filter(r =>
        r.event_id === ev.id || r.event_id === ev.slug || (r.event_name && r.event_name.toLowerCase().trim() === evNameLower)
      );

      const actualRegCount = eventRegs.length;
      const initialRegCount = parseInt(ev.initial_registration_count, 10) || 0;
      const totalRegCount = actualRegCount + initialRegCount;

      const statusObj = computeEventAndRegStatus(ev, now, false, totalRegCount);

      formattedEvents.push({
        id: ev.id,
        name: ev.name,
        slug: ev.slug || ev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: ev.description || '',
        poster_url: resolveEventPoster(ev.poster_url, ev.name),
        category: ev.category || 'Innovation Challenge',
        mode: ev.mode || 'Hybrid',
        venue: ev.venue || 'PRPCEM Campus & Virtual',
        start_date: ev.start_date,
        end_date: ev.end_date,
        registration_start_date: ev.registration_start_date,
        registration_end_date: ev.registration_end_date,
        max_registrations: ev.max_registrations !== undefined && ev.max_registrations !== null ? ev.max_registrations : statusObj.maxRegs,
        initial_registration_count: initialRegCount,
        actual_registration_count: actualRegCount,
        fee: ev.fee || 'Free',
        is_registration_open: ev.is_registration_open !== false,
        isRegistrationOpen: statusObj.isRegActive,
        is_registration_ended: statusObj.isRegEnded,
        isRegistrationEnded: statusObj.isRegEnded,
        is_registration_pending: statusObj.isRegPending,
        is_capacity_full: statusObj.isCapacityFull,
        rewards: ev.rewards || 'Certificates & Swags',
        status: ev.status || statusObj.eventStatus,
        event_status: statusObj.eventStatus,
        registration_status: statusObj.regStatus,
        source: 'database',
        registration_count: totalRegCount,
        total_registration_count: totalRegCount,
        seats_remaining: statusObj.maxRegs ? Math.max(0, statusObj.maxRegs - totalRegCount) : null,
        quizzes: linkedQuizzes.map(q => ({
          id: q.id,
          title: q.title,
          mode: q.mode,
          join_code: q.join_code,
          status: q.status,
          direct_url: q.mode === 'SCHEDULED' ? `${baseUrl}/q/${q.custom_slug || q.id}` : `${baseUrl}/join/${q.join_code}`
        })),
        total_quizzes: linkedQuizzes.length
      });
    }

    // 2. Format Old Events from JSON (if not already in DB)
    for (const se of staticEvents) {
      const seTitle = se.title || se.name;
      const seKey = seTitle.toLowerCase().trim();

      if (!dbEventNames.has(seKey) && !dbEventIds.has(se.id)) {
        const linkedQuizzes = allQuizzes.filter(q =>
          q.event_id === se.id || (q.event_name && (q.event_name.toLowerCase().includes(seKey) || seKey.includes(q.event_name.toLowerCase().trim())))
        );

        const eventRegs = allRegistrations.filter(r =>
          r.event_id === se.id || (r.event_name && r.event_name.toLowerCase().trim() === seKey)
        );

        const initialRegCount = parseInt(se.initial_registration_count || se.registration_count, 10) || 0;
        const totalRegCount = eventRegs.length + initialRegCount;

        const fakeEv = {
          ...se,
          status: se.status || 'upcoming',
          end_date: se.endDate ? new Date(se.endDate) : null,
          start_date: se.startDate ? new Date(se.startDate) : null
        };
        const statusObj = computeEventAndRegStatus(fakeEv, now, false, totalRegCount);

        formattedEvents.push({
          id: se.id,
          name: seTitle,
          slug: se.id,
          description: se.description || `Official technical sessions for ${seTitle}.`,
          poster_url: resolveEventPoster(se.poster, seTitle),
          category: se.category || (se.mode === 'Online' ? 'Virtual Challenge' : 'Flagship Event'),
          mode: se.mode || 'Offline',
          venue: se.venue || 'PRPCEM Campus',
          start_date: se.startDate ? new Date(se.startDate) : null,
          end_date: se.endDate ? new Date(se.endDate) : null,
          registration_start_date: null,
          registration_end_date: null,
          max_registrations: null,
          initial_registration_count: initialRegCount,
          actual_registration_count: eventRegs.length,
          fee: 'Free',
          is_registration_open: statusObj.isRegActive,
          isRegistrationOpen: statusObj.isRegActive,
          is_registration_ended: statusObj.isRegEnded,
          isRegistrationEnded: statusObj.isRegEnded,
          is_registration_pending: statusObj.isRegPending,
          is_capacity_full: false,
          rewards: se.rewards || 'Certificates & Swags',
          status: statusObj.eventStatus,
          event_status: statusObj.eventStatus,
          registration_status: statusObj.regStatus,
          source: 'json',
          registration_count: totalRegCount,
          total_registration_count: totalRegCount,
          seats_remaining: null,
          quizzes: linkedQuizzes.map(q => ({
            id: q.id,
            title: q.title,
            mode: q.mode,
            join_code: q.join_code,
            status: q.status,
            direct_url: q.mode === 'SCHEDULED' ? `${baseUrl}/q/${q.custom_slug || q.id}` : `${baseUrl}/join/${q.join_code}`
          })),
          total_quizzes: linkedQuizzes.length
        });
      }
    }

    // Sort all events so the latest date comes first
    sortEventsLatestFirst(formattedEvents);

    res.json({
      success: true,
      count: formattedEvents.length,
      events: formattedEvents
    });
  } catch (err) {
    console.error('Error fetching admin events:', err);
    res.status(500).json({ error: 'Failed to fetch events: ' + err.message });
  }
});

// ----------------------------------------------------
// GET /api/events/details/:idOrSlug (Single Event Details)
// ----------------------------------------------------
router.get('/details/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const baseUrl = getQuizPlatformBaseUrl();
    const now = new Date();

    let event = null;
    if (isValidUUID(idOrSlug)) {
      event = await Event.findByPk(idOrSlug).catch(() => null);
    }
    if (!event) {
      const cleanSlug = String(idOrSlug).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const rawName = String(idOrSlug).trim().replace(/-/g, ' ');
      event = await Event.findOne({
        where: {
          [Op.or]: [
            { slug: idOrSlug },
            { slug: cleanSlug },
            { name: idOrSlug },
            { name: rawName }
          ]
        }
      }).catch(() => null);
    }

    if (!event) {
      const allEvents = await Event.findAll().catch(() => []);
      const cleanTarget = String(idOrSlug).trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
      event = allEvents.find(e => {
        const eSlug = (e.slug || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
        const eName = (e.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
        return eSlug === cleanTarget || eName === cleanTarget;
      });
    }

    if (!event) {
      // Check static events fallback
      const cleanTarget = String(idOrSlug).trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
      const staticMatch = staticEvents.find(s => {
        const sId = (s.id || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
        const sTitle = (s.title || s.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
        return sId === cleanTarget || sTitle === cleanTarget;
      });

      if (staticMatch) {
        const fakeEv = {
          ...staticMatch,
          status: staticMatch.status || 'upcoming',
          end_date: staticMatch.endDate ? new Date(staticMatch.endDate) : null,
          start_date: staticMatch.startDate ? new Date(staticMatch.startDate) : null
        };
        const statusObj = computeEventAndRegStatus(fakeEv, now, false, 0);

        return res.json({
          success: true,
          event: {
            id: staticMatch.id,
            name: staticMatch.title,
            slug: staticMatch.id,
            description: staticMatch.description,
            poster_url: resolveEventPoster(staticMatch.poster, staticMatch.title),
            category: staticMatch.category || 'Technical Workshop',
            mode: staticMatch.mode || 'Offline',
            venue: staticMatch.venue || 'PRPCEM Campus',
            start_date: staticMatch.startDate ? new Date(staticMatch.startDate) : null,
            end_date: staticMatch.endDate ? new Date(staticMatch.endDate) : null,
            registration_start_date: null,
            registration_end_date: null,
            max_registrations: null,
            initial_registration_count: 0,
            actual_registration_count: 0,
            fee: 'Free',
            is_registration_open: statusObj.isRegActive,
            isRegistrationOpen: statusObj.isRegActive,
            is_registration_ended: statusObj.isRegEnded,
            isRegistrationEnded: statusObj.isRegEnded,
            is_registration_pending: statusObj.isRegPending,
            is_capacity_full: false,
            rewards: staticMatch.rewards || 'Certificates & Swags',
            status: statusObj.eventStatus,
            event_status: statusObj.eventStatus,
            registration_status: statusObj.regStatus,
            registration_count: 0,
            total_registration_count: 0,
            seats_remaining: null,
            quizzes: []
          }
        });
      }
      return res.status(404).json({ error: `Event "${idOrSlug}" not found.` });
    }

    const [allQuizzes, allRegistrations] = await Promise.all([
      Quiz.findAll({ order: [['createdAt', 'DESC']] }).catch(() => []),
      EventRegistration.findAll({
        where: {
          [Op.or]: [
            { event_id: event.id },
            { event_id: event.slug || '' },
            { event_name: event.name }
          ]
        }
      }).catch(() => [])
    ]);

    const linkedQuizzes = allQuizzes.filter(q =>
      q.event_id === event.id || (q.event_name && q.event_name.toLowerCase().trim() === event.name.toLowerCase().trim())
    );

    const actualRegCount = allRegistrations.length;
    const initialRegCount = parseInt(event.initial_registration_count, 10) || 0;
    const totalRegCount = actualRegCount + initialRegCount;

    const statusObj = computeEventAndRegStatus(event, now, false, totalRegCount);

    res.json({
      success: true,
      event: {
        id: event.id,
        name: event.name,
        slug: event.slug,
        description: event.description,
        poster_url: resolveEventPoster(event.poster_url, event.name),
        category: event.category,
        mode: event.mode,
        venue: event.venue,
        start_date: event.start_date,
        end_date: event.end_date,
        startDate: formatDateToIST_YYYYMMDD(event.start_date),
        endDate: formatDateToIST_YYYYMMDD(event.end_date),
        formatted_date: formatEventDateString(event.start_date),
        formatted_time: formatEventTimeString(event.start_date),
        start_time_ist: formatEventTimeString(event.start_date),
        end_time_ist: formatEventTimeString(event.end_date),
        time_ist: formatEventTimeString(event.start_date),
        time: formatEventTimeString(event.start_date),
        registration_start_date: event.registration_start_date,
        registration_end_date: event.registration_end_date,
        max_registrations: statusObj.maxRegs,
        initial_registration_count: initialRegCount,
        actual_registration_count: actualRegCount,
        fee: event.fee || 'Free',
        is_registration_open: statusObj.isRegActive,
        isRegistrationOpen: statusObj.isRegActive,
        is_registration_ended: statusObj.isRegEnded,
        isRegistrationEnded: statusObj.isRegEnded,
        is_registration_pending: statusObj.isRegPending,
        is_capacity_full: statusObj.isCapacityFull,
        rewards: event.rewards,
        status: statusObj.eventStatus,
        event_status: statusObj.eventStatus,
        registration_status: statusObj.regStatus,
        registration_count: totalRegCount,
        total_registration_count: totalRegCount,
        seats_remaining: statusObj.maxRegs ? Math.max(0, statusObj.maxRegs - totalRegCount) : null,
        quizzes: linkedQuizzes.map(q => ({
          id: q.id,
          title: q.title,
          mode: q.mode,
          join_code: q.join_code,
          status: q.status,
          direct_url: q.mode === 'SCHEDULED' ? `${baseUrl}/q/${q.custom_slug || q.id}` : `${baseUrl}/join/${q.join_code}`
        }))
      }
    });
  } catch (err) {
    console.error('Error fetching single event details:', err);
    res.status(500).json({ error: 'Failed to fetch event details: ' + err.message });
  }
});

// ----------------------------------------------------
// GET /api/events/:id/registrations (Fetch Event Registrants)
// ----------------------------------------------------
router.get('/:id/registrations', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const registrations = await EventRegistration.findAll({
      where: {
        [Op.or]: [
          { event_id: id },
          { event_id: id.toLowerCase() }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (err) {
    console.error('Error fetching event registrations:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch registrations.' });
  }
});

// ----------------------------------------------------
// DELETE /api/events/registrations/:regId (Admin: Delete an Event Registration)
// ----------------------------------------------------
router.delete('/registrations/:regId', adminAuth, async (req, res) => {
  try {
    const { regId } = req.params;
    if (!regId) {
      return res.status(400).json({ error: 'Registration ID is required.' });
    }

    const registration = await EventRegistration.findByPk(regId);
    if (!registration) {
      return res.status(404).json({ error: 'Event registration not found.' });
    }

    const regEmail = registration.email ? registration.email.toLowerCase().trim() : null;
    const regEventId = registration.event_id;
    const regEventName = registration.event_name;

    // Delete the event registration record
    await registration.destroy();

    // Cascade: Clean up associated quiz attempts & live participants for this event
    // so the deleted attendee is completely removed from the mail sending section
    if (regEmail) {
      try {
        const orConditions = [];
        if (regEventId) orConditions.push({ event_id: regEventId });
        if (regEventName) orConditions.push({ event_name: regEventName });

        if (orConditions.length > 0) {
          const matchingQuizzes = await Quiz.findAll({
            where: { [Op.or]: orConditions },
            attributes: ['id']
          }).catch(() => []);

          if (matchingQuizzes.length > 0) {
            const quizIds = matchingQuizzes.map(q => q.id);
            if (QuizAttempt) {
              await QuizAttempt.destroy({
                where: {
                  quiz_id: { [Op.in]: quizIds },
                  [Op.or]: [
                    { participant_email: regEmail },
                    { email: regEmail }
                  ]
                }
              }).catch(() => {});
            }
            if (Participant) {
              await Participant.destroy({
                where: {
                  quiz_id: { [Op.in]: quizIds },
                  email: regEmail
                }
              }).catch(() => {});
            }
          }
        }
      } catch (cleanupErr) {
        console.warn('Notice: event attempt cleanup warning during registration delete:', cleanupErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'Registration deleted successfully and removed from email audience.'
    });
  } catch (err) {
    console.error('Error deleting registration:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete registration.' });
  }
});

// Helper: Sanitize event status to prevent PostgreSQL enum mismatch
const sanitizeEventStatus = (statusVal) => {
  if (!statusVal) return 'upcoming';
  const clean = String(statusVal).toLowerCase().trim();
  if (clean === 'past') return 'completed';
  return clean;
};

// ----------------------------------------------------
// POST /api/events (Create a New Event in Admin Panel)
// ----------------------------------------------------
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      poster_url,
      category,
      mode,
      venue,
      start_date,
      end_date,
      registration_start_date,
      registration_end_date,
      max_registrations,
      initial_registration_count,
      fee,
      is_registration_open,
      rewards,
      status
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Event Name is required.' });
    }

    const cleanName = name.trim();
    const cleanSlug = slug && slug.trim()
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const finalPoster = resolveEventPoster(poster_url, cleanName);

    const parsedStartDate = parseISTDate(start_date);
    const parsedEndDate = parseISTDate(end_date);
    const parsedRegStartDate = parseISTDate(registration_start_date);
    const parsedRegEndDate = parseISTDate(registration_end_date);
    const parsedMaxRegs = max_registrations !== undefined && max_registrations !== '' && max_registrations !== null
      ? parseInt(max_registrations, 10)
      : null;
    const parsedInitialRegs = initial_registration_count !== undefined && initial_registration_count !== '' && initial_registration_count !== null
      ? Math.max(0, parseInt(initial_registration_count, 10))
      : 0;

    if (parsedStartDate && parsedEndDate && parsedEndDate < parsedStartDate) {
      return res.status(400).json({ error: 'Event End Date & Time cannot be earlier than Event Start Date & Time.' });
    }

    const cleanStatus = sanitizeEventStatus(status);

    let newEvent;
    try {
      newEvent = await Event.create({
        name: cleanName,
        slug: cleanSlug,
        description: description ? description.trim() : '',
        poster_url: finalPoster,
        category: category || 'Innovation Challenge',
        mode: mode || 'Hybrid',
        venue: venue || 'PRPCEM Campus & Virtual',
        start_date: parsedStartDate,
        end_date: parsedEndDate,
        registration_start_date: parsedRegStartDate,
        registration_end_date: parsedRegEndDate,
        max_registrations: parsedMaxRegs,
        initial_registration_count: parsedInitialRegs,
        fee: fee || 'Free',
        is_registration_open: is_registration_open !== false,
        rewards: rewards || 'Certificates & Swags',
        status: cleanStatus
      });
    } catch (createErr) {
      if (createErr.message && (/enum_Events_status/i.test(createErr.message) || /is_registration_open/i.test(createErr.message) || /initial_registration_count/i.test(createErr.message) || /column.*does not exist/i.test(createErr.message) || /no such column/i.test(createErr.message))) {
        console.warn('⚠️ Missing column or enum constraint detected in Events table. Running on-the-fly schema repair...');
        await ensureEventsTableSchema(Event.sequelize);
        newEvent = await Event.create({
          name: cleanName,
          slug: cleanSlug,
          description: description ? description.trim() : `Official technical event and challenges for ${cleanName}.`,
          poster_url: finalPoster,
          category: category || 'Innovation Challenge',
          mode: mode || 'Hybrid',
          venue: venue || 'PRPCEM Campus & Virtual',
          start_date: parsedStartDate,
          end_date: parsedEndDate,
          registration_start_date: parsedRegStartDate,
          registration_end_date: parsedRegEndDate,
          max_registrations: parsedMaxRegs,
          initial_registration_count: parsedInitialRegs,
          fee: fee || 'Free',
          is_registration_open: is_registration_open !== false,
          rewards: rewards || 'Certificates & Swags',
          status: cleanStatus === 'past' ? 'completed' : cleanStatus
        });
      } else {
        throw createErr;
      }
    }

    res.json({
      success: true,
      message: `Event "${cleanName}" created successfully!`,
      event: newEvent
    });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: err.message || 'Failed to create event.' });
  }
});

// ----------------------------------------------------
// PUT /api/events/:id (Update Event)
// ----------------------------------------------------
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let event = null;
    if (isValidUUID(id)) {
      event = await Event.findByPk(id).catch(() => null);
    } else {
      event = await Event.findOne({ where: { slug: id } }).catch(() => null);
    }
    
    // If updating a static event that was in JSON, migrate it into DB
    if (!event) {
      const staticMatch = staticEvents.find(s => s.id === id || (s.title && s.title.toLowerCase() === id.toLowerCase()) || (s.id && s.id.toLowerCase() === id.toLowerCase()));
      if (staticMatch) {
        const initialDate = staticMatch.startDate
          ? new Date(staticMatch.startDate)
          : (staticMatch.date && !isNaN(new Date(staticMatch.date).getTime()) ? new Date(staticMatch.date) : new Date());
        const initialEndDate = staticMatch.endDate
          ? new Date(staticMatch.endDate)
          : null;
        const initialStatus = sanitizeEventStatus(staticMatch.status);

        try {
          event = await Event.create({
            name: staticMatch.title || staticMatch.name,
            slug: staticMatch.id,
            description: staticMatch.description,
            poster_url: resolveEventPoster(staticMatch.poster, staticMatch.title),
            category: staticMatch.category || 'Technical Workshop',
            mode: staticMatch.mode || 'Offline',
            venue: staticMatch.venue || 'PRPCEM Campus',
            start_date: initialDate,
            end_date: initialEndDate,
            rewards: staticMatch.rewards || 'Certificates & Swags',
            status: initialStatus
          });
        } catch (staticCreateErr) {
          if (staticCreateErr.message && (/enum_Events_status/i.test(staticCreateErr.message) || /is_registration_open/i.test(staticCreateErr.message) || /column.*does not exist/i.test(staticCreateErr.message) || /no such column/i.test(staticCreateErr.message))) {
            await ensureEventsTableSchema(Event.sequelize);
            event = await Event.create({
              name: staticMatch.title || staticMatch.name,
              slug: staticMatch.id,
              description: staticMatch.description,
              poster_url: resolveEventPoster(staticMatch.poster, staticMatch.title),
              category: staticMatch.category || 'Technical Workshop',
              mode: staticMatch.mode || 'Offline',
              venue: staticMatch.venue || 'PRPCEM Campus',
              start_date: initialDate,
              end_date: initialEndDate,
              rewards: staticMatch.rewards || 'Certificates & Swags',
              status: initialStatus === 'past' ? 'completed' : initialStatus
            });
          } else {
            throw staticCreateErr;
          }
        }
      } else {
        return res.status(404).json({ error: 'Event not found.' });
      }
    }

    const {
      name,
      slug,
      description,
      poster_url,
      category,
      mode,
      venue,
      start_date,
      end_date,
      registration_start_date,
      registration_end_date,
      max_registrations,
      initial_registration_count,
      fee,
      is_registration_open,
      rewards,
      status
    } = req.body;

    if (name) {
      event.name = name.trim();
    }
    if (slug !== undefined && slug.trim()) {
      event.slug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    } else if (name && !event.slug) {
      event.slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) event.description = description;
    if (poster_url !== undefined) {
      event.poster_url = resolveEventPoster(poster_url, event.name);
    }
    if (category !== undefined) event.category = category;
    if (mode !== undefined) event.mode = mode;
    if (venue !== undefined) event.venue = venue;
    
    // Update dates accurately in IST
    if (start_date !== undefined) {
      event.start_date = parseISTDate(start_date);
    }

    if (end_date !== undefined) {
      event.end_date = parseISTDate(end_date);
    }

    if (registration_start_date !== undefined) {
      event.registration_start_date = parseISTDate(registration_start_date);
    }

    if (registration_end_date !== undefined) {
      event.registration_end_date = parseISTDate(registration_end_date);
    }

    if (max_registrations !== undefined) {
      event.max_registrations = max_registrations !== '' && max_registrations !== null ? parseInt(max_registrations, 10) : null;
    }
    if (initial_registration_count !== undefined) {
      event.initial_registration_count = initial_registration_count !== '' && initial_registration_count !== null ? Math.max(0, parseInt(initial_registration_count, 10)) : 0;
    }
    if (fee !== undefined) event.fee = fee || 'Free';
    if (is_registration_open !== undefined) event.is_registration_open = Boolean(is_registration_open);
    if (rewards !== undefined) event.rewards = rewards;
    if (status !== undefined) {
      event.status = sanitizeEventStatus(status);
    }

    if (event.start_date && event.end_date && new Date(event.end_date) < new Date(event.start_date)) {
      return res.status(400).json({ error: 'Event End Date & Time cannot be earlier than Event Start Date & Time.' });
    }

    try {
      await event.save();
    } catch (saveErr) {
      if (saveErr.message && (/enum_Events_status/i.test(saveErr.message) || /is_registration_open/i.test(saveErr.message) || /initial_registration_count/i.test(saveErr.message) || /column.*does not exist/i.test(saveErr.message) || /no such column/i.test(saveErr.message))) {
        console.warn('⚠️ Missing column or enum constraint on event save. Running on-the-fly schema repair...');
        await ensureEventsTableSchema(Event.sequelize);
        event.status = sanitizeEventStatus(event.status);
        await event.save();
      } else {
        throw saveErr;
      }
    }

    res.json({
      success: true,
      message: 'Event updated successfully!',
      event
    });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: err.message || 'Failed to update event.' });
  }
});

// ----------------------------------------------------
// DELETE /api/events/:id (Delete Event)
// ----------------------------------------------------
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let event = null;
    if (isValidUUID(id)) {
      event = await Event.findByPk(id).catch(() => null);
    } else {
      event = await Event.findOne({ where: { slug: id } }).catch(() => null);
    }
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // 1. Safely detach linked quizzes so quizzes remain safe and foreign keys never conflict
    await Quiz.update(
      { event_id: null },
      { where: { [Op.or]: [{ event_id: event.id }, ...(event.slug ? [{ event_id: event.slug }] : [])] } }
    ).catch(() => {});

    // 2. Remove registrations linked to this event
    await EventRegistration.destroy({
      where: { [Op.or]: [{ event_id: event.id }, ...(event.slug ? [{ event_id: event.slug }] : [])] }
    }).catch(() => {});

    // 3. Destroy event record
    await event.destroy();
    res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: err.message || 'Failed to delete event.' });
  }
});


// ----------------------------------------------------
// POST /api/events/:id/delink-quiz (Delink a quiz from this event)
// DELETE /api/events/:id/quizzes/:quizId (RESTful delink alias)
// ----------------------------------------------------
router.post('/:id/delink-quiz', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { quiz_id } = req.body;
    if (!quiz_id) {
      return res.status(400).json({ error: 'quiz_id is required to delink quiz.' });
    }

    let event = null;
    if (isValidUUID(id)) {
      event = await Event.findByPk(id).catch(() => null);
    } else {
      event = await Event.findOne({ where: { slug: id } }).catch(() => null);
    }
    if (!event) {
      event = await Event.findOne({ where: { name: id } }).catch(() => null);
    }

    const quiz = await Quiz.findByPk(quiz_id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    // Detach quiz safely from event
    await quiz.update({
      event_id: null,
      event_name: quiz.title ? `Standalone: ${quiz.title}` : 'Standalone Assessment'
    });

    res.json({
      success: true,
      message: `Quiz "${quiz.title}" successfully delinked from event.`,
      quiz_id: quiz.id
    });
  } catch (err) {
    console.error('Error delinking quiz from event:', err);
    res.status(500).json({ error: err.message || 'Failed to delink quiz from event.' });
  }
});

router.delete('/:id/quizzes/:quizId', adminAuth, async (req, res) => {
  try {
    const { id, quizId } = req.params;
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    await quiz.update({
      event_id: null,
      event_name: quiz.title ? `Standalone: ${quiz.title}` : 'Standalone Assessment'
    });

    res.json({
      success: true,
      message: `Quiz "${quiz.title}" successfully delinked from event.`,
      quiz_id: quiz.id
    });
  } catch (err) {
    console.error('Error delinking quiz from event:', err);
    res.status(500).json({ error: err.message || 'Failed to delink quiz from event.' });
  }
});

// ----------------------------------------------------
// POST /api/events/:id/link-quiz (Link an existing quiz to this event)
// ----------------------------------------------------
router.post('/:id/link-quiz', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { quiz_id } = req.body;
    if (!quiz_id) {
      return res.status(400).json({ error: 'quiz_id is required to link quiz.' });
    }

    let event = null;
    if (isValidUUID(id)) {
      event = await Event.findByPk(id).catch(() => null);
    } else {
      event = await Event.findOne({ where: { slug: id } }).catch(() => null);
    }
    if (!event) {
      event = await Event.findOne({ where: { name: id } }).catch(() => null);
    }
    if (!event) {
      const se = staticEvents.find(e => e.id === id || e.slug === id || ((e.name || e.title) && (e.name || e.title).toLowerCase() === id.toLowerCase()));
      if (se) {
        event = {
          id: se.id,
          name: se.name || se.title,
          slug: se.slug || se.id
        };
      }
    }
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const quiz = await Quiz.findByPk(quiz_id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    await quiz.update({
      event_id: event.id,
      event_name: event.name
    });

    res.json({
      success: true,
      message: `Quiz "${quiz.title}" linked to "${event.name}" successfully.`,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        mode: quiz.mode,
        code: quiz.join_code,
        is_active: quiz.status === 'in_progress' || quiz.status === 'waiting_lobby'
      }
    });
  } catch (err) {
    console.error('Error linking quiz to event:', err);
    res.status(500).json({ error: err.message || 'Failed to link quiz to event.' });
  }
});

// ----------------------------------------------------
// GET /api/events/public
// Public events feed for mscprpcem-website
// ----------------------------------------------------
router.get('/public', async (req, res) => {
  try {
    const now = new Date();
    const baseUrl = getQuizPlatformBaseUrl();

    // 1. Fetch DB Events, Quizzes, and Registrations safely
    const [dbEvents, allQuizzes, allRegistrations] = await Promise.all([
      Event.findAll({ order: [['start_date', 'DESC'], ['createdAt', 'DESC']] }).catch(() => []),
      Quiz.findAll({
        include: [
          {
            model: ScheduledOccurrence,
            as: 'occurrences',
            required: false,
            attributes: ['id', 'start_time', 'end_time', 'status']
          }
        ]
      }).catch(() => []),
      EventRegistration.findAll().catch(() => [])
    ]);

    const dbEventNames = new Set(dbEvents.map(e => (e.name || '').toLowerCase().trim()));
    const dbEventIds = new Set(dbEvents.map(e => e.id));

    const eventsList = [];

    // Format DB events
    for (const dev of dbEvents) {
      const devNameLower = (dev.name || '').toLowerCase().trim();
      const resolvedPoster = resolveEventPoster(dev.poster_url, dev.name);

      const linkedQuizzes = allQuizzes.filter(q =>
        q.event_id === dev.id || (q.event_name && q.event_name.toLowerCase().trim() === devNameLower)
      );

      const eventRegs = allRegistrations.filter(r =>
        r.event_id === dev.id || r.event_id === dev.slug || (r.event_name && r.event_name.toLowerCase().trim() === devNameLower)
      );

      const actualRegCount = eventRegs.length;
      const initialRegCount = parseInt(dev.initial_registration_count, 10) || 0;
      const totalRegCount = actualRegCount + initialRegCount;
      const quizTracks = [];
      let isLiveNow = false;

      for (const q of linkedQuizzes) {
        const slug = q.custom_slug || (q.title ? q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : q.join_code);
        const isScheduled = q.mode === 'SCHEDULED' || (q.occurrences && q.occurrences.length > 0);
        const directUrl = isScheduled ? `${baseUrl}/q/${slug}` : `${baseUrl}/join/${q.join_code}`;

        let startTime = q.scheduled_start || q.createdAt;
        let endTime = q.scheduled_end;

        if (q.occurrences && q.occurrences.length > 0) {
          const validOcc = q.occurrences.filter(occ => !occ.end_time || new Date(occ.end_time) >= now);
          if (validOcc.length > 0) {
            startTime = validOcc[0].start_time;
            endTime = validOcc[0].end_time;
          }
        }

        const [questionCount, liveCount, attemptCount] = await Promise.all([
          Question.count({ where: { quiz_id: q.id } }).catch(() => 0),
          Participant.count({ where: { quiz_id: q.id } }).catch(() => 0),
          QuizAttempt.count({ where: { quiz_id: q.id } }).catch(() => 0)
        ]);

        const totalQuizAttempts = attemptCount + liveCount;

        const sDate = startTime ? new Date(startTime) : null;
        if (sDate && sDate <= now && (!endTime || new Date(endTime) >= now)) {
          isLiveNow = true;
        }

        quizTracks.push({
          quiz_id: q.id,
          title: q.title,
          slug,
          mode: q.mode,
          join_code: q.join_code,
          question_count: questionCount,
          attempt_count: attemptCount,
          total_attempts: totalQuizAttempts,
          participant_count: totalQuizAttempts,
          direct_quiz_url: directUrl,
          start_time: startTime,
          end_time: endTime,
          status: (sDate && sDate <= now && (!endTime || new Date(endTime) >= now)) ? 'LIVE' : 'UPCOMING'
        });
      }

      const statusObj = computeEventAndRegStatus(dev, now, isLiveNow, totalRegCount);
      const formattedDate = formatEventDateString(dev.start_date);
      const computedDuration = formatEventDuration(dev.start_date, dev.end_date, dev.duration);
      const mainWebsiteUrl = getMainWebsiteBaseUrl();
      const regUrlRelative = `/register/${dev.slug || dev.id}`;
      const regUrlAbsolute = `${mainWebsiteUrl}/register/${dev.slug || dev.id}`;

      eventsList.push({
        id: dev.id,
        event_name: dev.name,
        name: dev.name,
        title: dev.name,
        slug: dev.slug || dev.id,
        description: dev.description || `Official challenges and technical sessions for ${dev.name}.`,
        poster: resolvedPoster,
        poster_url: resolvedPoster,
        banner: resolvedPoster,
        image: resolvedPoster,
        date: formattedDate,
        startDate: formatDateToIST_YYYYMMDD(dev.start_date),
        endDate: formatDateToIST_YYYYMMDD(dev.end_date),
        start_date: formattedDate,
        end_date: dev.end_date ? formatEventDateString(dev.end_date) : null,
        start_time: dev.start_date || dev.createdAt,
        end_time: dev.end_date,
        start_time_ist: formatEventTimeString(dev.start_date),
        end_time_ist: formatEventTimeString(dev.end_date),
        time: formatEventTimeString(dev.start_date),
        time_ist: formatEventTimeString(dev.start_date),
        event_time: formatEventTimeString(dev.start_date),
        duration: computedDuration,
        category: dev.category || 'Innovation Challenge',
        mode: dev.mode || 'Hybrid',
        venue: dev.venue || 'PRPCEM Campus & Virtual',
        rewards: dev.rewards || 'Certificates & Swags',
        prizes: dev.rewards || 'Certificates & Swags',
        registration_start_date: dev.registration_start_date,
        registration_end_date: dev.registration_end_date,
        max_registrations: statusObj.maxRegs,
        maxRegistrations: statusObj.maxRegs,
        initial_registration_count: initialRegCount,
        actual_registration_count: actualRegCount,
        seats_remaining: statusObj.maxRegs ? Math.max(0, statusObj.maxRegs - totalRegCount) : null,
        seatsRemaining: statusObj.maxRegs ? Math.max(0, statusObj.maxRegs - totalRegCount) : null,
        fee: dev.fee || 'Free',
        price: dev.fee || 'Free',
        is_registration_open: statusObj.isRegActive,
        isRegistrationOpen: statusObj.isRegActive,
        is_registration_ended: statusObj.isRegEnded,
        isRegistrationEnded: statusObj.isRegEnded,
        is_registration_pending: statusObj.isRegPending,
        is_capacity_full: statusObj.isCapacityFull,
        show_register_button: statusObj.isRegActive,
        is_live: statusObj.eventStatus === 'live',
        is_upcoming: statusObj.eventStatus === 'upcoming',
        is_completed: statusObj.eventStatus === 'completed',
        status: statusObj.eventStatus,
        event_status: statusObj.eventStatus,
        registration_status: statusObj.regStatus,
        showOnHomePopup: statusObj.eventStatus === 'upcoming' || Boolean(dev.showOnHomePopup),
        popupMessage: dev.popupMessage || (statusObj.eventStatus === 'upcoming' && statusObj.isRegActive ? `Registrations are live for ${dev.name}!` : ''),
        quizzes: quizTracks,
        total_quizzes_count: quizTracks.length,
        registration_count: totalRegCount,
        total_registration_count: totalRegCount,
        attendees_count: totalRegCount,
        registrations: totalRegCount,
        direct_quiz_url: quizTracks.length > 0 ? quizTracks[0].direct_quiz_url : null,
        register: statusObj.isRegActive ? regUrlRelative : null,
        registerUrl: statusObj.isRegActive ? regUrlAbsolute : null,
        registration_url: statusObj.isRegActive ? regUrlAbsolute : null
      });
    }

    // 2. Format Old Events from JSON (if not in DB)
    for (const se of staticEvents) {
      const seTitle = se.title || se.name;
      const seKey = seTitle.toLowerCase().trim();

      if (!dbEventNames.has(seKey) && !dbEventIds.has(se.id)) {
        const eventRegs = allRegistrations.filter(r =>
          r.event_id === se.id || (r.event_name && r.event_name.toLowerCase().trim() === seKey)
        );

        const initialRegCount = parseInt(se.initial_registration_count || se.registration_count, 10) || 0;
        const totalRegCount = eventRegs.length + initialRegCount;

        const fakeEv = {
          ...se,
          status: se.status || 'upcoming',
          end_date: se.endDate ? new Date(se.endDate) : null,
          start_date: se.startDate ? new Date(se.startDate) : null
        };
        const statusObj = computeEventAndRegStatus(fakeEv, now, false, totalRegCount);
        const sePoster = resolveEventPoster(se.poster, seTitle);
        const seFormattedDate = se.date || (se.startDate ? formatEventDateString(se.startDate) : 'Past Event');
        const seDuration = se.duration || '1 Day';
        const mainWebsiteUrl = getMainWebsiteBaseUrl();
        const regUrlRelative = `/register/${se.id}`;
        const regUrlAbsolute = `${mainWebsiteUrl}/register/${se.id}`;

        eventsList.push({
          id: se.id,
          event_name: seTitle,
          name: seTitle,
          title: seTitle,
          slug: se.id,
          description: se.description || `Community event by MSC-PRPCEM.`,
          poster: sePoster,
          poster_url: sePoster,
          banner: sePoster,
          image: sePoster,
          date: seFormattedDate,
          startDate: se.startDate ? formatDateToIST_YYYYMMDD(se.startDate) : null,
          endDate: se.endDate ? formatDateToIST_YYYYMMDD(se.endDate) : null,
          start_date: seFormattedDate,
          end_date: se.endDate ? formatEventDateString(se.endDate) : null,
          start_time: se.startDate ? new Date(se.startDate) : new Date(2025, 0, 1),
          end_time: se.endDate ? new Date(se.endDate) : null,
          start_time_ist: se.startDate ? formatEventTimeString(se.startDate) : '',
          end_time_ist: se.endDate ? formatEventTimeString(se.endDate) : '',
          time: se.startDate ? formatEventTimeString(se.startDate) : '',
          time_ist: se.startDate ? formatEventTimeString(se.startDate) : '',
          event_time: se.startDate ? formatEventTimeString(se.startDate) : '',
          duration: seDuration,
          category: se.category || 'Flagship Event',
          mode: se.mode || 'Offline',
          venue: se.venue || 'PRPCEM Campus',
          rewards: se.rewards || 'Certificates & Swags',
          prizes: se.rewards || 'Certificates & Swags',
          registration_start_date: null,
          registration_end_date: null,
          max_registrations: null,
          maxRegistrations: null,
          initial_registration_count: initialRegCount,
          actual_registration_count: eventRegs.length,
          seats_remaining: null,
          seatsRemaining: null,
          fee: se.fee || 'Free',
          price: se.fee || 'Free',
          is_registration_open: statusObj.isRegActive,
          isRegistrationOpen: statusObj.isRegActive,
          is_registration_ended: statusObj.isRegEnded,
          isRegistrationEnded: statusObj.isRegEnded,
          is_registration_pending: statusObj.isRegPending,
          is_capacity_full: false,
          show_register_button: statusObj.isRegActive,
          is_live: false,
          is_upcoming: statusObj.eventStatus === 'upcoming',
          is_completed: statusObj.eventStatus === 'completed',
          status: statusObj.eventStatus,
          event_status: statusObj.eventStatus,
          registration_status: statusObj.regStatus,
          showOnHomePopup: Boolean(se.showOnHomePopup),
          popupMessage: se.popupMessage || '',
          quizzes: [],
          total_quizzes_count: 0,
          registration_count: totalRegCount,
          total_registration_count: totalRegCount,
          attendees_count: totalRegCount,
          registrations: totalRegCount,
          direct_quiz_url: null,
          register: statusObj.isRegActive ? (se.register || regUrlRelative) : null,
          registerUrl: statusObj.isRegActive ? (se.register ? `${baseUrl}${se.register}` : regUrlAbsolute) : null,
          registration_url: statusObj.isRegActive ? (se.register ? `${baseUrl}${se.register}` : regUrlAbsolute) : null
        });
      }
    }

    // Sort all public events so the latest date comes first
    sortEventsLatestFirst(eventsList);

    const total = eventsList.length;
    const requestedPage = req.query.page !== undefined ? parseInt(req.query.page, 10) : null;
    const defaultPageSize = 9;
    const limit = req.query.limit === 'all' 
      ? total 
      : (req.query.limit ? Math.max(1, parseInt(req.query.limit, 10)) : (requestedPage !== null ? defaultPageSize : total));

    const totalPages = Math.ceil(total / (limit || defaultPageSize)) || 1;
    let currentPage = 1;
    let paginatedList = eventsList;

    if (requestedPage !== null && !isNaN(requestedPage)) {
      currentPage = Math.max(1, requestedPage);
      const effectiveLimit = limit || defaultPageSize;
      const startIndex = (currentPage - 1) * effectiveLimit;
      paginatedList = eventsList.slice(startIndex, startIndex + effectiveLimit);
    }

    res.json({
      success: true,
      total,
      count: paginatedList.length,
      page: currentPage,
      limit: limit || defaultPageSize,
      totalPages,
      hasMore: currentPage < totalPages,
      defaultPageSize: 9,
      events: paginatedList,
      allEvents: eventsList
    });
  } catch (err) {
    console.error('Error fetching public events:', err);
    res.status(500).json({ error: 'Failed to fetch public events.' });
  }
});

// ----------------------------------------------------
// POST /api/events/register
// ----------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const {
      eventId,
      eventName,
      eventTitle,
      quizId,
      slug,
      name,
      fullName,
      email,
      college = 'PRPCEM Amravati',
      phone,
      year,
      yearOfStudy,
      branch,
      rollNo,
      notes
    } = req.body;

    const cleanName = (fullName || name || '').trim();
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanCollege = (college || 'PRPCEM Amravati').trim();
    const cleanPhone = (phone || '').trim();
    const cleanYear = (yearOfStudy || year || '').trim();
    const cleanBranch = (branch || '').trim();
    const cleanRollNo = (rollNo || '').trim();
    const cleanNotes = (notes || '').trim();
    const targetEventId = (eventId || slug || 'msc-event').trim();
    const targetEventName = (eventName || eventTitle || targetEventId).trim();

    if (!cleanName) {
      return res.status(400).json({ error: 'Participant Full Name is required.' });
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid Email address is required.' });
    }

    // 1. Look up target event in DB for validation
    let targetEvent = null;
    if (isValidUUID(targetEventId)) {
      targetEvent = await Event.findByPk(targetEventId).catch(() => null);
    }
    if (!targetEvent) {
      targetEvent = await Event.findOne({
        where: {
          [Op.or]: [
            { slug: targetEventId },
            { slug: targetEventId.toLowerCase() },
            { name: targetEventName }
          ]
        }
      }).catch(() => null);
    }

    const now = new Date();

    if (targetEvent) {
      const statusObj = computeEventAndRegStatus(targetEvent, now, false, 0);

      if (!statusObj.isRegActive) {
        if (statusObj.isEventCompleted) {
          return res.status(400).json({ error: `Registration is unavailable because "${targetEvent.name}" has concluded.` });
        }
        if (statusObj.regStatus === 'pending') {
          const openStr = new Date(targetEvent.registration_start_date).toLocaleString();
          return res.status(400).json({ error: `Registration for "${targetEvent.name}" opens on ${openStr}.` });
        }
        if (targetEvent.registration_end_date && new Date(targetEvent.registration_end_date) < now) {
          const deadlineStr = new Date(targetEvent.registration_end_date).toLocaleString();
          return res.status(400).json({ error: `Registration deadline for "${targetEvent.name}" passed on ${deadlineStr}.` });
        }
        return res.status(400).json({ error: `Registration for "${targetEvent.name}" is currently closed by the organizers.` });
      }

      // Check capacity limit
      if (targetEvent.max_registrations && targetEvent.max_registrations > 0) {
        const existingThisUser = await EventRegistration.findOne({
          where: {
            email: cleanEmail,
            [Op.or]: [
              { event_id: targetEvent.id },
              { event_id: targetEvent.slug || '' },
              { event_id: targetEventId }
            ]
          }
        });

        if (!existingThisUser) {
          const currentCount = await EventRegistration.count({
            where: {
              [Op.or]: [
                { event_id: targetEvent.id },
                { event_id: targetEvent.slug || '' },
                { event_id: targetEventId },
                { event_name: targetEvent.name }
              ]
            }
          });
          const initialCount = parseInt(targetEvent.initial_registration_count, 10) || 0;
          const totalCurrent = currentCount + initialCount;

          if (totalCurrent >= targetEvent.max_registrations) {
            return res.status(400).json({ error: `Registration capacity reached for "${targetEvent.name}" (Limit: ${targetEvent.max_registrations} seats).` });
          }
        }
      }
    }

    // 2. If User account already exists, sync college/branch if needed
    if (User) {
      const existingUser = await User.findOne({ where: { email: cleanEmail } });
      if (existingUser && !existingUser.college && cleanCollege) {
        await existingUser.update({ college: cleanCollege }).catch(() => {});
      }
    }

    // 3. Record Event Registration in DB
    let registration = await EventRegistration.findOne({
      where: {
        email: cleanEmail,
        [Op.or]: [
          { event_id: targetEventId },
          { event_id: targetEventId.toLowerCase() },
          ...(targetEvent ? [{ event_id: targetEvent.id }] : [])
        ]
      }
    });

    if (!registration) {
      registration = await EventRegistration.create({
        event_id: targetEvent ? targetEvent.id : targetEventId,
        event_name: targetEvent ? targetEvent.name : targetEventName,
        user_id: req.user?.id || null,
        full_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        college: cleanCollege,
        branch: cleanBranch,
        year_of_study: cleanYear,
        roll_no: cleanRollNo,
        notes: cleanNotes,
        status: 'registered'
      });
    } else {
      // Update phone or college if missing
      await registration.update({
        full_name: cleanName,
        phone: cleanPhone || registration.phone,
        college: cleanCollege || registration.college,
        branch: cleanBranch || registration.branch,
        year_of_study: cleanYear || registration.year_of_study
      }).catch(() => {});
    }

    // 4. Find Matching Quizzes for this Event
    let matchingQuizzes = [];

    if (quizId) {
      const q = await Quiz.findByPk(quizId);
      if (q) matchingQuizzes.push(q);
    }

    if (matchingQuizzes.length === 0 && slug) {
      const orConditions = [{ custom_slug: slug }];
      if (isValidUUID(slug)) {
        orConditions.push({ id: slug });
      }
      const q = await Quiz.findOne({
        where: {
          [Op.or]: orConditions
        }
      });
      if (q) matchingQuizzes.push(q);
    }

    if (matchingQuizzes.length === 0 && (targetEventName || targetEventId || slug)) {
      const allQuizzes = await Quiz.findAll();
      const searchTerms = [
        targetEventName,
        targetEventId,
        slug,
        targetEvent ? targetEvent.name : null,
        targetEvent ? targetEvent.slug : null
      ].filter(Boolean).map(s => String(s).toLowerCase().replace(/[^a-z0-9]/g, ''));

      matchingQuizzes = allQuizzes.filter(q => {
        if (targetEventId && q.event_id === targetEventId) return true;
        if (targetEvent && q.event_id === targetEvent.id) return true;
        const qTerms = [
          q.event_name,
          q.custom_slug,
          q.title,
          q.join_code
        ].filter(Boolean).map(s => String(s).toLowerCase().replace(/[^a-z0-9]/g, ''));

        return searchTerms.some(st => 
          st && qTerms.some(qt => qt && (qt.includes(st) || st.includes(qt) || qt.startsWith(st) || st.startsWith(qt)))
        );
      });
    }

    const baseUrl = getQuizPlatformBaseUrl();
    const registeredTracks = [];

    for (const q of matchingQuizzes) {
      const existing = await Participant.findOne({
        where: { quiz_id: q.id, email: cleanEmail }
      });
      if (!existing) {
        await Participant.create({
          quiz_id: q.id,
          email: cleanEmail,
          name: cleanName,
          college: cleanCollege
        });
      }

      const qSlug = q.custom_slug || (q.title ? q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : q.join_code);
      const directUrl = q.mode === 'SCHEDULED' ? `${baseUrl}/q/${qSlug}` : `${baseUrl}/join/${q.join_code}`;

      registeredTracks.push({
        quiz_id: q.id,
        title: q.title,
        join_code: q.join_code,
        direct_url: directUrl
      });
    }

    const primaryEventName = (targetEvent && targetEvent.name) || targetEventName || (matchingQuizzes[0]?.event_name) || 'MSC Event';
    const primaryDirectUrl = registeredTracks[0]?.direct_url || `${baseUrl}/login`;

    // 5. Send Instant Confirmation Email using Universal Template
    try {
      const eventDateStr = (targetEvent && targetEvent.start_date)
        ? new Date(targetEvent.start_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })
        : null;

      sendEventRegistrationEmail({
        to: cleanEmail,
        name: cleanName,
        eventName: primaryEventName,
        eventDate: eventDateStr,
        eventVenue: targetEvent ? targetEvent.venue : null,
        registrationId: registration.id,
        college: cleanCollege,
        branch: cleanBranch,
        year: cleanYear,
        tracks: registeredTracks,
        directUrl: primaryDirectUrl
      }).catch(mailErr => console.warn('Registration confirmation email warning:', mailErr.message));
    } catch (e) {
      console.warn('Email dispatch warning:', e.message);
    }

    return res.json({
      success: true,
      message: `Successfully registered for "${primaryEventName}"!`,
      event: {
        event_name: primaryEventName,
        direct_url: primaryDirectUrl,
        tracks: registeredTracks
      },
      registration: {
        id: registration.id,
        name: cleanName,
        email: cleanEmail,
        college: cleanCollege,
        phone: cleanPhone,
        branch: cleanBranch,
        year: cleanYear
      },
      participant: {
        id: req.user?.id || registration.id,
        name: cleanName,
        email: cleanEmail,
        college: cleanCollege
      }
    });
  } catch (err) {
    console.error('Error during event registration:', err);
    res.status(500).json({ error: err.message || 'Failed to complete event registration.' });
  }
});

module.exports = router;
