# 🚀 30-Chapter Git & GitHub Developer Curriculum

A structured, practical chapter-by-chapter curriculum designed for developers, students, and engineers to master Git version control, collaborative GitHub workflows, open-source contribution, and automated CI/CD pipelines.

---

## 📖 Curriculum Overview (Chapters 1 to 30)

| Chapter | Curriculum Module | Core Topics & Subchapters | Practical Task | Status |
| :---: | :--- | :--- | :--- | :---: |
| **01** | **Orientation & Version Control Fundamentals** | The Big Picture, Git vs GitHub, computer storage, GUI vs CLI, Local vs Remote, VCS concepts, OS installation | Install Git and verify terminal execution | [ ] |
| **02** | **Git Configuration** | `git config`, local vs global scopes, author identity, editor defaults | Configure user display name and commit email | [ ] |
| **03** | **Repository Basics & Architecture** | Repository initialization, `git init`, The Three Trees, `.git` folder anatomy | Create a repository and inspect internal objects | [ ] |
| **04** | **Basic Git Commands (Staging & Commits)** | `git status`, `git add`, `git commit`, commit messages, `.gitignore` patterns | Stage modifications and craft atomic commits | [ ] |
| **05** | **GitHub Essentials & Remote Setup** | GitHub account setup, 2FA security, web interface navigation, Profile README | Construct an engineering profile repository | [ ] |
| **06** | **Repositories & Documentation** | Public vs private repositories, Markdown syntax, project README, licenses | Build a repository with structured documentation | [ ] |
| **07** | **Git Remotes & Cloud Sync** | Cloning repositories, managing remotes (`origin`), pushing, pulling, fetching | Push a local project to GitHub and clone it | [ ] |
| **08** | **Branching Basics & Pointer Mechanics** | Branch pointers, creating, switching, renaming, and deleting branches | Create and switch between feature branches | [ ] |
| **09** | **Branch Switching & Detached HEAD** | Modern `git switch` vs `checkout`, detached HEAD state navigation | Safely navigate commits and branch tips | [ ] |
| **10** | **Merging & Collaboration Mechanics** | Fast-forward vs 3-way recursive merge commits, merge options | Merge a completed feature into `main` | [ ] |
| **11** | **Conflict Resolution Strategies** | Understanding conflict markers, manual resolution, aborting merges | Trigger and resolve a multi-line merge conflict | [ ] |
| **12** | **Linear Rebasing & The Golden Rule** | Rebase mechanics, linear commit histories, the Golden Rule of Rebasing | Rebase feature branches on updated base branches | [ ] |
| **13** | **Context Switching with Git Stash** | `git stash`, stash stack, popping, applying, and dropping stashes | Stash uncommitted changes during urgent branch switch | [ ] |
| **14** | **Undoing Changes & Recovery** | `git restore`, `git revert`, `git reset` (`--soft`, `--mixed`, `--hard`) | Undo accidental changes without losing work | [ ] |
| **15** | **Cherry-Picking & Selective Commits** | `git cherry-pick`, applying individual commits across branches | Port a bugfix commit directly into another branch | [ ] |
| **16** | **Remote Origins & Upstream Conventions** | Remote tracking branches, origin conventions, managing multiple remotes | Inspect and configure multiple remote endpoints | [ ] |
| **17** | **Synchronization (Fetch, Pull & Push)** | Detailed network mechanics: fetch vs pull vs push, tracking flags | Synchronize branches with upstream repositories | [ ] |
| **18** | **Fork-and-Pull Open Source Workflows** | Forking upstream repositories, syncing forks, pull request lifecycle | Fork an upstream repository and synchronize | [ ] |
| **19** | **Pull Request Crafting & Etiquette** | Descriptive PR templates, commit squashing, linking issues | Open a high-impact pull request with verification | [ ] |
| **20** | **Code Reviews & Peer Collaboration** | Code review etiquette, inline comments, suggestion blocks | Conduct a peer code review on GitHub | [ ] |
| **21** | **GitHub Issues & Project Tracking** | Issue templates, labels, milestones, project Kanban boards | Organize issues into an automated project board | [ ] |
| **22** | **Working in a Team & Organizations** | GitHub Organizations, team roles, `CODEOWNERS`, branch protections | Configure team permissions and protection rules | [ ] |
| **23** | **GitHub CLI (`gh`) Automation** | Command-line GitHub operations, PR checkout, issue management | Manage repositories and PRs entirely from terminal | [ ] |
| **24** | **Advanced History: Reflog & Bisect** | Disaster recovery with `git reflog`, debugging with `git bisect` | Recover a deleted branch and find regression commit | [ ] |
| **25** | **Tags, Releases & Semantic Versioning** | Lightweight vs annotated tags, SemVer standards, GitHub Releases | Tag a release and publish compiled artifacts | [ ] |
| **26** | **GitHub Actions CI/CD Fundamentals** | YAML syntax, workflow triggers, runners, continuous integration | Build an automated test and lint pipeline | [ ] |
| **27** | **GitHub Actions Advanced & Secrets** | Encrypted secrets, scheduled cron workflows, matrix builds, artifacts | Securely inject API credentials into CI jobs | [ ] |
| **28** | **Team Branching Models (Gitflow & Trunk)** | Trunk-based continuous delivery vs Gitflow release models | Implement an enterprise branching strategy | [ ] |
| **29** | **Emergency Hotfixes & Secret Scrubbing** | Production hotfix deployment, purging leaked keys from history | Scrub a sensitive API key from the commit tree | [ ] |
| **30** | **Open Source Contribution & Ecosystem** | DCO, commit signing (GPG), GitHub Pages, Student Developer Pack | Deploy a live static documentation site | [ ] |

---

## 📚 Detailed Chapter Curriculum Breakdown

### 🎯 Part 1: Git & GitHub Foundations (Chapters 1–7)
Focus: Understanding how Git models snapshots, setting up local and remote environments, making commits, and connecting to GitHub.

- **Chapter 1: Version Control Fundamentals & Orientation**
  - *Topics*: What is version control, why use it, Git vs other VCS, mental models, installing Git locally.
  - *Practical*: Install Git (`git --version`) and verify terminal access.
- **Chapter 2: Git Configuration**
  - *Topics*: `git config`, local vs global configuration, system defaults.
  - *Practical*: Run `git config --global user.name "Your Name"` and `git config --global user.email "you@domain.com"`.
- **Chapter 3: Repository Basics & The Three Trees**
  - *Topics*: Repository initialization, `git init`, working directory, staging area (index), `.git` anatomy.
  - *Practical*: Initialize a repository with `git init` and inspect hidden `.git` files.
- **Chapter 4: Basic Git Commands (Staging & Commits)**
  - *Topics*: `git status`, `git add`, `git commit -m`, inspecting log history, configuring `.gitignore`.
  - *Practical*: Stage files, craft atomic commits, and ignore build directories/environment files.
- **Chapter 5: GitHub Essentials & Remote Setup**
  - *Topics*: Creating a GitHub account, interface navigation, profile setup, profile README (`username/username`).
  - *Practical*: Create your special GitHub profile repository with Markdown bio and badges.
- **Chapter 6: Repositories & Documentation**
  - *Topics*: Creating public vs private repositories, writing Markdown, README structure, Conventional Commit messages.
  - *Practical*: Create a repository with a structured `README.md` and license.
- **Chapter 7: Git Remotes & Cloud Sync**
  - *Topics*: Remote repositories, `git remote add`, `git push -u`, `git pull`, fetching changes without merging (`git fetch`).
  - *Practical*: Connect your local repository to a remote GitHub repository and push your `main` branch.

---

### 🌿 Part 2: Branching, Merging & History (Chapters 8–14)
Focus: Branch management, merging strategies, resolving conflicts, and team collaboration workflows.

- **Chapter 8: Branching Basics & Pointer Mechanics**
  - *Topics*: Creating, renaming, deleting, and switching branches (`git branch`, `git switch`, `git checkout -b`).
  - *Practical*: Create a feature branch `feature/navbar`, add changes, and switch between branches.
- **Chapter 9: Branch Switching & Detached HEAD**
  - *Topics*: Modern `git switch` vs `checkout`, navigating detached HEAD states.
  - *Practical*: Switch branches and explore detached HEAD safely.
- **Chapter 10: Merging & Collaboration Mechanics**
  - *Topics*: Merging fundamentals, Fast-Forward merges vs 3-Way merge commits (`--no-ff`), merge strategies.
  - *Practical*: Merge a completed feature branch into the `main` branch.
- **Chapter 11: Conflict Resolution Strategies**
  - *Topics*: Understanding merge conflicts, conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), resolving and committing.
  - *Practical*: Intentionally create a merge conflict on the same line across two branches, resolve it, and verify changes.
- **Chapter 12: Linear Rebasing & The Golden Rule**
  - *Topics*: Linear commit histories, rebase mechanics, the Golden Rule of Rebasing.
  - *Practical*: Rebase feature branches on updated base branches.
- **Chapter 13: Context Switching with Git Stash**
  - *Topics*: `git stash`, `git stash pop`, `git stash list`, inspecting commit graphs with `git log --oneline --graph --all`.
  - *Practical*: Stash temporary uncommitted changes, switch branches, return, and apply stashed work.
- **Chapter 14: Undoing Changes & Recovery**
  - *Topics*: `git restore`, `git revert`, `git reset` (`--soft`, `--mixed`, `--hard`), understanding detached HEAD.
  - *Practical*: Practice safely undoing uncommitted changes and reverting a published commit.

---

### 🧰 Part 3: Collaboration & Advanced Team Operations (Chapters 15–21)
Focus: History manipulation, disaster recovery, open-source pull requests, and project management.

- **Chapter 15: Cherry-Picking & Selective Commits**
  - *Topics*: Cherry-picking specific commits (`git cherry-pick`), Git patches (`git format-patch`), Git submodules.
  - *Practical*: Cherry-pick a bug fix from one branch into another without merging the whole branch.
- **Chapter 16: Remote Origins & Conventions**
  - *Topics*: Remote configuration, origin conventions, managing multiple remotes.
  - *Practical*: Inspect and configure multiple remote endpoints.
- **Chapter 17: Synchronization (Fetch, Pull & Push)**
  - *Topics*: Network synchronization mechanics: fetch vs pull vs push, tracking flags.
  - *Practical*: Synchronize branches with upstream repositories.
- **Chapter 18: Fork-and-Pull Workflows**
  - *Topics*: Forking vs cloning, upstream remotes, adding collaborators, open-source contribution cycle.
  - *Practical*: Fork an open-source repository and submit a pull request.
- **Chapter 19: Pull Request Workflow**
  - *Topics*: PR guidelines, code review etiquette, branch naming conventions, contribution guidelines (`CONTRIBUTING.md`).
  - *Practical*: Open a pull request with a descriptive summary, issue link, and screenshots.
- **Chapter 20: Code Reviews & Peer Feedback**
  - *Topics*: Code review etiquette, inline comments, suggestion blocks.
  - *Practical*: Conduct a peer code review on GitHub.
- **Chapter 21: GitHub Issues & Projects**
  - *Topics*: Issue tracking, issue templates, labels (bug, enhancement), milestone assignments, Kanban boards.
  - *Practical*: Build an automated GitHub Project board with "Todo", "In Progress", and "Done" columns.

---

### ⚡ Part 4: Power Tools, CI/CD, APIs & Ecosystem (Chapters 22–30)
Focus: Command-line productivity, GitHub Actions CI/CD pipelines, APIs, and production deployment.

- **Chapter 22: Working in a Team & Organizations**
  - *Topics*: Collaborators vs members, GitHub Organizations, team permissions, code owners (`CODEOWNERS`).
  - *Practical*: Create a GitHub Organization, set up team permissions, and assign code ownership rules.
- **Chapter 23: GitHub CLI (`gh`) Automation**
  - *Topics*: Installing `gh`, authentication, creating repositories, viewing issues, checking out PRs from CLI.
  - *Practical*: Clone a repository, create an issue, and submit a PR entirely using the `gh` terminal tool.
- **Chapter 24: Advanced Git Tools (Reflog & Bisect)**
  - *Topics*: Disaster recovery with `git reflog`, binary search debugging with `git bisect`, `git worktree`, Git LFS.
  - *Practical*: Use `git reflog` to recover a deleted branch, and run `git bisect` to locate a regression commit.
- **Chapter 25: Tags & Semantic Versioning**
  - *Topics*: Lightweight vs annotated tags (`git tag -a`), Semantic Versioning (`v1.0.0`), GitHub Releases with release notes.
  - *Practical*: Tag a commit with `v1.0.0` and publish an official Release on GitHub with binary/source attachments.
- **Chapter 26: GitHub Actions Fundamentals**
  - *Topics*: CI/CD concepts, YAML workflow syntax, triggers (`push`, `pull_request`, `workflow_dispatch`), jobs and steps.
  - *Practical*: Create `.github/workflows/ci.yml` that runs on push and prints a greeting or runs a test command.
- **Chapter 27: GitHub Actions Advanced & Secrets**
  - *Topics*: Scheduled workflows (cron), self-hosted vs GitHub runners, repository secrets, environment variables.
  - *Practical*: Configure encrypted repository secrets (`Settings > Secrets`) and consume them safely in a workflow.
- **Chapter 28: Team Branching Models (Gitflow & Trunk)**
  - *Topics*: Trunk-based continuous delivery vs Gitflow release models, team permissions, code ownership.
  - *Practical*: Implement an enterprise branching strategy.
- **Chapter 29: Emergency Hotfixes & Secret Scrubbing**
  - *Topics*: Production hotfix workflows, scrubbing leaked API keys and secrets from Git history.
  - *Practical*: Purge a sensitive key from commit history using Git tools.
- **Chapter 30: Open Source Contribution & Ecosystem**
  - *Topics*: GitHub Pages static site hosting, custom domains, Developer Packs, DCO, commit signing.
  - *Practical*: Deploy a static portfolio or documentation website to GitHub Pages (`gh-pages` or `/docs`).

---

## 🏆 Completion Checklist

- [ ] Part 1 Completed (Chapters 1–7: Foundations & Daily Workflow)
- [ ] Part 2 Completed (Chapters 8–14: Branching, Merging & History)
- [ ] Part 3 Completed (Chapters 15–21: Collaboration & Advanced Team Operations)
- [ ] Part 4 Completed (Chapters 22–30: Power Tools, CI/CD & Ecosystem)

---
*Created for the **Microsoft Student Club (MSC PRPCEM)** learning curriculum.*
