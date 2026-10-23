// In-Browser Virtual Git Engine (100% Client-Side Sandbox)
// Executes arbitrary Git commands safely in memory with zero backend risk.
// Designed for MSC PRPCEM Assessment & Learning Platform

// Pseudo-SHA1 generator for deterministic, realistic hashes
function generateShortHash() {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 7; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export class VirtualGitEngine {
  constructor(initialConfig = {}) {
    this.reset(initialConfig);
  }

  // Reset or initialize repository state
  reset(config = {}) {
    this.isRepo = config.isRepo !== undefined ? config.isRepo : true;
    this.currentBranch = config.currentBranch || 'main';
    this.headDetached = false;
    this.headCommitId = null;

    // Working directory files: { [filename]: content }
    this.files = { ...(config.files || {}) };

    // Staging area (Index): { [filename]: content }
    this.index = { ...(config.index || {}) };

    // Commit Object Database: Array of commit objects
    this.commits = [];

    // Branches: { [branchName]: commitId }
    this.branches = {};

    // Remotes: { [remoteName]: { url, branches: { [branchName]: commitId } } }
    this.remotes = { ...(config.remotes || {}) };

    // Tags: { [tagName]: { commitId, message, annotated } }
    this.tags = { ...(config.tags || {}) };

    // Stash stack: Array of { id, message, files, index }
    this.stash = [];

    // Reflog: Array of { from, to, action, message, timestamp }
    this.reflog = [...(config.reflog || [])];

    // Merge in-progress state
    this.mergeState = null;

    // Load initial branches and commits if provided
    if (config.branches) {
      Object.keys(config.branches).forEach(bName => {
        const bData = config.branches[bName];
        if (bData.commits && Array.isArray(bData.commits)) {
          let parentId = null;
          bData.commits.forEach((c) => {
            const commitId = c.id || generateShortHash();
            const commitObj = {
              id: commitId,
              message: c.message,
              parentIds: c.parentIds || (parentId ? [parentId] : []),
              files: { ...(c.files || {}) },
              author: c.author || 'Student Developer <student@mscprpcem.tech>',
              timestamp: new Date().toISOString()
            };
            this.commits.push(commitObj);
            parentId = commitId;
            this.branches[bName] = commitId;
          });
        }
      });
    } else if (config.commits && Array.isArray(config.commits)) {
      let parentId = null;
      config.commits.forEach((c) => {
        const commitId = c.id || generateShortHash();
        const commitObj = {
          id: commitId,
          message: c.message,
          parentIds: c.parentIds || (parentId ? [parentId] : []),
          files: { ...(c.files || {}) },
          author: c.author || 'Student Developer <student@mscprpcem.tech>',
          timestamp: new Date().toISOString()
        };
        this.commits.push(commitObj);
        parentId = commitId;
      });
      if (parentId) {
        this.branches[this.currentBranch] = parentId;
      }
    }

    // Set initial HEAD
    if (this.branches[this.currentBranch]) {
      this.headCommitId = this.branches[this.currentBranch];
    } else if (this.commits.length > 0) {
      this.headCommitId = this.commits[this.commits.length - 1].id;
      this.branches[this.currentBranch] = this.headCommitId;
    }

    // Merge lost commits or initial reflog if passed
    if (config.lostCommits) {
      this.lostCommits = { ...config.lostCommits };
    } else {
      this.lostCommits = {};
    }

    // Initial files sync with head commit if files empty
    if (Object.keys(this.files).length === 0 && this.headCommitId) {
      const headCommit = this.getCommitById(this.headCommitId);
      if (headCommit && headCommit.files) {
        this.files = { ...headCommit.files };
      }
    }
  }

  // ══════════════════════════════════════════════════════════
  // INSPECTION & ASSERTION METHODS FOR STATE VALIDATORS
  // ══════════════════════════════════════════════════════════

  isInitialized() {
    return this.isRepo;
  }

  getHeadBranch() {
    if (this.headDetached) return `(detached from ${this.headCommitId})`;
    return this.currentBranch;
  }

  getHeadCommitId() {
    return this.headCommitId;
  }

  getLatestCommit() {
    if (!this.headCommitId) return null;
    return this.getCommitById(this.headCommitId);
  }

  getCommitById(id) {
    if (!id) return null;
    const found = this.commits.find(c => c.id === id || c.id.startsWith(id));
    if (found) return found;
    if (this.lostCommits && this.lostCommits[id]) return this.lostCommits[id];
    return null;
  }

  getCommitHistory() {
    if (!this.headCommitId) return [];
    const history = [];
    let current = this.getCommitById(this.headCommitId);
    const visited = new Set();

    while (current && !visited.has(current.id)) {
      history.push(current);
      visited.add(current.id);
      if (current.parentIds && current.parentIds.length > 0) {
        current = this.getCommitById(current.parentIds[0]);
      } else {
        current = null;
      }
    }
    return history;
  }

  getAllCommits() {
    return [...this.commits];
  }

  getBranchCommit(branchName) {
    return this.branches[branchName] || null;
  }

  getBranches() {
    return { ...this.branches };
  }

  getRemotes() {
    return { ...this.remotes };
  }

  getRemoteBranchCommit(remoteName, branchName) {
    if (!this.remotes[remoteName] || !this.remotes[remoteName].branches) return null;
    return this.remotes[remoteName].branches[branchName] || null;
  }

  getTags() {
    return { ...this.tags };
  }

  getStashList() {
    return [...this.stash];
  }

  getReflog() {
    return [...this.reflog];
  }

  readFile(filepath) {
    return this.files[filepath] !== undefined ? this.files[filepath] : null;
  }

  isWorkingTreeClean() {
    const headCommit = this.getLatestCommit();
    const headFiles = headCommit ? headCommit.files : {};

    // Check if any tracked or unstaged files differ from head or index
    for (const file of Object.keys(this.files)) {
      if (this.isIgnored(file)) continue;
      // If file modified compared to staged index or head
      const currentContent = this.files[file];
      const stagedContent = this.index[file];
      const committedContent = headFiles[file];

      if (stagedContent !== undefined) {
        if (stagedContent !== currentContent) return false;
      } else if (committedContent !== undefined) {
        if (committedContent !== currentContent) return false;
      } else {
        // Untracked file
        return false;
      }
    }
    return true;
  }

  isIndexClean() {
    const headCommit = this.getLatestCommit();
    const headFiles = headCommit ? headCommit.files : {};

    // Index is clean if no files staged that differ from HEAD
    for (const file of Object.keys(this.index)) {
      const staged = this.index[file];
      const committed = headFiles[file];
      if (staged !== committed) return false;
    }
    return true;
  }

  isIgnored(filename) {
    const gitignore = this.files['.gitignore'];
    if (!gitignore) return false;
    const lines = gitignore.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    for (const rule of lines) {
      if (rule.endsWith('/')) {
        const dirName = rule.slice(0, -1);
        if (filename.startsWith(dirName + '/') || filename === dirName) return true;
      } else if (rule.startsWith('*.')) {
        const ext = rule.slice(1);
        if (filename.endsWith(ext)) return true;
      } else if (filename === rule || filename.endsWith('/' + rule)) {
        return true;
      }
    }
    return false;
  }

  // ══════════════════════════════════════════════════════════
  // COMMAND EXECUTOR (MAIN ENTRY POINT)
  // ══════════════════════════════════════════════════════════

  execute(rawCommandLine) {
    if (!rawCommandLine || !rawCommandLine.trim()) {
      return { output: '', error: false };
    }

    const trimmed = rawCommandLine.trim();

    // Check for redirection: command > file or command >> file
    if (trimmed.includes(' > ') || trimmed.includes(' >> ')) {
      return this.handleRedirection(trimmed);
    }

    // Tokenize preserving quoted strings
    const tokens = this.tokenize(trimmed);
    const cmd = tokens[0];
    const args = tokens.slice(1);

    switch (cmd) {
      case 'git':
        return this.handleGitCommand(args);
      case 'ls':
      case 'dir':
        return this.handleLs(args);
      case 'cat':
        return this.handleCat(args);
      case 'touch':
        return this.handleTouch(args);
      case 'echo':
        return this.handleEcho(args);
      case 'mkdir':
        return { output: '', error: false };
      case 'rm':
        return this.handleShellRm(args);
      case 'pwd':
        return { output: '/home/student/project', error: false };
      case 'clear':
        return { output: '', clear: true, error: false };
      case 'help':
        return this.handleHelp();
      default:
        return { output: `bash: ${cmd}: command not found. Type 'help' for available commands.`, error: true };
    }
  }

  tokenize(str) {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const tokens = [];
    let match;
    while ((match = regex.exec(str)) !== null) {
      tokens.push(match[1] || match[2] || match[0]);
    }
    return tokens;
  }

  handleRedirection(rawStr) {
    const isAppend = rawStr.includes(' >> ');
    const parts = isAppend ? rawStr.split(' >> ') : rawStr.split(' > ');
    const leftCmd = parts[0].trim();
    const targetFile = parts[1].trim();

    if (!targetFile) {
      return { output: 'bash: syntax error near unexpected token `newline`', error: true };
    }

    let contentToWrite = '';
    if (leftCmd.startsWith('echo ')) {
      const rawContent = leftCmd.slice(5).trim();
      // Remove surrounding quotes if present
      if ((rawContent.startsWith('"') && rawContent.endsWith('"')) || (rawContent.startsWith("'") && rawContent.endsWith("'"))) {
        contentToWrite = rawContent.slice(1, -1);
      } else {
        contentToWrite = rawContent;
      }
      contentToWrite += '\n';
    } else {
      const res = this.execute(leftCmd);
      if (res.error) return res;
      contentToWrite = res.output + '\n';
    }

    if (isAppend && this.files[targetFile]) {
      this.files[targetFile] += contentToWrite;
    } else {
      this.files[targetFile] = contentToWrite;
    }

    return { output: '', error: false };
  }

  // ══════════════════════════════════════════════════════════
  // GIT COMMAND DISPATCHER
  // ══════════════════════════════════════════════════════════

  handleGitCommand(args) {
    if (args.length === 0) {
      return { output: 'usage: git [--version] [--help] <command> [<args>]', error: false };
    }

    const sub = args[0];
    const subArgs = args.slice(1);

    // If not initialized, only 'init' and 'clone' are allowed
    if (!this.isRepo && sub !== 'init' && sub !== 'clone') {
      return { output: 'fatal: not a git repository (or any of the parent directories): .git', error: true };
    }

    switch (sub) {
      case 'init':
        return this.gitInit();
      case 'status':
        return this.gitStatus();
      case 'add':
        return this.gitAdd(subArgs);
      case 'rm':
        return this.gitRm(subArgs);
      case 'commit':
        return this.gitCommit(subArgs);
      case 'branch':
        return this.gitBranch(subArgs);
      case 'checkout':
        return this.gitCheckout(subArgs);
      case 'switch':
        return this.gitSwitch(subArgs);
      case 'log':
        return this.gitLog(subArgs);
      case 'diff':
        return this.gitDiff(subArgs);
      case 'merge':
        return this.gitMerge(subArgs);
      case 'rebase':
        return this.gitRebase(subArgs);
      case 'stash':
        return this.gitStash(subArgs);
      case 'reset':
        return this.gitReset(subArgs);
      case 'revert':
        return this.gitRevert(subArgs);
      case 'cherry-pick':
        return this.gitCherryPick(subArgs);
      case 'remote':
        return this.gitRemote(subArgs);
      case 'push':
        return this.gitPush(subArgs);
      case 'pull':
        return this.gitPull(subArgs);
      case 'fetch':
        return this.gitFetch(subArgs);
      case 'tag':
        return this.gitTag(subArgs);
      case 'reflog':
        return this.gitReflog();
      case 'restore':
        return this.gitRestore(subArgs);
      default:
        return { output: `git: '${sub}' is not a git command. See 'git --help'.`, error: true };
    }
  }

  // ── 1. git init ──
  gitInit() {
    if (this.isRepo) {
      return { output: `Reinitialized existing Git repository in /home/student/project/.git/`, error: false };
    }
    this.isRepo = true;
    this.currentBranch = 'main';
    this.branches['main'] = null;
    this.reflog.push({
      from: null,
      to: null,
      action: 'init',
      message: 'repository created',
      timestamp: new Date().toISOString()
    });
    return { output: `Initialized empty Git repository in /home/student/project/.git/`, error: false };
  }

  // ── 2. git status ──
  gitStatus() {
    const headCommit = this.getLatestCommit();
    const headFiles = headCommit ? headCommit.files : {};

    let out = `On branch ${this.currentBranch}\n`;
    if (!headCommit) {
      out += `No commits yet\n\n`;
    }

    // Determine staged changes
    const stagedChanges = [];
    for (const file of Object.keys(this.index)) {
      if (headFiles[file] === undefined) {
        stagedChanges.push(`\tnew file:   ${file}`);
      } else if (this.index[file] !== headFiles[file]) {
        stagedChanges.push(`\tmodified:   ${file}`);
      }
    }

    if (stagedChanges.length > 0) {
      out += `Changes to be committed:\n  (use "git restore --staged <file>..." to unstage)\n`;
      stagedChanges.forEach(line => {
        out += `${line}\n`;
      });
      out += `\n`;
    }

    // Determine unstaged modifications
    const unstagedChanges = [];
    for (const file of Object.keys(this.files)) {
      if (this.isIgnored(file)) continue;
      const current = this.files[file];
      const staged = this.index[file];
      const committed = headFiles[file];

      if (staged !== undefined) {
        if (current !== staged) unstagedChanges.push(`\tmodified:   ${file}`);
      } else if (committed !== undefined) {
        if (current !== committed) unstagedChanges.push(`\tmodified:   ${file}`);
      }
    }

    if (unstagedChanges.length > 0) {
      out += `Changes not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n`;
      unstagedChanges.forEach(line => {
        out += `${line}\n`;
      });
      out += `\n`;
    }

    // Determine untracked files
    const untracked = [];
    for (const file of Object.keys(this.files)) {
      if (this.isIgnored(file)) continue;
      if (this.index[file] === undefined && headFiles[file] === undefined) {
        untracked.push(`\t${file}`);
      }
    }

    if (untracked.length > 0) {
      out += `Untracked files:\n  (use "git add <file>..." to include in what will be committed)\n`;
      untracked.forEach(line => {
        out += `${line}\n`;
      });
      out += `\n`;
    }

    if (stagedChanges.length === 0 && unstagedChanges.length === 0 && untracked.length === 0) {
      out += `nothing to commit, working tree clean\n`;
    }

    return { output: out.trimEnd(), error: false };
  }

  // ── 3. git add ──
  gitAdd(args) {
    if (args.length === 0) {
      return { output: 'Nothing specified, nothing added.\nhint: Maybe you wanted to say \'git add .\'?', error: true };
    }

    const filesToAdd = [];
    args.forEach(arg => {
      if (arg === '.' || arg === '-A' || arg === '--all') {
        Object.keys(this.files).forEach(f => {
          if (!this.isIgnored(f)) filesToAdd.push(f);
        });
      } else if (this.files[arg] !== undefined) {
        filesToAdd.push(arg);
      }
    });

    filesToAdd.forEach(f => {
      this.index[f] = this.files[f];
    });

    return { output: '', error: false };
  }

  // ── 4. git rm ──
  gitRm(args) {
    const isCached = args.includes('--cached');
    const files = args.filter(a => a !== '--cached' && a !== '-f');

    if (files.length === 0) {
      return { output: 'fatal: No pathspec specified', error: true };
    }

    files.forEach(f => {
      delete this.index[f];
      if (!isCached) {
        delete this.files[f];
      }
    });

    return { output: '', error: false };
  }

  // ── 5. git commit ──
  gitCommit(args) {
    let msg = '';
    const mIdx = args.indexOf('-m');
    if (mIdx !== -1 && args[mIdx + 1]) {
      msg = args[mIdx + 1];
    } else {
      msg = args.filter(a => !a.startsWith('-')).join(' ');
    }

    if (!msg) {
      return { output: 'Aborting commit due to empty commit message.', error: true };
    }

    // Check if anything staged
    const headCommit = this.getLatestCommit();
    const headFiles = headCommit ? headCommit.files : {};

    let hasChanges = false;
    // Check if index differs from head
    for (const f of Object.keys(this.index)) {
      if (this.index[f] !== headFiles[f]) {
        hasChanges = true;
        break;
      }
    }

    if (!hasChanges && Object.keys(this.index).length === 0) {
      return { output: 'nothing to commit, working tree clean', error: false };
    }

    const commitId = generateShortHash();
    const parentIds = this.headCommitId ? [this.headCommitId] : [];

    // If completing a merge
    if (this.mergeState) {
      if (this.mergeState.incomingCommitId) {
        parentIds.push(this.mergeState.incomingCommitId);
      }
      this.mergeState = null;
    }

    const newCommit = {
      id: commitId,
      message: msg,
      parentIds: parentIds,
      files: { ...this.index },
      author: 'Student Developer <student@mscprpcem.tech>',
      timestamp: new Date().toISOString()
    };

    this.commits.push(newCommit);
    this.headCommitId = commitId;
    if (!this.headDetached) {
      this.branches[this.currentBranch] = commitId;
    }

    this.reflog.push({
      from: parentIds[0] || null,
      to: commitId,
      action: 'commit',
      message: msg,
      timestamp: new Date().toISOString()
    });

    return {
      output: `[${this.currentBranch} ${commitId}] ${msg}\n ${Object.keys(this.index).length} file(s) changed`,
      error: false
    };
  }

  // ── 6. git branch ──
  gitBranch(args) {
    // List branches
    if (args.length === 0) {
      let out = '';
      Object.keys(this.branches).forEach(b => {
        if (b === this.currentBranch && !this.headDetached) {
          out += `* ${b}\n`;
        } else {
          out += `  ${b}\n`;
        }
      });
      return { output: out.trimEnd(), error: false };
    }

    // Delete branch
    if (args.includes('-d') || args.includes('-D')) {
      const bToDelete = args.find(a => !a.startsWith('-'));
      if (!bToDelete) return { output: 'fatal: branch name required', error: true };
      if (bToDelete === this.currentBranch) {
        return { output: `error: Cannot delete branch '${bToDelete}' checked out at '/home/student/project'`, error: true };
      }
      if (!this.branches[bToDelete]) {
        return { output: `error: branch '${bToDelete}' not found.`, error: true };
      }
      delete this.branches[bToDelete];
      return { output: `Deleted branch ${bToDelete}.`, error: false };
    }

    // Rename branch
    if (args.includes('-m')) {
      const mIdx = args.indexOf('-m');
      const newName = args[mIdx + 1];
      if (!newName) return { output: 'fatal: new branch name required', error: true };
      this.branches[newName] = this.branches[this.currentBranch];
      delete this.branches[this.currentBranch];
      this.currentBranch = newName;
      return { output: '', error: false };
    }

    // Create branch
    const newBranchName = args[0];
    if (this.branches[newBranchName]) {
      return { output: `fatal: a branch named '${newBranchName}' already exists`, error: true };
    }

    this.branches[newBranchName] = this.headCommitId;
    return { output: '', error: false };
  }

  // ── 7. git checkout ──
  gitCheckout(args) {
    if (args.length === 0) {
      return { output: 'error: you need to specify a branch or commit to checkout.', error: true };
    }

    // git checkout -b <name>
    if (args[0] === '-b') {
      const bName = args[1];
      if (!bName) return { output: 'fatal: missing branch name', error: true };
      this.branches[bName] = this.headCommitId;
      this.currentBranch = bName;
      this.headDetached = false;
      return { output: `Switched to a new branch '${bName}'`, error: false };
    }

    const target = args[0];
    // Switch to existing branch
    if (this.branches[target] !== undefined) {
      this.currentBranch = target;
      this.headCommitId = this.branches[target];
      this.headDetached = false;
      this.syncWorkingTreeToCommit(this.headCommitId);
      return { output: `Switched to branch '${target}'`, error: false };
    }

    // Detached HEAD checkout by commit ID
    const commit = this.getCommitById(target);
    if (commit) {
      this.headCommitId = commit.id;
      this.headDetached = true;
      this.syncWorkingTreeToCommit(commit.id);
      return {
        output: `Note: switching to '${target}'.\nYou are in 'detached HEAD' state. HEAD is now at ${commit.id} ${commit.message}`,
        error: false
      };
    }

    return { output: `error: pathspec '${target}' did not match any file(s) known to git`, error: true };
  }

  // ── 8. git switch ──
  gitSwitch(args) {
    if (args.length === 0) {
      return { output: 'fatal: missing branch name', error: true };
    }

    if (args[0] === '-c' || args[0] === '--create') {
      const bName = args[1];
      if (!bName) return { output: 'fatal: missing branch name', error: true };
      this.branches[bName] = this.headCommitId;
      this.currentBranch = bName;
      this.headDetached = false;
      return { output: `Switched to a new branch '${bName}'`, error: false };
    }

    const target = args[0];
    if (this.branches[target] !== undefined) {
      this.currentBranch = target;
      this.headCommitId = this.branches[target];
      this.headDetached = false;
      this.syncWorkingTreeToCommit(this.headCommitId);
      return { output: `Switched to branch '${target}'`, error: false };
    }

    return { output: `fatal: invalid reference: ${target}`, error: true };
  }

  syncWorkingTreeToCommit(commitId) {
    const commit = this.getCommitById(commitId);
    if (!commit) return;
    this.files = { ...(commit.files || {}) };
    this.index = { ...(commit.files || {}) };
  }

  // ── 9. git log ──
  gitLog(args) {
    const isOneLine = args.includes('--oneline');
    const isGraph = args.includes('--graph');

    const history = this.getCommitHistory();
    if (history.length === 0) {
      return { output: 'fatal: your current branch does not have any commits yet', error: true };
    }

    let out = '';
    history.forEach(c => {
      if (isOneLine) {
        const prefix = isGraph ? '* ' : '';
        out += `${prefix}${c.id} ${c.message}\n`;
      } else {
        out += `commit ${c.id}\nAuthor: ${c.author}\nDate:   ${c.timestamp}\n\n    ${c.message}\n\n`;
      }
    });

    return { output: out.trimEnd(), error: false };
  }

  // ── 10. git diff ──
  gitDiff(args) {
    const isStaged = args.includes('--staged') || args.includes('--cached');
    const headCommit = this.getLatestCommit();
    const headFiles = headCommit ? headCommit.files : {};

    let out = '';

    if (isStaged) {
      // Diff Staging area vs HEAD
      for (const f of Object.keys(this.index)) {
        const staged = this.index[f] || '';
        const committed = headFiles[f] || '';
        if (staged !== committed) {
          out += `diff --git a/${f} b/${f}\n--- a/${f}\n+++ b/${f}\n@@ -1 +1 @@\n-${committed.trim()}\n+${staged.trim()}\n`;
        }
      }
    } else {
      // Diff Working directory vs Staging (or HEAD)
      for (const f of Object.keys(this.files)) {
        if (this.isIgnored(f)) continue;
        const current = this.files[f] || '';
        const staged = this.index[f] !== undefined ? this.index[f] : (headFiles[f] || '');
        if (current !== staged) {
          out += `diff --git a/${f} b/${f}\n--- a/${f}\n+++ b/${f}\n@@ -1 +1 @@\n-${staged.trim()}\n+${current.trim()}\n`;
        }
      }
    }

    return { output: out.trimEnd(), error: false };
  }

  // ── 11. git merge ──
  gitMerge(args) {
    if (args.includes('--abort')) {
      if (!this.mergeState) {
        return { output: 'fatal: There is no merge to abort', error: true };
      }
      this.syncWorkingTreeToCommit(this.headCommitId);
      this.mergeState = null;
      return { output: '', error: false };
    }

    const targetBranch = args[0];
    if (!targetBranch) {
      return { output: 'fatal: No branch specified to merge', error: true };
    }

    const targetCommitId = this.branches[targetBranch];
    if (!targetCommitId) {
      return { output: `merge: ${targetBranch} - not something we can merge`, error: true };
    }

    const currentCommit = this.getLatestCommit();
    const targetCommit = this.getCommitById(targetCommitId);

    // Fast-Forward Check
    // If targetCommit has currentCommit as parent and currentCommit has no other diverged commits
    if (targetCommit.parentIds && targetCommit.parentIds.includes(currentCommit.id)) {
      this.branches[this.currentBranch] = targetCommitId;
      this.headCommitId = targetCommitId;
      this.syncWorkingTreeToCommit(targetCommitId);
      return {
        output: `Updating ${currentCommit.id}..${targetCommitId}\nFast-forward\n ${Object.keys(targetCommit.files).length} files changed`,
        error: false
      };
    }

    // Check for file content conflicts
    let hasConflict = false;
    const mergedFiles = { ...(currentCommit.files || {}) };

    for (const f of Object.keys(targetCommit.files || {})) {
      if (mergedFiles[f] !== undefined && mergedFiles[f] !== targetCommit.files[f]) {
        // Conflict! Inject conflict markers
        hasConflict = true;
        const currentText = mergedFiles[f];
        const incomingText = targetCommit.files[f];
        const conflictedContent = `<<<<<<< HEAD\n${currentText}=======\n${incomingText}>>>>>>> ${targetBranch}\n`;
        this.files[f] = conflictedContent;
        // Do not stage conflicting file
      } else {
        // Clean merge
        mergedFiles[f] = targetCommit.files[f];
        this.files[f] = targetCommit.files[f];
        this.index[f] = targetCommit.files[f];
      }
    }

    if (hasConflict) {
      this.mergeState = {
        inProgress: true,
        incomingBranch: targetBranch,
        incomingCommitId: targetCommitId
      };
      return {
        output: `Auto-merging files\nCONFLICT (content): Merge conflict in conflicting files\nAutomatic merge failed; fix conflicts and then commit the result.`,
        error: true
      };
    }

    // Automatic clean 3-way merge commit
    const mergeCommitId = generateShortHash();
    const mergeCommit = {
      id: mergeCommitId,
      message: `Merge branch '${targetBranch}' into ${this.currentBranch}`,
      parentIds: [currentCommit.id, targetCommit.id],
      files: mergedFiles,
      author: 'Student Developer <student@mscprpcem.tech>',
      timestamp: new Date().toISOString()
    };

    this.commits.push(mergeCommit);
    this.headCommitId = mergeCommitId;
    this.branches[this.currentBranch] = mergeCommitId;
    this.syncWorkingTreeToCommit(mergeCommitId);

    return {
      output: `Merge made by the 'ort' strategy.\n ${Object.keys(mergedFiles).length} files combined.`,
      error: false
    };
  }

  // ── 12. git rebase ──
  gitRebase(args) {
    if (args.includes('--abort')) {
      return { output: '', error: false };
    }

    const targetBranch = args[0];
    if (!targetBranch || !this.branches[targetBranch]) {
      return { output: `fatal: invalid upstream '${targetBranch}'`, error: true };
    }

    const targetCommit = this.getCommitById(this.branches[targetBranch]);
    const currentCommit = this.getLatestCommit();

    // Combine files linearly on top of targetCommit
    const rebasedCommitId = generateShortHash();
    const rebasedFiles = { ...(targetCommit.files || {}), ...(currentCommit.files || {}) };

    const newCommit = {
      id: rebasedCommitId,
      message: currentCommit.message,
      parentIds: [targetCommit.id],
      files: rebasedFiles,
      author: currentCommit.author,
      timestamp: new Date().toISOString()
    };

    this.commits.push(newCommit);
    this.headCommitId = rebasedCommitId;
    this.branches[this.currentBranch] = rebasedCommitId;
    this.syncWorkingTreeToCommit(rebasedCommitId);

    return {
      output: `Successfully rebased and updated refs/heads/${this.currentBranch}.`,
      error: false
    };
  }

  // ── 13. git stash ──
  gitStash(args) {
    const sub = args[0] || 'save';

    if (sub === 'pop') {
      if (this.stash.length === 0) {
        return { output: 'error: No stash entries found.', error: true };
      }
      const popped = this.stash.shift();
      this.files = { ...popped.files };
      this.index = { ...popped.index };
      return { output: `On branch ${this.currentBranch}\nChanges restored from stash@{0}`, error: false };
    }

    if (sub === 'apply') {
      if (this.stash.length === 0) {
        return { output: 'error: No stash entries found.', error: true };
      }
      const top = this.stash[0];
      this.files = { ...top.files };
      this.index = { ...top.index };
      return { output: `On branch ${this.currentBranch}\nChanges applied from stash@{0}`, error: false };
    }

    if (sub === 'list') {
      let out = '';
      this.stash.forEach((s, idx) => {
        out += `stash@{${idx}}: ${s.message}\n`;
      });
      return { output: out.trimEnd(), error: false };
    }

    if (sub === 'clear') {
      this.stash = [];
      return { output: '', error: false };
    }

    // Default: stash changes
    const msg = args.slice(1).join(' ') || `WIP on ${this.currentBranch}: ${this.headCommitId}`;
    this.stash.unshift({
      id: generateShortHash(),
      message: msg,
      files: { ...this.files },
      index: { ...this.index }
    });

    // Reset working directory to clean HEAD
    this.syncWorkingTreeToCommit(this.headCommitId);
    return { output: `Saved working directory and index state "${msg}"`, error: false };
  }

  // ── 14. git reset ──
  gitReset(args) {
    let mode = '--mixed';
    let target = 'HEAD~1';

    args.forEach(a => {
      if (a === '--soft' || a === '--mixed' || a === '--hard') {
        mode = a;
      } else if (!a.startsWith('-')) {
        target = a;
      }
    });

    const currentCommit = this.getLatestCommit();
    if (!currentCommit) {
      return { output: 'fatal: ambiguous argument: unknown revision', error: true };
    }

    let targetCommit = null;
    if (target === 'HEAD~1') {
      if (currentCommit.parentIds && currentCommit.parentIds.length > 0) {
        targetCommit = this.getCommitById(currentCommit.parentIds[0]);
      }
    } else {
      targetCommit = this.getCommitById(target);
    }

    if (!targetCommit) {
      return { output: `fatal: ambiguous argument '${target}': unknown revision or path`, error: true };
    }

    // Move branch pointer and head
    this.headCommitId = targetCommit.id;
    if (!this.headDetached) {
      this.branches[this.currentBranch] = targetCommit.id;
    }

    this.reflog.push({
      from: currentCommit.id,
      to: targetCommit.id,
      action: `reset: moving to ${target}`,
      message: `reset to ${targetCommit.id}`,
      timestamp: new Date().toISOString()
    });

    if (mode === '--soft') {
      // Keep working tree and staging area
      return { output: '', error: false };
    } else if (mode === '--mixed') {
      // Reset index to targetCommit, keep working tree
      this.index = { ...(targetCommit.files || {}) };
      return { output: `Unstaged changes after reset:\nM\t${Object.keys(this.files).join('\nM\t')}`, error: false };
    } else if (mode === '--hard') {
      // Erase working tree and index!
      this.files = { ...(targetCommit.files || {}) };
      this.index = { ...(targetCommit.files || {}) };
      return { output: `HEAD is now at ${targetCommit.id} ${targetCommit.message}`, error: false };
    }

    return { output: '', error: false };
  }

  // ── 15. git revert ──
  gitRevert(args) {
    const target = args[0];
    if (!target) return { output: 'fatal: commit to revert required', error: true };

    const commitToRevert = this.getCommitById(target);
    if (!commitToRevert) return { output: `fatal: bad revision '${target}'`, error: true };

    const currentCommit = this.getLatestCommit();
    const revertCommitId = generateShortHash();

    // Revert files: if file modified in commitToRevert, restore parent's version
    const parentCommit = commitToRevert.parentIds && commitToRevert.parentIds.length > 0
      ? this.getCommitById(commitToRevert.parentIds[0])
      : null;

    const revertedFiles = { ...(currentCommit.files || {}) };
    if (parentCommit && parentCommit.files) {
      Object.keys(commitToRevert.files).forEach(f => {
        if (parentCommit.files[f] !== undefined) {
          revertedFiles[f] = parentCommit.files[f];
        } else {
          delete revertedFiles[f];
        }
      });
    }

    const newCommit = {
      id: revertCommitId,
      message: `Revert "${commitToRevert.message}"`,
      parentIds: [currentCommit.id],
      files: revertedFiles,
      author: 'Student Developer <student@mscprpcem.tech>',
      timestamp: new Date().toISOString()
    };

    this.commits.push(newCommit);
    this.headCommitId = revertCommitId;
    this.branches[this.currentBranch] = revertCommitId;
    this.syncWorkingTreeToCommit(revertCommitId);

    return {
      output: `[${this.currentBranch} ${revertCommitId}] Revert "${commitToRevert.message}"\n 1 file changed`,
      error: false
    };
  }

  // ── 16. git cherry-pick ──
  gitCherryPick(args) {
    const target = args[0];
    if (!target) return { output: 'fatal: commit hash required', error: true };

    const commitToPick = this.getCommitById(target);
    if (!commitToPick) return { output: `fatal: bad revision '${target}'`, error: true };

    const currentCommit = this.getLatestCommit();
    const pickCommitId = generateShortHash();

    const mergedFiles = { ...(currentCommit.files || {}), ...(commitToPick.files || {}) };

    const newCommit = {
      id: pickCommitId,
      message: commitToPick.message,
      parentIds: [currentCommit.id],
      files: mergedFiles,
      author: commitToPick.author,
      timestamp: new Date().toISOString()
    };

    this.commits.push(newCommit);
    this.headCommitId = pickCommitId;
    this.branches[this.currentBranch] = pickCommitId;
    this.syncWorkingTreeToCommit(pickCommitId);

    return {
      output: `[${this.currentBranch} ${pickCommitId}] ${commitToPick.message}\n 1 file changed`,
      error: false
    };
  }

  // ── 17. git remote ──
  gitRemote(args) {
    if (args.length === 0) {
      return { output: Object.keys(this.remotes).join('\n'), error: false };
    }

    if (args.includes('-v')) {
      let out = '';
      Object.keys(this.remotes).forEach(r => {
        out += `${r}\t${this.remotes[r].url} (fetch)\n${r}\t${this.remotes[r].url} (push)\n`;
      });
      return { output: out.trimEnd(), error: false };
    }

    if (args[0] === 'add') {
      const name = args[1];
      const url = args[2];
      if (!name || !url) return { output: 'usage: git remote add <name> <url>', error: true };
      this.remotes[name] = { url, branches: {} };
      return { output: '', error: false };
    }

    if (args[0] === 'remove' || args[0] === 'rm') {
      const name = args[1];
      delete this.remotes[name];
      return { output: '', error: false };
    }

    return { output: 'usage: git remote [-v] | add <name> <url> | remove <name>', error: true };
  }

  // ── 18. git push ──
  gitPush(args) {
    const remote = args.find(a => !a.startsWith('-') && this.remotes[a]) || 'origin';
    const branch = args.find(a => !a.startsWith('-') && a !== remote) || this.currentBranch;

    if (!this.remotes[remote]) {
      return { output: `fatal: '${remote}' does not appear to be a git repository`, error: true };
    }

    const currentCommit = this.getLatestCommit();
    if (!currentCommit) {
      return { output: 'error: src refspec matches more than one.', error: true };
    }

    if (!this.remotes[remote].branches) {
      this.remotes[remote].branches = {};
    }
    this.remotes[remote].branches[branch] = currentCommit.id;

    return {
      output: `To ${this.remotes[remote].url}\n * [new branch]      ${branch} -> ${branch}`,
      error: false
    };
  }

  // ── 19. git fetch ──
  gitFetch(args) {
    const remote = args[0] || 'origin';
    if (!this.remotes[remote]) {
      return { output: `fatal: '${remote}' does not appear to be a git repository`, error: true };
    }

    return {
      output: `From ${this.remotes[remote].url}\n * [new branch]      main       -> ${remote}/main`,
      error: false
    };
  }

  // ── 20. git pull ──
  gitPull(args) {
    const remote = args.find(a => !a.startsWith('-') && this.remotes[a]) || 'origin';
    if (!this.remotes[remote]) {
      return { output: `fatal: '${remote}' does not appear to be a git repository`, error: true };
    }

    return {
      output: `Already up to date.`,
      error: false
    };
  }

  // ── 21. git tag ──
  gitTag(args) {
    if (args.length === 0) {
      return { output: Object.keys(this.tags).join('\n'), error: false };
    }

    const isAnnotated = args.includes('-a');
    const tagName = args.find(a => !a.startsWith('-'));
    let msg = '';
    const mIdx = args.indexOf('-m');
    if (mIdx !== -1 && args[mIdx + 1]) {
      msg = args[mIdx + 1];
    }

    if (!tagName) return { output: 'fatal: tag name required', error: true };

    this.tags[tagName] = {
      commitId: this.headCommitId,
      message: msg || tagName,
      annotated: isAnnotated
    };

    return { output: '', error: false };
  }

  // ── 22. git reflog ──
  gitReflog() {
    let out = '';
    this.reflog.slice().reverse().forEach((r, idx) => {
      out += `${r.to || '0000000'} HEAD@{${idx}}: ${r.action}: ${r.message}\n`;
    });
    return { output: out.trimEnd() || 'HEAD@{0}: commit: initial repository state', error: false };
  }

  // ── 23. git restore ──
  gitRestore(args) {
    const isStaged = args.includes('--staged');
    const files = args.filter(a => !a.startsWith('-'));

    const headCommit = this.getLatestCommit();
    const headFiles = headCommit ? headCommit.files : {};

    if (isStaged) {
      files.forEach(f => {
        if (headFiles[f] !== undefined) {
          this.index[f] = headFiles[f];
        } else {
          delete this.index[f];
        }
      });
      return { output: '', error: false };
    }

    files.forEach(f => {
      const source = this.index[f] !== undefined ? this.index[f] : headFiles[f];
      if (source !== undefined) {
        this.files[f] = source;
      }
    });

    return { output: '', error: false };
  }

  // ══════════════════════════════════════════════════════════
  // BASIC SHELL COMMANDS
  // ══════════════════════════════════════════════════════════

  handleLs() {
    const filenames = Object.keys(this.files);
    if (filenames.length === 0) return { output: '', error: false };
    return { output: filenames.join('  '), error: false };
  }

  handleCat(args) {
    const file = args[0];
    if (!file) return { output: 'cat: missing filename', error: true };
    if (this.files[file] === undefined) {
      return { output: `cat: ${file}: No such file or directory`, error: true };
    }
    return { output: this.files[file], error: false };
  }

  handleTouch(args) {
    const file = args[0];
    if (!file) return { output: 'touch: missing file operand', error: true };
    if (this.files[file] === undefined) {
      this.files[file] = '';
    }
    return { output: '', error: false };
  }

  handleEcho(args) {
    const text = args.join(' ');
    return { output: text, error: false };
  }

  handleShellRm(args) {
    const file = args.find(a => !a.startsWith('-'));
    if (!file) return { output: 'rm: missing operand', error: true };
    delete this.files[file];
    return { output: '', error: false };
  }

  handleHelp() {
    const text = `
Microsoft Student Club Virtual Git Shell
----------------------------------------
Supported Git Commands:
  git init, status, add, rm, commit -m "<msg>"
  git branch, checkout, switch, log, diff
  git merge, rebase, stash, reset, revert, cherry-pick
  git remote, push, fetch, pull, tag, reflog, restore

Supported Shell Utilities:
  ls, cat, touch, echo "text" > file, rm, pwd, clear, help
`;
    return { output: text.trim(), error: false };
  }
}
