import {
  DAY_0_TOPIC,
  DAY_1_TOPIC,
  DAY_2_TOPIC,
  DAY_3_TOPIC,
  DAY_4_TOPIC,
  DAY_5_TOPIC,
  DAY_6_TOPIC,
  DAY_7_TOPIC
} from './gitDays/index.js';

function sliceBetween(content, startMarker, endMarker) {
  const start = startMarker ? content.indexOf(startMarker) : 0;
  if (start === -1) return '';
  const end = endMarker ? content.indexOf(endMarker, start) : content.length;
  if (end === -1) return content.slice(start).trim();
  return content.slice(start, end).trim();
}

// =========================================================================
// SLICED CONTENT FOR MODULAR SUBCHAPTERS
// =========================================================================

// Chapter 1
const d1_s1 = DAY_0_TOPIC.content.trim();
const d1_s2 = sliceBetween(DAY_1_TOPIC.content, '### Overview', '### 3. Install Git');
const d1_s3 = sliceBetween(DAY_1_TOPIC.content, '### 3. Install Git', null);

// Chapter 2
const d2_s1 = sliceBetween(DAY_2_TOPIC.content, '### Overview', '### 3. Configuring User Identity');
const d2_s2 = sliceBetween(DAY_2_TOPIC.content, '### 3. Configuring User Identity', '### 4. Essential Behavioral Configurations');
const d2_s3 = sliceBetween(DAY_2_TOPIC.content, '### 4. Essential Behavioral Configurations', '### 5. Inspecting, Verifying & Debugging Configurations');
const d2_s4 = sliceBetween(DAY_2_TOPIC.content, '### 5. Inspecting, Verifying & Debugging Configurations', null);

// Chapter 3
const d3_s1 = sliceBetween(DAY_3_TOPIC.content, '### Overview', '### 3. The Lifecycle of a File in Git');
const d3_s2 = sliceBetween(DAY_3_TOPIC.content, '### 3. The Lifecycle of a File in Git', '### 4. Repository Initialization: `git init`');
const d3_s3 = sliceBetween(DAY_3_TOPIC.content, '### 4. Repository Initialization: `git init`', '### 5. Inspecting the Hidden `.git` Directory');
const d3_s4 = sliceBetween(DAY_3_TOPIC.content, '### 5. Inspecting the Hidden `.git` Directory', null);

// Chapter 4
const d4_s1 = sliceBetween(DAY_4_TOPIC.content, '### Overview', '### 3. Creating Snapshots with `git commit`');
const d4_s2 = sliceBetween(DAY_4_TOPIC.content, '### 3. Creating Snapshots with `git commit`', '### 4. Inspecting History with `git log`');
const d4_s3 = sliceBetween(DAY_4_TOPIC.content, '### 4. Inspecting History with `git log`', '### 5. Ignoring Files with `.gitignore`');
const d4_s4 = sliceBetween(DAY_4_TOPIC.content, '### 5. Ignoring Files with `.gitignore`', null);

// Chapter 5
const d5_s1 = sliceBetween(DAY_5_TOPIC.content, '### Overview', '### 2. Account Creation & Security Essentials');
const d5_s2 = sliceBetween(DAY_5_TOPIC.content, '### 2. Account Creation & Security Essentials', '### 3. GitHub Web Interface Navigation');
const d5_s3 = sliceBetween(DAY_5_TOPIC.content, '### 3. GitHub Web Interface Navigation', '### 4. Customizing Your Public Profile');
const d5_s4 = sliceBetween(DAY_5_TOPIC.content, '### 4. Customizing Your Public Profile', '### 5. The Special "Profile README"');
const d5_s5 = sliceBetween(DAY_5_TOPIC.content, '### 5. The Special "Profile README"', '### 7. Practical Task Walkthrough');
const d5_s6 = sliceBetween(DAY_5_TOPIC.content, '### 7. Practical Task Walkthrough', null);

// Chapter 6
const d6_s1 = sliceBetween(DAY_6_TOPIC.content, '### Overview', '### 2. Public vs. Private Repositories');
const d6_s2 = sliceBetween(DAY_6_TOPIC.content, '### 2. Public vs. Private Repositories', '### 3. Markdown (README.md) Deep Dive');
const d6_s3 = sliceBetween(DAY_6_TOPIC.content, '### 3. Markdown (README.md) Deep Dive', '### 4. Anatomy of a Production-Grade Project README.md');
const d6_s4 = sliceBetween(DAY_6_TOPIC.content, '### 4. Anatomy of a Production-Grade Project README.md', '### 5. Writing Professional Commit Messages');
const d6_s5 = sliceBetween(DAY_6_TOPIC.content, '### 5. Writing Professional Commit Messages', '### 6. Practical Task Walkthrough');
const d6_s6 = sliceBetween(DAY_6_TOPIC.content, '### 6. Practical Task Walkthrough', null);

// Chapter 7
const d7_s1 = sliceBetween(DAY_7_TOPIC.content, '### Overview', '### 2. Two Ways to Connect');
const d7_s2 = sliceBetween(DAY_7_TOPIC.content, '### 2. Two Ways to Connect', '### 3. Authentication: HTTPS vs. SSH');
const d7_s3 = sliceBetween(DAY_7_TOPIC.content, '### 3. Authentication: HTTPS vs. SSH', '### 4. Uploading Commits');
const d7_s4 = sliceBetween(DAY_7_TOPIC.content, '### 4. Uploading Commits', '### 5. Downloading Changes');
const d7_s5 = sliceBetween(DAY_7_TOPIC.content, '### 5. Downloading Changes', '### 6. Practical Task Walkthrough');
const d7_s6 = sliceBetween(DAY_7_TOPIC.content, '### 6. Practical Task Walkthrough', null);

// =========================================================================
// GIT SUBCHAPTERS REGISTRY
// =========================================================================

export const GIT_SUBCHAPTERS = [
  // ── CHAPTER 1: FOUNDATIONS ──
  {
    slug: 'day-0-orientation',
    aliases: ['orientation', 'day-0'],
    chapterId: 'chapter-1',
    chapterNumber: 1,
    title: 'Orientation: Why Git & How This Course Works',
    shortTitle: 'Course Orientation',
    shortName: 'Subchapter 1.1: Orientation',
    summary: DAY_0_TOPIC.summary || 'Understand why Git and GitHub are foundational to modern software engineering.',
    readTime: '5 min read',
    content: d1_s1
  },
  {
    slug: 'git-basics',
    aliases: ['git-vcs-fundamentals', 'day-1-fundamentals', 'day-1', 'git-fundamentals'],
    chapterId: 'chapter-1',
    chapterNumber: 1,
    title: 'Version Control Fundamentals & The 4 Ws of Tracking',
    shortTitle: 'VCS Fundamentals',
    shortName: 'Subchapter 1.2: VCS Fundamentals',
    summary: 'Understand VCS core definition, manual duplicate pitfalls, the 4 Ws of tracking, and why version control matters.',
    readTime: '5 min read',
    content: d1_s2
  },
  {
    slug: 'git-install-verify',
    aliases: ['install-git', 'git-installation', 'verify-git'],
    chapterId: 'chapter-1',
    chapterNumber: 1,
    title: 'Installing & Verifying Git on Windows, macOS & Linux',
    shortTitle: 'Install & Verify',
    shortName: 'Subchapter 1.3: Install & Verify',
    summary: 'Step-by-step installation instructions for Git across Windows (Git Bash), macOS (Homebrew), and Linux (apt), followed by CLI verification.',
    readTime: '4 min read',
    content: d1_s3
  },

  // ── CHAPTER 2: CONFIGURATION ──
  {
    slug: 'git-config-scopes',
    aliases: ['git-config', 'day-2-configuration', 'day-2'],
    chapterId: 'chapter-2',
    chapterNumber: 2,
    title: 'Configuration Scopes & Hierarchical Precedence',
    shortTitle: 'Scopes & Precedence',
    shortName: 'Subchapter 2.1: Scopes & Precedence',
    summary: 'Master Git configuration hierarchy: System, Global, Local, and Worktree scopes, file locations, and precedence rules.',
    readTime: '5 min read',
    content: d2_s1
  },
  {
    slug: 'git-config-identity',
    aliases: ['git-identity', 'configure-user'],
    chapterId: 'chapter-2',
    chapterNumber: 2,
    title: 'Configuring User Identity (Name & Email Standards)',
    shortTitle: 'User Identity',
    shortName: 'Subchapter 2.2: User Identity',
    summary: 'Set author name and email globally and locally, ensuring seamless commit attribution and GitHub contribution graph tracking.',
    readTime: '4 min read',
    content: d2_s2
  },
  {
    slug: 'git-config-defaults',
    aliases: ['git-defaults', 'core-editor', 'autocrlf'],
    chapterId: 'chapter-2',
    chapterNumber: 2,
    title: 'Environment Defaults: Default Branch, Core Editor & autocrlf',
    shortTitle: 'Environment Defaults',
    shortName: 'Subchapter 2.3: Environment Defaults',
    summary: 'Configure modern init.defaultBranch main, core.editor (VS Code), and cross-platform line ending normalization (core.autocrlf).',
    readTime: '5 min read',
    content: d2_s3
  },
  {
    slug: 'git-config-aliases',
    aliases: ['git-aliases', 'config-debug', 'show-origin'],
    chapterId: 'chapter-2',
    chapterNumber: 2,
    title: 'Productive Git Aliases, Unsetting & Config Inspection',
    shortTitle: 'Aliases & Debugging',
    shortName: 'Subchapter 2.4: Aliases & Debugging',
    summary: 'Create time-saving terminal aliases, unsetting obsolete variables, and trace configuration origins with --show-origin.',
    readTime: '5 min read',
    content: d2_s4
  },

  // ── CHAPTER 3: THREE TREES & REPOSITORY BASICS ──
  {
    slug: 'git-three-trees',
    aliases: ['three-trees', 'day-3-repo-basics', 'day-3'],
    chapterId: 'chapter-3',
    chapterNumber: 3,
    title: 'The Three Trees Architecture: Working Tree, Index & HEAD',
    shortTitle: 'The Three Trees',
    shortName: 'Subchapter 3.1: The Three Trees',
    summary: 'Understand the Working Directory (sandbox), Staging Area (the gatekeeper Index), and HEAD Repository commit history.',
    readTime: '5 min read',
    content: d3_s1
  },
  {
    slug: 'git-file-lifecycles',
    aliases: ['file-status-lifecycle', 'git-status-lifecycle'],
    chapterId: 'chapter-3',
    chapterNumber: 3,
    title: 'The 4 File Status Lifecycles in Git',
    shortTitle: 'File Lifecycles',
    shortName: 'Subchapter 3.2: File Lifecycles',
    summary: 'Navigate the complete state transitions of files: Untracked, Unmodified, Modified, and Staged, plus compact status inspection.',
    readTime: '5 min read',
    content: d3_s2
  },
  {
    slug: 'git-init-repo',
    aliases: ['git-init', 'repo-init'],
    chapterId: 'chapter-3',
    chapterNumber: 3,
    title: 'Repository Initialization with git init',
    shortTitle: 'git init Mechanics',
    shortName: 'Subchapter 3.3: git init Mechanics',
    summary: 'Initialize repositories in new and existing directories, behind-the-scenes mechanics, and initial branch creation.',
    readTime: '4 min read',
    content: d3_s3
  },
  {
    slug: 'git-dotgit-anatomy',
    aliases: ['git-init-anatomy', 'repo-init-git-folder', 'git-anatomy'],
    chapterId: 'chapter-3',
    chapterNumber: 3,
    title: 'Deep Dive into the Hidden .git Directory Anatomy',
    shortTitle: '.git Directory Anatomy',
    shortName: 'Subchapter 3.4: .git Anatomy',
    summary: 'Explore the internal architecture of .git: HEAD pointer, config, objects database, refs/heads, hooks, and index.',
    readTime: '6 min read',
    content: d3_s4
  },

  // ── CHAPTER 4: STAGING, COMMITS & HISTORY ──
  {
    slug: 'git-staging-mechanics',
    aliases: ['git-staging-lifecycle', 'git-status-add', 'day-4-basic-commands', 'day-4'],
    chapterId: 'chapter-4',
    chapterNumber: 4,
    title: 'Staging Mechanics with git add & The Index Gatekeeper',
    shortTitle: 'Staging Mechanics',
    shortName: 'Subchapter 4.1: Staging Mechanics',
    summary: 'Stage specific files, whole directories, interactive patch staging (git add -p), and safe unstaging with git restore --staged.',
    readTime: '5 min read',
    content: d4_s1
  },
  {
    slug: 'git-commit-crafting',
    aliases: ['git-commit', 'crafting-commits', 'atomic-commits'],
    chapterId: 'chapter-4',
    chapterNumber: 4,
    title: 'Crafting Snapshots with git commit & Atomic Principles',
    shortTitle: 'Commit Crafting',
    shortName: 'Subchapter 4.2: Commit Crafting',
    summary: 'Create permanent snapshots with git commit, multi-line commit messages, the -am shortcut, and atomic commit philosophy.',
    readTime: '5 min read',
    content: d4_s2
  },
  {
    slug: 'git-log-inspection',
    aliases: ['git-log', 'log-inspection'],
    chapterId: 'chapter-4',
    chapterNumber: 4,
    title: 'Inspecting History with git log (Graphs, Formats & Filters)',
    shortTitle: 'git log Inspection',
    shortName: 'Subchapter 4.3: git log Inspection',
    summary: 'Format commit histories with --oneline, --graph, --decorate, date filters, author constraints, and Git pager navigation.',
    readTime: '5 min read',
    content: d4_s3
  },
  {
    slug: 'git-gitignore-rules',
    aliases: ['git-history-ignore', 'git-log-ignore', 'git-history', 'gitignore-patterns'],
    chapterId: 'chapter-4',
    chapterNumber: 4,
    title: 'Excluding Files with .gitignore & Pattern Syntax Rules',
    shortTitle: '.gitignore Rules & Lab',
    shortName: 'Subchapter 4.4: .gitignore Rules',
    summary: 'Protect secrets and ignore build artifacts using .gitignore pattern syntax, negation rules, and untracking cached files.',
    readTime: '6 min read',
    content: d4_s4
  },

  // ── CHAPTER 5: GITHUB ESSENTIALS & PROFILE ──
  {
    slug: 'github-platform-overview',
    aliases: ['github-platform-security', 'github-essentials', 'git-github', 'day-5-github-essentials', 'day-5'],
    chapterId: 'chapter-5',
    chapterNumber: 5,
    title: 'GitHub Platform Architecture & Cloud Collaboration',
    shortTitle: 'Platform Architecture',
    shortName: 'Subchapter 5.1: Platform Architecture',
    summary: 'Understand Git vs GitHub, off-site remote backup, collaborative pull requests, automated CI/CD actions, and living developer resumes.',
    readTime: '5 min read',
    content: d5_s1
  },
  {
    slug: 'github-account-security',
    aliases: ['github-security', 'mandatory-2fa', 'github-2fa'],
    chapterId: 'chapter-5',
    chapterNumber: 5,
    title: 'Account Creation & Mandatory Two-Factor Authentication (2FA)',
    shortTitle: 'Account & 2FA Security',
    shortName: 'Subchapter 5.2: Account & 2FA',
    summary: 'Set up an engineering GitHub account, username strategy, email matching for commit credit, and mandatory TOTP/authenticator 2FA.',
    readTime: '5 min read',
    content: d5_s2
  },
  {
    slug: 'github-interface-navigation',
    aliases: ['github-ui', 'github-navigation'],
    chapterId: 'chapter-5',
    chapterNumber: 5,
    title: 'Navigating the GitHub Web Interface & Terminology',
    shortTitle: 'Interface Navigation',
    shortName: 'Subchapter 5.3: Interface Navigation',
    summary: 'Master the GitHub global dashboard, top navigation bar, repositories explorer, pull requests, issues, and notification center.',
    readTime: '4 min read',
    content: d5_s3
  },
  {
    slug: 'github-profile-branding',
    aliases: ['profile-customization', 'mscprpcem-profile'],
    chapterId: 'chapter-5',
    chapterNumber: 5,
    title: 'Customizing Your Public Developer Profile (MSC PRPCEM Details)',
    shortTitle: 'Profile Customization',
    shortName: 'Subchapter 5.4: Profile Customization',
    summary: 'Design an impactful developer profile: bio, MSC PRPCEM affiliations, pinned repositories, and green contribution graph heatmap.',
    readTime: '5 min read',
    content: d5_s4
  },
  {
    slug: 'github-secret-readme',
    aliases: ['github-profile-readme', 'github-profile', 'profile-readme', 'secret-repo'],
    chapterId: 'chapter-5',
    chapterNumber: 5,
    title: 'The Special "Profile README" Secret Repository',
    shortTitle: 'Secret Profile README',
    shortName: 'Subchapter 5.5: Secret README',
    summary: 'Discover the secret username/username repository, 4 strict requirements, dynamic shields.io badges, and markdown profile architecture.',
    readTime: '5 min read',
    content: d5_s5
  },
  {
    slug: 'github-profile-lab',
    aliases: ['profile-readme-lab', 'mscprpcem-readme-lab'],
    chapterId: 'chapter-5',
    chapterNumber: 5,
    title: 'Practical Lab: Building Your MSC PRPCEM Profile README',
    shortTitle: 'Profile README Lab',
    shortName: 'Subchapter 5.6: Profile Lab',
    summary: 'Hands-on walkthrough creating your special profile repository with full MSC PRPCEM Markdown bio, badges, and stats.',
    readTime: '6 min read',
    content: d5_s6
  },

  // ── CHAPTER 6: REPOSITORIES & DOCUMENTATION ──
  {
    slug: 'github-create-repo',
    aliases: ['git-remotes', 'create-repo', 'day-6-remote-repos', 'day-6'],
    chapterId: 'chapter-6',
    chapterNumber: 6,
    title: 'Creating a Remote Repository on GitHub',
    shortTitle: 'Remote Repo Setup',
    shortName: 'Subchapter 6.1: Remote Repo Setup',
    summary: 'Set up remote repositories on GitHub, configure kebab-case names, .gitignore templates, licenses, and scratch vs local repo rules.',
    readTime: '5 min read',
    content: d6_s1
  },
  {
    slug: 'public-vs-private-repos',
    aliases: ['repo-visibility', 'danger-zone-visibility', 'github-repo-visibility'],
    chapterId: 'chapter-6',
    chapterNumber: 6,
    title: 'Public vs. Private Repositories & Access Controls',
    shortTitle: 'Public vs Private Repos',
    shortName: 'Subchapter 6.2: Public vs Private',
    summary: 'Compare visibility models, search engine indexing, collaborator push privileges, danger zone secret risks, and switching visibility.',
    readTime: '4 min read',
    content: d6_s2
  },
  {
    slug: 'markdown-readme-guide',
    aliases: ['markdown-guide', 'gfm-syntax', 'readme-markdown'],
    chapterId: 'chapter-6',
    chapterNumber: 6,
    title: 'Markdown (README.md) Deep Dive & GFM Syntax',
    shortTitle: 'Markdown Deep Dive',
    shortName: 'Subchapter 6.3: Markdown Deep Dive',
    summary: 'Master GitHub Flavored Markdown (GFM): headings, task lists, links, fenced syntax-highlighted code blocks, and markdown tables.',
    readTime: '5 min read',
    content: d6_s3
  },
  {
    slug: 'project-readme-anatomy',
    aliases: ['project-readme', 'readme-anatomy'],
    chapterId: 'chapter-6',
    chapterNumber: 6,
    title: 'Anatomy of a Production-Grade Project README.md',
    shortTitle: 'Production README Anatomy',
    shortName: 'Subchapter 6.4: README Anatomy',
    summary: 'The 7 essential sections of a production project README: Title & Badges, Overview, Features, Prerequisites, Setup, Usage, and License.',
    readTime: '5 min read',
    content: d6_s4
  },
  {
    slug: 'git-conventional-commits',
    aliases: ['conventional-commits', 'commit-message-rules', 'conventional-commit-messages'],
    chapterId: 'chapter-6',
    chapterNumber: 6,
    title: 'Writing Professional Commit Messages & Conventional Commits',
    shortTitle: 'Conventional Commits',
    shortName: 'Subchapter 6.5: Conventional Commits',
    summary: 'The 3 golden rules of commit formatting (imperative mood, 50/72 rule) and the industry Conventional Commits standard (feat, fix, docs, chore).',
    readTime: '5 min read',
    content: d6_s5
  },
  {
    slug: 'task-tracker-cli-lab',
    aliases: ['task-tracker-cli', 'project-readme-commits', 'chapter-6-lab'],
    chapterId: 'chapter-6',
    chapterNumber: 6,
    title: 'Practical Lab: Create a Repository with a Production README',
    shortTitle: 'Task Tracker CLI Lab',
    shortName: 'Subchapter 6.6: Task Tracker Lab',
    summary: 'Step-by-step walkthrough creating task-tracker-cli on GitHub with a complete production README.md, Conventional Commit, and quick reference.',
    readTime: '6 min read',
    content: d6_s6
  },

  // ── CHAPTER 7: GIT REMOTES & CLOUD SYNC ──
  {
    slug: 'git-remotes-concept',
    aliases: ['git-remotes', 'origin-alias', 'day-7-cloud-sync', 'day-7'],
    chapterId: 'chapter-7',
    chapterNumber: 7,
    title: 'Git Remotes Architecture & The origin Alias',
    shortTitle: 'Remotes & origin Alias',
    shortName: 'Subchapter 7.1: Remotes & origin',
    summary: 'Understand remote bookmarks, why the primary remote is named origin, and the client-server synchronization architecture.',
    readTime: '5 min read',
    content: d7_s1
  },
  {
    slug: 'git-clone-vs-remote-add',
    aliases: ['git-clone', 'git-remote-add', 'connecting-remotes'],
    chapterId: 'chapter-7',
    chapterNumber: 7,
    title: 'Connecting Repositories: Remote-First (clone) vs Local-First (remote add)',
    shortTitle: 'clone vs remote add',
    shortName: 'Subchapter 7.2: clone vs remote add',
    summary: 'Master the two ways to connect local and cloud repos: git clone for existing repos and git remote add for local-first projects.',
    readTime: '5 min read',
    content: d7_s2
  },
  {
    slug: 'git-auth-https-ssh',
    aliases: ['https-vs-ssh', 'git-auth', 'github-pat', 'git-credentials'],
    chapterId: 'chapter-7',
    chapterNumber: 7,
    title: 'Authentication Protocols: HTTPS & PATs vs. SSH Keys',
    shortTitle: 'HTTPS vs SSH Auth',
    shortName: 'Subchapter 7.3: HTTPS vs SSH',
    summary: 'Securely authenticate with GitHub using Git Credential Manager, Personal Access Tokens (PATs), and SSH keypairs.',
    readTime: '4 min read',
    content: d7_s3
  },
  {
    slug: 'git-push-upstream',
    aliases: ['git-push', 'set-upstream', 'upstream-tracking'],
    chapterId: 'chapter-7',
    chapterNumber: 7,
    title: 'Uploading Commits: git push & Upstream Tracking (-u)',
    shortTitle: 'git push & Upstream',
    shortName: 'Subchapter 7.4: push & Upstream',
    summary: 'Upload local commits with git push -u origin main, establish branch tracking in .git/config, and subsequent pushes.',
    readTime: '4 min read',
    content: d7_s4
  },
  {
    slug: 'git-fetch-vs-pull',
    aliases: ['git-fetch', 'git-pull', 'fetch-vs-pull'],
    chapterId: 'chapter-7',
    chapterNumber: 7,
    title: 'Downloading Changes: git fetch vs. git pull Deep Dive',
    shortTitle: 'fetch vs pull Deep Dive',
    shortName: 'Subchapter 7.5: fetch vs pull',
    summary: 'Understand git fetch (safe inspection without touching local files) vs git pull (fetch + merge shortcut) and conflict prevention.',
    readTime: '5 min read',
    content: d7_s5
  },
  {
    slug: 'git-sync-clone-lab',
    aliases: ['git-sync-lab', 'msc-local-sync-demo', 'chapter-7-lab'],
    chapterId: 'chapter-7',
    chapterNumber: 7,
    title: 'Practical Lab: Push, Sync & Clone Walkthrough',
    shortTitle: 'Cloud Sync Practical Lab',
    shortName: 'Subchapter 7.6: Sync Practical Lab',
    summary: 'Hands-on practice pushing an existing project, simulating remote cloud changes with fetch/pull, and cloning repositories.',
    readTime: '6 min read',
    content: d7_s6
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
