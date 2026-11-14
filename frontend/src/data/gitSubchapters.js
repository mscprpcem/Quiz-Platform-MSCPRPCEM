import {
  DAY_0_TOPIC,
  DAY_1_TOPIC,
  DAY_2_TOPIC,
  DAY_3_TOPIC,
  DAY_4_TOPIC,
  DAY_5_TOPIC
} from './gitDays/index.js';

// Split day 2 content into Part 1 (Scopes & Precedence) and Part 2 (Identity & Defaults)
const d2Parts = DAY_2_TOPIC.content.split('### 3. Configuring User Identity');
const d2Part1Content = d2Parts[0]?.trim() || '';
const d2Part2Content = d2Parts[1] ? `### 3. Configuring User Identity\n\n${d2Parts[1].trim()}` : '';

// Split day 3 content into Part 1 (The Three Trees) and Part 2 (git init & Anatomy)
const d3Parts = DAY_3_TOPIC.content.split('### 4. Repository Initialization');
const d3Part1Content = d3Parts[0]?.trim() || '';
const d3Part2Content = d3Parts[1] ? `### 4. Repository Initialization\n\n${d3Parts[1].trim()}` : '';

// Split day 4 content into Part 1 (Staging & Atomic Commits) and Part 2 (git log & .gitignore)
const d4Parts = DAY_4_TOPIC.content.split(/\n---\s*\n+### 4\. Inspecting History/);
const d4Part1Content = d4Parts[0]?.trim() || '';
const d4Part2Content = d4Parts[1] 
  ? `### 4. Inspecting History with \`git log\`\n\n${d4Parts[1].replace(/^with `git log`\s*\n?/, '').trim()}` 
  : '';

// Split day 5 content into Part 1 (Platform & 2FA Security) and Part 2 (Profile & Secret README)
const d5Parts = DAY_5_TOPIC.content.split('### 4. Customizing Your Public Profile');
const d5Part1Content = d5Parts[0]?.trim() || '';
const d5Part2Content = d5Parts[1] ? `### 4. Customizing Your Public Profile\n\n${d5Parts[1].trim()}` : '';

export const GIT_SUBCHAPTERS = [
  // Chapter 1
  {
    slug: 'day-0-orientation',
    aliases: ['orientation', 'day-0'],
    chapterId: 'chapter-1',
    chapterNumber: 1,
    title: 'Orientation: Why Git & How This Course Works',
    shortTitle: 'Orientation',
    shortName: 'Subchapter 1.1: Orientation',
    summary: DAY_0_TOPIC.summary || 'Understand why Git and GitHub are foundational to modern software engineering.',
    readTime: '4 min read',
    content: DAY_0_TOPIC.content
  },
  {
    slug: 'git-basics',
    aliases: ['day-1-fundamentals', 'day-1', 'git-fundamentals'],
    chapterId: 'chapter-1',
    chapterNumber: 1,
    title: 'Version Control Fundamentals & Local Installation',
    shortTitle: 'VCS Fundamentals',
    shortName: 'Subchapter 1.2: VCS Fundamentals',
    summary: DAY_1_TOPIC.summary || 'Understand VCS core definition, 4 Ws of tracking, CVCS vs DVCS, and Git installation.',
    readTime: '6 min read',
    content: DAY_1_TOPIC.content
  },

  // Chapter 2
  {
    slug: 'git-config-scopes',
    aliases: ['git-config', 'day-2-configuration', 'day-2'],
    chapterId: 'chapter-2',
    chapterNumber: 2,
    title: 'Configuration Scopes & Precedence (System, Global, Local, Worktree)',
    shortTitle: 'Scopes & Precedence',
    shortName: 'Subchapter 2.1: Scopes & Precedence',
    summary: 'Master Git configuration hierarchy: System, Global, Local, and Worktree scopes, precedence rules, and config inspection.',
    readTime: '5 min read',
    content: d2Part1Content
  },
  {
    slug: 'git-config-defaults',
    aliases: ['git-defaults', 'git-identity'],
    chapterId: 'chapter-2',
    chapterNumber: 2,
    title: 'Configuring User Identity & Core Environment Defaults',
    shortTitle: 'Identity & Defaults',
    shortName: 'Subchapter 2.2: Identity & Defaults',
    summary: 'Configure author identity, default init branch, core editor, line ending normalization (autocrlf), and custom aliases.',
    readTime: '6 min read',
    content: d2Part2Content
  },

  // Chapter 3
  {
    slug: 'git-three-trees',
    aliases: ['three-trees', 'git-lifecycle', 'day-3-repo-basics', 'day-3'],
    chapterId: 'chapter-3',
    chapterNumber: 3,
    title: 'The Three Trees Architecture & File Status Lifecycles',
    shortTitle: 'The Three Trees',
    shortName: 'Subchapter 3.1: The Three Trees',
    summary: 'Understand the Working Directory, Staging Area (Index), and HEAD Repository, plus untracked, unmodified, modified, and staged file states.',
    readTime: '5 min read',
    content: d3Part1Content
  },
  {
    slug: 'git-init-anatomy',
    aliases: ['git-init', 'repo-init-git-folder', 'git-anatomy'],
    chapterId: 'chapter-3',
    chapterNumber: 3,
    title: 'Repository Initialization & Deep .git Directory Anatomy',
    shortTitle: 'git init & Anatomy',
    shortName: 'Subchapter 3.2: git init & Anatomy',
    summary: 'Initialize repositories with git init, explore the internal structure of the .git folder (HEAD, config, objects, refs, hooks, index), and execute first commits.',
    readTime: '6 min read',
    content: d3Part2Content
  },

  // Chapter 4
  {
    slug: 'git-staging-lifecycle',
    aliases: ['git-status-add', 'git-add-commit-status', 'day-4-basic-commands', 'day-4'],
    chapterId: 'chapter-4',
    chapterNumber: 4,
    title: 'Staging Mechanics, File Status & Crafting Atomic Commits',
    shortTitle: 'Staging & Snapshots',
    shortName: 'Subchapter 4.1: Staging & Snapshots',
    summary: 'Master git status output, staging with git add (and interactive -p), commit snapshots with git commit, and professional commit messaging.',
    readTime: '6 min read',
    content: d4Part1Content
  },
  {
    slug: 'git-history-ignore',
    aliases: ['git-log-ignore', 'git-history'],
    chapterId: 'chapter-4',
    chapterNumber: 4,
    title: 'Commit History Inspection (git log) & Excluding Files (.gitignore)',
    shortTitle: 'History & .gitignore',
    shortName: 'Subchapter 4.2: History & .gitignore',
    summary: 'Inspect history with git log formatting, branch graphs, author filters, and exclude unwanted build artifacts with .gitignore pattern rules.',
    readTime: '6 min read',
    content: d4Part2Content
  },

  // Chapter 5
  {
    slug: 'github-platform-security',
    aliases: ['github-essentials', 'github-remotes', 'day-5-github-essentials', 'day-5', 'git-github'],
    chapterId: 'chapter-5',
    chapterNumber: 5,
    title: 'GitHub Platform Architecture & Mandatory 2FA Security',
    shortTitle: 'Platform & 2FA Security',
    shortName: 'Subchapter 5.1: Platform & 2FA Security',
    summary: 'Understand Git vs GitHub, cloud hosting, account creation, mandatory two-factor authentication (TOTP/authenticator apps), and recovery keys.',
    readTime: '6 min read',
    content: d5Part1Content
  },
  {
    slug: 'github-profile-readme',
    aliases: ['github-profile', 'profile-readme'],
    chapterId: 'chapter-5',
    chapterNumber: 5,
    title: 'Developer Profile Branding & The Secret Profile README',
    shortTitle: 'Profile & Secret README',
    shortName: 'Subchapter 5.2: Profile & Secret README',
    summary: 'Build a standout GitHub profile: bio, links, pinned repositories, and creating the special username repository for your dynamic Markdown README.',
    readTime: '6 min read',
    content: d5Part2Content
  }
];

// Fast lookup map supporting both canonical slugs and aliases
export const GIT_SUBCHAPTERS_MAP = (() => {
  const map = new Map();
  GIT_SUBCHAPTERS.forEach(sub => {
    map.set(sub.slug, sub);
    if (sub.aliases) {
      sub.aliases.forEach(alias => map.set(alias, sub));
    }
  });
  return map;
})();

