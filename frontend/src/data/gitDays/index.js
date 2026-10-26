// =========================================================================
// GIT & GITHUB DAYS REGISTRY (Modular Architecture like SQL Chapters)
// Designed for MSC PRPCEM Git & GitHub Assessment & Learning Platform
// =========================================================================

import { DAY_0_METADATA, DAY_0_TOPIC } from './day0Orientation.js';

// Catalog of all dedicated Git Day Modules
export const GIT_DAY_CATALOG = [
  DAY_0_METADATA
];

// Unified Map of Day Topics
export const GIT_DAY_TOPICS = {
  'day-0-orientation': DAY_0_TOPIC
};

// Helper to look up a day's metadata by day number or slug
export function getGitDayMetadata(dayOrSlug) {
  return GIT_DAY_CATALOG.find(
    (d) => d.day === dayOrSlug || d.slug === dayOrSlug
  ) || GIT_DAY_CATALOG[0];
}

export {
  DAY_0_METADATA,
  DAY_0_TOPIC
};
