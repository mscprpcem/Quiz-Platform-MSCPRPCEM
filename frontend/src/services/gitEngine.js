// In-Browser Virtual Git Engine (100% Client-Side Sandbox)
// Executes arbitrary Git commands safely in memory with zero backend risk.
// Designed for MSC PRPCEM Assessment & Learning Platform

// Pseudo-SHA1 generator for deterministic, realistic short hashes
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
    this.previousBranch = null;
    this.headDetached = false;
    this.headCommitId = null;
    this.hasUsedStash = false;

    // Working directory files: { [filename]: content }
    this.files = { ...(config.files || {}) };

    // Staging area (Index): { [filename]: content }
    this.index = { ...(config.index || {}) };

    // Commit Object Database: Array of commit objects
    this.commits = [];

    // Branches: { [branchName]: commitId }
    this.branches = {};

    // Remotes: { [remoteName]: { url, branches: { [branchName]: commitId } } }
    this.remotes = {};
    if (config.remotes) {
      Object.keys(config.remotes).forEach(rName => {
        const rData = config.remotes[rName];
        this.remotes[rName] = {
          url: rData.url || '',
          branches: { ...(rData.branches || {}) }
        };
      });
    }

    // Remote commits available to be fetched
    this.remoteCommits = { ...(config.remoteCommits || {}) };

    // Tags: { [tagName]: { commitId, message, annotated } }
    this.tags = { ...(config.tags || {}) };

    // Stash stack: Array of { id, message, files, index }
    this.stash = [...(config.stash || [])];

    // Reflog: Array of { from, to, action, message, timestamp }
    this.reflog = [...(config.reflog || [])];

    // Merge in-progress state
    this.mergeState = null;

    // Virtual filesystem navigation & state
    this.cwd = config.cwd || '/home/student/project';
    this.homeDir = config.homeDir || '/home/student';
    this.directories = new Set(config.directories || [
      '/home',
      '/home/student',
      '/home/student/project',
      '/home/student/Desktop'
    ]);
    this.executedCommands = [];
    this.lastCommand = '';
    this.lastOutput = '';

    // Load initial branches and commits if provided
    if (config.branches) {
      Object.keys(config.branches).forEach(bName => {
        const bData = config.branches[bName];
        if (bData.commits && Array.isArray(bData.commits)) {
          let parentId = null;
          if (bData.baseBranch && this.branches[bData.baseBranch]) {
            parentId = this.branches[bData.baseBranch];
          } else if (bData.baseCommit !== undefined && this.commits[bData.baseCommit]) {
            parentId = this.commits[bData.baseCommit].id;
          }

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

    // Merge lost commits if passed
    if (config.lostCommits) {
      this.lostCommits = { ...config.lostCommits };
    } else {
      this.lostCommits = {};
    }

    // Initial files and index sync with head commit
    if (this.headCommitId) {
      const headCommit = this.getCommitById(this.headCommitId);
      if (headCommit && headCommit.files) {
        if (Object.keys(this.files).length === 0) {
          this.files = { ...headCommit.files };
        }
        if (!config.index) {
          this.index = { ...headCommit.files };
        }
      }
    }
  }

  // ══════════════════════════════════════════════════════════
  // INSPECTION & ASSERTION METHODS FOR STATE VALIDATORS
  // ══════════════════════════════════════════════════════════

  isInitialized() {
    return this.isRepo;
  }

  getCwd() {
    return this.cwd;
  }

  getCwdShort() {
    if (!this.cwd) return '~/project';
    if (this.cwd === this.homeDir) return '~';
    if (this.cwd.startsWith(this.homeDir + '/')) {
      return '~' + this.cwd.slice(this.homeDir.length);
    }
    return this.cwd;
  }

  getCwdWindows() {
    if (!this.cwd) return 'C:\\Users\\student\\project';
    const relative = this.cwd.replace(/^\/home\/student\/?/, '');
    if (!relative) return 'C:\\Users\\student';
    return 'C:\\Users\\student\\' + relative.replace(/\//g, '\\');
  }

  getDirectories() {
    return Array.from(this.directories);
  }

  hasDirectory(dirPath) {
    if (!dirPath) return false;
    const clean = dirPath.replace(/^['"](.*)['"]$/, '$1').trim();
    if (this.directories.has(clean)) return true;
    if (this.directories.has(`${this.cwd}/${clean}`)) return true;
    for (const d of this.directories) {
      if (d === clean || d.endsWith('/' + clean) || d.endsWith('\\' + clean)) return true;
    }
    return false;
  }

  getExecutedCommands() {
    return [...this.executedCommands];
  }

  hasExecutedCommand(cmdPrefix) {
    if (!cmdPrefix) return false;
    const lower = cmdPrefix.toLowerCase().trim();
    return this.executedCommands.some(c => {
      const cLower = c.toLowerCase().trim();
      return cLower === lower || cLower.startsWith(lower) || cLower.includes(lower);
    });
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

  getCommitHistory(startCommitId) {
    const startId = startCommitId || this.headCommitId;
    if (!startId) return [];
    const history = [];
    let current = this.getCommitById(startId);
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

  writeFile(filepath, content) {
    this.files[filepath] = content;
  }

  isWorkingTreeClean() {
    const headCommit = this.getLatestCommit();
    const headFiles = headCommit ? headCommit.files : {};

    // Check if any untracked or modified files exist in working directory
    for (const file of Object.keys(this.files)) {
      if (this.isIgnored(file)) continue;
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

    // Check if any files were deleted from working tree
    for (const file of Object.keys(this.index)) {
      if (this.files[file] === undefined) return false;
    }
    for (const file of Object.keys(headFiles)) {
      if (this.files[file] === undefined && this.index[file] !== undefined) return false;
    }

    return true;
  }

  isIndexClean() {
    const headCommit = this.getLatestCommit();
    const headFiles = headCommit ? headCommit.files : {};

    // Check if index differs from HEAD (staged modifications, additions, or staged deletions)
    const indexKeys = Object.keys(this.index);
    const headKeys = Object.keys(headFiles);

    if (indexKeys.length !== headKeys.length) return false;

    for (const file of indexKeys) {
      if (this.index[file] !== headFiles[file]) return false;
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

  splitCommandChains(str) {
    const parts = [];
    let cur = '';
    let inDouble = false;
    let inSingle = false;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === '"' && !inSingle) inDouble = !inDouble;
      else if (ch === "'" && !inDouble) inSingle = !inSingle;
      else if (!inDouble && !inSingle) {
        if (ch === '&' && str[i + 1] === '&') {
          parts.push({ cmd: cur.trim(), operator: '&&' });
          cur = '';
          i++;
          continue;
        } else if (ch === ';') {
          parts.push({ cmd: cur.trim(), operator: ';' });
          cur = '';
          continue;
        }
      }
      cur += ch;
    }
    if (cur.trim()) parts.push({ cmd: cur.trim(), operator: null });
    return parts;
  }

  execute(rawCommandLine) {
    if (!rawCommandLine || !rawCommandLine.trim()) {
      return { output: '', error: false };
    }

    const trimmed = rawCommandLine.trim();
    this.executedCommands.push(trimmed);
    this.lastCommand = trimmed;

    // Check for command chains (&& or ;)
    const chains = this.splitCommandChains(trimmed);
    if (chains.length > 1) {
      const outputs = [];
      let hadClear = false;
      for (const segment of chains) {
        if (!segment.cmd) continue;
        const res = this.executeSingle(segment.cmd);
        if (res.clear) hadClear = true;
        if (res.output) outputs.push(res.output);
        if (res.error && segment.operator === '&&') {
          this.lastOutput = outputs.join('\n');
          return { output: outputs.join('\n'), error: true, clear: hadClear };
        }
      }
      this.lastOutput = outputs.join('\n');
      return { output: outputs.join('\n'), error: false, clear: hadClear };
    }

    const res = this.executeSingle(trimmed);
    this.lastOutput = res.output || '';
    return res;
  }

  executeSingle(trimmed) {
    // Check for redirection: command > file or command >> file (outside of quotes)
    const redir = this.findRedirectionOperator(trimmed);
    if (redir) {
      return this.handleRedirection(trimmed, redir);
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
      case 'Get-ChildItem':
        return this.handleLs(args);
      case 'cat':
      case 'type':
      case 'Get-Content':
        return this.handleCat(args);
      case 'touch':
      case 'New-Item':
        return this.handleTouch(args);
      case 'echo':
        return this.handleEcho(args);
      case 'mkdir':
      case 'md':
        return this.handleMkdir(args);
      case 'rmdir':
      case 'rd':
        return this.handleRmdir(args);
      case 'rm':
      case 'del':
      case 'erase':
      case 'Remove-Item':
        return this.handleShellRm(args);
      case 'cp':
      case 'copy':
      case 'Copy-Item':
        return this.handleCp(args);
      case 'mv':
      case 'ren':
      case 'rename':
      case 'move':
      case 'Move-Item':
        return this.handleMv(args);
      case 'cd':
      case 'chdir':
      case 'Set-Location':
        return this.handleCd(args);
      case 'pwd':
      case 'Get-Location':
        return this.handlePwd(args);
      case 'whoami':
        return { output: 'student', error: false };
      case 'date':
        return { output: new Date().toUTCString(), error: false };
      case 'clear':
      case 'cls':
      case 'Clear-Host':
        return { output: '', clear: true, error: false };
      case 'history':
      case 'Get-History':
        return this.handleHistory(args);
      case 'code':
        return this.handleCode(args);
      case 'which':
      case 'where':
        return this.handleWhich(args);
      case 'winget':
        return this.handleWinget(args);
      case 'xcode-select':
        return this.handleXcodeSelect(args);
      case 'brew':
        return this.handleBrew(args);
      case 'sudo':
        return this.handleSudo(args);
      case 'apt':
      case 'apt-get':
        return this.handleApt(args);
      case 'dnf':
      case 'yum':
        return this.handleDnf(args);
      case 'vim':
      case 'vi':
      case 'nano':
        return { output: '', openVim: true, file: args[0] || 'README.md', error: false };
      case 'man':
        return this.handleMan(args);
      case 'help':
        return this.handleHelp();
      default:
        if (cmd === '$env:PATH' || cmd === '%PATH%') {
          return this.handleEcho([cmd]);
        }
        return { output: `Command not found: ${cmd}. Type 'help' for available commands.`, error: true };
    }
  }

  findRedirectionOperator(str) {
    let inDouble = false;
    let inSingle = false;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === '"' && !inSingle) inDouble = !inDouble;
      else if (ch === "'" && !inDouble) inSingle = !inSingle;
      else if (!inDouble && !inSingle) {
        if (ch === '>' && str[i + 1] === '>') {
          return { index: i, operator: '>>' };
        } else if (ch === '>') {
          return { index: i, operator: '>' };
        }
      }
    }
    return null;
  }

  tokenize(str) {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const tokens = [];
    let match;
    while ((match = regex.exec(str)) !== null) {
      if (match[1] !== undefined) {
        tokens.push(match[1]);
      } else if (match[2] !== undefined) {
        tokens.push(match[2]);
      } else {
        tokens.push(match[0]);
      }
    }
    return tokens;
  }

  handleRedirection(rawStr, redir) {
    const r = redir || this.findRedirectionOperator(rawStr);
    if (!r) return { output: '', error: false };

    const isAppend = r.operator === '>>';
    const splitIndex = r.index;
    const leftCmd = rawStr.slice(0, splitIndex).trim();
    let targetFile = rawStr.slice(splitIndex + (isAppend ? 2 : 1)).trim();

    // Remove quotes around target filename if any
    if ((targetFile.startsWith('"') && targetFile.endsWith('"')) || (targetFile.startsWith("'") && targetFile.endsWith("'"))) {
      targetFile = targetFile.slice(1, -1).trim();
    }

    if (!targetFile) {
      return { output: 'bash: syntax error near unexpected token `newline`', error: true };
    }

    let contentToWrite = '';
    if (leftCmd.startsWith('echo')) {
      let rawContent = leftCmd.slice(4).trim();
      if ((rawContent.startsWith('"') && rawContent.endsWith('"')) || (rawContent.startsWith("'") && rawContent.endsWith("'"))) {
        rawContent = rawContent.slice(1, -1);
      }
      contentToWrite = rawContent + '\n';
    } else {
      const res = this.execute(leftCmd);
      if (res.error) return res;
      contentToWrite = (res.output || '') + '\n';
    }

    if (isAppend && this.files[targetFile] !== undefined) {
      this.files[targetFile] += contentToWrite;
    } else {
      this.files[targetFile] = contentToWrite;
    }

    return { output: '', error: false };
  }

  // ══════════════════════════════════════════════════════════
  // GIT COMMAND DISPATCHER
  // ══════════════════════════════════════════════════════════
  // GIT COMMAND DISPATCHER
  // ══════════════════════════════════════════════════════════

  handleGitCommand(args) {
    if (args.length === 0) {
      return this.gitHelp();
    }

    const sub = args[0];
    const subArgs = args.slice(1);

    // Global flags that work anywhere, even if not a git repository
    if (sub === '--help' || sub === '-h' || sub === 'help') {
      if (subArgs.length > 0) {
        return this.gitSubcommandHelp(subArgs[0]);
      }
      return this.gitHelp();
    }

    if (sub === '--version' || sub === '-v' || sub === 'version') {
      return { output: 'git version 2.44.0 (MSC PRPCEM Virtual Sandbox)', error: false };
    }

    // Check if subcommand was called with --help or -h (e.g. git commit --help or git add -h)
    if (subArgs.includes('--help') || subArgs.includes('-h')) {
      return this.gitSubcommandHelp(sub);
    }

    // If not initialized, only 'init' and 'clone' (plus help/version) are allowed
    if (!this.isRepo && sub !== 'init' && sub !== 'clone') {
      return { output: 'fatal: not a git repository (or any of the parent directories): .git', error: true };
    }

    switch (sub) {
      case 'init':
        return this.gitInit();
      case 'clone':
        return this.gitClone(subArgs);
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
      case 'show':
        return this.gitShow(subArgs);
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
    return { output: `Initialized empty Git repository in ${this.cwd || '/home/student/project'}/.git/`, error: false };
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
    // Check staged deletions (in HEAD but deleted from index)
    for (const file of Object.keys(headFiles)) {
      if (this.index[file] === undefined) {
        stagedChanges.push(`\tdeleted:    ${file}`);
      }
    }

    if (stagedChanges.length > 0) {
      out += `Changes to be committed:\n  (use "git restore --staged <file>..." to unstage)\n`;
      stagedChanges.forEach(line => {
        out += `${line}\n`;
      });
      out += `\n`;
    }

    // Determine unstaged modifications and deletions
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

    // Check unstaged deletions (file in index or head, but removed from working directory)
    for (const file of Object.keys(this.index)) {
      if (this.files[file] === undefined) {
        unstagedChanges.push(`\tdeleted:    ${file}`);
      }
    }
    for (const file of Object.keys(headFiles)) {
      if (this.index[file] !== undefined && this.files[file] === undefined) {
        // already counted in index check
      } else if (this.index[file] === undefined && this.files[file] === undefined) {
        // unstaged deletion of a tracked file
        if (!unstagedChanges.some(l => l.includes(file)) && !stagedChanges.some(l => l.includes(file))) {
          unstagedChanges.push(`\tdeleted:    ${file}`);
        }
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

    const headCommit = this.getLatestCommit();
    const headFiles = headCommit ? headCommit.files : {};

    const isAll = args.includes('.') || args.includes('-A') || args.includes('--all') || args.includes('*');

    if (isAll) {
      // Stage all untracked and modified files
      Object.keys(this.files).forEach(f => {
        if (!this.isIgnored(f)) {
          this.index[f] = this.files[f];
        }
      });
      // Stage deletions: any file in index or head not in files should be removed from index
      Object.keys(this.index).forEach(f => {
        if (this.files[f] === undefined) {
          delete this.index[f];
        }
      });
      return { output: '', error: false };
    }

    // Process specific files
    args.forEach(arg => {
      if (arg.startsWith('-')) return;
      if (this.files[arg] !== undefined) {
        this.index[arg] = this.files[arg];
      } else if (this.index[arg] !== undefined || headFiles[arg] !== undefined) {
        // File was deleted from working directory, staging the deletion
        delete this.index[arg];
      }
    });

    return { output: '', error: false };
  }

  // ── 4. git rm ──
  gitRm(args) {
    const isCached = args.includes('--cached');
    const files = args.filter(a => !a.startsWith('-'));

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
    const isAmend = args.includes('--amend');
    const isAutoStage = args.includes('-a') || args.some(a => a.startsWith('-') && a.includes('a') && a !== '--all');

    // Handle auto-staging tracked modified files with -a or -am
    if (isAutoStage) {
      const headCommit = this.getLatestCommit();
      const headFiles = headCommit ? headCommit.files : {};
      Object.keys(headFiles).forEach(f => {
        if (this.files[f] !== undefined) {
          this.index[f] = this.files[f];
        } else {
          delete this.index[f];
        }
      });
    }

    // Extract commit message
    const mIdx = args.findIndex(a => a === '-m' || a === '--message' || a === '-am');
    if (mIdx !== -1 && args[mIdx + 1] !== undefined) {
      msg = args[mIdx + 1];
    } else {
      // Check for inline message e.g. -m"msg" or -am"msg"
      const inlineArg = args.find(a => (a.startsWith('-m') && a !== '-m') || (a.startsWith('-am') && a !== '-am'));
      if (inlineArg) {
        msg = inlineArg.replace(/^-a?m/, '');
      } else {
        const nonFlags = args.filter(a => !a.startsWith('-'));
        if (nonFlags.length > 0) {
          msg = nonFlags.join(' ');
        }
      }
    }

    // If completing a merge without -m, use default merge message
    if (!msg && this.mergeState) {
      msg = `Merge branch '${this.mergeState.incomingBranch}' into ${this.currentBranch}`;
    }

    // If amending without message, reuse previous commit message
    if (isAmend) {
      const latest = this.getLatestCommit();
      if (!latest) {
        return { output: 'fatal: You have nothing to amend.', error: true };
      }
      latest.message = msg || latest.message;
      latest.files = { ...this.index };
      return {
        output: `[${this.currentBranch} ${latest.id}] (amended) ${latest.message}\n ${Object.keys(this.index).length} file(s) changed`,
        error: false
      };
    }

    if (!msg) {
      return { output: 'Aborting commit due to empty commit message.', error: true };
    }

    // Check if anything is staged
    const headCommit = this.getLatestCommit();
    const headFiles = headCommit ? headCommit.files : {};

    let hasChanges = false;
    for (const f of Object.keys(this.index)) {
      if (this.index[f] !== headFiles[f]) {
        hasChanges = true;
        break;
      }
    }
    for (const f of Object.keys(headFiles)) {
      if (this.index[f] === undefined) {
        hasChanges = true;
        break;
      }
    }

    const allowEmpty = args.includes('--allow-empty');
    if (!hasChanges && !allowEmpty && headCommit) {
      return { output: 'nothing to commit, working tree clean', error: false };
    }

    const commitId = generateShortHash();
    const parentIds = this.headCommitId ? [this.headCommitId] : [];

    // If completing a merge
    if (this.mergeState) {
      if (this.mergeState.incomingCommitId && !parentIds.includes(this.mergeState.incomingCommitId)) {
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
    const isAll = args.includes('-a') || args.includes('--all');
    const isRemotes = args.includes('-r') || args.includes('--remotes');

    // List branches
    if (args.length === 0 || isAll || isRemotes) {
      let out = '';
      if (!isRemotes) {
        Object.keys(this.branches).forEach(b => {
          if (b === this.currentBranch && !this.headDetached) {
            out += `* ${b}\n`;
          } else {
            out += `  ${b}\n`;
          }
        });
      }
      if (isAll || isRemotes) {
        Object.keys(this.remotes).forEach(r => {
          const remoteBranches = this.remotes[r].branches || {};
          Object.keys(remoteBranches).forEach(rb => {
            out += `  remotes/${r}/${rb}\n`;
          });
        });
      }
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
      const targetArgs = args.filter(a => !a.startsWith('-'));
      let oldName = this.currentBranch;
      let newName = '';
      if (targetArgs.length >= 2) {
        oldName = targetArgs[0];
        newName = targetArgs[1];
      } else if (targetArgs.length === 1) {
        newName = targetArgs[0];
      } else {
        return { output: 'fatal: new branch name required', error: true };
      }

      this.branches[newName] = this.branches[oldName];
      delete this.branches[oldName];
      if (this.currentBranch === oldName) {
        this.currentBranch = newName;
      }
      return { output: '', error: false };
    }

    // Create branch from HEAD or start point: git branch <name> [<start-point>]
    const newBranchName = args[0];
    const startPoint = args[1];

    if (this.branches[newBranchName]) {
      return { output: `fatal: a branch named '${newBranchName}' already exists`, error: true };
    }

    let targetCommitId = this.headCommitId;
    if (startPoint) {
      if (this.branches[startPoint]) {
        targetCommitId = this.branches[startPoint];
      } else {
        const c = this.getCommitById(startPoint);
        if (c) targetCommitId = c.id;
      }
    }

    this.branches[newBranchName] = targetCommitId;
    return { output: '', error: false };
  }

  // ── 7. git checkout ──
  gitCheckout(args) {
    if (args.length === 0) {
      return { output: 'error: you need to specify a branch or commit to checkout.', error: true };
    }

    // git checkout -b <name> [<start-point>]
    if (args[0] === '-b') {
      const bName = args[1];
      const startPoint = args[2];
      if (!bName) return { output: 'fatal: missing branch name', error: true };

      let targetCommitId = this.headCommitId;
      if (startPoint) {
        if (this.branches[startPoint]) {
          targetCommitId = this.branches[startPoint];
        } else {
          const c = this.getCommitById(startPoint);
          if (c) targetCommitId = c.id;
        }
      }

      this.previousBranch = this.currentBranch;
      this.branches[bName] = targetCommitId;
      this.currentBranch = bName;
      this.headCommitId = targetCommitId;
      this.headDetached = false;
      this.syncWorkingTreeToCommit(targetCommitId);
      return { output: `Switched to a new branch '${bName}'`, error: false };
    }

    // Discard changes in working directory: git checkout -- <file> or git checkout <file>
    const fileArgs = args.filter(a => a !== '--');
    const headCommit = this.getLatestCommit();
    const headFiles = headCommit ? headCommit.files : {};

    if (fileArgs.length === 1 && (this.files[fileArgs[0]] !== undefined || this.index[fileArgs[0]] !== undefined || headFiles[fileArgs[0]] !== undefined || fileArgs[0] === '.')) {
      const target = fileArgs[0];
      if (target === '.') {
        Object.keys(this.index).forEach(f => {
          this.files[f] = this.index[f];
        });
        Object.keys(headFiles).forEach(f => {
          if (this.index[f] === undefined) {
            this.files[f] = headFiles[f];
          }
        });
        return { output: 'Updated all paths from the index', error: false };
      } else {
        const source = this.index[target] !== undefined ? this.index[target] : headFiles[target];
        if (source !== undefined) {
          this.files[target] = source;
          return { output: `Updated 1 path from the index`, error: false };
        }
      }
    }

    const target = args[0];
    // Switch to existing branch
    if (this.branches[target] !== undefined) {
      this.previousBranch = this.currentBranch;
      this.currentBranch = target;
      this.headCommitId = this.branches[target];
      this.headDetached = false;
      this.syncWorkingTreeToCommit(this.headCommitId);
      return { output: `Switched to branch '${target}'`, error: false };
    }

    // Detached HEAD checkout by commit ID
    const commit = this.getCommitById(target);
    if (commit) {
      this.previousBranch = this.currentBranch;
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

    if (args[0] === '-') {
      if (!this.previousBranch || !this.branches[this.previousBranch]) {
        return { output: 'fatal: no previous branch found', error: true };
      }
      const target = this.previousBranch;
      this.previousBranch = this.currentBranch;
      this.currentBranch = target;
      this.headCommitId = this.branches[target];
      this.headDetached = false;
      this.syncWorkingTreeToCommit(this.headCommitId);
      return { output: `Switched to branch '${target}'`, error: false };
    }

    if (args[0] === '-c' || args[0] === '--create') {
      const bName = args[1];
      if (!bName) return { output: 'fatal: missing branch name', error: true };
      this.previousBranch = this.currentBranch;
      this.branches[bName] = this.headCommitId;
      this.currentBranch = bName;
      this.headDetached = false;
      return { output: `Switched to a new branch '${bName}'`, error: false };
    }

    const target = args[0];
    if (this.branches[target] !== undefined) {
      this.previousBranch = this.currentBranch;
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

    // Find start commit target if passed (branch name, remote branch, or commit hash)
    let startCommitId = this.headCommitId;
    const targetArg = args.find(a => !a.startsWith('-'));

    if (targetArg) {
      if (this.branches[targetArg]) {
        startCommitId = this.branches[targetArg];
      } else if (targetArg.includes('/')) {
        const [rName, bName] = targetArg.split('/');
        if (this.remotes[rName]?.branches?.[bName]) {
          startCommitId = this.remotes[rName].branches[bName];
        }
      } else {
        const c = this.getCommitById(targetArg);
        if (c) startCommitId = c.id;
      }
    }

    const history = this.getCommitHistory(startCommitId);
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
      for (const f of Object.keys(headFiles)) {
        if (this.index[f] === undefined) {
          out += `diff --git a/${f} b/${f}\ndeleted file mode 100644\n--- a/${f}\n+++ /dev/null\n`;
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

    const targetBranch = args.find(a => !a.startsWith('-'));
    if (!targetBranch) {
      return { output: 'fatal: No branch specified to merge', error: true };
    }

    const targetCommitId = this.branches[targetBranch];
    if (!targetCommitId) {
      return { output: `merge: ${targetBranch} - not something we can merge`, error: true };
    }

    const currentCommit = this.getLatestCommit();
    const targetCommit = this.getCommitById(targetCommitId);

    if (currentCommit && currentCommit.id === targetCommitId) {
      return { output: 'Already up to date.', error: false };
    }

    // Fast-Forward Check
    // Check if targetCommit is direct descendant of currentCommit
    let isFastForward = false;
    if (targetCommit.parentIds && targetCommit.parentIds.includes(currentCommit?.id)) {
      isFastForward = true;
    } else {
      // Walk ancestry of targetCommit
      const visited = new Set();
      const queue = [...(targetCommit.parentIds || [])];
      while (queue.length > 0) {
        const pId = queue.shift();
        if (pId === currentCommit?.id) {
          isFastForward = true;
          break;
        }
        if (!visited.has(pId)) {
          visited.add(pId);
          const pCommit = this.getCommitById(pId);
          if (pCommit && pCommit.parentIds) {
            queue.push(...pCommit.parentIds);
          }
        }
      }
    }

    if (isFastForward) {
      this.branches[this.currentBranch] = targetCommitId;
      this.headCommitId = targetCommitId;
      this.syncWorkingTreeToCommit(targetCommitId);
      return {
        output: `Updating ${currentCommit ? currentCommit.id : '0000000'}..${targetCommitId}\nFast-forward\n ${Object.keys(targetCommit.files).length} files changed`,
        error: false
      };
    }

    // Check for file content conflicts
    let hasConflict = false;
    const mergedFiles = { ...(currentCommit ? currentCommit.files : {}) };

    for (const f of Object.keys(targetCommit.files || {})) {
      if (mergedFiles[f] !== undefined && mergedFiles[f] !== targetCommit.files[f]) {
        // Conflict! Inject standard conflict markers
        hasConflict = true;
        const currentText = mergedFiles[f];
        const incomingText = targetCommit.files[f];
        const conflictedContent = `<<<<<<< HEAD\n${currentText}=======\n${incomingText}>>>>>>> ${targetBranch}\n`;
        this.files[f] = conflictedContent;
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
      parentIds: currentCommit ? [currentCommit.id, targetCommit.id] : [targetCommit.id],
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

    const targetBranch = args.find(a => !a.startsWith('-'));
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
    this.hasUsedStash = true;
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
    const headCommit = this.getLatestCommit();
    const headFiles = headCommit ? headCommit.files : {};

    // Check if unstage specific file: git reset <file> or git reset HEAD <file>
    const nonFlags = args.filter(a => !a.startsWith('-'));
    let fileToUnstage = null;

    if (nonFlags.length === 1 && (this.index[nonFlags[0]] !== undefined || headFiles[nonFlags[0]] !== undefined || this.files[nonFlags[0]] !== undefined)) {
      // If it's a file, not a revision
      if (!this.getCommitById(nonFlags[0]) && !this.branches[nonFlags[0]]) {
        fileToUnstage = nonFlags[0];
      }
    } else if (nonFlags.length === 2 && nonFlags[0] === 'HEAD') {
      fileToUnstage = nonFlags[1];
    }

    if (fileToUnstage) {
      if (headFiles[fileToUnstage] !== undefined) {
        this.index[fileToUnstage] = headFiles[fileToUnstage];
      } else {
        delete this.index[fileToUnstage];
      }
      return { output: `Unstaged changes after reset:\nM\t${fileToUnstage}`, error: false };
    }

    // Default `git reset` with no arguments: unstage all files
    if (args.length === 0) {
      this.index = { ...headFiles };
      return { output: 'Unstaged all changes.', error: false };
    }

    let mode = '--mixed';
    let target = 'HEAD~1';

    args.forEach(a => {
      if (a === '--soft' || a === '--mixed' || a === '--hard') {
        mode = a;
      } else if (!a.startsWith('-')) {
        target = a;
      }
    });

    if (!headCommit) {
      return { output: 'fatal: ambiguous argument: unknown revision', error: true };
    }

    let targetCommit = null;
    if (target === 'HEAD' || target === 'HEAD~0') {
      targetCommit = headCommit;
    } else if (target === 'HEAD~1' || target === 'HEAD^') {
      if (headCommit.parentIds && headCommit.parentIds.length > 0) {
        targetCommit = this.getCommitById(headCommit.parentIds[0]);
      }
    } else if (target === 'HEAD~2') {
      if (headCommit.parentIds && headCommit.parentIds.length > 0) {
        const p1 = this.getCommitById(headCommit.parentIds[0]);
        if (p1 && p1.parentIds && p1.parentIds.length > 0) {
          targetCommit = this.getCommitById(p1.parentIds[0]);
        }
      }
    } else if (this.branches[target]) {
      targetCommit = this.getCommitById(this.branches[target]);
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
      from: headCommit.id,
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
      // Erase working tree and index
      this.files = { ...(targetCommit.files || {}) };
      this.index = { ...(targetCommit.files || {}) };
      return { output: `HEAD is now at ${targetCommit.id} ${targetCommit.message}`, error: false };
    }

    return { output: '', error: false };
  }

  // ── 15. git revert ──
  gitRevert(args) {
    let target = args[0];
    if (!target) return { output: 'fatal: commit to revert required', error: true };
    if (target === 'HEAD') target = this.headCommitId;

    const commitToRevert = this.getCommitById(target);
    if (!commitToRevert) return { output: `fatal: bad revision '${target}'`, error: true };

    const currentCommit = this.getLatestCommit();
    const revertCommitId = generateShortHash();

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

  // ── 17. git show ──
  gitShow(args) {
    const target = args[0] || 'HEAD';

    // Check if tag
    if (this.tags[target]) {
      const tag = this.tags[target];
      const commit = this.getCommitById(tag.commitId);
      let out = `tag ${target}\n`;
      if (tag.annotated) {
        out += `Tagger: Student Developer <student@mscprpcem.tech>\nDate:   ${new Date().toISOString()}\n\n    ${tag.message}\n\n`;
      }
      if (commit) {
        out += `commit ${commit.id}\nAuthor: ${commit.author}\nDate:   ${commit.timestamp}\n\n    ${commit.message}\n`;
      }
      return { output: out.trimEnd(), error: false };
    }

    const commitId = target === 'HEAD' ? this.headCommitId : target;
    const commit = this.getCommitById(commitId);
    if (!commit) return { output: `fatal: ambiguous argument '${target}': unknown revision`, error: true };

    let out = `commit ${commit.id}\nAuthor: ${commit.author}\nDate:   ${commit.timestamp}\n\n    ${commit.message}\n\n`;
    out += `Files in commit:\n`;
    Object.keys(commit.files || {}).forEach(f => {
      out += `  + ${f}\n`;
    });
    return { output: out.trimEnd(), error: false };
  }

  // ── 18. git remote ──
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

    if (args[0] === 'rename') {
      const oldName = args[1];
      const newName = args[2];
      if (!oldName || !newName || !this.remotes[oldName]) return { output: 'fatal: remote not found', error: true };
      this.remotes[newName] = this.remotes[oldName];
      delete this.remotes[oldName];
      return { output: '', error: false };
    }

    return { output: 'usage: git remote [-v] | add <name> <url> | remove <name>', error: true };
  }

  // ── 19. git push ──
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

  // ── 20. git fetch ──
  gitFetch(args) {
    const remote = args.find(a => !a.startsWith('-') && this.remotes[a]) || 'origin';
    if (!this.remotes[remote]) {
      return { output: `fatal: '${remote}' does not appear to be a git repository`, error: true };
    }

    // Register remote commits into local commit database if provided
    if (this.remoteCommits) {
      Object.keys(this.remoteCommits).forEach(cId => {
        const rc = this.remoteCommits[cId];
        if (!this.commits.find(c => c.id === cId)) {
          this.commits.push(rc);
        }
        if (!this.remotes[remote].branches) {
          this.remotes[remote].branches = {};
        }
        this.remotes[remote].branches['main'] = cId;
      });
    }

    return {
      output: `From ${this.remotes[remote].url}\n * [new branch]      main       -> ${remote}/main`,
      error: false
    };
  }

  // ── 21. git pull ──
  gitPull(args) {
    const remote = args.find(a => !a.startsWith('-') && this.remotes[a]) || 'origin';
    if (!this.remotes[remote]) {
      return { output: `fatal: '${remote}' does not appear to be a git repository`, error: true };
    }

    this.gitFetch(args);
    return {
      output: `Already up to date.`,
      error: false
    };
  }

  // ── 22. git tag ──
  gitTag(args) {
    if (args.length === 0) {
      return { output: Object.keys(this.tags).join('\n'), error: false };
    }

    if (args.includes('-d')) {
      const dIdx = args.indexOf('-d');
      const tagToDelete = args[dIdx + 1];
      if (!tagToDelete || !this.tags[tagToDelete]) {
        return { output: `error: tag '${tagToDelete}' not found.`, error: true };
      }
      delete this.tags[tagToDelete];
      return { output: `Deleted tag '${tagToDelete}'.`, error: false };
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

  // ── 23. git reflog ──
  gitReflog() {
    let out = '';
    this.reflog.slice().reverse().forEach((r, idx) => {
      out += `${r.to || '0000000'} HEAD@{${idx}}: ${r.action}: ${r.message}\n`;
    });
    return { output: out.trimEnd() || 'HEAD@{0}: commit: initial repository state', error: false };
  }

  // ── 24. git restore ──
  gitRestore(args) {
    const isStaged = args.includes('--staged');
    const fileArgs = args.filter(a => !a.startsWith('-'));

    const headCommit = this.getLatestCommit();
    const headFiles = headCommit ? headCommit.files : {};

    const isAll = fileArgs.includes('.');
    const files = isAll ? (isStaged ? Object.keys(this.index) : Object.keys(this.files)) : fileArgs;

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

  handleCd(args) {
    if (args.length === 0 || args[0] === '~' || args[0] === '~/') {
      this.cwd = this.homeDir || '/home/student';
      return { output: '', error: false };
    }

    const rawTarget = args.join(' ').replace(/^['"](.*)['"]$/, '$1').trim();
    if (rawTarget === '..') {
      const parts = this.cwd.split('/').filter(Boolean);
      if (parts.length > 1) parts.pop();
      this.cwd = '/' + parts.join('/');
      return { output: '', error: false };
    }

    if (rawTarget === '../..' || rawTarget === '..\\..') {
      const parts = this.cwd.split('/').filter(Boolean);
      if (parts.length > 2) {
        parts.pop();
        parts.pop();
      } else if (parts.length > 1) {
        parts.pop();
      }
      this.cwd = '/' + parts.join('/');
      return { output: '', error: false };
    }

    if (rawTarget === 'Desktop') {
      this.cwd = `${this.homeDir || '/home/student'}/Desktop`;
      this.directories.add(this.cwd);
      return { output: '', error: false };
    }

    if (rawTarget.startsWith('/')) {
      this.cwd = rawTarget;
      this.directories.add(this.cwd);
      return { output: '', error: false };
    }

    // Relative directory
    const cleanRelative = rawTarget.replace(/^(\.\/|\.\\)/, '');
    this.cwd = (this.cwd.endsWith('/') ? this.cwd : this.cwd + '/') + cleanRelative;
    this.directories.add(this.cwd);
    this.directories.add(cleanRelative);
    return { output: '', error: false };
  }

  handlePwd(args) {
    return { output: this.cwd, error: false };
  }

  handleLs(args = []) {
    const isAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const isLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
    const target = args.find(a => !a.startsWith('-'));

    if (target === '.git' || target === '.git/' || target === '.git\\') {
      if (!this.isRepo) return { output: `ls: cannot access '${target}': No such file or directory`, error: true };
      if (isLong || isAll) {
        return {
          output: `total 16\ndrwxr-xr-x 7 student student 4096 Oct 29 09:00 .\ndrwxr-xr-x 4 student student 4096 Oct 29 09:00 ..\n-rw-r--r-- 1 student student   23 Oct 29 09:00 HEAD\n-rw-r--r-- 1 student student  130 Oct 29 09:00 config\n-rw-r--r-- 1 student student   73 Oct 29 09:00 description\ndrwxr-xr-x 2 student student 4096 Oct 29 09:00 hooks\ndrwxr-xr-x 2 student student 4096 Oct 29 09:00 info\ndrwxr-xr-x 4 student student 4096 Oct 29 09:00 objects\ndrwxr-xr-x 4 student student 4096 Oct 29 09:00 refs`,
          error: false
        };
      }
      return { output: 'HEAD  config  description  hooks  info  objects  refs', error: false };
    }

    if (target === 'docs' || target === 'docs/' || target === 'docs\\') {
      const docsFiles = Object.keys(this.files).filter(f => f.startsWith('docs/')).map(f => f.replace(/^docs\//, ''));
      if (docsFiles.length === 0 && this.hasDirectory('docs')) {
        return { output: 'archive.txt', error: false };
      }
      return { output: docsFiles.join('  ') || 'archive.txt', error: false };
    }

    const items = new Set();
    if (isAll) {
      items.add('.');
      items.add('..');
      if (this.isRepo) items.add('.git');
    }

    // Add subdirectories located inside current cwd
    for (const d of this.directories) {
      if (d !== '.' && d !== '..' && !d.startsWith('/')) {
        items.add(d);
      } else if (d.startsWith(this.cwd + '/') && d !== this.cwd) {
        const sub = d.slice(this.cwd.length + 1).split('/')[0];
        if (sub) items.add(sub);
      }
    }

    // Add files
    for (const f of Object.keys(this.files)) {
      if (!isAll && f.startsWith('.')) continue;
      items.add(f);
    }

    const fileList = Array.from(items);
    if (fileList.length === 0) return { output: '', error: false };

    if (isLong) {
      const lines = fileList.map(name => {
        const isDir = name === '.' || name === '..' || name === '.git' || this.hasDirectory(name);
        const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
        const size = isDir ? 4096 : ((this.files[name] || '').length || 120);
        return `${perms} 1 student student ${size.toString().padStart(5, ' ')} Oct 29 09:00 ${name}`;
      });
      return { output: lines.join('\n'), error: false };
    }

    return { output: fileList.join('  '), error: false };
  }

  handleCat(args) {
    const file = args[0];
    if (!file) return { output: 'cat: missing filename', error: true };
    if (file === '.git/HEAD' || file === '.git\\HEAD' || file.endsWith('/.git/HEAD')) {
      if (!this.isRepo) return { output: `cat: ${file}: No such file or directory`, error: true };
      return { output: `ref: refs/heads/${this.currentBranch || 'main'}\n`, error: false };
    }
    if (file === '.git/config' || file === '.git\\config' || file.endsWith('/.git/config')) {
      if (!this.isRepo) return { output: `cat: ${file}: No such file or directory`, error: true };
      return { output: `[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n\tlogallrefupdates = true\n`, error: false };
    }
    if (this.files[file] === undefined) {
      if (file === 'notes.txt') {
        return { output: 'Practice notes for Git and terminal certification.\n', error: false };
      }
      return { output: `cat: ${file}: No such file or directory`, error: true };
    }
    return { output: this.files[file], error: false };
  }

  handleTouch(args) {
    if (args.length === 0) return { output: 'touch: missing file operand', error: true };
    args.forEach(f => {
      if (!f.startsWith('-')) {
        const clean = f.replace(/^['"](.*)['"]$/, '$1');
        this.files[clean] = '';
      }
    });
    return { output: '', error: false };
  }

  handleEcho(args) {
    const text = args.join(' ');
    if (text === '$PATH') {
      return { output: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/git/bin', error: false };
    }
    if (text === '%PATH%' || text === '$env:PATH') {
      return { output: 'C:\\Windows\\system32;C:\\Windows;C:\\Program Files\\Git\\cmd', error: false };
    }
    return { output: text, error: false };
  }

  handleMkdir(args) {
    const dirs = args.filter(a => !a.startsWith('-'));
    dirs.forEach(d => {
      const clean = d.replace(/^['"](.*)['"]$/, '$1');
      this.directories.add(clean);
      if (this.cwd) {
        this.directories.add(`${this.cwd}/${clean}`);
      }
      if (clean.includes('/')) {
        const parts = clean.split('/');
        let accum = '';
        parts.forEach(p => {
          accum = accum ? `${accum}/${p}` : p;
          this.directories.add(accum);
        });
      }
    });
    return { output: '', error: false };
  }

  handleRmdir(args) {
    const target = args.find(a => !a.startsWith('-'));
    if (!target) return { output: 'rmdir: missing operand', error: true };
    const clean = target.replace(/^['"](.*)['"]$/, '$1');
    this.directories.delete(clean);
    this.directories.delete(`${this.cwd}/${clean}`);
    return { output: '', error: false };
  }

  handleCp(args) {
    const nonFlags = args.filter(a => !a.startsWith('-') && !a.startsWith('/'));
    if (nonFlags.length < 2) return { output: 'cp: missing destination file operand', error: true };
    const [src, dest] = nonFlags;
    const content = this.files[src] !== undefined ? this.files[src] : 'Practice notes backup.\n';
    this.files[dest] = content;
    return { output: '', error: false };
  }

  handleMv(args) {
    const nonFlags = args.filter(a => !a.startsWith('-') && !a.startsWith('/'));
    if (nonFlags.length < 2) return { output: 'mv: missing destination file operand', error: true };
    const [src, rawDest] = nonFlags;
    let dest = rawDest;
    if (dest.endsWith('/') || dest.endsWith('\\') || dest === 'docs' || this.hasDirectory(dest)) {
      dest = `${dest.replace(/[\\/]$/, '')}/${src}`;
    }
    const content = this.files[src] !== undefined ? this.files[src] : (this.files['notes_backup.txt'] || 'Practice notes archive.\n');
    this.files[dest] = content;
    delete this.files[src];
    return { output: '', error: false };
  }

  handleShellRm(args) {
    const isRecursive = args.includes('-rf') || args.includes('-r') || args.includes('-f') || args.includes('/s');
    const targets = args.filter(a => !a.startsWith('-') && !a.startsWith('/'));
    if (targets.length === 0) return { output: 'rm: missing operand', error: true };

    targets.forEach(rawTarget => {
      const target = rawTarget.replace(/^['"](.*)['"]$/, '$1');
      if (target === '.git' || target.endsWith('/.git') || target.endsWith('\\.git') || target === 'foundations-practice/.git' || target === 'foundations-practice\\.git') {
        this.isRepo = false;
      }
      delete this.files[target];
      if (isRecursive) {
        this.directories.delete(target);
        this.directories.delete(`${this.cwd}/${target}`);
        Object.keys(this.files).forEach(f => {
          if (f.startsWith(target + '/') || f.startsWith(target + '\\')) {
            delete this.files[f];
          }
        });
      }
    });
    return { output: '', error: false };
  }

  handleCode(args) {
    return {
      output: `Visual Studio Code launched.\nOpened workspace: ${this.cwd}`,
      error: false
    };
  }

  handleHistory(args) {
    if (this.executedCommands.length === 0) {
      return { output: '    1  pwd\n    2  ls', error: false };
    }
    const lines = this.executedCommands.map((c, i) => `${(i + 1).toString().padStart(5, ' ')}  ${c}`);
    return { output: lines.join('\n'), error: false };
  }

  handleWhich(args) {
    const target = args[0] || 'git';
    if (target === 'git') {
      return { output: '/usr/bin/git', error: false };
    }
    return { output: `/usr/bin/${target}`, error: false };
  }

  handleWinget(args) {
    return {
      output: `Found Git [Git.Git] Version 2.44.0\nThis application is licensed to you by its owner.\nMicrosoft is not responsible for, nor does it grant any licenses to, third-party packages.\nDownloading https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/Git-2.44.0-64-bit.exe\n  ██████████████████████████████  58.2 MB / 58.2 MB\nSuccessfully verified installer hash\nStarting package install...\nSuccessfully installed Git`,
      error: false
    };
  }

  handleXcodeSelect(args) {
    return {
      output: 'xcode-select: note: install requested for command line developer tools',
      error: false
    };
  }

  handleBrew(args) {
    return {
      output: `==> Downloading https://ghcr.io/v2/homebrew/core/git/manifests/2.44.0\n==> Fetching git\n==> Pouring git--2.44.0.ventura.bottle.tar.gz\n🍺  /usr/local/Cellar/git/2.44.0: 1,629 files, 49.3MB`,
      error: false
    };
  }

  handleSudo(args) {
    if (args[0] === 'apt' || args[0] === 'apt-get') {
      return this.handleApt(args.slice(1));
    }
    if (args[0] === 'dnf' || args[0] === 'yum') {
      return this.handleDnf(args.slice(1));
    }
    return { output: `[sudo] executed ${args.join(' ')}`, error: false };
  }

  handleApt(args) {
    return {
      output: `Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  git git-man liberror-perl\n0 upgraded, 3 newly installed, 0 to remove and 0 not upgraded.\nSetting up git (1:2.34.1-1ubuntu1.10) ...\nProcessing triggers for man-db ...`,
      error: false
    };
  }

  handleDnf(args) {
    return {
      output: `Updating Subscription Management repositories.\nPackage git-2.44.0-1.fc39.x86_64 is already installed.\nDependencies resolved.\nComplete!`,
      error: false
    };
  }

  handleMan(args) {
    const target = args[0] || 'git';
    if (target === 'git-clone' || target === 'clone') {
      return this.gitSubcommandHelp('clone');
    }
    if (target === 'git-init' || target === 'init') {
      return this.gitSubcommandHelp('init');
    }
    return { output: `Manual page for ${target} displayed.`, error: false };
  }

  gitClone(args) {
    const url = args.find(a => !a.startsWith('-')) || 'https://github.com/octocat/Spoon-Knife.git';
    const repoName = url.split('/').pop().replace(/\.git$/, '') || 'Spoon-Knife';
    const targetDir = args[1] && !args[1].startsWith('-') ? args[1] : repoName;

    this.directories.add(targetDir);
    this.directories.add(`${this.cwd}/${targetDir}`);

    this.isRepo = true;
    this.currentBranch = 'main';
    this.branches = { main: 'c101' };
    this.remotes = {
      origin: {
        url: url,
        branches: { main: 'c101' }
      }
    };
    this.commits = [
      {
        id: 'c100',
        message: 'Initial commit',
        parentIds: [],
        files: { 'README.md': `# ${repoName}\nRepository cloned from ${url}\n` },
        author: 'The Octocat <octocat@github.com>',
        timestamp: new Date(Date.now() - 86400000 * 30).toISOString()
      },
      {
        id: 'c101',
        message: 'Add project documentation and assets',
        parentIds: ['c100'],
        files: {
          'README.md': `# ${repoName}\nRepository cloned from ${url}\n`,
          'index.html': `<!DOCTYPE html>\n<html>\n<head><title>${repoName}</title></head>\n<body><h1>Welcome</h1></body>\n</html>\n`
        },
        author: 'The Octocat <octocat@github.com>',
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ];
    this.headCommitId = 'c101';
    this.files = { ...this.commits[1].files };
    this.index = { ...this.commits[1].files };

    return {
      output: `Cloning into '${targetDir}'...\nremote: Enumerating objects: 12, done.\nremote: Counting objects: 100% (12/12), done.\nremote: Compressing objects: 100% (8/8), done.\nremote: Total 12 (delta 2), reused 12 (delta 2), pack-reused 0\nReceiving objects: 100% (12/12), 1.84 KiB | 1.84 MiB/s, done.\nResolving deltas: 100% (2/2), done.`,
      error: false
    };
  }

  gitHelp() {
    const text = `usage: git [-v | --version] [-h | --help] <command> [<args>]

These are common Git commands supported in this Virtual Sandbox:

start a working area
   init        Create an empty Git repository or reinitialize an existing one

work on the current change
   add         Add file contents to the staging index
   restore     Restore working tree or staged files
   rm          Remove files from the working tree and from the index

examine the history and state
   diff        Show changes between commits, commit and working tree, etc
   log         Show commit logs (--oneline, --graph, <branch>)
   show        Show commit details, tags, and file snapshots
   status      Show the working tree status

grow, mark and tweak your common history
   branch      List, create, or delete branches (-a, -d, -m)
   commit      Record changes to repository (-m, -am, --amend)
   merge       Join two development histories together (--abort)
   rebase      Reapply commits on top of another base tip
   reset       Reset current HEAD or unstage files (--soft, --mixed, --hard)
   switch      Switch branches (-c to create)
   checkout    Switch branches or restore files (-b)
   tag         Create, list, or delete tags (-a -m)

collaborate
   fetch       Download objects and refs from remote repository
   pull        Fetch from and integrate with remote branch
   push        Update remote refs along with associated objects (-u)
   remote      Manage set of tracked repositories (add, -v, rm)

advanced recovery & stashing
   stash       Stash dirty working directory changes (pop, apply, list)
   revert      Revert existing commit safely without rewriting history
   cherry-pick Apply changes from an isolated commit
   reflog      Inspect HEAD movements and recover lost commits

See 'git <command> --help' or 'git help <command>' for specific command usage.`;
    return { output: text, error: false };
  }

  gitSubcommandHelp(sub) {
    const guides = {
      init: `NAME\n    git-init - Create an empty Git repository or reinitialize an existing one\n\nSYNOPSIS\n    git init [-q | --quiet] [--bare] [-b <branch-name>] [<directory>]\n\nDESCRIPTION\n    Creates an empty Git repository (.git directory) with core components: HEAD, config, objects, refs.`,
      clone: `NAME\n    git-clone - Clone a repository into a new directory\n\nSYNOPSIS\n    git clone [--template=<template-directory>] [-b <name>] [--depth <depth>] <repository> [<directory>]\n\nDESCRIPTION\n    Clones a remote repository into a target directory, downloading complete commit history and objects.`,
      status: `usage: git status [-s | --short] [-b | --branch]\n\nShow the working tree status, staged changes, unstaged modifications, and untracked files.`,
      add: `usage: git add [--verbose | -v] [--all | -A] [--] [<pathspec>...]\n\nAdd file contents from working directory to the index (staging area).`,
      commit: `usage: git commit [-a | --all] [-m <msg> | --message=<msg>] [--amend] [--allow-empty]\n\nRecord staged changes as a new atomic snapshot in repository history.`,
      branch: `usage: git branch [-a | --all] [-d | -D <branch>] [-m <old> <new>] [<new-branch> [<start-point>]]\n\nList, create, rename, or delete branches.`,
      checkout: `usage: git checkout [-b <new-branch>] [<branch> | <commit>] [-- <pathspec>...]\n\nSwitch branches, restore working tree files, or checkout a specific commit.`,
      switch: `usage: git switch [-c | --create <new-branch>] <branch>\n\nSwitch to a specified branch or create and switch to a new branch.`,
      log: `usage: git log [--oneline] [--graph] [-n <number>] [<revision-range>]\n\nShow commit history logs and revision details.`,
      diff: `usage: git diff [--staged | --cached] [<commit>..<commit>] [--] [<path>...]\n\nShow changes between commits, commit and working tree, or staged index.`,
      merge: `usage: git merge [--abort] <commit>...\n\nJoin two or more development histories together (supports Fast-Forward and 3-way merge).`,
      rebase: `usage: git rebase [--abort | --continue] <upstream> [<branch>]\n\nReapply commits on top of another base tip for linear history.`,
      stash: `usage: git stash [save [<message>]] [pop] [apply] [list] [show] [clear]\n\nStash the changes in a dirty working directory away.`,
      reset: `usage: git reset [--soft | --mixed | --hard] [<commit>] | git reset [<commit>] <pathspec>...\n\nReset current HEAD to the specified state or unstage files.`,
      revert: `usage: git revert <commit>...\n\nRevert an existing commit by creating a new inverse commit preserving history.`,
      'cherry-pick': `usage: git cherry-pick <commit>...\n\nApply the changes introduced by an existing commit onto current HEAD.`,
      remote: `usage: git remote [-v | --verbose] | add <name> <url> | remove <name> | rename <old> <new>\n\nManage set of tracked remote repositories.`,
      push: `usage: git push [-u | --set-upstream] [<repository> [<refspec>...]]\n\nUpdate remote refs along with associated objects.`,
      pull: `usage: git pull [<repository> [<refspec>...]]\n\nFetch from and integrate with another repository or a local branch.`,
      fetch: `usage: git fetch [<repository> [<refspec>...]]\n\nDownload objects and refs from another repository without merging.`,
      tag: `usage: git tag [-a] [-m <msg>] [-d <tagname>] [<tagname> [<commit>]]\n\nCreate, list, or delete a tag object signed or annotated.`,
      reflog: `usage: git reflog [show] [<ref>]\n\nManage reflog information recording HEAD updates and movements.`,
      restore: `usage: git restore [--staged] [--worktree] [--] <pathspec>...\n\nRestore specified paths in working tree or staging index.`,
      show: `usage: git show [<options>] [<object>...]\n\nShow various types of objects (commits, tags, trees).`
    };

    if (guides[sub]) {
      return { output: guides[sub], error: false };
    }
    return { output: `No manual entry for git-${sub}. Type 'git --help' for common commands.`, error: false };
  }

  handleHelp() {
    const text = `
Microsoft Student Club Virtual Git Shell
----------------------------------------
Supported Git Commands:
  git init, status, add, rm, commit -m "<msg>" [-a] [--amend]
  git branch [-a] [-d] [-m], checkout [-b], switch [-c]
  git log [--oneline] [--graph] [<branch>], diff [--staged]
  git merge [--abort], rebase, stash [pop|apply|list|clear]
  git reset [--soft|--mixed|--hard] [<file>], revert, cherry-pick
  git remote [add|rm|-v], push [-u], fetch, pull, tag [-a], reflog, restore, show
  git --help, git <command> --help, git --version

Supported Shell Utilities:
  ls [-la], cat, touch, echo "text" > file, rm [-rf], cp, mv, pwd, whoami, date, clear, help
`;
    return { output: text.trim(), error: false };
  }
}
