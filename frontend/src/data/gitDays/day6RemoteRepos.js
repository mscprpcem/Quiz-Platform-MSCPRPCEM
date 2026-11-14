// =========================================================================
// DAY 6: REPOSITORIES & DOCUMENTATION (Remote Repos, Markdown, README & Conventional Commits)
// Adapted for MSC PRPCEM (Microsoft Student Club @ PRPCEM)
// =========================================================================

export const DAY_6_METADATA = {
  day: 6,
  week: 'Chapter 1',
  weekTitle: 'Chapter 1: Git Foundations & Daily Workflow',
  slug: 'day-6-remote-repos',
  title: 'Repositories & Documentation',
  shortTitle: '7. Repos & Docs',
  summary: 'Master remote GitHub repositories, public vs private visibility, GitHub Flavored Markdown (GFM), 7 essential sections of production READMEs, and Conventional Commit message standards.',
  readTime: '9 min read',
  badge: 'Chapter 6',
  color: 'from-blue-600 to-indigo-600',
  modules: [
    '1. Creating a Remote Repository on GitHub',
    '2. Public vs. Private Repositories',
    '3. Markdown (README.md) Deep Dive',
    '4. Anatomy of a Production-Grade Project README.md',
    '5. Writing Professional Commit Messages',
    '6. Practical Task Walkthrough: Create a Repository with a Proper README',
    'Quick Reference Summary'
  ]
};

export const DAY_6_TOPIC = {
  slug: 'day-6-remote-repos',
  title: 'Repositories & Documentation: GitHub Repos, README Architecture & Conventional Commits',
  summary: 'Establish production-grade remote repositories on GitHub, navigate public vs private access controls, author structured project documentation in GitHub Flavored Markdown, and write industry-standard Conventional Commits.',
  readTime: '9 min read',
  badge: 'Chapter 6',
  content: `
### Overview: Establishing Production-Grade Repositories & Documentation

Welcome to **Chapter 6: Repositories & Documentation**. While **Chapter 5** introduced the GitHub platform, user security, and your personal developer Profile README, this chapter shifts focus to **project-level engineering**. 

Every world-class software project relies on two pillars:
1. **A Well-Configured Remote Repository:** Correct access controls, .gitignore templates, and software licenses.
2. **Clear, Maintainable Documentation:** A comprehensive \`README.md\` that explains what the software does, how to install it, and how engineers can contribute.

In this lesson, you will master remote repository creation, public vs private visibility trade-offs, GitHub Flavored Markdown (GFM), the 7 essential sections of production READMEs, and the industry-standard **Conventional Commits** specification.

---

### 1. Creating a Remote Repository on GitHub

While \`git init\` initializes a repository locally on your computer, creating a repository on GitHub sets up a remote storage container in the cloud.

![Creating a New Remote Repository on GitHub](/assets/github-create-repo-guide.jpg)

#### Core Setup Fields When Creating a GitHub Repository:

* **Owner & Repository Name:** Must be unique within your account. Standard convention uses lowercase letters separated by hyphens (**kebab-case**, e.g., \`task-tracker-cli\`, \`weather-dashboard-api\`).
* **Description (Optional):** A short, one-sentence summary displayed in search results and directly under the repository title on GitHub.
* **Visibility:** Public or Private.

#### Initialize this repository with:
* **Add a README file:** Creates an initial commit on the \`main\` branch containing a default \`README.md\`.
* **Add .gitignore:** Lets you pick a pre-made template for your language/framework (e.g., Node, Python, Java, Go) so compiled files, package caches (\`node_modules/\`), and environment secrets (\`.env\`) are excluded automatically.
* **Choose a license:** Defines the legal terms under which others can use, modify, or distribute your code (e.g., MIT License, Apache 2.0, GPLv3).

> **Important Workflow Rule:**
> * **Starting from scratch on GitHub:** Check *"Add a README file"* so the repository is immediately initialized with a commit and ready to clone locally.
> * **Pushing an existing local Git repo (Chapter 7):** Leave README, .gitignore, and License **unchecked** to create a completely empty (*"bare"*) remote repository. This prevents conflicting commit histories when you run \`git push -u origin main\`.

---

### 2. Public vs. Private Repositories

Choosing the right visibility level determines who can view, clone, and interact with your codebase.

| Feature / Access | Public Repository | Private Repository |
| :--- | :--- | :--- |
| **Who can view & clone?** | Anyone on the internet (even without a GitHub account). | Only you and specific collaborators you explicitly invite. |
| **Who can push changes?** | Only you and invited collaborators (others must Fork & submit a Pull Request). | Only you and invited collaborators with Write or Admin permissions. |
| **Search Engine Indexing** | Indexed by Google, Bing, and GitHub Global Search. | Completely hidden from search engines and unauthorized users. |
| **Best Use Cases** | Open-source libraries, portfolio projects, learning exercises, community tools. | Proprietary company code, client work, commercial SaaS, private notes. |
| **Danger Zone Risk** | Never commit API keys, \`.env\` files, or passwords—automated bot scrapers scan public repos in seconds. | Still avoid hardcoding secrets, though exposure is restricted to invited members. |

> **Note on Visibility Changes:** You can change a repository's visibility between Public and Private at any time under **Settings > General > Danger Zone**.

---

### 3. Markdown (README.md) Deep Dive

GitHub uses **GitHub Flavored Markdown (GFM)** to convert plain text into formatted documentation across READMEs, Issues, and Pull Requests.

#### Essential Markdown Syntax Reference

\`\`\`markdown
# Main Title (H1)
## Section Heading (H2)
### Subsection Heading (H3)

**Bold Text** and *Italic Text* and ~~Strikethrough~~

- Unordered bullet point
  - Nested bullet point

1. Ordered list item 1
2. Ordered list item 2

- [x] Completed task item
- [ ] Pending task item

[Clickable Link Text](https://github.com)
![Alt Text for Image](./assets/screenshot.png)

Inline \`code_variable\` inside a sentence.
\`\`\`

#### Fenced Code Blocks with Syntax Highlighting

Wrap multi-line code in triple backticks (\`\`\`) followed by the language identifier (\`bash\`, \`python\`, \`javascript\`, \`sql\`, \`json\`) for automatic color highlighting:

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

#### Markdown Tables & Blockquotes

\`\`\`markdown
| Endpoint | Method | Description |
| :--- | :---: | :--- |
| \`/api/users\` | \`GET\` | Fetch all active users |
| \`/api/users\` | \`POST\` | Create a new user |

> **Note:** Always run database migrations before starting the server.
\`\`\`

---

### 4. Anatomy of a Production-Grade Project README.md

Whereas a **Profile README** introduces you as an engineer, a **Project README** is the front-page technical manual for a specific software application. Every visitor's browser automatically renders \`README.md\` below the file tree when opening a repository.

![Anatomy of a Production-Grade Project README.md](/assets/github-project-readme-anatomy.jpg)

#### The 7 Essential Sections of a Project README:

1. **Project Title & Badges:** Name of the project alongside status badges (build passing, license, version, test coverage from Shields.io).
2. **Overview / Description:** What the project does, what problem it solves, and why it exists.
3. **Key Features:** Bullet points highlighting primary capabilities and technical highlights.
4. **Tech Stack / Prerequisites:** Languages, frameworks, and minimum tool versions required (e.g., Node.js >= 20.x, Python 3.11+).
5. **Installation & Local Setup:** Exact step-by-step terminal commands a developer needs to clone, install dependencies, and run the project locally.
6. **Usage / Examples:** Code snippets, CLI commands, or screenshots demonstrating how to interact with the application.
7. **License & Contributing:** How others can report bugs, submit changes, and what legal license applies to the codebase.

---

### 5. Writing Professional Commit Messages

Commit messages serve as the permanent logbook of your engineering decisions. Poor messages like \`fixed bug\`, \`update\`, or \`asdf\` make debugging and code reviews painful.

![Conventional Commits & Professional Git Commit Message Anatomy](/assets/git-conventional-commits-guide.jpg)

#### The 3 Golden Rules of Commit Formatting

1. **Use the Imperative Mood:** Write the subject line as a command or instruction, as if completing the sentence: *"If applied, this commit will..."*
   * **Good:** \`Add user login validation\` / \`Fix memory leak in worker thread\`
   * **Bad:** \`Added login validation\` / \`Fixing memory leak\`
2. **Keep the Subject Line Concise:** Limit the first line to **50 characters or less**, capitalize the first word, and **do not end with a period**.
3. **Separate Subject from Body with a Blank Line:** When a commit needs extra context, leave one blank line below the subject and wrap the body at **72 characters** explaining *why* the change was made (the code diff already shows *what* changed).

#### Industry Standard: Conventional Commits

Most modern engineering teams prefix commit messages with a structured type so changelogs and semantic versions can be generated automatically:

| Prefix Type | When to Use It | Example Commit Message |
| :--- | :--- | :--- |
| \`feat:\` | Adding a brand-new feature or capability. | \`feat: implement JWT token refresh endpoint\` |
| \`fix:\` | Patching a bug or runtime error in existing code. | \`fix: prevent null pointer crash on empty cart\` |
| \`docs:\` | Updating documentation (\`README.md\`, JSDoc, comments) only. | \`docs: add installation steps to README\` |
| \`style:\` | Formatting, missing semicolons, whitespace (no logic change). | \`style: format code with Prettier\` |
| \`refactor:\` | Restructuring internal code without changing external behavior. | \`refactor: extract tax calculation into helper\` |
| \`test:\` | Adding or updating unit/integration tests. | \`test: add unit tests for password hashing\` |
| \`chore:\` | Build scripts, \`.gitignore\`, package updates, config tasks. | \`chore: update dependencies and .gitignore\` |

---

### 6. Practical Task Walkthrough: Create a Repository with a Proper README

Follow these hands-on steps to complete the Chapter 6 practical task:

#### Step 1: Create the Repository on GitHub
1. Log in to [github.com](https://github.com/) and click the **+** icon in the top-right corner > **New repository**.
2. **Repository name:** Enter \`task-tracker-cli\`.
3. **Description:** Enter \`A lightweight command-line application for managing daily developer tasks.\`
4. **Visibility:** Select **Public**.
5. **Initialize this repository with:**
   * Check **Add a README file**.
   * Select **Add .gitignore** > choose **Node** (or **Python**).
   * Select **Choose a license** > choose **MIT License**.
6. Click **Create repository**.

#### Step 2: Author a Complete Project README.md
Inside your newly created \`task-tracker-cli\` repository, click the pencil icon (**Edit this file**) in the top-right corner of \`README.md\`.

Replace the default text with the following structured project documentation:

\`\`\`\`markdown
# 📋 Task Tracker CLI

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen.svg)

A fast, zero-dependency command-line interface (CLI) tool for tracking tasks, deadlines, and priorities directly from your terminal.

---

## ✨ Features

- **Instant Task Creation:** Add, edit, and prioritize tasks with a single command.
- **Status Filtering:** View all tasks or filter by \`todo\`, \`in-progress\`, and \`done\`.
- **Local JSON Storage:** Saves all data locally in a human-readable \`tasks.json\` file.

---

## 🛠️ Prerequisites

- **Git** (\`2.x\` or higher)
- **Node.js** (\`v18.0+\`) or **Python** (\`3.10+\`)

---

## 🚀 Installation & Setup

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/<your-username>/task-tracker-cli.git
   \`\`\`

2. **Navigate into the project directory:**
   \`\`\`bash
   cd task-tracker-cli
   \`\`\`

3. **Run the application:**
   \`\`\`bash
   node index.js --help
   \`\`\`

---

## 📖 Usage Examples

| Action | Command |
| :--- | :--- |
| Add a new task | \`task add "Complete Chapter 6 Git exercise"\` |
| Mark task as done | \`task done 1\` |
| List all pending tasks | \`task list --pending\` |

> **Tip:** Run \`task clear\` at the end of the week to archive completed items.

---

## 📄 License

Distributed under the **MIT License**. See \`LICENSE\` for more information.
\`\`\`\`

#### Step 3: Commit with a Conventional Commit Message
1. Click the green **Commit changes...** button in the top-right corner.
2. **Commit message (Subject):**
   \`\`\`plaintext
   docs: add comprehensive project README with setup and usage guide
   \`\`\`
3. **Extended description (Body):**
   \`\`\`plaintext
   Include project badges, feature list, installation prerequisites, CLI command reference table, and MIT license documentation.
   \`\`\`
4. Ensure **Commit directly to the main branch** is selected and click **Commit changes**.

![GitHub Repository View & Production README Preview for mscprpcem](/assets/github-repo-readme-view.jpg)

---

### Quick Reference Summary

| Concept | Key Takeaway |
| :--- | :--- |
| **Public vs. Private** | Public is visible to everyone on the internet; Private restricts read/write access to invited collaborators. |
| **Project README** | Serves as the front-page manual of a codebase, containing installation, prerequisites, usage, and license info. |
| **Conventional Commits** | Structured prefixes (\`feat:\`, \`fix:\`, \`docs:\`, \`chore:\`) that create machine-readable, professional commit histories. |
| **Imperative Mood** | Subject lines should be written as commands: *"Add feature"*, not *"Added feature"*. |
| **50/72 Rule** | Limit commit subjects to 50 characters; wrap commit bodies at 72 characters after a blank line. |
`
};

