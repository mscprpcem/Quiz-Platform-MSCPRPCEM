// =========================================================================
// GIT & GITHUB DAYS REGISTRY (Modular Architecture like SQL Chapters)
// Designed for MSC PRPCEM Git & GitHub Assessment & Learning Platform
// =========================================================================

import { DAY_0_METADATA, DAY_0_TOPIC } from './day0Orientation.js';
import { DAY_1_METADATA, DAY_1_TOPIC } from './day1Fundamentals.js';
import { DAY_2_METADATA, DAY_2_TOPIC } from './day2Configuration.js';
import { DAY_3_METADATA, DAY_3_TOPIC } from './day3RepositoryBasics.js';
import { DAY_4_METADATA, DAY_4_TOPIC } from './day4BasicCommands.js';
import { DAY_5_METADATA, DAY_5_TOPIC } from './day5GitHubEssentials.js';

// Catalog of all dedicated Git Day Modules
export const GIT_DAY_CATALOG = [
  DAY_0_METADATA,
  DAY_1_METADATA,
  DAY_2_METADATA,
  DAY_3_METADATA,
  DAY_4_METADATA,
  DAY_5_METADATA
];

// Unified Map of Day Topics
export const GIT_DAY_TOPICS = {
  'day-0-orientation': DAY_0_TOPIC,
  'git-basics': DAY_1_TOPIC,
  'day-1-fundamentals': DAY_1_TOPIC,
  'git-config': DAY_2_TOPIC,
  'day-2-configuration': DAY_2_TOPIC,
  'git-init': DAY_3_TOPIC,
  'day-3-repo-basics': DAY_3_TOPIC,
  'git-status-add': DAY_4_TOPIC,
  'day-4-basic-commands': DAY_4_TOPIC,
  'github-essentials': DAY_5_TOPIC,
  'day-5-github-essentials': DAY_5_TOPIC,
  'git-github': DAY_5_TOPIC
};

// Helper to look up a day's metadata by day number or slug
export function getGitDayMetadata(dayOrSlug) {
  return GIT_DAY_CATALOG.find(
    (d) => d.day === dayOrSlug || d.slug === dayOrSlug
  ) || GIT_DAY_CATALOG[0];
}

export {
  DAY_0_METADATA,
  DAY_0_TOPIC,
  DAY_1_METADATA,
  DAY_1_TOPIC,
  DAY_2_METADATA,
  DAY_2_TOPIC,
  DAY_3_METADATA,
  DAY_3_TOPIC,
  DAY_4_METADATA,
  DAY_4_TOPIC,
  DAY_5_METADATA,
  DAY_5_TOPIC
};


