// =========================================================================
// DAY 1: VERSION CONTROL FUNDAMENTALS & LOCAL INSTALLATION
// =========================================================================

export const DAY_1_METADATA = {
  day: 1,
  week: 'Week 1',
  weekTitle: 'Week 1: Foundations & Daily Workflow',
  slug: 'git-basics',
  title: 'Day 1: Version Control Fundamentals & Local Installation',
  shortTitle: 'Day 1: VCS Fundamentals',
  summary: 'Understand the core definition of VCS, the 4 Ws of tracking, why version control replaces manual duplicates, Centralized vs Distributed architectures, OS installation, and terminal verification.',
  readTime: '7 min read',
  badge: 'Day 1: Foundations',
  color: 'from-blue-600 to-cyan-600',
  modules: [
    '1. What is Version Control? (The 4 Ws)',
    '2. Why Use Version Control?',
    '3. Git vs. Other Version Control Systems (CVCS vs. DVCS)',
    '4. Practical Task: Installing Git Locally',
    '5. Verifying the Installation',
    'Quick Reference Summary'
  ]
};

export const DAY_1_TOPIC = {
  slug: 'git-basics',
  title: 'Day 1: Version Control Fundamentals & Local Installation',
  summary: 'Understand what version control is, why we use it, Centralized vs Distributed VCS architectures, how to install Git on Windows, macOS, and Linux, and terminal verification.',
  readTime: '7 min read',
  badge: 'Day 1: Foundations',
  content: `
### Overview: Version Control Fundamentals

Welcome to **Day 1** of the 30-Day Git & GitHub Developer Roadmap. Today, you build the foundational bedrock for your entire software development career.

Before running repository commands, you must understand what version control actually accomplishes behind the scenes, why manual file duplication is fundamentally flawed, how Git differs architecturally from older centralized tools, and how to properly install and verify Git across all major operating systems.

---

### 1. What is Version Control?

A **Version Control System (VCS)** is a specialized software tool that tracks and manages every change made to computer files over time.

Whenever a change is recorded, the system saves an exact, permanent record answering the **4 Core Questions**:

* **What changed:** Which exact lines were added, altered, or deleted across every tracked file.
* **Who made the change:** The exact author name and email attached to the modification.
* **When it occurred:** The precise date, time, and timezone timestamp.
* **Why it was done:** A mandatory, structured commit message explaining the technical intent and business justification.

![What is Version Control (VCS) and the 4 Core Metadata Pillars (What, Who, When, Why)](/assets/git-vcs-fundamentals.jpg)

> **Key Architectural Insight:** In software development, code is not written once and forgotten. Code evolves continuously. Without a system answering What, Who, When, and Why, codebases rapidly decay into unmaintainable chaos.

---

### 2. Why Use Version Control?

Without version control, backups rely on duplicating files manually (e.g., \`script_v1.py\`, \`script_v2_final.py\`, \`script_final_real.py\`). Version control completely eliminates this fragile workflow by providing five core guarantees:

* **Complete Historical Record:** Reverts any file or entire project back to a prior state without losing progress or rewriting working code.
* **Traceability and Accountability:** Pinpoints the exact line where an error or regression was introduced, what caused it, and who committed it.
* **Branching & Experimentation:** Allows developers to test new features, refactor modules, or explore experimental algorithms in isolated environments without risking production-ready code.
* **Concurrent Collaboration:** Enables multiple engineers to work on the exact same codebase simultaneously, merging modifications together programmatically without overwriting each other's contributions.
* **Audit Trail & Documentation:** Creates an organized, immutable change log that serves as living technical documentation for the entire project history.

---

### 3. Git vs. Other Version Control Systems

Version control architectures fall into two primary models: **Centralized** and **Distributed**.

\`\`\`
Centralized (CVCS):              Distributed (DVCS - Git):
   [ Central Server ]               [ Central / Remote ]
     /      |      \\                   ^        ^
    v       v       v                  |        |
[Dev A]  [Dev B]  [Dev C]           [Dev A]  [Dev B]
(Working (Working (Working          (Full    (Full
 Copy)    Copy)    Copy)            Clone)   Clone)
\`\`\`

#### Centralized Version Control Systems (CVCS)
* **Examples:** Apache Subversion (SVN), CVS, Perforce.
* **Architecture:** A single central server houses the entire version history and database. Individual clients check out only a single snapshot of the files locally (the working copy).
* **Limitations:**
  * **Single Point of Failure:** If the central server crashes, corrupts, or suffers hardware failure, the entire project history is lost unless an external backup exists.
  * **Network Dependent:** Viewing commit history, creating branches, inspecting diffs, or saving versions requires an active, uninterrupted network connection to the server.

#### Distributed Version Control Systems (DVCS)
* **Examples:** Git, Mercurial.
* **Architecture:** Every client clones the **entire repository**—including the full commit history, branches, tags, and cryptographic hashes—directly onto their local storage.

![Centralized Version Control Systems (CVCS) vs Distributed Version Control Systems (DVCS like Git)](/assets/git-cvcs-vs-dvcs.jpg)

#### Advantages of Git:
* **Offline Capability:** Commits, branches, diffs, and logs execute locally on your machine without requiring network access.
* **Redundancy & Safety:** Every developer's machine acts as a complete, independent backup of the entire repository history.
* **Speed:** File operations happen directly on local disk storage rather than traversing a network connection.
* **Lightweight Branching Model:** Git’s branching system is near-instantaneous and lightweight (a 41-byte pointer to a commit) compared to older systems where branching required duplicating entire folder trees.

---

### 4. Practical Task: Installing Git Locally

Follow the instructions corresponding to your operating system to install Git and verify the setup.

#### Option A: Windows Installation

**Method 1: Official Installer (Recommended for Beginners)**
1. Navigate to the official installer page: [https://git-scm.com/install/windows](https://git-scm.com/install/windows).
2. Download the 64-bit Git for Windows Setup executable.
3. Run the Setup Wizard and configure the recommended defaults:
   * **Default Editor:** When prompted to choose an editor, select **Visual Studio Code** (or your preferred editor).
   * **Initial Branch Name:** Choose **Override the default branch name for new repositories** and set it to \`main\`.
   * **PATH Environment:** Select **Git from the command line and also from 3rd-party software** (recommended).
   * **Line Ending Conversions:** Select **Checkout Windows-style, commit Unix-style line endings** (\`core.autocrlf = true\`).
   * **Terminal Emulator:** Choose **Use MinTTY (the default terminal of MSYS2)**.
4. Leave the remaining options at their default settings and click **Install**.

**Method 2: Windows Package Manager (Quickest via PowerShell)**
Open PowerShell as an Administrator and execute:

\`\`\`powershell
winget install --id Git.Git -e --source winget
\`\`\`

*(After installation completes, close and restart your terminal session).*

---

#### Option B: macOS Installation

Choose one of the following methods:

**Method 1: Apple Developer Command Line Tools (Quickest)**
Open Terminal (\`Cmd + Space\`, search for \`Terminal\`) and run:

\`\`\`bash
xcode-select --install
\`\`\`

Click **Install** in the software update popup dialog and accept the license terms.

**Method 2: Homebrew (Recommended for Latest Releases)**
If Homebrew is installed on your Mac, run:

\`\`\`bash
brew install git
\`\`\`

---

#### Option C: Linux Installation

Open your terminal and run the command tailored for your Linux distribution:

**Debian / Ubuntu:**
\`\`\`bash
sudo apt update
sudo apt install git -y
\`\`\`

**Fedora / RHEL / CentOS:**
\`\`\`bash
sudo dnf install git -y
\`\`\`

**Arch Linux:**
\`\`\`bash
sudo pacman -S git
\`\`\`

---

### 5. Verifying the Installation

Once installation finishes, close any open terminal windows and launch a **new terminal session** (Command Prompt or PowerShell on Windows, Terminal on macOS/Linux).

#### 1. Version Verification Command
Run the version check in your terminal:

\`\`\`bash
git --version
\`\`\`

**Expected Output:**
The command must output the installed version string without errors:
\`\`\`
git version 2.x.x
\`\`\`
*(Any version \`2.x.x\` confirms that the Git binary is installed, functioning, and available in your system's PATH).*

#### 2. Help Command to Inspect Core Subcommands
Run the help command:

\`\`\`bash
git --help
\`\`\`

*(This confirms the Git executable is responsive and prints standard command-line options such as clone, init, add, status, diff, commit, and branch).*

![Installing Git Locally and Verifying the Installation across Windows, macOS, and Linux](/assets/git-install-verify.jpg)

---

### Quick Reference Summary

| Concept | Definition |
| :--- | :--- |
| **VCS** | Software that records changes to a file or set of files over time. |
| **CVCS** | Centralized VCS; depends on a single server for full history. |
| **DVCS** | Distributed VCS; every client has a complete copy of repository history. |
| **Git** | An open-source, local distributed version control software. |
| **Verification Command** | \`git --version\` (used to verify successful installation). |
`
};
