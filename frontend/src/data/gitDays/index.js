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
import { DAY_6_METADATA, DAY_6_TOPIC } from './day6RemoteRepos.js';
import { DAY_7_METADATA, DAY_7_TOPIC } from './day7CloudSync.js';

// Catalog of all dedicated Git Day Modules
export const GIT_DAY_CATALOG = [
  DAY_0_METADATA,
  DAY_1_METADATA,
  DAY_2_METADATA,
  DAY_3_METADATA,
  DAY_4_METADATA,
  DAY_5_METADATA,
  DAY_6_METADATA,
  DAY_7_METADATA
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
  'git-github': DAY_5_TOPIC,
  'day-6-remote-repos': DAY_6_TOPIC,
  'git-remotes': DAY_6_TOPIC,
  'github-create-repo': DAY_6_TOPIC,
  'public-vs-private-repos': DAY_6_TOPIC,
  'markdown-readme-guide': DAY_6_TOPIC,
  'project-readme-anatomy': DAY_6_TOPIC,
  'git-conventional-commits': DAY_6_TOPIC,
  'task-tracker-cli-lab': DAY_6_TOPIC,
  'project-readme-commits': DAY_6_TOPIC,
  'day-7-cloud-sync': DAY_7_TOPIC,
  'git-remotes-concept': DAY_7_TOPIC,
  'git-clone-vs-remote-add': DAY_7_TOPIC,
  'git-auth-https-ssh': DAY_7_TOPIC,
  'git-push-upstream': DAY_7_TOPIC,
  'git-fetch-vs-pull': DAY_7_TOPIC,
  'git-sync-clone-lab': DAY_7_TOPIC,
  'git-fetch': DAY_7_TOPIC,
  'git-pull': DAY_7_TOPIC,
  'git-push': DAY_7_TOPIC,
  'git-clone': DAY_7_TOPIC,
  'github-platform-overview': DAY_5_TOPIC,
  'github-account-security': DAY_5_TOPIC,
  'github-interface-navigation': DAY_5_TOPIC,
  'github-profile-branding': DAY_5_TOPIC,
  'github-secret-readme': DAY_5_TOPIC,
  'github-profile-lab': DAY_5_TOPIC,
  'git-staging-mechanics': DAY_4_TOPIC,
  'git-commit-crafting': DAY_4_TOPIC,
  'git-log-inspection': DAY_4_TOPIC,
  'git-gitignore-rules': DAY_4_TOPIC,
  'git-file-lifecycles': DAY_3_TOPIC,
  'git-init-repo': DAY_3_TOPIC,
  'git-dotgit-anatomy': DAY_3_TOPIC,
  'git-config-identity': DAY_2_TOPIC,
  'git-config-aliases': DAY_2_TOPIC,
  'git-install-verify': DAY_1_TOPIC
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
  DAY_5_TOPIC,
  DAY_6_METADATA,
  DAY_6_TOPIC,
  DAY_7_METADATA,
  DAY_7_TOPIC
};


