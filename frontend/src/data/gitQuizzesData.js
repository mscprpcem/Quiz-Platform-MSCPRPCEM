// Git & GitHub Knowledge Check Quizzes (5 Tiers, 5 Questions Each = 25 Questions)
// Designed for MSC PRPCEM Assessment & Learning Platform

export const GIT_QUIZZES = {
  'tier-1': {
    id: 'tier-1',
    title: 'Level 1: Beginner Knowledge Check',
    subtitle: 'Verify your understanding of version control concepts, staging, and atomic commits.',
    passingScore: 80,
    questions: [
      {
        id: 'q1-1',
        question: 'How does Git internally store version history compared to traditional VCS like Subversion?',
        options: [
          'As a series of file diffs and delta patches',
          'As a stream of complete snapshots with pointers to unchanged blobs',
          'As compressed zip archives stored on a central server',
          'As temporary log records cleared upon repository push'
        ],
        correctAnswer: 1,
        explanation: 'Git models data as a stream of snapshots. When you commit, Git records a snapshot of all files, reusing pointers to unchanged blobs for speed and space efficiency.'
      },
      {
        id: 'q1-2',
        question: 'Which of the following commands stages only modifications to existing tracked files without staging new untracked files?',
        options: [
          'git add .',
          'git add -u',
          'git add -A',
          'git commit -a'
        ],
        correctAnswer: 1,
        explanation: 'The `git add -u` (update) option stages modifications and deletions of tracked files, but ignores newly created untracked files.'
      },
      {
        id: 'q1-3',
        question: 'What happens if you delete the hidden `.git` folder from your project root?',
        options: [
          'Only your remote branches are deleted; local commits are preserved',
          'Git enters a detached HEAD state and prompts for synchronization',
          'The directory ceases to be a Git repository and all commit history is lost',
          'Nothing happens because Git backups are stored in ~/.gitconfig'
        ],
        correctAnswer: 2,
        explanation: 'The `.git` directory contains the entire repository database (objects, refs, HEAD, hooks). Deleting it deletes all local history, reverting the project to an untracked directory.'
      },
      {
        id: 'q1-4',
        question: 'Which command displays what changes are staged for the next commit compared to the latest commit (HEAD)?',
        options: [
          'git diff',
          'git diff --staged',
          'git log --diff',
          'git status --detailed'
        ],
        correctAnswer: 1,
        explanation: '`git diff --staged` (or `git diff --cached`) compares the staging area against HEAD, showing exactly what will be included in the next commit.'
      },
      {
        id: 'q1-5',
        question: 'A developer adds `.env` to `.gitignore`, but `git status` still shows `.env` being tracked. What is the root cause?',
        options: [
          '.gitignore cannot ignore hidden dotfiles',
          'The .env file was already tracked in a previous commit and must be unstaged via `git rm --cached`',
          'The file needs to have chmod 600 permissions',
          '.gitignore must be committed before it takes effect on any file'
        ],
        correctAnswer: 1,
        explanation: '`.gitignore` only ignores untracked files. If a file was already committed, Git continues tracking it until you explicitly untrack it using `git rm --cached <file>`.'
      }
    ]
  },
  'tier-2': {
    id: 'tier-2',
    title: 'Level 2: Intermediate Knowledge Check',
    subtitle: 'Test your grasp of branch pointers, 3-way merges, rebasing, and conflict resolution.',
    passingScore: 80,
    questions: [
      {
        id: 'q2-1',
        question: 'Under the hood, what is a Git branch?',
        options: [
          'A full duplicate directory of the repository files',
          'A 41-byte text file containing a 40-character SHA-1 commit hash',
          'A database table index stored on GitHub servers',
          'A symbolic link pointing to the working directory'
        ],
        correctAnswer: 1,
        explanation: 'A Git branch is a lightweight movable pointer to a commit, represented as a 41-byte file under `.git/refs/heads/<branch>` containing a SHA-1 hash.'
      },
      {
        id: 'q2-2',
        question: 'Under what condition does Git perform a Fast-Forward merge?',
        options: [
          'Whenever the `--no-ff` flag is explicitly provided',
          'When the target branch has received multiple commits since the feature branched',
          'When no new commits were added to the receiving branch since the feature branch diverged',
          'When both branches have matching commit messages'
        ],
        correctAnswer: 2,
        explanation: 'A fast-forward merge occurs when there is a direct linear path from the tip of the receiving branch to the tip of the incoming branch, simply moving the branch pointer forward.'
      },
      {
        id: 'q2-3',
        question: 'What is the "Golden Rule of Rebasing"?',
        options: [
          'Never rebase commits that have already been pushed to a public or shared branch',
          'Always rebase main into your feature branch before every commit',
          'Only rebase when there are more than 10 commits',
          'Never rebase branches with merge conflicts'
        ],
        correctAnswer: 0,
        explanation: 'Rebasing rewinds and recreates new commit hashes. Rebasing a shared public branch causes divergence and conflicts for teammates who based work on the original commit hashes.'
      },
      {
        id: 'q2-4',
        question: 'Which `git reset` mode moves the HEAD pointer backward while leaving your files modified and unstaged in your working directory?',
        options: [
          'git reset --soft',
          'git reset --mixed',
          'git reset --hard',
          'git reset --keep'
        ],
        correctAnswer: 1,
        explanation: '`git reset --mixed` (the default) moves HEAD backward and unstages changes, but leaves your files intact in the working directory so you don\'t lose work.'
      },
      {
        id: 'q2-5',
        question: 'In a merge conflict, what does the content between `<<<<<<< HEAD` and `=======` represent?',
        options: [
          'The incoming changes from the branch being merged in',
          'The changes existing on your currently checked-out branch',
          'The common ancestor code before any modifications',
          'The resolved version proposed by Git\'s merge engine'
        ],
        correctAnswer: 1,
        explanation: '`<<<<<<< HEAD` indicates the version of the conflicting lines on the currently checked-out branch, while the section below `=======` contains the incoming branch version.'
      }
    ]
  },
  'tier-3': {
    id: 'tier-3',
    title: 'Level 3: GitHub & Collaboration Knowledge Check',
    subtitle: 'Verify your proficiency with remotes, upstream synchronization, forks, and pull requests.',
    passingScore: 80,
    questions: [
      {
        id: 'q3-1',
        question: 'Why is `git fetch` generally safer than `git pull` during active local development?',
        options: [
          'git fetch encrypts remote changes before downloading',
          'git fetch downloads commits to remote-tracking branches without modifying your working tree or merging',
          'git pull permanently deletes local stashes',
          'git fetch automatically resolves all merge conflicts'
        ],
        correctAnswer: 1,
        explanation: '`git fetch` only updates your remote tracking branches (`origin/main`). It allows you to inspect incoming changes with `git log` or `git diff` before deciding to merge.'
      },
      {
        id: 'q3-2',
        question: 'What does the `-u` flag do in `git push -u origin feature/login`?',
        options: [
          'Performs an urgent force push bypassing branch protection',
          'Establishes an upstream tracking reference between local and remote branches',
          'Uploads uncommitted changes directly to GitHub',
          'Updates the author username to match GitHub credentials'
        ],
        correctAnswer: 1,
        explanation: 'The `-u` (or `--set-upstream`) flag links the local branch to the remote branch so that future `git push` and `git pull` commands work without specifying origin and branch.'
      },
      {
        id: 'q3-3',
        question: 'In an open-source contribution workflow, what is the standard purpose of the `upstream` remote?',
        options: [
          'It points to your personal fork on GitHub',
          'It points to the original canonical repository from which your fork was created',
          'It is a local backup mirror stored in another directory',
          'It defines the CI/CD deployment server endpoint'
        ],
        correctAnswer: 1,
        explanation: 'In open-source fork-and-pull workflows, `origin` points to your personal fork, while `upstream` points to the canonical parent repository, allowing you to fetch and stay updated.'
      },
      {
        id: 'q3-4',
        question: 'Which keyword in a Pull Request description will automatically close issue #45 when merged into the default branch?',
        options: [
          'References #45',
          'Closes #45',
          'Linked to #45',
          'Review #45'
        ],
        correctAnswer: 1,
        explanation: 'GitHub automatically closes issues when PRs containing keywords like `Closes #45`, `Fixes #45`, or `Resolves #45` are merged into the repository default branch.'
      },
      {
        id: 'q3-5',
        question: 'What is the recommended practice for Pull Request size in modern engineering teams?',
        options: [
          'Bundle 2-3 months of features into a single 2,000+ line PR to reduce notification spam',
          'Keep PRs small and focused (under 200-400 lines) to facilitate rapid, thorough code reviews',
          'Never submit PRs with unit tests included',
          'Always squash all historical commits of the entire team into one commit'
        ],
        correctAnswer: 1,
        explanation: 'Small, single-responsibility PRs get reviewed faster, have fewer merge conflicts, and are substantially easier to audit for bugs and regressions.'
      }
    ]
  },
  'tier-4': {
    id: 'tier-4',
    title: 'Level 4: Advanced Tools & Automation Knowledge Check',
    subtitle: 'Evaluate your mastery of interactive rebase, reflog recovery, bisect, and GitHub Actions.',
    passingScore: 80,
    questions: [
      {
        id: 'q4-1',
        question: 'During `git rebase -i`, what is the difference between `squash` and `fixup`?',
        options: [
          'squash deletes the commit; fixup renames it',
          'squash combines the commit into the previous one and keeps its message; fixup combines it but discards its commit message',
          'fixup requires admin approval on GitHub; squash runs locally',
          'There is no difference; they are aliases'
        ],
        correctAnswer: 1,
        explanation: 'Both `squash` and `fixup` meld the commit into the parent commit above it, but `squash` prompts you to concatenate commit messages while `fixup` discards the commit\'s message.'
      },
      {
        id: 'q4-2',
        question: 'You accidentally ran `git reset --hard HEAD~3` and erased recent commits. Which tool can locate the commit hashes to restore your work?',
        options: [
          'git status -v',
          'git reflog',
          'git fsck --clean',
          'git diff --lost-found'
        ],
        correctAnswer: 1,
        explanation: '`git reflog` logs every single position `HEAD` has occupied in your local repository over the past 90 days, allowing you to find lost commit hashes and reset back to them.'
      },
      {
        id: 'q4-3',
        question: 'What algorithm does `git bisect` use to pinpoint the exact commit that introduced a regression?',
        options: [
          'Linear Scan ($O(n)$)',
          'Binary Search ($O(\\log n)$)',
          'Depth-First Search ($O(V + E)$)',
          'Random sampling'
        ],
        correctAnswer: 1,
        explanation: '`git bisect` uses binary search ($O(\\log n)$) across commit history, halving the suspect commits at each step until the breaking commit is identified.'
      },
      {
        id: 'q4-4',
        question: 'According to Semantic Versioning (SemVer), which version component must be incremented when introducing breaking API changes?',
        options: [
          'PATCH (v1.0.1 -> v1.0.2)',
          'MINOR (v1.1.0 -> v1.2.0)',
          'MAJOR (v1.0.0 -> v2.0.0)',
          'BUILD (v1.0.0+build1)'
        ],
        correctAnswer: 2,
        explanation: 'SemVer specifies MAJOR for incompatible API changes, MINOR for backwards-compatible additions, and PATCH for backwards-compatible bug fixes.'
      },
      {
        id: 'q4-5',
        question: 'Where must GitHub Actions workflow definition files be placed in a repository?',
        options: [
          '.github/actions/*.yaml',
          '.github/workflows/*.yml',
          'ci/pipelines/*.json',
          '.git/hooks/pre-push'
        ],
        correctAnswer: 1,
        explanation: 'GitHub Actions parses workflows from YAML files stored in the `.github/workflows/` directory in the repository root.'
      }
    ]
  },
  'tier-5': {
    id: 'tier-5',
    title: 'Level 5: Real-World Scenarios Knowledge Check',
    subtitle: 'Demonstrate leadership in incident recovery, secret scrubbing, and branching strategies.',
    passingScore: 80,
    questions: [
      {
        id: 'q5-1',
        question: 'An engineer accidentally committed and pushed an AWS production secret access key to a public GitHub repository. What is the immediate first action?',
        options: [
          'Commit a new .gitignore file ignoring .env',
          'Run `git rm .env` and push a commit',
          'Immediately revoke and invalidate the secret access key in the AWS management console',
          'Delete the GitHub repository and recreate it'
        ],
        correctAnswer: 2,
        explanation: 'Automated crawlers scrape public commits in seconds. The moment a credential is pushed, assume it has been compromised and revoke the credential immediately before cleaning history.'
      },
      {
        id: 'q5-2',
        question: 'Why is `git rm secret.txt` followed by `git commit` insufficient to remediate an exposed password in a repository?',
        options: [
          'GitHub does not permit files named secret.txt',
          'The secret remains fully visible in the commit history for any user who clones or inspects previous commits',
          'git rm only deletes files locally on disk',
          'The file will automatically resurrect on the next git pull'
        ],
        correctAnswer: 1,
        explanation: 'Git stores immutable snapshots. Removing a file in a new commit only deletes it from the newest snapshot; the secret remains in all preceding historical commits until scrubbed with `git-filter-repo`.'
      },
      {
        id: 'q5-3',
        question: 'Which branching philosophy advocates for short-lived branches (1-2 days) merged directly into main with feature flags?',
        options: [
          'GitFlow',
          'Trunk-Based Development',
          'Subversion Waterfall Branching',
          'Release-Train Branching'
        ],
        correctAnswer: 1,
        explanation: 'Trunk-Based Development minimizes long-lived branch divergence by having developers integrate small batches into `main` daily, using feature flags to protect unfinished features.'
      },
      {
        id: 'q5-4',
        question: 'You are in the middle of a complex merge that has resulted in dozens of unexpected conflict markers. How do you cleanly abort and return to the pre-merge state?',
        options: [
          'git reset --hard origin/main',
          'git merge --abort',
          'git stash clear',
          'git checkout --force'
        ],
        correctAnswer: 1,
        explanation: '`git merge --abort` immediately restores the repository to the exact working state and commit position before the merge operation was initiated.'
      },
      {
        id: 'q5-5',
        question: 'What is the purpose of signing commits with a GPG or SSH key (`git commit -S`)?',
        options: [
          'It encrypts repository files so only authorized users can read them',
          'It cryptographically certifies that the commit genuinely originated from the specified author, earning the "Verified" badge',
          'It compresses commits to save bandwidth during push operations',
          'It allows pushing without requiring GitHub Personal Access Tokens'
        ],
        correctAnswer: 1,
        explanation: 'Because anyone can set any name and email in `git config`, cryptographic commit signing (`-S`) proves authorship using public key cryptography, resulting in GitHub\'s "Verified" badge.'
      }
    ]
  }
};
