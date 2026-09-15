const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const { User, Quiz, ScheduledOccurrence, QuizAttempt, Participant, Event, EventRegistration } = require('../models');
const { sendCustomBroadcastEmail } = require('../services/emailService');
const { Op } = require('sequelize');
const { getInjectedScoresForQuiz } = require('../services/injectedScoresService');

// Load static/old events from events.json
let staticEvents = [];
try {
  const jsonPath = path.join(__dirname, '../data/events.json');
  if (fs.existsSync(jsonPath)) {
    staticEvents = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
} catch (e) {
  console.warn('Could not read static events.json in emailDispatch:', e.message);
}

/**
 * Helper to replace dynamic placeholders in templates
 */
const replacePlaceholders = (text, data = {}) => {
  if (!text) return '';
  return text
    .replace(/\{name\}/gi, data.name || 'Learner')
    .replace(/\{student_name\}/gi, data.name || 'Learner')
    .replace(/\{email\}/gi, data.email || '')
    .replace(/\{college\}/gi, data.college || 'PRPCEM')
    .replace(/\{quiz_title\}/gi, data.quizTitle || data.eventName || 'Challenge Quiz')
    .replace(/\{event_name\}/gi, data.eventName || 'MSC Technical Event')
    .replace(/\{score\}/gi, data.score !== undefined && data.score !== null ? String(data.score) : 'N/A')
    .replace(/\{status\}/gi, data.status || 'Registered');
};

/**
 * GET /api/admin/email-dispatch/audiences
 * Returns audience list and summary counts (Students, Quizzes, Events)
 */
router.get('/audiences', authMiddleware, async (req, res) => {
  try {
    // 1. Get all registered students
    const students = await User.findAll({
      attributes: ['id', 'name', 'email', 'username', 'college', 'createdAt'],
      order: [['createdAt', 'DESC']]
    }).catch(() => []);

    // 2. Get all quizzes (Live + Scheduled)
    const quizzes = await Quiz.findAll({
      attributes: ['id', 'title', 'event_name', 'mode', 'status', 'join_code', 'subject', 'createdAt'],
      include: [
        {
          model: ScheduledOccurrence,
          as: 'occurrences',
          attributes: ['id', 'start_time', 'end_time', 'status'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    }).catch((err) => {
      console.error('Error fetching quizzes for email dispatch:', err.message);
      return [];
    });

    // 3. Get all Events & Event Registrations
    const [events, registrations] = await Promise.all([
      Event.findAll({ order: [['createdAt', 'DESC']] }).catch(() => []),
      EventRegistration.findAll({ order: [['createdAt', 'DESC']] }).catch(() => [])
    ]);

    const eventsFormatted = [];
    const dbNames = new Set(events.map(e => (e.name || '').toLowerCase().trim()));
    const dbIds = new Set(events.map(e => String(e.id)));

    // Format DB Events
    for (const ev of events) {
      const evNameLower = (ev.name || '').toLowerCase().trim();
      const regCount = registrations.filter(r =>
        r.event_id === ev.id || r.event_id === ev.slug || (r.event_name && r.event_name.toLowerCase().trim() === evNameLower)
      ).length;

      const eventDate = ev.start_date || ev.createdAt;
      const parsedTime = eventDate ? new Date(eventDate).getTime() : 0;

      eventsFormatted.push({
        id: ev.id,
        name: ev.name,
        slug: ev.slug || ev.id,
        category: ev.category || 'Innovation Challenge',
        registration_count: regCount,
        status: ev.status || 'upcoming',
        start_date: ev.start_date,
        createdAt: ev.createdAt,
        timestamp: isNaN(parsedTime) ? 0 : parsedTime
      });
    }

    // Format Static JSON Events (if not already in DB)
    for (const se of staticEvents) {
      const seTitle = se.title || se.name;
      const seKey = seTitle.toLowerCase().trim();

      if (!dbNames.has(seKey) && !dbIds.has(se.id)) {
        const regCount = registrations.filter(r =>
          r.event_id === se.id || (r.event_name && (r.event_name.toLowerCase().includes(seKey) || seKey.includes(r.event_name.toLowerCase())))
        ).length;

        const seDate = se.startDate || se.date;
        let seTime = 0;
        if (seDate) {
          const d = new Date(seDate);
          if (!isNaN(d.getTime())) seTime = d.getTime();
        }

        eventsFormatted.push({
          id: se.id,
          name: seTitle,
          slug: se.id,
          category: se.category || 'Flagship Event',
          registration_count: regCount,
          status: se.status === 'past' ? 'completed' : (se.status || 'upcoming'),
          start_date: se.startDate || se.date,
          createdAt: se.startDate ? new Date(se.startDate) : null,
          timestamp: seTime
        });
      }
    }

    // Sort events: LATEST BY TIME FIRST, OLDER EVENTS GO BELOW
    eventsFormatted.sort((a, b) => {
      const timeA = Number(a.timestamp) || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const timeB = Number(b.timestamp) || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return timeB - timeA;
    });

    res.json({
      success: true,
      all_students_count: students.length,
      students: students.map(s => ({
        id: s.id,
        name: s.name || s.email.split('@')[0],
        email: (s.email || '').toLowerCase().trim(),
        username: s.username || '',
        college: s.college || '',
        createdAt: s.createdAt
      })),
      quizzes: quizzes.map(q => ({
        id: q.id,
        title: q.title || 'Untitled Quiz',
        event_name: q.event_name || 'MSC Tech Event',
        mode: q.mode || 'LIVE',
        status: q.status || 'draft',
        join_code: q.join_code || '',
        subject: q.subject || 'Technical',
        occurrences: q.occurrences || []
      })),
      events: eventsFormatted
    });
  } catch (err) {
    console.error('Error fetching email audiences:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch email audiences.' });
  }
});

/**
 * GET /api/admin/email-dispatch/event-participants
 * Fetch all students registered for a specific Event with their quiz completion status
 */
router.get('/event-participants', authMiddleware, async (req, res) => {
  try {
    const { eventId, eventName, participantFilter = 'all' } = req.query;
    if (!eventId && !eventName) {
      return res.status(400).json({ error: 'eventId or eventName is required.' });
    }

    const participantsMap = new Map();
    const targetQuery = (eventId || eventName || '').trim().toLowerCase();
    const targetAlphanum = targetQuery.replace(/[^a-z0-9]/g, '');

    // 1. Fetch matching quizzes for this event
    const allQuizzes = await Quiz.findAll().catch(() => []);
    const matchingQuizzes = allQuizzes.filter(q => {
      const qEvId = String(q.event_id || '').toLowerCase().trim();
      const qEvName = String(q.event_name || '').toLowerCase().trim();
      return (
        qEvId === targetQuery ||
        qEvName.includes(targetQuery) ||
        targetQuery.includes(qEvName) ||
        qEvName.replace(/[^a-z0-9]/g, '') === targetAlphanum
      );
    });
    const quizIds = matchingQuizzes.map(q => q.id);

    // Fetch all QuizAttempt records for these quizzes
    const attemptsMap = new Map(); // email -> attempt
    if (quizIds.length > 0) {
      const attempts = await QuizAttempt.findAll({
        where: { quiz_id: { [Op.in]: quizIds } },
        order: [['submitted_at', 'DESC'], ['createdAt', 'DESC']]
      }).catch(() => []);

      for (const att of attempts) {
        if (att.participant_email && att.participant_email.includes('@')) {
          const clean = att.participant_email.toLowerCase().trim();
          const existing = attemptsMap.get(clean);
          if (!existing || (existing.status !== 'completed' && att.status === 'completed')) {
            attemptsMap.set(clean, att);
          }
        }
      }

      // Fetch live participants as well
      const liveParts = await Participant.findAll({
        where: { quiz_id: { [Op.in]: quizIds } }
      }).catch(() => []);

      for (const lp of liveParts) {
        if (lp.email && lp.email.includes('@')) {
          const clean = lp.email.toLowerCase().trim();
          if (!attemptsMap.has(clean)) {
            attemptsMap.set(clean, {
              status: 'completed',
              score: null,
              participant_name: lp.name,
              college: lp.college
            });
          }
        }
      }
    }

    // 2. Fetch from EventRegistration table
    const allRegs = await EventRegistration.findAll({ order: [['createdAt', 'DESC']] }).catch(() => []);
    const matchingRegs = allRegs.filter(r => {
      const rId = String(r.event_id || '').toLowerCase().trim();
      const rName = String(r.event_name || '').toLowerCase().trim();
      return (
        rId === targetQuery ||
        rId.replace(/[^a-z0-9]/g, '') === targetAlphanum ||
        rName.includes(targetQuery) ||
        targetQuery.includes(rName) ||
        rName.replace(/[^a-z0-9]/g, '') === targetAlphanum
      );
    });

    for (const r of matchingRegs) {
      if (r.email && r.email.includes('@')) {
        const clean = r.email.toLowerCase().trim();
        const att = attemptsMap.get(clean);

        let quizStatus = 'not_completed';
        let statusLabel = 'Registered (Not Attended)';
        let studentScore = null;

        if (att) {
          const st = (att.status || '').toLowerCase();
          if (st === 'completed' || st === 'finished') {
            quizStatus = 'completed';
            statusLabel = 'Completed';
            studentScore = att.score;
          } else if (st === 'in_progress' || st === 'started') {
            quizStatus = 'in_progress';
            statusLabel = 'In Progress';
          }
        }

        participantsMap.set(clean, {
          email: clean,
          name: r.full_name || clean.split('@')[0],
          college: r.college || 'PRPCEM',
          phone: r.phone || '',
          branch: r.branch || '',
          year: r.year_of_study || '',
          source: 'Event Registered',
          quiz_status: quizStatus,
          status: statusLabel,
          score: studentScore,
          quiz_title: matchingQuizzes[0]?.title || 'Event Assessment'
        });
      }
    }

    // The participants list for an event strictly reflects current active Event Registrations
    const allParticipantsList = Array.from(participantsMap.values());
    const totalCount = allParticipantsList.length;
    const completedCount = allParticipantsList.filter(p => p.quiz_status === 'completed').length;
    const notCompletedCount = allParticipantsList.filter(p => p.quiz_status === 'not_completed').length;
    const inProgressCount = allParticipantsList.filter(p => p.quiz_status === 'in_progress').length;

    let filteredParticipants = allParticipantsList;
    const isNotAttendedFilter = participantFilter === 'not_attended' || participantFilter === 'not_completed' || participantFilter === 'registered_not_attended';
    if (participantFilter === 'completed') {
      filteredParticipants = allParticipantsList.filter(p => p.quiz_status === 'completed');
    } else if (isNotAttendedFilter) {
      filteredParticipants = allParticipantsList.filter(p => p.quiz_status === 'not_completed');
    } else if (participantFilter === 'in_progress') {
      filteredParticipants = allParticipantsList.filter(p => p.quiz_status === 'in_progress');
    }

    res.json({
      success: true,
      eventId,
      eventName,
      participantFilter,
      count: filteredParticipants.length,
      totalCount,
      completedCount,
      notCompletedCount,
      notAttendedCount: notCompletedCount,
      inProgressCount,
      participants: filteredParticipants
    });
  } catch (err) {
    console.error('Error fetching event participants:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch event participants.' });
  }
});

/**
 * GET /api/admin/email-dispatch/quiz-participants
 * Fetch participant list for a specific quiz with status and score attributes
 */
router.get('/quiz-participants', authMiddleware, async (req, res) => {
  try {
    const { quizId, occurrenceId, participantFilter = 'all' } = req.query;

    if (!quizId && !occurrenceId) {
      return res.status(400).json({ error: 'quizId or occurrenceId is required.' });
    }

    let quizDetails = null;
    if (quizId) {
      quizDetails = await Quiz.findByPk(quizId, {
        attributes: ['id', 'title', 'event_name', 'event_id', 'mode', 'join_code', 'subject']
      }).catch((err) => {
        console.error('Error fetching quiz details for dispatch:', err.message);
        return null;
      });
    }

    const participantsMap = new Map();

    // 1. Check Scheduled Quiz Attempts
    try {
      const attemptWhere = {};
      if (occurrenceId) attemptWhere.occurrence_id = occurrenceId;
      if (quizId) attemptWhere.quiz_id = quizId;

      const attempts = await QuizAttempt.findAll({
        where: attemptWhere,
        attributes: ['id', 'participant_name', 'participant_email', 'status', 'score', 'started_at', 'submitted_at'],
        order: [['submitted_at', 'DESC'], ['createdAt', 'DESC']]
      });

      for (const att of attempts) {
        if (att.participant_email && att.participant_email.includes('@')) {
          const clean = att.participant_email.toLowerCase().trim();
          const st = (att.status || '').toLowerCase();
          const isCompleted = st === 'completed' || st === 'finished';
          const isInProgress = st === 'in_progress' || st === 'started';

          participantsMap.set(clean, {
            email: clean,
            name: att.participant_name || clean.split('@')[0],
            source: 'Scheduled Attempt',
            quiz_status: isCompleted ? 'completed' : (isInProgress ? 'in_progress' : 'not_completed'),
            status: isCompleted ? 'Completed' : (isInProgress ? 'In Progress' : 'Not Completed'),
            score: att.score,
            startedAt: att.started_at,
            submittedAt: att.submitted_at
          });
        }
      }
    } catch (attErr) {
      console.warn('Error fetching QuizAttempts for dispatch:', attErr.message);
    }

    // 2. Check Live Quiz Participants
    if (quizId) {
      try {
        const liveParticipants = await Participant.findAll({
          where: { quiz_id: quizId },
          attributes: ['id', 'name', 'email', 'college']
        });

        for (const p of liveParticipants) {
          if (p.email && p.email.includes('@')) {
            const clean = p.email.toLowerCase().trim();
            if (!participantsMap.has(clean)) {
              participantsMap.set(clean, {
                email: clean,
                name: p.name || clean.split('@')[0],
                college: p.college || '',
                source: 'Live Participant',
                quiz_status: 'completed',
                status: 'Completed',
                score: null
              });
            } else {
              const existing = participantsMap.get(clean);
              if (p.college) existing.college = p.college;
            }
          }
        }
      } catch (pErr) {
        console.warn('Error fetching Live Participants for dispatch:', pErr.message);
      }

      // 2.5 Injected Historical Scores (e.g. Week 1 JSON)
      const injected = getInjectedScoresForQuiz(quizId, quizDetails?.title);
      for (const ip of injected) {
        if (ip.participant_email && ip.participant_email.includes('@')) {
          const clean = ip.participant_email.toLowerCase().trim();
          if (!participantsMap.has(clean)) {
            participantsMap.set(clean, {
              email: clean,
              name: ip.participant_name || clean.split('@')[0],
              college: 'PRPCEM',
              source: 'Tournament Record',
              quiz_status: 'completed',
              status: 'Completed',
              score: ip.score,
              submittedAt: ip.submitted_at
            });
          }
        }
      }
    }

    // 3. Include registered event students, participants from other quizzes in the same series, and portal users who haven't completed this quiz
    try {
      // A. Event registrations
      let eventSlug = '';
      let eventTitle = quizDetails?.event_name || '';
      if (quizDetails?.event_id) {
        const ev = await Event.findByPk(quizDetails.event_id).catch(() => null);
        if (ev) {
          eventSlug = ev.slug || '';
          if (!eventTitle) eventTitle = ev.name || '';
        }
      }

      const eventRegs = await EventRegistration.findAll().catch(() => []);
      for (const reg of eventRegs) {
        const rId = String(reg.event_id || '').toLowerCase().trim();
        const rName = String(reg.event_name || '').toLowerCase().trim();
        const matchesEvent =
          (quizDetails?.event_id && (rId === String(quizDetails.event_id).toLowerCase() || rId === eventSlug.toLowerCase())) ||
          (eventTitle && (rName.includes(eventTitle.toLowerCase()) || eventTitle.toLowerCase().includes(rName))) ||
          (eventSlug && rId.includes(eventSlug.toLowerCase()));

        if (matchesEvent && reg.email && reg.email.includes('@')) {
          const clean = reg.email.toLowerCase().trim();
          if (!participantsMap.has(clean)) {
            participantsMap.set(clean, {
              email: clean,
              name: reg.full_name || clean.split('@')[0],
              college: reg.college || 'PRPCEM',
              source: 'Event Registered',
              quiz_status: 'not_completed',
              status: "Didn't Attend",
              score: null
            });
          }
        }
      }

      // B. Participants from other quizzes in the same event / tournament series
      if (quizDetails?.event_id || quizDetails?.event_name) {
        const otherQuizzes = await Quiz.findAll({
          where: {
            [Op.or]: [
              ...(quizDetails.event_id ? [{ event_id: quizDetails.event_id }] : []),
              ...(quizDetails.event_name ? [{ event_name: quizDetails.event_name }] : [])
            ]
          },
          attributes: ['id']
        }).catch(() => []);

        const otherQuizIds = otherQuizzes.map(q => q.id).filter(id => id !== quizDetails.id);
        if (otherQuizIds.length > 0) {
          const otherAttempts = await QuizAttempt.findAll({
            where: { quiz_id: { [Op.in]: otherQuizIds } },
            attributes: ['participant_email', 'participant_name']
          }).catch(() => []);

          for (const oa of otherAttempts) {
            if (oa.participant_email && oa.participant_email.includes('@')) {
              const clean = oa.participant_email.toLowerCase().trim();
              if (!participantsMap.has(clean)) {
                participantsMap.set(clean, {
                  email: clean,
                  name: oa.participant_name || clean.split('@')[0],
                  college: 'PRPCEM',
                  source: 'Tournament Participant',
                  quiz_status: 'not_completed',
                  status: "Didn't Attend",
                  score: null
                });
              }
            }
          }

          const otherLive = await Participant.findAll({
            where: { quiz_id: { [Op.in]: otherQuizIds } },
            attributes: ['email', 'name', 'college']
          }).catch(() => []);

          for (const ol of otherLive) {
            if (ol.email && ol.email.includes('@')) {
              const clean = ol.email.toLowerCase().trim();
              if (!participantsMap.has(clean)) {
                participantsMap.set(clean, {
                  email: clean,
                  name: ol.name || clean.split('@')[0],
                  college: ol.college || 'PRPCEM',
                  source: 'Tournament Participant',
                  quiz_status: 'not_completed',
                  status: "Didn't Attend",
                  score: null
                });
              }
            }
          }
        }
      }

      // C. All Registered Portal Students (User table)
      const allUsers = await User.findAll({ attributes: ['id', 'email', 'name', 'college'] }).catch(() => []);
      for (const u of allUsers) {
        if (u.email && u.email.includes('@')) {
          const clean = u.email.toLowerCase().trim();
          if (!participantsMap.has(clean)) {
            participantsMap.set(clean, {
              email: clean,
              name: u.name || clean.split('@')[0],
              college: u.college || 'PRPCEM',
              source: 'Student Portal User',
              quiz_status: 'not_completed',
              status: "Didn't Attend",
              score: null
            });
          }
        }
      }
    } catch (evRegErr) {
      console.warn('Error fetching non-completed participants for quiz dispatch:', evRegErr.message);
    }

    // 4. Enrich with student college if in User table
    const emailsList = Array.from(participantsMap.keys());
    if (emailsList.length > 0) {
      try {
        const registeredUsers = await User.findAll({
          where: { email: { [Op.in]: emailsList } },
          attributes: ['email', 'college', 'name']
        });
        for (const u of registeredUsers) {
          const clean = u.email.toLowerCase().trim();
          if (participantsMap.has(clean)) {
            const p = participantsMap.get(clean);
            if (!p.college && u.college) p.college = u.college;
            if ((!p.name || p.name === clean.split('@')[0]) && u.name) p.name = u.name;
          }
        }
      } catch (uErr) {
        console.warn('Error enriching participant college:', uErr.message);
      }
    }

    const allParticipantsList = Array.from(participantsMap.values());
    const totalCount = allParticipantsList.length;
    const completedCount = allParticipantsList.filter(p => p.quiz_status === 'completed').length;
    const notCompletedCount = allParticipantsList.filter(p => p.quiz_status === 'not_completed').length;
    const inProgressCount = allParticipantsList.filter(p => p.quiz_status === 'in_progress').length;

    let filteredParticipants = allParticipantsList;
    const isNotAttendedFilter = participantFilter === 'not_attended' || participantFilter === 'not_completed' || participantFilter === 'registered_not_attended';
    if (participantFilter === 'completed') {
      filteredParticipants = allParticipantsList.filter(p => p.quiz_status === 'completed');
    } else if (isNotAttendedFilter) {
      filteredParticipants = allParticipantsList.filter(p => p.quiz_status === 'not_completed');
    } else if (participantFilter === 'in_progress') {
      filteredParticipants = allParticipantsList.filter(p => p.quiz_status === 'in_progress');
    }

    res.json({
      success: true,
      quiz: quizDetails ? {
        id: quizDetails.id,
        title: quizDetails.title,
        event_name: quizDetails.event_name,
        mode: quizDetails.mode,
        join_code: quizDetails.join_code,
        subject: quizDetails.subject || 'Technical'
      } : null,
      participantFilter,
      count: filteredParticipants.length,
      totalCount,
      completedCount,
      notCompletedCount,
      notAttendedCount: notCompletedCount,
      inProgressCount,
      participants: filteredParticipants
    });
  } catch (err) {
    console.error('Error fetching quiz participants for email dispatch:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch quiz participants.' });
  }
});

const isValidUUID = (val) => {
  return typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
};

/**
 * POST /api/admin/email-dispatch/send
 * Dispatches personalized custom email to selected participants
 */
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const {
      audienceType, // 'all_students' | 'quiz_participants' | 'event_registrants' | 'custom'
      quizId,
      eventId,
      eventName: reqEventName,
      occurrenceId,
      participantFilter = 'all',
      customEmails,
      excludedEmails = [],
      subject,
      heading,
      messageBody,
      ctaText,
      ctaUrl
    } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: 'Email Subject is required.' });
    }
    if (!messageBody || !messageBody.trim()) {
      return res.status(400).json({ error: 'Email Message Body is required.' });
    }

    let quizDetails = null;
    if (quizId) {
      if (isValidUUID(quizId)) {
        quizDetails = await Quiz.findByPk(quizId, {
          attributes: ['id', 'title', 'event_name', 'mode', 'join_code']
        }).catch(() => null);
      } else {
        quizDetails = await Quiz.findOne({
          where: { custom_slug: quizId },
          attributes: ['id', 'title', 'event_name', 'mode', 'join_code']
        }).catch(() => null);
      }
    }

    let eventDetails = null;
    if (eventId) {
      if (isValidUUID(eventId)) {
        eventDetails = await Event.findByPk(eventId).catch(() => null);
      } else {
        eventDetails = await Event.findOne({ where: { slug: eventId } }).catch(() => null);
      }
      if (!eventDetails) {
        const se = staticEvents.find(s =>
          String(s.id).toLowerCase() === String(eventId).toLowerCase() ||
          (s.title && s.title.toLowerCase() === String(eventId).toLowerCase()) ||
          (s.title && s.title.toLowerCase() === String(reqEventName || '').toLowerCase())
        );
        if (se) eventDetails = { name: se.title || se.name };
      }
    }

    const quizTitle = quizDetails?.title || 'MSC Quiz Challenge';
    const eventName = eventDetails?.name || reqEventName || quizDetails?.event_name || 'MSC Tech Event';

    const excludedSet = new Set((excludedEmails || []).map(e => e.toLowerCase().trim()));
    const targetRecipientsMap = new Map();

    if (audienceType === 'all_students') {
      const students = await User.findAll({
        attributes: ['name', 'email', 'college']
      });
      for (const s of students) {
        if (s.email && s.email.includes('@')) {
          const clean = s.email.toLowerCase().trim();
          if (!excludedSet.has(clean)) {
            targetRecipientsMap.set(clean, {
              email: clean,
              name: s.name || clean.split('@')[0],
              college: s.college || 'PRPCEM',
              status: 'Registered Student'
            });
          }
        }
      }
    } else if (audienceType === 'event_registrants') {
      const targetQuery = (eventId || reqEventName || '').trim().toLowerCase();
      const targetAlphanum = targetQuery.replace(/[^a-z0-9]/g, '');

      // 1. Fetch matching quizzes for this event
      const allQuizzes = await Quiz.findAll().catch(() => []);
      const matchingQuizzes = allQuizzes.filter(q => {
        const qEvId = String(q.event_id || '').toLowerCase().trim();
        const qEvName = String(q.event_name || '').toLowerCase().trim();
        return (
          qEvId === targetQuery ||
          qEvName.includes(targetQuery) ||
          targetQuery.includes(qEvName) ||
          qEvName.replace(/[^a-z0-9]/g, '') === targetAlphanum
        );
      });
      const quizIds = matchingQuizzes.map(q => q.id);

      const attemptsMap = new Map();
      if (quizIds.length > 0) {
        const attempts = await QuizAttempt.findAll({
          where: { quiz_id: { [Op.in]: quizIds } },
          order: [['submitted_at', 'DESC'], ['createdAt', 'DESC']]
        }).catch(() => []);

        for (const att of attempts) {
          if (att.participant_email && att.participant_email.includes('@')) {
            const clean = att.participant_email.toLowerCase().trim();
            const existing = attemptsMap.get(clean);
            if (!existing || (existing.status !== 'completed' && att.status === 'completed')) {
              attemptsMap.set(clean, att);
            }
          }
        }

        const liveParts = await Participant.findAll({
          where: { quiz_id: { [Op.in]: quizIds } }
        }).catch(() => []);

        for (const lp of liveParts) {
          if (lp.email && lp.email.includes('@')) {
            const clean = lp.email.toLowerCase().trim();
            if (!attemptsMap.has(clean)) {
              attemptsMap.set(clean, {
                status: lp.score > 0 ? 'completed' : 'registered',
                score: lp.score,
                participant_name: lp.name,
                college: lp.college
              });
            }
          }
        }
      }

      // 2. Fetch event registrations
      const allRegs = await EventRegistration.findAll().catch(() => []);
      const matchingRegs = allRegs.filter(r => {
        const rId = String(r.event_id || '').toLowerCase().trim();
        const rName = String(r.event_name || '').toLowerCase().trim();
        return (
          rId === targetQuery ||
          rId.replace(/[^a-z0-9]/g, '') === targetAlphanum ||
          rName.includes(targetQuery) ||
          targetQuery.includes(rName) ||
          rName.replace(/[^a-z0-9]/g, '') === targetAlphanum
        );
      });

      for (const r of matchingRegs) {
        if (r.email && r.email.includes('@')) {
          const clean = r.email.toLowerCase().trim();
          if (excludedSet.has(clean)) continue;

          const att = attemptsMap.get(clean);
          let quizStatus = 'not_completed';
          let statusLabel = 'Not Completed';
          let studentScore = null;

          if (att) {
            const st = (att.status || '').toLowerCase();
            if (st === 'completed' || st === 'finished') {
              quizStatus = 'completed';
              statusLabel = 'Completed';
              studentScore = att.score;
            } else if (st === 'in_progress' || st === 'started') {
              quizStatus = 'in_progress';
              statusLabel = 'In Progress';
            }
          }

          const isNotAttendedTarget = participantFilter === 'not_attended' || participantFilter === 'not_completed' || participantFilter === 'registered_not_attended';
          if (participantFilter === 'completed' && quizStatus !== 'completed') continue;
          if (isNotAttendedTarget && quizStatus !== 'not_completed') continue;
          if (participantFilter === 'in_progress' && quizStatus !== 'in_progress') continue;

          targetRecipientsMap.set(clean, {
            email: clean,
            name: r.full_name || clean.split('@')[0],
            college: r.college || 'PRPCEM',
            score: studentScore,
            status: statusLabel
          });
        }
      }

    } else if (audienceType === 'quiz_participants') {
      if (!quizId && !occurrenceId) {
        return res.status(400).json({ error: 'Please select a quiz to dispatch emails.' });
      }

      // 1. Scheduled attempts
      try {
        const attemptWhere = {};
        if (occurrenceId) attemptWhere.occurrence_id = occurrenceId;
        if (quizId) attemptWhere.quiz_id = quizId;

        const attempts = await QuizAttempt.findAll({
          where: attemptWhere,
          attributes: ['participant_name', 'participant_email', 'status', 'score'],
          order: [['submitted_at', 'DESC'], ['createdAt', 'DESC']]
        });

        for (const att of attempts) {
          if (att.participant_email && att.participant_email.includes('@')) {
            const clean = att.participant_email.toLowerCase().trim();
            const st = (att.status || '').toLowerCase();
            const isCompleted = st === 'completed' || st === 'finished';
            const isInProgress = st === 'in_progress' || st === 'started';
            const quizStatus = isCompleted ? 'completed' : (isInProgress ? 'in_progress' : 'not_completed');
            const isNotAttendedTarget = participantFilter === 'not_attended' || participantFilter === 'not_completed' || participantFilter === 'registered_not_attended';

            if (participantFilter === 'completed' && quizStatus !== 'completed') continue;
            if (isNotAttendedTarget && quizStatus !== 'not_completed') continue;
            if (participantFilter === 'in_progress' && quizStatus !== 'in_progress') continue;

            if (!excludedSet.has(clean)) {
              targetRecipientsMap.set(clean, {
                email: clean,
                name: att.participant_name || clean.split('@')[0],
                score: att.score,
                status: isCompleted ? 'Completed' : (isInProgress ? 'In Progress' : "Didn't Attend")
              });
            }
          }
        }
      } catch (attErr) {
        console.warn('Error querying attempts for email send:', attErr.message);
      }

      // 2. Live participants (only if completed/all, skip if looking for not_attended)
      const isNotAttendedTarget = participantFilter === 'not_attended' || participantFilter === 'not_completed' || participantFilter === 'registered_not_attended';
      if (quizId && !isNotAttendedTarget) {
        try {
          const liveParticipants = await Participant.findAll({
            where: { quiz_id: quizId },
            attributes: ['id', 'name', 'email', 'college']
          });

          for (const p of liveParticipants) {
            if (p.email && p.email.includes('@')) {
              const clean = p.email.toLowerCase().trim();
              if (!excludedSet.has(clean) && !targetRecipientsMap.has(clean)) {
                targetRecipientsMap.set(clean, {
                  email: clean,
                  name: p.name || clean.split('@')[0],
                  college: p.college || 'PRPCEM',
                  score: null,
                  status: 'Completed'
                });
              }
            }
          }
        } catch (pErr) {
          console.warn('Error querying live participants for email send:', pErr.message);
        }

        // 2.5 Injected scores (e.g. Week 1 JSON)
        if (participantFilter === 'completed' || participantFilter === 'all') {
          const injected = getInjectedScoresForQuiz(quizId, quizDetails?.title);
          for (const ip of injected) {
            if (ip.participant_email && ip.participant_email.includes('@')) {
              const clean = ip.participant_email.toLowerCase().trim();
              if (!excludedSet.has(clean) && !targetRecipientsMap.has(clean)) {
                targetRecipientsMap.set(clean, {
                  email: clean,
                  name: ip.participant_name || clean.split('@')[0],
                  college: 'PRPCEM',
                  score: ip.score,
                  status: 'Completed'
                });
              }
            }
          }
        }
      }

      // 3. Include registered event students, other week participants, and portal users who haven't completed this quiz
      if (isNotAttendedTarget || participantFilter === 'all') {
        try {
          // A. Event registrations
          let eventSlug = '';
          let eventTitle = quizDetails?.event_name || '';
          if (quizDetails?.event_id) {
            const ev = await Event.findByPk(quizDetails.event_id).catch(() => null);
            if (ev) {
              eventSlug = ev.slug || '';
              if (!eventTitle) eventTitle = ev.name || '';
            }
          }

          const eventRegs = await EventRegistration.findAll().catch(() => []);
          for (const reg of eventRegs) {
            const rId = String(reg.event_id || '').toLowerCase().trim();
            const rName = String(reg.event_name || '').toLowerCase().trim();
            const matchesEvent =
              (quizDetails?.event_id && (rId === String(quizDetails.event_id).toLowerCase() || rId === eventSlug.toLowerCase())) ||
              (eventTitle && (rName.includes(eventTitle.toLowerCase()) || eventTitle.toLowerCase().includes(rName))) ||
              (eventSlug && rId.includes(eventSlug.toLowerCase()));

            if (matchesEvent && reg.email && reg.email.includes('@')) {
              const clean = reg.email.toLowerCase().trim();
              if (!excludedSet.has(clean) && !targetRecipientsMap.has(clean)) {
                targetRecipientsMap.set(clean, {
                  email: clean,
                  name: reg.full_name || clean.split('@')[0],
                  college: reg.college || 'PRPCEM',
                  score: null,
                  status: "Didn't Attend"
                });
              }
            }
          }

          // B. Participants from other quizzes in the same tournament / event series
          if (quizDetails?.event_id || quizDetails?.event_name) {
            const otherQuizzes = await Quiz.findAll({
              where: {
                [Op.or]: [
                  ...(quizDetails.event_id ? [{ event_id: quizDetails.event_id }] : []),
                  ...(quizDetails.event_name ? [{ event_name: quizDetails.event_name }] : [])
                ]
              },
              attributes: ['id']
            }).catch(() => []);

            const otherQuizIds = otherQuizzes.map(q => q.id).filter(id => id !== quizDetails.id);
            if (otherQuizIds.length > 0) {
              const otherAttempts = await QuizAttempt.findAll({
                where: { quiz_id: { [Op.in]: otherQuizIds } },
                attributes: ['participant_email', 'participant_name']
              }).catch(() => []);

              for (const oa of otherAttempts) {
                if (oa.participant_email && oa.participant_email.includes('@')) {
                  const clean = oa.participant_email.toLowerCase().trim();
                  if (!excludedSet.has(clean) && !targetRecipientsMap.has(clean)) {
                    targetRecipientsMap.set(clean, {
                      email: clean,
                      name: oa.participant_name || clean.split('@')[0],
                      college: 'PRPCEM',
                      score: null,
                      status: "Didn't Attend"
                    });
                  }
                }
              }

              const otherLive = await Participant.findAll({
                where: { quiz_id: { [Op.in]: otherQuizIds } },
                attributes: ['email', 'name', 'college']
              }).catch(() => []);

              for (const ol of otherLive) {
                if (ol.email && ol.email.includes('@')) {
                  const clean = ol.email.toLowerCase().trim();
                  if (!excludedSet.has(clean) && !targetRecipientsMap.has(clean)) {
                    targetRecipientsMap.set(clean, {
                      email: clean,
                      name: ol.name || clean.split('@')[0],
                      college: ol.college || 'PRPCEM',
                      score: null,
                      status: "Didn't Attend"
                    });
                  }
                }
              }
            }
          }

          // C. Portal Users
          const allUsers = await User.findAll({ attributes: ['id', 'email', 'name', 'college'] }).catch(() => []);
          for (const u of allUsers) {
            if (u.email && u.email.includes('@')) {
              const clean = u.email.toLowerCase().trim();
              if (!excludedSet.has(clean) && !targetRecipientsMap.has(clean)) {
                targetRecipientsMap.set(clean, {
                  email: clean,
                  name: u.name || clean.split('@')[0],
                  college: u.college || 'PRPCEM',
                  score: null,
                  status: "Didn't Attend"
                });
              }
            }
          }
        } catch (evRegErr) {
          console.warn('Error adding event regs for quiz dispatch:', evRegErr.message);
        }
      }
    } else if (audienceType === 'custom') {
      const rawList = String(customEmails || '').split(/[\n,;]+/).map(e => e.trim().toLowerCase());
      for (const e of rawList) {
        if (e && e.includes('@') && !excludedSet.has(e)) {
          targetRecipientsMap.set(e, {
            email: e,
            name: e.split('@')[0],
            college: 'PRPCEM',
            status: 'Recipient'
          });
        }
      }
    }

    const recipientList = Array.from(targetRecipientsMap.values());

    if (recipientList.length === 0) {
      return res.status(400).json({ error: 'No valid recipient email addresses found for the selected audience.' });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    // Send emails
    for (const recipient of recipientList) {
      try {
        const studentData = {
          name: recipient.name || 'Learner',
          email: recipient.email,
          college: recipient.college || 'PRPCEM',
          quizTitle,
          eventName,
          score: recipient.score,
          status: recipient.status || 'Registered'
        };

        const personalizedSubject = replacePlaceholders(subject, studentData);
        const personalizedHeading = replacePlaceholders(heading || subject, studentData);
        const personalizedMessage = replacePlaceholders(messageBody, studentData);
        const formattedHtml = `<div style="font-size:14px;line-height:1.6;color:#334155;">${personalizedMessage.replace(/\n/g, '<br/>')}</div>`;

        await sendCustomBroadcastEmail({
          to: recipient.email,
          recipientName: studentData.name,
          subject: personalizedSubject,
          heading: personalizedHeading,
          messageHtml: formattedHtml,
          ctaText: ctaText ? replacePlaceholders(ctaText, studentData) : undefined,
          ctaUrl: ctaUrl ? replacePlaceholders(ctaUrl, studentData) : undefined
        });

        successCount++;
      } catch (mailErr) {
        failedCount++;
        errors.push({ email: recipient.email, error: mailErr.message });
      }
    }

    res.json({
      success: true,
      message: `Dispatched ${successCount} emails successfully (${failedCount} failed).`,
      totalTargeted: recipientList.length,
      successCount,
      failedCount,
      errors: errors.slice(0, 10)
    });
  } catch (err) {
    console.error('Error dispatching emails:', err);
    res.status(500).json({ error: err.message || 'Failed to dispatch emails.' });
  }
});

module.exports = router;
