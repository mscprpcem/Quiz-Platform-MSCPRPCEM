// =========================================================================
// DAY 5: GITHUB ESSENTIALS (Account, Interface, Profile & Profile README)
// Adapted for MSC PRPCEM (Microsoft Student Club @ PRPCEM)
// =========================================================================

export const DAY_5_METADATA = {
  day: 5,
  week: 'Chapter 1',
  weekTitle: 'Chapter 1: Git Foundations & Daily Workflow',
  slug: 'github-essentials',
  title: 'GitHub Essentials & Remote Repositories',
  shortTitle: '6. Remote Basics',
  summary: 'Transition from local Git to GitHub cloud collaboration: account setup, 2FA security, interface navigation, developer portfolio customization, and building a special Profile README repository with MSC PRPCEM examples.',
  readTime: '8 min read',
  badge: 'Chapter 1',
  color: 'from-purple-600 to-indigo-600',
  modules: [
    '1. What is GitHub & Why Does It Matter?',
    '2. Account Creation & Security Essentials',
    '3. GitHub Web Interface Navigation',
    '4. Customizing Your Public Profile (MSC PRPCEM Details)',
    '5. The Special "Profile README" (Secret Repository)',
    '6. Markdown Essentials for Profile READMEs',
    '7. Practical Task Walkthrough: Step-by-Step (MSC PRPCEM Example)',
    'Quick Reference Summary'
  ]
};

export const DAY_5_TOPIC = {
  slug: 'github-essentials',
  title: 'GitHub Essentials & Remote Repositories',
  summary: 'Explore GitHub as a remote collaboration platform, 2FA security, global dashboard navigation, developer portfolio customization, and the special secret Profile README repository using MSC PRPCEM examples.',
  readTime: '8 min read',
  badge: 'Chapter 1',
  content: `
### Overview: Transitioning from Local Git to GitHub's Cloud Platform

Welcome to GitHub Essentials. This lesson marks a pivotal transition in your developer journey: shifting from local offline Git operations on your machine to **GitHub**, the global cloud collaboration platform hosting over 100 million developers and hundreds of millions of software repositories.

A strong GitHub presence is more than an off-site backup—it functions as your living developer resume, technical portfolio, and collaborative workspace. Today, you will establish your identity, secure your credentials, master the web interface, and construct a personalized **Profile README** using GitHub's special repository feature with **MSC PRPCEM** community standards.

---

### 1. What is GitHub & Why Does It Matter?

While Git runs locally on your machine without an internet connection, GitHub is a cloud-hosted platform built entirely around Git. It serves three primary functions:

* **Remote Repository Host:** Acts as a centralized, off-site backup for your local Git repositories, protecting your code against hardware failure or accidental disk wipes.
* **Collaboration & Review Platform:** Provides professional code review tools (Pull Requests), automated CI/CD pipelines (GitHub Actions), task management (Issues, Projects), and team discussion forums.
* **Developer Portfolio:** Functions as a public technical identity showcasing open-source contributions, code quality, software architecture skills, and daily consistency via the contribution heatmap.

![Git vs GitHub: Local Engine on Laptop vs Cloud Collaboration Hub on GitHub Server](/assets/git-github-architecture.jpg)

> **Key Architectural Insight:** Git is the local version control engine that records snapshots on your computer. GitHub is the cloud synchronization server that distributes those snapshots across engineering teams worldwide.

---

### 2. Account Creation & Security Essentials

#### Step 1: Sign Up on GitHub
* Navigate to [https://github.com](https://github.com) and click **Sign up**.
* Follow the interactive onboarding prompts to create your account.

#### Step 2: Username Selection Strategy (e.g. \`mscprpcem\`)
Your GitHub username forms your permanent developer URL: \`https://github.com/<username>\` (for example, \`https://github.com/mscprpcem\`).
* Choose a clean, professional handle (e.g., \`firstname-lastname\`, \`alex-dev\`, or institutional club handles like \`mscprpcem\`).
* Avoid informal handles, numbers, or temporary aliases, as recruiters and open-source maintainers associate your username with your technical identity.

#### Step 3: Primary Email Matching (Critical Rule)
* Enter the **exact email address** you configured locally in your Git configuration with:
\`\`\`bash
git config --global user.email "msc@prpcem.ac.in"
\`\`\`
* **Why This Matters:** GitHub uses the commit author email address to link your local commit hashes to your online GitHub account. If the email addresses do not match identically, your commits will display with a generic avatar and will **not credit your contribution graph**!

#### Step 4: Mandatory Two-Factor Authentication (2FA)
GitHub mandates 2FA for all active software contributors to prevent supply-chain attacks and credential theft:
1. Navigate to your top-right avatar > **Settings** > **Password and authentication**.
2. Under **Two-factor authentication**, click **Enable two-factor authentication**.
3. Scan the QR code using a mobile authenticator app (such as Google Authenticator, Microsoft Authenticator, or 1Password).
4. Download and securely save your **Recovery Codes** in a password manager. If you lose access to your authenticator device, recovery codes are the only way to regain access to your account.

---

### 3. GitHub Web Interface Navigation

When authenticated into GitHub, the application is organized into two primary scopes: the **Global Dashboard** and the **User Profile**.

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────┐
│ Top Nav: [Search or jump to...] [Pull requests] [Issues] [Codespaces] [Notifications] [Avatar]│
├───────────────────────────────┬─────────────────────────────────────────────┤
│ Left Column:                  │ Center Feed:                                │
│ • Top Repositories            │ • Activity feed of followed developers/repos│
│ • "New" Repo Button           │ • Release updates, stars, and recommendations│
│ • Recent projects             │                                             │
└───────────────────────────────┴─────────────────────────────────────────────┘
\`\`\`

![GitHub Web Interface Navigation & Public Developer Profile Anatomy](/assets/github-profile-anatomy.jpg)

#### Core Interface Terminology:
* **Global Search (\`/\` keyboard shortcut):** Allows searching across repositories, code snippets, commits, issues, and users globally.
* **Notification Inbox (\`Notifications\`):** Aggregates mentions (\`@username\` or \`@mscprpcem\`), review requests on pull requests, CI/CD pipeline build failures, and thread assignments.
* **Command Palette (\`Ctrl+K\` on Windows/Linux or \`Cmd+K\` on macOS):** Provides instant keyboard navigation across organizations, repositories, settings, and pull requests without clicking menus.

---

### 4. Customizing Your Public Profile (MSC PRPCEM Example)

Your public profile (\`https://github.com/mscprpcem\`) introduces you to recruiters, hiring managers, and open-source collaborators worldwide.

![MSC PRPCEM Official GitHub Profile & Secret Repository Overview](/assets/github-mscprpcem-profile.jpg)

#### Core Profile Components:
1. **Avatar & Profile Picture:** A high-resolution official club emblem or clean personal professional headshot.
2. **Name & Pronouns:** e.g., \`MSC PRPCEM (Microsoft Student Club)\`.
3. **Bio:** Up to 160 characters stating primary mission or technical stack:
   > *"Microsoft Student Club @ PRPCEM | Empowering student developers with Git, open source & cloud engineering."*
4. **Location & Time Zone:** e.g., \`Amravati, Maharashtra, India\`. Helps international distributed teams coordinate synchronous code reviews and events.
5. **Website / Social Links:** \`https://mscprpcem.tech\` and \`https://linkedin.com/company/mscprpcem\`.
6. **Pinned Repositories:** Up to **6 public repositories or gists** to showcase best work (e.g., \`Quiz-platform\`, \`Git-Curriculum\`, \`sql-lab\`, \`campus-events-portal\`).
7. **Contribution Heatmap (Activity Graph):** A visual grid documenting commits, opened PRs, code reviews, and filed issues across the past 52 weeks in vibrant shades of green.

---

### 5. The Special "Profile README" (Secret Repository)

GitHub includes a secret Easter-egg feature that allows developers to display custom, styled Markdown content directly at the top of their personal profile landing page.

![The Special GitHub Profile README Secret Repository Workflow](/assets/github-profile-readme-workflow.jpg)

#### The 4 Strict Requirements for a Profile README
GitHub triggers the profile README card only if **all four conditions are met simultaneously**:

1. **Exact Username Match:** The repository name matches your GitHub username exactly (case-sensitive) (e.g., username \`mscprpcem\` requires repository \`mscprpcem\`).
2. **Public Visibility:** The repository visibility must be set to **Public** (it will immediately disappear if set to Private).
3. **Root README File:** The root of the repository must contain a file named \`README.md\`.
4. **Non-Empty Content:** The \`README.md\` file must contain text content.

*(When creating this repository on GitHub, a special banner will appear: "You found a secret! mscprpcem/mscprpcem is a special repository that you can use to add a README.md to your GitHub profile.")*

---

### 6. Markdown Essentials for Profile READMEs

Markdown (\`.md\`) is the universal formatting language for GitHub documentation.

| Markdown Syntax | Rendered Output | Use Case |
| :--- | :--- | :--- |
| \`# Heading 1\` | Main page title | Primary title / greeting |
| \`## Heading 2\` | Section subtitle | Major sections (About Me, Tech Stack) |
| \`### Heading 3\` | Sub-section header | Section sub-groupings |
| \`**Bold text**\` | **Bold text** | Emphasizing key tools or achievements |
| \`*Italic text*\` | *Italic text* | Subtle notes or quotes |
| \`[Link text](https://url.com)\` | [Link text](https://url.com) | Portfolio, LinkedIn, and social links |
| \`- Item\` or \`* Item\` | • Bulleted list item | Tech stack and project highlights |
| \`1. First item\` | 1. Numbered list item | Ordered accomplishments or goals |
| \`\`inline code\`\` | \`inline code\` | Tools, package names, command tags |
| \`- [x] Task complete\` | [x] Checked interactive checkbox | Completed roadmap milestones |
| \`- [ ] Task incomplete\` | [ ] Unchecked checkbox | In-progress learning goals |
| \`> Quoted note\` | Blockquote callout box | Developer motto or featured quote |

---

### 7. Practical Task Walkthrough: Step-by-Step (MSC PRPCEM Example)

Follow these sequential steps to complete your hands-on assignment:

#### Step 1: Complete Account Metadata
1. Click your profile avatar in the upper right corner > **Settings**.
2. Under **Public profile**, configure:
   * **Name:** \`MSC PRPCEM (Microsoft Student Club)\` (or your real full name).
   * **Bio:** *"Microsoft Student Club @ PRPCEM | Empowering student developers through Git, GitHub, open source & software engineering."*
   * **Location & URL:** Add \`Amravati, Maharashtra, India\` and website \`https://mscprpcem.tech\`.
3. Click **Update profile**.

#### Step 2: Create the Special Profile Repository
1. In the upper right corner of GitHub, click the **\`+\`** icon > select **New repository**.
2. In the **Repository name** input box, enter: \`mscprpcem\` (or your exact GitHub username).
3. Verify that the special green box appears stating: *"You found a secret! mscprpcem/mscprpcem is a special repository that you can use to add a README.md to your GitHub profile."*
4. Ensure **Public** is selected.
5. Check the box **"Add a README file"**.
6. Click **Create repository**.

#### Step 3: Edit and Customize Your README.md
1. Click the pencil icon (**Edit**) on the \`README.md\` file inside your newly created repository.
2. Paste the following production **MSC PRPCEM** template:

\`\`\`markdown
# Hi there, we are MSC PRPCEM

<p align="left">
  <img src="https://img.shields.io/badge/Club-Microsoft_Student_Club-0078D4?style=for-the-badge&logo=microsoft&logoColor=white" />
  <img src="https://img.shields.io/badge/Campus-PRPCEM_Amravati-FFB900?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Community-Open_Source-107C41?style=for-the-badge&logo=github&logoColor=white" />
</p>

### About MSC PRPCEM
- **What we're building:** Open-source projects, coding platforms, interactive technical workshops, and student mentorship programs.
- **Curriculum Goal:** Master Git & GitHub collaborative workflows across the PRPCEM engineering cohort.
- **Ask us about:** Web Development, Cloud Computing, Git/GitHub, SQL, and Community Hackathons.
- **Official Portal:** [mscprpcem.tech](https://mscprpcem.tech)
- **Contact & Socials:** [LinkedIn](https://linkedin.com/company/mscprpcem) | [msc@prpcem.ac.in](mailto:msc@prpcem.ac.in)

---

### Tech Stack & Ecosystem
- **Version Control:** Git, GitHub, GitHub Actions, GitHub Pages
- **Frontend & Backend:** React, Node.js, Express, TailwindCSS, PostgreSQL, SQLite
- **Tools & Environments:** VS Code, Git Bash, Terminal, Docker

---

### GitHub Community & Contributor Stats
![MSC PRPCEM GitHub Stats](https://github-readme-stats.vercel.app/api?username=mscprpcem&show_icons=true&theme=radical)
![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=mscprpcem&layout=compact&theme=radical)
\`\`\`

#### Step 4: Commit Changes & Verify Profile
1. Scroll down to the bottom of the editor.
2. In the commit message box, enter: \`docs: initialize custom profile README\`.
3. Select **Commit changes**.
4. Navigate to your public profile: \`https://github.com/mscprpcem\`.
5. Verify that your custom profile README is now displayed prominently at the top of your landing page!

---

### Quick Reference Summary

| Feature / Concept | Rule / Behavior | MSC PRPCEM Configuration |
| :--- | :--- | :--- |
| **Email Attribution** | Profile email must match \`git config user.email\` to credit commits. | \`msc@prpcem.ac.in\` |
| **Special Repo Name** | Must be \`<username>/<username>\` (exact case) to render. | \`mscprpcem/mscprpcem\` |
| **Visibility Requirement** | Must be **Public**; setting to Private hides the profile README. | Set to Public |
| **Pinned Items** | Maximum of **6 items** (Repositories or Gists) can be pinned. | \`Quiz-platform\`, \`Git-Curriculum\` |
| **Contribution Graph** | Tracks commits to default/gh-pages branches, opening PRs, and filing issues. | 52-week green activity heatmap |
| **Official Profile URL** | Permanent public landing page for open-source identity. | \`https://github.com/mscprpcem\` |
`
};
