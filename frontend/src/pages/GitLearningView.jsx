import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2, CheckCheck, Play, ChevronDown, ArrowLeft, ArrowRight,
  Menu, X, Clock, Terminal, Copy, Check, ExternalLink,
  Trophy, AlertTriangle, Info, GitBranch, BookOpen, Lightbulb,
  Code, Eye
} from 'lucide-react';
import { GIT_CURRICULUM } from '../data/gitCurriculumData';
import { DAY_0_TOPIC, DAY_1_TOPIC, DAY_2_TOPIC, DAY_3_TOPIC, DAY_4_TOPIC, DAY_5_TOPIC } from '../data/gitDays/index.js';
import { GIT_SUBCHAPTERS, GIT_SUBCHAPTERS_MAP } from '../data/gitSubchapters.js';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/**
 * 30 Official Chapters for the Git & GitHub Track (Chapters 1 through 30)
 */
export const GIT_CHAPTERS = [
  // Part 1: Foundations & Daily Workflow (Chapters 1–7)
  {
    id: 'chapter-1',
    number: 1,
    title: 'Chapter 1: Orientation & Version Control Fundamentals',
    shortTitle: 'Chapter 1: VCS Fundamentals',
    part: 'Part 1',
    partTitle: 'Part 1: Foundations & Daily Workflow',
    badge: 'Chapter 1',
    topics: ['day-0-orientation', 'git-basics', 'git-install-verify']
  },
  {
    id: 'chapter-2',
    number: 2,
    title: 'Chapter 2: Git Configuration & Identity Architecture',
    shortTitle: 'Chapter 2: Configuration',
    part: 'Part 1',
    partTitle: 'Part 1: Foundations & Daily Workflow',
    badge: 'Chapter 2',
    topics: ['git-config-scopes', 'git-config-identity', 'git-config-defaults', 'git-config-aliases']
  },
  {
    id: 'chapter-3',
    number: 3,
    title: 'Chapter 3: Three Trees Architecture & Repository Initialization',
    shortTitle: 'Chapter 3: Three Trees & Init',
    part: 'Part 1',
    partTitle: 'Part 1: Foundations & Daily Workflow',
    badge: 'Chapter 3',
    topics: ['git-three-trees', 'git-file-lifecycles', 'git-init-repo', 'git-dotgit-anatomy']
  },
  {
    id: 'chapter-4',
    number: 4,
    title: 'Chapter 4: Staging Mechanics, Atomic Commits & History Inspection',
    shortTitle: 'Chapter 4: Staging & Snapshots',
    part: 'Part 1',
    partTitle: 'Part 1: Foundations & Daily Workflow',
    badge: 'Chapter 4',
    topics: ['git-staging-mechanics', 'git-commit-crafting', 'git-log-inspection', 'git-gitignore-rules']
  },
  {
    id: 'chapter-5',
    number: 5,
    title: 'Chapter 5: GitHub Essentials & Developer Profile Branding',
    shortTitle: 'Chapter 5: GitHub Essentials',
    part: 'Part 1',
    partTitle: 'Part 1: Foundations & Daily Workflow',
    badge: 'Chapter 5',
    topics: [
      'github-platform-overview',
      'github-account-security',
      'github-interface-navigation',
      'github-profile-branding',
      'github-secret-readme',
      'github-profile-lab'
    ]
  },
  {
    id: 'chapter-6',
    number: 6,
    title: 'Chapter 6: Repositories & Documentation (Public vs Private, Markdown, README & Conventional Commits)',
    shortTitle: 'Chapter 6: Repos & Docs',
    part: 'Part 1',
    partTitle: 'Part 1: Foundations & Daily Workflow',
    badge: 'Chapter 6',
    topics: [
      'github-create-repo',
      'public-vs-private-repos',
      'markdown-readme-guide',
      'project-readme-anatomy',
      'git-conventional-commits',
      'task-tracker-cli-lab'
    ]
  },
  {
    id: 'chapter-7',
    number: 7,
    title: 'Chapter 7: Git Remotes & Cloud Sync (Push, Fetch vs Pull, Remotes & Clones)',
    shortTitle: 'Chapter 7: Remotes & Sync',
    part: 'Part 1',
    partTitle: 'Part 1: Foundations & Daily Workflow',
    badge: 'Chapter 7',
    topics: [
      'git-remotes-concept',
      'git-clone-vs-remote-add',
      'git-auth-https-ssh',
      'git-push-upstream',
      'git-fetch-vs-pull',
      'git-sync-clone-lab'
    ]
  },

  // Part 2: Branching & History Manipulation (Chapters 8–14)
  {
    id: 'chapter-8',
    number: 8,
    title: 'Chapter 8: Ignoring Files (.gitignore Patterns & Rules)',
    shortTitle: 'Chapter 8: Ignoring Files',
    part: 'Part 2',
    partTitle: 'Part 2: Branching & History Manipulation',
    badge: 'Chapter 8',
    topics: ['gitignore']
  },
  {
    id: 'chapter-9',
    number: 9,
    title: 'Chapter 9: Branching Fundamentals & Pointer Mechanics',
    shortTitle: 'Chapter 9: Branching Basics',
    part: 'Part 2',
    partTitle: 'Part 2: Branching & History Manipulation',
    badge: 'Chapter 9',
    topics: ['branching-basics']
  },
  {
    id: 'chapter-10',
    number: 10,
    title: 'Chapter 10: Branch Switching & Detached HEAD (git switch, git checkout)',
    shortTitle: 'Chapter 10: Switching Branches',
    part: 'Part 2',
    partTitle: 'Part 2: Branching & History Manipulation',
    badge: 'Chapter 10',
    topics: ['checkout-switch']
  },
  {
    id: 'chapter-11',
    number: 11,
    title: 'Chapter 11: Merging Mechanics (Fast-Forward vs 3-Way Recursive Merges)',
    shortTitle: 'Chapter 11: Merging Mechanics',
    part: 'Part 2',
    partTitle: 'Part 2: Branching & History Manipulation',
    badge: 'Chapter 11',
    topics: ['merging-mechanics']
  },
  {
    id: 'chapter-12',
    number: 12,
    title: 'Chapter 12: Resolving Merge Conflicts Confidently',
    shortTitle: 'Chapter 12: Merge Conflicts',
    part: 'Part 2',
    partTitle: 'Part 2: Branching & History Manipulation',
    badge: 'Chapter 12',
    topics: ['merge-conflicts']
  },
  {
    id: 'chapter-13',
    number: 13,
    title: 'Chapter 13: Linear Rebasing & The Golden Rule',
    shortTitle: 'Chapter 13: Rebasing',
    part: 'Part 2',
    partTitle: 'Part 2: Branching & History Manipulation',
    badge: 'Chapter 13',
    topics: ['rebasing-linear']
  },
  {
    id: 'chapter-14',
    number: 14,
    title: 'Chapter 14: Context Switching with git stash',
    shortTitle: 'Chapter 14: Stashing',
    part: 'Part 2',
    partTitle: 'Part 2: Branching & History Manipulation',
    badge: 'Chapter 14',
    topics: ['stashing-changes']
  },

  // Part 3: GitHub & Team Collaboration (Chapters 15–21)
  {
    id: 'chapter-15',
    number: 15,
    title: 'Chapter 15: Undoing Changes: restore, reset & revert',
    shortTitle: 'Chapter 15: Undoing Changes',
    part: 'Part 3',
    partTitle: 'Part 3: GitHub & Team Collaboration',
    badge: 'Chapter 15',
    topics: ['undoing-changes']
  },
  {
    id: 'chapter-16',
    number: 16,
    title: 'Chapter 16: Cherry-Picking Commits (git cherry-pick)',
    shortTitle: 'Chapter 16: Cherry-Pick',
    part: 'Part 3',
    partTitle: 'Part 3: GitHub & Team Collaboration',
    badge: 'Chapter 16',
    topics: ['cherry-pick']
  },
  {
    id: 'chapter-17',
    number: 17,
    title: 'Chapter 17: Remote Configuration & Origin Conventions',
    shortTitle: 'Chapter 17: Remote Origins',
    part: 'Part 3',
    partTitle: 'Part 3: GitHub & Team Collaboration',
    badge: 'Chapter 17',
    topics: ['remotes-origin']
  },
  {
    id: 'chapter-18',
    number: 18,
    title: 'Chapter 18: Synchronization: fetch vs pull vs push',
    shortTitle: 'Chapter 18: Fetch, Pull & Push',
    part: 'Part 3',
    partTitle: 'Part 3: GitHub & Team Collaboration',
    badge: 'Chapter 18',
    topics: ['fetch-pull-push']
  },
  {
    id: 'chapter-19',
    number: 19,
    title: 'Chapter 19: Upstream Tracking & Upstream Branches',
    shortTitle: 'Chapter 19: Upstream Tracking',
    part: 'Part 3',
    partTitle: 'Part 3: GitHub & Team Collaboration',
    badge: 'Chapter 19',
    topics: ['upstream-tracking']
  },
  {
    id: 'chapter-20',
    number: 20,
    title: 'Chapter 20: Open-Source Fork-and-Pull Workflows',
    shortTitle: 'Chapter 20: Forks & Sync',
    part: 'Part 3',
    partTitle: 'Part 3: GitHub & Team Collaboration',
    badge: 'Chapter 20',
    topics: ['forks-sync']
  },
  {
    id: 'chapter-21',
    number: 21,
    title: 'Chapter 21: High-Impact Pull Requests & Issue Linking',
    shortTitle: 'Chapter 21: Pull Requests',
    part: 'Part 3',
    partTitle: 'Part 3: GitHub & Team Collaboration',
    badge: 'Chapter 21',
    topics: ['pull-requests']
  },

  // Part 4: Power Tools & Production Mastery (Chapters 22–30)
  {
    id: 'chapter-22',
    number: 22,
    title: 'Chapter 22: Professional Code Reviews & Suggestions',
    shortTitle: 'Chapter 22: Code Reviews',
    part: 'Part 4',
    partTitle: 'Part 4: Power Tools & Production Mastery',
    badge: 'Chapter 22',
    topics: ['code-reviews']
  },
  {
    id: 'chapter-23',
    number: 23,
    title: 'Chapter 23: GitHub Projects, Milestones & Backlogs',
    shortTitle: 'Chapter 23: Issues & Projects',
    part: 'Part 4',
    partTitle: 'Part 4: Power Tools & Production Mastery',
    badge: 'Chapter 23',
    topics: ['issues-projects']
  },
  {
    id: 'chapter-24',
    number: 24,
    title: 'Chapter 24: Interactive Rebase: Squash & Reword (git rebase -i)',
    shortTitle: 'Chapter 24: Interactive Rebase',
    part: 'Part 4',
    partTitle: 'Part 4: Power Tools & Production Mastery',
    badge: 'Chapter 24',
    topics: ['interactive-rebase']
  },
  {
    id: 'chapter-25',
    number: 25,
    title: 'Chapter 25: Disaster Recovery with git reflog',
    shortTitle: 'Chapter 25: Reflog Recovery',
    part: 'Part 4',
    partTitle: 'Part 4: Power Tools & Production Mastery',
    badge: 'Chapter 25',
    topics: ['git-reflog']
  },
  {
    id: 'chapter-26',
    number: 26,
    title: 'Chapter 26: Binary Bug Hunting with git bisect',
    shortTitle: 'Chapter 26: Bisect Debugging',
    part: 'Part 4',
    partTitle: 'Part 4: Power Tools & Production Mastery',
    badge: 'Chapter 26',
    topics: ['git-bisect']
  },
  {
    id: 'chapter-27',
    number: 27,
    title: 'Chapter 27: Semantic Versioning, Tags & GitHub Releases',
    shortTitle: 'Chapter 27: Tags & Releases',
    part: 'Part 4',
    partTitle: 'Part 4: Power Tools & Production Mastery',
    badge: 'Chapter 27',
    topics: ['tags-semver', 'github-releases']
  },
  {
    id: 'chapter-28',
    number: 28,
    title: 'Chapter 28: GitHub Actions CI/CD Automated Pipelines',
    shortTitle: 'Chapter 28: GitHub Actions',
    part: 'Part 4',
    partTitle: 'Part 4: Power Tools & Production Mastery',
    badge: 'Chapter 28',
    topics: ['github-actions']
  },
  {
    id: 'chapter-29',
    number: 29,
    title: 'Chapter 29: Production Branching & Emergency Incident Recovery',
    shortTitle: 'Chapter 29: Production Incidents',
    part: 'Part 4',
    partTitle: 'Part 4: Power Tools & Production Mastery',
    badge: 'Chapter 29',
    topics: ['team-git-workflows', 'secret-scrubbing', 'emergency-hotfix', 'multi-branch-conflicts']
  },
  {
    id: 'chapter-30',
    number: 30,
    title: 'Chapter 30: Open Source Contribution, DCO & Ecosystem',
    shortTitle: 'Chapter 30: Open Source & DCO',
    part: 'Part 4',
    partTitle: 'Part 4: Power Tools & Production Mastery',
    badge: 'Chapter 30',
    topics: ['open-source-contributing']
  }
];

/**
 * Clean, Concise Short Names for Sidebar & Navigation (Chapter-based, No Days)
 */
export const TOPIC_SHORT_NAMES = {
  // Chapter 1: Orientation & VCS Fundamentals
  'day-0-orientation': 'Subchapter 1.1: Orientation',
  'git-basics': 'Subchapter 1.2: VCS Fundamentals',
  'git-vcs-fundamentals': 'Subchapter 1.2: VCS Fundamentals',
  'day-1-fundamentals': 'Subchapter 1.2: VCS Fundamentals',
  'git-install-verify': 'Subchapter 1.3: Install & Verify',

  // Chapter 2: Configuration
  'git-config-scopes': 'Subchapter 2.1: Scopes & Precedence',
  'git-config-identity': 'Subchapter 2.2: User Identity',
  'git-config-defaults': 'Subchapter 2.3: Environment Defaults',
  'git-config-aliases': 'Subchapter 2.4: Aliases & Debugging',
  'git-config': 'Subchapter 2.1: Scopes & Precedence',
  'day-2-configuration': 'Subchapter 2.1: Scopes & Precedence',

  // Chapter 3: Repo Anatomy
  'git-three-trees': 'Subchapter 3.1: The Three Trees',
  'git-file-lifecycles': 'Subchapter 3.2: File Lifecycles',
  'git-init-repo': 'Subchapter 3.3: git init Mechanics',
  'git-dotgit-anatomy': 'Subchapter 3.4: .git Anatomy',
  'git-init-anatomy': 'Subchapter 3.4: .git Anatomy',
  'repo-init-git-folder': 'Subchapter 3.1: The Three Trees',
  'git-init': 'Subchapter 3.3: git init Mechanics',
  'day-3-repo-basics': 'Subchapter 3.1: The Three Trees',

  // Chapter 4: Staging & Commits
  'git-staging-mechanics': 'Subchapter 4.1: Staging Mechanics',
  'git-commit-crafting': 'Subchapter 4.2: Commit Crafting',
  'git-log-inspection': 'Subchapter 4.3: git log Inspection',
  'git-gitignore-rules': 'Subchapter 4.4: .gitignore Rules',
  'git-staging-lifecycle': 'Subchapter 4.1: Staging Mechanics',
  'git-history-ignore': 'Subchapter 4.4: .gitignore Rules',
  'git-add-commit-status': 'Subchapter 4.1: Staging Mechanics',
  'git-status-add': 'Subchapter 4.1: Staging Mechanics',
  'day-4-basic-commands': 'Subchapter 4.1: Staging Mechanics',

  // Chapter 5: GitHub Essentials
  'github-platform-overview': 'Subchapter 5.1: Platform Architecture',
  'github-account-security': 'Subchapter 5.2: Account & 2FA',
  'github-interface-navigation': 'Subchapter 5.3: Interface Navigation',
  'github-profile-branding': 'Subchapter 5.4: Profile Customization',
  'github-secret-readme': 'Subchapter 5.5: Secret README',
  'github-profile-lab': 'Subchapter 5.6: Profile Lab',
  'github-platform-security': 'Subchapter 5.1: Platform Architecture',
  'github-profile-readme': 'Subchapter 5.5: Secret README',
  'github-remotes': 'Subchapter 5.1: Platform Architecture',
  'github-essentials': 'Subchapter 5.1: Platform Architecture',
  'day-5-github-essentials': 'Subchapter 5.1: Platform Architecture',
  'git-github': 'Subchapter 5.1: Platform Architecture',

  // Chapter 6: Repositories & Documentation
  'github-create-repo': 'Subchapter 6.1: Remote Repo Setup',
  'public-vs-private-repos': 'Subchapter 6.2: Public vs Private',
  'markdown-readme-guide': 'Subchapter 6.3: Markdown Deep Dive',
  'project-readme-anatomy': 'Subchapter 6.4: README Anatomy',
  'git-conventional-commits': 'Subchapter 6.5: Conventional Commits',
  'task-tracker-cli-lab': 'Subchapter 6.6: Task Tracker Lab',
  'project-readme-commits': 'Subchapter 6.6: Task Tracker Lab',
  'day-6-remote-repos': 'Subchapter 6.1: Remote Repo Setup',

  // Chapter 7: Git Remotes & Cloud Sync
  'git-remotes-concept': 'Subchapter 7.1: Remotes & origin',
  'git-clone-vs-remote-add': 'Subchapter 7.2: clone vs remote add',
  'git-auth-https-ssh': 'Subchapter 7.3: HTTPS vs SSH',
  'git-push-upstream': 'Subchapter 7.4: push & Upstream',
  'git-fetch-vs-pull': 'Subchapter 7.5: fetch vs pull',
  'git-sync-clone-lab': 'Subchapter 7.6: Sync Practical Lab',
  'day-7-cloud-sync': 'Subchapter 7.1: Remotes & origin',
  'git-remotes': 'Subchapter 7.1: Remotes & origin',
  'git-fetch': 'Subchapter 7.5: fetch vs pull',
  'git-pull': 'Subchapter 7.5: fetch vs pull',
  'git-push': 'Subchapter 7.4: push & Upstream',
  'git-clone': 'Subchapter 7.2: clone vs remote add',

  // Future Chapters
  'git-log': 'Chapter 8: History & Logs',
  'git-diff': 'Chapter 9: Comparing States',
  'gitignore': 'Chapter 9: Ignoring Files',
  'branching-basics': 'Chapter 10: Branching Basics',
  'checkout-switch': 'Chapter 11: Switching Branches',
  // Chapter 11: Merging Mechanics
  'merging-mechanics': 'Chapter 11: Merging Mechanics',
  // Chapter 12: Merge Conflicts
  'merge-conflicts': 'Chapter 12: Merge Conflicts',
  // Chapter 13: Rebasing
  'rebasing-linear': 'Chapter 13: Rebasing',
  // Chapter 14: Stashing
  'stashing-changes': 'Chapter 14: Stashing',
  // Chapter 15: Undoing Mistakes
  'undoing-changes': 'Chapter 15: Undoing Changes',
  // Chapter 16: Cherry-Pick
  'cherry-pick': 'Chapter 16: Cherry-Pick',
  // Chapter 17: Remote Origins
  'remotes-origin': 'Chapter 17: Remote Origins',
  // Chapter 18: Fetch, Pull & Push
  'fetch-pull-push': 'Chapter 18: Fetch, Pull & Push',
  // Chapter 19: Upstream Tracking
  'upstream-tracking': 'Chapter 19: Upstream Tracking',
  // Chapter 20: Forks & Sync
  'forks-sync': 'Chapter 20: Forks & Sync',
  // Chapter 21: Pull Requests
  'pull-requests': 'Chapter 21: Pull Requests',
  // Chapter 22: Code Reviews
  'code-reviews': 'Chapter 22: Code Reviews',
  // Chapter 23: Issues & Projects
  'issues-projects': 'Chapter 23: Issues & Projects',
  // Chapter 24: Interactive Rebase
  'interactive-rebase': 'Chapter 24: Interactive Rebase',
  // Chapter 25: Reflog Recovery
  'git-reflog': 'Chapter 25: Reflog Recovery',
  // Chapter 26: Bisect Debugging
  'git-bisect': 'Chapter 26: Bisect Debugging',
  // Chapter 27: Tags & Releases
  'tags-semver': 'Subchapter 27.1: Semantic Tags',
  'github-releases': 'Subchapter 27.2: GitHub Releases',
  // Chapter 28: GitHub Actions
  'github-actions': 'Chapter 28: GitHub Actions',
  // Chapter 29: Production & Incident Recovery
  'team-git-workflows': 'Subchapter 29.1: Trunk vs GitFlow',
  'secret-scrubbing': 'Subchapter 29.2: Secret Scrubbing',
  'emergency-hotfix': 'Subchapter 29.3: Hotfix Recovery',
  'multi-branch-conflicts': 'Subchapter 29.4: Mega Conflicts',
  // Chapter 30: Open Source & DCO
  'open-source-contributing': 'Chapter 30: Open Source & DCO'
};

/**
 * Render inline markdown text (bold, italic, code, images/badges, links)
 */
function renderMarkdownInline(text) {
  if (!text) return null;
  const parts = [];
  const regex = /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s<)]+|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/gi;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    
    // Image or badge: ![alt](src)
    if (token.startsWith('![')) {
      const imgMatch = token.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const [, alt, src] = imgMatch;
        parts.push(
          <img
            key={match.index}
            src={src}
            alt={alt}
            className="inline-block mr-2 my-0.5 max-h-5 object-contain rounded-xs"
            loading="lazy"
          />
        );
      } else {
        parts.push(token);
      }
    }
    // Link: [label](url)
    else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const linkMatch = token.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        const [, label, url] = linkMatch;
        parts.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors cursor-pointer"
          >
            <span>{label}</span>
            <ExternalLink size={10} className="inline-block shrink-0 opacity-70" />
          </a>
        );
      } else {
        parts.push(token);
      }
    }
    // Raw URL
    else if (token.startsWith('http://') || token.startsWith('https://')) {
      parts.push(
        <a
          key={match.index}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors cursor-pointer"
        >
          <span>{token}</span>
          <ExternalLink size={10} className="inline-block shrink-0 opacity-70" />
        </a>
      );
    }
    // Bold: **text**
    else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    }
    // Inline code: `code`
    else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200/70 px-1.5 py-0.5 rounded whitespace-nowrap inline-block">
          {token.slice(1, -1).trim()}
        </code>
      );
    }
    // Italic: *text*
    else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-700">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

/**
 * Render Markdown content as a simulated GitHub README.md Preview
 */
function MarkdownPreviewBox({ content }) {
  const elements = useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    const items = [];
    let i = 0;

    while (i < lines.length) {
      const raw = lines[i];
      const trimmed = raw.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      // Code block inside README
      if (trimmed.startsWith('```')) {
        const lang = trimmed.replace('```', '').trim();
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++;
        items.push({ type: 'code', lang, code: codeLines.join('\n') });
        continue;
      }

      // Horizontal rule
      if (/^---$|^___$|^\*\*\*$/.test(trimmed)) {
        items.push({ type: 'hr' });
        i++;
        continue;
      }

      // Headings
      if (trimmed.startsWith('# ')) {
        items.push({ type: 'h1', text: trimmed.slice(2).trim() });
        i++;
        continue;
      }
      if (trimmed.startsWith('## ')) {
        items.push({ type: 'h2', text: trimmed.slice(3).trim() });
        i++;
        continue;
      }
      if (trimmed.startsWith('### ')) {
        items.push({ type: 'h3', text: trimmed.slice(4).trim() });
        i++;
        continue;
      }

      // Table
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines = [trimmed];
        i++;
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }
        items.push({ type: 'table', lines: tableLines });
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('>')) {
        const quoteLines = [trimmed.replace(/^>\s*/, '')];
        i++;
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
          i++;
        }
        items.push({ type: 'quote', text: quoteLines.join(' ') });
        continue;
      }

      // Task list item
      if (/^[-*]\s+\[([ xX])\]\s+/.test(trimmed)) {
        const checked = /\[[xX]\]/.test(trimmed);
        const text = trimmed.replace(/^[-*]\s+\[([ xX])\]\s+/, '');
        items.push({ type: 'task', checked, text });
        i++;
        continue;
      }

      // List items
      if (/^[-*]\s+/.test(trimmed)) {
        items.push({ type: 'li', text: trimmed.replace(/^[-*]\s+/, '') });
        i++;
        continue;
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        items.push({ type: 'ol_item', text: trimmed.replace(/^\d+\.\s+/, '') });
        i++;
        continue;
      }

      // Regular paragraph / badges
      items.push({ type: 'p', text: trimmed });
      i++;
    }

    return items;
  }, [content]);

  return (
    <div className="bg-white p-5 sm:p-6 border-t border-slate-200 text-slate-800 text-sm space-y-3 font-sans">
      {/* GitHub Preview Subheader Banner */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 text-xs text-slate-500 font-mono">
        <span className="flex items-center gap-1.5 text-slate-700 font-bold">
          <BookOpen size={13} className="text-blue-600" />
          README.md Preview (Simulated GitHub Render)
        </span>
        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
          Markdown View
        </span>
      </div>

      {elements.map((el, idx) => {
        if (el.type === 'h1') {
          return (
            <h1 key={idx} className="text-xl sm:text-2xl font-black text-slate-900 pb-2 border-b border-slate-200 pt-1">
              {renderMarkdownInline(el.text)}
            </h1>
          );
        }
        if (el.type === 'h2') {
          return (
            <h2 key={idx} className="text-base sm:text-lg font-bold text-slate-900 pb-1.5 border-b border-slate-100 pt-3">
              {renderMarkdownInline(el.text)}
            </h2>
          );
        }
        if (el.type === 'h3') {
          return (
            <h3 key={idx} className="text-sm sm:text-base font-bold text-slate-800 pt-2">
              {renderMarkdownInline(el.text)}
            </h3>
          );
        }
        if (el.type === 'hr') {
          return <hr key={idx} className="border-slate-200 my-4" />;
        }
        if (el.type === 'p') {
          return (
            <div key={idx} className="leading-relaxed text-slate-700">
              {renderMarkdownInline(el.text)}
            </div>
          );
        }
        if (el.type === 'li') {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-3 text-slate-700 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
              <span>{renderMarkdownInline(el.text)}</span>
            </div>
          );
        }
        if (el.type === 'ol_item') {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-3 text-slate-700 leading-relaxed">
              <span className="font-bold text-blue-600 shrink-0 text-xs mt-0.5">•</span>
              <span>{renderMarkdownInline(el.text)}</span>
            </div>
          );
        }
        if (el.type === 'task') {
          return (
            <div key={idx} className="flex items-center space-x-2 pl-3 text-slate-700 leading-relaxed">
              <input
                type="checkbox"
                checked={el.checked}
                readOnly
                className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-0 cursor-default"
              />
              <span className={el.checked ? 'text-slate-500 line-through' : 'text-slate-800'}>
                {renderMarkdownInline(el.text)}
              </span>
            </div>
          );
        }
        if (el.type === 'quote') {
          return (
            <div key={idx} className="border-l-3 border-blue-500 bg-blue-50/50 rounded-r-lg p-3 text-xs sm:text-[13px] text-slate-700 italic my-2">
              {renderMarkdownInline(el.text)}
            </div>
          );
        }
        if (el.type === 'code') {
          return (
            <div key={idx} className="my-2 rounded-lg border border-slate-200 bg-slate-900 text-slate-100 p-3 font-mono text-xs overflow-x-auto shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 pb-1 border-b border-slate-800 mb-2">
                {el.lang || 'terminal'}
              </div>
              <pre className="text-emerald-400 whitespace-pre">{el.code}</pre>
            </div>
          );
        }
        if (el.type === 'table') {
          const lines = el.lines;
          if (lines.length >= 2) {
            const headerCols = lines[0].split('|').map(c => c.trim()).filter(Boolean);
            const dataRows = lines.slice(2).map(l => l.split('|').map(c => c.trim()).filter(Boolean));
            return (
              <div key={idx} className="my-3 overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-2xs">
                <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                  <thead className="bg-slate-50 font-bold text-slate-800">
                    <tr>
                      {headerCols.map((h, i) => (
                        <th key={i} className="px-3.5 py-2 border-r border-slate-100 last:border-r-0">
                          {renderMarkdownInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    {dataRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/70">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-2 border-r border-slate-100 last:border-r-0 font-medium">
                            {renderMarkdownInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }
        return null;
      })}
    </div>
  );
}

/**
 * Code Block: Light-grey surface, syntax highlighting, language label, copy button, and Markdown Preview
 */
function TerminalCodeBlock({ code, title = 'bash', language = 'bash' }) {
  const [copied, setCopied] = useState(false);
  const isMarkdown = (language || '').toLowerCase().includes('markdown') || (language || '').toLowerCase() === 'md';
  const [viewMode, setViewMode] = useState(isMarkdown ? 'preview' : 'code');

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderHighlightedLine = (line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={idx} className="h-3.5" />;
    }

    if (trimmed.startsWith('#')) {
      return (
        <div key={idx} className="text-slate-400 italic font-mono text-xs leading-relaxed">
          {line}
        </div>
      );
    }

    const isCommandLine = trimmed.startsWith('$') || trimmed.startsWith('git ') || trimmed.startsWith('cd ') || trimmed.startsWith('touch ') || trimmed.startsWith('mkdir ') || trimmed.startsWith('cat ') || trimmed.startsWith('brew ') || trimmed.startsWith('sudo apt ');

    if (!isCommandLine) {
      return (
        <div key={idx} className="text-slate-700 font-mono text-xs leading-relaxed">
          {line}
        </div>
      );
    }

    const tokens = line.split(/(\s+|"[^"]*"|'[^']*'|--[a-zA-Z0-9_-]+|-[a-zA-Z0-9]+|\b(?:git|cd|touch|mkdir|cat|echo|rm|npm|npx|brew|sudo|apt|update|install)\b|\b(?:init|status|add|commit|branch|checkout|switch|merge|rebase|stash|push|pull|fetch|clone|reset|revert|log|reflog|bisect|cherry-pick|tag|remote|restore|diff|show|config|version)\b)/g);

    return (
      <div key={idx} className="font-mono text-xs leading-relaxed">
        {tokens.map((tok, tIdx) => {
          if (!tok) return null;
          const trimmedTok = tok.trim();

          if (trimmedTok === '$') {
            return <span key={tIdx} className="text-slate-400 font-bold select-none">{tok}</span>;
          }
          if (['git', 'cd', 'touch', 'mkdir', 'cat', 'echo', 'rm', 'npm', 'npx', 'brew', 'sudo', 'apt', 'install', 'update'].includes(trimmedTok)) {
            return <span key={tIdx} className="text-blue-700 font-bold">{tok}</span>;
          }
          if (['init', 'status', 'add', 'commit', 'branch', 'checkout', 'switch', 'merge', 'rebase', 'stash', 'push', 'pull', 'fetch', 'clone', 'reset', 'revert', 'log', 'reflog', 'bisect', 'cherry-pick', 'tag', 'remote', 'restore', 'diff', 'show', 'config', 'version'].includes(trimmedTok)) {
            return <span key={tIdx} className="text-indigo-600 font-bold">{tok}</span>;
          }
          if (trimmedTok.startsWith('-')) {
            return <span key={tIdx} className="text-purple-600">{tok}</span>;
          }
          if ((trimmedTok.startsWith('"') && trimmedTok.endsWith('"')) || (trimmedTok.startsWith("'") && trimmedTok.endsWith("'"))) {
            return <span key={tIdx} className="text-emerald-700 font-medium">{tok}</span>;
          }
          return <span key={tIdx} className="text-slate-800">{tok}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50/90 shadow-2xs my-4">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-100/90 border-b border-slate-200 select-none">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
            {language || title || 'bash'}
          </span>
          {isMarkdown && (
            <div className="flex items-center rounded-md bg-slate-200/80 p-0.5 text-[10.5px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode('code')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer flex items-center space-x-1 ${
                  viewMode === 'code'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code size={11} />
                <span>Raw Code</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer flex items-center space-x-1 ${
                  viewMode === 'preview'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye size={11} />
                <span>Preview (.md)</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center space-x-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded bg-white hover:bg-slate-200/70 border border-slate-200/90 transition-colors cursor-pointer"
        >
          {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {isMarkdown && viewMode === 'preview' ? (
        <MarkdownPreviewBox content={code} />
      ) : (
        <div className="p-3.5 overflow-x-auto selection:bg-blue-100 custom-scrollbar">
          {code.split('\n').map((line, idx) => renderHighlightedLine(line, idx))}
        </div>
      )}
    </div>
  );
}

/**
 * Visual Monospace Architecture / Flow Diagram Block (Light-grey surface)
 */
function VisualDiagramBlock({ content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shadow-2xs my-4">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-100/90 border-b border-slate-200 text-xs text-slate-500 font-mono select-none">
        <span className="flex items-center gap-1.5 text-blue-700 font-semibold">
          <GitBranch size={12} />
          Architecture Diagram
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center space-x-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded bg-white hover:bg-slate-200/70 border border-slate-200/90 transition-colors cursor-pointer"
        >
          {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto font-mono text-xs leading-relaxed text-slate-800 whitespace-pre selection:bg-blue-100 custom-scrollbar">
        {content}
      </div>
    </div>
  );
}

/**
 * Robust Structured Markdown Parser for Lesson Content
 */
function parseMarkdownBlocks(markdown) {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Code blocks: ``` or ```` or ~~~
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      const fenceStr = fenceMatch[1];
      const fenceChar = fenceStr[0];
      const fenceLen = fenceStr.length;
      const codeLines = [rawLine];
      i++;
      while (i < lines.length) {
        const curTrimmed = lines[i].trim();
        const closeMatch = curTrimmed.match(/^(`{3,}|~{3,})$/);
        if (closeMatch && closeMatch[1][0] === fenceChar && closeMatch[1].length >= fenceLen) {
          codeLines.push(lines[i]);
          i++;
          break;
        }
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', raw: codeLines.join('\n') });
      continue;
    }

    // 2. Images: ![alt](url)
    if (trimmed.startsWith('![') && trimmed.includes('](') && trimmed.endsWith(')')) {
      const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (match) {
        blocks.push({ type: 'image', alt: match[1], src: match[2] });
        i++;
        continue;
      }
    }

    // 3. Custom Callout Containers: :::info, :::tip, :::warning, :::success
    if (trimmed.startsWith(':::')) {
      const match = trimmed.match(/^:::([a-zA-Z]+)(?:\s+(.*?))?(?::::)?$/);
      const calloutType = match ? match[1].toLowerCase() : 'info';
      const inlineText = match && match[2] ? match[2].replace(/:::$/, '').trim() : '';

      if (inlineText && trimmed.endsWith(':::')) {
        blocks.push({ type: 'callout', calloutType, content: inlineText });
        i++;
        continue;
      }

      const calloutLines = inlineText ? [inlineText] : [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(':::')) {
        calloutLines.push(lines[i].trim());
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith(':::')) {
        i++; // skip closing :::
      }
      blocks.push({ type: 'callout', calloutType, content: calloutLines.filter(Boolean).join(' ') });
      continue;
    }

    // 4. Tables: lines starting and ending with |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      blocks.push({ type: 'table', lines: tableLines });
      continue;
    }

    // 5. Blockquotes / Alerts: lines starting with >
    if (trimmed.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && (lines[i].trim().startsWith('>') || (lines[i].trim() && quoteLines.length > 0 && !lines[i].trim().startsWith('#') && !lines[i].trim().startsWith('```')))) {
        if (!lines[i].trim()) break;
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      const quoteContent = quoteLines.join(' ');
      blocks.push({ type: 'quote', raw: trimmed, content: quoteContent });
      continue;
    }

    // 6. Horizontal rule: ---
    if (trimmed === '---' || trimmed === '***') {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // 7. Headings: ###, ####, ##, #
    if (trimmed.startsWith('#')) {
      const hashes = trimmed.match(/^#+/)[0];
      const level = hashes.length;
      const headingText = trimmed.replace(/^#+\s*/, '');
      blocks.push({ type: 'heading', level, text: headingText });
      i++;
      continue;
    }

    // 8. Unordered lists: * or -
    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // 9. Ordered lists: 1. , 2. 
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // 10. Standard Paragraph (accumulate consecutive text lines)
    const pLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].trim().startsWith('|') &&
      !lines[i].trim().startsWith('![') &&
      lines[i].trim() !== '---' &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      pLines.push(lines[i].trim());
      i++;
    }

    if (pLines.length > 0) {
      blocks.push({ type: 'paragraph', text: pLines.join(' ') });
    }
  }

  return blocks;
}

/**
 * Rich Markdown Lesson Content Component (Clean, Compact, Balanced Typography)
 */
function GitLessonContent({ markdown }) {
  const blocks = useMemo(() => parseMarkdownBlocks(markdown), [markdown]);

  if (!markdown || !blocks || blocks.length === 0) return null;

  const renderInline = (text) => {
    if (!text) return null;
    const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[⚠️🚨⚡🔥🎯💡🧭🗺️]/gu, '');
    const parts = [];
    const regex = /(\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s<)]+|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|<br\s*\/?>|\$\$[^\$]+\$\$|\$[^\$]+\$)/gi;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(cleanText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(cleanText.slice(lastIndex, match.index));
      }
      const token = match[0];
      if (/<br\s*\/?>/i.test(token)) {
        parts.push(<span key={match.index} className="block my-1" />);
      } else if ((token.startsWith('$$') && token.endsWith('$$')) || (token.startsWith('$') && token.endsWith('$') && token.length > 2)) {
        const rawMath = token.startsWith('$$') ? token.slice(2, -2) : token.slice(1, -1);
        const cleanContent = rawMath
          .replace(/\\textbf\{([^}]+)\}/g, '$1')
          .replace(/\\text\{([^}]+)\}/g, '$1')
          .replace(/\\[;,]/g, ' ')
          .replace(/\s*>\s*/g, ' ➔ ')
          .trim();
        parts.push(
          <span key={match.index} className="inline-flex items-center font-bold text-slate-800 bg-blue-50/80 px-2.5 py-1 rounded border border-blue-200 text-xs my-0.5 shadow-2xs">
            {cleanContent}
          </span>
        );
      } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
        const linkMatch = token.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          const [, label, url] = linkMatch;
          parts.push(
            <a
              key={match.index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors cursor-pointer"
            >
              <span>{label}</span>
              <ExternalLink size={11} className="inline-block shrink-0 opacity-70" />
            </a>
          );
        } else {
          parts.push(token);
        }
      } else if (token.startsWith('http://') || token.startsWith('https://')) {
        parts.push(
          <a
            key={match.index}
            href={token}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors cursor-pointer"
          >
            <span>{token}</span>
            <ExternalLink size={11} className="inline-block shrink-0 opacity-70" />
          </a>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-bold text-[#0a192f]">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={match.index} className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded whitespace-nowrap inline-block">
            {token.slice(1, -1).trim()}
          </code>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-slate-700">
            {token.slice(1, -1)}
          </em>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < cleanText.length) {
      parts.push(cleanText.slice(lastIndex));
    }
    return parts;
  };

  return (
    <div className="space-y-4 text-slate-700 text-[14.5px] leading-relaxed font-normal">
      {blocks.map((block, idx) => {
        // Image (scaled to a clean, readable size with authentic light theme framing)
        if (block.type === 'image') {
          return (
            <figure key={idx} className="my-6 max-w-4xl mx-auto rounded-xl overflow-hidden border border-slate-200/80 bg-white shadow-xs">
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="MSC-PRPCEM" className="w-4 h-4 object-contain" />
                  <span className="text-[11px] font-bold text-slate-700">MSC PRPCEM Curriculum</span>
                </div>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                  Light Theme Guide
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-white">
                <img
                  src={block.src}
                  alt={block.alt}
                  className="w-full h-auto max-h-[540px] object-contain rounded-lg mx-auto block"
                  loading="lazy"
                />
              </div>
              {block.alt && (
                <figcaption className="text-center text-[11px] sm:text-xs text-slate-500 font-medium py-1.5 px-3 bg-slate-50/40 border-t border-slate-100 italic">
                  {block.alt.replace(/[\u{1F300}-\u{1F9FF}]|[⚠️🚨⚡🔥🎯💡🧭🗺️]/gu, '')}
                </figcaption>
              )}
            </figure>
          );
        }

        // Section Headings (H2 / H3 with restrained blue vertical accent)
        if (block.type === 'heading') {
          const cleanHeading = block.text.replace(/[\u{1F300}-\u{1F9FF}]|[⚠️🚨⚡🔥🎯💡🧭🗺️]/gu, '').trim();

          // H2: Numbered section heading or major section with small blue accent
          if (block.level <= 2 || /^\d+\.\s+/.test(cleanHeading) || cleanHeading.toLowerCase().startsWith('overview') || cleanHeading.toLowerCase().startsWith('key takeaways') || cleanHeading.toLowerCase().startsWith('useful resources')) {
            return (
              <div key={idx} className="pt-6 pb-2 first:pt-1">
                <div className="flex items-baseline gap-2.5">
                  <span className="w-1.5 h-4.5 bg-blue-600 rounded-xs inline-block shrink-0 translate-y-0.5" />
                  <h2 className="text-lg sm:text-xl font-bold text-[#0a192f] tracking-tight">
                    {renderInline(cleanHeading)}
                  </h2>
                </div>
              </div>
            );
          }

          // H3: Compact bold subsection heading
          return (
            <div key={idx} className="pt-4 pb-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                {renderInline(cleanHeading)}
              </h3>
            </div>
          );
        }

        // Horizontal Divider
        if (block.type === 'hr') {
          return <hr key={idx} className="border-slate-100 my-6" />;
        }

        // Code Block
        if (block.type === 'code') {
          const codeLines = block.raw.trim().split('\n');
          const firstLine = codeLines[0].replace('```', '').trim().toLowerCase();
          const cleanCode = codeLines.slice(1, -1).join('\n');

          const isDiagram = ['┌', '├', '│', '─', '►', '▲', '▼', '◄', '└──', 'Commit'].some(char => cleanCode.includes(char)) && !firstLine.includes('bash');

          if (isDiagram) {
            return <VisualDiagramBlock key={idx} content={cleanCode} />;
          }

          return (
            <TerminalCodeBlock
              key={idx}
              code={cleanCode}
              title={firstLine ? firstLine : 'bash'}
              language={firstLine || 'bash'}
            />
          );
        }

        // Custom Callout Containers (:::info, :::tip, :::warning, :::success)
        if (block.type === 'callout') {
          const t = block.calloutType;
          let borderColor = 'border-blue-600 bg-blue-50/60 text-slate-800';
          let Icon = Info;
          let label = 'Note';

          if (t === 'tip') {
            borderColor = 'border-blue-600 bg-blue-50/60 text-slate-800';
            Icon = Lightbulb;
            label = 'Tip';
          } else if (t === 'warning') {
            borderColor = 'border-amber-500 bg-amber-50/70 text-slate-800';
            Icon = AlertTriangle;
            label = 'Caution';
          } else if (t === 'success') {
            borderColor = 'border-emerald-600 bg-emerald-50/70 text-slate-800';
            Icon = CheckCircle2;
            label = 'Success';
          }

          return (
            <aside
              key={idx}
              className={`my-4 rounded-r-lg p-3.5 border-l-4 ${borderColor} text-slate-800 text-[13.5px] leading-relaxed`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 mb-1">
                <Icon size={14} className="shrink-0 text-blue-600" />
                <span>{label}</span>
              </div>
              <div className="font-normal text-slate-700">{renderInline(block.content)}</div>
            </aside>
          );
        }

        // Blockquotes & Notes (Fallback)
        if (block.type === 'quote') {
          const cleanContent = block.content.replace(/[\u{1F300}-\u{1F9FF}]|[⚠️🚨⚡🔥🎯💡🧭🗺️]/gu, '').trim();

          return (
            <aside
              key={idx}
              className="my-4 rounded-r-lg p-3.5 border-l-4 border-blue-600 bg-blue-50/60 text-slate-800 text-[13.5px] leading-relaxed"
            >
              <div>{renderInline(cleanContent)}</div>
            </aside>
          );
        }

        // Unordered List (Simple bullets with consistent indentation)
        if (block.type === 'ul') {
          return (
            <ul key={idx} className="space-y-1.5 my-3 pl-4">
              {block.items.map((item, iIdx) => {
                const isFileNameOrCommand = /^([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+|`[^`]+`|[a-zA-Z0-9_-]+)$/.test(item.trim());

                return (
                  <li key={iIdx} className="flex items-start space-x-2 text-[14px] text-slate-700 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-2" />
                    {isFileNameOrCommand ? (
                      <code className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded">
                        {item.replace(/`/g, '')}
                      </code>
                    ) : (
                      <span>{renderInline(item)}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Ordered List
        if (block.type === 'ol') {
          return (
            <ol key={idx} className="space-y-1.5 my-3 pl-4">
              {block.items.map((item, iIdx) => (
                <li key={iIdx} className="flex items-start space-x-2 text-[14px] text-slate-700 leading-relaxed">
                  <span className="font-bold text-blue-600 shrink-0 text-xs mt-0.5">
                    {iIdx + 1}.
                  </span>
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ol>
          );
        }

        // Table (Minimal borders, clear header row, responsive overflow)
        if (block.type === 'table') {
          const lines = block.lines;
          if (lines.length >= 2) {
            const headerCols = lines[0].split('|').map(c => c.trim()).filter(Boolean);
            const dataRows = lines.slice(2).map(l => l.split('|').map(c => c.trim()).filter(Boolean));
            return (
              <div key={idx} className="my-4 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-left text-xs sm:text-[13px] border-collapse min-w-[620px]">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-[#0a192f] font-bold">
                      {headerCols.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          className={`py-2.5 px-4 font-semibold text-slate-800 ${
                            hIdx <= 1 ? 'whitespace-nowrap' : ''
                          }`}
                        >
                          {renderInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {dataRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-2.5 px-4 text-slate-700 align-top ${
                              cIdx === 0 ? 'whitespace-nowrap font-semibold text-slate-900' :
                              cIdx === 1 ? 'whitespace-nowrap font-medium' : ''
                            }`}
                          >
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // Standard Paragraph
        return (
          <p key={idx} className="text-slate-700 text-[14.5px] leading-relaxed font-normal">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * GitLearningView: 100% Chapter-Wise Structure (Clean, Compact, Scaled Sizing)
 */
export default function GitLearningView({
  selectedTopicSlug: propTopicSlug,
  setSelectedTopicSlug: propSetTopicSlug,
  completedLessons: propCompletedLessons,
  onToggleCompleted: propOnToggleCompleted,
  onBackToOverview,
  onJumpToPractice
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Available chapters with rich lesson content (Chapters 1 to 7 from day0 to day7)
  const AVAILABLE_CHAPTER_IDS = ['chapter-1', 'chapter-2', 'chapter-3', 'chapter-4', 'chapter-5', 'chapter-6', 'chapter-7'];

  // Flatten all available lessons (10 subchapters across Chapters 1 to 5)
  const allTopicsFlat = useMemo(() => {
    return GIT_SUBCHAPTERS.map((sub, idx) => {
      const ch = GIT_CHAPTERS.find(c => c.id === sub.chapterId);
      return {
        ...sub,
        chapterTitle: ch?.title || '',
        chapterShortTitle: ch?.shortTitle || '',
        chapterBadge: ch?.badge || '',
        part: ch?.part || '',
        partTitle: ch?.partTitle || '',
        hasMultipleSubtopics: true,
        globalIndex: idx + 1
      };
    });
  }, []);

  const totalTopicsCount = allTopicsFlat.length;

  // 2. Active chapter and topic selection state
  const rawParamTopic = searchParams.get('topic');
  const rawParamChapter = searchParams.get('chapter');
  
  const initialResolved = rawParamTopic ? (GIT_SUBCHAPTERS_MAP.get(rawParamTopic) || allTopicsFlat.find(t => t.slug === rawParamTopic)) : null;
  const initialChapter = rawParamChapter || initialResolved?.chapterId || (rawParamTopic?.startsWith('chapter-') ? rawParamTopic : 'chapter-1');
  const initialTopic = initialResolved?.slug || (rawParamChapter ? allTopicsFlat.find(t => t.chapterId === rawParamChapter)?.slug : null) || propTopicSlug || 'day-0-orientation';

  const [selectedChapterId, setSelectedChapterId] = useState(initialChapter);
  const [currentTopicSlug, setCurrentTopicSlug] = useState(initialTopic);

  useEffect(() => {
    const paramTopic = searchParams.get('topic');
    const paramChapter = searchParams.get('chapter');

    if (paramTopic) {
      if (paramTopic.startsWith('chapter-')) {
        setSelectedChapterId(paramTopic);
        const chTopic = allTopicsFlat.find(t => t.chapterId === paramTopic);
        if (chTopic) setCurrentTopicSlug(chTopic.slug);
      } else {
        const found = GIT_SUBCHAPTERS_MAP.get(paramTopic) || allTopicsFlat.find(t => t.slug === paramTopic);
        if (found) {
          setSelectedChapterId(found.chapterId || 'chapter-1');
          setCurrentTopicSlug(found.slug);
        }
      }
    } else if (paramChapter) {
      setSelectedChapterId(paramChapter);
      const chTopic = allTopicsFlat.find(t => t.chapterId === paramChapter);
      if (chTopic) setCurrentTopicSlug(chTopic.slug);
    }
  }, [searchParams, allTopicsFlat]);

  const activeChapter = useMemo(() => {
    return GIT_CHAPTERS.find(ch => ch.id === selectedChapterId) || GIT_CHAPTERS[0];
  }, [selectedChapterId]);

  const isComingSoon = !AVAILABLE_CHAPTER_IDS.includes(selectedChapterId);

  const activeTopic = useMemo(() => {
    const found = allTopicsFlat.find(t => t.slug === currentTopicSlug);
    return found || allTopicsFlat[0] || {};
  }, [allTopicsFlat, currentTopicSlug]);

  // 3. Chapter Accordions State (Expand Chapters 1 to 7 by default)
  const [expandedChapters, setExpandedChapters] = useState({
    'chapter-1': true,
    'chapter-2': true,
    'chapter-3': true,
    'chapter-4': true,
    'chapter-5': true,
    'chapter-6': true,
    'chapter-7': true
  });

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  // 4. Completed lessons state
  const [completedLessons, setCompletedLessons] = useState(() => {
    if (propCompletedLessons && propCompletedLessons.length > 0) return propCompletedLessons;
    try {
      const saved = localStorage.getItem('msc_git_completed_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (propCompletedLessons && propCompletedLessons.length > 0) {
      setCompletedLessons(propCompletedLessons);
    }
  }, [propCompletedLessons]);

  const isCurrentLessonCompleted = activeTopic?.slug ? completedLessons.includes(activeTopic.slug) : false;
  const progressPercent = totalTopicsCount > 0 ? Math.min(100, Math.round((completedLessons.length / totalTopicsCount) * 100)) : 0;

  // 5. Toggle completed action
  const handleToggleCompleted = async (slugToToggle = activeTopic?.slug) => {
    if (!slugToToggle) return;
    const isCompleted = completedLessons.includes(slugToToggle);
    const updated = isCompleted
      ? completedLessons.filter(s => s !== slugToToggle)
      : Array.from(new Set([...completedLessons, slugToToggle]));

    setCompletedLessons(updated);
    try {
      localStorage.setItem('msc_git_completed_lessons', JSON.stringify(updated));
    } catch (_) {}

    if (propOnToggleCompleted) {
      propOnToggleCompleted(slugToToggle);
    }

    if (user?.email) {
      try {
        await api.post('/git/progress/lesson', {
          lessonSlug: slugToToggle,
          email: user.email
        });
      } catch (_) {}
    }

    if (!isCompleted) {
      addToast && addToast('Lesson marked as read!', 'success');
    } else {
      addToast && addToast('Lesson marked as unread', 'info');
    }
  };

  // 6. Topic selection handler
  const handleSelectTopic = (slug) => {
    if (!slug) return;
    const resolved = GIT_SUBCHAPTERS_MAP.get(slug) || allTopicsFlat.find(t => t.slug === slug);
    const targetSlug = resolved ? resolved.slug : slug;
    const targetChapter = resolved?.chapterId || selectedChapterId;

    setSelectedChapterId(targetChapter);
    setCurrentTopicSlug(targetSlug);
    setExpandedChapters(prev => ({ ...prev, [targetChapter]: true }));

    if (propSetTopicSlug) propSetTopicSlug(targetSlug);
    setSearchParams({ topic: targetSlug, chapter: targetChapter }, { replace: true });
    setMobileMenuOpen(false);

    const readerEl = document.getElementById('git-lesson-article-container');
    if (readerEl) readerEl.scrollTop = 0;
  };

  // 7. Navigation (Previous & Next Lesson - No auto-completion!)
  const currentGlobalIndex = activeTopic?.globalIndex || 1; // 1-indexed
  const previousTopic = currentGlobalIndex > 1 ? allTopicsFlat[currentGlobalIndex - 2] : null;
  const nextTopic = currentGlobalIndex < totalTopicsCount ? allTopicsFlat[currentGlobalIndex] : null;

  const handleNextLesson = () => {
    if (nextTopic) {
      handleSelectTopic(nextTopic.slug);
    }
  };

  const handlePreviousLesson = () => {
    if (previousTopic) {
      handleSelectTopic(previousTopic.slug);
    }
  };

  // Prevent duplicate outer window scrollbar
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  return (
    <div
      style={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}
      className="w-full h-[calc(100vh-64px)] flex font-segoe text-slate-800 bg-white overflow-hidden relative selection:bg-blue-100 selection:text-blue-900"
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          LEFT SIDEBAR: ALL 30 CHAPTERS (COMPACT, SHORT NAMES, w-64 xl:w-72)
      ═══════════════════════════════════════════════════════════════════════ */}
      <aside className="w-64 xl:w-72 border-r border-slate-100 bg-white flex flex-col shrink-0 h-full p-3 space-y-3 overflow-y-auto select-none custom-scrollbar hidden lg:flex">
        
        {/* Title & Counter */}
        <div className="space-y-1.5 pb-2 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToOverview || (() => navigate('/courses/git'))}
              className="text-sm font-extrabold text-slate-900 tracking-tight hover:text-blue-600 transition-colors text-left cursor-pointer flex items-center gap-1.5"
              title="Back to Git Course Hub"
            >
              <ArrowLeft size={14} />
              <span>Git &amp; GitHub</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-[10.5px] font-medium text-slate-400">
              {completedLessons.length} / {totalTopicsCount} lessons completed
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(3, progressPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chapters 1 through 30 (Clean, compact, short names) */}
        <div className="space-y-1 flex-1">
          {GIT_CHAPTERS.map((chapter) => {
            const isAvailable = AVAILABLE_CHAPTER_IDS.includes(chapter.id);
            const isExpanded = expandedChapters[chapter.id] !== false;
            const isSelected = selectedChapterId === chapter.id;

            if (isAvailable) {
              const subchapters = allTopicsFlat.filter(t => t.chapterId === chapter.id);

              return (
                <div key={chapter.id} className="space-y-0.5">
                  {/* Chapter Accordion Header */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleChapter(chapter.id);
                      if (selectedChapterId !== chapter.id && subchapters[0]) {
                        handleSelectTopic(subchapters[0].slug);
                      }
                    }}
                    className={`w-full text-left py-1.5 px-2.5 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer rounded-lg ${
                      isSelected 
                        ? 'text-slate-900 bg-slate-100/90' 
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    title={chapter.shortTitle}
                  >
                    <span className="truncate">{chapter.shortTitle}</span>
                    <ChevronDown
                      size={12}
                      className={`text-slate-400 shrink-0 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Subchapters List */}
                  {isExpanded && (
                    <div className="space-y-0.5 pl-2.5 pt-0.5">
                      {subchapters.map((topic) => {
                        const isTopicSelected = selectedChapterId === chapter.id && currentTopicSlug === topic.slug;
                        const isCompleted = completedLessons.includes(topic.slug);

                        return (
                          <div
                            key={topic.slug}
                            className={`w-full group rounded-md text-xs flex items-center justify-between transition-colors ${
                              isTopicSelected
                                ? 'bg-blue-50 text-blue-600 font-bold'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectTopic(topic.slug);
                              }}
                              className="flex-1 text-left px-2 py-1.5 truncate flex items-center space-x-1.5 cursor-pointer min-w-0"
                              title={topic.shortName}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isTopicSelected ? 'bg-blue-600' : 'bg-slate-300'}`} />
                              <span className="truncate">{topic.shortName}</span>
                            </button>

                            {/* Double-Tick Read/Unread Toggle Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCompleted(topic.slug);
                              }}
                              className={`p-1 mr-1 rounded hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0 ${
                                isCompleted
                                  ? 'text-emerald-600 hover:text-rose-600'
                                  : 'text-slate-300 opacity-60 hover:opacity-100 hover:text-blue-600'
                              }`}
                              title={isCompleted ? "Read (Click to mark unread)" : "Mark as read"}
                            >
                              <CheckCheck size={13} strokeWidth={isCompleted ? 2.5 : 1.8} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Chapters 6 through 30: Coming Soon items
            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => {
                  setSelectedChapterId(chapter.id);
                  setSearchParams({ chapter: chapter.id }, { replace: true });
                }}
                className={`w-full text-left py-1.5 px-2.5 flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer rounded-lg ${
                  isSelected
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={chapter.shortTitle}
              >
                <div className="flex items-center space-x-2 truncate pr-1">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-blue-600' : 'bg-slate-300'}`} />
                  <span className="truncate">{chapter.shortTitle}</span>
                </div>
                <span className="text-[9.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded shrink-0">
                  Coming Soon
                </span>
              </button>
            );
          })}
        </div>

      </aside>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN WORKSPACE: CLEAN, WIDE, PROPER FULL-SPACE READER
      ═══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 h-full flex flex-col min-w-0 overflow-hidden bg-white">
        
        {/* Mobile top bar (<1024px) */}
        <header className="lg:hidden h-12 border-b border-slate-100 bg-white px-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onBackToOverview || (() => navigate('/courses/git'))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center text-xs font-bold cursor-pointer"
              title="Back to Overview"
            >
              <ArrowLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Menu size={15} />
              <span>Chapters ({GIT_CHAPTERS.length})</span>
            </button>
          </div>

          <span className="text-xs font-bold text-slate-800 truncate max-w-[220px]">
            {isComingSoon ? activeChapter.shortTitle : (activeTopic?.shortName || TOPIC_SHORT_NAMES[activeTopic?.slug] || activeTopic?.title || 'Lesson')}
          </span>
        </header>

        {/* Scrollable Article Area with Proper Full Space */}
        <div
          id="git-lesson-article-container"
          className="flex-1 overflow-y-auto px-6 sm:px-12 lg:px-16 xl:px-20 py-8 custom-scrollbar"
        >
          {isComingSoon ? (
            /* Coming Soon View for Chapters 2 through 30 */
            <div className="w-full max-w-4xl mx-auto py-10 space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-2xs space-y-6 relative overflow-hidden">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full font-bold text-xs uppercase tracking-wider">
                    Chapter {activeChapter.number}
                  </span>
                  <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full font-bold text-xs flex items-center space-x-1.5 shadow-2xs">
                    <Clock size={13} className="text-amber-600 animate-pulse" />
                    <span>Coming Soon</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Actively in Development
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0a192f] tracking-tight">
                    {activeChapter.title}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                    The comprehensive lesson content, visual architecture diagrams, and interactive terminal exercises for this chapter have not been published yet and are currently being prepared for the official MSC-PRPCEM Git &amp; GitHub track.
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChapterId('chapter-1');
                      handleSelectTopic('day-0-orientation');
                    }}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <BookOpen size={14} />
                    <span>Read Chapter 1 (Available Now)</span>
                  </button>

                  <button
                    type="button"
                    onClick={onJumpToPractice || (() => navigate('/courses/git/practice'))}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <Terminal size={14} className="text-emerald-600" />
                    <span>Practice 70 Git Labs</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Active Available Lesson View (Chapter 1) */
            <div className="w-full max-w-5xl xl:max-w-6xl mx-auto space-y-4">
              
              {/* Top Meta Bar: Chapter Badge, Subchapter Label & Double-Tick Read/Unread Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-slate-100/80">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-md border border-blue-200">
                    Chapter {activeChapter.number}
                  </span>
                  <span className="text-xs text-slate-400 font-medium truncate max-w-[280px] sm:max-w-md">
                    {activeTopic?.shortName || activeTopic?.title}
                  </span>
                </div>

                {/* Double Tick Read / Unread Button */}
                <button
                  type="button"
                  onClick={() => handleToggleCompleted(activeTopic?.slug)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-2xs cursor-pointer group select-none ${
                    isCurrentLessonCompleted
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50/50'
                  }`}
                  title={isCurrentLessonCompleted ? "Click to mark as unread" : "Mark this lesson as read"}
                >
                  <CheckCheck
                    size={15}
                    className={`shrink-0 transition-colors ${
                      isCurrentLessonCompleted
                        ? 'text-emerald-600 group-hover:text-rose-600'
                        : 'text-slate-400 group-hover:text-blue-600'
                    }`}
                    strokeWidth={isCurrentLessonCompleted ? 2.5 : 2}
                  />
                  {isCurrentLessonCompleted ? (
                    <>
                      <span className="group-hover:hidden">Read</span>
                      <span className="hidden group-hover:inline">Mark Unread</span>
                    </>
                  ) : (
                    <span>Mark as Read</span>
                  )}
                </button>
              </div>

              {/* Main Lesson Title (H1: Used only once per lesson) */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0a192f] tracking-tight leading-snug">
                {activeTopic?.title ? activeTopic.title.replace(/^(?:Day\s*\d+:|\d+\.)\s*/, '') : 'Lesson'}
              </h1>

              {/* Short Introductory Summary */}
              {activeTopic?.summary && (
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed font-normal pt-0.5">
                  {activeTopic.summary}
                </p>
              )}

              {/* Horizontal Line Divider */}
              <hr className="border-slate-100 my-5" />

              {/* Main Content Markdown */}
              <GitLessonContent markdown={activeTopic?.content || ''} />

              {/* Bottom Navigation: Previous, Double-Tick Read/Unread, and Next lesson controls */}
              <footer className="pt-8 pb-14 border-t border-slate-100 mt-10 flex items-center justify-between gap-3">
                
                {/* Previous Button */}
                {previousTopic ? (
                  <button
                    type="button"
                    onClick={handlePreviousLesson}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium text-xs sm:text-[13px] transition-colors flex items-center space-x-1 cursor-pointer shadow-2xs"
                  >
                    <span>‹</span>
                    <span>Previous</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 rounded-lg border border-slate-200/60 text-slate-300 font-medium text-xs sm:text-[13px] cursor-not-allowed"
                  >
                    <span>‹</span>
                    <span>Previous</span>
                  </button>
                )}

                {/* Center Double Tick Button (Read / Unread) */}
                <button
                  type="button"
                  onClick={() => handleToggleCompleted(activeTopic?.slug)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs sm:text-[13px] font-bold transition-all shadow-2xs cursor-pointer group select-none ${
                    isCurrentLessonCompleted
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50/50'
                  }`}
                  title={isCurrentLessonCompleted ? "Click to mark as unread" : "Mark this lesson as read"}
                >
                  <CheckCheck
                    size={16}
                    className={`shrink-0 transition-colors ${
                      isCurrentLessonCompleted
                        ? 'text-emerald-600 group-hover:text-rose-600'
                        : 'text-slate-400 group-hover:text-blue-600'
                    }`}
                    strokeWidth={isCurrentLessonCompleted ? 2.5 : 2}
                  />
                  {isCurrentLessonCompleted ? (
                    <>
                      <span className="group-hover:hidden">Completed (Read)</span>
                      <span className="hidden group-hover:inline">Mark as Unread</span>
                    </>
                  ) : (
                    <span>Mark as Read</span>
                  )}
                </button>

                {/* Next Button (Navigates to next lesson without auto-marking completed) */}
                {nextTopic ? (
                  <button
                    type="button"
                    onClick={handleNextLesson}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs sm:text-[13px] shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <span>›</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChapterId('chapter-8');
                      setSearchParams({ chapter: 'chapter-8' }, { replace: true });
                    }}
                    className="px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs sm:text-[13px] border border-blue-200 flex items-center space-x-1.5 cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <span>Chapter 8 (Coming Soon)</span>
                    <span>›</span>
                  </button>
                )}

              </footer>

            </div>
          )}
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
          MOBILE SLIDE-OVER DRAWER (<1024px)
      ═══════════════════════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-900">Git Chapters (30)</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-400">
                {completedLessons.length} / {totalTopicsCount} lessons completed
              </div>
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(3, progressPercent)}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pt-1">
              {GIT_CHAPTERS.map((chapter) => {
                const isAvailable = AVAILABLE_CHAPTER_IDS.includes(chapter.id);
                const isSel = selectedChapterId === chapter.id;

                if (isAvailable) {
                  const subchapters = allTopicsFlat.filter(t => t.chapterId === chapter.id);

                  return (
                    <div key={chapter.id} className="space-y-0.5">
                      <div className="text-[11px] font-bold text-slate-800 px-2 py-0.5">
                        {chapter.shortTitle}
                      </div>
                      <div className="space-y-0.5 pl-2">
                        {subchapters.map((t) => {
                          const isTopicSel = selectedChapterId === chapter.id && currentTopicSlug === t.slug;
                          const isDone = completedLessons.includes(t.slug);
                          return (
                            <div
                              key={t.slug}
                              className={`w-full rounded-lg text-xs flex items-center justify-between ${
                                isTopicSel
                                  ? 'bg-blue-50 text-blue-600 font-bold'
                                  : 'text-slate-600 hover:bg-slate-50 font-normal'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  handleSelectTopic(t.slug);
                                  setMobileMenuOpen(false);
                                }}
                                className="flex-1 text-left px-2.5 py-1.5 truncate cursor-pointer min-w-0"
                              >
                                {t.shortName}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleCompleted(t.slug);
                                }}
                                className={`p-1 mr-1 rounded cursor-pointer shrink-0 ${
                                  isDone
                                    ? 'text-emerald-600 hover:text-rose-600'
                                    : 'text-slate-300 hover:text-blue-600'
                                }`}
                                title={isDone ? "Read (Click to mark unread)" : "Mark as read"}
                              >
                                <CheckCheck size={13} strokeWidth={isDone ? 2.5 : 1.8} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      setSelectedChapterId(chapter.id);
                      setSearchParams({ chapter: chapter.id }, { replace: true });
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold truncate flex items-center justify-between cursor-pointer ${
                      isSel
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{chapter.shortTitle}</span>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                      Coming Soon
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
