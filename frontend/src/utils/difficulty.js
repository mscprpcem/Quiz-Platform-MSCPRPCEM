/**
 * Standard Difficulty Theme Utility for MSC PRPCEM Quiz & Coding Labs
 * Supported standard tiers: Basic, Easy, Medium, Hard, Extreme
 */

export function getDifficultyTheme(diff, isDarkContext = false) {
  const d = (diff || '').toLowerCase();

  // Basic (Level 1) - Emerald Green
  if (d === 'basic' || d === 'beginner') {
    return {
      label: 'Basic',
      dot: 'bg-emerald-500',
      text: isDarkContext ? 'text-emerald-400' : 'text-emerald-600',
      badge: isDarkContext ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
  }

  // Easy (Level 2) - Teal
  if (d === 'easy') {
    return {
      label: 'Easy',
      dot: 'bg-teal-500',
      text: isDarkContext ? 'text-teal-400' : 'text-teal-600',
      badge: isDarkContext ? 'bg-teal-950/40 text-teal-400 border-teal-800/60' : 'bg-teal-50 text-teal-700 border-teal-200'
    };
  }

  // Medium (Level 3) - Amber / Yellow
  if (d === 'medium' || d === 'intermediate') {
    return {
      label: 'Medium',
      dot: 'bg-amber-500',
      text: isDarkContext ? 'text-amber-400' : 'text-amber-500',
      badge: isDarkContext ? 'bg-amber-950/40 text-amber-400 border-amber-800/60' : 'bg-amber-50 text-amber-700 border-amber-200'
    };
  }

  // Hard (Level 4) - Orange
  if (d === 'hard' || d === 'advanced') {
    return {
      label: 'Hard',
      dot: 'bg-orange-500',
      text: isDarkContext ? 'text-orange-400' : 'text-orange-500',
      badge: isDarkContext ? 'bg-orange-950/40 text-orange-400 border-orange-800/60' : 'bg-orange-50 text-orange-700 border-orange-200'
    };
  }

  // Extreme (Level 5) - Rose / Red
  if (d === 'extreme') {
    return {
      label: 'Extreme',
      dot: 'bg-rose-600',
      text: isDarkContext ? 'text-rose-400' : 'text-rose-600',
      badge: isDarkContext ? 'bg-rose-950/40 text-rose-400 border-rose-800/60' : 'bg-rose-50 text-rose-700 border-rose-200'
    };
  }

  // Default fallback
  return {
    label: diff || 'Basic',
    dot: 'bg-emerald-500',
    text: isDarkContext ? 'text-emerald-400' : 'text-emerald-600',
    badge: isDarkContext ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };
}
