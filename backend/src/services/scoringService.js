/**
 * Centralized Scoring & Leaderboard Service
 * Provides consistent difficulty weighting, speed bonuses, normalized scores,
 * and authenticated vs. guest ranking across Live and Scheduled quizzes.
 */

// Difficulty levels configuration
// Difficulty levels configuration - Standardized to 1 count per question for Beginner / Easy
const DIFFICULTY_CONFIG = {
  EASY: {
    label: 'Easy',
    weight: 1.0,
    defaultMarks: 1, // 1 count per question for beginner level
    speedBonusFactor: 0.0, // clean 1:1 question count
    badgeColor: 'emerald'
  },
  INTERMEDIATE: {
    label: 'Intermediate',
    weight: 2.0,
    defaultMarks: 2,
    speedBonusFactor: 0.0,
    badgeColor: 'amber'
  },
  HARD: {
    label: 'Hard',
    weight: 3.0,
    defaultMarks: 3,
    speedBonusFactor: 0.0,
    badgeColor: 'rose'
  }
};

/**
 * Normalizes difficulty input into standard key ('EASY' | 'INTERMEDIATE' | 'HARD')
 */
function normalizeDifficulty(diff) {
  if (!diff) return 'EASY';
  const str = String(diff).toUpperCase().trim();
  if (str.includes('EASY') || str.includes('BEGINNER') || str.includes('BASIC')) return 'EASY';
  if (str.includes('HARD') || str.includes('ADVANCED') || str.includes('EXPERT') || str.includes('EXTREME')) return 'HARD';
  return 'INTERMEDIATE';
}

/**
 * Standard difficulty points for question solving:
 * - Easy & Basic: 1 point
 * - Medium & Intermediate: 2 points
 * - Hard & Advanced: 3 points
 */
function getDifficultyPoints(diff) {
  const key = normalizeDifficulty(diff);
  if (key === 'EASY') return 1;
  if (key === 'INTERMEDIATE') return 2;
  if (key === 'HARD') return 3;
  return 1;
}

/**
 * Get difficulty configuration object
 */
function getDifficultyConfig(diff) {
  const key = normalizeDifficulty(diff);
  return DIFFICULTY_CONFIG[key] || DIFFICULTY_CONFIG.EASY;
}

/**
 * Calculate score for a single live quiz question answer
 * Standardized: Easy/Basic = 1 point, Medium/Intermediate = 2 points, Hard/Advanced = 3 points
 */
function calculateLiveQuestionScore({ marks = 1, difficulty = 'Easy', timer = 30, responseTimeMs = 0, isCorrect = false }) {
  if (!isCorrect) return 0;
  return getDifficultyPoints(difficulty);
}

/**
 * Calculate scheduled quiz question score
 * Standardized: Easy/Basic = 1 point, Medium/Intermediate = 2 points, Hard/Advanced = 3 points
 */
function calculateScheduledQuestionScore({ positiveMarks = 1, negativeMarks = 0, difficulty = 'Easy', isCorrect = false, applyDifficultyWeight = true }) {
  if (!isCorrect) {
    return -Math.abs(Number(negativeMarks) || 0);
  }
  return getDifficultyPoints(difficulty);
}

/**
 * Calculate normalized percentage score (0 - 100%) & Platform XP
 */
function calculateNormalizedScoreAndXP({ score = 0, maxScore = 1, rank = 1 }) {
  const safeMax = maxScore > 0 ? maxScore : 1;
  const normalizedScore = Math.min(100, Math.max(0, parseFloat(((score / safeMax) * 100).toFixed(1))));

  let rankBonus = 0;
  if (rank === 1) rankBonus = 150;
  else if (rank === 2) rankBonus = 100;
  else if (rank === 3) rankBonus = 75;
  else if (rank <= 10) rankBonus = 30;
  else rankBonus = 20;

  const xp = Math.round(normalizedScore * 10) + rankBonus;

  return {
    normalizedScore,
    xp,
    rankBonus
  };
}

/**
 * Unified leaderboard sorting with consistent multi-factor tie-breaking:
 * 1. Score (DESC)
 * 2. Correct Answers Count (DESC)
 * 3. Speed / Total Response Time / Avg Response Time (ASC)
 * 4. Violations / Anti-cheat warnings (ASC)
 * 5. Submission Time (ASC)
 * 
 * @param {Array} list - Array of participant objects
 * @param {Object} options
 * @param {boolean} options.filterAuthenticatedOnly - If true, only returns users with verified sso/login
 * @returns {Array} Ranked array with rank property assigned
 */
function rankLeaderboard(list, options = {}) {
  if (!Array.isArray(list) || list.length === 0) return [];

  const { filterAuthenticatedOnly = false } = options;

  let filtered = list;
  if (filterAuthenticatedOnly) {
    filtered = list.filter(item => {
      const hasSso = Boolean(item.sso_user_id && String(item.sso_user_id).trim());
      const hasEmail = Boolean(item.email || item.participant_email);
      const isAuthFlag = item.is_authenticated === true;
      return hasSso || isAuthFlag || (hasEmail && !item.is_guest);
    });
  }

  const sorted = [...filtered].sort((a, b) => {
    // 1. Score (DESC)
    const scoreA = Number(a.score) || 0;
    const scoreB = Number(b.score) || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;

    // 2. Correct answers (DESC)
    const correctA = Number(a.correctAnswers !== undefined ? a.correctAnswers : (a.correct_count || 0));
    const correctB = Number(b.correctAnswers !== undefined ? b.correctAnswers : (b.correct_count || 0));
    if (correctB !== correctA) return correctB - correctA;

    // 3. Speed / Time Taken (ASC)
    const timeA = Number(a.avgResponseTime !== undefined ? a.avgResponseTime : (a.time_taken_seconds || a.total_time || 0));
    const timeB = Number(b.avgResponseTime !== undefined ? b.avgResponseTime : (b.time_taken_seconds || b.total_time || 0));
    if (timeA !== timeB) return timeA - timeB;

    // 4. Violations count (ASC)
    const violA = Number(a.violations !== undefined ? a.violations : (a.tab_switch_count || 0));
    const violB = Number(b.violations !== undefined ? b.violations : (b.tab_switch_count || 0));
    if (violA !== violB) return violA - violB;

    // 5. Auth priority: Logged in users get slight tie-break advantage over anonymous
    const isAuthA = (a.sso_user_id || a.is_authenticated) ? 1 : 0;
    const isAuthB = (b.sso_user_id || b.is_authenticated) ? 1 : 0;
    if (isAuthB !== isAuthA) return isAuthB - isAuthA;

    // 6. Submission timestamp (ASC)
    const subA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
    const subB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
    return subA - subB;
  });

  return sorted.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    is_authenticated: Boolean(entry.sso_user_id || entry.is_authenticated || (entry.email && !entry.is_guest))
  }));
}

module.exports = {
  DIFFICULTY_CONFIG,
  normalizeDifficulty,
  getDifficultyConfig,
  getDifficultyPoints,
  calculateLiveQuestionScore,
  calculateScheduledQuestionScore,
  calculateNormalizedScoreAndXP,
  rankLeaderboard
};
