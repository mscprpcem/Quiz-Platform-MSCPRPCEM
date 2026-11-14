// =========================================================================
// DAY 1: VERSION CONTROL FUNDAMENTALS & LOCAL INSTALLATION
// =========================================================================

export const DAY_1_METADATA = {
  day: 1,
  week: 'Chapter 1',
  weekTitle: 'Chapter 1: Git Foundations & Daily Workflow',
  slug: 'git-basics',
  title: 'Version Control Fundamentals & Local Installation',
  shortTitle: '2. VCS Fundamentals',
  summary: 'Understand the core definition of VCS, the 4 Ws of tracking, why version control replaces manual duplicates, Centralized vs Distributed architectures, OS installation, and terminal verification.',
  readTime: '7 min read',
  badge: 'Chapter 1',
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
  title: 'Version Control Fundamentals & Local Installation',
  summary: 'Learning objective: Understand what version control is, why developers use it, and how to install and verify Git.',
  readTime: '6 min read',
  badge: 'Chapter 1',
  content: `
### Overview

Welcome to Chapter 1 of the Git & GitHub curriculum. In this lesson, you will learn the basics of version control and set up Git on your computer.

---

### 1. What is Version Control?

A **Version Control System (VCS)** tracks and manages changes made to files over time.

It helps answer four questions:

| Question | Meaning |
| :--- | :--- |
| **What changed?** | Which lines were added, modified, or deleted? |
| **Who changed it?** | Who made the modification? |
| **When did it happen?** | When was the change recorded? |
| **Why was it changed?** | What was the purpose of the change? |

#### Example: Managing files without version control

* Project.txt
* Project_v2.txt
* Project_final.txt
* Project_final_latest.txt

Maintaining multiple copies manually makes it difficult to identify the latest version and understand what changed.

:::tip Key point
Version control keeps a history of changes so developers do not need to manage project versions manually.
:::

---

### 2. Why Use Version Control?

* **Collaboration:** Multiple developers can work on the same project.
* **History:** Review previous changes.
* **Recovery:** Restore an earlier version when needed.
* **Experimentation:** Try changes without losing the stable version.

---

### 3. Install Git

Choose the instructions for your operating system.

#### Windows

Download and run the installer from the [official Git website](https://git-scm.com/downloads/win).

#### macOS

\`\`\`bash
brew install git
\`\`\`

#### Linux (Ubuntu/Debian)

\`\`\`bash
sudo apt update
sudo apt install git
\`\`\`

---

### 4. Verify the Installation

Open a terminal and run:

\`\`\`bash
git --version
\`\`\`

Example output:

\`\`\`bash
git version 2.x.x
\`\`\`

The exact version may be different. If the command displays a Git version, the installation is working.

---

### Key Takeaways

* Version control tracks changes to files.
* It records what changed, who changed it, when, and why.
* Git helps developers collaborate, review history, recover work, and experiment safely.
* Git can be installed on Windows, macOS, and Linux.

---

### Useful Resources

* [Git official website](https://git-scm.com/)
* [Git documentation](https://git-scm.com/doc)
* [GitHub documentation](https://docs.github.com/)

Next lesson: Continue to the next lesson using the Next button.
`
};
