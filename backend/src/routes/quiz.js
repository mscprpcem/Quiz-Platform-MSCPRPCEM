const express = require('express');
const router = express.Router();
const multer = require('multer');
const ExcelJS = require('exceljs');
const axios = require('axios');
const { Readable } = require('stream');
const { Quiz, Question, Participant, QuizAttempt, Answer, Violation, AttemptViolation, AttemptAnswer, ScheduledOccurrence } = require('../models');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');
const { normalizeAnswers, determineQuestionType } = require('../utils/answerUtils');
const { getInjectedScoresForQuiz } = require('../services/injectedScoresService');

// Helper: Full Cascade Deletion for any Quiz (Live or Scheduled)
const deleteQuizWithFullCascade = async (quizId) => {
  const quiz = await Quiz.findByPk(quizId);
  if (!quiz) return false;

  // 1. Scheduled Quizzes Data
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

  // 3. Live Quiz Participants, Answers & Violations
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
  return true;
};


// Multer memory storage configuration for Excel and CSV uploads (5 MB max limit)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max file upload to prevent memory exhaustion
  },
  fileFilter: (req, file, cb) => {
    const isExcelOrCsv =
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/csv' ||
      file.mimetype === 'text/plain' ||
      file.mimetype === 'application/octet-stream' ||
      /\.(xlsx|xls|csv)$/i.test(file.originalname || '');

    if (isExcelOrCsv) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed'));
    }
  }
});

// Helper: Generate Unique Join Code
const generateJoinCode = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const existing = await Quiz.findOne({ where: { join_code: code } });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

// ----------------------------------------------------
// PUBLIC ROUTES (No Auth Required)
// ----------------------------------------------------

// Get All Public / Active / Scheduled Quizzes
router.get('/public', async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({
      order: [['createdAt', 'DESC']]
    });

    const now = new Date();
    const quizzesWithCounts = await Promise.all(
      quizzes.map(async (quiz) => {
        const questionCount = await Question.count({ where: { quiz_id: quiz.id } });
        const [liveParticipantCount, attemptCount, liveViolationCount, attempts] = await Promise.all([
          Participant.count({ where: { quiz_id: quiz.id } }),
          QuizAttempt.count({ where: { quiz_id: quiz.id } }),
          Violation.count({ where: { quiz_id: quiz.id } }).catch(() => 0),
          QuizAttempt.findAll({ where: { quiz_id: quiz.id }, attributes: ['id'] }).catch(() => [])
        ]);
        const injectedCount = getInjectedScoresForQuiz(quiz.id, quiz.title).length;
        const participantCount = liveParticipantCount + attemptCount + injectedCount;

        const attemptIds = attempts.map(a => a.id);
        const attemptViolationCount = attemptIds.length > 0
          ? await AttemptViolation.count({ where: { attempt_id: { [Op.in]: attemptIds } } }).catch(() => 0)
          : 0;
        const violationCount = liveViolationCount + attemptViolationCount;

        let computedStatus = quiz.status;
        const eTime = quiz.scheduled_end ? new Date(quiz.scheduled_end) : null;
        if (eTime && now > eTime) {
          computedStatus = participantCount > 0 ? 'completed' : 'expired';
          if (quiz.status !== computedStatus) {
            await quiz.update({ status: computedStatus }).catch(() => {});
          }
        }

        return {
          id: quiz.id,
          title: quiz.title,
          custom_slug: quiz.custom_slug,
          slug: quiz.custom_slug || (quiz.title ? quiz.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : quiz.join_code),
          event_name: quiz.event_name,
          subject: quiz.subject || 'DBMS',
          description: quiz.description,
          join_code: quiz.join_code,
          status: computedStatus,
          mode: quiz.mode,
          scheduled_start: quiz.scheduled_start,
          scheduled_end: quiz.scheduled_end,
          createdAt: quiz.createdAt,
          questionCount,
          participantCount,
          violationCount
        };
      })
    );

    return res.json(quizzesWithCounts);
  } catch (error) {
    console.error('Fetch public quizzes error:', error);
    return res.status(500).json({ error: 'Server error fetching public quizzes' });
  }
});

// Create 1-click Instant DBMS Preset Quiz (Admin)
router.post('/preset/dbms', authMiddleware, async (req, res) => {
  try {
    const { title, event_name, scheduled_start, scheduled_end } = req.body;

    const join_code = await generateJoinCode();

    // Default 1-day schedule if not provided
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const quiz = await Quiz.create({
      title: title || 'Database Management Systems (DBMS) Challenge',
      event_name: event_name || 'MSC DBMS Special Quiz',
      subject: 'DBMS',
      description: 'Comprehensive quiz covering SQL, Normalization, ACID transactions, Indexing, and Relational Algebra.',
      join_code,
      status: 'draft',
      scheduled_start: scheduled_start || now,
      scheduled_end: scheduled_end || endOfDay
    });

    const defaultQuestions = [
      {
        quiz_id: quiz.id,
        question: 'Which SQL command is used to retrieve data from a relational database table?',
        option_a: 'UPDATE',
        option_b: 'SELECT',
        option_c: 'INSERT',
        option_d: 'DELETE',
        correct_answer: 'B',
        timer: 30,
        marks: 500,
        order_index: 1
      },
      {
        quiz_id: quiz.id,
        question: 'In database normalization, which Normal Form eliminates partial dependencies on a composite primary key?',
        option_a: '1NF (First Normal Form)',
        option_b: '2NF (Second Normal Form)',
        option_c: '3NF (Third Normal Form)',
        option_d: 'BCNF (Boyce-Codd Normal Form)',
        correct_answer: 'B',
        timer: 30,
        marks: 500,
        order_index: 2
      },
      {
        quiz_id: quiz.id,
        question: 'Which ACID property guarantees that once a transaction completes successfully, changes are permanently saved?',
        option_a: 'Atomicity',
        option_b: 'Consistency',
        option_c: 'Isolation',
        option_d: 'Durability',
        correct_answer: 'D',
        timer: 30,
        marks: 500,
        order_index: 3
      },
      {
        quiz_id: quiz.id,
        question: 'Which type of SQL JOIN returns all records from the left table and matching records from the right table?',
        option_a: 'INNER JOIN',
        option_b: 'LEFT (OUTER) JOIN',
        option_c: 'RIGHT (OUTER) JOIN',
        option_d: 'FULL (OUTER) JOIN',
        correct_answer: 'B',
        timer: 30,
        marks: 500,
        order_index: 4
      },
      {
        quiz_id: quiz.id,
        question: 'What is the primary data structure commonly used by relational databases for table indexing?',
        option_a: 'Binary Search Tree',
        option_b: 'B-Tree / B+ Tree',
        option_c: 'Linked List',
        option_d: 'Min-Heap',
        correct_answer: 'B',
        timer: 30,
        marks: 500,
        order_index: 5
      }
    ];

    await Question.bulkCreate(defaultQuestions);

    return res.status(201).json({ message: 'Instant DBMS quiz created successfully!', quiz });
  } catch (error) {
    console.error('Create DBMS preset quiz error:', error);
    return res.status(500).json({ error: 'Server error creating DBMS preset quiz' });
  }
});

// Get all quizzes (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { mode, all } = req.query;
    const where = {};

    if (mode) {
      if (mode.toUpperCase() === 'LIVE') {
        where[Op.or] = [
          { mode: 'LIVE' },
          { mode: null },
          { mode: { [Op.ne]: 'SCHEDULED' } }
        ];
      } else {
        where.mode = mode;
      }
    } else if (all !== 'true') {
      where[Op.or] = [
        { mode: 'LIVE' },
        { mode: null },
        { mode: { [Op.ne]: 'SCHEDULED' } }
      ];
    }

    const quizzes = await Quiz.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    const now = new Date();
    // Fetch question, participant, and violation counts for each quiz
    const quizzesWithCounts = await Promise.all(
      quizzes.map(async (quiz) => {
        const questionCount = await Question.count({ where: { quiz_id: quiz.id } });
        const [liveParticipantCount, attemptCount, liveViolationCount, attempts] = await Promise.all([
          Participant.count({ where: { quiz_id: quiz.id } }),
          QuizAttempt.count({ where: { quiz_id: quiz.id } }),
          Violation.count({ where: { quiz_id: quiz.id } }).catch(() => 0),
          QuizAttempt.findAll({ where: { quiz_id: quiz.id }, attributes: ['id'] }).catch(() => [])
        ]);
        const injectedCount = getInjectedScoresForQuiz(quiz.id, quiz.title).length;
        const participantCount = liveParticipantCount + attemptCount + injectedCount;

        const attemptIds = attempts.map(a => a.id);
        const attemptViolationCount = attemptIds.length > 0
          ? await AttemptViolation.count({ where: { attempt_id: { [Op.in]: attemptIds } } }).catch(() => 0)
          : 0;
        const violationCount = liveViolationCount + attemptViolationCount;

        let computedStatus = quiz.status;
        const eTime = quiz.scheduled_end ? new Date(quiz.scheduled_end) : null;
        if (eTime && now > eTime) {
          computedStatus = participantCount > 0 ? 'completed' : 'expired';
          if (quiz.status !== computedStatus) {
            await quiz.update({ status: computedStatus }).catch(() => {});
          }
        }

        return {
          ...quiz.toJSON(),
          status: computedStatus,
          questionCount,
          participantCount,
          violationCount
        };
      })
    );

    return res.json(quizzesWithCounts);
  } catch (error) {
    console.error('Fetch quizzes error:', error);
    return res.status(500).json({ error: 'Server error fetching quizzes' });
  }
});

// Get quiz details (including questions)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.id || req.params.id, {
      include: [
        {
          model: Question,
          as: 'questions'
        }
      ],
      order: [[{ model: Question, as: 'questions' }, 'order_index', 'ASC']]
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    return res.json(quiz);
  } catch (error) {
    console.error('Fetch quiz error:', error);
    return res.status(500).json({ error: 'Server error fetching quiz' });
  }
});

// Delete quiz (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const success = await deleteQuizWithFullCascade(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    return res.json({ success: true, message: 'Quiz and all associated sessions deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    return res.status(500).json({ error: 'Server error deleting quiz' });
  }
});

// Create new quiz
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, event_id, event_name, subject, description, scheduled_start, scheduled_end, custom_slug, badge_title, badge_sys_id } = req.body;

    if (!title || !event_name) {
      return res.status(400).json({ error: 'Title and event name are required' });
    }

    const join_code = await generateJoinCode();
    const cleanSlug = custom_slug ? custom_slug.trim().replace(/^\//, '') : null;

    if (cleanSlug) {
      await Quiz.update({ custom_slug: null }, { where: { custom_slug: cleanSlug } });
    }

    const quiz = await Quiz.create({
      title,
      event_id: event_id || null,
      event_name,
      subject: subject || 'DBMS',
      description,
      join_code,
      custom_slug: cleanSlug,
      status: 'draft',
      badge_title: badge_title || null,
      badge_sys_id: badge_sys_id || null,
      scheduled_start: scheduled_start || null,
      scheduled_end: scheduled_end || null
    });

    return res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    return res.status(500).json({ error: 'Server error creating quiz' });
  }
});

// Update quiz details
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, event_id, event_name, subject, description, scheduled_start, scheduled_end, custom_slug, badge_title, badge_sys_id, difficulty } = req.body;
    const quiz = await Quiz.findByPk(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

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
      event_id: event_id !== undefined ? event_id : quiz.event_id,
      event_name: event_name || quiz.event_name,
      subject: subject || quiz.subject,
      difficulty: difficulty || quiz.difficulty,
      custom_slug: cleanSlug,
      badge_title: badge_title !== undefined ? (badge_title || null) : quiz.badge_title,
      badge_sys_id: badge_sys_id !== undefined ? (badge_sys_id || null) : quiz.badge_sys_id,
      description: description !== undefined ? description : quiz.description,
      scheduled_start: scheduled_start !== undefined ? (scheduled_start || null) : quiz.scheduled_start,
      scheduled_end: scheduled_end !== undefined ? (scheduled_end || null) : quiz.scheduled_end
    });

    // Synchronize existing occurrences if schedule times were updated
    if (scheduled_start || scheduled_end) {
      const occurrences = await ScheduledOccurrence.findAll({ where: { quiz_id: quiz.id } });
      for (const occ of occurrences) {
        await occ.update({
          start_time: scheduled_start ? new Date(scheduled_start) : occ.start_time,
          end_time: scheduled_end ? new Date(scheduled_end) : occ.end_time
        });
      }
    }

    return res.json(quiz);
  } catch (error) {
    console.error('Update quiz error:', error);
    return res.status(500).json({ error: 'Server error updating quiz' });
  }
});

// Publish quiz (changes status from 'draft' to 'waiting_lobby')
router.put('/:id/publish', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questionCount = await Question.count({ where: { quiz_id: quiz.id } });
    if (questionCount === 0) {
      return res.status(400).json({ error: 'Cannot publish a quiz with no questions. Please add at least 1 question first.' });
    }

    await quiz.update({ status: 'waiting_lobby' });
    return res.json({ message: 'Quiz published successfully!', quiz });
  } catch (error) {
    console.error('Publish quiz error:', error);
    return res.status(500).json({ error: 'Server error publishing quiz' });
  }
});



// ----------------------------------------------------
// QUESTION ROUTES
// ----------------------------------------------------

// Add a question manually
router.post('/:id/questions', authMiddleware, async (req, res) => {
  try {
    const { question, option_a, option_b, option_c, option_d, correct_answer, timer, marks, difficulty, question_type } = req.body;
    const quiz_id = req.params.id;

    const quiz = await Quiz.findByPk(quiz_id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (!question || !option_a || !option_b || !correct_answer) {
      return res.status(400).json({ error: 'Question text, Option A, Option B, and Correct Answer are required' });
    }

    const normCorrect = normalizeAnswers(correct_answer);
    if (!normCorrect) {
      return res.status(400).json({ error: 'Valid correct answer is required (e.g. A, B, C, D or combination like A,C)' });
    }

    const qType = question_type || determineQuestionType({ option_a, option_b, option_c, option_d, correct_answer: normCorrect });

    if (qType === 'true_false') {
      if (!['A', 'B'].includes(normCorrect)) {
        return res.status(400).json({ error: 'True/False correct answer must be True (A) or False (B)' });
      }
    } else if (qType === 'single') {
      if (!['A', 'B', 'C', 'D'].includes(normCorrect)) {
        return res.status(400).json({ error: 'Single choice correct answer must be A, B, C, or D' });
      }
    }

    // Get current max order index
    const maxOrder = await Question.max('order_index', { where: { quiz_id } });
    const order_index = (maxOrder || 0) + 1;

    const newQuestion = await Question.create({
      quiz_id,
      question,
      option_a: option_a || 'True',
      option_b: option_b || 'False',
      option_c: qType === 'true_false' ? '' : (option_c || ''),
      option_d: qType === 'true_false' ? '' : (option_d || ''),
      correct_answer: normCorrect,
      question_type: qType,
      timer: timer || 30,
      marks: marks || 500,
      difficulty: difficulty || quiz.difficulty || 'Intermediate',
      order_index
    });

    return res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Add question error:', error);
    return res.status(500).json({ error: 'Server error adding question' });
  }
});

// Update a question
router.put('/questions/:id', authMiddleware, async (req, res) => {
  try {
    const { question, option_a, option_b, option_c, option_d, correct_answer, timer, marks, difficulty, question_type } = req.body;
    const existingQuestion = await Question.findByPk(req.params.id);

    if (!existingQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    let normCorrect = existingQuestion.correct_answer;
    if (correct_answer) {
      normCorrect = normalizeAnswers(correct_answer);
      if (!normCorrect) {
        return res.status(400).json({ error: 'Valid correct answer is required (e.g. A, B, C, D or combination like A,C)' });
      }
    }

    const qType = question_type || determineQuestionType({
      option_a: option_a || existingQuestion.option_a,
      option_b: option_b || existingQuestion.option_b,
      option_c: option_c !== undefined ? option_c : existingQuestion.option_c,
      option_d: option_d !== undefined ? option_d : existingQuestion.option_d,
      correct_answer: normCorrect
    });

    await existingQuestion.update({
      question: question || existingQuestion.question,
      option_a: option_a !== undefined ? option_a : existingQuestion.option_a,
      option_b: option_b !== undefined ? option_b : existingQuestion.option_b,
      option_c: qType === 'true_false' ? '' : (option_c !== undefined ? option_c : existingQuestion.option_c),
      option_d: qType === 'true_false' ? '' : (option_d !== undefined ? option_d : existingQuestion.option_d),
      correct_answer: normCorrect,
      question_type: qType,
      timer: timer !== undefined ? timer : existingQuestion.timer,
      marks: marks !== undefined ? marks : existingQuestion.marks,
      difficulty: difficulty || existingQuestion.difficulty || 'Intermediate'
    });

    return res.json(existingQuestion);
  } catch (error) {
    console.error('Update question error:', error);
    return res.status(500).json({ error: 'Server error updating question' });
  }
});

// Delete a question
router.delete('/questions/:id', authMiddleware, async (req, res) => {
  try {
    const existingQuestion = await Question.findByPk(req.params.id);
    if (!existingQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await Answer.destroy({ where: { question_id: existingQuestion.id } }).catch(() => {});
    await AttemptAnswer.destroy({ where: { question_id: existingQuestion.id } }).catch(() => {});
    await existingQuestion.destroy();
    return res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    return res.status(500).json({ error: 'Server error deleting question' });
  }
});

// Bulk update timer for all questions of a quiz
router.put('/:id/questions/timer', authMiddleware, async (req, res) => {
  try {
    const { timer } = req.body;
    const quizId = req.params.id;

    if (timer === undefined || isNaN(timer) || timer < 5 || timer > 300) {
      return res.status(400).json({ error: 'Timer must be between 5 and 300 seconds' });
    }

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    await Question.update(
      { timer: parseInt(timer, 10) },
      { where: { quiz_id: quizId } }
    );

    return res.json({ message: `Successfully updated timer to ${timer}s for all questions.` });
  } catch (error) {
    console.error('Bulk update timer error:', error);
    return res.status(500).json({ error: 'Server error updating bulk timer' });
  }
});

// ----------------------------------------------------
// EXCEL QUESTION IMPORT ROUTE
// ----------------------------------------------------

router.post('/:id/import', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const quiz_id = req.params.id;
    const quiz = await Quiz.findByPk(quiz_id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Excel or CSV file is required' });
    }

    const isCsv =
      req.file.mimetype === 'text/csv' ||
      req.file.mimetype === 'application/csv' ||
      /\.csv$/i.test(req.file.originalname || '');

    const workbook = new ExcelJS.Workbook();
    if (isCsv) {
      const stream = Readable.from(req.file.buffer);
      await workbook.csv.read(stream);
    } else {
      try {
        await workbook.xlsx.load(req.file.buffer);
      } catch (xlsxErr) {
        // Fallback to CSV parser in case of csv/xlsx extension mismatch
        const stream = Readable.from(req.file.buffer);
        await workbook.csv.read(stream);
      }
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({ error: 'Spreadsheet is empty' });
    }

    // Dynamic header discovery from Row 1
    const headerMap = {};
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      const raw = (cell.text || cell.value || '').toString().toLowerCase().trim();
      const clean = raw.replace(/[^a-z0-9]/g, '');

      if (clean.includes('question') && !clean.includes('type')) headerMap.question = colNumber;
      else if (clean === 'optiona' || clean === 'a' || clean === 'choicea' || clean === 'opta') headerMap.option_a = colNumber;
      else if (clean === 'optionb' || clean === 'b' || clean === 'choiceb' || clean === 'optb') headerMap.option_b = colNumber;
      else if (clean === 'optionc' || clean === 'c' || clean === 'choicec' || clean === 'optc') headerMap.option_c = colNumber;
      else if (clean === 'optiond' || clean === 'd' || clean === 'choiced' || clean === 'optd') headerMap.option_d = colNumber;
      else if (clean.includes('correct') || clean === 'answer' || clean === 'ans' || clean === 'correctans' || clean === 'correctanswer') headerMap.correct_answer = colNumber;
      else if (clean.includes('type') || clean.includes('format')) headerMap.question_type = colNumber;
      else if (clean.includes('timer') || clean.includes('timelimit') || clean.includes('duration') || clean.includes('seconds')) headerMap.timer = colNumber;
      else if (clean.includes('mark') || clean.includes('point') || clean.includes('score')) headerMap.marks = colNumber;
      else if (clean.includes('diffic') || clean.includes('level')) headerMap.difficulty = colNumber;
      else if (clean.includes('explain') || clean.includes('rationale') || clean.includes('solution')) headerMap.explanation = colNumber;
      else if (clean.includes('sectionname') || clean.includes('roundname')) headerMap.section_name = colNumber;
      else if (clean === 'section' || clean === 'round' || clean === 'occurrence') headerMap.occurrence_number = colNumber;
    });

    // Default positional fallbacks if headers weren't named with standard words
    if (!headerMap.question) headerMap.question = 1;
    if (!headerMap.option_a) headerMap.option_a = 2;
    if (!headerMap.option_b) headerMap.option_b = 3;
    if (!headerMap.option_c) headerMap.option_c = 4;
    if (!headerMap.option_d) headerMap.option_d = 5;
    if (!headerMap.correct_answer) headerMap.correct_answer = 6;

    const parsedQuestions = [];
    const errors = [];

    // Helper to safely extract cell text
    const getCellString = (row, colIndex) => {
      if (!colIndex) return '';
      const c = row.getCell(colIndex);
      if (c.value === null || c.value === undefined) return '';
      if (typeof c.value === 'object') {
        if (c.value.text) return String(c.value.text).trim();
        if (c.value.result !== undefined) return String(c.value.result).trim();
        if (c.value.richText) return c.value.richText.map(t => t.text).join('').trim();
      }
      return String(c.text || c.value || '').trim();
    };

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip headers

      const questionText = getCellString(row, headerMap.question);
      const rawOptA = getCellString(row, headerMap.option_a);
      const rawOptB = getCellString(row, headerMap.option_b);
      const rawOptC = getCellString(row, headerMap.option_c);
      const rawOptD = getCellString(row, headerMap.option_d);
      const rawCorrect = getCellString(row, headerMap.correct_answer);
      const rawType = headerMap.question_type ? getCellString(row, headerMap.question_type) : '';
      const timerCell = headerMap.timer ? row.getCell(headerMap.timer).value : null;
      const marksCell = headerMap.marks ? row.getCell(headerMap.marks).value : null;
      const diffVal = headerMap.difficulty ? getCellString(row, headerMap.difficulty) : '';

      // Skip row if completely blank
      if (!questionText && !rawOptA && !rawOptB && !rawOptC && !rawOptD && !rawCorrect) {
        return;
      }

      const rowError = [];
      if (!questionText) {
        rowError.push('Question text is required');
      }

      // Determine question type (Single Choice, True/False, Multiple Choice)
      let normCorrect = normalizeAnswers(rawCorrect);
      let qType = determineQuestionType({
        question_type: rawType,
        option_a: rawOptA,
        option_b: rawOptB,
        option_c: rawOptC,
        option_d: rawOptD,
        correct_answer: rawCorrect
      });

      let optionA = rawOptA;
      let optionB = rawOptB;
      let optionC = rawOptC;
      let optionD = rawOptD;

      if (qType === 'true_false') {
        optionA = 'True';
        optionB = 'False';
        optionC = '';
        optionD = '';

        if (!normCorrect || !['A', 'B'].includes(normCorrect)) {
          const upperAns = rawCorrect.toUpperCase().trim();
          if (upperAns === 'TRUE' || upperAns === 'T') normCorrect = 'A';
          else if (upperAns === 'FALSE' || upperAns === 'F') normCorrect = 'B';
          else normCorrect = 'A'; // fallback
        }
      } else {
        if (!optionA) rowError.push('Option A is required');
        if (!optionB) rowError.push('Option B is required');
        if (qType === 'single') {
          if (!optionC) optionC = '';
          if (!optionD) optionD = '';
          if (!normCorrect || !['A', 'B', 'C', 'D'].includes(normCorrect)) {
            normCorrect = 'A';
          }
        } else if (qType === 'multiple') {
          if (!normCorrect) {
            normCorrect = 'A';
          }
        }
      }

      let timer = 30;
      if (timerCell !== null && timerCell !== undefined && timerCell !== '') {
        const parsedTimer = parseInt(timerCell, 10);
        if (!isNaN(parsedTimer) && parsedTimer >= 5 && parsedTimer <= 300) {
          timer = parsedTimer;
        }
      }

      let marks = 500;
      if (marksCell !== null && marksCell !== undefined && marksCell !== '') {
        const parsedMarks = parseInt(marksCell, 10);
        if (!isNaN(parsedMarks) && parsedMarks > 0) {
          marks = parsedMarks;
        }
      }

      if (rowError.length > 0) {
        errors.push(`Row ${rowNumber}: ${rowError.join(', ')}`);
      } else {
        parsedQuestions.push({
          quiz_id,
          question: questionText,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          correct_answer: normCorrect,
          question_type: qType,
          timer,
          marks,
          difficulty: diffVal || quiz.difficulty || 'Intermediate'
        });
      }
    });

    if (errors.length > 0 && parsedQuestions.length === 0) {
      return res.status(400).json({ error: 'Spreadsheet validation failed', details: errors });
    }

    if (parsedQuestions.length === 0) {
      return res.status(400).json({ error: 'No valid questions found in spreadsheet.' });
    }

    // Get current max order index
    const maxOrder = await Question.max('order_index', { where: { quiz_id } });
    let currentOrderIndex = (maxOrder || 0) + 1;

    parsedQuestions.forEach((q) => {
      q.order_index = currentOrderIndex++;
    });

    // Atomic bulk insert
    const createdQuestions = await Question.bulkCreate(parsedQuestions);

    return res.json({
      success: true,
      message: `Successfully imported ${createdQuestions.length} questions!`,
      count: createdQuestions.length,
      warnings: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Import questions error:', error);
    return res.status(500).json({ error: error.message || 'Server error during question import' });
  }
});

// Bulk add questions via JSON array
router.post('/:id/questions/bulk', authMiddleware, async (req, res) => {
  try {
    const quiz_id = req.params.id;
    const quiz = await Quiz.findByPk(quiz_id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Questions array is required' });
    }

    const maxOrder = await Question.max('order_index', { where: { quiz_id } });
    let currentOrderIndex = (maxOrder || 0) + 1;

    const formatted = questions.map((q) => {
      const normCorrect = normalizeAnswers(q.correct_answer) || 'A';
      const qType = q.question_type || determineQuestionType({ ...q, correct_answer: normCorrect });
      return {
        quiz_id,
        question: q.question,
        option_a: qType === 'true_false' ? 'True' : (q.option_a || 'Option A'),
        option_b: qType === 'true_false' ? 'False' : (q.option_b || 'Option B'),
        option_c: qType === 'true_false' ? '' : (q.option_c || ''),
        option_d: qType === 'true_false' ? '' : (q.option_d || ''),
        correct_answer: normCorrect,
        question_type: qType,
        timer: parseInt(q.timer, 10) || 30,
        marks: parseInt(q.marks, 10) || 500,
        difficulty: q.difficulty || quiz.difficulty || 'Intermediate',
        order_index: currentOrderIndex++
      };
    });

    const created = await Question.bulkCreate(formatted);
    return res.status(201).json({
      success: true,
      message: `Successfully added ${created.length} questions`,
      count: created.length
    });
  } catch (error) {
    console.error('Bulk add questions error:', error);
    return res.status(500).json({ error: 'Server error bulk adding questions' });
  }
});

// =========================================================================
// Badge Issuance & Verification Platform Integration Endpoints
// =========================================================================

// Get current badge status and eligible attendees preview for any quiz (Live or Scheduled)
router.get('/:id/badge-status', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    let attendees = [];

    if (quiz.mode === 'SCHEDULED') {
      // Gather completed attempts
      const attempts = await QuizAttempt.findAll({
        where: { quiz_id: quiz.id, status: 'completed' },
        order: [['score', 'DESC']]
      }).catch(() => []);

      const studentMap = new Map();
      for (const a of attempts) {
        const email = (a.participant_email || '').trim().toLowerCase();
        const key = email || a.participant_name.trim().toLowerCase();
        if (!studentMap.has(key)) {
          studentMap.set(key, {
            name: a.participant_name || 'Participant',
            email: email || `${a.participant_name.replace(/\s+/g, '').toLowerCase()}@student.msc`,
            score: Math.round(Number(a.score) || 0),
            timeTaken: a.time_taken_seconds || 0,
            status: 'completed'
          });
        }
      }
      attendees = Array.from(studentMap.values());
    } else {
      // Live Quiz
      const participants = await Participant.findAll({
        where: { quiz_id: quiz.id, disqualified: false }
      }).catch(() => []);

      if (participants.length > 0) {
        const pIds = participants.map(p => p.id);
        const answers = await Answer.findAll({
          where: { participant_id: { [Op.in]: pIds } }
        }).catch(() => []);

        const scoreByParticipant = new Map();
        for (const ans of answers) {
          const pid = String(ans.participant_id);
          const pts = ans.marks_awarded !== undefined && ans.marks_awarded !== null 
            ? Number(ans.marks_awarded) 
            : (ans.is_correct ? 100 : 0);
          scoreByParticipant.set(pid, (scoreByParticipant.get(pid) || 0) + pts);
        }

        const studentMap = new Map();
        for (const p of participants) {
          const email = (p.email || '').trim().toLowerCase();
          const key = email || p.name.trim().toLowerCase();
          const score = scoreByParticipant.get(String(p.id)) || 0;
          if (!studentMap.has(key)) {
            studentMap.set(key, {
              name: p.name || 'Participant',
              email: email || `${p.name.replace(/\s+/g, '').toLowerCase()}@student.msc`,
              score: Math.round(score),
              college: p.college || '',
              status: 'completed'
            });
          }
        }
        attendees = Array.from(studentMap.values()).sort((a, b) => b.score - a.score);
      }
    }

    // Fetch available badges from Verification Platform
    const verificationPortalUrl = process.env.VERIFICATION_BACKEND_URL || process.env.VERIFICATION_PORTAL_URL || 'https://msc-cert-verification-bkdgfwa0fkcbgyhm.centralindia-01.azurewebsites.net';
    let availableBadges = [
      { id: 'azure-cloud-specialist', title: 'Microsoft Azure & Cloud Fundamentals Master', category: 'Cloud' },
      { id: 'dbms-sql-architect', title: 'Database Systems & SQL Specialist', category: 'DBMS' },
      { id: 'dsa-algo-expert', title: 'Data Structures & Algorithms Expert', category: 'DSA' },
      { id: 'fullstack-web-dev', title: 'Full-Stack Web Development Certified Specialist', category: 'Web' },
      { id: 'python-dev-pro', title: 'Python Programming Certified Professional', category: 'Programming' },
      { id: 'ai-machine-learning', title: 'Artificial Intelligence & Machine Learning Specialist', category: 'AI/ML' },
      { id: 'devops-cloud-architect', title: 'DevOps & Cloud Infrastructure Master', category: 'DevOps' },
      { id: 'msc-tech-champion', title: 'MSC PRPCEM Student Tech Champion', category: 'General' }
    ];

    try {
      const response = await axios.get(`${verificationPortalUrl}/api/integration/events`, {
        headers: { 'x-api-key': process.env.VERIFICATION_API_KEY || 'msc_quiz_verification_secret_key_2026' },
        timeout: 3000
      });
      if (response.data && Array.isArray(response.data.events)) {
        const portalBadges = response.data.events.map(ev => ({
          id: ev.id || ev._id || ev.sys_id || ev.slug,
          title: ev.name || ev.title || ev.badgeTitle,
          category: ev.category || 'Certification',
          source: 'verification_portal'
        }));
        if (portalBadges.length > 0) {
          availableBadges = [...portalBadges, ...availableBadges.filter(b => !portalBadges.some(pb => pb.id === b.id))];
        }
      }
    } catch (e) {
      // Fallback to standard badges
    }

    return res.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        event_name: quiz.event_name,
        mode: quiz.mode,
        status: quiz.status,
        badge_sys_id: quiz.badge_sys_id,
        badge_title: quiz.badge_title || `${quiz.title} Certified Master`,
        badge_issued_at: quiz.badge_issued_at,
        verification_synced: quiz.verification_synced,
        verification_synced_at: quiz.verification_synced_at
      },
      eligibleCount: attendees.length,
      attendees: attendees.slice(0, 100),
      availableBadges
    });
  } catch (error) {
    console.error('Get badge status error:', error);
    return res.status(500).json({ error: 'Server error retrieving badge status' });
  }
});

// Issue or save badges for a quiz (permission-gated admin action)
router.post('/:id/issue-badges', authMiddleware, async (req, res) => {
  try {
    const { badge_sys_id, badge_title, action = 'issue_now', min_score = 0 } = req.body;
    const quiz = await Quiz.findByPk(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (!badge_sys_id || !String(badge_sys_id).trim()) {
      return res.status(400).json({ error: 'Badge Sys ID is required to configure or issue badges.' });
    }

    const cleanSysId = String(badge_sys_id).trim();
    const cleanBadgeTitle = badge_title ? String(badge_title).trim() : `${quiz.title} Certified Specialist`;

    if (action === 'save_only') {
      await quiz.update({
        badge_sys_id: cleanSysId,
        badge_title: cleanBadgeTitle
      });
      return res.json({
        success: true,
        message: 'Badge settings saved successfully. You can issue badges anytime after the event completes.',
        quiz: {
          id: quiz.id,
          badge_sys_id: cleanSysId,
          badge_title: cleanBadgeTitle,
          badge_issued_at: quiz.badge_issued_at
        }
      });
    }

    // action === 'issue_now'
    // Gather all eligible participants
    let attendees = [];

    if (quiz.mode === 'SCHEDULED') {
      const attempts = await QuizAttempt.findAll({
        where: { quiz_id: quiz.id, status: 'completed' },
        order: [['score', 'DESC']]
      }).catch(() => []);

      const studentMap = new Map();
      for (const a of attempts) {
        const score = Math.round(Number(a.score) || 0);
        if (score >= min_score) {
          const email = (a.participant_email || '').trim().toLowerCase();
          const key = email || a.participant_name.trim().toLowerCase();
          if (!studentMap.has(key)) {
            studentMap.set(key, {
              name: a.participant_name || 'Participant',
              email: email || `${a.participant_name.replace(/\s+/g, '').toLowerCase()}@student.msc`,
              score: score,
              status: 'passed'
            });
          }
        }
      }
      attendees = Array.from(studentMap.values());
    } else {
      // Live Quiz
      const participants = await Participant.findAll({
        where: { quiz_id: quiz.id, disqualified: false }
      }).catch(() => []);

      if (participants.length > 0) {
        const pIds = participants.map(p => p.id);
        const answers = await Answer.findAll({
          where: { participant_id: { [Op.in]: pIds } }
        }).catch(() => []);

        const scoreByParticipant = new Map();
        for (const ans of answers) {
          const pid = String(ans.participant_id);
          const pts = ans.marks_awarded !== undefined && ans.marks_awarded !== null 
            ? Number(ans.marks_awarded) 
            : (ans.is_correct ? 100 : 0);
          scoreByParticipant.set(pid, (scoreByParticipant.get(pid) || 0) + pts);
        }

        const studentMap = new Map();
        for (const p of participants) {
          const score = Math.round(scoreByParticipant.get(String(p.id)) || 0);
          if (score >= min_score) {
            const email = (p.email || '').trim().toLowerCase();
            const key = email || p.name.trim().toLowerCase();
            if (!studentMap.has(key)) {
              studentMap.set(key, {
                name: p.name || 'Participant',
                email: email || `${p.name.replace(/\s+/g, '').toLowerCase()}@student.msc`,
                score: score,
                status: 'passed'
              });
            }
          }
        }
        attendees = Array.from(studentMap.values());
      }
    }

    if (attendees.length === 0) {
      return res.status(400).json({
        error: min_score > 0 
          ? `No participants scored >= ${min_score}% to receive this badge.` 
          : 'No completed submissions found to issue badges to yet.'
      });
    }

    const issuedAt = new Date();
    await quiz.update({
      badge_sys_id: cleanSysId,
      badge_title: cleanBadgeTitle,
      badge_issued_at: issuedAt,
      verification_synced: true,
      verification_synced_at: issuedAt,
      verification_event_id: cleanSysId
    });

    // Dispatch to Verification Portal API
    const verificationPortalUrl = process.env.VERIFICATION_BACKEND_URL || process.env.VERIFICATION_PORTAL_URL || 'https://msc-cert-verification-bkdgfwa0fkcbgyhm.centralindia-01.azurewebsites.net';
    const apiKey = process.env.VERIFICATION_API_KEY || 'msc_quiz_verification_secret_key_2026';

    try {
      await axios.post(`${verificationPortalUrl}/api/integration/publish-results`, {
        badgeSysId: cleanSysId,
        eventId: cleanSysId,
        quizId: quiz.id,
        quizTitle: quiz.title,
        eventName: quiz.event_name,
        badgeTitle: cleanBadgeTitle,
        publishDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        attendees
      }, {
        headers: { 'x-api-key': apiKey },
        timeout: 5000
      });
    } catch (syncErr) {
      console.warn('Verification portal sync notice:', syncErr.message);
    }

    return res.json({
      success: true,
      message: `Successfully issued digital badges with Sys ID "${cleanSysId}" to ${attendees.length} participant(s)!`,
      issuedCount: attendees.length,
      badge_sys_id: cleanSysId,
      badge_title: cleanBadgeTitle,
      badge_issued_at: issuedAt,
      attendees: attendees.slice(0, 100)
    });
  } catch (error) {
    console.error('Issue badges error:', error);
    return res.status(500).json({ error: 'Server error issuing badges' });
  }
});

module.exports = router;
