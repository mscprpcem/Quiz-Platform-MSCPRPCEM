// =========================================================================
// DAY 3: REPOSITORY BASICS & THE THREE TREES (git init, .git Anatomy)
// =========================================================================

export const DAY_3_METADATA = {
  day: 3,
  week: 'Chapter 1',
  weekTitle: 'Chapter 1: Git Foundations & Daily Workflow',
  slug: 'git-init',
  title: 'Repository Basics & The Three Trees',
  shortTitle: '4. Repo Anatomy',
  summary: 'Understand Git repositories, the Three-Stage Architecture (Working Directory, Staging Area, Local Repository), file lifecycles, and .git internal anatomy.',
  readTime: '7 min read',
  badge: 'Chapter 1',
  color: 'from-blue-600 to-indigo-600',
  modules: [
    '1. What is a Git Repository?',
    "2. Git's Three-Stage Architecture (The Three Trees)",
    '3. The Lifecycle of a File in Git',
    '4. Repository Initialization: git init',
    '5. Inspecting the Hidden .git Directory',
    '6. Practical Task Walkthrough',
    'Quick Reference Summary'
  ]
};

export const DAY_3_TOPIC = {
  slug: 'git-init',
  title: 'Repository Basics & The Three Trees (git init, .git Anatomy)',
  summary: 'Explore what defines a Git repository, the three stages of Git architecture, untracked vs tracked file lifecycles, initializing repos with git init, and deep inspection of .git.',
  readTime: '7 min read',
  badge: 'Chapter 1',
  content: `
### Overview: The Mechanics of a Git Repository

Welcome to Repository Basics and Architecture. In this lesson, you unlock the core internal engine of Git.

Understanding how Git separates your files into three distinct areas and tracks their lifecycle is the single most important mental model in version control. Once you understand the **Three Trees**, Git commands like \`add\`, \`commit\`, \`status\`, and \`checkout\` become intuitive and predictable.

---

### 1. What is a Git Repository?

A **Git Repository** (often shortened to **Repo**) is a filesystem directory that Git actively monitors for modifications.

* **Standard Directory:** A regular folder managed purely by your operating system. Any modification or file deletion directly overwrites the disk state with zero historical record or recovery capability.
* **Git Repository:** A standard directory containing an invisible, internal subfolder named \`.git\`. The presence of this \`.git\` directory turns a basic folder into a fully tracked repository capable of recording immutable historical snapshots (commits).

---

### 2. Git's Three-Stage Architecture (The "Three Trees")

Git does not directly take a snapshot of your files the second you save them in an editor. Instead, Git manages files across three distinct states or areas before recording them permanently into history:

\`\`\`
  Working Directory               Staging Area (Index)             Local Repository (.git)
┌───────────────────────┐       ┌───────────────────────┐       ┌───────────────────────┐
│                       │       │                       │       │                       │
│  Actual files on disk │ ────> │  Staged snapshot      │ ────> │  Permanent commits    │
│  (Untracked/Modified) │  git  │  (Prepared changes)   │  git  │  (Immutable history)  │
│                       │  add  │                       │ commit│                       │
└───────────────────────┘       └───────────────────────┘       └───────────────────────┘
\`\`\`

![Git Three-Stage Architecture (The Three Trees)](/assets/git-three-trees.jpg)

#### The Three Areas Explained

| Area | Technical Name | What Lives Here | Purpose |
| :--- | :--- | :--- | :--- |
| **1. Working Directory** | Working Tree | The visible files and folders sitting on your local storage drive. | Where you edit, create, and delete code using your text editor or IDE. |
| **2. Staging Area** | The Index / Cache | A binary staging file located at \`.git/index\`. | A preparation holding zone where you pick and choose exactly which modified lines or files belong in the next snapshot. |
| **3. Local Repository** | Git Directory (\`.git\`) | The internal database containing all project history and metadata. | The permanent storage archive where finished commits are recorded indefinitely. |

> **Key Architectural Insight:** The Staging Area gives you surgical precision over your commits. If you edited 5 files today, you do not have to commit them all at once. You can stage 2 files for a bug fix commit, and stage the other 3 files separately for a feature commit.

---

### 3. The Lifecycle of a File in Git

Inside your repository, every file exists in one of two major states: **Untracked** or **Tracked**.

\`\`\`
              ┌─────────────── UNTRACKED (File newly created)
              │                       │
              │                       │ git add
              ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                       TRACKED FILES                         │
│                                                             │
│   ┌──────────────┐     Edit file      ┌──────────────┐      │
│   │  Unmodified  │ ─────────────────> │   Modified   │      │
│   └──────────────┘                    └──────────────┘      │
│          ▲                                   │              │
│          │ git commit                        │ git add      │
│          │                                   ▼              │
│   ┌──────────────────────────────────────────────────┐      │
│   │                 Staged / Indexed                 │      │
│   └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
\`\`\`

#### Detailed File States

* **Untracked:** Any file present in the directory that Git has never seen before and is not yet part of any snapshot. Git explicitly ignores untracked files until told to include them.
* **Tracked:** Files that were included in the previous snapshot. They exist in one of three substates:
  * **Unmodified:** The file is identical to what is stored in the last commit.
  * **Modified:** The file has been edited in the working directory since the last commit, but has not yet been staged.
  * **Staged:** A modified or newly created file marked to go into the next commit snapshot.

---

### 4. Repository Initialization: \`git init\`

To turn an existing folder into a tracked repository, you initialize it using the \`git init\` command:

\`\`\`bash
git init
\`\`\`

#### What Happens Behind the Scenes?

Running \`git init\` creates a hidden subfolder named \`.git\` at the root of your project directory:

* It **does not alter, move, or overwrite** any of your existing code files.
* It sets up the default tracking branch (configured as \`main\` in your Git configuration).
* **Destruction Warning:** If you delete the \`.git\` folder, your project reverts to a standard unversioned folder, and all commit history and branches are permanently erased.

---

### 5. Inspecting the Hidden \`.git\` Directory

Because \`.git\` starts with a period (\`.\`), it is hidden by operating system file explorers by default to prevent accidental deletion.

![File Lifecycle in Git and Internal Anatomy of .git](/assets/git-file-lifecycle-anatomy.jpg)

#### Internal Structure of the \`.git\` Directory

When inspected, the initialized \`.git\` directory contains the following core files and folders:

\`\`\`plaintext
.git/
├── HEAD             # Points to the branch currently checked out (e.g., ref: refs/heads/main)
├── config           # Repository-specific local configuration settings
├── description      # Used primarily by GitWeb (default description file)
├── hooks/           # Sample client/server scripts triggered before or after Git actions
├── info/            # Global exclusion file (exclude patterns for this specific repo)
├── objects/         # The object database (stores blobs, trees, commits, and annotated tags)
└── refs/            # Pointers to commit objects (heads, tags, remotes)
    ├── heads/       # Local branch pointers (e.g., main, feature/login)
    └── tags/        # Release tags (e.g., v1.0.0)
\`\`\`

---

### 6. Practical Task Walkthrough

Follow these terminal steps to create a practice repository, initialize tracking, and inspect the internal file structure:

#### Step 1: Create a Dedicated Directory & Enter It

\`\`\`bash
# Navigate to your workspace (e.g., Desktop or Projects)
cd Desktop

# Create a new directory for this exercise
mkdir git-repo-practice

# Step inside the newly created directory
cd git-repo-practice
\`\`\`

#### Step 2: Initialize the Repository
Run the initialization command inside the directory:

\`\`\`bash
git init
\`\`\`

**Expected Terminal Output:**
\`\`\`plaintext
Initialized empty Git repository in /Users/<Username>/Desktop/git-repo-practice/.git/
\`\`\`

#### Step 3: Inspect the Filesystem for Hidden Contents
List all directory contents, including hidden files and flags:

* **On macOS / Linux / Git Bash:**
  \`\`\`bash
  ls -la
  \`\`\`
* **On Windows PowerShell:**
  \`\`\`powershell
  Get-ChildItem -Force
  \`\`\`

**Expected Terminal Output:**
\`\`\`plaintext
drwxr-xr-x   .
drwxr-xr-x   ..
drwxr-xr-x   .git
\`\`\`

#### Step 4: Inspect the Internal Contents of the \`.git\` Folder
List the components created inside the internal metadata folder:

* **On macOS / Linux / Git Bash:**
  \`\`\`bash
  ls -la .git
  \`\`\`
* **On Windows PowerShell:**
  \`\`\`powershell
  Get-ChildItem -Force .git
  \`\`\`

#### Step 5: Check Repository Status
Check the current state of the working directory and staging area:

\`\`\`bash
git status
\`\`\`

**Expected Terminal Output:**
\`\`\`plaintext
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
\`\`\`

---

### Quick Reference Summary

| Concept / Command | Purpose |
| :--- | :--- |
| **Working Directory** | The folder containing visible files you directly edit on disk. |
| **Staging Area (Index)** | The intermediary zone where changes are organized before committing. |
| **Local Repository** | The internal \`.git\` database holding permanent snapshot records. |
| **\`git init\`** | Initializes a new local Git repository in the current directory. |
| **\`git status\`** | Displays active branch, untracked files, and staged changes. |
| **\`.git\` folder** | The hidden folder housing all version history, objects, and configs. |
`
};
