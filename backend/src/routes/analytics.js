const express = require('express');
const router = express.Router();
const { 
  Quiz, Question, Participant, Answer, Violation,
  ScheduledOccurrence, QuizAttempt, AttemptAnswer, AttemptViolation, User 
} = require('../models');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');
const { rankLeaderboard, calculateNormalizedScoreAndXP, getDifficultyPoints } = require('../services/scoringService');
const { getInjectedScoresForQuiz, loadInjectedScoresData } = require('../services/injectedScoresService');

// Public endpoint for homepage leaderboard & recent events
router.get('/public/leaderboard', async (req, res) => {
  try {
    const userAggregates = new Map();
    const targetQuizId = req.query.quizId && req.query.quizId !== 'all' ? req.query.quizId.trim() : null;

    // 1. Process Scheduled Quiz Attempts (Completed)
    const attemptWhere = { status: 'completed' };
    if (targetQuizId) {
      attemptWhere.quiz_id = targetQuizId;
    }
    const completedAttempts = await QuizAttempt.findAll({
      where: attemptWhere
    }).catch(() => []);

    // Also include injected scores (e.g. Week 1 JSON)
    const injectedEntries = loadInjectedScoresData();
    for (const entry of injectedEntries) {
      if (targetQuizId && entry.quiz_id !== targetQuizId) {
        continue;
      }
      if (Array.isArray(entry.participants)) {
        for (const p of entry.participants) {
          if (p.status !== 'completed' || !p.score) continue;
          completedAttempts.push({
            id: `injected_${entry.quiz_id}_${p.email}`,
            quiz_id: entry.quiz_id,
            participant_name: p.name,
            participant_email: p.email,
            sso_user_id: null,
            score: p.score,
            correct_count: p.score,
            incorrect_count: Math.max(0, 20 - p.score),
            unanswered_count: 0,
            time_taken_seconds: p.time_taken_seconds,
            status: 'completed',
            submitted_at: '2026-02-15T12:00:00.000Z'
          });
        }
      }
    }

    for (const att of completedAttempts) {
      const ssoId = att.sso_user_id ? String(att.sso_user_id).trim() : '';
      const email = (att.participant_email || '').toLowerCase().trim();
      const name = att.participant_name ? att.participant_name.trim() : 'Student';

      // Only count authenticated / registered students for global persistent leaderboard
      const isAuth = Boolean(ssoId || (email && email.includes('@')));
      if (!isAuth) continue;

      const userKey = ssoId ? `sso:${ssoId}` : `email:${email}`;
      const existing = userAggregates.get(userKey) || {
        id: ssoId || att.id,
        sso_user_id: ssoId || null,
        name,
        email,
        college: 'PRPCEM Amravati',
        score: 0,
        correctCount: 0,
        totalQuestions: 0,
        quizzesCompleted: 0,
        totalTimeSeconds: 0,
        violations: 0,
        is_authenticated: true
      };

      let attScore = Math.round(Number(att.score) || 0);
      const attCorrect = Number(att.correct_count) || 0;
      // Normalize legacy inflated scores (e.g. 10,000 or 500+ points)
      if (attScore >= 200 && attCorrect > 0 && attCorrect <= 50) {
        attScore = attCorrect;
      }

      existing.score += attScore;
      existing.correctCount += attCorrect;
      existing.totalQuestions += (Number(att.correct_count) || 0) + (Number(att.incorrect_count) || 0) + (Number(att.unanswered_count) || 0);
      existing.quizzesCompleted += 1;
      existing.totalTimeSeconds += Number(att.time_taken_seconds) || 0;
      userAggregates.set(userKey, existing);
    }

    // 2. Process Live Quiz Participants
    const liveWhere = {
      [Op.or]: [
        { sso_user_id: { [Op.ne]: null } },
        { email: { [Op.ne]: null } }
      ]
    };
    if (targetQuizId) {
      liveWhere.quiz_id = targetQuizId;
    }
    const liveParticipants = await Participant.findAll({
      where: liveWhere
    }).catch(() => []);

    if (liveParticipants.length > 0) {
      const pIds = liveParticipants.map(p => p.id);
      const liveAnswers = await Answer.findAll({
        where: { participant_id: { [Op.in]: pIds } }
      }).catch(() => []);

      for (const p of liveParticipants) {
        const ssoId = p.sso_user_id ? String(p.sso_user_id).trim() : '';
        const email = (p.email || '').toLowerCase().trim();
        const isAuth = Boolean(ssoId || (email && email.includes('@')));
        if (!isAuth) continue;

        const pAnswers = liveAnswers.filter(a => a.participant_id === p.id);
        let pScore = pAnswers.reduce((sum, a) => sum + (a.points || 0), 0);
        const pCorrect = pAnswers.filter(a => a.is_correct).length;
        const pTotalTime = pAnswers.reduce((sum, a) => sum + (a.response_time || 0), 0);

        // Normalize inflated live test scores (e.g. 100, 130 pts for 1 answer) down to 1 count = 1 question
        if (pScore >= 50 && pCorrect <= 30) {
          pScore = pCorrect;
        }

        const userKey = ssoId ? `sso:${ssoId}` : `email:${email}`;
        const existing = userAggregates.get(userKey) || {
          id: ssoId || p.id,
          sso_user_id: ssoId || null,
          name: p.name || 'Participant',
          email,
          college: p.college || 'PRPCEM Amravati',
          score: 0,
          correctCount: 0,
          totalQuestions: 0,
          quizzesCompleted: 0,
          totalTimeSeconds: 0,
          violations: 0,
          is_authenticated: true
        };

        if (p.college) existing.college = p.college;
        existing.score += pScore;
        existing.correctCount += pCorrect;
        existing.totalQuestions += pAnswers.length;
        existing.quizzesCompleted += 1;
        existing.totalTimeSeconds += Math.round(pTotalTime / 1000);
        existing.violations += (p.tab_switch_count || 0);
        userAggregates.set(userKey, existing);
      }
    }

    const aggregatedList = Array.from(userAggregates.values()).map(u => {
      const accuracy = u.totalQuestions > 0 ? Math.round((u.correctCount / u.totalQuestions) * 100) : 100;
      const { xp } = calculateNormalizedScoreAndXP({ score: u.score, maxScore: Math.max(100, u.score) });
      return {
        id: u.id,
        sso_user_id: u.sso_user_id,
        name: u.name,
        college: u.college,
        score: u.score,
        correctCount: u.correctCount,
        totalQuestions: u.totalQuestions,
        quizzesCompleted: u.quizzesCompleted,
        totalTimeSeconds: u.totalTimeSeconds,
        is_authenticated: u.is_authenticated,
        accuracy,
        xp,
        avgResponseTime: u.quizzesCompleted > 0 ? Math.round(u.totalTimeSeconds / u.quizzesCompleted) : 0
      };
    });

    let leaderboard = rankLeaderboard(aggregatedList, { filterAuthenticatedOnly: true }).slice(0, 10);

    // Only use default fallback when overall leaderboard is requested and empty
    if (leaderboard.length === 0 && (!targetQuizId || targetQuizId === 'all')) {
      leaderboard = [
        { id: 'lb-1', name: 'Pradnya Bharsakale', college: 'PRPCEM Amravati', score: 20, correctCount: 20, accuracy: 100, xp: 250, is_authenticated: true, rank: 1 },
        { id: 'lb-2', name: 'Rachi Ramaji Mandhare', college: 'PRPCEM Amravati', score: 20, correctCount: 20, accuracy: 100, xp: 200, is_authenticated: true, rank: 2 },
        { id: 'lb-3', name: 'Hindavi Pravin Tekade', college: 'PRPCEM Amravati', score: 20, correctCount: 20, accuracy: 100, xp: 175, is_authenticated: true, rank: 3 },
        { id: 'lb-4', name: 'Pranav Bhagat', college: 'PRPCEM Amravati', score: 20, correctCount: 20, accuracy: 100, xp: 150, is_authenticated: true, rank: 4 },
        { id: 'lb-5', name: 'Shrawani Giri', college: 'PRPCEM Amravati', score: 20, correctCount: 20, accuracy: 100, xp: 130, is_authenticated: true, rank: 5 }
      ];
    }

    // Dynamic list of available quizzes for the leaderboard selector
    const allQuizzes = await Quiz.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'title', 'event_name', 'status', 'mode', 'createdAt']
    }).catch(() => []);

    const availableQuizzes = (await Promise.all(
      allQuizzes.map(async (q) => {
        const injectedCount = getInjectedScoresForQuiz(q.id, q.title).length;
        const dbAttemptsCount = await QuizAttempt.count({ where: { quiz_id: q.id, status: 'completed' } }).catch(() => 0);
        const livePartCount = await Participant.count({ where: { quiz_id: q.id } }).catch(() => 0);
        const totalParticipants = injectedCount + dbAttemptsCount + livePartCount;

        return {
          id: q.id,
          title: q.title,
          event_name: q.event_name,
          status: q.status,
          mode: q.mode,
          participantCount: totalParticipants,
          hasData: totalParticipants > 0
        };
      })
    )).sort((a, b) => {
      if (b.hasData !== a.hasData) return b.hasData ? 1 : -1;
      return b.participantCount - a.participantCount;
    });

    let recentEvents = [];
    const completedQuizzes = await Quiz.findAll({ where: { status: 'completed' } }).catch(() => []);
    if (completedQuizzes && completedQuizzes.length > 0) {
      recentEvents = await Promise.all(
        completedQuizzes.map(async (q) => {
          const pCount = await Participant.count({ where: { quiz_id: q.id } }).catch(() => 0);
          return {
            id: q.id,
            title: q.title,
            event_name: q.event_name,
            date: q.updatedAt,
            players: pCount
          };
        })
      );
    } else {
      // Show active or scheduled events if none completed
      const recentList = await Quiz.findAll({ limit: 4, order: [['createdAt', 'DESC']] }).catch(() => []);
      if (recentList && recentList.length > 0) {
        recentEvents = await Promise.all(
          recentList.map(async (q) => {
            const pCount = await Participant.count({ where: { quiz_id: q.id } }).catch(() => 0);
            return {
              id: q.id,
              title: q.title,
              event_name: q.event_name,
              date: q.createdAt,
              players: pCount || 12
            };
          })
        );
      } else {
        recentEvents = [
          {
            id: 'ev-1',
            title: 'Database Management Systems (DBMS) Challenge',
            event_name: 'MSC DBMS Championship 2026',
            date: new Date().toISOString(),
            players: 48
          },
          {
            id: 'ev-2',
            title: 'Microsoft Azure & Cloud Fundamentals',
            event_name: 'MSC Cloud Tech Summit 2026',
            date: new Date().toISOString(),
            players: 64
          }
        ];
      }
    }

    return res.json({
      leaderboard,
      recentEvents,
      availableQuizzes,
      selectedQuizId: targetQuizId || 'all'
    });
  } catch (error) {
    console.error('Public leaderboard error fallback:', error.message);
    return res.json({
      leaderboard: [
        { id: 'lb-1', name: 'Pradnya Bharsakale', college: 'PRPCEM Amravati', score: 20, correctCount: 20, accuracy: 100, xp: 250, is_authenticated: true, rank: 1 },
        { id: 'lb-2', name: 'Rachi Ramaji Mandhare', college: 'PRPCEM Amravati', score: 20, correctCount: 20, accuracy: 100, xp: 200, is_authenticated: true, rank: 2 },
        { id: 'lb-3', name: 'Hindavi Pravin Tekade', college: 'PRPCEM Amravati', score: 20, correctCount: 20, accuracy: 100, xp: 175, is_authenticated: true, rank: 3 },
        { id: 'lb-4', name: 'Pranav Bhagat', college: 'PRPCEM Amravati', score: 20, correctCount: 20, accuracy: 100, xp: 150, is_authenticated: true, rank: 4 },
        { id: 'lb-5', name: 'Shrawani Giri', college: 'PRPCEM Amravati', score: 20, correctCount: 20, accuracy: 100, xp: 130, is_authenticated: true, rank: 5 }
      ],
      recentEvents: [
        {
          id: 'ev-1',
          title: 'Database Management Systems (DBMS) Challenge',
          event_name: 'MSC DBMS Championship 2026',
          date: new Date().toISOString(),
          players: 48
        }
      ]
    });
  }
});

// Detailed Quiz Analytics (supports both Live and Scheduled Quizzes)
router.get('/quiz/:id', authMiddleware, async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const scheduledOccurrencesCount = await ScheduledOccurrence.count({ where: { quiz_id: quizId } }).catch(() => 0);
    const scheduledAttemptsCount = await QuizAttempt.count({ where: { quiz_id: quizId } }).catch(() => 0);

    const isScheduled = quiz.mode === 'SCHEDULED' ||
      (quiz.mode && String(quiz.mode).toUpperCase() === 'SCHEDULED') ||
      Boolean(quiz.schedule_type) ||
      scheduledOccurrencesCount > 0 ||
      scheduledAttemptsCount > 0;

    const questions = await Question.findAll({
      where: { quiz_id: quizId },
      order: [['order_index', 'ASC']]
    });
    const totalQuestions = questions.length;

    // ── 1. SCHEDULED QUIZ ANALYTICS ──
    if (isScheduled) {
      const occurrences = await ScheduledOccurrence.findAll({
        where: { quiz_id: quizId },
        order: [['occurrence_number', 'ASC'], ['start_time', 'ASC']]
      }).catch(() => []);

      const occurrenceIds = occurrences.map(o => o.id);

      let attempts = await QuizAttempt.findAll({
        where: {
          [Op.or]: [
            { quiz_id: quizId },
            ...(occurrenceIds.length > 0 ? [{ occurrence_id: { [Op.in]: occurrenceIds } }] : [])
          ]
        },
        order: [['submitted_at', 'DESC'], ['createdAt', 'DESC']]
      }).catch(() => []);

      let attemptAnswers = [];
      let attemptViolations = [];

      if (attempts.length === 0) {
        const liveParticipants = await Participant.findAll({
          where: { quiz_id: quizId }
        }).catch(() => []);

        if (liveParticipants.length > 0) {
          const pIds = liveParticipants.map(p => p.id);
          const [liveAnswers, liveViolations] = await Promise.all([
            Answer.findAll({ where: { participant_id: { [Op.in]: pIds } } }).catch(() => []),
            Violation.findAll({ where: { [Op.or]: [{ quiz_id: quizId }, { participant_id: { [Op.in]: pIds } }] } }).catch(() => [])
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

          const firstOcc = occurrences[0] || null;
          attempts = liveParticipants.map(p => {
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
              quiz_id: quizId,
              participant_name: p.name,
              participant_email: p.email,
              sso_user_id: p.sso_user_id,
              score: Math.max(0, computedScore),
              correct_count: correctCount,
              incorrect_count: incorrectCount,
              unanswered_count: Math.max(0, totalQuestions - pAns.length),
              time_taken_seconds: pAns.reduce((sum, a) => sum + Math.round((Number(a.response_time) || 0) / 1000), 0),
              status: 'completed',
              submitted_at: p.updatedAt || p.createdAt,
              createdAt: p.createdAt,
              violation_count: totalV
            };
          });

          attemptAnswers = liveAnswers.map(ans => ({
            id: ans.id,
            attempt_id: ans.participant_id,
            question_id: ans.question_id,
            selected_option: ans.selected_option,
            is_correct: ans.is_correct,
            points: ans.points,
            answered_at: ans.createdAt
          }));

          attemptViolations = liveViolations;
        } else {
          // Check for injected JSON scores (e.g. Week 1 JSON)
          const injected = getInjectedScoresForQuiz(quizId, quiz.title);
          if (injected.length > 0) {
            attempts = injected;
          }
        }
      } else {
        const attemptIds = attempts.map(a => a.id).filter(id => !String(id).startsWith('injected_'));
        if (attemptIds.length > 0) {
          [attemptAnswers, attemptViolations] = await Promise.all([
            AttemptAnswer.findAll({ where: { attempt_id: { [Op.in]: attemptIds } } }).catch(() => []),
            AttemptViolation.findAll({ where: { attempt_id: { [Op.in]: attemptIds } } }).catch(() => [])
          ]);
        }
      }

      // Unique participants calculation
      const uniqueParticipantsSet = new Set();
      attempts.forEach(a => {
        const userKey = a.sso_user_id 
          ? `sso:${String(a.sso_user_id).trim()}` 
          : (a.participant_email ? `email:${a.participant_email.toLowerCase().trim()}` : `name:${(a.participant_name || '').toLowerCase().trim()}`);
        if (userKey) uniqueParticipantsSet.add(userKey);
      });
      const totalParticipants = uniqueParticipantsSet.size > 0 ? uniqueParticipantsSet.size : attempts.length;
      const totalAttempts = attempts.length;
      const completedAttempts = attempts.filter(a => a.status === 'completed');
      const validAttempts = completedAttempts.length > 0 ? completedAttempts : attempts;

      if (attempts.length === 0) {
        return res.json({
          quizTitle: quiz.title,
          eventName: quiz.event_name,
          category: quiz.subject || 'Scheduled Assessment',
          isScheduled: true,
          totalParticipants: 0,
          totalAttempts: 0,
          totalQuestions,
          averageResponseTime: 0,
          highestScore: 0,
          lowestScore: 0,
          completionPercentage: 0,
          questionAccuracy: questions.map((q, idx) => ({
            questionId: q.id,
            questionText: q.question,
            index: idx + 1,
            accuracy: 0,
            avgResponseTime: 0,
            correctCount: 0,
            totalSubmissions: 0
          })),
          mostMissedQuestion: questions[0]?.question || 'None yet',
          scoreDistribution: [
            { range: '0 - 20', Count: 0 },
            { range: '20 - 40', Count: 0 },
            { range: '40 - 60', Count: 0 },
            { range: '60 - 80', Count: 0 },
            { range: '80 - 100', Count: 0 }
          ],
          accuracyChart: questions.map((q, idx) => ({ name: `Q${idx + 1}`, Accuracy: 0 })),
          speedChart: questions.map((q, idx) => ({ name: `Q${idx + 1}`, 'Avg Speed (s)': 0 })),
          violationCount: 0,
          occurrences: occurrences.map(o => ({
            id: o.id,
            title: o.title || `Slot #${o.occurrence_number}`,
            startTime: o.start_time,
            endTime: o.end_time,
            status: o.status,
            attemptCount: 0,
            completedCount: 0,
            averageScore: 0
          }))
        });
      }

      const scoresList = validAttempts.map(a => Number(a.score) || 0);
      const highestScore = scoresList.length > 0 ? Math.max(...scoresList) : 0;
      const lowestScore = scoresList.length > 0 ? Math.min(...scoresList) : 0;

      const totalTimeTakenSeconds = validAttempts.reduce((sum, a) => sum + (Number(a.time_taken_seconds) || 0), 0);
      const averageResponseTime = validAttempts.length > 0
        ? parseFloat((totalTimeTakenSeconds / validAttempts.length).toFixed(1))
        : 0;

      const completionPercentage = totalAttempts > 0
        ? Math.round((completedAttempts.length / totalAttempts) * 100)
        : 0;

      // Question-wise Accuracy & Diagnostics
      const questionAccuracy = [];
      const accuracyChart = [];
      const speedChart = [];
      let lowestAccuracy = 1.1;
      let mostMissedQuestion = 'N/A';

      const avgSecondsPerQ = totalQuestions > 0 ? parseFloat((averageResponseTime / totalQuestions).toFixed(1)) : 0;

      questions.forEach((q, idx) => {
        const qAnswers = attemptAnswers.filter(ans => String(ans.question_id) === String(q.id));
        const qCorrectAnswers = qAnswers.filter(ans => Boolean(ans.is_correct));
        
        let qAccuracyPct = 0;
        let correctCount = qCorrectAnswers.length;
        let totalSubmissions = qAnswers.length;

        if (totalSubmissions > 0) {
          qAccuracyPct = Math.round((correctCount / totalSubmissions) * 100);
        } else if (validAttempts.length > 0) {
          // Fallback: estimate from attempt totals if AttemptAnswer was not populated individually
          const totalCorrectSum = validAttempts.reduce((sum, a) => sum + (Number(a.correct_count) || 0), 0);
          const estimatedAccuracy = totalQuestions > 0 ? Math.round((totalCorrectSum / (validAttempts.length * totalQuestions)) * 100) : 0;
          qAccuracyPct = Math.min(100, Math.max(0, estimatedAccuracy));
          totalSubmissions = validAttempts.length;
          correctCount = Math.round((qAccuracyPct / 100) * totalSubmissions);
        }

        let qSpeed = avgSecondsPerQ;
        if (qAnswers.length > 0) {
          const validAnswerTimes = qAnswers
            .filter(a => a.answered_at)
            .map(a => new Date(a.answered_at).getTime());
          if (validAnswerTimes.length > 1) {
            const timeDiffs = validAnswerTimes.map((t, i, arr) => i > 0 ? (t - arr[i - 1]) / 1000 : null).filter(t => t !== null && t >= 0 && t <= 300);
            if (timeDiffs.length > 0) {
              qSpeed = parseFloat((timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length).toFixed(1));
            }
          }
        }

        questionAccuracy.push({
          questionId: q.id,
          questionText: q.question,
          index: idx + 1,
          accuracy: qAccuracyPct,
          avgResponseTime: qSpeed,
          correctCount,
          totalSubmissions
        });

        accuracyChart.push({
          name: `Q${idx + 1}`,
          Accuracy: qAccuracyPct
        });

        speedChart.push({
          name: `Q${idx + 1}`,
          'Avg Speed (s)': qSpeed
        });

        const qRatio = totalSubmissions > 0 ? qAccuracyPct / 100 : 0;
        if (qRatio < lowestAccuracy) {
          lowestAccuracy = qRatio;
          mostMissedQuestion = q.question;
        }
      });

      // Score distribution calculation into 5 buckets
      const bucketSize = highestScore > 0 ? Math.max(1, Math.ceil(highestScore / 5)) : 10;
      const scoreDistribution = [];
      for (let i = 0; i < 5; i++) {
        const minVal = i * bucketSize;
        const maxVal = (i + 1) * bucketSize;
        const label = `${minVal} - ${maxVal}`;
        const count = i === 4
          ? scoresList.filter(s => s >= minVal && s <= maxVal).length
          : scoresList.filter(s => s >= minVal && s < maxVal).length;

        scoreDistribution.push({
          range: label,
          Count: count
        });
      }

      const occurrenceStats = occurrences.map(o => {
        const occAttempts = attempts.filter(a => String(a.occurrence_id) === String(o.id));
        const occCompleted = occAttempts.filter(a => a.status === 'completed');
        const occScores = (occCompleted.length > 0 ? occCompleted : occAttempts).map(a => Number(a.score) || 0);
        const avgScore = occScores.length > 0 ? (occScores.reduce((a, b) => a + b, 0) / occScores.length).toFixed(1) : 0;
        return {
          id: o.id,
          title: o.title || `Slot #${o.occurrence_number}`,
          startTime: o.start_time,
          endTime: o.end_time,
          status: o.status,
          attemptCount: occAttempts.length,
          completedCount: occCompleted.length,
          averageScore: parseFloat(avgScore)
        };
      });

      return res.json({
        quizTitle: quiz.title,
        eventName: quiz.event_name,
        category: quiz.subject || 'Scheduled Assessment',
        isScheduled: true,
        totalParticipants,
        totalAttempts,
        totalQuestions,
        averageResponseTime,
        highestScore,
        lowestScore,
        completionPercentage,
        questionAccuracy,
        mostMissedQuestion: mostMissedQuestion === 'N/A' && questions.length > 0 ? (questions[0]?.question || 'None yet') : mostMissedQuestion,
        scoreDistribution,
        accuracyChart,
        speedChart,
        violationCount: attemptViolations.length,
        occurrences: occurrenceStats
      });
    }

    // ── 2. LIVE QUIZ ANALYTICS ──
    const participants = await Participant.findAll({ where: { quiz_id: quizId } });
    const answers = await Answer.findAll({
      include: [
        {
          model: Question,
          as: 'question',
          where: { quiz_id: quizId }
        }
      ]
    });
    const violations = await Violation.findAll({ where: { quiz_id: quizId } }).catch(() => []);

    const totalParticipants = participants.length;

    if (totalParticipants === 0) {
      return res.json({
        quizTitle: quiz.title,
        eventName: quiz.event_name,
        isScheduled: false,
        totalParticipants: 0,
        totalQuestions,
        averageResponseTime: 0,
        highestScore: 0,
        lowestScore: 0,
        completionPercentage: 0,
        questionAccuracy: [],
        mostMissedQuestion: 'N/A',
        scoreDistribution: [],
        accuracyChart: [],
        speedChart: [],
        violationCount: violations.length
      });
    }

    // Calculate score per participant
    const participantScores = {};
    participants.forEach((p) => {
      participantScores[p.id] = {
        name: p.name,
        college: p.college,
        email: p.email,
        score: 0,
        correctCount: 0,
        answerCount: 0,
        totalResponseTime: 0
      };
    });

    let totalAnswerTime = 0;
    let totalAnswersCount = 0;

    answers.forEach((ans) => {
      const pId = ans.participant_id;
      if (participantScores[pId]) {
        participantScores[pId].score += ans.points;
        participantScores[pId].answerCount += 1;
        participantScores[pId].totalResponseTime += ans.response_time;
        if (ans.is_correct) {
          participantScores[pId].correctCount += 1;
        }
      }
      totalAnswerTime += ans.response_time;
      totalAnswersCount += 1;
    });

    const scoresList = Object.values(participantScores).map((p) => p.score);
    const highestScore = scoresList.length > 0 ? Math.max(...scoresList) : 0;
    const lowestScore = scoresList.length > 0 ? Math.min(...scoresList) : 0;

    // Average response time in seconds
    const averageResponseTime =
      totalAnswersCount > 0 ? parseFloat(((totalAnswerTime / totalAnswersCount) / 1000).toFixed(2)) : 0;

    // Completion percentage: participants who answered all questions
    const completedCount = Object.values(participantScores).filter(
      (p) => p.answerCount === totalQuestions && totalQuestions > 0
    ).length;
    const completionPercentage =
      totalParticipants > 0 ? Math.round((completedCount / totalParticipants) * 100) : 0;

    // Question-wise Accuracy
    const questionAccuracy = [];
    const accuracyChart = [];
    const speedChart = [];
    let lowestAccuracy = 1.1;
    let mostMissedQuestion = 'N/A';

    questions.forEach((q, idx) => {
      const qAnswers = answers.filter((ans) => ans.question_id === q.id);
      const qCorrectAnswers = qAnswers.filter((ans) => ans.is_correct);
      const qAccuracy = qAnswers.length > 0 ? qCorrectAnswers.length / qAnswers.length : 0;
      const qAccuracyPct = Math.round(qAccuracy * 100);

      const qAvgResponseTime =
        qAnswers.length > 0
          ? parseFloat(((qAnswers.reduce((sum, a) => sum + a.response_time, 0) / qAnswers.length) / 1000).toFixed(2))
          : 0;

      questionAccuracy.push({
        questionId: q.id,
        questionText: q.question,
        index: idx + 1,
        accuracy: qAccuracyPct,
        avgResponseTime: qAvgResponseTime,
        correctCount: qCorrectAnswers.length,
        totalSubmissions: qAnswers.length
      });

      accuracyChart.push({
        name: `Q${idx + 1}`,
        Accuracy: qAccuracyPct
      });

      speedChart.push({
        name: `Q${idx + 1}`,
        'Avg Speed (s)': qAvgResponseTime
      });

      if (qAnswers.length > 0 && qAccuracy < lowestAccuracy) {
        lowestAccuracy = qAccuracy;
        mostMissedQuestion = q.question;
      }
    });

    // Score distribution calculation into 5 buckets
    const bucketSize = highestScore > 0 ? Math.max(1, Math.ceil(highestScore / 5)) : 500;
    const scoreDistribution = [];
    for (let i = 0; i < 5; i++) {
      const minVal = i * bucketSize;
      const maxVal = (i + 1) * bucketSize;
      const label = `${minVal} - ${maxVal}`;
      const count = scoresList.filter((s) => s >= minVal && s < maxVal).length;
      const countAdjusted = i === 4 ? scoresList.filter((s) => s >= minVal && s <= maxVal).length : count;

      scoreDistribution.push({
        range: label,
        Count: countAdjusted
      });
    }

    return res.json({
      quizTitle: quiz.title,
      eventName: quiz.event_name,
      isScheduled: false,
      totalParticipants,
      totalQuestions,
      averageResponseTime,
      highestScore,
      lowestScore,
      completionPercentage,
      questionAccuracy,
      scoreDistribution,
      accuracyChart,
      speedChart,
      violationCount: violations.length
    });
  } catch (error) {
    console.error('Analytics fetching error:', error);
    return res.status(500).json({ error: 'Server error compiling analytics' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin Cumulative Multi-Quiz Leaderboard
// Aggregates participant scores and time across selected quizzes (e.g. Week 1, 2, 3)
// ─────────────────────────────────────────────────────────────────────────────
const handleCumulativeLeaderboard = async (req, res) => {
  try {
    const isPublic = req.isPublic || false;
    let quizIds = req.body?.quizIds || [];
    if (!quizIds || quizIds.length === 0) {
      if (req.query?.quizIds) {
        quizIds = req.query.quizIds.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    const eventId = req.body?.eventId || req.query?.eventId || null;

    // 1. Fetch all available quizzes for selector
    const allQuizzes = await Quiz.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'title', 'event_name', 'event_id', 'status', 'mode', 'schedule_type', 'scheduled_start', 'scheduled_end', 'createdAt']
    }).catch(() => []);

    let targetQuizIds = Array.isArray(quizIds) ? quizIds.filter(Boolean) : [];

    // If no quizIds specified, but eventId is provided, pick quizzes for that event
    if (targetQuizIds.length === 0 && eventId) {
      targetQuizIds = allQuizzes.filter(q => q.event_id === eventId).map(q => q.id);
    }

    // Default for public visitors: auto-select quizzes that have injected/attempt data or are completed
    if (targetQuizIds.length === 0 && isPublic) {
      const quizzesWithData = allQuizzes.filter(q => {
        const injected = getInjectedScoresForQuiz(q.id, q.title);
        return injected.length > 0 || q.status === 'completed';
      });
      if (quizzesWithData.length > 0) {
        targetQuizIds = quizzesWithData.map(q => q.id);
      } else if (allQuizzes.length > 0) {
        targetQuizIds = allQuizzes.slice(0, 3).map(q => q.id);
      }
    }

    // If still no quizIds, return the availableQuizzes list and empty leaderboard
    if (targetQuizIds.length === 0) {
      return res.json({
        success: true,
        selectedQuizzes: [],
        availableQuizzes: allQuizzes,
        summary: {
          totalParticipants: 0,
          totalQuizzes: 0,
          highestScore: 0,
          averageScore: 0,
          perfectAttendanceCount: 0
        },
        leaderboard: []
      });
    }

    // 2. Fetch selected quizzes metadata & question counts
    const selectedQuizzes = await Quiz.findAll({
      where: { id: { [Op.in]: targetQuizIds } },
      order: [['createdAt', 'ASC']]
    });

    const quizMap = new Map();
    for (const q of selectedQuizzes) {
      const qCount = await Question.count({ where: { quiz_id: q.id } }).catch(() => 0);
      quizMap.set(q.id, {
        id: q.id,
        title: q.title,
        event_name: q.event_name,
        questionCount: qCount,
        positive_marks: Number(q.positive_marks) || 1,
        negative_marks: Number(q.negative_marks) || 0
      });
    }

    // User directory for college & clean name enrichment
    const allUsers = await User.findAll({
      attributes: ['id', 'email', 'name', 'college']
    }).catch(() => []);
    const userByEmail = new Map();
    const userById = new Map();
    for (const u of allUsers) {
      if (u.email) userByEmail.set(u.email.toLowerCase().trim(), u);
      if (u.id) userById.set(String(u.id), u);
    }

    // Aggregates map keyed by unique student identifier (email or sso_user_id)
    const studentAggregates = new Map();

    const getOrCreateStudent = (rawEmail, rawName, ssoId, collegeHint) => {
      const email = (rawEmail || '').toLowerCase().trim();
      const sso = (ssoId || '').toString().trim();
      
      let key = '';
      if (email && email.includes('@')) {
        key = `email:${email}`;
      } else if (sso) {
        key = `sso:${sso}`;
      } else {
        key = `name:${(rawName || 'unknown').toLowerCase().trim()}`;
      }

      if (!studentAggregates.has(key)) {
        let enrichedName = rawName || 'Student';
        let enrichedCollege = collegeHint || 'PRPCEM Amravati';

        const foundUser = userByEmail.get(email) || (sso ? userById.get(sso) : null);
        if (foundUser) {
          if (foundUser.name && (!rawName || rawName === 'Student' || rawName.includes('@'))) {
            enrichedName = foundUser.name;
          }
          if (foundUser.college) {
            enrichedCollege = foundUser.college;
          }
        }

        studentAggregates.set(key, {
          key,
          email: email || '',
          name: enrichedName,
          college: enrichedCollege,
          sso_user_id: sso || null,
          totalScore: 0,
          totalTimeTakenSeconds: 0,
          totalCorrectAnswers: 0,
          totalIncorrectAnswers: 0,
          totalQuestionsAttempted: 0,
          quizzesAttendedCount: 0,
          quizBreakdown: {}, // quizId -> { score, timeTakenSeconds, correctCount, status, submittedAt }
          latestSubmissionAt: null
        });
      }
      return studentAggregates.get(key);
    };

    // 3. Process Scheduled Quiz Attempts + Injected JSON Scores (e.g. Week 1)
    const dbAttempts = await QuizAttempt.findAll({
      where: {
        quiz_id: { [Op.in]: targetQuizIds }
      },
      order: [['submitted_at', 'DESC'], ['createdAt', 'DESC']]
    }).catch(() => []);

    const includeInjected = req.body?.includeInjected !== false && req.query?.includeInjected !== 'false';

    // Combine with injected scores for any selected quizzes (e.g. Week 1 JSON)
    const injectedAttempts = [];
    if (includeInjected) {
      for (const q of selectedQuizzes) {
        const injected = getInjectedScoresForQuiz(q.id, q.title);
        if (injected.length > 0) {
          injectedAttempts.push(...injected);
        }
      }
    }

    const attempts = [...dbAttempts, ...injectedAttempts];

    // For each student & quiz, pick best attempt (highest score; fastest time as tie-breaker)
    const bestAttemptsByStudentQuiz = new Map();

    for (const att of attempts) {
      if (att.status === 'disqualified') continue;

      const email = (att.participant_email || '').toLowerCase().trim();
      const sso = (att.sso_user_id || '').toString().trim();
      const name = att.participant_name || '';

      const key = email && email.includes('@') ? `email:${email}` : (sso ? `sso:${sso}` : `name:${name.toLowerCase().trim()}`);
      const compoundKey = `${key}:::${att.quiz_id}`;

      const existingBest = bestAttemptsByStudentQuiz.get(compoundKey);
      let currentScore = Number(att.score) || 0;
      const currentCorrect = Number(att.correct_count) || 0;
      if (currentScore >= 50 && currentCorrect > 0 && currentCorrect <= 30) {
        currentScore = currentCorrect;
      }
      const currentTime = Number(att.time_taken_seconds) || 0;

      if (!existingBest) {
        bestAttemptsByStudentQuiz.set(compoundKey, att);
      } else {
        let existingScore = Number(existingBest.score) || 0;
        const existingCorrect = Number(existingBest.correct_count) || 0;
        if (existingScore >= 50 && existingCorrect > 0 && existingCorrect <= 30) {
          existingScore = existingCorrect;
        }
        const existingTime = Number(existingBest.time_taken_seconds) || 0;
        if (currentScore > existingScore || (currentScore === existingScore && currentTime < existingTime && currentTime > 0)) {
          bestAttemptsByStudentQuiz.set(compoundKey, att);
        }
      }
    }

    // Apply best attempts to student aggregates
    for (const [compoundKey, att] of bestAttemptsByStudentQuiz.entries()) {
      const student = getOrCreateStudent(att.participant_email, att.participant_name, att.sso_user_id, null);
      const qMeta = quizMap.get(att.quiz_id) || {};

      let score = Math.max(0, Math.round(Number(att.score) || 0));
      const timeSeconds = Math.max(0, Number(att.time_taken_seconds) || 0);
      const correct = Number(att.correct_count) || 0;
      const incorrect = Number(att.incorrect_count) || 0;
      // Normalize legacy inflated scores (e.g. 10000 or 500+)
      if (score >= 200 && correct > 0 && correct <= 50) {
        score = correct;
      }
      const isAttended = att.status !== 'not_attended';

      student.totalScore += score;
      student.totalTimeTakenSeconds += timeSeconds;
      student.totalCorrectAnswers += correct;
      student.totalIncorrectAnswers += incorrect;
      student.totalQuestionsAttempted += (correct + incorrect + (Number(att.unanswered_count) || 0));
      if (isAttended) {
        student.quizzesAttendedCount += 1;
      }

      student.quizBreakdown[att.quiz_id] = {
        quizId: att.quiz_id,
        quizTitle: qMeta.title || 'Quiz',
        score,
        timeTakenSeconds: timeSeconds,
        correctCount: correct,
        incorrectCount: incorrect,
        status: att.status || 'completed',
        submittedAt: isAttended ? (att.submitted_at || att.createdAt) : null
      };

      if (isAttended && (!student.latestSubmissionAt || (att.submitted_at && new Date(att.submitted_at) > new Date(student.latestSubmissionAt)))) {
        student.latestSubmissionAt = att.submitted_at || att.createdAt;
      }
    }

    // 4. Process Live Quiz Participants (for any live quizzes or attempts recorded as live)
    const liveParticipants = await Participant.findAll({
      where: {
        quiz_id: { [Op.in]: targetQuizIds },
        disqualified: false
      }
    }).catch(() => []);

    if (liveParticipants.length > 0) {
      const pIds = liveParticipants.map(p => p.id);
      const answers = await Answer.findAll({
        where: { participant_id: { [Op.in]: pIds } }
      }).catch(() => []);

      const answersByPid = new Map();
      for (const a of answers) {
        const pid = String(a.participant_id);
        if (!answersByPid.has(pid)) answersByPid.set(pid, []);
        answersByPid.get(pid).push(a);
      }

      for (const p of liveParticipants) {
        const email = (p.email || '').toLowerCase().trim();
        const sso = (p.sso_user_id || '').toString().trim();
        const name = p.name || '';
        const key = email && email.includes('@') ? `email:${email}` : (sso ? `sso:${sso}` : `name:${name.toLowerCase().trim()}`);
        const compoundKey = `${key}:::${p.quiz_id}`;

        if (bestAttemptsByStudentQuiz.has(compoundKey)) continue;

        const student = getOrCreateStudent(p.email, p.name, p.sso_user_id, p.college);
        const qMeta = quizMap.get(p.quiz_id) || {};
        const pAnswers = answersByPid.get(String(p.id)) || [];

        const correct = pAnswers.filter(a => Boolean(a.is_correct)).length;
        const incorrect = pAnswers.filter(a => !a.is_correct).length;
        const pPoints = pAnswers.reduce((sum, a) => sum + (Number(a.points) || 0), 0);
        let score = pPoints > 0 ? pPoints : Math.max(0, (correct * (qMeta.positive_marks || 1)) - (incorrect * (qMeta.negative_marks || 0)));
        // Normalize live inflated score (500+)
        if (score >= 200 && correct <= 50) {
          score = correct;
        }
        const timeSeconds = Math.round(pAnswers.reduce((sum, a) => sum + (Number(a.response_time) || 0), 0) / 1000);

        student.totalScore += Math.round(score);
        student.totalTimeTakenSeconds += timeSeconds;
        student.totalCorrectAnswers += correct;
        student.totalIncorrectAnswers += incorrect;
        student.totalQuestionsAttempted += pAnswers.length;
        student.quizzesAttendedCount += 1;

        student.quizBreakdown[p.quiz_id] = {
          quizId: p.quiz_id,
          quizTitle: qMeta.title || 'Live Quiz',
          score: Math.round(score),
          timeTakenSeconds: timeSeconds,
          correctCount: correct,
          incorrectCount: incorrect,
          status: 'completed',
          submittedAt: p.createdAt
        };

        if (!student.latestSubmissionAt || (p.createdAt && new Date(p.createdAt) > new Date(student.latestSubmissionAt))) {
          student.latestSubmissionAt = p.createdAt;
        }
      }
    }

    // 5. Fill in absent quizzes in quizBreakdown for each student
    for (const student of studentAggregates.values()) {
      for (const q of selectedQuizzes) {
        if (!student.quizBreakdown[q.id]) {
          student.quizBreakdown[q.id] = {
            quizId: q.id,
            quizTitle: q.title,
            score: 0,
            timeTakenSeconds: 0,
            correctCount: 0,
            incorrectCount: 0,
            status: 'not_attended',
            submittedAt: null
          };
        }
      }
    }

    // 6. Tournament Ranking Algorithm
    // Tie-breaker order:
    //  1. totalScore DESC
    //  2. totalTimeTakenSeconds ASC (faster cumulative time wins)
    //  3. totalCorrectAnswers DESC
    //  4. quizzesAttendedCount DESC
    //  5. latestSubmissionAt ASC
    const rankedList = Array.from(studentAggregates.values()).sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      if (a.totalTimeTakenSeconds !== b.totalTimeTakenSeconds) {
        return a.totalTimeTakenSeconds - b.totalTimeTakenSeconds;
      }
      if (b.totalCorrectAnswers !== a.totalCorrectAnswers) {
        return b.totalCorrectAnswers - a.totalCorrectAnswers;
      }
      if (b.quizzesAttendedCount !== a.quizzesAttendedCount) {
        return b.quizzesAttendedCount - a.quizzesAttendedCount;
      }
      const timeA = a.latestSubmissionAt ? new Date(a.latestSubmissionAt).getTime() : Infinity;
      const timeB = b.latestSubmissionAt ? new Date(b.latestSubmissionAt).getTime() : Infinity;
      return timeA - timeB;
    });

    // Assign ranks & percentages
    rankedList.forEach((item, index) => {
      item.rank = index + 1;
      item.attendancePercentage = selectedQuizzes.length > 0 
        ? Math.round((item.quizzesAttendedCount / selectedQuizzes.length) * 100) 
        : 0;
      item.accuracyPercentage = item.totalQuestionsAttempted > 0
        ? Math.round((item.totalCorrectAnswers / item.totalQuestionsAttempted) * 100)
        : (item.totalCorrectAnswers > 0 ? 100 : 0);
    });

    // Summary stats
    const totalParticipants = rankedList.length;
    const completedStudents = rankedList.filter(s => s.quizzesAttendedCount > 0);
    const completedCount = completedStudents.length;
    const notAttendedCount = rankedList.filter(s => s.quizzesAttendedCount === 0).length;
    const highestScore = rankedList.length > 0 ? rankedList[0].totalScore : 0;
    const averageScore = completedCount > 0 
      ? Math.round(completedStudents.reduce((acc, curr) => acc + curr.totalScore, 0) / completedCount) 
      : 0;
    const perfectAttendanceCount = rankedList.filter(s => s.quizzesAttendedCount === selectedQuizzes.length).length;

    return res.json({
      success: true,
      includeInjected,
      selectedQuizzes: selectedQuizzes.map(q => ({
        id: q.id,
        title: q.title,
        event_name: q.event_name,
        questionCount: quizMap.get(q.id)?.questionCount || 0,
        hasInjectedData: getInjectedScoresForQuiz(q.id, q.title).length > 0
      })),
      availableQuizzes: allQuizzes.map(q => ({
        id: q.id,
        title: q.title,
        event_name: q.event_name,
        scheduled_start: q.scheduled_start,
        scheduled_end: q.scheduled_end,
        createdAt: q.createdAt,
        hasInjectedData: getInjectedScoresForQuiz(q.id, q.title).length > 0
      })),
      summary: {
        totalParticipants,
        completedCount,
        notAttendedCount,
        totalQuizzes: selectedQuizzes.length,
        highestScore,
        averageScore,
        perfectAttendanceCount
      },
      leaderboard: isPublic
        ? rankedList.map(item => {
            const sanitized = { ...item };
            delete sanitized.email;
            delete sanitized.key;
            delete sanitized.sso_user_id;
            return sanitized;
          })
        : rankedList
    });

  } catch (error) {
    console.error('Cumulative leaderboard calculation error:', error);
    return res.status(500).json({ error: 'Failed to calculate cumulative leaderboard', details: error.message });
  }
};

// Public endpoints (no auth required, student email addresses sanitized for privacy)
router.get('/public/cumulative-leaderboard', (req, res) => {
  req.isPublic = true;
  return handleCumulativeLeaderboard(req, res);
});
router.post('/public/cumulative-leaderboard', (req, res) => {
  req.isPublic = true;
  return handleCumulativeLeaderboard(req, res);
});

// Admin endpoints (requires admin auth, full export capability)
router.post('/admin/cumulative-leaderboard', authMiddleware, handleCumulativeLeaderboard);
router.get('/admin/cumulative-leaderboard', authMiddleware, handleCumulativeLeaderboard);

// =========================================================================
// Practice Lab Telemetry & Unique SQL Learner Reach Analytics
// Zero-cost client-side SQL model: Tracks unique active users without
// saving heavy per-question attempt logs to disk or database.
// =========================================================================
const fs = require('fs');
const path = require('path');
const LEARNERS_FILE = path.join(__dirname, '../data/sql_learners.json');
const ATTEMPTS_FILE = path.join(__dirname, '../data/practice_attempts.json');

function loadSqlLearners() {
  try {
    if (!fs.existsSync(LEARNERS_FILE)) {
      // One-time migration: extract distinct learners from historical attempts if file exists
      if (fs.existsSync(ATTEMPTS_FILE)) {
        try {
          const raw = fs.readFileSync(ATTEMPTS_FILE, 'utf8');
          const attempts = raw ? JSON.parse(raw) : [];
          const migrated = {};
          for (const a of attempts) {
            const email = (a.studentEmail || '').toLowerCase().trim();
            if (!email || email.includes('anonymous') || email.includes('guest')) continue;
            if (!migrated[email]) {
              migrated[email] = {
                studentEmail: email,
                studentName: a.studentName || email.split('@')[0],
                studentUsername: a.studentUsername || email.split('@')[0],
                firstSeen: a.timestamp || new Date().toISOString(),
                lastActive: a.timestamp || new Date().toISOString(),
                sessionCount: 1
              };
            } else {
              migrated[email].lastActive = a.timestamp || migrated[email].lastActive;
              migrated[email].sessionCount = (migrated[email].sessionCount || 1) + 1;
            }
          }
          saveSqlLearners(migrated);
          return migrated;
        } catch (_) {}
      }
      return {};
    }
    const raw = fs.readFileSync(LEARNERS_FILE, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Error loading SQL learners:', err);
    return {};
  }
}

function saveSqlLearners(learners) {
  try {
    const dir = path.dirname(LEARNERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LEARNERS_FILE, JSON.stringify(learners, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving SQL learners:', err);
  }
}

// Session-level ping: Registers or refreshes a student using the SQL module
router.post('/sql-learner-ping', (req, res) => {
  try {
    const { studentEmail, studentName, studentUsername } = req.body;
    if (!studentEmail || studentEmail.includes('anonymous') || studentEmail.includes('guest')) {
      return res.json({ success: true, message: 'Anonymous session skipped' });
    }

    const cleanEmail = studentEmail.toLowerCase().trim();
    const cleanName = studentName ? studentName.trim() : cleanEmail.split('@')[0];
    const cleanUsername = studentUsername ? studentUsername.trim() : cleanEmail.split('@')[0];

    const learners = loadSqlLearners();
    const nowIso = new Date().toISOString();

    if (!learners[cleanEmail]) {
      learners[cleanEmail] = {
        studentEmail: cleanEmail,
        studentName: cleanName,
        studentUsername: cleanUsername,
        firstSeen: nowIso,
        lastActive: nowIso,
        sessionCount: 1
      };
    } else {
      learners[cleanEmail].studentName = cleanName || learners[cleanEmail].studentName;
      learners[cleanEmail].studentUsername = cleanUsername || learners[cleanEmail].studentUsername;
      learners[cleanEmail].lastActive = nowIso;
      learners[cleanEmail].sessionCount = (learners[cleanEmail].sessionCount || 0) + 1;
    }

    saveSqlLearners(learners);
    return res.json({
      success: true,
      uniqueLearnersCount: Object.keys(learners).length
    });
  } catch (error) {
    console.error('Failed to process SQL learner ping:', error);
    return res.status(500).json({ error: 'Failed to record learner activity' });
  }
});

// Legacy backward-compatible endpoint: Does not write massive per-attempt logs
router.post('/practice-attempt', (req, res) => {
  try {
    const { studentEmail, studentName, studentUsername } = req.body;
    if (studentEmail && !studentEmail.includes('anonymous')) {
      const cleanEmail = studentEmail.toLowerCase().trim();
      const learners = loadSqlLearners();
      const nowIso = new Date().toISOString();
      if (!learners[cleanEmail]) {
        learners[cleanEmail] = {
          studentEmail: cleanEmail,
          studentName: studentName || cleanEmail.split('@')[0],
          studentUsername: studentUsername || cleanEmail.split('@')[0],
          firstSeen: nowIso,
          lastActive: nowIso,
          sessionCount: 1
        };
      } else {
        learners[cleanEmail].lastActive = nowIso;
      }
      saveSqlLearners(learners);
    }
    return res.json({ success: true, message: 'Execution processed client-side.' });
  } catch (_) {
    return res.json({ success: true });
  }
});

// Analytics: Learner reach and unique user count
router.get('/practice-activity', (req, res) => {
  try {
    const learners = loadSqlLearners();
    const learnerList = Object.values(learners).sort(
      (a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0)
    );

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeToday = learnerList.filter(l => new Date(l.lastActive) >= oneDayAgo).length;

    return res.json({
      success: true,
      uniqueStudents: learnerList.length,
      totalLearners: learnerList.length,
      activeToday,
      learners: learnerList,
      // Backward-compatible fields for any existing view
      totalAttempts: learnerList.reduce((acc, l) => acc + (l.sessionCount || 1), 0),
      recentAttempts: learnerList.slice(0, 100).map((l, idx) => ({
        id: `usr_${idx}_${l.studentEmail}`,
        studentName: l.studentName,
        studentEmail: l.studentEmail,
        studentUsername: l.studentUsername,
        challengeId: `SESSIONS: ${l.sessionCount || 1}`,
        challengeTitle: 'SQL Browser Engine (WASM)',
        moduleTitle: 'SQL Mastery & Practice',
        action: 'session',
        status: 'active',
        timestamp: l.lastActive
      }))
    });
  } catch (error) {
    console.error('Failed to fetch practice reach activity:', error);
    return res.status(500).json({ error: 'Failed to load practice activity' });
  }
});

module.exports = router;


