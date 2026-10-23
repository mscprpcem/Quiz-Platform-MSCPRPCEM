const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { GitProgress, User } = require('../models');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'msc_quiz_secret_key_2026';

// Helper to extract authenticated user if token present, without failing if absent
const getOptionalUser = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Compute skill tier based on number of completed challenges
const computeSkillLevel = (solvedCount) => {
  if (solvedCount >= 20) return 'Open Source Lead';
  if (solvedCount >= 13) return 'Git Ninja';
  if (solvedCount >= 6) return 'Branch Master';
  return 'Novice';
};

// Safe JSON parse helper
const safeJsonParse = (str, fallback) => {
  if (!str) return fallback;
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
};

// ═══════════════════════════════════════════════════
// 1. PUBLIC: GET /api/git/curriculum
// ═══════════════════════════════════════════════════
router.get('/curriculum', (req, res) => {
  res.json({
    success: true,
    title: 'Git & GitHub Complete Mastery Track',
    badge: 'MSC Official Track',
    tiers: [
      {
        id: 'tier-1',
        level: 1,
        title: 'Beginner: Git Foundations & Daily Workflow',
        description: 'Master snapshot architecture, the three trees, staging, commits, and history navigation.',
        topicsCount: 8,
        slugs: ['git-basics', 'git-init', 'three-trees', 'git-status-add', 'git-commit', 'git-log', 'git-diff', 'gitignore']
      },
      {
        id: 'tier-2',
        level: 2,
        title: 'Intermediate: Branching, Merging & History Manipulation',
        description: 'Understand branch pointers, 3-way merges vs fast-forwards, rebasing, stashes, and merge conflict resolution.',
        topicsCount: 8,
        slugs: ['branching-basics', 'checkout-switch', 'merging-mechanics', 'rebasing-linear', 'stashing-changes', 'undoing-changes', 'cherry-pick', 'merge-conflicts']
      },
      {
        id: 'tier-3',
        level: 3,
        title: 'GitHub & Remote Collaboration',
        description: 'Sync with remote origins, pull request lifecycles, open source fork-and-pull workflows, and team code reviews.',
        topicsCount: 7,
        slugs: ['remotes-origin', 'fetch-pull-push', 'upstream-tracking', 'forks-sync', 'pull-requests', 'code-reviews', 'issues-projects']
      },
      {
        id: 'tier-4',
        level: 4,
        title: 'Advanced: Power Tools & Automation',
        description: 'Interactive rebasing (squash/reword), recovering lost commits with reflog, binary bug hunting with bisect, and GitHub Actions CI/CD.',
        topicsCount: 6,
        slugs: ['interactive-rebase', 'git-reflog', 'git-bisect', 'tags-semver', 'github-releases', 'github-actions']
      },
      {
        id: 'tier-5',
        level: 5,
        title: 'Real-World Scenarios & Production Workflows',
        description: 'Industry trunk-based vs GitFlow branching, leaked secret scrubbing, emergency hotfix releases, and conflict triage.',
        topicsCount: 5,
        slugs: ['team-git-workflows', 'secret-scrubbing', 'emergency-hotfix', 'multi-branch-conflicts', 'open-source-contributing']
      }
    ]
  });
});

// ═══════════════════════════════════════════════════
// 2. STUDENT / GUEST: GET /api/git/progress
// ═══════════════════════════════════════════════════
router.get('/progress', async (req, res) => {
  try {
    const authUser = getOptionalUser(req);
    const email = authUser?.email || req.query.email;

    if (!email) {
      return res.json({
        success: true,
        progress: {
          completed_lessons: [],
          completed_challenges: [],
          quiz_scores: {},
          skill_level: 'Novice',
          last_active_lesson: null,
          achievements: []
        }
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let record = await GitProgress.findOne({ where: { user_email: normalizedEmail } });

    if (!record) {
      return res.json({
        success: true,
        progress: {
          completed_lessons: [],
          completed_challenges: [],
          quiz_scores: {},
          skill_level: 'Novice',
          last_active_lesson: null,
          achievements: []
        }
      });
    }

    const completedChallenges = safeJsonParse(record.completed_challenges, []);
    const completedLessons = safeJsonParse(record.completed_lessons, []);
    const quizScores = safeJsonParse(record.quiz_scores, {});
    const achievements = safeJsonParse(record.achievements, []);

    res.json({
      success: true,
      progress: {
        id: record.id,
        user_email: record.user_email,
        completed_lessons: completedLessons,
        completed_challenges: completedChallenges,
        quiz_scores: quizScores,
        skill_level: record.skill_level || computeSkillLevel(completedChallenges.length),
        last_active_lesson: record.last_active_lesson,
        achievements: achievements
      }
    });
  } catch (error) {
    console.error('Error fetching git progress:', error);
    res.status(500).json({ success: false, message: 'Failed to load progress' });
  }
});

// ═══════════════════════════════════════════════════
// 3. STUDENT: POST /api/git/progress/lesson
// ═══════════════════════════════════════════════════
router.post('/progress/lesson', async (req, res) => {
  try {
    const authUser = getOptionalUser(req);
    const email = authUser?.email || req.body.email;
    const { lessonSlug } = req.body;

    if (!lessonSlug) {
      return res.status(400).json({ success: false, message: 'lessonSlug is required' });
    }

    if (!email) {
      return res.json({ success: true, message: 'Progress cached locally (guest session)' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let [record] = await GitProgress.findOrCreate({
      where: { user_email: normalizedEmail },
      defaults: {
        user_id: authUser?.id || null,
        user_email: normalizedEmail,
        completed_lessons: '[]',
        completed_challenges: '[]',
        quiz_scores: '{}',
        skill_level: 'Novice',
        last_active_lesson: lessonSlug,
        achievements: '[]'
      }
    });

    const lessons = safeJsonParse(record.completed_lessons, []);
    if (!lessons.includes(lessonSlug)) {
      lessons.push(lessonSlug);
    }

    const achievements = safeJsonParse(record.achievements, []);
    if (lessons.length >= 1 && !achievements.includes('first_step')) {
      achievements.push('first_step');
    }
    if (lessons.length >= 10 && !achievements.includes('scholar')) {
      achievements.push('scholar');
    }

    await record.update({
      completed_lessons: JSON.stringify(lessons),
      last_active_lesson: lessonSlug,
      achievements: JSON.stringify(achievements)
    });

    res.json({
      success: true,
      completed_lessons: lessons,
      last_active_lesson: lessonSlug,
      achievements
    });
  } catch (error) {
    console.error('Error recording lesson progress:', error);
    res.status(500).json({ success: false, message: 'Failed to record lesson progress' });
  }
});

// ═══════════════════════════════════════════════════
// 4. STUDENT: POST /api/git/progress/challenge
// ═══════════════════════════════════════════════════
router.post('/progress/challenge', async (req, res) => {
  try {
    const authUser = getOptionalUser(req);
    const email = authUser?.email || req.body.email;
    const { challengeId } = req.body;

    if (!challengeId) {
      return res.status(400).json({ success: false, message: 'challengeId is required' });
    }

    if (!email) {
      return res.json({ success: true, message: 'Challenge solved and cached locally' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let [record] = await GitProgress.findOrCreate({
      where: { user_email: normalizedEmail },
      defaults: {
        user_id: authUser?.id || null,
        user_email: normalizedEmail,
        completed_lessons: '[]',
        completed_challenges: '[]',
        quiz_scores: '{}',
        skill_level: 'Novice',
        last_active_lesson: null,
        achievements: '[]'
      }
    });

    const challenges = safeJsonParse(record.completed_challenges, []);
    if (!challenges.includes(challengeId)) {
      challenges.push(challengeId);
    }

    const achievements = safeJsonParse(record.achievements, []);
    if (challenges.length >= 1 && !achievements.includes('first_commit')) {
      achievements.push('first_commit');
    }
    if (challenges.includes('git-branch-merge-conflict') && !achievements.includes('conflict_crusher')) {
      achievements.push('conflict_crusher');
    }
    if (challenges.length >= 10 && !achievements.includes('git_warrior')) {
      achievements.push('git_warrior');
    }
    if (challenges.length >= 20 && !achievements.includes('open_source_champion')) {
      achievements.push('open_source_champion');
    }

    const newSkillLevel = computeSkillLevel(challenges.length);

    await record.update({
      completed_challenges: JSON.stringify(challenges),
      skill_level: newSkillLevel,
      achievements: JSON.stringify(achievements)
    });

    res.json({
      success: true,
      completed_challenges: challenges,
      skill_level: newSkillLevel,
      achievements
    });
  } catch (error) {
    console.error('Error recording challenge progress:', error);
    res.status(500).json({ success: false, message: 'Failed to record challenge progress' });
  }
});

// ═══════════════════════════════════════════════════
// 5. STUDENT: POST /api/git/progress/quiz
// ═══════════════════════════════════════════════════
router.post('/progress/quiz', async (req, res) => {
  try {
    const authUser = getOptionalUser(req);
    const email = authUser?.email || req.body.email;
    const { quizSlug, score, total, percentage, passed } = req.body;

    if (!quizSlug) {
      return res.status(400).json({ success: false, message: 'quizSlug is required' });
    }

    if (!email) {
      return res.json({ success: true, message: 'Quiz score stored locally' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let [record] = await GitProgress.findOrCreate({
      where: { user_email: normalizedEmail },
      defaults: {
        user_id: authUser?.id || null,
        user_email: normalizedEmail,
        completed_lessons: '[]',
        completed_challenges: '[]',
        quiz_scores: '{}',
        skill_level: 'Novice',
        last_active_lesson: null,
        achievements: '[]'
      }
    });

    const quizScores = safeJsonParse(record.quiz_scores, {});
    quizScores[quizSlug] = {
      score: score || 0,
      total: total || 5,
      percentage: percentage || Math.round(((score || 0) / (total || 5)) * 100),
      passed: Boolean(passed),
      completedAt: new Date().toISOString()
    };

    const achievements = safeJsonParse(record.achievements, []);
    if (passed && !achievements.includes('quiz_whiz')) {
      achievements.push('quiz_whiz');
    }

    await record.update({
      quiz_scores: JSON.stringify(quizScores),
      achievements: JSON.stringify(achievements)
    });

    res.json({
      success: true,
      quiz_scores: quizScores,
      achievements
    });
  } catch (error) {
    console.error('Error saving git quiz score:', error);
    res.status(500).json({ success: false, message: 'Failed to record quiz score' });
  }
});

// ═══════════════════════════════════════════════════
// 6. PUBLIC: GET /api/git/leaderboard
// ═══════════════════════════════════════════════════
router.get('/leaderboard', async (req, res) => {
  try {
    const records = await GitProgress.findAll({
      limit: 50
    });

    const leaders = records.map(r => {
      const challenges = safeJsonParse(r.completed_challenges, []);
      const quizScores = safeJsonParse(r.quiz_scores, {});
      const lessons = safeJsonParse(r.completed_lessons, []);
      
      let totalQuizPoints = 0;
      Object.values(quizScores).forEach(q => {
        totalQuizPoints += (q.score || 0) * 10;
      });

      const totalScore = (challenges.length * 50) + (lessons.length * 5) + totalQuizPoints;

      // Mask email for student privacy
      const email = r.user_email || 'student@prpcem.ac.in';
      const parts = email.split('@');
      const maskedEmail = parts[0].length > 3 
        ? `${parts[0].slice(0, 3)}***@${parts[1] || 'domain.com'}`
        : `${parts[0]}***@${parts[1] || 'domain.com'}`;

      return {
        id: r.id,
        user_email: maskedEmail,
        challenges_solved: challenges.length,
        lessons_completed: lessons.length,
        skill_level: r.skill_level || computeSkillLevel(challenges.length),
        total_score: totalScore
      };
    });

    leaders.sort((a, b) => b.total_score - a.total_score);

    res.json({
      success: true,
      leaderboard: leaders.slice(0, 20)
    });
  } catch (error) {
    console.error('Error fetching git leaderboard:', error);
    res.status(500).json({ success: false, message: 'Failed to load leaderboard' });
  }
});

// ═══════════════════════════════════════════════════
// 7. ADMIN: GET /api/admin/git/stats
// ═══════════════════════════════════════════════════
router.get('/admin/stats', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const totalLearners = await GitProgress.count();
    const allProgress = await GitProgress.findAll();

    let totalChallengesSolved = 0;
    let totalLessonsCompleted = 0;
    const tierDistribution = {
      Novice: 0,
      'Branch Master': 0,
      'Git Ninja': 0,
      'Open Source Lead': 0
    };

    allProgress.forEach(p => {
      const challenges = safeJsonParse(p.completed_challenges, []);
      const lessons = safeJsonParse(p.completed_lessons, []);
      totalChallengesSolved += challenges.length;
      totalLessonsCompleted += lessons.length;

      const level = p.skill_level || computeSkillLevel(challenges.length);
      if (tierDistribution[level] !== undefined) {
        tierDistribution[level]++;
      } else {
        tierDistribution['Novice']++;
      }
    });

    res.json({
      success: true,
      stats: {
        totalLearners,
        totalChallengesSolved,
        totalLessonsCompleted,
        tierDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching admin git stats:', error);
    res.status(500).json({ success: false, message: 'Failed to load admin stats' });
  }
});

// ═══════════════════════════════════════════════════
// 8. ADMIN: POST /api/admin/git/reset-student
// ═══════════════════════════════════════════════════
router.post('/admin/reset-student', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Student email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const record = await GitProgress.findOne({ where: { user_email: normalizedEmail } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'No progress found for student' });
    }

    await record.update({
      completed_lessons: '[]',
      completed_challenges: '[]',
      quiz_scores: '{}',
      skill_level: 'Novice',
      last_active_lesson: null,
      achievements: '[]'
    });

    res.json({ success: true, message: `Git progress reset for ${normalizedEmail}` });
  } catch (error) {
    console.error('Error resetting student git progress:', error);
    res.status(500).json({ success: false, message: 'Failed to reset student progress' });
  }
});

module.exports = router;
