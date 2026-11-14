// =========================================================================
// DAY 0: THE BIG PICTURE & ORIENTATION
// Designed for MSC PRPCEM Git & GitHub Assessment & Learning Platform
// =========================================================================

export const DAY_0_METADATA = {
  day: 0,
  week: 'Chapter 1',
  weekTitle: 'Chapter 1: Git Foundations & Daily Workflow',
  slug: 'day-0-orientation',
  title: 'Orientation & Mental Models: What Problem Does Git Solve?',
  shortTitle: '1. Orientation',
  summary: 'Understand why version control exists, the snapshot mental model, Git versus GitHub, CLI versus GUI, and the chapter curriculum structure.',
  readTime: '6 min read',
  badge: 'Chapter 1',
  color: 'from-blue-600 to-indigo-600',
  modules: [
    'The Problem: Manual Versioning Chaos',
    'The Solution: Git Snapshot Architecture',
    'Git vs GitHub: Local Engine vs Cloud Hub',
    'Interface: Terminal CLI vs GUI',
    'Essential Git Terminology',
    'The 5-Chapter Curriculum Structure'
  ]
};

export const DAY_0_TOPIC = {
  slug: 'day-0-orientation',
  title: 'Orientation & Mental Models: What Problem Does Git Solve?',
  summary: 'Understand why version control exists, the snapshot mental model, Git versus GitHub, CLI versus GUI, and the chapter curriculum structure.',
  readTime: '6 min read',
  badge: 'Chapter 1',
  content: `
### Overview: Why Version Control Matters

Welcome to the official Microsoft Student Club (MSC PRPCEM) Git and GitHub curriculum.

Before configuring tools or running commands, every engineer needs a clear mental model of how version control works, where files reside, and how teams collaborate without losing work.

---

### 1. The Core Problem: Manual File Duplication

Without version control, developers and students track project history by manually copying files:

* Project.txt
* Project_v2.txt
* Project_Final.txt
* Project_Final_Revised.txt

This manual approach introduces three major failure points:

* **Version Ambiguity:** Team members cannot verify which file contains the latest verified code.
* **Accidental Overwrites:** Simultaneous edits by multiple contributors result in lost work.
* **No Rollback Capability:** Restoring code from a previous state requires manual reconstruction.

---

### 2. The Solution: Git Snapshot Architecture

Git replaces manual file duplication with a single, tracked project directory. Instead of creating multiple folders, Git captures periodic, immutable **snapshots** of your entire project state.

* Each milestone is permanently saved with an author, timestamp, and unique cryptographic hash.
* You can inspect differences between any two points in time.
* You can safely rewind your codebase to any previous working state.

![Explaining Version Control: From Chaos to Order — The File Duplication Problem vs The Clean Git Snapshot Solution](/assets/git-snapshot-timemachine.jpg)

> **Key Architectural Insight:** Think of Git commits as save points in a complex simulation. Before making high-risk changes or refactoring core logic, you record a save point. If an experiment breaks your code, you return directly to the last verified state.

---

### 3. Git vs. GitHub: Local Engine vs. Cloud Hub

A common point of confusion is conflating Git and GitHub. They are distinct technologies designed to complement each other:

| Comparison Attribute | Git (Local Engine) | GitHub (Cloud Platform) |
| :--- | :--- | :--- |
| **Technology Type** | Open-source software running locally | Managed web service hosted in the cloud |
| **Network Requirement** | Works completely offline | Requires active internet access |
| **Primary Function** | Tracks file changes, branches, and commit history | Hosts remote repositories for collaboration |
| **Core Operations** | init, add, commit, branch, merge, diff | Pull requests, code review, issue triage, CI/CD |
| **Data Location** | Your local disk inside the .git directory | Remote Microsoft / GitHub cloud servers |

![Git vs GitHub: Local Engine on Laptop vs Cloud Collaboration Hub on GitHub Server](/assets/git-vs-github-architecture.jpg)

> **Key Architectural Insight:** Git operates on your physical computer. It tracks revisions and manages local history entirely without network access. GitHub acts as the remote synchronization hub where teams publish local commits and coordinate reviews.

---

### 4. Working with Git: Terminal CLI vs. GUI Applications

Developers interact with Git using either graphical applications or the command-line interface (CLI):

* **Graphical User Interface (GUI):** Desktop applications with buttons, menus, and visual commit trees. Useful for visual branch inspection, but exposes only a subset of Git features.
* **Command Line Interface (CLI):** Text-based terminal commands executed in Bash, Zsh, or PowerShell. Provides direct access to 100% of Git functionality.

![Two Ways to Interact with Git: Graphical User Interface (GUI) vs Terminal Command Line Interface (CLI)](/assets/git-gui-vs-cli.jpg)

#### Why Engineers Prioritize the Terminal CLI

* **Universal Standard:** Terminal commands execute identically on Windows, macOS, Linux, and remote production servers.
* **Full Tool Access:** Advanced operations such as interactive rebasing, commit squashing, and reflog recovery require the CLI.
* **Automation and CI/CD:** Build pipelines and deployment workflows rely strictly on CLI scripts.

---

### 5. Essential Git Terminology

Familiarize yourself with these core technical terms before starting practical tasks:

* **Repository (Repo):** A project directory tracked by Git, containing the full history in a hidden \`.git\` directory.
* **Working Directory:** The local sandbox folder where you view and edit files currently on disk.
* **Staging Area (Index):** A preparation zone defining which specific file modifications will be included in the next snapshot.
* **Commit:** An immutable snapshot of staged changes accompanied by a descriptive message and author metadata.
* **Branch:** An independent pointer along a commit timeline allowing isolated development.
* **Remote:** A version of your repository hosted on an external server, typically GitHub.
* **Push:** Transmitting local committed snapshots to a remote repository.
* **Pull:** Fetching and integrating updates from a remote repository into your local branch.

---

### 6. The 5-Chapter Curriculum Structure

The curriculum is structured across five progressive chapters:

* **Chapter 1: Git Foundations & Daily Workflow**
  Orientation, version control fundamentals, identity configuration, repository anatomy, staging, atomic commits, diff inspection, and ignoring files.

* **Chapter 2: Branching, Merging & History**
  Branching strategies, switching branches, merge mechanics, linear rebasing, stashing, undoing changes, cherry-picking, and conflict resolution.

* **Chapter 3: GitHub & Remote Collaboration**
  Remote origins, push/pull mechanics, upstream tracking, forks, pull requests, code reviews, and project management.

* **Chapter 4: Advanced Power Tools & Automation**
  Interactive rebasing, reflog disaster recovery, binary search debugging (git bisect), tags, semantic versioning, and GitHub Actions CI/CD.

* **Chapter 5: Production Workflows & Incident Recovery**
  Team Git workflows (Trunk vs Gitflow), secret scrubbing, emergency hotfix pipelines, complex conflict resolution, and open-source contributions.
`
};
