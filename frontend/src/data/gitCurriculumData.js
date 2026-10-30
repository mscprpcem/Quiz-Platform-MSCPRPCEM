import { DAY_0_TOPIC, DAY_1_TOPIC, DAY_2_TOPIC, DAY_3_TOPIC, DAY_4_TOPIC, DAY_5_TOPIC } from './gitDays/index.js';

export const GIT_CURRICULUM = [
  {
    id: 'week-0',
    level: 0,
    title: 'Orientation: Mental Models & Fundamentals (Day 0)',
    subtitle: 'The Big Picture, Save Points, Git vs GitHub, computer literacy & 30-day roadmap.',
    badge: 'Day 0: Orientation',
    color: 'from-amber-500 to-orange-500',
    topics: [
      DAY_0_TOPIC
    ]
  },
  {
    id: 'week-1',
    level: 1,
    title: 'Week 1: Foundations & Daily Workflow (Days 1–7)',
    subtitle: 'Understand snapshots, .git anatomy, staging, commits, diffs, and .gitignore.',
    badge: 'Week 1: Days 1–7',
    color: 'from-blue-600 to-cyan-600',
    topics: [
      DAY_1_TOPIC,
      DAY_2_TOPIC,
      DAY_3_TOPIC,
      DAY_4_TOPIC,
      DAY_5_TOPIC,
      {
        slug: 'git-log',
        title: '6. History Inspection (git log, formatting & filtering)',
        summary: 'Explore history, visualize branches with --graph, filter commits by author and date, and inspect SHA-1 IDs.',
        readTime: '5 min read',
        content: `
### Inspecting Commit History

\`\`\`bash
# Standard history view
git log

# Concise one-line view with 7-character abbreviated commit hashes
git log --oneline

# Visual graph view showing branch forks and merges
git log --oneline --graph --all

# Show the diff (changes) introduced in each commit
git log -p -2

# Show file change statistics per commit
git log --stat
\`\`\`

---

### Useful Filtering Flags:
\`\`\`bash
# Search commits by message text
git log --grep="CVE-2026"

# Filter commits by author
git log --author="Rohan"

# Show commits in the last 7 days
git log --since="7 days ago"
\`\`\`
        `
      },
      {
        slug: 'git-diff',
        title: '7. Comparing States (git diff: Working vs Staged vs HEAD)',
        summary: 'Learn how to inspect line-by-line additions and deletions before staging or committing.',
        readTime: '5 min read',
        content: `
### Inspecting Differences with \`git diff\`

\`\`\`bash
# 1. Compare Working Directory with Staging Area
# Shows what you modified that has NOT yet been staged
git diff

# 2. Compare Staging Area with HEAD (Latest Commit)
# Shows what will go into your next commit if you ran git commit right now
git diff --staged
# (or git diff --cached)

# 3. Compare Working Directory with HEAD
# Shows all changes since the last commit, regardless of whether staged
git diff HEAD

# 4. Compare two branches
git diff main feature/login
\`\`\`

#### Reading the Diff Output:
* Lines starting with \`-\` in red were removed.
* Lines starting with \`+\` in green were added.
* \`@@ -12,4 +12,6 @@\` shows the line numbers before and after.
        `
      },
      {
        slug: 'gitignore',
        title: '8. Ignoring Files (.gitignore Patterns & Rules)',
        summary: 'Keep build artifacts, environment secrets, and editor caches out of source control forever.',
        readTime: '6 min read',
        content: `
### The Power of \`.gitignore\`

You should never commit build artifacts, node modules, OS files, or secret keys into Git. A \`.gitignore\` file in the root tells Git to completely ignore matching files.

\`\`\`bash
# Create .gitignore
touch .gitignore
\`\`\`

#### Common Pattern Rules:
\`\`\`gitignore
# Ignore specific files
.env
.env.local
config.json

# Ignore entire directories
node_modules/
dist/
build/
.next/

# Ignore files by extension
*.log
*.sqlite
*.DS_Store

# Negate (do not ignore this specific file)
!important.log

# Ignore files only in root directory, not subfolders
/TODO.md
\`\`\`

>  **Critical Rule**: \`.gitignore\` only ignores **untracked** files. If a file was already committed to Git, adding it to \`.gitignore\` will NOT stop Git from tracking it. You must first remove it from the index:
> \`\`\`bash
> git rm --cached .env
> git commit -m "chore: stop tracking .env secret"
> \`\`\`
        `
      }
    ]
  },
  {
    id: 'tier-2',
    level: 2,
    title: 'Intermediate: Branching, Merging & History Manipulation',
    subtitle: 'Master branch pointers, 3-way merges, rebasing, stashing, and conflict resolution.',
    badge: 'Level 2: Branch Master',
    color: 'from-emerald-600 to-teal-600',
    topics: [
      {
        slug: 'branching-basics',
        title: '1. Branching Fundamentals & Pointer Mechanics',
        summary: 'What is a branch under the hood? Why Git branches cost only 41 bytes and take less than 1 millisecond to create.',
        readTime: '6 min read',
        content: `
### What is a Branch in Git?

In older version control systems, creating a branch meant copying the entire source directory into another folder on disk.

In Git, **a branch is simply a 41-byte text file containing a 40-character SHA-1 commit hash**.
Creating a branch does not duplicate files — it merely creates a new movable pointer pointing to the current commit!

\`\`\`
       (HEAD -> feature)
              │
              ▼
[Commit A] ◄── [Commit B] ◄── [Commit C]
                                ▲
                                │
                              (main)
\`\`\`

---

### Branch Operations:

\`\`\`bash
# List all local branches (* denotes current branch)
git branch

# Create a new branch named 'feature/signup'
git branch feature/signup

# Delete a branch that has been merged
git branch -d feature/signup

# Force delete an unmerged branch
git branch -D feature/signup

# Rename the current branch
git branch -m new-branch-name
\`\`\`
        `
      },
      {
        slug: 'checkout-switch',
        title: '2. Switching Branches (git checkout vs git switch)',
        summary: 'Modern Git switch vs legacy checkout, and navigating detached HEAD states.',
        readTime: '5 min read',
        content: `
### Modern Branch Switching

Historically, \`git checkout\` was overloaded: it was used to switch branches AND discard uncommitted file modifications.
In Git 2.23+, Git introduced dedicated commands:
* **\`git switch\`**: Exclusively for switching branches.
* **\`git restore\`**: Exclusively for discarding file changes.

\`\`\`bash
# Switch to an existing branch
git switch feature/auth

# Create AND switch to a new branch in one step
git switch -c feature/payments
# (Equivalent to legacy: git checkout -b feature/payments)
\`\`\`

---

### What is a "Detached HEAD"?
Normally, \`HEAD\` points to a branch name (\`HEAD -> main\`).
If you check out a specific commit hash directly (\`git checkout c3f81e7\`), \`HEAD\` points directly to the commit instead of a branch.
Any new commits created in this state will become orphaned when you switch away!
        `
      },
      {
        slug: 'merging-mechanics',
        title: '3. Merging: Fast-Forward vs 3-Way Recursive Merge',
        summary: 'Understand how Git combines branches, when fast-forward occurs, and how merge commits work.',
        readTime: '7 min read',
        content: `
### Merging Branches

To merge changes from \`feature\` into \`main\`:
1. Switch to the receiving branch: \`git switch main\`
2. Run merge: \`git merge feature\`

---

### Fast-Forward Merge
If \`main\` has not had any new commits since \`feature\` branched off, Git simply moves the \`main\` pointer forward to the tip of \`feature\`. No new commit is created!

\`\`\`
Before Merge:
main ──► [Commit A]
                   \
        feature ──► [Commit B] ──► [Commit C]

After Fast-Forward Merge:
main, feature ──► [Commit B] ──► [Commit C]
\`\`\`

---

### 3-Way Merge (True Merge Commit)
If \`main\` AND \`feature\` have both received independent commits, a fast-forward is impossible. Git performs a **3-way merge** between:
1. Common ancestor commit
2. Tip of \`main\`
3. Tip of \`feature\`

Git automatically creates a special **Merge Commit** with **two parent commits**:

\`\`\`
          [Commit B (feature)]
         /                    \
[Commit A]                     [Merge Commit M (main)]
         \                    /
          [Commit C (main)] ──
\`\`\`
        `
      },
      {
        slug: 'rebasing-linear',
        title: '4. Rebasing: Creating a Clean Linear History',
        summary: 'Understand git rebase, how it rewinds and reapplies commits, and the Golden Rule of Rebasing.',
        readTime: '7 min read',
        content: `
### What is Rebasing?

Rebasing is an alternative way to integrate changes. Instead of creating a merge commit, \`git rebase\` takes the commits from your feature branch, rewinds them, and reapplies them on top of the target branch one by one.

\`\`\`bash
git switch feature
git rebase main
\`\`\`

\`\`\`
Before Rebase:
main:    [A] ──► [B] ──► [C]
feature:          \──► [D] ──► [E]

After git rebase main:
main:    [A] ──► [B] ──► [C]
feature:                   \──► [D'] ──► [E']   <-- Linear history!
\`\`\`

---

### Merge vs Rebase Trade-offs:
* **Merge**: Preserves exact chronological history and who merged what. History graph can become a "railroad track" of lines.
* **Rebase**: Produces a clean, 100% linear history that is easy to read and bisect. Commits get new SHA-1 hashes!

---

### The Golden Rule of Rebasing
> **Never rebase a branch that has already been pushed and shared with other teammates!**
> Because rebasing generates new commit hashes, pushing a rebased shared branch will break your teammates' local repositories. Rebase only your private, local feature branches before opening a PR.
        `
      },
      {
        slug: 'stashing-changes',
        title: '5. Stashing Changes (git stash & Context Switching)',
        summary: 'Temporarily shelve dirty working directory changes without committing, switch tasks, and reapply later.',
        readTime: '5 min read',
        content: `
### When Do You Need a Stash?

Imagine you are halfway through coding a feature, files are half-written and broken, and your manager suddenly says: *"Stop everything! Production is down, switch to main and fix this hotfix right now."*

You cannot switch branches with half-written uncommitted code that conflicts with main.
**Solution: \`git stash\`!**

\`\`\`bash
# 1. Save your uncommitted changes into the stash stack
git stash -m "WIP: login form validation"

# 2. Your working directory is now clean! Switch to main and fix bug
git switch main
# ... fix bug, commit, push ...

# 3. Switch back to your feature branch
git switch feature/login

# 4. Restore your stashed changes and remove them from stash stack
git stash pop
\`\`\`

---

### Useful Stash Commands:
\`\`\`bash
# List all stashed items
git stash list

# Inspect what is in the top stash without applying
git stash show -p

# Apply stash changes but KEEP it in the stash stack
git stash apply

# Clear all stashes
git stash clear
\`\`\`
        `
      },
      {
        slug: 'undoing-changes',
        title: '6. Undoing Mistakes (git restore, reset & revert)',
        summary: 'The safety net: Unstaging files, discarding local edits, soft vs mixed vs hard reset, and safe git revert.',
        readTime: '8 min read',
        content: `
### How to Undo Anything in Git

#### 1. Discard Unstaged Changes in Working Directory
\`\`\`bash
git restore index.html
# (Replaces local index.html with the last committed version)
\`\`\`

#### 2. Unstage a Staged File (Keep your edits)
\`\`\`bash
git restore --staged index.html
\`\`\`

---

### Resetting Commits (\`git reset\`)
\`git reset\` moves the current branch pointer backward to an earlier commit.

| Mode | Moves Branch Pointer | Resets Staging Area | Overwrites Working Tree | Safety Level |
| :--- | :---: | :---: | :---: | :---: |
| **\`--soft\`** | YES | NO (Files stay staged) | NO | Very Safe |
| **\`--mixed\`** (default) | YES | YES (Files unstage) | NO (Files stay in working dir) | Safe |
| **\`--hard\`** | YES | YES | **YES (Erases all uncommitted code!)** |  Destructive |

\`\`\`bash
# Undo the last commit, but keep all modified code staged for revision
git reset --soft HEAD~1

# Undo last commit, keep changes unstaged in working directory
git reset --mixed HEAD~1

# DANGER: Destroy all changes since commit c3f81e7
git reset --hard c3f81e7
\`\`\`

---

### Safe Collaborative Undoing: \`git revert\`
If a buggy commit has **already been pushed to GitHub**, you must NEVER use \`git reset\`.
Instead, use \`git revert\`:
\`\`\`bash
git revert c3f81e7
\`\`\`
This creates a **brand new commit** whose changes are the exact mathematical opposite of \`c3f81e7\`. History is preserved, and teammates will not have broken trees!
        `
      },
      {
        slug: 'cherry-pick',
        title: '7. Cherry-Picking Specific Commits (git cherry-pick)',
        summary: 'Pick an isolated commit from one branch and apply it directly onto another without merging the whole branch.',
        readTime: '5 min read',
        content: `
### What is Cherry-Picking?

\`git cherry-pick\` allows you to select a specific commit from one branch and duplicate it onto your current branch.

\`\`\`
Branch feature:  [Commit A] ──► [Commit B (Bugfix)] ──► [Commit C]
Branch main:     [Commit X] ──► [Commit Y]
                                     │
                     git cherry-pick SHA_OF_B
                                     ▼
Branch main:     [Commit X] ──► [Commit Y] ──► [Commit B' (Bugfix applied!)]
\`\`\`

\`\`\`bash
# Switch to destination branch
git switch main

# Apply commit by hash
git cherry-pick c3f81e7
\`\`\`

>  **Best Use Case**: A teammate wrote an urgent bug fix inside a long experimental feature branch. Instead of waiting weeks to merge the unfinished feature, you cherry-pick just the bug fix commit onto \`main\`!
        `
      },
      {
        slug: 'merge-conflicts',
        title: '8. Merge Conflicts (Detection, Markers & Resolution)',
        summary: 'Demystify merge conflicts: Learn how to read <<<<<<< markers, resolve differences, stage, and complete the merge.',
        readTime: '7 min read',
        content: `
### Why Do Merge Conflicts Happen?

A conflict occurs when two branches **modified the same line in the same file differently**, or one branch deleted a file that another branch edited.
Git cannot guess which version is correct, so it stops and asks the developer to decide.

---

### Reading Conflict Markers:

\`\`\`html
<<<<<<< HEAD (Current branch: main)
<h1>Welcome to MSC PRPCEM 2026</h1>
=======
<h1>Welcome to Microsoft Student Club</h1>
>>>>>>> feature/title-update (Incoming branch)
\`\`\`

* \`<<<<<<< HEAD\`: Marks the beginning of the version on your current branch.
* \`=======\`: The dividing separator between the two versions.
* \`>>>>>>> feature/title-update\`: Marks the end of the incoming version.

---

### The 4-Step Resolution Workflow:
1. **Open the conflicting file** in your editor or terminal.
2. **Edit the file**: Remove the conflict markers (\`<<<<<<<\`, \`=======\`, \`>>>>>>>\`) and combine the code into the final correct form.
3. **Stage the resolved file**:
   \`\`\`bash
   git add index.html
   \`\`\`
4. **Complete the merge commit**:
   \`\`\`bash
   git commit -m "Merge branch 'feature/title-update' and resolve conflict"
   \`\`\`
        `
      }
    ]
  },
  {
    id: 'tier-3',
    level: 3,
    title: 'GitHub & Remote Collaboration',
    subtitle: 'Synchronize remotes, open source fork-and-pull workflows, pull requests, and code reviews.',
    badge: 'Level 3: Collaboration Pro',
    color: 'from-purple-600 to-indigo-600',
    topics: [
      {
        slug: 'remotes-origin',
        title: '1. Remote Repositories & Origin Conventions',
        summary: 'Understand remote names, origin conventions, and configuring remote URLs.',
        readTime: '5 min read',
        content: `
### What is a Remote?

A remote is a version of your repository hosted on the internet (GitHub, GitLab, Azure DevOps) or private network.
By convention, your primary remote is named **\`origin\`**.

\`\`\`bash
# List all configured remotes with their URLs
git remote -v

# Add a remote named origin
git remote add origin https://github.com/mscprpcem/quiz-platform.git

# Rename a remote
git remote rename origin upstream

# Remove a remote
git remote remove origin
\`\`\`
        `
      },
      {
        slug: 'fetch-pull-push',
        title: '2. Synchronization: fetch vs pull vs push',
        summary: 'Why git fetch is safer than git pull, how git push updates remotes, and pull --rebase benefits.',
        readTime: '6 min read',
        content: `
### Remote Synchronization Workflow

\`\`\`
Local Repository               Remote (GitHub: origin)
┌──────────────┐   git push    ┌──────────────────────┐
│  Local main  │ ────────────► │     Remote main      │
└──────────────┘               └──────────────────────┘
       ▲                                   │
       │           git fetch               │
       └───────────────────────────────────┘
               (Updates origin/main)
\`\`\`

#### \`git fetch\` vs \`git pull\`:
* **\`git fetch\`**: Downloads all new commits and branches from the remote, but **does not touch your working directory or merge anything**. Highly recommended!
* **\`git pull\`**: Performs \`git fetch\` followed immediately by \`git merge\`. Can create surprise merge conflicts if you are in the middle of editing.

\`\`\`bash
# Safest collaborative pull (prevents unnecessary merge bubbles)
git pull --rebase origin main

# Standard push
git push origin feature/login
\`\`\`
        `
      },
      {
        slug: 'upstream-tracking',
        title: '3. Upstream Branch Tracking (-u / --set-upstream)',
        summary: 'Link local branches to remote tracking branches so you can simply type git push and git pull.',
        readTime: '4 min read',
        content: `
### Setting Upstream Tracking

The first time you push a newly created local branch to GitHub, Git does not know which remote branch to link it with.

\`\`\`bash
git push -u origin feature/login
# (or git push --set-upstream origin feature/login)
\`\`\`

The \`-u\` flag establishes a permanent tracking link between:
* Local: \`feature/login\`
* Remote: \`origin/feature/login\`

Once set, future pushes and pulls on this branch require only:
\`\`\`bash
git push
git pull
\`\`\`
        `
      },
      {
        slug: 'forks-sync',
        title: '4. Forks & Upstream Synchronization in Open Source',
        summary: 'The open-source fork-and-pull model: Clones vs forks, upstream remotes, and keeping your fork up to date.',
        readTime: '6 min read',
        content: `
### The Open-Source Forking Model

In open-source software, you do not have write access to push branches directly to the official project. Instead, you use the **Fork & Pull Request model**:

1. **Fork**: Create your own copy of the repository on your GitHub account.
2. **Clone**: Clone your fork to your computer:
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/project.git
   \`\`\`
3. **Add Upstream Remote**: Link the original project as \`upstream\`:
   \`\`\`bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/project.git
   \`\`\`

---

### Syncing Your Fork with the Latest Official Changes:
\`\`\`bash
# 1. Fetch upstream changes
git fetch upstream

# 2. Switch to your main branch
git switch main

# 3. Fast-forward merge upstream/main into your local main
git merge upstream/main

# 4. Push updated main to your GitHub fork
git push origin main
\`\`\`
        `
      },
      {
        slug: 'pull-requests',
        title: '5. Pull Requests (Etiquette, Templates & Issue Linking)',
        summary: 'Craft professional PRs: Meaningful titles, screenshots, issue autolinking with fixes #12, and small PR sizes.',
        readTime: '5 min read',
        content: `
### Anatomy of a High-Quality Pull Request (PR)

A Pull Request is not just code — it is an engineering proposal and documentation for future team members.

#### Golden Rules for PRs:
1. **Keep PRs Small**: Reviewers take days to review a 500-line PR, but minutes to review an 80-line PR.
2. **Link Related Issues**: Use keyword triggers in the PR body:
   * \`Closes #42\`
   * \`Fixes #108\`
   When the PR merges into main, GitHub automatically closes those issues!
3. **Provide Context**: Include before/after screenshots or test verification commands.
        `
      },
      {
        slug: 'code-reviews',
        title: '6. Code Reviews (Suggestions, Approvals & Etiquette)',
        summary: 'How to conduct and receive code reviews, use GitHub suggestion blocks, and resolve discussions.',
        readTime: '5 min read',
        content: `
### Industry Code Review Standards

Code reviews ensure software quality, share domain knowledge across the team, and catch vulnerabilities before deployment.

#### Reviewer Best Practices:
* Praise great code: Leave positive comments on clean abstractions.
* Be constructive: Explain the *reason* behind a requested change (e.g., performance, memory leak, security).
* Use GitHub suggestion markdown so the author can accept fixes with 1 click:
  \`\`\`suggestion
  const safeToken = sanitizeInput(token);
  \`\`\`

#### Author Best Practices:
* Do not take feedback personally — reviews critique the code, not the engineer.
* Never push force-pushes that destroy conversation history while reviews are ongoing.
        `
      },
      {
        slug: 'issues-projects',
        title: '7. Issues, Milestones, and Project Boards',
        summary: 'Track bugs, assign milestones, and manage sprint backlogs with GitHub Projects and Kanban boards.',
        readTime: '4 min read',
        content: `
### Project Planning with GitHub

* **Issues**: Track bugs, feature requests, and technical debt. Use issue templates for structured bug reports.
* **Milestones**: Group issues and pull requests toward a targeted release date (e.g. \`v2.0-MVP\`). Shows completion percentage.
* **GitHub Projects (Kanban)**: Automated boards with columns (\`Todo\`, \`In Progress\`, \`Under Review\`, \`Done\`). Moving a PR automatically advances linked issues!
        `
      }
    ]
  },
  {
    id: 'tier-4',
    level: 4,
    title: 'Advanced: Power Tools & Automation',
    subtitle: 'Interactive rebasing, reflog disaster recovery, binary bisect debugging, and GitHub Actions CI/CD.',
    badge: 'Level 4: Git Ninja',
    color: 'from-amber-600 to-orange-600',
    topics: [
      {
        slug: 'interactive-rebase',
        title: '1. Interactive Rebase (git rebase -i: Squash & Reword)',
        summary: 'Clean up sloppy commit histories before submitting pull requests: squash WIP commits and reword messages.',
        readTime: '7 min read',
        content: `
### Polishing History with Interactive Rebase

Before opening a PR, your branch may have messy commits like:
* \`wip\`
* \`fixed typo\`
* \`try again\`
* \`forgot semicolon\`

With \`git rebase -i\`, you can clean this into a single clean commit:

\`\`\`bash
# Interactively rebase the last 4 commits
git rebase -i HEAD~4
\`\`\`

Git opens an editor with options:
\`\`\`
pick a1b2c3d feat: add user profile model
squash e4f5g6h fix typo in user profile
squash 7i8j9k0 add missing validation
\`\`\`

#### Common Commands:
* **\`pick\`**: Keep the commit as is.
* **\`reword\`**: Keep the commit, but change the commit message.
* **\`squash\`**: Melds the commit into the previous commit and concatenates messages.
* **\`fixup\`**: Melds into the previous commit, discarding the commit message.
* **\`drop\`**: Deletes the commit entirely!
        `
      },
      {
        slug: 'git-reflog',
        title: '2. The Ultimate Safety Net: git reflog',
        summary: 'Recover deleted branches, undo accidental git reset --hard, and bring back "lost" commits.',
        readTime: '6 min read',
        content: `
### Nothing is Truly Lost in Git

Did you just run \`git reset --hard\` accidentally and panic that 3 days of work disappeared?
**Stay calm! Git rarely deletes data immediately.**

\`git reflog\` records every single movement of \`HEAD\` in your local repository for the past 90 days:

\`\`\`bash
git reflog
\`\`\`

Output:
\`\`\`
c3f81e7 HEAD@{0}: reset: moving to HEAD~2
a91b24f HEAD@{1}: commit: feat: complete database migration
77de10b HEAD@{2}: commit: feat: add authentication middleware
\`\`\`

---

### Recovering the Lost Commit:
Notice that \`a91b24f\` was your commit before the hard reset! Simply reset back to it:

\`\`\`bash
git reset --hard HEAD@{1}
# or
git reset --hard a91b24f
\`\`\`
Your lost commits are restored instantly!
        `
      },
      {
        slug: 'git-bisect',
        title: '3. Debugging History: git bisect',
        summary: 'Binary search through thousands of commits to find the exact commit that introduced a production regression.',
        readTime: '6 min read',
        content: `
### Binary Searching Bug Inceptions

Suppose a critical bug appeared in production. You know it was working fine in release \`v1.0.0\` (200 commits ago), but is broken on \`main\` today.
Instead of manually checking 200 commits, **\`git bisect\` finds the culprit in only 7 tests** using binary search ($O(\\log n)$)!

\`\`\`bash
# 1. Start bisect mode
git bisect start

# 2. Tell Git the current commit is bad
git bisect bad

# 3. Tell Git the known good commit
git bisect good v1.0.0
\`\`\`

Git checks out the middle commit (commit #100).
Run your tests:
* If it passes: \`git bisect good\`
* If it fails: \`git bisect bad\`

Git halves the search space each time until it prints:
\`c3f81e7a... is the first bad commit!\`
To finish and return to your original branch:
\`\`\`bash
git bisect reset
\`\`\`
        `
      },
      {
        slug: 'tags-semver',
        title: '4. Tagging & Semantic Versioning (SemVer)',
        summary: 'Mark release points with lightweight and annotated tags, and understand SemVer (MAJOR.MINOR.PATCH).',
        readTime: '5 min read',
        content: `
### Git Tags vs Branches
Branches move forward as new commits are added. **Tags are permanent, frozen markers** used to mark releases.

#### Semantic Versioning (SemVer: \`vX.Y.Z\`):
* **MAJOR (X)**: Incompatible, breaking API changes.
* **MINOR (Y)**: Backwards-compatible new features.
* **PATCH (Z)**: Backwards-compatible bug fixes.

\`\`\`bash
# Create an annotated tag (recommended for releases)
git tag -a v2.1.0 -m "Release v2.1.0: Student sync with Azure Blob integration"

# List all tags
git tag

# Inspect tag metadata and signer
git show v2.1.0

# Push tags to GitHub (tags are NOT pushed by default!)
git push origin v2.1.0
# Or push all tags:
git push origin --tags
\`\`\`
        `
      },
      {
        slug: 'github-releases',
        title: '5. GitHub Releases, Changelogs & Asset Binaries',
        summary: 'Package versioned releases on GitHub, generate automatic release notes, and attach compiled artifacts.',
        readTime: '4 min read',
        content: `
### Publishing GitHub Releases

When a Git tag is pushed to GitHub, you can draft an official **GitHub Release**:
* Generates an automatic changelog listing merged PRs and authors.
* Generates source code \`.zip\` and \`.tar.gz\` archives.
* Allows attaching compiled binary assets (e.g. \`.exe\`, \`.apk\`, \`.dmg\`, \`.jar\`).
        `
      },
      {
        slug: 'github-actions',
        title: '6. GitHub Actions & CI/CD Pipelines',
        summary: 'Automate testing, linting, and cloud deployments with YAML workflows in .github/workflows/.',
        readTime: '7 min read',
        content: `
### Continuous Integration with GitHub Actions

GitHub Actions runs automated tasks directly in virtual containers whenever events occur in your repository.

Workflows live in: \`.github/workflows/ci.yml\`

\`\`\`yaml
name: Node.js CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
    - run: npm ci
    - run: npm test
    - run: npm run lint
\`\`\`

If tests fail, GitHub blocks the PR from merging, preventing broken code from hitting production!
        `
      }
    ]
  },
  {
    id: 'tier-5',
    level: 5,
    title: 'Real-World Scenarios & Production Workflows',
    subtitle: 'Trunk-based development, secret scrubbing, hotfix protocols, and open source contribution lifecycle.',
    badge: 'Level 5: Open Source Lead',
    color: 'from-rose-600 to-pink-600',
    topics: [
      {
        slug: 'team-git-workflows',
        title: '1. Team Git Workflows: Trunk-Based vs GitFlow',
        summary: 'Compare industry development workflows: GitFlow (release branches) vs Trunk-Based Development (short-lived feature flags).',
        readTime: '6 min read',
        content: `
### Industry Branching Strategies

#### 1. GitFlow (Traditional Enterprise)
* Branches: \`main\`, \`develop\`, \`feature/*\`, \`release/*\`, \`hotfix/*\`.
* Features merge into \`develop\`. Releases are branched off \`develop\`, tested, and merged into \`main\`.
* Best for: Scheduled software releases (e.g. mobile apps, embedded firmware).

#### 2. Trunk-Based Development (Modern Cloud / FAANG)
* Everyone works on very short-lived branches (1-2 days max) that merge directly into \`main\` (the trunk).
* Unfinished features are protected in production using **Feature Flags**.
* Best for: Continuous Deployment (CD), SaaS web platforms deploying 10+ times per day.
        `
      },
      {
        slug: 'secret-scrubbing',
        title: '2. Incident Recovery: Leaked Secret Removal & BFG Repo-Cleaner',
        summary: 'What to do when an AWS key or database password is accidentally committed: Revoke, scrub history, and force-push.',
        readTime: '7 min read',
        content: `
### Production Emergency: Leaked API Keys

If you accidentally committed an AWS secret key or DB password to GitHub:

> **IMMEDIATE RULE #1: REVOKE THE KEY FIRST.**
> Automated bot scrapers clone public GitHub commits in under 3 seconds. The moment a commit hits GitHub, assume the secret is compromised. Revoke it in your AWS/Azure console immediately!

---

### Why \`git rm\` is Not Enough:
Running \`git rm .env\` and committing only removes the file in the *newest* commit.
The secret remains visible in your **commit history**!

---

### Scrubbing the Secret from All History:
Using modern tools like \`git-filter-repo\` or \`BFG Repo-Cleaner\`:

\`\`\`bash
# Using git-filter-repo to purge a file from every commit ever made
git filter-repo --path .env --invert-paths

# Force push the cleaned history to remote
git push origin --force --all
\`\`\`
        `
      },
      {
        slug: 'emergency-hotfix',
        title: '3. Emergency Production Hotfix Workflow',
        summary: 'The protocol for patching a zero-day vulnerability in production without breaking in-progress features.',
        readTime: '6 min read',
        content: `
### Zero-Downtime Hotfix Protocol

When a critical vulnerability is discovered in production:
1. Branch directly from \`main\` (or the production release tag):
   \`\`\`bash
   git switch -c hotfix/sec-cve-2026-auth main
   \`\`\`
2. Write the minimal targeted patch and test thoroughly.
3. Commit and merge immediately to \`main\`:
   \`\`\`bash
   git switch main
   git merge --no-ff hotfix/sec-cve-2026-auth
   git tag -a v2.4.1 -m "Hotfix: resolve auth token bypass"
   git push origin main --tags
   \`\`\`
4. Don't forget: Merge the hotfix back into in-progress staging / develop branches so the bug does not return on the next regular release!
        `
      },
      {
        slug: 'multi-branch-conflicts',
        title: '4. Complex Multi-Branch Conflict Triage',
        summary: 'Strategies for triaging massive conflicts across multiple diverged branches and submodules.',
        readTime: '6 min read',
        content: `
### Triage Strategies for Mega-Conflicts

When dealing with conflicts across 50+ files during a major framework upgrade:
1. **Never resolve blind**: Use visual 3-way merge tools (VS Code 3-Way Merge Editor, KDiff3, Beyond Compare).
2. **Break it down**: Resolve one directory at a time.
3. **Run tests between steps**: Don't commit until unit tests and linter pass.
4. **If lost, abort cleanly**:
   \`\`\`bash
   git merge --abort
   # or
   git rebase --abort
   \`\`\`
   This immediately restores your repository to the exact pristine state before you started the merge!
        `
      },
      {
        slug: 'open-source-contributing',
        title: '5. Contributing to Open-Source (DCO, Signing Commits & PRs)',
        summary: 'The complete lifecycle of contributing to major open-source repositories: GPG commit signing, DCO, and CLA.',
        readTime: '6 min read',
        content: `
### Professional Open Source Contribution Checklist

1. **Read CONTRIBUTING.md**: Every project has rules on styling, tests, and branch naming.
2. **Sign-off Commits (-s / DCO)**:
   Many projects (Linux Kernel, Kubernetes) require Developer Certificate of Origin:
   \`\`\`bash
   git commit -s -m "fix(router): prevent race condition on route change"
   \`\`\`
3. **Cryptographically Sign Commits with GPG or SSH**:
   Ensures verified badge on GitHub:
   \`\`\`bash
   git commit -S -m "feat: secure implementation"
   \`\`\`
4. **Be Patient & Responsive**: Address reviewer comments promptly with polite, clear explanations.
        `
      }
    ]
  }
];

// 30-Day Developer Mastery Roadmap
export const GIT_ROADMAP = [
  {
    week: 'Orientation',
    title: 'Orientation & Mental Models',
    days: [
      { day: 0, title: 'Day 0: The Big Picture, Git vs GitHub & Computer Literacy', topic: 'day-0-orientation' }
    ]
  },
  {
    week: 'Week 1',
    title: 'Foundations & Daily Workflow',
    days: [
      { day: 1, title: 'Day 1: Version Control Fundamentals & Local Installation', topic: 'git-basics' },
      { day: 2, title: 'Day 2: Git Configuration (git config, Local vs. Global)', topic: 'git-config' },
      { day: 3, title: 'Day 3: Repository Basics & The Three Trees', topic: 'git-init' },
      { day: 4, title: 'Day 4: Basic Git Commands (add, commit, log, .gitignore)', topic: 'git-status-add' },
      { day: 5, title: 'Day 5: GitHub Essentials (Account, Interface, Profile & Profile README)', topic: 'github-essentials' },
      { day: 6, title: 'Day 6: Repositories & Documentation', topic: 'git-log' },
      { day: 7, title: 'Day 7: Git Remotes & Cloud Sync', topic: 'gitignore' }
    ]
  },
  {
    week: 'Week 2',
    title: 'Branching & History Manipulation',
    days: [
      { day: 8, title: 'Branch Pointers & Mechanics', topic: 'branching-basics' },
      { day: 9, title: 'Branch Switching & Detached HEAD', topic: 'checkout-switch' },
      { day: 10, title: 'Fast-Forward vs 3-Way Recursive Merges', topic: 'merging-mechanics' },
      { day: 11, title: 'Linear Rebasing & The Golden Rule', topic: 'rebasing-linear' },
      { day: 12, title: 'Context Switching with git stash', topic: 'stashing-changes' },
      { day: 13, title: 'Undoing Changes: restore, reset & revert', topic: 'undoing-changes' },
      { day: 14, title: 'Resolving Merge Conflicts Confidently', topic: 'merge-conflicts' }
    ]
  },
  {
    week: 'Week 3',
    title: 'GitHub & Team Collaboration',
    days: [
      { day: 15, title: 'Remote Configuration & Origin Conventions', topic: 'remotes-origin' },
      { day: 16, title: 'Synchronization: fetch vs pull vs push', topic: 'fetch-pull-push' },
      { day: 17, title: 'Upstream Tracking & Upstream Branches', topic: 'upstream-tracking' },
      { day: 18, title: 'Open-Source Fork-and-Pull Workflows', topic: 'forks-sync' },
      { day: 19, title: 'High-Impact Pull Requests & Issue Linking', topic: 'pull-requests' },
      { day: 20, title: 'Professional Code Reviews & Suggestions', topic: 'code-reviews' },
      { day: 21, title: 'GitHub Projects, Milestones & Backlogs', topic: 'issues-projects' }
    ]
  },
  {
    week: 'Week 4',
    title: 'Power Tools & Production Mastery',
    days: [
      { day: 22, title: 'Interactive Rebase: Squash & Reword', topic: 'interactive-rebase' },
      { day: 23, title: 'Disaster Recovery with git reflog', topic: 'git-reflog' },
      { day: 24, title: 'Binary Bug Hunting with git bisect', topic: 'git-bisect' },
      { day: 25, title: 'Semantic Versioning & Annotated Tags', topic: 'tags-semver' },
      { day: 26, title: 'GitHub Actions CI/CD Automated Pipelines', topic: 'github-actions' },
      { day: 27, title: 'Trunk-Based vs GitFlow Branching Models', topic: 'team-git-workflows' },
      { day: 28, title: 'Emergency Hotfix Deployment Workflows', topic: 'emergency-hotfix' },
      { day: 29, title: 'Scrubbing Leaked Secrets from Git History', topic: 'secret-scrubbing' },
      { day: 30, title: 'Open Source Contribution, DCO & Commit Signing', topic: 'open-source-contributing' }
    ]
  }
];

// Git Quick Cheat-Sheet
export const GIT_CHEATSHEET = [
  {
    category: 'Setup & Config',
    commands: [
      { cmd: 'git config --global user.name "Your Name"', desc: 'Set global author name' },
      { cmd: 'git config --global user.email "you@example.com"', desc: 'Set global author email' },
      { cmd: 'git init', desc: 'Initialize a new repository' },
      { cmd: 'git clone <url>', desc: 'Clone a remote repository' }
    ]
  },
  {
    category: 'Basic Snapshotting',
    commands: [
      { cmd: 'git status', desc: 'Check status of working directory & staging area' },
      { cmd: 'git add <file>', desc: 'Stage specific file for commit' },
      { cmd: 'git add .', desc: 'Stage all modified & new files' },
      { cmd: 'git commit -m "<msg>"', desc: 'Record staged changes in a new commit' },
      { cmd: 'git diff', desc: 'Show unstaged changes in working tree' },
      { cmd: 'git diff --staged', desc: 'Show staged changes ready to commit' }
    ]
  },
  {
    category: 'Branching & Merging',
    commands: [
      { cmd: 'git branch', desc: 'List all local branches' },
      { cmd: 'git switch -c <name>', desc: 'Create and switch to new branch' },
      { cmd: 'git switch <name>', desc: 'Switch to existing branch' },
      { cmd: 'git merge <branch>', desc: 'Merge specified branch into current branch' },
      { cmd: 'git rebase <branch>', desc: 'Rebase current branch onto target branch' },
      { cmd: 'git branch -d <name>', desc: 'Delete merged branch' }
    ]
  },
  {
    category: 'Remotes & Collaboration',
    commands: [
      { cmd: 'git remote -v', desc: 'List remote URLs' },
      { cmd: 'git fetch origin', desc: 'Download remote commits without merging' },
      { cmd: 'git pull origin <branch>', desc: 'Fetch and merge remote changes' },
      { cmd: 'git push -u origin <branch>', desc: 'Push branch and set upstream tracking' }
    ]
  },
  {
    category: 'Disaster Recovery & Undoing',
    commands: [
      { cmd: 'git restore <file>', desc: 'Discard unstaged changes in file' },
      { cmd: 'git restore --staged <file>', desc: 'Unstage file while preserving edits' },
      { cmd: 'git reset --soft HEAD~1', desc: 'Undo last commit, keep changes staged' },
      { cmd: 'git reset --mixed HEAD~1', desc: 'Undo last commit, keep changes unstaged' },
      { cmd: 'git revert <commit>', desc: 'Create new commit reversing historical commit' },
      { cmd: 'git reflog', desc: 'View HEAD history to recover lost commits' }
    ]
  }
];
