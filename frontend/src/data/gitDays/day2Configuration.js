// =========================================================================
// DAY 2: GIT CONFIGURATION (git config, Local vs. Global)
// =========================================================================

export const DAY_2_METADATA = {
  day: 2,
  week: 'Chapter 1',
  weekTitle: 'Chapter 1: Git Foundations & Daily Workflow',
  slug: 'git-config',
  title: 'Git Configuration (git config, Local vs. Global)',
  shortTitle: '3. Configuration',
  summary: 'Master configuration levels (System, Global, Local), precedence rules, author identity embedding, essential core defaults, and debugging with --show-origin.',
  readTime: '7 min read',
  badge: 'Chapter 1',
  color: 'from-blue-600 to-indigo-600',
  modules: [
    '1. What is Git Configuration?',
    '2. Configuration Scopes & Hierarchical Precedence',
    '3. Configuring User Identity',
    '4. Essential Behavioral Configurations',
    '5. Inspecting, Verifying & Debugging Configurations',
    '6. Modifying and Unsetting Configuration Values',
    '7. Practical Task Walkthrough',
    'Quick Reference Summary'
  ]
};

export const DAY_2_TOPIC = {
  slug: 'git-config',
  title: 'Git Configuration (git config, Local vs. Global)',
  summary: 'Learn how Git tracks commit identity, how configuration scopes cascade from System to Global to Local, essential editor and newline settings, and configuration inspection.',
  readTime: '7 min read',
  badge: 'Chapter 1',
  content: `
### Overview: Git Configuration & Identity Architecture

Welcome to Git Configuration. In this lesson, you configure your developer identity and establish reliable system-wide defaults.

Git never operates anonymously. Before you record your first snapshot, Git requires an author identity that permanently attaches to every change you ever make.

---

### 1. What is Git Configuration?

Git does not operate anonymously. Every time a change is saved (committed), Git permanently embeds cryptographic metadata into that commit:

* **The author's full display name:** The human-readable name of the engineer.
* **The author's email address:** The verified email linked to your developer profile.
* **The exact timestamp:** The precise date, time, and timezone when the change was authored and committed.

Once written into a commit, this identity becomes an immutable part of the project's historical hash tree. Altering it later requires rewriting repository history.

The primary tool used to set, modify, and query these operational parameters is the \`git config\` command-line utility.

---

### 2. Configuration Scopes & Hierarchical Precedence

Git stores its settings across three distinct configuration levels (or scopes). Understanding these scopes prevents identity conflicts between personal projects and professional or educational repositories.

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│ 1. System Scope (--system)                                   │
│    Applies to all OS user accounts on this machine           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼  (Overridden by)
┌─────────────────────────────────────────────────────────────┐
│ 2. Global Scope (--global)                                  │
│    Applies to the logged-in OS user across ALL repositories │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼  (Overridden by)
┌─────────────────────────────────────────────────────────────┐
│ 3. Local Scope (--local)                                    │
│    Applies ONLY to a specific repository (.git/config)      │
└─────────────────────────────────────────────────────────────┘
\`\`\`

![Git Configuration Scopes and Hierarchical Precedence](/assets/git-config-scopes.jpg)

#### Detailed Breakdown of Scopes

| Scope Level | CLI Flag | File System Location | Typical Use Case |
| :--- | :--- | :--- | :--- |
| **System** | \`--system\` | **Unix/macOS:** \`/etc/gitconfig\` <br/> **Windows:** \`C:\\Program Files\\Git\\etc\\gitconfig\` | Applied across all user accounts on the physical computer. Rarely edited unless managing multi-user shared lab servers. |
| **Global** | \`--global\` | **Unix/macOS:** \`~/.gitconfig\` or \`~/.config/git/config\` <br/> **Windows:** \`C:\\Users\\<Username>\\.gitconfig\` | General identity and baseline settings applied to every repository created or cloned by your computer profile. |
| **Local** | \`--local\` | \`<Repository-Root>/.git/config\` | Applied strictly inside one individual project folder. Used when a specific project requires an alternate email address or custom remote settings. |

#### Precedence Rule

If the exact same configuration variable is set at multiple levels, Git resolves settings in order of specificity:

:::info Precedence Hierarchy
**Local** (Highest Precedence) &nbsp;&rarr;&nbsp; **Global** &nbsp;&rarr;&nbsp; **System** (Lowest Precedence)
:::

> **Important Detail:** If you execute \`git config\` inside an existing repository without supplying an explicit scope flag (such as \`--global\` or \`--system\`), Git defaults to \`--local\`. If executed outside of a repository without flags, Git throws a fatal error because no \`.git/config\` file exists to modify.

---

### 3. Configuring User Identity

#### Setting the Global Identity (Default Setup)
Run these commands in your terminal to set your baseline machine-wide developer identity:

\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
\`\`\`

* **user.name:** Your professional name or public handle (e.g., Alex Morgan). It does not need to match your operating system account username.
* **user.email:** The email address where your contributions are credited. For GitHub integration, this should match the verified email address linked to your GitHub account (which will be configured in the GitHub Essentials lesson).

#### Setting a Local (Per-Repository) Identity
When contributing to an employer codebase, client project, or institutional assignment that mandates a specific work/school email address (e.g., \`alex@university.edu\`), navigate inside that repository's directory and execute:

\`\`\`bash
git config --local user.name "Alex Morgan"
git config --local user.email "alex@university.edu"
\`\`\`

* **Outcome:** Commits made inside this specific folder will use \`alex@university.edu\`, while every other repository on your machine continues to use \`your.email@example.com\` via the global configuration.

---

### 4. Essential Behavioral Configurations

Beyond name and email, production workflows rely on standard defaults for branch naming, text editors, line endings, and credentials.

![Git User Identity and Essential Configurations](/assets/git-identity-defaults.jpg)

#### 1. Default Branch Initialization (\`init.defaultBranch\`)
Historically, Git defaulted initial branches to \`master\`. Modern Git distributions and hosting platforms (GitHub, GitLab) use \`main\` as the standard default branch name:

\`\`\`bash
git config --global init.defaultBranch main
\`\`\`

#### 2. Default Text Editor (\`core.editor\`)
Whenever Git requires an interactive message (such as merge conflict resolution, empty commit messages, or interactive rebasing), it invokes your system's default editor:

* **Visual Studio Code (GUI):**
  \`\`\`bash
  git config --global core.editor "code --wait"
  \`\`\`
  *(The \`--wait\` flag instructs your terminal to pause until you close the VS Code file tab).*
* **Nano (Beginner-friendly CLI):**
  \`\`\`bash
  git config --global core.editor "nano"
  \`\`\`
* **Vim (Advanced CLI):**
  \`\`\`bash
  git config --global core.editor "vim"
  \`\`\`

#### 3. Cross-Platform Line Endings (\`core.autocrlf\`)
Different operating systems represent newlines in text files using different ASCII control characters:
* **Windows:** Carriage Return + Line Feed (\`CRLF\`, \`\\r\\n\`).
* **macOS / Linux:** Line Feed (\`LF\`, \`\\n\`).

If Windows and macOS/Linux developers collaborate on the same repository without normalizations, Git detects the invisible line-ending changes as complete file modifications, polluting the commit history.

* **On Windows Machines:**
  \`\`\`bash
  git config --global core.autocrlf true
  \`\`\`
  *(Converts LF to CRLF when checking out files to your disk, and converts CRLF back to LF when committing into the repository).*
* **On macOS and Linux Machines:**
  \`\`\`bash
  git config --global core.autocrlf input
  \`\`\`
  *(Maintains LF on disk and ensures any accidental CRLF introduced is stripped before being committed).*

#### 4. Credential Helper (\`credential.helper\`)
Prevents having to manually authenticate repeatedly when communicating with remote servers over HTTPS:

* **Windows:**
  \`\`\`bash
  git config --global credential.helper manager
  \`\`\`
* **macOS:**
  \`\`\`bash
  git config --global credential.helper osxkeychain
  \`\`\`
* **Linux:**
  \`\`\`bash
  git config --global credential.helper cache
  \`\`\`

---

### 5. Inspecting, Verifying & Debugging Configurations

#### Verifying Specific Configuration Keys
Query the current resolved value of any single variable:

\`\`\`bash
git config user.name
git config user.email
\`\`\`

#### Listing All Active Configurations
To print every configuration variable currently active in your environment:

\`\`\`bash
git config --list
\`\`\`

To restrict the list output to a single scope:

\`\`\`bash
git config --list --global
git config --list --local
\`\`\`

#### Tracing Configuration Sources (\`--show-origin\`)
When a setting is behaving unexpectedly, print the configuration values along with the exact physical file path where each setting is defined:

\`\`\`bash
git config --list --show-origin
\`\`\`

**Example Output:**
\`\`\`
file:C:/Program Files/Git/etc/gitconfig    core.symlinks=false
file:C:/Program Files/Git/etc/gitconfig    core.autocrlf=true
file:C:/Users/Alex/.gitconfig              user.name=Alex Morgan
file:C:/Users/Alex/.gitconfig              user.email=alex@example.com
file:C:/Users/Alex/.gitconfig              init.defaultbranch=main
\`\`\`

---

### 6. Modifying and Unsetting Configuration Values

#### Overwriting an Existing Setting
To update an existing variable, re-run the \`git config\` assignment with the new value. The old value is replaced automatically:

\`\`\`bash
git config --global user.name "Alexander Morgan"
\`\`\`

#### Removing a Variable (\`--unset\`)
If a value was entered incorrectly or needs to be cleared:

\`\`\`bash
git config --global --unset user.name
\`\`\`

#### Direct File Editing (\`--edit\`)
Git configuration files are standard INI-formatted text files. You can open and edit the configuration file directly inside your configured text editor:

\`\`\`bash
git config --global --edit
\`\`\`

**Sample Structure of \`~/.gitconfig\`:**
\`\`\`ini
[user]
    name = Alex Morgan
    email = alex@example.com
[init]
    defaultBranch = main
[core]
    autocrlf = true
    editor = code --wait
\`\`\`

---

### 7. Practical Task Walkthrough

Complete the following validation sequence in your terminal to fulfill the practical assignment:

\`\`\`bash
# Step 1: Set your global name
git config --global user.name "Your Preferred Name"

# Step 2: Set your global email
git config --global user.email "yourname@example.com"

# Step 3: Set your default branch to main
git config --global init.defaultBranch main

# Step 4: Configure line-ending behavior (run the one matching your OS)
# For Windows:
git config --global core.autocrlf true
# For macOS / Linux:
git config --global core.autocrlf input

# Step 5: Verify the values
git config user.name
git config user.email

# Step 6: Print configuration origins to confirm the file location
git config --list --show-origin
\`\`\`

---

### Quick Reference Summary

| Command | Description |
| :--- | :--- |
| \`git config --global user.name "Name"\` | Sets the system user's default commit author name. |
| \`git config --global user.email "Email"\` | Sets the system user's default commit author email. |
| \`git config --local user.email "Email"\` | Overrides the commit email strictly within the current repository. |
| \`git config --global init.defaultBranch main\` | Configures new local repositories to initialize on \`main\`. |
| \`git config --global core.autocrlf true/input\` | Configures line-ending normalization across operating systems. |
| \`git config --list\` | Dumps all active configuration keys and values. |
| \`git config --list --show-origin\` | Displays every active configuration setting alongside its physical file path. |
| \`git config --global --unset <key>\` | Removes a configuration entry from the global scope. |
| \`git config --global --edit\` | Opens the global \`.gitconfig\` file in your text editor. |
`
};
