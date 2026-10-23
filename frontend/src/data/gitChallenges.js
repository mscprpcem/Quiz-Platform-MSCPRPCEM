// Git Interactive Practice Challenges (20+ Hands-on Labs)
// Designed for MSC PRPCEM Assessment & Learning Platform

export const GIT_CHALLENGES = [
  // ═══════════════════════════════════════════════════════
  // LEVEL 1: BEGINNER & FOUNDATIONS
  // ═══════════════════════════════════════════════════════
  {
    id: 'git-init-first-commit',
    title: 'Initialize a Repo & Create First Commit',
    track: 'basics',
    difficulty: 'Beginner',
    category: 'Foundations',
    scenario: 'You are starting a brand new project for Microsoft Student Club. Initialize a Git repository, create a README.md file, stage it, and commit it with a descriptive message.',
    initialState: {
      isRepo: false,
      files: {
        'README.md': '# MSC PRPCEM Quiz Platform\nOfficial repository for student technical assessments.\n'
      },
      currentBranch: 'main'
    },
    validation: (repo) => {
      if (!repo.isInitialized()) {
        return { passed: false, message: 'Repository is not initialized. Run `git init`.' };
      }
      if (repo.getHeadBranch() !== 'main' && repo.getHeadBranch() !== 'master') {
        return { passed: false, message: 'HEAD should be on main or master branch.' };
      }
      const commits = repo.getCommitHistory();
      if (commits.length === 0) {
        return { passed: false, message: 'No commits found. Stage README.md and commit it.' };
      }
      const latest = repo.getLatestCommit();
      if (!latest.files || !latest.files['README.md']) {
        return { passed: false, message: 'README.md is missing from the latest commit.' };
      }
      if (!repo.isWorkingTreeClean() || !repo.isIndexClean()) {
        return { passed: false, message: 'All changes should be committed. Your working directory or staging area is not clean.' };
      }
      return { passed: true, message: '🎉 Excellent! You initialized the repository and recorded your first atomic snapshot.' };
    },
    hints: [
      'Type `git init` to initialize the repository.',
      'Check `git status` to see README.md in untracked files.',
      'Stage the file using `git add README.md` or `git add .`.',
      'Record your snapshot using `git commit -m "Initial commit"`.'
    ]
  },
  {
    id: 'git-staging-workflow',
    title: 'Selective Staging Area Workflow',
    track: 'basics',
    difficulty: 'Beginner',
    category: 'Foundations',
    scenario: 'You modified index.html, styles.css, and created draft.txt. Your goal is to stage and commit ONLY index.html and styles.css as part of a clean atomic commit, leaving draft.txt uncommitted.',
    initialState: {
      isRepo: true,
      commits: [
        { message: 'Initial commit', files: { 'index.html': '<h1>Home</h1>\n', 'styles.css': 'body { margin: 0; }\n' } }
      ],
      files: {
        'index.html': '<h1>Home</h1>\n<nav><a href="/about">About</a></nav>\n',
        'styles.css': 'body { margin: 0; background: #f0f4f8; }\n',
        'draft.txt': 'Notes for next week meeting.\n'
      },
      currentBranch: 'main'
    },
    validation: (repo) => {
      const commits = repo.getCommitHistory();
      if (commits.length < 2) {
        return { passed: false, message: 'Create a new commit containing your staged changes.' };
      }
      const latest = repo.getLatestCommit();
      if (!latest.files['index.html'] || !latest.files['styles.css']) {
        return { passed: false, message: 'The commit must include updated index.html and styles.css.' };
      }
      if (latest.files['draft.txt']) {
        return { passed: false, message: 'draft.txt was accidentally committed! Remember: atomic commits should only include relevant files.' };
      }
      return { passed: true, message: '🎯 Perfect! You practiced selective staging with git add.' };
    },
    hints: [
      'Run `git status` to inspect all 3 modified and untracked files.',
      'Use `git add index.html styles.css` to stage only the web styling files.',
      'Run `git commit -m "feat: add navigation and background styles"`.'
    ]
  },
  {
    id: 'gitignore-secrets',
    title: 'Safeguarding Secrets with .gitignore',
    track: 'basics',
    difficulty: 'Beginner',
    category: 'Security',
    scenario: 'Your project has an environment file containing an API key (.env) and a node_modules folder. Create a .gitignore file to ignore them and commit your .gitignore.',
    initialState: {
      isRepo: true,
      commits: [
        { message: 'Initial commit', files: { 'package.json': '{\n  "name": "quiz-app"\n}\n' } }
      ],
      files: {
        'package.json': '{\n  "name": "quiz-app"\n}\n',
        '.env': 'AZURE_SECRET_KEY=secret_12345\nDB_PASS=admin\n',
        'node_modules/express.js': '// express package\n'
      },
      currentBranch: 'main'
    },
    validation: (repo) => {
      const gitignore = repo.readFile('.gitignore');
      if (!gitignore) {
        return { passed: false, message: 'A .gitignore file must exist in the root directory.' };
      }
      if (!gitignore.includes('.env')) {
        return { passed: false, message: '.gitignore must contain an entry for .env.' };
      }
      if (!gitignore.includes('node_modules')) {
        return { passed: false, message: '.gitignore must contain an entry for node_modules/.' };
      }
      const latest = repo.getLatestCommit();
      if (!latest.files['.gitignore']) {
        return { passed: false, message: 'You must stage and commit .gitignore.' };
      }
      if (latest.files['.env']) {
        return { passed: false, message: '.env was committed to the repository! Secrets must never be committed.' };
      }
      return { passed: true, message: '🛡️ Fantastic! You protected sensitive credentials with .gitignore.' };
    },
    hints: [
      'Create .gitignore with: `echo ".env" > .gitignore` and `echo "node_modules/" >> .gitignore`.',
      'Check `git status` to verify .env is now ignored.',
      'Stage and commit: `git add .gitignore` and `git commit -m "chore: add .gitignore"`.'
    ]
  },
  {
    id: 'git-status-log-inspection',
    title: 'Navigating Repository History with git log',
    track: 'basics',
    difficulty: 'Beginner',
    category: 'Inspection',
    scenario: 'A bug was reported. Inspect the commit history, identify the bad commit message, and make a new commit documenting the fix in changelog.txt.',
    initialState: {
      isRepo: true,
      commits: [
        { message: 'Initial commit', files: { 'app.js': 'console.log("App loaded");\n' } },
        { message: 'fix: update port configuration', files: { 'app.js': 'const PORT = 5000;\n' } },
        { message: 'refactor: broken database query', files: { 'app.js': 'const PORT = 5000;\n// bug here\n' } }
      ],
      files: {
        'app.js': 'const PORT = 5000;\n// bug here\n'
      },
      currentBranch: 'main'
    },
    validation: (repo) => {
      const changelog = repo.readFile('changelog.txt');
      if (!changelog) {
        return { passed: false, message: 'changelog.txt must be created and committed.' };
      }
      const commits = repo.getCommitHistory();
      if (commits.length < 4) {
        return { passed: false, message: 'Commit your new changelog.txt file.' };
      }
      return { passed: true, message: '📜 Nice job inspecting logs and documenting changes!' };
    },
    hints: [
      'Run `git log --oneline` to view all recent commits.',
      'Create changelog.txt with: `echo "Identified bug in broken database query" > changelog.txt`.',
      'Stage and commit: `git add changelog.txt` and `git commit -m "docs: add changelog"`.'
    ]
  },

  // ═══════════════════════════════════════════════════════
  // LEVEL 2: INTERMEDIATE (BRANCHING, MERGING & CONFLICTS)
  // ═══════════════════════════════════════════════════════
  {
    id: 'git-branch-create-switch',
    title: 'Create and Switch to a Feature Branch',
    track: 'branching',
    difficulty: 'Intermediate',
    category: 'Branching',
    scenario: 'The development team requires all new features to be built on dedicated branches. Create a new branch called "feature/auth", switch to it, create auth.js, and commit it on that branch.',
    initialState: {
      isRepo: true,
      commits: [
        { message: 'Initial commit', files: { 'server.js': 'console.log("Server starting");\n' } }
      ],
      files: {
        'server.js': 'console.log("Server starting");\n'
      },
      currentBranch: 'main'
    },
    validation: (repo) => {
      if (repo.getHeadBranch() !== 'feature/auth') {
        return { passed: false, message: 'HEAD must point to the "feature/auth" branch.' };
      }
      const latest = repo.getLatestCommit();
      if (!latest.files['auth.js']) {
        return { passed: false, message: 'auth.js must be created and committed on the "feature/auth" branch.' };
      }
      if (repo.getBranchCommit('main') === repo.getBranchCommit('feature/auth')) {
        return { passed: false, message: 'The feature/auth branch should have new commits not yet on main.' };
      }
      return { passed: true, message: '🌿 Well done! You created, switched, and committed on a feature branch.' };
    },
    hints: [
      'Create and switch in one command: `git switch -c feature/auth` (or `git checkout -b feature/auth`).',
      'Create the file: `echo "export const auth = () => {};" > auth.js`.',
      'Stage and commit: `git add auth.js` and `git commit -m "feat: add auth module"`.'
    ]
  },
  {
    id: 'git-fast-forward-merge',
    title: 'Execute a Fast-Forward Merge',
    track: 'branching',
    difficulty: 'Intermediate',
    category: 'Merging',
    scenario: 'A teammate completed the "feature/cart" branch. The main branch has not had any new commits. Switch to main and merge feature/cart using a fast-forward merge.',
    initialState: {
      isRepo: true,
      branches: {
        main: {
          commits: [
            { id: 'c1', message: 'Initial commit', files: { 'index.html': '<h1>Shop</h1>\n' } }
          ]
        },
        'feature/cart': {
          baseCommit: 0,
          commits: [
            { id: 'c2', message: 'feat: add cart component', files: { 'cart.js': 'export const cart = [];\n' } }
          ]
        }
      },
      currentBranch: 'feature/cart'
    },
    validation: (repo) => {
      if (repo.getHeadBranch() !== 'main') {
        return { passed: false, message: 'You must switch to the "main" branch before merging.' };
      }
      const mainCommit = repo.getBranchCommit('main');
      const cartCommit = repo.getBranchCommit('feature/cart');
      if (mainCommit !== cartCommit) {
        return { passed: false, message: 'main has not been merged with feature/cart.' };
      }
      const latest = repo.getLatestCommit();
      if (!latest.files['cart.js']) {
        return { passed: false, message: 'cart.js is not present in main after merge.' };
      }
      return { passed: true, message: '⚡ Great work! You executed a clean Fast-Forward merge.' };
    },
    hints: [
      'First switch to main: `git switch main`.',
      'Run the merge command: `git merge feature/cart`.',
      'Check `git log --oneline` to verify main pointer advanced to the tip of feature/cart.'
    ]
  },
  {
    id: 'git-three-way-merge',
    title: 'Execute a 3-Way Merge (Merge Commit)',
    track: 'branching',
    difficulty: 'Intermediate',
    category: 'Merging',
    scenario: 'Both main and feature/contact have diverged with separate independent commits. Merge feature/contact into main, creating a true 3-way merge commit.',
    initialState: {
      isRepo: true,
      branches: {
        main: {
          commits: [
            { id: 'c1', message: 'Initial commit', files: { 'index.html': '<h1>Welcome</h1>\n' } },
            { id: 'c2', message: 'feat: add footer on main', files: { 'footer.html': '<footer>MSC 2026</footer>\n' } }
          ]
        },
        'feature/contact': {
          baseCommit: 0,
          commits: [
            { id: 'c3', message: 'feat: add contact page', files: { 'contact.html': '<form>Contact us</form>\n' } }
          ]
        }
      },
      currentBranch: 'main'
    },
    validation: (repo) => {
      if (repo.getHeadBranch() !== 'main') {
        return { passed: false, message: 'You must be on the "main" branch.' };
      }
      const latest = repo.getLatestCommit();
      if (!latest.parentIds || latest.parentIds.length < 2) {
        return { passed: false, message: 'The latest commit on main must be a merge commit with 2 parents.' };
      }
      if (!latest.files['contact.html'] || !latest.files['footer.html']) {
        return { passed: false, message: 'The merge commit must contain both footer.html and contact.html.' };
      }
      return { passed: true, message: '🔀 Awesome! You performed a 3-way merge with two parent commits.' };
    },
    hints: [
      'Ensure you are on main: `git switch main`.',
      'Run `git merge feature/contact`.',
      'Git will automatically combine non-overlapping files and generate a merge commit.'
    ]
  },
  {
    id: 'git-branch-merge-conflict',
    title: 'Resolve a Merge Conflict on Main',
    track: 'branching',
    difficulty: 'Intermediate',
    category: 'Merge Conflicts',
    scenario: 'Both main and feature/redesign modified header.html differently. Merge feature/redesign into main, resolve the conflict cleanly by removing conflict markers, stage, and commit.',
    initialState: {
      isRepo: true,
      branches: {
        main: {
          commits: [
            { id: 'c1', message: 'Initial commit', files: { 'README.md': '# Project\n' } },
            { id: 'c2', message: 'Update header on main', files: { 'header.html': '<h1>Welcome to MSC v2.0</h1>\n' } }
          ]
        },
        'feature/redesign': {
          baseCommit: 0,
          commits: [
            { id: 'c3', message: 'Update header redesign', files: { 'header.html': '<h1>Welcome to MSC Redesign</h1>\n' } }
          ]
        }
      },
      currentBranch: 'main'
    },
    validation: (repo) => {
      if (repo.getHeadBranch() !== 'main') {
        return { passed: false, message: 'HEAD must point to the "main" branch.' };
      }
      if (!repo.isWorkingTreeClean() || !repo.isIndexClean()) {
        return { passed: false, message: 'Stage and commit your resolved files. Working tree or index is dirty.' };
      }
      const headerContent = repo.readFile('header.html');
      if (!headerContent) {
        return { passed: false, message: 'header.html must exist.' };
      }
      if (headerContent.includes('<<<<<<<') || headerContent.includes('=======') || headerContent.includes('>>>>>>>')) {
        return { passed: false, message: 'Conflict markers (<<<<<<<, =======, >>>>>>>) remain in header.html! Remove them.' };
      }
      const latest = repo.getLatestCommit();
      if (!latest.parentIds || latest.parentIds.length < 2) {
        return { passed: false, message: 'Complete the merge commit by running `git commit`.' };
      }
      return { passed: true, message: '⚔️ Victorious! You successfully resolved a merge conflict like a pro.' };
    },
    hints: [
      'Run `git merge feature/redesign` to initiate the merge and trigger conflict.',
      'Inspect the conflict with `cat header.html`.',
      'Write the resolved content using `echo "<h1>Welcome to MSC PRPCEM</h1>" > header.html`.',
      'Stage the resolved file: `git add header.html`.',
      'Finalize the merge: `git commit -m "Merge and resolve header conflict"`.'
    ]
  },
  {
    id: 'git-stash-workflow',
    title: 'Context Switching with git stash',
    track: 'branching',
    difficulty: 'Intermediate',
    category: 'Stashing',
    scenario: 'You are working on experimental changes in search.js on main, but an urgent bug requires your working directory to be clean. Stash your changes, verify status is clean, then re-apply them with stash pop.',
    initialState: {
      isRepo: true,
      commits: [
        { message: 'Initial commit', files: { 'search.js': '// basic search\n' } }
      ],
      files: {
        'search.js': '// basic search\n// In-progress experimental AI search\nconst query = "azure";\n'
      },
      currentBranch: 'main'
    },
    validation: (repo) => {
      const searchContent = repo.readFile('search.js');
      if (!searchContent || !searchContent.includes('experimental AI search')) {
        return { passed: false, message: 'The experimental changes in search.js must be present (popped back from stash).' };
      }
      const stashList = repo.getStashList();
      if (stashList.length > 0) {
        return { passed: false, message: 'You stashed changes, but did not pop them! Use `git stash pop`.' };
      }
      return { passed: true, message: '📦 Excellent! You stashed your work and popped it back cleanly.' };
    },
    hints: [
      'Save changes to stash: `git stash` (or `git stash save`).',
      'Check status: `git status` (should be clean).',
      'Restore your stashed changes: `git stash pop`.'
    ]
  },
  {
    id: 'git-reset-mixed',
    title: 'Undo the Last Commit with git reset',
    track: 'branching',
    difficulty: 'Intermediate',
    category: 'Undoing',
    scenario: 'You accidentally committed a WIP message with unfinished code. Undo the last commit using a mixed reset so that the code remains in your working directory unstaged.',
    initialState: {
      isRepo: true,
      commits: [
        { message: 'feat: setup database schema', files: { 'schema.sql': 'CREATE TABLE users (id INT);\n' } },
        { message: 'wip: half-broken query', files: { 'schema.sql': 'CREATE TABLE users (id INT);\n-- broken\n' } }
      ],
      files: {
        'schema.sql': 'CREATE TABLE users (id INT);\n-- broken\n'
      },
      currentBranch: 'main'
    },
    validation: (repo) => {
      const commits = repo.getCommitHistory();
      if (commits.length !== 1) {
        return { passed: false, message: 'The last commit must be undone so only 1 commit remains in history.' };
      }
      const fileContent = repo.readFile('schema.sql');
      if (!fileContent || !fileContent.includes('-- broken')) {
        return { passed: false, message: 'The working directory changes should NOT be erased. Use `--mixed` or soft reset.' };
      }
      if (repo.isIndexClean() === false) {
        // If staged, it was soft reset. Requirement specified mixed (unstaged)
        return { passed: false, message: 'Changes should be unstaged in the working directory (mixed reset).' };
      }
      return { passed: true, message: '⏪ Masterful! You rewound the commit while safely preserving your work.' };
    },
    hints: [
      'Run `git reset --mixed HEAD~1` (or simply `git reset HEAD~1`).',
      'Run `git status` to verify the commit is gone and schema.sql is now unstaged.'
    ]
  },
  {
    id: 'git-cherry-pick',
    title: 'Cherry-Pick an Isolated Bugfix',
    track: 'branching',
    difficulty: 'Intermediate',
    category: 'History',
    scenario: 'A critical security fix was committed on the experimental branch (commit "fix: patch auth vulnerability"). Cherry-pick that specific commit onto main without merging the rest of experimental.',
    initialState: {
      isRepo: true,
      branches: {
        main: {
          commits: [
            { id: 'c101', message: 'Initial commit', files: { 'app.js': 'const app = {};\n' } }
          ]
        },
        experimental: {
          baseCommit: 0,
          commits: [
            { id: 'c102', message: 'feat: add experimental VR UI', files: { 'vr.js': '// VR\n' } },
            { id: 'c103', message: 'fix: patch auth vulnerability', files: { 'patch.txt': 'AUTH_PATCH_APPLIED\n' } }
          ]
        }
      },
      currentBranch: 'main'
    },
    validation: (repo) => {
      if (repo.getHeadBranch() !== 'main') {
        return { passed: false, message: 'You must be on the "main" branch.' };
      }
      const latest = repo.getLatestCommit();
      if (!latest.files['patch.txt']) {
        return { passed: false, message: 'patch.txt must exist on main from the cherry-picked commit.' };
      }
      if (latest.files['vr.js']) {
        return { passed: false, message: 'vr.js was brought over! Do not merge the whole branch; only cherry-pick commit c103.' };
      }
      return { passed: true, message: '🍒 Spectacular! You cherry-picked the exact bugfix commit.' };
    },
    hints: [
      'Inspect commits on experimental: `git log experimental --oneline`.',
      'Ensure you are on main: `git switch main`.',
      'Run `git cherry-pick c103`.'
    ]
  },
  {
    id: 'git-revert-commit',
    title: 'Safe Collaborative Reverting with git revert',
    track: 'branching',
    difficulty: 'Intermediate',
    category: 'Undoing',
    scenario: 'Commit c202 introduced a regression in production that broke payments. Revert commit c202 safely using git revert, preserving history.',
    initialState: {
      isRepo: true,
      commits: [
        { id: 'c201', message: 'Initial stable commit', files: { 'payments.js': 'function pay() { return true; }\n' } },
        { id: 'c202', message: 'feat: broken payments update', files: { 'payments.js': 'function pay() { throw new Error("broken"); }\n' } }
      ],
      files: {
        'payments.js': 'function pay() { throw new Error("broken"); }\n'
      },
      currentBranch: 'main'
    },
    validation: (repo) => {
      const commits = repo.getCommitHistory();
      if (commits.length < 3) {
        return { passed: false, message: 'A new revert commit must be added to history (git revert creates a commit).' };
      }
      const latest = repo.getLatestCommit();
      if (!latest.message.toLowerCase().includes('revert')) {
        return { passed: false, message: 'The latest commit should be a revert commit.' };
      }
      const paymentCode = repo.readFile('payments.js');
      if (paymentCode.includes('broken')) {
        return { passed: false, message: 'payments.js still contains the broken error.' };
      }
      return { passed: true, message: '🛡️ Safe & sound! You reverted the faulty commit without rewriting public history.' };
    },
    hints: [
      'Check history: `git log --oneline`.',
      'Run `git revert c202` (or `git revert HEAD`).'
    ]
  },

  // ═══════════════════════════════════════════════════════
  // LEVEL 3: GITHUB & REMOTES
  // ═══════════════════════════════════════════════════════
  {
    id: 'git-remote-add',
    title: 'Connect Local Repo to Remote Origin',
    track: 'remotes',
    difficulty: 'Intermediate',
    category: 'Remotes',
    scenario: 'Your project currently has no remote server configured. Add a remote named "origin" pointing to "https://github.com/mscprpcem/quiz-platform.git" and verify with git remote -v.',
    initialState: {
      isRepo: true,
      commits: [
        { message: 'Initial commit', files: { 'README.md': '# Quiz Platform\n' } }
      ],
      files: {
        'README.md': '# Quiz Platform\n'
      },
      remotes: {},
      currentBranch: 'main'
    },
    validation: (repo) => {
      const remotes = repo.getRemotes();
      if (!remotes['origin']) {
        return { passed: false, message: 'A remote named "origin" must be configured.' };
      }
      if (!remotes['origin'].url.includes('mscprpcem/quiz-platform.git')) {
        return { passed: false, message: 'Remote origin URL must match https://github.com/mscprpcem/quiz-platform.git' };
      }
      return { passed: true, message: '🌐 Connected! You configured your remote repository origin.' };
    },
    hints: [
      'Run `git remote add origin https://github.com/mscprpcem/quiz-platform.git`.',
      'Run `git remote -v` to confirm the configuration.'
    ]
  },
  {
    id: 'git-push-origin',
    title: 'Push Commits and Set Upstream Tracking',
    track: 'remotes',
    difficulty: 'Intermediate',
    category: 'Remotes',
    scenario: 'You committed a new feature locally. Push the "feature/profile" branch to remote "origin" and set upstream tracking with the -u flag.',
    initialState: {
      isRepo: true,
      remotes: {
        origin: { url: 'https://github.com/mscprpcem/quiz-platform.git', branches: {} }
      },
      branches: {
        main: {
          commits: [{ id: 'p1', message: 'Initial commit', files: { 'README.md': '# Readme\n' } }]
        },
        'feature/profile': {
          baseCommit: 0,
          commits: [{ id: 'p2', message: 'feat: user profile page', files: { 'profile.html': '<h1>Profile</h1>\n' } }]
        }
      },
      currentBranch: 'feature/profile'
    },
    validation: (repo) => {
      const remoteBranchCommit = repo.getRemoteBranchCommit('origin', 'feature/profile');
      if (!remoteBranchCommit) {
        return { passed: false, message: 'feature/profile has not been pushed to origin.' };
      }
      const localCommit = repo.getBranchCommit('feature/profile');
      if (remoteBranchCommit !== localCommit) {
        return { passed: false, message: 'Remote origin/feature/profile does not match local tip commit.' };
      }
      return { passed: true, message: '🚀 Lift off! Your branch and commits are safely published to the remote origin.' };
    },
    hints: [
      'Ensure you are on the branch: `git switch feature/profile`.',
      'Push with upstream flag: `git push -u origin feature/profile`.'
    ]
  },
  {
    id: 'git-fetch-inspect',
    title: 'Fetch Remote Changes Without Merging',
    track: 'remotes',
    difficulty: 'Intermediate',
    category: 'Remotes',
    scenario: 'Your teammate pushed a new commit to origin/main. Safely download the latest remote commits using git fetch without altering your local working directory or branch.',
    initialState: {
      isRepo: true,
      remotes: {
        origin: {
          url: 'https://github.com/mscprpcem/quiz-platform.git',
          branches: {
            main: 'f202'
          }
        }
      },
      branches: {
        main: {
          commits: [
            { id: 'f201', message: 'Initial commit', files: { 'README.md': '# App\n' } }
          ]
        }
      },
      remoteCommits: {
        f202: { id: 'f202', message: 'feat: teammate added azure api', files: { 'azure.js': '// azure\n' } }
      },
      currentBranch: 'main'
    },
    validation: (repo) => {
      const fetchedCommit = repo.getRemoteBranchCommit('origin', 'main');
      if (fetchedCommit !== 'f202') {
        return { passed: false, message: 'Run `git fetch origin` to download remote tracking references.' };
      }
      if (repo.getBranchCommit('main') === 'f202') {
        return { passed: false, message: 'Local main was merged! The goal was to only fetch without merging.' };
      }
      return { passed: true, message: '🔍 Pristine! You inspected remote tracking branches without mutating local state.' };
    },
    hints: [
      'Run `git fetch origin`.',
      'Inspect what was downloaded using `git log origin/main --oneline`.'
    ]
  },

  // ═══════════════════════════════════════════════════════
  // LEVEL 4: ADVANCED TOOLS & AUTOMATION
  // ═══════════════════════════════════════════════════════
  {
    id: 'git-tag-release',
    title: 'Tag an Official SemVer Release',
    track: 'advanced',
    difficulty: 'Advanced',
    category: 'Tagging',
    scenario: 'Your application has passed all security audits and QA tests. Create an annotated tag named "v1.0.0" with the release message "Production Release v1.0.0".',
    initialState: {
      isRepo: true,
      commits: [
        { id: 'rel1', message: 'feat: completed core quiz platform', files: { 'app.js': 'const ready = true;\n' } }
      ],
      tags: {},
      currentBranch: 'main'
    },
    validation: (repo) => {
      const tags = repo.getTags();
      if (!tags['v1.0.0']) {
        return { passed: false, message: 'Tag "v1.0.0" has not been created.' };
      }
      const tagObj = tags['v1.0.0'];
      if (!tagObj.annotated) {
        return { passed: false, message: 'Use an annotated tag with the `-a` and `-m` flags.' };
      }
      return { passed: true, message: '🏷️ Milestone achieved! You marked an immutable production release tag.' };
    },
    hints: [
      'Create the annotated tag: `git tag -a v1.0.0 -m "Production Release v1.0.0"`.',
      'Verify with `git tag` and `git show v1.0.0`.'
    ]
  },
  {
    id: 'git-reflog-recovery',
    title: 'Disaster Recovery: Restore Lost Commit via Reflog',
    track: 'advanced',
    difficulty: 'Advanced',
    category: 'Recovery',
    scenario: 'An accidental `git reset --hard` destroyed the last commit containing database.js! Use git reflog to locate the lost commit hash and reset back to it.',
    initialState: {
      isRepo: true,
      commits: [
        { id: 'c901', message: 'Initial commit', files: { 'index.html': '<h1>Home</h1>\n' } }
      ],
      reflog: [
        { from: 'c902', to: 'c901', action: 'reset: moving to HEAD~1', message: 'accidental reset' },
        { from: 'c901', to: 'c902', action: 'commit', message: 'feat: critical database module' }
      ],
      lostCommits: {
        c902: { id: 'c902', message: 'feat: critical database module', files: { 'index.html': '<h1>Home</h1>\n', 'database.js': 'export const db = {};\n' } }
      },
      currentBranch: 'main'
    },
    validation: (repo) => {
      const latest = repo.getLatestCommit();
      if (latest.id !== 'c902' && (!latest.files || !latest.files['database.js'])) {
        return { passed: false, message: 'The lost commit (containing database.js) has not been restored.' };
      }
      return { passed: true, message: '✨ Miracle recovery! You retrieved the orphaned commit from the reflog.' };
    },
    hints: [
      'Run `git reflog` to inspect the movement of HEAD.',
      'Notice that commit c902 was the commit before the reset.',
      'Restore it using `git reset --hard c902`.'
    ]
  },
  {
    id: 'git-rebase-linear',
    title: 'Linear Rebasing of Feature Branch',
    track: 'advanced',
    difficulty: 'Advanced',
    category: 'Rebasing',
    scenario: 'Main has moved ahead with a new commit. Rebase your "feature/dashboard" branch on top of main so that your branch has a clean, linear history.',
    initialState: {
      isRepo: true,
      branches: {
        main: {
          commits: [
            { id: 'm1', message: 'Initial commit', files: { 'app.js': '// app\n' } },
            { id: 'm2', message: 'feat: updated branding colors', files: { 'theme.css': 'body { color: #0078D4; }\n' } }
          ]
        },
        'feature/dashboard': {
          baseCommit: 0,
          commits: [
            { id: 'd1', message: 'feat: add analytics widgets', files: { 'dashboard.js': 'export const widgets = [];\n' } }
          ]
        }
      },
      currentBranch: 'feature/dashboard'
    },
    validation: (repo) => {
      if (repo.getHeadBranch() !== 'feature/dashboard') {
        return { passed: false, message: 'You must be on "feature/dashboard".' };
      }
      const latest = repo.getLatestCommit();
      if (!latest.files['theme.css'] || !latest.files['dashboard.js']) {
        return { passed: false, message: 'feature/dashboard must have both main changes (theme.css) and dashboard.js after rebase.' };
      }
      if (latest.parentIds && latest.parentIds.length > 1) {
        return { passed: false, message: 'Do not use git merge! Rebase produces a single linear parent.' };
      }
      return { passed: true, message: '📐 Elegant! You maintained a pristine linear git commit history.' };
    },
    hints: [
      'Make sure you are on your feature branch: `git switch feature/dashboard`.',
      'Run `git rebase main`.'
    ]
  },

  // ═══════════════════════════════════════════════════════
  // LEVEL 5: REAL-WORLD & PRODUCTION SCENARIOS
  // ═══════════════════════════════════════════════════════
  {
    id: 'git-secret-scrubbing',
    title: 'Emergency Secret Scrubbing from Commit',
    track: 'real-world',
    difficulty: 'Advanced',
    category: 'Production Emergency',
    scenario: 'A developer accidentally committed secrets.txt with a private database password in the latest commit. Untrack secrets.txt, add it to .gitignore, and amend/create a commit securing the repo.',
    initialState: {
      isRepo: true,
      commits: [
        { message: 'Initial setup', files: { 'index.js': '// app\n' } },
        { message: 'feat: add config', files: { 'index.js': '// app\n', 'secrets.txt': 'DB_PASS=super_secret_production_pass\n' } }
      ],
      files: {
        'index.js': '// app\n',
        'secrets.txt': 'DB_PASS=super_secret_production_pass\n'
      },
      currentBranch: 'main'
    },
    validation: (repo) => {
      const gitignore = repo.readFile('.gitignore');
      if (!gitignore || !gitignore.includes('secrets.txt')) {
        return { passed: false, message: '.gitignore must be created and contain secrets.txt.' };
      }
      const latest = repo.getLatestCommit();
      if (latest.files && latest.files['secrets.txt']) {
        return { passed: false, message: 'secrets.txt is still tracked in the latest commit! Use `git rm --cached secrets.txt`.' };
      }
      return { passed: true, message: '🚨 Security incident contained! You untracked the leaked secret and updated .gitignore.' };
    },
    hints: [
      'Stop tracking the file: `git rm --cached secrets.txt`.',
      'Create .gitignore: `echo "secrets.txt" > .gitignore`.',
      'Stage and commit: `git add .gitignore` and `git commit -m "chore: stop tracking leaked secret"`.'
    ]
  },
  {
    id: 'git-hotfix-workflow',
    title: 'Emergency Production Hotfix Protocol',
    track: 'real-world',
    difficulty: 'Advanced',
    category: 'Production Workflow',
    scenario: 'Production has a critical vulnerability in server.js. Create a "hotfix/cve-auth" branch off main, apply the security fix, merge it back into main, and create release tag v1.0.1.',
    initialState: {
      isRepo: true,
      commits: [
        { id: 'v100', message: 'Release v1.0.0', files: { 'server.js': 'const allowAll = true; // VULNERABILITY\n' } }
      ],
      files: {
        'server.js': 'const allowAll = true; // VULNERABILITY\n'
      },
      tags: {
        'v1.0.0': { commitId: 'v100', annotated: true }
      },
      currentBranch: 'main'
    },
    validation: (repo) => {
      if (repo.getHeadBranch() !== 'main') {
        return { passed: false, message: 'The hotfix must be merged back into "main".' };
      }
      const serverCode = repo.readFile('server.js');
      if (serverCode.includes('allowAll = true')) {
        return { passed: false, message: 'The vulnerability in server.js has not been fixed.' };
      }
      const tags = repo.getTags();
      if (!tags['v1.0.1']) {
        return { passed: false, message: 'Create release tag "v1.0.1" for the hotfix release.' };
      }
      return { passed: true, message: '🏥 Flawless emergency response! You patched production without downtime.' };
    },
    hints: [
      'Create hotfix branch: `git switch -c hotfix/cve-auth`.',
      'Fix server.js: `echo "const allowAll = false; // SECURED" > server.js`.',
      'Commit: `git add server.js` and `git commit -m "fix(sec): patch cve auth bypass"`.',
      'Switch to main: `git switch main` and `git merge hotfix/cve-auth`.',
      'Tag the release: `git tag -a v1.0.1 -m "Hotfix v1.0.1"`.'
    ]
  }
];
