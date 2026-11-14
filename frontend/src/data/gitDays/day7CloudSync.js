// =========================================================================
// DAY 7: GIT REMOTES & CLOUD SYNC (Remotes, Push, Fetch vs Pull & Clone)
// Adapted for MSC PRPCEM (Microsoft Student Club @ PRPCEM)
// =========================================================================

export const DAY_7_METADATA = {
  day: 7,
  week: 'Chapter 1',
  weekTitle: 'Chapter 1: Git Foundations & Daily Workflow',
  slug: 'day-7-cloud-sync',
  title: 'Git Remotes & Cloud Sync',
  shortTitle: '8. Remotes & Sync',
  summary: 'Connect local repositories to GitHub remotes: origin alias, remote-first (clone) vs local-first (remote add), HTTPS vs SSH authentication, upstream tracking with git push -u, and mastering git fetch vs git pull.',
  readTime: '10 min read',
  badge: 'Chapter 7',
  color: 'from-blue-600 to-teal-600',
  modules: [
    '1. What is a Git Remote & The origin Alias',
    '2. Two Ways to Connect: Remote-First (clone) vs Local-First (remote add)',
    '3. Authentication: HTTPS vs. SSH Protocols',
    '4. Uploading Commits: git push & Upstream Tracking (-u)',
    '5. Downloading Changes: git fetch vs. git pull Deep Dive',
    '6. Practical Task Walkthrough: Push, Fetch & Clone Workflows',
    'Quick Reference Summary'
  ]
};

export const DAY_7_TOPIC = {
  slug: 'day-7-cloud-sync',
  title: 'Git Remotes & Cloud Sync: Connecting Local Repositories to GitHub',
  summary: 'Establish bidirectional cloud synchronization between your local development workstation and GitHub remotes using git clone, git remote add, git push -u, git fetch, and git pull.',
  readTime: '10 min read',
  badge: 'Chapter 7',
  content: `
### Overview: Bridging Local Development and Cloud Collaboration

Welcome to **Chapter 7: Git Remotes & Cloud Sync**. In Chapters 1 through 4, you mastered recording snapshots and managing history locally on your computer. In Chapters 5 and 6, you explored GitHub's platform, profile branding, and repository architecture.

Now, it is time to connect both worlds. A local Git repository on your laptop is completely isolated until you configure a **remote connection**. By establishing remotes, you can publish your work to GitHub, collaborate across distributed engineering teams, and safely synchronize changes between multiple workstations.

In this lesson, you will master the architecture of Git remotes, HTTPS vs SSH authentication protocols, uploading with \`git push -u\`, and the critical distinction between \`git fetch\` and \`git pull\`.

---

### 1. What is a Git Remote?

A remote in Git is a bookmark (alias) pointing to a copy of your repository hosted on another server—typically on GitHub.

![Git Remotes Architecture: Local Workstation vs GitHub Cloud Server](/assets/git-remotes-architecture.jpg)

\`\`\`plaintext
LOCAL MACHINE                                    GITHUB CLOUD SERVER
┌──────────────────────────────────┐             ┌──────────────────────────────────┐
│ Local Repository (.git)          │             │ Remote Repository (origin)       │
│                                  │  git push   │                                  │
│ • Working Directory              ├────────────>│ https://github.com/user/repo.git │
│ • Staging Area (Index)           │             │                                  │
│ • Local Branch: main             │<────────────┤ • Remote Branch: main            │
│ • Remote-Tracking: origin/main   │  git fetch  │                                  │
│                                  │<────────────┤                                  │
│                                  │  git pull   │                                  │
└──────────────────────────────────┘             └──────────────────────────────────┘
\`\`\`

#### Why Is It Called \`origin\`?

By convention, Git names your primary remote connection **\`origin\`**. 

There is nothing magical about the word \`origin\`—just as \`main\` is the default name for your primary local branch, \`origin\` is simply the default nickname for the primary cloud URL where your repository lives. 

Instead of typing the full URL every time:
\`\`\`bash
git push https://github.com/mscprpcem/task-tracker-cli.git main
\`\`\`
You simply type:
\`\`\`bash
git push origin main
\`\`\`

---

### 2. Two Ways to Connect Local and Remote Repositories

There are two primary architectural workflows to establish a link between your computer and GitHub:

#### Workflow A: Remote First (\`git clone\`)

Used when a repository already exists on GitHub (either created by you with a README in Chapter 6, or an existing open-source project) and you want to download it to your computer for the first time.

\`\`\`bash
# Clone using HTTPS (creates a local folder matching the repo name)
git clone https://github.com/<username>/<repo-name>.git

# Clone into a custom directory name on your machine
git clone https://github.com/<username>/<repo-name>.git my-custom-folder
\`\`\`

**What \`git clone\` does automatically behind the scenes:**
1. Creates a brand-new directory on your machine.
2. Initializes a \`.git\` database inside it (\`git init\`).
3. Downloads the entire commit history, trees, blobs, and branches from GitHub.
4. Automatically configures the remote alias **\`origin\`** pointing to the GitHub URL.
5. Checks out the default branch (\`main\`) into your Working Directory.

#### Workflow B: Local First (\`git remote add\`)

Used when you started a project locally on your laptop (\`git init\`, \`git add\`, \`git commit\`) and now want to upload it to a brand-new, empty repository on GitHub.

#### Manage Remotes with the \`git remote\` Command Family

| Command | Action |
| :--- | :--- |
| \`git remote\` | Lists the short names of configured remotes (e.g., \`origin\`). |
| \`git remote -v\` | Lists all configured remotes with their \`(fetch)\` and \`(push)\` URLs. |
| \`git remote add origin <url>\` | Links your local repository to the remote GitHub URL under the name \`origin\`. |
| \`git remote set-url origin <new-url>\` | Updates the URL of an existing remote (useful if you rename a GitHub repo or switch from HTTPS to SSH). |
| \`git remote rename <old> <new>\` | Renames a remote alias (e.g., \`git remote rename origin upstream\`). |
| \`git remote remove <name>\` | Disconnects/deletes a remote bookmark from your local \`.git/config\`. |
| \`git remote show origin\` | Prints detailed network diagnostics about the remote server and tracked branches. |

---

### 3. Authentication: HTTPS vs. SSH

When pushing code to GitHub, GitHub must verify your identity. Note that **GitHub no longer accepts your standard account password in the terminal**. You must authenticate using one of two protocols:

| Feature | HTTPS (\`https://github.com/user/repo.git\`) | SSH (\`git@github.com:user/repo.git\`) |
| :--- | :--- | :--- |
| **How it Authenticates** | Uses Git Credential Manager (GCM) browser sign-in or a Personal Access Token (PAT). | Uses cryptographic public/private key pairs (\`~/.ssh/id_ed25519\`) saved on your machine. |
| **Firewall Compatibility** | Works everywhere (uses standard web port 443). | Can occasionally be blocked on strict corporate, college, or hostel Wi-Fi (port 22). |
| **Best For** | Beginners and standard Windows/macOS setups (configured in Chapter 2). | Advanced developers who push across dozens of repositories daily without browser popups. |

> **Personal Access Token (PAT) Tip:** If your terminal prompts you for a password over HTTPS and Git Credential Manager does not pop up a browser authentication window, navigate to **GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)**, generate a token with the \`repo\` scope checked, and paste that token into the terminal prompt as your password.

---

### 4. Uploading Commits with \`git push\`

The \`git push\` command transfers committed snapshots from your local \`.git\` database to your remote repository on GitHub.

#### First-Time Push: Setting the Upstream (\`-u\` / \`--set-upstream\`)

When pushing a local branch (\`main\`) to \`origin\` for the very first time, pass the **\`-u\`** flag:

\`\`\`bash
git push -u origin main
\`\`\`

* **What \`-u\` (\`--set-upstream\`) does:** It uploads your \`main\` branch commits to \`origin\` and permanently configures your local \`main\` branch to track the remote \`origin/main\` branch in \`.git/config\`.
* **Subsequent pushes:** Because upstream tracking is permanently recorded, every future push on this branch only requires:

\`\`\`bash
git push
\`\`\`

---

### 5. Downloading Changes: \`git fetch\` vs. \`git pull\`

This is one of the most frequently tested concepts in developer interviews and the GitHub Foundations certification exam. When a teammate (or you via the GitHub web editor) makes a commit on GitHub, your local repository is out of date. You have two ways to download those updates:

![git fetch vs git pull Architectural Comparison](/assets/git-fetch-vs-pull-guide.jpg)

\`\`\`plaintext
Remote (GitHub): A ─── B ─── C  (main on GitHub has new commit C)
Local (Before):  A ─── B        (local main is at B; origin/main is at B)
\`\`\`

#### 1. \`git fetch\` (Safe Inspection — Downloads Without Merging)

\`git fetch\` contacts GitHub, downloads all new commits, tags, and objects that you don't have locally, and updates your remote-tracking pointer (**\`origin/main\`**)—but does **NOT** touch your local working files or your local \`main\` branch.

\`\`\`bash
git fetch origin
\`\`\`

\`\`\`plaintext
After git fetch:
Remote-Tracking:     A ─── B ─── C  (origin/main updated to C!)
Local Working Tree:  A ─── B        (Your local main is still untouched at B)
\`\`\`

After fetching, you can safely inspect what changed on GitHub before deciding to merge it into your code:

\`\`\`bash
# View commits that are on GitHub but not yet in your local branch
git log main..origin/main --oneline

# Inspect differences line-by-line
git diff main origin/main

# When ready, merge the fetched changes into your current branch
git merge origin/main
\`\`\`

#### 2. \`git pull\` (Download + Merge Immediately)

\`git pull\` is a two-in-one shortcut that executes \`git fetch\` followed immediately by \`git merge\` into your currently checked-out branch:

$$\\texttt{git pull} \\;\\; = \\;\\; \\texttt{git fetch} \\;\\; + \\;\\; \\texttt{git merge}$$

\`\`\`bash
git pull origin main
# Or simply \`git pull\` if upstream tracking (-u) is already established
git pull
\`\`\`

\`\`\`plaintext
After git pull:
Remote-Tracking:     A ─── B ─── C  (origin/main is at C)
Local Working Tree:  A ─── B ─── C  (Your local main and files are updated to C!)
\`\`\`

#### Comparison Table: \`git fetch\` vs. \`git pull\`

| Feature | \`git fetch\` | \`git pull\` |
| :--- | :--- | :--- |
| **Network Action** | Downloads new commits/refs from remote. | Downloads new commits/refs from remote. |
| **Updates \`origin/main\`?** | **Yes** (updates \`.git/refs/remotes/origin/main\`). | **Yes**. |
| **Updates Local Working Files?** | **No** (your files on disk remain 100% untouched). | **Yes** (immediately merges changes into active branch). |
| **Can Trigger Merge Conflicts?** | **Never**. | **Yes**, if remote changes collide with local edits. |
| **When to Use** | When reviewing incoming team changes before integrating. | When you know remote changes are clean and want to update now. |

---

### 6. Practical Task Walkthrough: Push a Local Project & Clone a Repository

Complete both workflows below to master the Chapter 7 practical exercises:

#### Part A: Push an Existing Local Repository to GitHub

##### Step 1: Create an Empty Remote Repository on GitHub
1. Go to [github.com](https://github.com/) > click **+** in the top-right > **New repository**.
2. **Repository name:** Enter \`msc-local-sync-demo\`.
3. **Visibility:** Select **Public**.
4. **CRITICAL:** Leave **Add a README file**, **Add .gitignore**, and **Choose a license** **UNCHECKED** (we are uploading an existing local repo).
5. Click **Create repository** and copy the HTTPS URL shown (\`https://github.com/<your-username>/msc-local-sync-demo.git\`).

##### Step 2: Initialize & Commit Locally in Your Terminal
\`\`\`bash
# 1. Create and enter a new project directory
mkdir msc-local-sync-demo && cd msc-local-sync-demo

# 2. Initialize Git and set default branch to 'main'
git init
git branch -M main

# 3. Create a README and an application entry script
echo "# MSC Local Sync Demo" > README.md
echo "console.log('Synced with GitHub!');" > index.js

# 4. Stage and commit the files
git add .
git commit -m "feat: initialize local project with README and entry script"
\`\`\`

##### Step 3: Link the Remote and Push to GitHub
\`\`\`bash
# 5. Connect local repo to your empty GitHub repo
git remote add origin https://github.com/<your-username>/msc-local-sync-demo.git

# 6. Verify the remote URL was registered for fetch and push
git remote -v

# 7. Push local 'main' to 'origin' and set upstream tracking (-u)
git push -u origin main
\`\`\`

Refresh your GitHub repository page in your browser—your \`README.md\` and \`index.js\` files are now live in the cloud!

---

#### Part B: Simulate Remote Changes & Practice \`git fetch\` vs. \`git pull\`

##### Step 1: Make a Commit on GitHub Web
1. On your \`msc-local-sync-demo\` GitHub repository page, click the pencil icon to edit \`README.md\`.
2. Add a new line at the bottom: \`Updated directly from GitHub cloud.\`
3. Click **Commit changes...** and commit directly to \`main\`.

##### Step 2: Fetch and Inspect in Your Terminal
\`\`\`bash
# 1. Download new metadata from GitHub WITHOUT changing your local files
git fetch origin

# 2. Check status — Git will tell you: "Your branch is behind 'origin/main' by 1 commit"
git status

# 3. Inspect the incoming commit before merging
git log main..origin/main --oneline

# 4. Pull (merge) the changes into your local working directory
git pull
\`\`\`

---

#### Part C: Clone Your Chapter 06 Repository Locally

Step out of your current directory and clone the \`task-tracker-cli\` repository you built on GitHub in Chapter 6:

\`\`\`bash
# Move up one directory level
cd ..

# Clone the Chapter 06 repository to your local computer
git clone https://github.com/<your-username>/task-tracker-cli.git

# Enter the cloned folder and verify its remote configuration
cd task-tracker-cli
git remote -v
git log --oneline
\`\`\`

---

### Quick Reference Summary

| Command | Description |
| :--- | :--- |
| \`git clone <url>\` | Downloads an entire remote repository and its full commit history to your local computer. |
| \`git remote -v\` | Displays all linked remote names (\`origin\`) alongside their fetch and push URLs. |
| \`git remote add origin <url>\` | Links a local Git repository to a remote GitHub URL under the alias \`origin\`. |
| \`git remote set-url origin <url>\` | Changes the URL associated with an existing remote alias. |
| \`git push -u origin main\` | Uploads commits from local \`main\` to \`origin\` and configures upstream tracking (\`-u\`). |
| \`git fetch origin\` | Downloads new remote commits into \`origin/main\` without modifying your local working files. |
| \`git pull\` | Runs \`git fetch\` + \`git merge\` to immediately update your active local working branch. |
`
};
