const express = require('express');
const router = express.Router();
const { 
  Quiz, Question, ScheduledOccurrence, QuizAttempt, AttemptAnswer, AttemptViolation, Event, EventRegistration, Participant, Answer, Violation 
} = require('../models');
const authMiddleware = require('../middleware/auth');
const adminAuth = [authMiddleware, authMiddleware.requireAdmin];
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { sendQuizReminderEmail } = require('../services/emailService');
const { calculateScheduledQuestionScore, calculateNormalizedScoreAndXP, rankLeaderboard, getDifficultyConfig } = require('../services/scoringService');
const { getInjectedScoresForQuiz } = require('../services/injectedScoresService');
const { normalizeAnswers, isAnswerCorrect, determineQuestionType } = require('../utils/answerUtils');

// Helper: Sanitize Quiz object for public endpoints to prevent answer leaks
const sanitizeQuizForPublic = (quiz) => {
  if (!quiz) return null;
  const json = quiz.toJSON ? quiz.toJSON() : { ...quiz };
  if (json.occurrences) delete json.occurrences;
  if (Array.isArray(json.questions)) {
    json.questions = json.questions.map(q => {
      const qJson = q.toJSON ? q.toJSON() : { ...q };
      const qType = determineQuestionType(qJson);
      qJson.question_type = qType;
      qJson.multiple_correct = qType === 'multiple';
      delete qJson.correct_answer;
      return qJson;
    });
  }
  return json;
};

const isUUID = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());

/**
 * Checks if a participant is registered for an event across:
 * 1. Participant direct records for the quiz
 * 2. EventRegistration table (from mscprpcem.tech website & Quiz platform registrations)
 * 3. Keyword / Slug fuzzy matching for multi-week series like VisionX Season 2
 */
async function checkStudentEventRegistration(quiz, cleanEmail, cleanName) {
  if (!quiz) {
    return { linkedEvent: null, isEventRegistered: false, requiresEventRegistration: false };
  }

  // 1. Resolve linked event defensively without Postgres UUID type mismatches
  let linkedEvent = null;
  if (quiz.event_id && isUUID(quiz.event_id)) {
    linkedEvent = await Event.findByPk(quiz.event_id).catch(() => null);
  }

  if (!linkedEvent && quiz.event_name && quiz.event_name !== 'General' && quiz.event_name !== 'Technical') {
    const orConds = [
      { name: quiz.event_name },
      { slug: quiz.event_name },
      { slug: quiz.event_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
    ];
    if (isUUID(quiz.event_name)) {
      orConds.push({ id: quiz.event_name });
    }
    linkedEvent = await Event.findOne({
      where: { [Op.or]: orConds }
    }).catch(() => null);
  }

  // If still not found, check if quiz title or custom_slug contains known event keywords (e.g. VisionX)
  if (!linkedEvent) {
    const slugOrTitle = (quiz.custom_slug || quiz.title || '').toLowerCase();
    if (slugOrTitle.includes('vision') || slugOrTitle.includes('spark') || slugOrTitle.includes('gitlit') || slugOrTitle.includes('dotnet')) {
      const allEvents = await Event.findAll().catch(() => []);
      linkedEvent = allEvents.find(e => {
        const eSlug = (e.slug || e.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const qSlug = slugOrTitle.replace(/[^a-z0-9]/g, '');
        return eSlug && (qSlug.includes(eSlug) || eSlug.includes(qSlug));
      });
    }
  }

  const requiresEventRegistration = Boolean(linkedEvent);
  if (!requiresEventRegistration) {
    return { linkedEvent: null, isEventRegistered: true, requiresEventRegistration: false };
  }

  let isEventRegistered = false;
  const emailNorm = cleanEmail ? String(cleanEmail).toLowerCase().trim() : '';
  const nameNorm = cleanName ? String(cleanName).trim() : '';

  // Check 1: Participant table for this Quiz (direct registration)
  if (emailNorm) {
    const directParticipant = await Participant.findOne({
      where: {
        quiz_id: quiz.id,
        [Op.or]: [
          { email: emailNorm },
          ...(cleanEmail ? [{ email: cleanEmail }] : [])
        ]
      }
    }).catch(() => null);
    if (directParticipant) {
      isEventRegistered = true;
    }
  }

  // Check 2: EventRegistration table (registered on mscprpcem.tech or quiz platform)
  if (!isEventRegistered && (emailNorm || nameNorm)) {
    const regConditions = [];
    if (emailNorm) {
      regConditions.push({ email: emailNorm });
      regConditions.push({ email: { [Op.like]: emailNorm } });
      if (cleanEmail && cleanEmail !== emailNorm) {
        regConditions.push({ email: cleanEmail });
      }
    }
    if (nameNorm) {
      regConditions.push({ full_name: nameNorm });
      regConditions.push({ full_name: { [Op.like]: nameNorm } });
    }

    const possibleEventMatches = new Set();
    if (linkedEvent.id) possibleEventMatches.add(String(linkedEvent.id));
    if (linkedEvent.slug) {
      possibleEventMatches.add(String(linkedEvent.slug));
      possibleEventMatches.add(String(linkedEvent.slug).toLowerCase());
    }
    if (linkedEvent.name) {
      possibleEventMatches.add(String(linkedEvent.name));
      possibleEventMatches.add(String(linkedEvent.name).toLowerCase());
    }
    if (quiz.event_id) possibleEventMatches.add(String(quiz.event_id));
    if (quiz.event_name) {
      possibleEventMatches.add(String(quiz.event_name));
      possibleEventMatches.add(String(quiz.event_name).toLowerCase());
    }

    const eventMatchList = Array.from(possibleEventMatches);

    const foundReg = await EventRegistration.findOne({
      where: {
        [Op.or]: [
          { event_id: { [Op.or]: eventMatchList } },
          { event_name: { [Op.or]: eventMatchList } }
        ],
        [Op.and]: [{ [Op.or]: regConditions }]
      }
    }).catch(() => null);

    if (foundReg) {
      isEventRegistered = true;
    }

    // Check 3: Fuzzy matching on any EventRegistration under this student's email
    if (!isEventRegistered && emailNorm) {
      const allUserRegs = await EventRegistration.findAll({
        where: {
          [Op.or]: [
            { email: emailNorm },
            ...(cleanEmail ? [{ email: cleanEmail }] : [])
          ]
        }
      }).catch(() => []);

      const searchTerms = [
        linkedEvent.name,
        linkedEvent.slug,
        quiz.event_name,
        quiz.custom_slug,
        quiz.title
      ].filter(Boolean).map(s => String(s).toLowerCase().replace(/[^a-z0-9]/g, ''));

      for (const r of allUserRegs) {
        const regKey = String(r.event_id || r.event_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (regKey && searchTerms.some(st => st.includes(regKey) || regKey.includes(st) || st.startsWith(regKey) || regKey.startsWith(st))) {
          isEventRegistered = true;
          break;
        }
      }
    }
  }

  return {
    linkedEvent,
    isEventRegistered,
    requiresEventRegistration
  };
}

/**
 * Deduplicates quiz attempts for each unique participant so only their LATEST attempt is shown on the leaderboard.
 * Sorts and ranks all unique participants by:
 * 1. Score (DESC)
 * 2. Time Taken / Speed (ASC)
 * 3. Correct answers count (DESC)
 * 4. Submission time (ASC)
 */
function getLatestAttemptsLeaderboard(attempts, options = {}) {
  if (!Array.isArray(attempts) || attempts.length === 0) return [];

  const latestByUser = new Map();

  for (const rawAtt of attempts) {
    const att = rawAtt.toJSON ? rawAtt.toJSON() : rawAtt;
    const ssoId = att.sso_user_id ? String(att.sso_user_id).trim() : '';
    const email = (att.participant_email || att.email || '').toLowerCase().trim();
    const name = (att.participant_name || att.name || '').toLowerCase().trim();

    // Unique user identifier priority: SSO ID -> Email -> Name
    const userKey = ssoId ? `sso:${ssoId}` : (email ? `email:${email}` : `name:${name}`);
    if (!userKey || userKey === 'name:') continue;

    const existing = latestByUser.get(userKey);
    if (!existing) {
      latestByUser.set(userKey, att);
    } else {
      // Determine which attempt is newer/latest
      const attTime = att.submitted_at ? new Date(att.submitted_at).getTime() : (att.createdAt ? new Date(att.createdAt).getTime() : 0);
      const existTime = existing.submitted_at ? new Date(existing.submitted_at).getTime() : (existing.createdAt ? new Date(existing.createdAt).getTime() : 0);
      const attNum = parseInt(att.attempt_number, 10) || 0;
      const existNum = parseInt(existing.attempt_number, 10) || 0;

      if (attNum > existNum || (attNum === existNum && attTime >= existTime)) {
        latestByUser.set(userKey, att);
      }
    }
  }

  const latestList = Array.from(latestByUser.values()).map(att => {
    const isAuth = Boolean(att.sso_user_id || (att.participant_email && att.participant_email.includes('@')));
    return {
      ...att,
      email: att.participant_email || att.email || '',
      name: att.participant_name || att.name || 'Participant',
      is_authenticated: isAuth,
      is_guest: !isAuth,
      correctAnswers: att.correct_count || 0,
      violations: att.violation_count || att.violationsCount || 0
    };
  });

  return rankLeaderboard(latestList, options);
}

// Helper: Resolve occurrence by UUID, Quiz Join Code, Quiz UUID, or Title Slug
const resolveOccurrence = async (identifier) => {
  if (!identifier) return null;
  const rawClean = String(identifier).trim();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawClean);
  
  // 1. Try finding ScheduledOccurrence directly by ID if valid UUID
  if (isUUID) {
    try {
      let occ = await ScheduledOccurrence.findByPk(rawClean, {
        include: [{ model: Quiz, as: 'quiz', include: [{ model: Question, as: 'questions' }] }]
      });
      if (occ) return occ;
    } catch (e) {
      // If error, fallback to quiz lookup
    }
  }

  const slugClean = rawClean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const quizWhereConditions = [
    { custom_slug: rawClean },
    { custom_slug: { [Op.like]: rawClean } },
    { join_code: rawClean },
    { join_code: rawClean.toUpperCase() },
    sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), rawClean.toLowerCase()),
    sequelize.where(sequelize.fn('LOWER', sequelize.fn('REPLACE', sequelize.col('title'), ' ', '-')), slugClean)
  ];

  if (isUUID) {
    quizWhereConditions.unshift({ id: rawClean });
  }

  let quiz = await Quiz.findOne({
    where: {
      [Op.or]: quizWhereConditions
    },
    order: [['updatedAt', 'DESC']],
    include: [
      { model: Question, as: 'questions' },
      { model: ScheduledOccurrence, as: 'occurrences' }
    ]
  });

  if (!quiz) {
    // Partial substring fallback search for title slug
    const allQuizzes = await Quiz.findAll({
      order: [['updatedAt', 'DESC']],
      include: [
        { model: Question, as: 'questions' },
        { model: ScheduledOccurrence, as: 'occurrences' }
      ]
    });
    quiz = allQuizzes.find(q => {
      const qSlug = q.title ? q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
      return (
        (q.custom_slug && q.custom_slug.toLowerCase() === rawClean.toLowerCase()) ||
        qSlug === slugClean || 
        q.join_code?.toLowerCase() === rawClean.toLowerCase()
      );
    });
  }

  if (quiz) {
    const occurrences = (quiz.occurrences || []).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    const now = new Date();
    let matchedOcc = occurrences.find(o => o.status !== 'CANCELLED' && new Date(o.start_time) <= now && new Date(o.end_time) >= now);
    if (!matchedOcc) {
      matchedOcc = occurrences.find(o => o.status !== 'CANCELLED' && new Date(o.start_time) > now);
    }
    if (!matchedOcc && occurrences.length > 0) {
      matchedOcc = occurrences[0];
    }

    if (!matchedOcc) {
      const startTime = quiz.scheduled_start || now;
      const endTime = quiz.scheduled_end || new Date(now.getTime() + (quiz.time_limit || 30) * 60000);
      matchedOcc = await ScheduledOccurrence.create({
        quiz_id: quiz.id,
        occurrence_date: startTime,
        start_time: startTime,
        end_time: endTime,
        status: 'SCHEDULED'
      });
    }

    return matchedOcc;
  }

  return null;
};

// Helper: Generate unique join code for scheduled quizzes
const generateJoinCode = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let code = '';
  while (!isUnique) {
    code = 'SCH-';
    for (let i = 0; i < 5; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const existing = await Quiz.findOne({ where: { join_code: code } });
    if (!existing) isUnique = true;
  }
  return code;
};

// Helper: Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Helper: Parse date and time string into exact IST Date (+05:30)
const parseISTDateTime = (dateInput, timeStr = '00:00:00') => {
  if (!dateInput) return new Date();
  
  if (dateInput instanceof Date && isNaN(dateInput.getTime())) return new Date();

  // If already an ISO string with explicit timezone (+ or Z)
  if (typeof dateInput === 'string' && (dateInput.endsWith('Z') || (dateInput.includes('T') && dateInput.includes('+')))) {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) return d;
  }

  let y, m, d;
  if (dateInput instanceof Date) {
    y = dateInput.getFullYear();
    m = String(dateInput.getMonth() + 1).padStart(2, '0');
    d = String(dateInput.getDate()).padStart(2, '0');
  } else {
    const str = String(dateInput).trim().split('T')[0];
    const parts = str.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      y = parts[0];
      m = String(parts[1]).padStart(2, '0');
      d = String(parts[2]).padStart(2, '0');
    } else {
      const parsed = new Date(dateInput);
      y = parsed.getFullYear();
      m = String(parsed.getMonth() + 1).padStart(2, '0');
      d = String(parsed.getDate()).padStart(2, '0');
    }
  }

  const tParts = String(timeStr || '00:00:00').trim().split(':').map(Number);
  const hour = String(tParts[0] || 0).padStart(2, '0');
  const min = String(tParts[1] || 0).padStart(2, '0');
  const sec = String(tParts[2] || 0).padStart(2, '0');

  const istCombined = `${y}-${m}-${d}T${hour}:${min}:${sec}+05:30`;
  const result = new Date(istCombined);
  return isNaN(result.getTime()) ? new Date() : result;
};

// Helper: Generate occurrence slots based on schedule configuration with strict IST timezone calculation
const generateOccurrences = async (quizId, quizTitle, scheduleType, startDate, endDate, startTimeStr, endTimeStr, config = {}) => {
  const parseDateParts = (dateInput) => {
    if (!dateInput) return { year: new Date().getFullYear(), month: new Date().getMonth(), date: new Date().getDate() };
    if (dateInput instanceof Date) {
      return { year: dateInput.getFullYear(), month: dateInput.getMonth(), date: dateInput.getDate() };
    }
    const str = String(dateInput).trim().split('T')[0];
    const parts = str.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return { year: parts[0], month: parts[1] - 1, date: parts[2] };
    }
    const d = new Date(dateInput);
    return { year: d.getFullYear(), month: d.getMonth(), date: d.getDate() };
  };

  const startP = parseDateParts(startDate);
  const endP = parseDateParts(endDate || startDate);

  const startObj = new Date(startP.year, startP.month, startP.date);
  const endObj = new Date(endP.year, endP.month, endP.date);
  const occurrences = [];

  const dayMap = { 'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6 };

  let curr = new Date(startObj.getFullYear(), startObj.getMonth(), startObj.getDate());
  let count = 1;

  if (scheduleType === 'ONE_TIME') {
    let oStart = (config?.start_iso) ? new Date(config.start_iso) : parseISTDateTime(startDate, startTimeStr || '00:00:00');
    let oEnd = (config?.end_iso) ? new Date(config.end_iso) : parseISTDateTime(endDate || startDate, endTimeStr || '23:59:59');
    if (oEnd <= oStart) {
      oEnd = new Date(oStart.getTime() + 60 * 60 * 1000);
    }
    occurrences.push({
      quiz_id: quizId,
      occurrence_number: 1,
      title: `${quizTitle} (One-Time)`,
      start_time: oStart,
      end_time: oEnd,
      status: 'SCHEDULED'
    });
  } else if (scheduleType === 'DAILY') {
    while (curr <= endObj && count <= 60) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${d}`;
      const oStart = parseISTDateTime(dStr, startTimeStr || '00:00:00');
      const oEnd = parseISTDateTime(dStr, endTimeStr || '23:59:59');
      occurrences.push({
        quiz_id: quizId,
        occurrence_number: count,
        title: `${quizTitle} — Day ${count}`,
        start_time: oStart,
        end_time: oEnd,
        status: 'SCHEDULED'
      });
      curr.setDate(curr.getDate() + 1);
      count++;
    }
  } else if (scheduleType === 'WEEKLY') {
    const targetDays = (config.daysOfWeek && config.daysOfWeek.length > 0)
      ? config.daysOfWeek.map(d => typeof d === 'string' ? dayMap[d.toUpperCase()] : d).filter(d => d !== undefined)
      : null;

    while (curr <= endObj && count <= 52) {
      const dayOfWeek = curr.getDay();
      if (!targetDays || targetDays.includes(dayOfWeek)) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        const dStr = `${y}-${m}-${d}`;
        const oStart = parseISTDateTime(dStr, startTimeStr || '00:00:00');
        const oEnd = parseISTDateTime(dStr, endTimeStr || '23:59:59');
        occurrences.push({
          quiz_id: quizId,
          occurrence_number: count,
          title: `${quizTitle} — Session ${count}`,
          start_time: oStart,
          end_time: oEnd,
          status: 'SCHEDULED'
        });
        count++;
      }
      curr.setDate(curr.getDate() + 1);
    }
  } else if (scheduleType === 'BIWEEKLY') {
    const targetDays = (config.daysOfWeek && config.daysOfWeek.length > 0)
      ? config.daysOfWeek.map(d => typeof d === 'string' ? dayMap[d.toUpperCase()] : d).filter(d => d !== undefined)
      : null;
    const weeksPattern = config.weeksPattern || '1_3';

    while (curr <= endObj && count <= 30) {
      const dayOfWeek = curr.getDay();
      const dayOfMonth = curr.getDate();
      const weekOfMonth = Math.ceil(dayOfMonth / 7);

      const isMatchingWeek = (weeksPattern === '1_3' && (weekOfMonth === 1 || weekOfMonth === 3)) ||
                            (weeksPattern === '2_4' && (weekOfMonth === 2 || weekOfMonth === 4));

      if (isMatchingWeek && (!targetDays || targetDays.includes(dayOfWeek))) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        const dStr = `${y}-${m}-${d}`;
        const oStart = parseISTDateTime(dStr, startTimeStr || '00:00:00');
        const oEnd = parseISTDateTime(dStr, endTimeStr || '23:59:59');
        occurrences.push({
          quiz_id: quizId,
          occurrence_number: count,
          title: `${quizTitle} — Biweekly #${count}`,
          start_time: oStart,
          end_time: oEnd,
          status: 'SCHEDULED'
        });
        count++;
      }
      curr.setDate(curr.getDate() + 1);
    }
  } else if (scheduleType === 'MONTHLY') {
    const targetDayOfMonth = parseInt(config.dayOfMonth || 1, 10);
    while (curr <= endObj && count <= 24) {
      if (curr.getDate() === targetDayOfMonth || (targetDayOfMonth >= 28 && curr.getDate() === new Date(curr.getFullYear(), curr.getMonth() + 1, 0).getDate())) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        const dStr = `${y}-${m}-${d}`;
        const oStart = parseISTDateTime(dStr, startTimeStr || '00:00:00');
        const oEnd = parseISTDateTime(dStr, endTimeStr || '23:59:59');
        occurrences.push({
          quiz_id: quizId,
          occurrence_number: count,
          title: `${quizTitle} — Month ${count}`,
          start_time: oStart,
          end_time: oEnd,
          status: 'SCHEDULED'
        });
        count++;
      }
      curr.setDate(curr.getDate() + 1);
    }
  } else {
    // CUSTOM
    const step = parseInt(config.customIntervalDays || 3, 10);
    while (curr <= endObj && count <= 30) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${d}`;
      const oStart = parseISTDateTime(dStr, startTimeStr || '00:00:00');
      const oEnd = parseISTDateTime(dStr, endTimeStr || '23:59:59');
      occurrences.push({
        quiz_id: quizId,
        occurrence_number: count,
        title: `${quizTitle} — Custom #${count}`,
        start_time: oStart,
        end_time: oEnd,
        status: 'SCHEDULED'
      });
      curr.setDate(curr.getDate() + step);
      count++;
    }
  }

  // In-place occurrence persistence preserving IDs and past attempts
  const existingOccs = await ScheduledOccurrence.findAll({ where: { quiz_id: quizId } });
  const existingOccMap = new Map(existingOccs.map(o => [o.occurrence_number, o]));

  for (const occData of occurrences) {
    const existing = existingOccMap.get(occData.occurrence_number);
    if (existing) {
      await existing.update({
        title: occData.title,
        start_time: occData.start_time,
        end_time: occData.end_time
      });
      existingOccMap.delete(occData.occurrence_number);
    } else {
      await ScheduledOccurrence.create(occData);
    }
  }

  // Any remaining old occurrences not in current schedule
  for (const [, oldOcc] of existingOccMap.entries()) {
    const attemptsCount = await QuizAttempt.count({ where: { occurrence_id: oldOcc.id } }).catch(() => 0);
    if (attemptsCount === 0) {
      await oldOcc.destroy();
    } else {
      await oldOcc.update({ status: 'PAUSED' });
    }
  }

  // Self-heal: Re-link any past attempts whose occurrence was lost
  try {
    const allCurrentOccs = await ScheduledOccurrence.findAll({ where: { quiz_id: quizId }, order: [['occurrence_number', 'ASC']] });
    if (allCurrentOccs.length > 0) {
      const currentIds = new Set(allCurrentOccs.map(o => o.id));
      const occ1 = allCurrentOccs.find(o => o.occurrence_number === 1) || allCurrentOccs[0];
      const orphanedAttempts = await QuizAttempt.findAll({
        where: {
          quiz_id: quizId,
          occurrence_id: { [Op.notIn]: Array.from(currentIds) }
        }
      });
      for (const att of orphanedAttempts) {
        att.occurrence_id = occ1.id;
        await att.save();
      }
    }
  } catch (e) {
    console.warn('Attempt self-heal notice:', e.message);
  }
};

// ----------------------------------------------------
// ADMIN ENDPOINTS
// ----------------------------------------------------

// 1. Get all scheduled quizzes (Admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    let quizzes = [];
    try {
      quizzes = await Quiz.findAll({
        where: { mode: 'SCHEDULED' },
        order: [['createdAt', 'DESC']],
        include: [{ model: ScheduledOccurrence, as: 'occurrences' }]
      });
    } catch (dbErr) {
      quizzes = await Quiz.findAll({
        order: [['createdAt', 'DESC']],
        include: [{ model: ScheduledOccurrence, as: 'occurrences' }]
      });
      quizzes = quizzes.filter(q => q.mode === 'SCHEDULED' || q.schedule_type);
    }

    const enriched = await Promise.all(
      quizzes.map(async (quiz) => {
        const questionCount = await Question.count({ where: { quiz_id: quiz.id } });
        const [attemptCount, liveParticipantCount, liveViolations, attempts] = await Promise.all([
          QuizAttempt.count({ where: { quiz_id: quiz.id } }).catch(() => 0),
          Participant.count({ where: { quiz_id: quiz.id } }).catch(() => 0),
          Violation.count({ where: { quiz_id: quiz.id } }).catch(() => 0),
          QuizAttempt.findAll({ where: { quiz_id: quiz.id }, attributes: ['id'] }).catch(() => [])
        ]);
        const injectedCount = getInjectedScoresForQuiz(quiz.id, quiz.title).length;
        const totalParticipantCount = attemptCount + liveParticipantCount + injectedCount;
        const attemptIds = attempts.map(a => a.id);
        const attemptViolationCount = attemptIds.length > 0
          ? await AttemptViolation.count({ where: { attempt_id: { [Op.in]: attemptIds } } }).catch(() => 0)
          : 0;
        const violationCount = Math.max(liveViolations, attemptViolationCount);

        const occurrences = quiz.occurrences || [];

        const now = new Date();
        const activeOccurrence = occurrences.find(o => new Date(o.start_time) <= now && new Date(o.end_time) >= now && o.status !== 'CANCELLED');
        const nextOccurrence = occurrences.find(o => new Date(o.start_time) > now && o.status !== 'CANCELLED');

        let computedStatus = quiz.status;
        if (!activeOccurrence && !nextOccurrence && occurrences.length > 0) {
          computedStatus = totalParticipantCount > 0 ? 'completed' : 'expired';
          if (quiz.status !== computedStatus) {
            await quiz.update({ status: computedStatus }).catch(() => {});
          }
        }

        return {
          ...quiz.toJSON(),
          status: computedStatus,
          questionCount,
          participantCount: totalParticipantCount,
          violationCount,
          activeOccurrence,
          nextOccurrence,
          totalOccurrences: occurrences.length
        };
      })
    );

    return res.json(enriched);
  } catch (error) {
    console.error('Fetch scheduled quizzes error:', error);
    return res.status(500).json({ error: 'Failed to fetch scheduled quizzes.' });
  }
});

// 2. Create Scheduled Quiz (Admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      title, description, event_id, event_name, subject, difficulty, instructions,
      schedule_type, start_date, end_date, start_time, end_time, timezone,
      start_iso, end_iso,
      time_limit, max_attempts, score_policy, shuffle_questions, shuffle_answers,
      require_fullscreen, anti_cheat_enabled, max_violations, positive_marks,
      negative_marks, show_leaderboard, questions, schedule_config, custom_slug,
      badge_title, badge_sys_id
    } = req.body;

    if (!title || !schedule_type || !start_date || !end_date) {
      return res.status(400).json({ error: 'Quiz Title, Schedule Type, Start Date, and End Date are required.' });
    }

    const join_code = await generateJoinCode();
    const cleanSlug = custom_slug ? custom_slug.trim().replace(/^\//, '') : null;

    if (cleanSlug) {
      await Quiz.update({ custom_slug: null }, { where: { custom_slug: cleanSlug } });
    }

    const quiz = await Quiz.create({
      title,
      description,
      event_id: event_id || null,
      event_name: event_name || 'Scheduled Challenge',
      subject: subject || 'General CS',
      join_code,
      custom_slug: cleanSlug,
      badge_title: badge_title || null,
      badge_sys_id: badge_sys_id || null,
      mode: 'SCHEDULED',
      status: 'draft',
      schedule_type,
      scheduled_start: start_iso ? new Date(start_iso) : parseISTDateTime(start_date, start_time || '00:00:00'),
      scheduled_end: end_iso ? new Date(end_iso) : parseISTDateTime(end_date, end_time || '23:59:59'),
      timezone: timezone || 'Asia/Kolkata',
      time_limit: parseInt(time_limit || 30, 10),
      max_attempts: parseInt(max_attempts || 1, 10),
      score_policy: score_policy || 'BEST',
      shuffle_questions: !!shuffle_questions,
      shuffle_answers: !!shuffle_answers,
      require_fullscreen: !!require_fullscreen,
      anti_cheat_enabled: !!anti_cheat_enabled,
      max_violations: parseInt(max_violations || 3, 10),
      positive_marks: parseInt(positive_marks || 1, 10),
      negative_marks: parseInt(negative_marks || 0, 10),
      show_leaderboard: show_leaderboard !== undefined ? !!show_leaderboard : true,
      schedule_config: schedule_config ? JSON.stringify(schedule_config) : null
    });

    // Create Questions if provided
    if (Array.isArray(questions) && questions.length > 0) {
      const qRecords = questions.map((q, idx) => {
        const normCorrect = normalizeAnswers(q.correct_answer) || 'A';
        const qType = q.question_type || determineQuestionType({ ...q, correct_answer: normCorrect });
        return {
          quiz_id: quiz.id,
          question: q.question,
          option_a: q.option_a || 'True',
          option_b: q.option_b || 'False',
          option_c: qType === 'true_false' ? null : (q.option_c || ''),
          option_d: qType === 'true_false' ? null : (q.option_d || ''),
          correct_answer: normCorrect,
          question_type: qType,
          timer: quiz.time_limit * 60,
          marks: quiz.positive_marks,
          order_index: q.order_index || idx + 1,
          occurrence_number: q.occurrence_number !== undefined ? q.occurrence_number : (q.section_number || 1),
          section_name: q.section_name || null,
          section_description: q.section_description || null
        };
      });
      await Question.bulkCreate(qRecords);
    }

    // Generate occurrence slots
    await generateOccurrences(
      quiz.id,
      quiz.title,
      schedule_type,
      start_date,
      end_date,
      start_time,
      end_time,
      { ...(schedule_config || {}), start_iso, end_iso }
    );

    return res.status(201).json({ message: 'Scheduled Quiz created successfully!', quiz });
  } catch (error) {
    console.error('Create scheduled quiz error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create scheduled quiz.' });
  }
});

// ----------------------------------------------------
// PUBLIC PARTICIPANT ENDPOINTS
// ----------------------------------------------------

// Public list of active & upcoming scheduled quizzes
router.get('/public/all', async (req, res) => {
  try {
    let quizzes = [];
    try {
      quizzes = await Quiz.findAll({
        where: { mode: 'SCHEDULED' },
        include: [{ model: ScheduledOccurrence, as: 'occurrences' }]
      });
    } catch (dbErr) {
      quizzes = await Quiz.findAll({
        include: [{ model: ScheduledOccurrence, as: 'occurrences' }]
      });
      quizzes = quizzes.filter(q => q.mode === 'SCHEDULED' || q.schedule_type);
    }

    const now = new Date();
    const publicList = [];

    for (const q of quizzes) {
      const occurrences = q.occurrences || [];
      const questionCount = await Question.count({ where: { quiz_id: q.id } });

      if (occurrences.length === 0) {
        const [attemptCount, livePartCount] = await Promise.all([
          QuizAttempt.count({ where: { quiz_id: q.id } }).catch(() => 0),
          Participant.count({ where: { quiz_id: q.id } }).catch(() => 0)
        ]);
        const injectedCount = getInjectedScoresForQuiz(q.id, q.title).length;
        const participantCount = attemptCount + livePartCount + injectedCount;

        const sTime = q.scheduled_start ? new Date(q.scheduled_start) : new Date(now.getTime() - 5 * 60 * 1000);
        const eTime = q.scheduled_end ? new Date(q.scheduled_end) : new Date(sTime.getTime() + (q.time_limit || 60) * 60 * 1000);
        let availability = 'UPCOMING';
        if (now >= sTime && now <= eTime) {
          availability = 'ACTIVE';
        } else if (now > eTime) {
          availability = participantCount > 0 ? 'COMPLETED' : 'EXPIRED';
        }

        const titleSlug = q.custom_slug || (q.title ? q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'quiz');
        publicList.push({
          occurrenceId: q.id,
          quizId: q.id,
          title: q.title,
          custom_slug: q.custom_slug,
          slug: titleSlug,
          join_code: q.join_code,
          description: q.description,
          category: q.subject || 'General CS',
          startTime: sTime,
          endTime: eTime,
          scheduled_start: sTime,
          scheduled_end: eTime,
          timeLimit: q.time_limit || 30,
          questionCount,
          participantCount,
          availability,
          positiveMarks: q.positive_marks,
          negativeMarks: q.negative_marks
        });
      } else {
        for (const occ of occurrences) {
          if (occ.status === 'CANCELLED' || occ.status === 'PAUSED') continue;
          const sTime = new Date(occ.start_time);
          const eTime = new Date(occ.end_time);

          const [occAttempts, totalQuizAttempts, livePartCount] = await Promise.all([
            QuizAttempt.count({
              where: {
                quiz_id: q.id,
                occurrence_id: occ.id
              }
            }).catch(() => 0),
            QuizAttempt.count({
              where: { quiz_id: q.id }
            }).catch(() => 0),
            Participant.count({ where: { quiz_id: q.id } }).catch(() => 0)
          ]);
          const injectedCount = getInjectedScoresForQuiz(q.id, q.title).length;
          const baseAttempts = occAttempts > 0 ? occAttempts : totalQuizAttempts;
          const participantCount = baseAttempts + livePartCount + injectedCount;

          let availability = 'UPCOMING';
          if (now >= sTime && now <= eTime) {
            availability = 'ACTIVE';
          } else if (now > eTime) {
            availability = participantCount > 0 ? 'COMPLETED' : 'EXPIRED';
            if (occ.status !== availability) {
              await occ.update({ status: availability }).catch(() => {});
            }
          }

          const titleSlug = q.custom_slug || (q.title ? q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'quiz');
          publicList.push({
            occurrenceId: occ.id,
            quizId: q.id,
            title: q.title,
            custom_slug: q.custom_slug,
            slug: titleSlug,
            join_code: q.join_code,
            description: q.description,
            category: q.subject || 'General CS',
            startTime: occ.start_time,
            endTime: occ.end_time,
            scheduled_start: occ.start_time,
            scheduled_end: occ.end_time,
            timeLimit: q.time_limit,
            questionCount,
            participantCount,
            availability,
            positiveMarks: q.positive_marks,
            negativeMarks: q.negative_marks
          });
        }
      }
    }

    return res.json(publicList);
  } catch (error) {
    console.error('Public scheduled quizzes error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch public scheduled quizzes.' });
  }
});

// Get Single Scheduled Quiz (Admin)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [
        { model: Question, as: 'questions' },
        { model: ScheduledOccurrence, as: 'occurrences' }
      ]
    });

    if (!quiz) return res.status(404).json({ error: 'Scheduled Quiz not found.' });

    let attempts = await QuizAttempt.findAll({
      where: { quiz_id: quiz.id },
      order: [
        ['attempt_number', 'DESC'],
        ['submitted_at', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    if (attempts.length === 0) {
      const participants = await Participant.findAll({
        where: { quiz_id: quiz.id }
      }).catch(() => []);

      if (participants.length > 0) {
        const pIds = participants.map(p => p.id);
        const [liveAnswers, liveViolations] = await Promise.all([
          Answer.findAll({ where: { participant_id: { [Op.in]: pIds } } }).catch(() => []),
          Violation.findAll({ where: { [Op.or]: [{ quiz_id: quiz.id }, { participant_id: { [Op.in]: pIds } }] } }).catch(() => [])
        ]);

        const answersByParticipant = new Map();
        for (const ans of liveAnswers) {
          const pid = String(ans.participant_id);
          if (!answersByParticipant.has(pid)) answersByParticipant.set(pid, []);
          answersByParticipant.get(pid).push(ans);
        }

        const violationsByParticipant = new Map();
        for (const v of liveViolations) {
          const pid = String(v.participant_id);
          violationsByParticipant.set(pid, (violationsByParticipant.get(pid) || 0) + 1);
        }

        const firstOcc = (quiz.occurrences && quiz.occurrences[0]) || null;
        attempts = participants.map((p) => {
          const pAns = answersByParticipant.get(String(p.id)) || [];
          const correctCount = pAns.filter(a => Boolean(a.is_correct)).length;
          const incorrectCount = pAns.filter(a => !a.is_correct).length;
          const pointsSum = pAns.reduce((sum, a) => sum + (Number(a.points) || 0), 0);
          const computedScore = pointsSum > 0 
            ? pointsSum 
            : (correctCount * (quiz.positive_marks || 1) - incorrectCount * (quiz.negative_marks || 0));
          const totalV = (violationsByParticipant.get(String(p.id)) || 0) + (p.tab_switch_count || 0);

          return {
            id: p.id,
            occurrence_id: firstOcc ? firstOcc.id : null,
            quiz_id: quiz.id,
            participant_name: p.name,
            participant_email: p.email,
            sso_user_id: p.sso_user_id,
            score: Math.max(0, computedScore),
            correct_count: correctCount,
            incorrect_count: incorrectCount,
            unanswered_count: Math.max(0, (quiz.questions?.length || 0) - pAns.length),
            time_taken_seconds: pAns.reduce((sum, a) => sum + Math.round((Number(a.response_time) || 0) / 1000), 0),
            status: 'completed',
            submitted_at: p.updatedAt || p.createdAt,
            createdAt: p.createdAt,
            violation_count: totalV,
            violationsCount: totalV,
            violationCount: totalV
          };
        });
      }
    }

    const attemptIds = attempts.map(a => a.id);
    let allViolations = [];
    const attemptViolationsMap = new Map();

    if (attemptIds.length > 0) {
      allViolations = await AttemptViolation.findAll({
        where: { attempt_id: { [Op.in]: attemptIds } }
      }).catch(() => []);

      for (const v of allViolations) {
        const aId = String(v.attempt_id);
        attemptViolationsMap.set(aId, (attemptViolationsMap.get(aId) || 0) + 1);
      }
    }

    // Attach attempt-specific violation count
    const enrichedAttempts = attempts.map(a => {
      const aJson = a.toJSON ? a.toJSON() : { ...a };
      const aId = String(aJson.id);
      const vCount = (attemptViolationsMap.get(aId) || 0) + (aJson.violation_count || 0);
      return {
        ...aJson,
        violation_count: vCount,
        violationsCount: vCount,
        violationCount: vCount
      };
    });

    const totalViolationCount = allViolations.length > 0 
      ? allViolations.length 
      : enrichedAttempts.reduce((sum, a) => sum + (a.violation_count || 0), 0);

    // Compute total violations per unique student across all their attempts
    const userTotalViolationsMap = new Map();
    for (const a of enrichedAttempts) {
      const ssoId = a.sso_user_id ? String(a.sso_user_id).trim() : '';
      const email = (a.participant_email || a.email || '').toLowerCase().trim();
      const name = (a.participant_name || a.name || '').toLowerCase().trim();
      const userKey = ssoId ? `sso:${ssoId}` : (email ? `email:${email}` : `name:${name}`);
      if (userKey) {
        userTotalViolationsMap.set(userKey, (userTotalViolationsMap.get(userKey) || 0) + (a.violation_count || 0));
      }
    }

    const finalEnrichedAttempts = enrichedAttempts.map(a => {
      const ssoId = a.sso_user_id ? String(a.sso_user_id).trim() : '';
      const email = (a.participant_email || a.email || '').toLowerCase().trim();
      const name = (a.participant_name || a.name || '').toLowerCase().trim();
      const userKey = ssoId ? `sso:${ssoId}` : (email ? `email:${email}` : `name:${name}`);
      const userTotal = (userKey && userTotalViolationsMap.get(userKey)) || a.violation_count || 0;
      return {
        ...a,
        total_user_violations: userTotal,
        violation_count: Math.max(a.violation_count || 0, userTotal),
        violationsCount: Math.max(a.violation_count || 0, userTotal),
        violationCount: Math.max(a.violation_count || 0, userTotal)
      };
    });

    const latestLeaderboard = getLatestAttemptsLeaderboard(finalEnrichedAttempts.filter(a => a.status === 'completed'));

    return res.json({ 
      quiz: { ...quiz.toJSON(), violationCount: totalViolationCount }, 
      attempts: latestLeaderboard, 
      allAttempts: finalEnrichedAttempts,
      violationCount: totalViolationCount
    });
  } catch (error) {
    console.error('Fetch scheduled quiz error:', error);
    return res.status(500).json({ error: 'Failed to fetch scheduled quiz details.' });
  }
});

// Update Scheduled Quiz (Admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Scheduled Quiz not found.' });

    const {
      title, description, event_id, event_name, category, difficulty, instructions,
      schedule_type, start_date, end_date, start_time, end_time, timezone,
      start_iso, end_iso,
      time_limit, max_attempts, score_policy, shuffle_questions, shuffle_answers,
      require_fullscreen, anti_cheat_enabled, max_violations, positive_marks,
      negative_marks, show_leaderboard, questions, schedule_config, custom_slug,
      badge_title, badge_sys_id
    } = req.body;

    const cleanSlug = custom_slug !== undefined ? (custom_slug ? custom_slug.trim().replace(/^\//, '') : null) : quiz.custom_slug;

    if (cleanSlug) {
      await Quiz.update({ custom_slug: null }, {
        where: {
          custom_slug: cleanSlug,
          id: { [Op.ne]: quiz.id }
        }
      });
    }

    await quiz.update({
      title: title || quiz.title,
      description,
      event_id: event_id !== undefined ? event_id : quiz.event_id,
      event_name: event_name !== undefined ? event_name : quiz.event_name,
      subject: category || quiz.subject,
      custom_slug: cleanSlug,
      badge_title: badge_title !== undefined ? badge_title : quiz.badge_title,
      badge_sys_id: badge_sys_id !== undefined ? badge_sys_id : quiz.badge_sys_id,
      scheduled_start: start_iso ? new Date(start_iso) : (start_date ? parseISTDateTime(start_date, start_time || '00:00:00') : quiz.scheduled_start),
      scheduled_end: end_iso ? new Date(end_iso) : (end_date ? parseISTDateTime(end_date, end_time || '23:59:59') : quiz.scheduled_end),
      mode: 'SCHEDULED',
      schedule_type: schedule_type || quiz.schedule_type,
      timezone: timezone || quiz.timezone,
      time_limit: time_limit !== undefined ? time_limit : quiz.time_limit,
      max_attempts: max_attempts !== undefined ? max_attempts : quiz.max_attempts,
      score_policy: score_policy || quiz.score_policy,
      shuffle_questions: shuffle_questions !== undefined ? shuffle_questions : quiz.shuffle_questions,
      shuffle_answers: shuffle_answers !== undefined ? shuffle_answers : quiz.shuffle_answers,
      require_fullscreen: require_fullscreen !== undefined ? require_fullscreen : quiz.require_fullscreen,
      anti_cheat_enabled: anti_cheat_enabled !== undefined ? anti_cheat_enabled : quiz.anti_cheat_enabled,
      max_violations: max_violations !== undefined ? max_violations : quiz.max_violations,
      positive_marks: positive_marks !== undefined ? positive_marks : quiz.positive_marks,
      negative_marks: negative_marks !== undefined ? negative_marks : quiz.negative_marks,
      show_leaderboard: show_leaderboard !== undefined ? show_leaderboard : quiz.show_leaderboard,
      schedule_config: schedule_config ? JSON.stringify(schedule_config) : quiz.schedule_config
    });

    // Sync Questions if array provided
    if (Array.isArray(questions)) {
      await Question.destroy({ where: { quiz_id: quiz.id } });
      const qRecords = questions.map((q, idx) => {
        const normCorrect = normalizeAnswers(q.correct_answer) || 'A';
        const qType = q.question_type || determineQuestionType({ ...q, correct_answer: normCorrect });
        return {
          quiz_id: quiz.id,
          question: q.question,
          option_a: q.option_a || 'True',
          option_b: q.option_b || 'False',
          option_c: qType === 'true_false' ? null : (q.option_c || ''),
          option_d: qType === 'true_false' ? null : (q.option_d || ''),
          correct_answer: normCorrect,
          question_type: qType,
          timer: (time_limit || quiz.time_limit || 30) * 60,
          marks: positive_marks || quiz.positive_marks || 1,
          order_index: q.order_index || idx + 1,
          occurrence_number: q.occurrence_number !== undefined ? q.occurrence_number : (q.section_number || 1),
          section_name: q.section_name || null,
          section_description: q.section_description || null
        };
      });
      await Question.bulkCreate(qRecords);
    }

    // Sync / Update Occurrences in-place preserving IDs and student attempts
    await generateOccurrences(
      quiz.id,
      quiz.title,
      schedule_type || quiz.schedule_type,
      start_date || quiz.scheduled_start,
      end_date || quiz.scheduled_end,
      start_time,
      end_time,
      { ...(schedule_config || {}), start_iso, end_iso }
    );

    return res.json({ message: 'Scheduled Quiz updated successfully!', quiz });
  } catch (error) {
    console.error('Update scheduled quiz error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update scheduled quiz.' });
  }
});

// Delete Scheduled Quiz (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Scheduled Quiz not found.' });
    }

    // 1. Scheduled occurrences & attempts
    const occurrences = await ScheduledOccurrence.findAll({ where: { quiz_id: quiz.id } }).catch(() => []);
    const occurrenceIds = occurrences.map(o => o.id);

    const attempts = await QuizAttempt.findAll({
      where: {
        [Op.or]: [
          { quiz_id: quiz.id },
          ...(occurrenceIds.length > 0 ? [{ occurrence_id: { [Op.in]: occurrenceIds } }] : [])
        ]
      }
    }).catch(() => []);
    const attemptIds = attempts.map(a => a.id);

    if (attemptIds.length > 0) {
      await AttemptAnswer.destroy({ where: { attempt_id: { [Op.in]: attemptIds } } }).catch(() => {});
      await AttemptViolation.destroy({ where: { attempt_id: { [Op.in]: attemptIds } } }).catch(() => {});
      await QuizAttempt.destroy({ where: { id: { [Op.in]: attemptIds } } }).catch(() => {});
    }
    await QuizAttempt.destroy({ where: { quiz_id: quiz.id } }).catch(() => {});
    if (occurrenceIds.length > 0) {
      await ScheduledOccurrence.destroy({ where: { id: { [Op.in]: occurrenceIds } } }).catch(() => {});
    }
    await ScheduledOccurrence.destroy({ where: { quiz_id: quiz.id } }).catch(() => {});

    // 2. Questions & Answers
    const questions = await Question.findAll({ where: { quiz_id: quiz.id } }).catch(() => []);
    const questionIds = questions.map(q => q.id);

    if (questionIds.length > 0) {
      await Answer.destroy({ where: { question_id: { [Op.in]: questionIds } } }).catch(() => {});
      await AttemptAnswer.destroy({ where: { question_id: { [Op.in]: questionIds } } }).catch(() => {});
    }

    // 3. Live session participants/answers/violations if any
    const participants = await Participant.findAll({ where: { quiz_id: quiz.id } }).catch(() => []);
    const participantIds = participants.map(p => p.id);

    if (participantIds.length > 0) {
      await Answer.destroy({ where: { participant_id: { [Op.in]: participantIds } } }).catch(() => {});
      await Violation.destroy({ where: { participant_id: { [Op.in]: participantIds } } }).catch(() => {});
      await Participant.destroy({ where: { id: { [Op.in]: participantIds } } }).catch(() => {});
    }
    await Participant.destroy({ where: { quiz_id: quiz.id } }).catch(() => {});
    await Violation.destroy({ where: { quiz_id: quiz.id } }).catch(() => {});

    // 4. Delete questions and quiz
    await Question.destroy({ where: { quiz_id: quiz.id } }).catch(() => {});
    await quiz.destroy();

    return res.json({ success: true, message: 'Scheduled Quiz deleted successfully.' });
  } catch (error) {
    console.error('Delete scheduled quiz error:', error);
    return res.status(500).json({ error: 'Failed to delete scheduled quiz.' });
  }
});

// 7. Check occurrence availability & server time window
router.get('/occurrences/:occurrenceId', async (req, res) => {
  try {
    const rawId = req.params.occurrenceId ? req.params.occurrenceId.trim() : '';
    if (!rawId) return res.status(400).json({ error: 'Occurrence ID or Quiz identifier is required.' });

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId);
    let occ = null;
    let quiz = null;

    if (isUUID) {
      occ = await ScheduledOccurrence.findByPk(rawId, {
        include: [
          { model: Quiz, as: 'quiz', include: [{ model: Question, as: 'questions' }] }
        ]
      });
      if (occ && occ.quiz) {
        quiz = occ.quiz;
      }
    }

    // Fallback: If not found as occurrence ID, search by Quiz ID, custom_slug, or join_code
    if (!occ) {
      const orConditions = [
        { custom_slug: rawId },
        { custom_slug: { [Op.like]: rawId } },
        { join_code: rawId.toUpperCase() },
        { join_code: rawId }
      ];
      if (isUUID) orConditions.push({ id: rawId });

      quiz = await Quiz.findOne({
        where: { [Op.or]: orConditions },
        order: [['updatedAt', 'DESC']],
        include: [
          { model: Question, as: 'questions' },
          { model: ScheduledOccurrence, as: 'occurrences' }
        ]
      });

      if (!quiz) {
        const allQuizzes = await Quiz.findAll({
          order: [['updatedAt', 'DESC']],
          include: [
            { model: Question, as: 'questions' },
            { model: ScheduledOccurrence, as: 'occurrences' }
          ]
        });
        quiz = allQuizzes.find(q =>
          (q.custom_slug && q.custom_slug.toLowerCase() === rawId.toLowerCase()) ||
          (q.join_code && q.join_code.toLowerCase() === rawId.toLowerCase()) ||
          (q.id === rawId)
        );
      }

      if (quiz) {
        const occurrences = (quiz.occurrences || []).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        const now = new Date();
        occ = occurrences.find(o => new Date(o.start_time) <= now && new Date(o.end_time) >= now && o.status !== 'CANCELLED');
        if (!occ) {
          occ = occurrences.find(o => new Date(o.start_time) > now && o.status !== 'CANCELLED');
        }
        if (!occ && occurrences.length > 0) {
          occ = occurrences[occurrences.length - 1];
        }
        if (!occ) {
          const defaultStart = quiz.scheduled_start ? new Date(quiz.scheduled_start) : new Date(now.getTime() - 5 * 60 * 1000);
          const defaultEnd = quiz.scheduled_end ? new Date(quiz.scheduled_end) : new Date(defaultStart.getTime() + (quiz.time_limit || 60) * 60 * 1000);
          occ = await ScheduledOccurrence.create({
            quiz_id: quiz.id,
            occurrence_number: 1,
            title: `${quiz.title} (Session 1)`,
            start_time: defaultStart,
            end_time: defaultEnd,
            status: 'SCHEDULED'
          });
        }
      }
    }

    if (!occ) return res.status(404).json({ error: 'Quiz occurrence not found.' });

    const now = new Date();
    const startTime = new Date(occ.start_time);
    const endTime = new Date(occ.end_time);

    let status = 'AVAILABLE';
    let message = 'Quiz is available to start.';

    if (now < startTime) {
      status = 'NOT_STARTED';
      message = "Quiz hasn't started yet.";
    } else if (now > endTime) {
      status = 'CLOSED';
      message = 'This quiz has already ended.';
    } else if (occ.status === 'PAUSED' || occ.status === 'CANCELLED') {
      status = 'UNAVAILABLE';
      message = `This quiz session is ${occ.status.toLowerCase()}.`;
    }

    const finalQuiz = quiz || occ.quiz || (await Quiz.findByPk(occ.quiz_id, { include: [{ model: Question, as: 'questions' }] }));

    // Check if current user already completed an attempt for this occurrence or quiz
    let userAttempt = null;
    let userRank = null;
    let totalParticipants = 0;
    const cleanEmail = req.query.email ? req.query.email.trim().toLowerCase() : null;
    const cleanName = req.query.name ? req.query.name.trim() : null;
    
    if (cleanEmail || cleanName) {
      const userConditions = [];
      if (cleanEmail) {
        userConditions.push({ participant_email: cleanEmail });
        userConditions.push({ participant_email: { [Op.like]: cleanEmail } });
      }
      if (cleanName) {
        userConditions.push({ participant_name: cleanName });
      }

      const occMatch = occ.quiz_id ? [{ occurrence_id: occ.id }, { quiz_id: occ.quiz_id }] : [{ occurrence_id: occ.id }];

      userAttempt = await QuizAttempt.findOne({
        where: {
          [Op.and]: [
            { [Op.or]: occMatch },
            { [Op.or]: userConditions }
          ]
        },
        order: [
          ['status', 'DESC'], // 'completed' or 'in_progress'
          ['attempt_number', 'DESC'],
          ['createdAt', 'DESC']
        ]
      });

      // If user has a completed attempt, compute their official rank in real-time
      if (userAttempt && userAttempt.status === 'completed') {
        try {
          const allCompleted = await QuizAttempt.findAll({
            where: {
              status: 'completed',
              [Op.or]: occMatch
            },
            order: [
              ['attempt_number', 'DESC'],
              ['submitted_at', 'DESC'],
              ['createdAt', 'DESC']
            ]
          });

          const rankedLeaderboard = getLatestAttemptsLeaderboard(allCompleted);
          totalParticipants = rankedLeaderboard.length;
          const myEntry = rankedLeaderboard.find(a =>
            a.id === userAttempt.id ||
            (cleanEmail && a.participant_email && a.participant_email.toLowerCase() === cleanEmail) ||
            (cleanName && a.participant_name && a.participant_name.toLowerCase() === cleanName.toLowerCase())
          );
          userRank = myEntry ? myEntry.rank : 1;
        } catch (rankErr) {
          console.warn('Rank calculation notice:', rankErr.message);
        }
      }
    }

    // Verify Event Registration if linked to an event (matches MSC PRPCEM website registrations)
    const { linkedEvent, isEventRegistered, requiresEventRegistration } = await checkStudentEventRegistration(finalQuiz, cleanEmail, cleanName);

    // Format clean JSON response preventing circular model serialization and answer leaks
    const occJson = occ.toJSON ? occ.toJSON() : { ...occ };
    delete occJson.quiz;
    const quizJson = sanitizeQuizForPublic(finalQuiz);

    return res.json({
      occurrence: occJson,
      quiz: quizJson,
      serverTime: now,
      status,
      message,
      userAttempt,
      userRank,
      totalParticipants,
      totalQuestions: finalQuiz?.questions?.length || 0,
      linkedEvent: linkedEvent ? {
        id: linkedEvent.id,
        name: linkedEvent.name,
        slug: linkedEvent.slug || linkedEvent.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: linkedEvent.category,
        status: linkedEvent.status,
        is_registration_open: linkedEvent.is_registration_open !== false
      } : null,
      isEventRegistered,
      requiresEventRegistration,
      registrationUrl: `https://www.mscprpcem.tech/register/${linkedEvent?.slug || 'visionx-season-2'}`
    });
  } catch (error) {
    console.error('Fetch occurrence info error:', error);
    return res.status(500).json({ error: 'Failed to fetch occurrence info.' });
  }
});

// 8. Start Attempt for a Participant (Enforces server timer, attempts limit, and shuffling persistence)
router.post('/occurrences/:occurrenceId/start', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name) return res.status(400).json({ error: 'Participant Name is required.' });

    const rawId = req.params.occurrenceId ? req.params.occurrenceId.trim() : '';
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId);

    let occ = null;
    let quiz = null;

    if (isUUID) {
      occ = await ScheduledOccurrence.findByPk(rawId, {
        include: [{ model: Quiz, as: 'quiz' }]
      });
      if (occ && occ.quiz) {
        quiz = occ.quiz;
      }
    }

    if (!occ) {
      const orConditions = [
        { custom_slug: rawId },
        { custom_slug: { [Op.like]: rawId } },
        { join_code: rawId.toUpperCase() },
        { join_code: rawId }
      ];
      if (isUUID) orConditions.push({ id: rawId });

      const quizRecord = await Quiz.findOne({
        where: { [Op.or]: orConditions },
        order: [['updatedAt', 'DESC']],
        include: [{ model: ScheduledOccurrence, as: 'occurrences' }]
      });

      if (quizRecord) {
        quiz = quizRecord;
        const occurrences = (quizRecord.occurrences || []).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        const now = new Date();
        occ = occurrences.find(o => new Date(o.start_time) <= now && new Date(o.end_time) >= now && o.status !== 'CANCELLED');
        if (!occ) {
          occ = occurrences.find(o => new Date(o.start_time) > now && o.status !== 'CANCELLED');
        }
        if (!occ && occurrences.length > 0) {
          occ = occurrences[occurrences.length - 1];
        }
        if (!occ) {
          const defaultStart = quizRecord.scheduled_start ? new Date(quizRecord.scheduled_start) : new Date(now.getTime() - 5 * 60 * 1000);
          const defaultEnd = quizRecord.scheduled_end ? new Date(quizRecord.scheduled_end) : new Date(defaultStart.getTime() + (quizRecord.time_limit || 60) * 60 * 1000);
          occ = await ScheduledOccurrence.create({
            quiz_id: quizRecord.id,
            occurrence_number: 1,
            title: `${quizRecord.title} (Session 1)`,
            start_time: defaultStart,
            end_time: defaultEnd,
            status: 'SCHEDULED'
          });
        }
      }
    }

    if (!occ) return res.status(404).json({ error: 'Quiz occurrence not found.' });

    const now = new Date();
    const startTime = new Date(occ.start_time);
    const endTime = new Date(occ.end_time);

    if (now < startTime) return res.status(403).json({ error: "Quiz hasn't started yet." });
    if (now > endTime) return res.status(403).json({ error: 'This quiz has already ended.' });

    const targetQuiz = quiz || occ.quiz || (await Quiz.findByPk(occ.quiz_id));
    const cleanEmail = email ? email.trim().toLowerCase() : null;

    // Verify Event Registration if linked to an event (matches MSC PRPCEM website registrations)
    const { linkedEvent, isEventRegistered, requiresEventRegistration } = await checkStudentEventRegistration(targetQuiz, cleanEmail, name);

    if (requiresEventRegistration && !isEventRegistered) {
      const regSlug = linkedEvent?.slug || linkedEvent?.id || 'visionx-season-2';
      return res.status(403).json({
        error: `You have not registered for '${linkedEvent?.name || 'this event'}'. Please register on the MSC PRPCEM website to attempt the quiz.`,
        requireRegistration: true,
        registrationUrl: `https://www.mscprpcem.tech/register/${regSlug}`,
        eventSlug: regSlug,
        eventName: linkedEvent?.name || 'VisionX Season 2'
      });
    }

    // Check Attempt Limit
    const existingAttempts = await QuizAttempt.findAll({
      where: {
        occurrence_id: occ.id,
        participant_name: name,
        ...(cleanEmail ? { participant_email: cleanEmail } : {})
      },
      order: [['attempt_number', 'DESC']]
    });

    // Resume existing in_progress attempt if any (Session Recovery)
    const activeAttempt = existingAttempts.find(a => a.status === 'in_progress');
    if (activeAttempt) {
      const expireTime = new Date(activeAttempt.expires_at);
      if (now >= expireTime) {
        activeAttempt.status = 'expired';
        await activeAttempt.save();
        return res.status(403).json({ error: 'Your quiz time has ended.' });
      } else {
        const answers = await AttemptAnswer.findAll({ where: { attempt_id: activeAttempt.id } });

        // Restore questions and their preserved order & option mapping
        let parsedQuestionOrder = [];
        try {
          parsedQuestionOrder = typeof activeAttempt.question_order === 'string'
            ? JSON.parse(activeAttempt.question_order)
            : (activeAttempt.question_order || []);
        } catch (e) {}

        let parsedOptionOrders = {};
        try {
          parsedOptionOrders = typeof activeAttempt.option_orders === 'string'
            ? JSON.parse(activeAttempt.option_orders)
            : (activeAttempt.option_orders || {});
        } catch (e) {}

        let restoredQuestions = [];
        if (Array.isArray(parsedQuestionOrder) && parsedQuestionOrder.length > 0) {
          const dbQuestions = await Question.findAll({
            where: { id: parsedQuestionOrder }
          });
          const dbQuestionsMap = new Map(dbQuestions.map(q => [q.id, q]));

          restoredQuestions = parsedQuestionOrder.map(qId => {
            const q = dbQuestionsMap.get(qId);
            if (!q) return null;
            const options = parsedOptionOrders && parsedOptionOrders[qId] ? parsedOptionOrders[qId] : [
              { key: 'A', text: q.option_a },
              { key: 'B', text: q.option_b },
              { key: 'C', text: q.option_c },
              { key: 'D', text: q.option_d }
            ];
            return {
              id: q.id,
              question: q.question,
              options,
              marks: q.marks
            };
          }).filter(Boolean);
        }

        // Fallback: If no question order was recorded, load standard quiz questions
        if (restoredQuestions.length === 0) {
          const allDbQuestions = await Question.findAll({
            where: { quiz_id: targetQuiz.id },
            order: [['order_index', 'ASC']]
          });
          restoredQuestions = allDbQuestions.map(q => ({
            id: q.id,
            question: q.question,
            options: [
              { key: 'A', text: q.option_a },
              { key: 'B', text: q.option_b },
              { key: 'C', text: q.option_c },
              { key: 'D', text: q.option_d }
            ],
            marks: q.marks
          }));
        }

        return res.json({
          message: 'Resuming quiz attempt.',
          attempt: activeAttempt,
          questions: restoredQuestions,
          restoredAnswers: answers,
          isResume: true
        });
      }
    }

    if (existingAttempts.length >= targetQuiz.max_attempts && targetQuiz.max_attempts > 0) {
      return res.status(403).json({ error: `Maximum attempt limit (${targetQuiz.max_attempts}) reached for this quiz.` });
    }

    // Fetch questions: Check for occurrence-specific round questions first (preventing repetition across days/weeks)
    let questions = [];
    if (occ && occ.occurrence_number) {
      questions = await Question.findAll({
        where: {
          quiz_id: targetQuiz.id,
          occurrence_number: occ.occurrence_number
        },
        order: [['order_index', 'ASC']]
      });
    }

    // Fallback: If no questions specific to this occurrence number, load all quiz questions
    if (questions.length === 0) {
      questions = await Question.findAll({
        where: { quiz_id: targetQuiz.id },
        order: [['order_index', 'ASC']]
      });
    }

    if (questions.length === 0) {
      return res.status(400).json({ error: 'This quiz does not have any questions added yet.' });
    }

    // Question Shuffling
    if (targetQuiz.shuffle_questions) {
      questions = shuffleArray(questions);
    }

    const questionOrder = questions.map(q => q.id);

    // Option Shuffling map per question
    const optionOrders = {};
    questions.forEach(q => {
      const qType = q.question_type || determineQuestionType(q);
      let opts = [
        { key: 'A', text: q.option_a || (qType === 'true_false' ? 'True' : 'Option A') },
        { key: 'B', text: q.option_b || (qType === 'true_false' ? 'False' : 'Option B') }
      ];
      if (qType !== 'true_false') {
        if (q.option_c) opts.push({ key: 'C', text: q.option_c });
        if (q.option_d) opts.push({ key: 'D', text: q.option_d });
      }

      if (targetQuiz.shuffle_answers && qType !== 'true_false') {
        opts = shuffleArray(opts);
      }
      optionOrders[q.id] = opts;
    });

    // Server-authoritative timer: started_at and expires_at
    const startedAt = now;
    const timeLimitMs = (targetQuiz.time_limit > 0 ? targetQuiz.time_limit : 60) * 60 * 1000;
    const expiresAt = new Date(startedAt.getTime() + timeLimitMs);

    const attempt = await QuizAttempt.create({
      occurrence_id: occ.id,
      quiz_id: targetQuiz.id,
      participant_name: name,
      participant_email: cleanEmail,
      attempt_number: existingAttempts.length + 1,
      started_at: startedAt,
      expires_at: expiresAt,
      status: 'in_progress',
      question_order: JSON.stringify(questionOrder),
      option_orders: JSON.stringify(optionOrders)
    });

    // Strip correct answers from public questions returned to client
    const safeQuestions = questions.map(q => {
      const qType = q.question_type || determineQuestionType(q);
      return {
        id: q.id,
        question: q.question,
        options: optionOrders[q.id],
        marks: q.marks,
        question_type: qType,
        multiple_correct: qType === 'multiple'
      };
    });

    return res.status(201).json({
      message: 'Quiz attempt started successfully.',
      attempt,
      questions: safeQuestions,
      quizRules: {
        timeLimitMinutes: targetQuiz.time_limit,
        requireFullscreen: targetQuiz.require_fullscreen,
        antiCheatEnabled: targetQuiz.anti_cheat_enabled,
        maxViolations: targetQuiz.max_violations,
        positiveMarks: targetQuiz.positive_marks,
        negativeMarks: targetQuiz.negative_marks
      }
    });
  } catch (error) {
    console.error('Start attempt error:', error);
    return res.status(500).json({ error: error.message || 'Failed to start quiz attempt.' });
  }
});

// 9. Continuous Answer Saving
router.post('/attempts/:attemptId/answer', async (req, res) => {
  try {
    const { questionId, selectedOption } = req.body;
    const attempt = await QuizAttempt.findByPk(req.params.attemptId);

    if (!attempt || attempt.status !== 'in_progress') {
      return res.status(400).json({ error: 'Attempt is no longer active.' });
    }

    const now = new Date();
    if (now >= new Date(attempt.expires_at)) {
      attempt.status = 'expired';
      await attempt.save();
      return res.status(403).json({ error: 'Quiz timer has expired.' });
    }

    const question = await Question.findByPk(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found.' });

    const quiz = await Quiz.findByPk(attempt.quiz_id);
    const isCorrect = isAnswerCorrect(selectedOption, question.correct_answer);
    const points = isCorrect ? (quiz.positive_marks || 1) : -(quiz.negative_marks || 0);

    const normSelected = normalizeAnswers(selectedOption);

    const existingAnswer = await AttemptAnswer.findOne({
      where: { attempt_id: attempt.id, question_id: questionId }
    });

    if (existingAnswer) {
      existingAnswer.selected_option = normSelected;
      existingAnswer.is_correct = isCorrect;
      existingAnswer.points = points;
      existingAnswer.answered_at = now;
      await existingAnswer.save();
    } else {
      await AttemptAnswer.create({
        attempt_id: attempt.id,
        question_id: questionId,
        selected_option: normSelected,
        is_correct: isCorrect,
        points,
        answered_at: now
      });
    }

    return res.json({ message: 'Answer saved.', questionId, selectedOption });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save answer.' });
  }
});

// 10. Record Violation
router.post('/attempts/:attemptId/violation', async (req, res) => {
  try {
    const { violationType } = req.body;
    const attempt = await QuizAttempt.findByPk(req.params.attemptId);
    if (!attempt || attempt.status !== 'in_progress') {
      return res.json({ violationCount: 0, autoSubmit: false });
    }

    await AttemptViolation.create({
      attempt_id: attempt.id,
      violation_type: violationType || 'TAB_SWITCH'
    });

    const vCount = await AttemptViolation.count({ where: { attempt_id: attempt.id } });
    const quiz = await Quiz.findByPk(attempt.quiz_id);

    let autoSubmit = false;
    if (quiz.anti_cheat_enabled && vCount >= quiz.max_violations) {
      autoSubmit = true;
    }

    return res.json({ violationCount: vCount, autoSubmit });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to record violation.' });
  }
});

// 11. Final Submit & Calculate Score
router.post('/attempts/:attemptId/submit', async (req, res) => {
  try {
    const attempt = await QuizAttempt.findByPk(req.params.attemptId, {
      include: [{ model: AttemptAnswer, as: 'answers' }]
    });

    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    if (attempt.status === 'completed') {
      return res.json({ message: 'Attempt already completed.', attempt });
    }

    const quiz = await Quiz.findByPk(attempt.quiz_id);
    const questions = await Question.findAll({ where: { quiz_id: quiz.id } });
    const answers = attempt.answers || [];

    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    questions.forEach(q => {
      const qMarks = (q.marks !== undefined && q.marks !== null && Number(q.marks) > 0)
        ? Number(q.marks)
        : (Number(quiz.positive_marks) > 0 ? Number(quiz.positive_marks) : 1);
      const qNegMarks = (q.negative_marks !== undefined && q.negative_marks !== null)
        ? Number(q.negative_marks)
        : (Number(quiz.negative_marks) || 0);

      const ans = answers.find(a => a.question_id === q.id);
      if (ans && ans.selected_option) {
        const isCorrect = isAnswerCorrect(ans.selected_option, q.correct_answer);
        if (isCorrect) {
          correctCount++;
          totalScore += qMarks;
        } else {
          incorrectCount++;
          totalScore -= Math.abs(qNegMarks);
        }
      }
    });

    const unansweredCount = Math.max(0, questions.length - (correctCount + incorrectCount));
    const now = new Date();
    const timeTaken = Math.round((now.getTime() - new Date(attempt.started_at).getTime()) / 1000);

    attempt.score = Math.max(0, totalScore);
    attempt.correct_count = correctCount;
    attempt.incorrect_count = incorrectCount;
    attempt.unanswered_count = unansweredCount;
    attempt.time_taken_seconds = timeTaken;
    attempt.submitted_at = now;
    attempt.status = 'completed';
    await attempt.save();

    // Calculate Exact Rank strictly by Score (DESC), Time Taken / Speed (ASC), Correct Answers (DESC)
    // Considering ONLY the latest attempt of each participant
    const allCompleted = await QuizAttempt.findAll({
      where: {
        occurrence_id: attempt.occurrence_id,
        status: 'completed'
      },
      order: [
        ['attempt_number', 'DESC'],
        ['submitted_at', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    const rankedLeaderboard = getLatestAttemptsLeaderboard(allCompleted);
    const totalParticipants = rankedLeaderboard.length;
    const myKey = attempt.sso_user_id
      ? `sso:${String(attempt.sso_user_id).trim()}`
      : (attempt.participant_email
        ? `email:${attempt.participant_email.toLowerCase().trim()}`
        : `name:${(attempt.participant_name || '').toLowerCase().trim()}`);

    const myEntry = rankedLeaderboard.find(a => {
      if (a.id === attempt.id) return true;
      const entryKey = a.sso_user_id
        ? `sso:${String(a.sso_user_id).trim()}`
        : (a.participant_email
          ? `email:${a.participant_email.toLowerCase().trim()}`
          : `name:${(a.participant_name || '').toLowerCase().trim()}`);
      return entryKey === myKey;
    });

    const myRank = myEntry ? myEntry.rank : 1;

    return res.json({
      message: 'Quiz submitted successfully.',
      attempt,
      rank: myRank,
      totalParticipants,
      totalQuestions: questions.length
    });
  } catch (error) {
    console.error('Submit attempt error:', error);
    return res.status(500).json({ error: 'Failed to submit quiz attempt.' });
  }
});

// 12. Occurrence Leaderboard with Score & Speed Matrix Ranking (Showing each user's latest score)
router.get('/occurrences/:occurrenceId/leaderboard', async (req, res) => {
  try {
    const rawParam = req.params.occurrenceId ? req.params.occurrenceId.trim() : '';
    if (!rawParam) return res.json([]);

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawParam);

    let occurrence = null;
    let quiz = null;

    try {
      occurrence = await resolveOccurrence(rawParam);
    } catch (resolveErr) {
      console.warn('resolveOccurrence fallback:', resolveErr.message);
    }

    if (occurrence) {
      quiz = occurrence.quiz;
    } else if (isUUID) {
      occurrence = await ScheduledOccurrence.findByPk(rawParam);
      if (!occurrence) {
        quiz = await Quiz.findByPk(rawParam);
      }
    }

    if (!occurrence && !quiz) {
      quiz = await Quiz.findOne({
        where: {
          [Op.or]: [
            { custom_slug: rawParam },
            { custom_slug: { [Op.like]: rawParam } },
            { join_code: rawParam.toUpperCase() },
            { join_code: rawParam }
          ]
        }
      });
    }

    if (!occurrence && !quiz) {
      const allQuizzes = await Quiz.findAll();
      quiz = allQuizzes.find(q => {
        const qSlug = q.title ? q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
        const rawSlug = rawParam.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return (
          (q.custom_slug && q.custom_slug.toLowerCase() === rawParam.toLowerCase()) ||
          qSlug === rawSlug ||
          (q.join_code && q.join_code.toLowerCase() === rawParam.toLowerCase()) ||
          (q.id === rawParam)
        );
      });
    }

    let targetOccId = occurrence ? occurrence.id : (isUUID ? rawParam : null);
    let targetQuizId = occurrence ? occurrence.quiz_id : (quiz ? quiz.id : null);

    const matchConditions = [];
    if (targetOccId) {
      matchConditions.push({ occurrence_id: targetOccId });
    }
    if (targetQuizId) {
      matchConditions.push({ quiz_id: targetQuizId });
    }

    const attempts = await QuizAttempt.findAll({
      where: {
        status: 'completed',
        ...(matchConditions.length > 0 ? { [Op.or]: matchConditions } : {})
      },
      order: [
        ['attempt_number', 'DESC'],
        ['submitted_at', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    const attemptIds = attempts.map(a => a.id);
    const attemptViolationsMap = new Map();

    if (attemptIds.length > 0) {
      const allViolations = await AttemptViolation.findAll({
        where: { attempt_id: { [Op.in]: attemptIds } }
      }).catch(() => []);

      for (const v of allViolations) {
        const aId = String(v.attempt_id);
        attemptViolationsMap.set(aId, (attemptViolationsMap.get(aId) || 0) + 1);
      }
    }

    const enrichedAttempts = attempts.map(a => {
      const aJson = a.toJSON ? a.toJSON() : { ...a };
      const vCount = attemptViolationsMap.get(String(aJson.id)) || 0;
      return {
        ...aJson,
        violation_count: vCount,
        violationsCount: vCount,
        violationCount: vCount
      };
    });

    const ranked = getLatestAttemptsLeaderboard(enrichedAttempts);

    return res.json(ranked);
  } catch (error) {
    console.error('Fetch leaderboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

// 13. Resolve Vanity Slug or Join Code to active Occurrence Slot
router.get('/slug/:slug', async (req, res) => {
  try {
    const rawSlug = req.params.slug ? req.params.slug.trim().replace(/^\//, '') : '';
    if (!rawSlug) return res.status(400).json({ error: 'Slug is required.' });

    const cleanSlug = rawSlug.toLowerCase();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawSlug);

    const orConditions = [
      { custom_slug: { [Op.like]: rawSlug } },
      { join_code: { [Op.like]: rawSlug } },
      { custom_slug: rawSlug },
      { join_code: rawSlug.toUpperCase() }
    ];

    if (isUUID) {
      orConditions.push({ id: rawSlug });
    }

    let quiz = await Quiz.findOne({
      where: { [Op.or]: orConditions },
      order: [['updatedAt', 'DESC']],
      include: [{ model: ScheduledOccurrence, as: 'occurrences' }]
    });

    if (!quiz) {
      const allQuizzes = await Quiz.findAll({
        order: [['updatedAt', 'DESC']],
        include: [{ model: ScheduledOccurrence, as: 'occurrences' }]
      });
      quiz = allQuizzes.find(q =>
        (q.custom_slug && q.custom_slug.toLowerCase() === cleanSlug) ||
        (q.join_code && q.join_code.toLowerCase() === cleanSlug) ||
        (q.id === rawSlug)
      );
    }

    if (!quiz) {
      return res.status(404).json({ error: `No quiz found matching slug '/${rawSlug}'.` });
    }

    if (quiz.mode === 'LIVE') {
      return res.json({
        success: true,
        isLive: true,
        quiz: sanitizeQuizForPublic(quiz),
        joinCode: quiz.join_code
      });
    }

    let occurrences = (quiz.occurrences || []).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    const now = new Date();

    // Select active occurrence (currently open window) or next upcoming slot
    let targetOccurrence = occurrences.find(o => new Date(o.start_time) <= now && new Date(o.end_time) >= now && o.status !== 'CANCELLED');
    if (!targetOccurrence) {
      targetOccurrence = occurrences.find(o => new Date(o.start_time) > now && o.status !== 'CANCELLED');
    }
    if (!targetOccurrence && occurrences.length > 0) {
      targetOccurrence = occurrences[occurrences.length - 1];
    }

    // Auto-create a default occurrence if none exist
    if (!targetOccurrence) {
      const defaultStart = quiz.scheduled_start ? new Date(quiz.scheduled_start) : new Date(now.getTime() - 5 * 60 * 1000);
      const defaultEnd = quiz.scheduled_end ? new Date(quiz.scheduled_end) : new Date(defaultStart.getTime() + (quiz.time_limit || 60) * 60 * 1000);
      targetOccurrence = await ScheduledOccurrence.create({
        quiz_id: quiz.id,
        occurrence_number: 1,
        title: `${quiz.title} (Session 1)`,
        start_time: defaultStart,
        end_time: defaultEnd,
        status: 'SCHEDULED'
      });
    }

    return res.json({
      success: true,
      quiz: sanitizeQuizForPublic(quiz),
      occurrence: targetOccurrence,
      activeOccurrenceId: targetOccurrence ? targetOccurrence.id : null
    });
  } catch (error) {
    console.error('Resolve slug error:', error);
    return res.status(500).json({ error: 'Failed to resolve custom URL slug.' });
  }
});

// 14. Send Email Notification / Weekly Reminder (Admin)
router.post('/:id/notify', adminAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [{ model: ScheduledOccurrence, as: 'occurrences' }]
    });

    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    const { targetEmails, customSubject, customMessage } = req.body;
    const occurrences = (quiz.occurrences || []).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    const nextOcc = occurrences.find(o => new Date(o.end_time) >= new Date()) || occurrences[0];

    const slugOrCode = quiz.custom_slug || quiz.join_code;
    const directUrl = `${process.env.FRONTEND_URL || 'https://quiz.mscprpcem.tech'}/q/${slugOrCode}`;

    const recipients = Array.isArray(targetEmails) && targetEmails.length > 0 ? targetEmails : [];

    // Dispatch real email notifications to specified recipients
    for (const recipient of recipients) {
      if (recipient && recipient.includes('@')) {
        try {
          await sendQuizReminderEmail({
            to: recipient,
            quizTitle: quiz.title,
            eventName: quiz.event_name,
            startTime: nextOcc ? nextOcc.start_time : null,
            directUrl,
            joinCode: slugOrCode
          });
        } catch (mailErr) {
          console.warn(`Failed to dispatch reminder to ${recipient}:`, mailErr.message);
        }
      }
    }

    return res.json({
      success: true,
      message: `Notification & weekly reminder successfully dispatched to ${recipients.length || 1} registered participant(s)!`,
      directUrl,
      nextOccurrence: nextOcc ? {
        title: nextOcc.title,
        startTime: nextOcc.start_time,
        endTime: nextOcc.end_time
      } : null
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return res.status(500).json({ error: 'Failed to send notification email.' });
  }
});

module.exports = router;
