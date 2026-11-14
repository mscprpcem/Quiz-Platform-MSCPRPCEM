// =========================================================================
// DAY 4: BASIC GIT COMMANDS (git add, git commit, git log, .gitignore)
// =========================================================================

export const DAY_4_METADATA = {
  day: 4,
  week: 'Chapter 1',
  weekTitle: 'Chapter 1: Git Foundations & Daily Workflow',
  slug: 'git-status-add',
  title: 'Staging Area & Commits (git add, git commit, git status)',
  shortTitle: '5. Staging & Commits',
  summary: 'Transitions from passive repository inspection to recording snapshots and managing file tracking: git add, git commit, viewing commit history (git log), and .gitignore.',
  readTime: '7 min read',
  badge: 'Chapter 1',
  color: 'from-blue-600 to-indigo-600',
  modules: [
    '1. The Core Lifecycle of a Commit',
    '2. Staging Files with git add',
    '3. Creating Snapshots with git commit',
    '4. Inspecting History with git log',
    '5. Ignoring Files with .gitignore',
    '6. Hands-On Practical Task Walkthrough',
    'Quick Reference Summary'
  ]
};

export const DAY_4_TOPIC = {
  slug: 'git-status-add',
  title: 'Staging Area & Commits (git add, git commit, git status)',
  summary: 'Master the daily Git recording cycle: two-step staging and committing, inspecting history with git log, and configuring .gitignore to safeguard sensitive files.',
  readTime: '7 min read',
  badge: 'Chapter 1',
  content: `
### Overview: Recording Snapshots & Managing File Tracking

Welcome to Staging & Commits. In this lesson, you transition from repository setup to recording snapshots and managing file tracking:

* **Learning Module:** Daily Staging & Commits
* **Topics to Cover:** \`git add\`, \`git commit\`, viewing commit history (\`git log\`), \`.gitignore\`
* **Practical Task:** Make commits and ignore unnecessary files

---

### 1. The Core Lifecycle of a Commit

In Git, saving changes is an explicit two-step operation:

* **Staging (\`git add\`):** Selecting exactly which modified or new files belong in the upcoming milestone snapshot.
* **Committing (\`git commit\`):** Freezing that staged bundle into an immutable, cryptographically hashed record in the repository's permanent history.

\`\`\`
Working Directory               Staging Area (Index)              Local Repo (Commit Object)
┌──────────────────────┐        ┌──────────────────────┐        ┌───────────────────────────────┐
│ Edit/Create files    │        │ Staged files ready   │        │ Permanent Snapshot            │
│ app.py, notes.txt    │ ─────> │ for inclusion        │ ─────> │ SHA: 7b3e9a1                  │
│                      │ git add│ app.py               │ git    │ Author, Timestamp, Message    │
└──────────────────────┘        └──────────────────────┘ commit └───────────────────────────────┘
\`\`\`

![The Git Commit Lifecycle & Daily Development Loop](/assets/git-commit-lifecycle.jpg)

> **Key Architectural Insight:** This two-phase separation protects you from accidental commits. You can edit 10 files during the day, but selectively stage and commit only the 2 files related to a specific bug fix, keeping your commit history clean and reviewable.

---

### 2. Staging Files with \`git add\`

The \`git add\` command moves changes from the Working Directory to the Staging Area (also referred to as the **Index**).

#### Essential Staging Commands:

* **Stage a specific file:**
  \`\`\`bash
  git add <filename>
  \`\`\`
* **Stage multiple specific files:**
  \`\`\`bash
  git add app.js styles.css index.html
  \`\`\`
* **Stage all changes across the repository (new, modified, and deleted files):**
  \`\`\`bash
  git add .
  \`\`\`
  *(Or: \`git add -A\` / \`git add --all\`)*
* **Interactive staging (stage partial hunks/lines of code within a file):**
  \`\`\`bash
  git add -p <filename>
  \`\`\`

#### Unstaging Files
If a file was staged accidentally, pull it back to the Working Directory without discarding your written code:

\`\`\`bash
git restore --staged <filename>
\`\`\`
*(Legacy syntax: \`git reset HEAD <filename>\`)*

---

### 3. Creating Snapshots with \`git commit\`

A commit is an immutable point-in-time snapshot of the staged files. Every commit generates a unique 40-character SHA-1 hash (or SHA-256 in modern setups) containing author metadata, the parent commit reference, and the tree structure.

#### Standard Inline Commit
\`\`\`bash
git commit -m "feat: implement user authentication flow"
\`\`\`

#### Writing Detailed Multi-Line Commit Messages
Executing \`git commit\` without the \`-m\` flag opens your configured text editor (e.g., VS Code or Nano) to write a detailed log:

\`\`\`bash
git commit
\`\`\`

**Standard Commit Format:**
\`\`\`plaintext
Short summary (50 characters or less)

More detailed explanatory text wrapping at 72 characters.
Explain the problem this commit solves, why the change was made,
and any side effects or gotchas.

- Bullet points are acceptable
- Closes #104
\`\`\`

#### Staging and Committing Tracked Files Simultaneously (\`-am\`)
To stage all modified tracked files and commit them in a single command:

\`\`\`bash
git commit -am "fix: correct typo in hero banner"
\`\`\`

> **Notice:** The \`-am\` shortcut **does not** pick up newly created untracked files. New files must first be staged with \`git add <filename>\`.

---

### 4. Inspecting History with \`git log\`

The \`git log\` command prints the repository's chronological commit history starting from the most recent commit back to the initial root commit.

| Command Flag | Output Style / Purpose |
| :--- | :--- |
| \`git log\` | Default view: 40-character SHA, Author, Date, and full message. |
| \`git log --oneline\` | Compact view: 7-character abbreviated hash and commit title. |
| \`git log -n <number>\` | Limits output to the last N commits (e.g., \`git log -n 3\` or \`git log -3\`). |
| \`git log --stat\` | Displays file modification stats along with additions (+) and deletions (-). |
| \`git log -p\` | Shows the patch diff (exact line additions and deletions) for each commit. |
| \`git log --graph --oneline --all\` | ASCII graph displaying branch divergence, merges, and topology. |

#### Navigating the Git Pager
When logs exceed the terminal window, Git opens a terminal pager (usually \`less\`):
* **Down Arrow / j:** Scroll down one line.
* **Up Arrow / k:** Scroll up one line.
* **Spacebar:** Scroll down one full page.
* **q:** Exit the log viewer and return to the prompt.

---

### 5. Ignoring Files with \`.gitignore\`

A \`.gitignore\` file is a plain-text configuration file placed in the repository root that directs Git to disregard untracked files and directories so they never show up under \`git status\` or get committed.

#### Primary Use Cases:
* **Security:** Prevents committing secrets, access tokens, and environment configurations (\`.env\`).
* **Noise Reduction:** Excludes build artifacts, machine caches (\`__pycache__\`), and compiled binaries (\`.class\`, \`.o\`).
* **Repository Bloat:** Excludes third-party package dependencies (\`node_modules/\`, \`.venv/\`).

#### Pattern Syntax & Matching Rules:
\`\`\`gitignore
# 1. Ignore a specific file
.env
secret_key.pem

# 2. Wildcard pattern to ignore files by extension
*.log
*.tmp
*.bak

# 3. Ignore an entire directory (must end with a slash /)
node_modules/
dist/
build/
.venv/

# 4. Negation rule (track this file even if the extension rule matches)
!important.log

# 5. Wildcard pattern for directory sub-paths
**/cache/
\`\`\`

#### Handling Previously Committed Files
\`.gitignore\` only affects untracked files. If a sensitive or unwanted file was already committed previously, adding it to \`.gitignore\` will not remove it from Git's tracking tree. You must remove it from the staging index while retaining it on your physical drive:

\`\`\`bash
git rm --cached <filename>
git commit -m "chore: remove tracked file from index"
\`\`\`

---

### 6. Hands-On Practical Task Walkthrough

#### Step 1: Navigate to Your Practice Repository
\`\`\`bash
cd git-repo-practice
git status
\`\`\`

#### Step 2: Create Project Source Files
\`\`\`bash
touch app.js styles.css
\`\`\`

#### Step 3: Stage and Commit the New Files
\`\`\`bash
# Stage the files
git add app.js styles.css

# Verify they appear green under 'Changes to be committed'
git status

# Record the snapshot
git commit -m "feat: initialize app and stylesheet"
\`\`\`

#### Step 4: Create Files That Should Be Excluded
\`\`\`bash
touch .env app.log
\`\`\`
Run \`git status\` to see \`.env\` and \`app.log\` listed in red under Untracked files.

#### Step 5: Configure \`.gitignore\`
\`\`\`bash
# Append rules to .gitignore
echo ".env" >> .gitignore
echo "*.log" >> .gitignore

# Verify status
git status
\`\`\`
**Expected Result:** \`.env\` and \`app.log\` disappear completely from the untracked file list. Only \`.gitignore\` appears as an untracked file.

#### Step 6: Commit the \`.gitignore\` File
\`\`\`bash
git add .gitignore
git commit -m "chore: configure .gitignore to exclude env and log files"
\`\`\`

#### Step 7: Inspect History
\`\`\`bash
git log --oneline
\`\`\`

**Expected Output:**
\`\`\`plaintext
a1b2c3d chore: configure .gitignore to exclude env and log files
e4f5g6h feat: initialize app and stylesheet
\`\`\`

---

### Quick Reference Summary

| Command / Syntax | Action |
| :--- | :--- |
| \`git add <file>\` | Moves specific changes from Working Directory to Staging Area. |
| \`git add .\` | Stages all current additions, modifications, and deletions. |
| \`git commit -m "<msg>"\` | Records staged snapshot into permanent repository history. |
| \`git commit -am "<msg>"\` | Stages tracked changes and commits them in one step. |
| \`git restore --staged <file>\` | Removes a staged file from the Index back to Working Directory. |
| \`git log --oneline\` | Displays compact, single-line commit history with abbreviated hashes. |
| \`git log --stat\` | Lists historical commits alongside file modification metrics. |
| \`.gitignore\` | Configuration file specifying untracked file patterns Git must ignore. |
| \`git rm --cached <file>\` | Untracks a file from Git without deleting it from physical storage. |
`
};
