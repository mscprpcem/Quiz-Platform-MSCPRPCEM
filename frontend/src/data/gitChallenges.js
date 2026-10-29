// Git Interactive Practice Challenges (70 Hands-on Labs)
// Designed for MSC PRPCEM Assessment & Learning Platform
// Part 1: Day 0 Hands-On Terminal & CLI Practice (Challenges 1-25)
// Part 2: Day 1 Hands-On Git Installation & Environment Verification (Challenges 26-50)
// Part 3: Intermediate Git Branching, Merging & Advanced Workflows (Challenges 51-70)

export const GIT_CHALLENGES = [
  // ═══════════════════════════════════════════════════════
  // PART 1: DAY 0 HANDS-ON TERMINAL & CLI PRACTICE
  // ═══════════════════════════════════════════════════════
// ── Challenge 1 ──
  {
    id: 'cli-01-pwd',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Print Current Working Directory (pwd)',
    difficulty: 'Basic',
    category: 'CLI Basics',
    tags: ['pwd', 'Terminal', 'CLI', 'Navigation'],
    interviewFrequency: 'Core CLI Foundation',
    scenario: 'Print the full, absolute file path of the directory you are currently standing in.',
    description: `
### Background & Context
When operating inside a command-line interface (CLI) or terminal, your shell maintains a pointer to an active location on the disk known as the **Current Working Directory (CWD)**. All relative file paths resolve against this directory.

---

### Problem Statement & Task
Execute the standard POSIX command to print the full, absolute file path of the directory you are currently standing in.

---

**Example 1**:

Input:
\`\`\`bash
$ pwd
\`\`\`

Output:
\`\`\`
/home/student/project
\`\`\`

Explanation:
The command \`pwd\` stands for **Print Working Directory**. It resolves all symbolic links and prints the full path starting from the root filesystem down to your current folder.

---

**Cross-Platform Reference**:
| Environment | Command Syntax | Description |
| :--- | :--- | :--- |
| **Bash / Zsh / macOS / Linux** | \`pwd\` | Print working directory |
| **Windows PowerShell** | \`pwd\` or \`Get-Location\` | Get active session path |
| **Windows Command Prompt (cmd)** | \`cd\` | Displays current directory when run without arguments |

---

**Acceptance Criteria**:
1. Run \`pwd\` (or \`Get-Location\`) in the interactive terminal.
2. Verify the terminal outputs the absolute directory path.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {
        'notes.txt': 'Practice notes for CLI certification.\n'
      }
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('pwd') || repo.hasExecutedCommand('Get-Location') || repo.lastCommand === 'cd') {
        return { passed: true, message: 'Excellent! You printed your current working directory.' };
      }
      return { passed: false, message: 'Run `pwd` (or `Get-Location`) in the terminal to inspect your current directory.' };
    },
    objectives: [
      { label: 'Run pwd to inspect current directory', done: (repo) => repo.hasExecutedCommand('pwd') || repo.hasExecutedCommand('Get-Location') || repo.lastCommand === 'cd' },
      { label: 'Verify terminal outputs absolute filesystem path', done: (repo) => repo.hasExecutedCommand('pwd') || repo.hasExecutedCommand('Get-Location') || repo.lastCommand === 'cd' }
    ],
    hints: [
      'Type `pwd` and press Enter.',
      'On Windows Command Prompt, running `cd` without arguments also prints your current directory.',
      'On Windows PowerShell, `Get-Location` or `pwd` works.'
    ]
  },

  // ── Challenge 2 ──
  {
    id: 'cli-02-ls',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'List Directory Contents (ls)',
    difficulty: 'Basic',
    category: 'Directory Listing',
    tags: ['ls', 'dir', 'Listing', 'CLI'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'List all visible files and folders in your current directory.',
    description: `
### Background & Context
Before modifying or running code in a directory, you must inspect the files and folders already present. The \`ls\` utility is the most frequent command used in command-line environments.

---

### Problem Statement & Task
List all visible files and folders located in your current working directory.

---

**Example 1**:

Input:
\`\`\`bash
$ ls
\`\`\`

Output:
\`\`\`
package.json  README.md  src
\`\`\`

Explanation:
Visible files and directories are printed in space-separated columns. Hidden files (starting with a dot \`.\`) are omitted by default.

---

**Cross-Platform Reference**:
| Environment | Command Syntax | Description |
| :--- | :--- | :--- |
| **Bash / Linux / macOS** | \`ls\` | List non-hidden directory contents |
| **Windows Command Prompt (cmd)** | \`dir\` | Directory listing |
| **Windows PowerShell** | \`ls\` or \`dir\` or \`Get-ChildItem\` | List child items |

---

**Acceptance Criteria**:
1. Execute \`ls\` (or \`dir\`) in the terminal.
2. Confirm the directory contents are listed on screen.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {
        'index.js': 'console.log("hello world");\n',
        'package.json': '{\n  "name": "project"\n}\n',
        'README.md': '# Project\n'
      }
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('ls') || repo.hasExecutedCommand('dir') || repo.hasExecutedCommand('Get-ChildItem')) {
        return { passed: true, message: 'Great job! You inspected visible files in your working directory.' };
      }
      return { passed: false, message: 'Run `ls` (or `dir`) in the terminal to list your directory contents.' };
    },
    objectives: [
      { label: 'Execute ls to list visible directory contents', done: (repo) => repo.hasExecutedCommand('ls') || repo.hasExecutedCommand('dir') || repo.hasExecutedCommand('Get-ChildItem') },
      { label: 'Inspect non-hidden files in terminal output', done: (repo) => repo.hasExecutedCommand('ls') || repo.hasExecutedCommand('dir') || repo.hasExecutedCommand('Get-ChildItem') }
    ],
    hints: [
      'Type `ls` and press Enter.',
      'On Windows Command Prompt, type `dir`.'
    ]
  },

  // ── Challenge 3 ──
  {
    id: 'cli-03-ls-la',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Detailed & Hidden File Inspection (ls -la)',
    difficulty: 'Basic',
    category: 'Directory Listing',
    tags: ['ls', 'hidden-files', 'permissions', 'CLI'],
    interviewFrequency: 'Core CLI Foundation',
    scenario: 'List every file and folder in the current directory, including hidden files starting with a dot (.), in a detailed list format.',
    description: `
### Background & Context
Unix systems conceal configuration files (like \`.gitignore\`, \`.env\`, and the \`.git\` metadata folder) by prefixing their names with a dot (\`.\`). To see hidden files and inspect file permissions, owners, byte sizes, and timestamps, combine the \`-l\` (long format) and \`-a\` (all files) flags.

---

### Problem Statement & Task
Execute the command that lists every file and folder in the current directory, including hidden dotfiles, in a detailed list format.

---

**Example 1**:

Input:
\`\`\`bash
$ ls -la
\`\`\`

Output:
\`\`\`
drwxr-xr-x 1 student student  4096 Oct 29 09:00 .
drwxr-xr-x 1 student student  4096 Oct 29 09:00 ..
-rw-r--r-- 1 student student   120 Oct 29 09:00 .env
-rw-r--r-- 1 student student   350 Oct 29 09:00 README.md
\`\`\`

Explanation:
- \`-l\` enables the long list format showing file permissions, owner, size, and date.
- \`-a\` displays hidden files starting with \`.\`, including current directory (\`.\`) and parent directory (\`..\`).

---

**Cross-Platform Reference**:
- **Bash / macOS / Linux**: \`ls -la\` (or \`ls -al\`)
- **Windows PowerShell**: \`Get-ChildItem -Force\` (or \`ls -Force\`)
- **Windows Command Prompt**: \`dir /a\`

---

**Acceptance Criteria**:
1. Execute \`ls -la\` or \`ls -al\` in the terminal.
2. Confirm permissions, file sizes, and dotfiles are revealed.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {
        '.env': 'SECRET_KEY=supersecret123\n',
        'README.md': '# Project Notes\n'
      }
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('ls -la') || repo.hasExecutedCommand('ls -al') || repo.hasExecutedCommand('ls -a') || repo.hasExecutedCommand('Get-ChildItem -Force')) {
        return { passed: true, message: 'Perfect! You listed all files including hidden dotfiles and permission details.' };
      }
      return { passed: false, message: 'Run `ls -la` (or `Get-ChildItem -Force`) to reveal hidden files in long list format.' };
    },
    objectives: [
      { label: 'Pass -a and -l flags to ls', done: (repo) => repo.hasExecutedCommand('ls -la') || repo.hasExecutedCommand('ls -al') || repo.hasExecutedCommand('ls -a') || repo.hasExecutedCommand('Get-ChildItem -Force') },
      { label: 'Confirm .env and hidden dotfiles are displayed', done: (repo) => repo.hasExecutedCommand('ls -la') || repo.hasExecutedCommand('ls -al') || repo.hasExecutedCommand('ls -a') || repo.hasExecutedCommand('Get-ChildItem -Force') }
    ],
    hints: [
      'Type `ls -la` and press Enter.',
      'You can also type `ls -al` or `ls -a -l`.'
    ]
  },

  // ── Challenge 4 ──
  {
    id: 'cli-04-mkdir-git-prep',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Create Directory (mkdir git-prep)',
    difficulty: 'Basic',
    category: 'Directory Management',
    tags: ['mkdir', 'Directories', 'CLI'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Create a new folder named git-prep in your current working location.',
    description: `
### Background & Context
Directories organize source code and project modules. The \`mkdir\` (Make Directory) command creates one or more new directories in your filesystem.

---

### Problem Statement & Task
Create a new directory named **\`git-prep\`** inside your current working directory.

---

**Example 1**:

Input:
\`\`\`bash
$ mkdir git-prep
\`\`\`

Verification:
\`\`\`bash
$ ls
git-prep
\`\`\`

Explanation:
\`mkdir git-prep\` creates the directory. Running \`ls\` confirms \`git-prep\` is now present.

---

**Acceptance Criteria**:
1. Run \`mkdir git-prep\` in the terminal.
2. Verify the directory \`git-prep\` has been created.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasDirectory('git-prep')) {
        return { passed: true, message: 'Excellent! Directory "git-prep" was created successfully.' };
      }
      return { passed: false, message: 'Directory "git-prep" not found. Run `mkdir git-prep`.' };
    },
    objectives: [
      { label: 'Create folder git-prep using mkdir', done: (repo) => repo.hasDirectory('git-prep') },
      { label: 'Confirm git-prep appears in directory structure', done: (repo) => repo.hasDirectory('git-prep') }
    ],
    hints: [
      'Type `mkdir git-prep` and press Enter.',
      'Run `ls` afterwards to verify the new folder appears.'
    ]
  },

  // ── Challenge 5 ──
  {
    id: 'cli-05-cd-git-prep',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Navigate into Directory (cd git-prep)',
    difficulty: 'Basic',
    category: 'Navigation',
    tags: ['cd', 'Navigation', 'CLI'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Navigate into the newly created git-prep folder.',
    description: `
### Background & Context
After creating a folder, navigate into it to make it your active working directory. The \`cd\` (Change Directory) command shifts your shell's current working directory pointer.

---

### Problem Statement & Task
Change directory into the folder named **\`git-prep\`**.

---

**Example 1**:

Input:
\`\`\`bash
$ cd git-prep
$ pwd
\`\`\`

Output:
\`\`\`
/home/student/project/git-prep
\`\`\`

Explanation:
Your terminal prompt and \`pwd\` now reflect that you are standing inside \`/home/student/project/git-prep\`.

---

**Acceptance Criteria**:
1. Run \`cd git-prep\` in the terminal.
2. Confirm current working directory ends in \`/git-prep\`.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      directories: ['git-prep'],
      files: {}
    },
    validation: (repo) => {
      if (repo.getCwd().endsWith('git-prep')) {
        return { passed: true, message: 'Great! You navigated into "git-prep".' };
      }
      return { passed: false, message: 'You have not entered git-prep yet. Run `cd git-prep`.' };
    },
    objectives: [
      { label: 'Change directory to git-prep', done: (repo) => repo.getCwd().endsWith('git-prep') },
      { label: 'Verify terminal prompt updates to git-prep', done: (repo) => repo.getCwd().endsWith('git-prep') }
    ],
    hints: [
      'Type `cd git-prep` and press Enter.',
      'Check `pwd` to confirm your path ends in `/git-prep`.'
    ]
  },

  // ── Challenge 6 ──
  {
    id: 'cli-06-cd-parent',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Navigate Up to Parent Directory (cd ..)',
    difficulty: 'Basic',
    category: 'Navigation',
    tags: ['cd', 'Parent Directory', 'Navigation'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Move back up one level into the parent directory.',
    description: `
### Background & Context
In Unix filesystems, two special relative directory references exist in every folder:
- \`.\` represents the current directory.
- \`..\` represents the parent directory (one level up).

---

### Problem Statement & Task
Move back up one level into the parent directory from your current position.

---

**Example 1**:

Input:
\`\`\`bash
# Starting location: /home/student/project/git-prep
$ cd ..
$ pwd
\`\`\`

Output:
\`\`\`
/home/student/project
\`\`\`

Explanation:
\`cd ..\` moves you out of \`git-prep\` and back into \`/home/student/project\`.

---

**Acceptance Criteria**:
1. Execute \`cd ..\` in the terminal.
2. Confirm you have exited \`git-prep\` and returned to the parent folder.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project/git-prep',
      directories: ['/home/student/project', '/home/student/project/git-prep'],
      files: {}
    },
    validation: (repo) => {
      if (!repo.getCwd().endsWith('git-prep')) {
        return { passed: true, message: 'Awesome! You navigated back up to the parent directory.' };
      }
      return { passed: false, message: 'Still in git-prep. Run `cd ..` to ascend to the parent directory.' };
    },
    objectives: [
      { label: 'Execute cd .. to ascend to parent folder', done: (repo) => !repo.getCwd().endsWith('git-prep') },
      { label: 'Confirm current directory is parent directory', done: (repo) => !repo.getCwd().endsWith('git-prep') }
    ],
    hints: [
      'Type `cd ..` with a space between `cd` and `..`.',
      'Run `pwd` to confirm you are in the parent directory.'
    ]
  },

  // ── Challenge 7 ──
  {
    id: 'cli-07-mkdir-spaces',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Create Folder with Spaces in Name',
    difficulty: 'Basic',
    category: 'Directory Management',
    tags: ['mkdir', 'Quoting', 'Spaces'],
    interviewFrequency: 'Standard Technical Round',
    scenario: 'Create a folder with spaces in its name called cert practice without causing an error.',
    description: `
### Background & Context
By default, the shell treats spaces as argument delimiters. If you type \`mkdir cert practice\`, the shell interprets \`cert\` and \`practice\` as two distinct directory names and creates two separate folders. To create a single folder containing a space, you must quote or escape the name.

---

### Problem Statement & Task
Create a single directory named **\`cert practice\`** without creating two separate folders.

---

**Example 1**:

Input:
\`\`\`bash
$ mkdir "cert practice"
$ ls
\`\`\`

Output:
\`\`\`
cert practice
\`\`\`

Explanation:
Enclosing the name in double quotes \`"cert practice"\` (or single quotes \`'cert practice'\`, or escaping with backslash \`cert\\ practice\`) preserves the space as a literal character.

---

**Acceptance Criteria**:
1. Run \`mkdir "cert practice"\` (or \`mkdir cert\\ practice\`).
2. Verify that a single folder \`cert practice\` is created, not \`cert\` and \`practice\`.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasDirectory('cert practice') && !repo.hasDirectory('cert')) {
        return { passed: true, message: 'Excellent! You properly quoted the directory name with spaces.' };
      }
      if (repo.hasDirectory('cert') && repo.hasDirectory('practice')) {
        return { passed: false, message: 'Two folders were created: "cert" and "practice". You must quote the name: `mkdir "cert practice"`.' };
      }
      return { passed: false, message: 'Create the directory using `mkdir "cert practice"`.' };
    },
    objectives: [
      { label: 'Create folder using quotes: mkdir "cert practice"', done: (repo) => repo.hasDirectory('cert practice') },
      { label: 'Verify single directory created without splitting', done: (repo) => repo.hasDirectory('cert practice') && !repo.hasDirectory('cert') }
    ],
    hints: [
      'Wrap the folder name in quotes: `mkdir "cert practice"`.',
      'Alternatively, escape the space with a backslash: `mkdir cert\\ practice`.'
    ]
  },

  // ── Challenge 8 ──
  {
    id: 'cli-08-cd-spaces',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Navigate into Directory with Spaces',
    difficulty: 'Basic',
    category: 'Navigation',
    tags: ['cd', 'Quoting', 'Spaces'],
    interviewFrequency: 'Standard Technical Round',
    scenario: 'Change directory into the folder named cert practice.',
    description: `
### Background & Context
Just like \`mkdir\`, navigation with \`cd\` requires quoting or escaping when target directory names contain spaces.

---

### Problem Statement & Task
Change directory into the folder named **\`cert practice\`**.

---

**Example 1**:

Input:
\`\`\`bash
$ cd "cert practice"
$ pwd
\`\`\`

Output:
\`\`\`
/home/student/project/cert practice
\`\`\`

---

**Acceptance Criteria**:
1. Run \`cd "cert practice"\` or \`cd cert\\ practice\`.
2. Confirm the active terminal prompt and working directory show \`cert practice\`.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      directories: ['cert practice'],
      files: {}
    },
    validation: (repo) => {
      if (repo.getCwd().endsWith('cert practice')) {
        return { passed: true, message: 'Great! You navigated into "cert practice".' };
      }
      return { passed: false, message: 'Run `cd "cert practice"` to enter the directory.' };
    },
    objectives: [
      { label: 'Enter folder with quotes: cd "cert practice"', done: (repo) => repo.getCwd().endsWith('cert practice') },
      { label: 'Confirm active prompt shows cert practice', done: (repo) => repo.getCwd().endsWith('cert practice') }
    ],
    hints: [
      'Type `cd "cert practice"` and press Enter.',
      'You can also type `cd cert\\ practice`.'
    ]
  },

  // ── Challenge 9 ──
  {
    id: 'cli-09-cd-home',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Return to Home Directory (cd ~)',
    difficulty: 'Basic',
    category: 'Navigation',
    tags: ['cd', 'Home Directory', 'Tilde'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Navigate directly to your computer user\'s Home directory in one step.',
    description: `
### Background & Context
The tilde symbol \`~\` is an alias recognized by shells that expands to your user's personal home directory (e.g., \`/home/student\` on Linux, \`/Users/student\` on macOS, or \`C:\\Users\\student\` on Windows). In addition, running \`cd\` alone with no arguments also defaults to returning to your home directory.

---

### Problem Statement & Task
Navigate directly to your user's Home directory in a single command.

---

**Example 1**:

Input:
\`\`\`bash
$ cd ~
$ pwd
\`\`\`

Output:
\`\`\`
/home/student
\`\`\`

---

**Acceptance Criteria**:
1. Run \`cd ~\` (or \`cd\`) in the terminal.
2. Confirm your current working directory is \`/home/student\`.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project/cert practice',
      homeDir: '/home/student',
      files: {}
    },
    validation: (repo) => {
      if (repo.getCwd() === '/home/student' || repo.getCwd() === '~') {
        return { passed: true, message: 'Perfect! You returned to your home directory in one step.' };
      }
      return { passed: false, message: 'Navigate to your home directory using `cd ~` or `cd`.' };
    },
    objectives: [
      { label: 'Execute cd ~ to return home', done: (repo) => repo.getCwd() === '/home/student' || repo.getCwd() === '~' },
      { label: 'Verify path is user root /home/student', done: (repo) => repo.getCwd() === '/home/student' || repo.getCwd() === '~' }
    ],
    hints: [
      'Type `cd ~` and press Enter.',
      'Typing `cd` alone also navigates to your home directory.'
    ]
  },

  // ── Challenge 10 ──
  {
    id: 'cli-10-cd-desktop',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Navigate to Desktop Folder',
    difficulty: 'Basic',
    category: 'Navigation',
    tags: ['cd', 'Desktop', 'Navigation'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Navigate directly to your Desktop folder from your home directory.',
    description: `
### Background & Context
From your user home directory, standard user folders such as \`Desktop\`, \`Downloads\`, and \`Documents\` are accessible via relative paths.

---

### Problem Statement & Task
Navigate directly into your **\`Desktop\`** folder from your home directory.

---

**Example 1**:

Input:
\`\`\`bash
$ cd Desktop
$ pwd
\`\`\`

Output:
\`\`\`
/home/student/Desktop
\`\`\`

---

**Acceptance Criteria**:
1. Run \`cd Desktop\` from your home directory.
2. Confirm your path ends in \`/Desktop\`.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student',
      homeDir: '/home/student',
      directories: ['/home/student/Desktop'],
      files: {}
    },
    validation: (repo) => {
      if (repo.getCwd().endsWith('Desktop')) {
        return { passed: true, message: 'Great! You navigated into the Desktop folder.' };
      }
      return { passed: false, message: 'Run `cd Desktop` to enter your Desktop folder.' };
    },
    objectives: [
      { label: 'Navigate into Desktop: cd Desktop', done: (repo) => repo.getCwd().endsWith('Desktop') },
      { label: 'Confirm path ends in /Desktop', done: (repo) => repo.getCwd().endsWith('Desktop') }
    ],
    hints: [
      'Type `cd Desktop` and press Enter.',
      'Check `pwd` to confirm your location.'
    ]
  },

  // ── Challenge 11 ──
  {
    id: 'cli-11-clear',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Clear Screen Buffer (clear / cls)',
    difficulty: 'Basic',
    category: 'Terminal Control',
    tags: ['clear', 'cls', 'Terminal'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Clear the terminal screen buffer of clutter without closing the terminal window.',
    description: `
### Background & Context
When running extensive commands, the terminal buffer fills with logs and previous command output. You can wipe the scrollback buffer clean without killing your active shell session.

---

### Problem Statement & Task
Clear the terminal screen buffer of clutter without closing the terminal window.

---

**Example 1**:

Input:
\`\`\`bash
$ clear
\`\`\`

Explanation:
The terminal scrollback buffer is cleared and the prompt returns to the top line.

---

**Cross-Platform Reference**:
- **Bash / Linux / macOS**: \`clear\` or keyboard shortcut \`Ctrl + L\`
- **Windows Command Prompt / PowerShell**: \`cls\` or \`Clear-Host\`

---

**Acceptance Criteria**:
1. Execute \`clear\` or \`cls\` in the terminal.
2. Confirm the screen resets to a clean prompt.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('clear') || repo.hasExecutedCommand('cls') || repo.hasExecutedCommand('Clear-Host')) {
        return { passed: true, message: 'Screen cleared! Clean slate restored.' };
      }
      return { passed: false, message: 'Type `clear` (or `cls` on Windows) to clear the terminal.' };
    },
    objectives: [
      { label: 'Execute clear or cls command', done: (repo) => repo.hasExecutedCommand('clear') || repo.hasExecutedCommand('cls') || repo.hasExecutedCommand('Clear-Host') },
      { label: 'Reset terminal screen to top prompt', done: (repo) => repo.hasExecutedCommand('clear') || repo.hasExecutedCommand('cls') || repo.hasExecutedCommand('Clear-Host') }
    ],
    hints: [
      'Type `clear` and press Enter.',
      'On Windows Command Prompt, type `cls`.'
    ]
  },

  // ── Challenge 12 ──
  {
    id: 'cli-12-touch-notes',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Create Empty File (touch notes.txt)',
    difficulty: 'Basic',
    category: 'File Management',
    tags: ['touch', 'File Creation', 'CLI'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Create an empty plain-text file named notes.txt inside your current directory.',
    description: `
### Background & Context
The \`touch\` utility creates an empty file if the specified file does not exist, or updates its modification timestamp if it already exists.

---

### Problem Statement & Task
Create an empty plain-text file named **\`notes.txt\`** inside your current directory.

---

**Example 1**:

Input:
\`\`\`bash
$ touch notes.txt
$ ls
\`\`\`

Output:
\`\`\`
notes.txt
\`\`\`

---

**Cross-Platform Reference**:
- **Bash / Linux / macOS**: \`touch notes.txt\`
- **Windows PowerShell**: \`New-Item notes.txt\` or \`touch notes.txt\`
- **Windows Command Prompt**: \`type nul > notes.txt\`

---

**Acceptance Criteria**:
1. Run \`touch notes.txt\` in the terminal.
2. Verify \`notes.txt\` is listed in your directory.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.readFile('notes.txt') !== null) {
        return { passed: true, message: 'Awesome! File "notes.txt" was created successfully.' };
      }
      return { passed: false, message: 'File "notes.txt" not found. Run `touch notes.txt`.' };
    },
    objectives: [
      { label: 'Create notes.txt with touch command', done: (repo) => repo.readFile('notes.txt') !== null },
      { label: 'Confirm file exists in working directory', done: (repo) => repo.readFile('notes.txt') !== null }
    ],
    hints: [
      'Type `touch notes.txt` and press Enter.',
      'Run `ls` to verify the file was created.'
    ]
  },

  // ── Challenge 13 ──
  {
    id: 'cli-13-touch-readme',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Create Markdown File (touch README.md)',
    difficulty: 'Basic',
    category: 'File Management',
    tags: ['touch', 'Markdown', 'Documentation'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Create an empty Markdown file named README.md.',
    description: `
### Background & Context
A \`README.md\` file is the universally recognized entry point for software repositories on GitHub and GitLab. It is written in Markdown format.

---

### Problem Statement & Task
Create an empty Markdown file named **\`README.md\`** in your current directory.

---

**Example 1**:

Input:
\`\`\`bash
$ touch README.md
$ ls
\`\`\`

Output:
\`\`\`
README.md
\`\`\`

---

**Acceptance Criteria**:
1. Run \`touch README.md\` in the terminal.
2. Verify that \`README.md\` exists in the directory.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.readFile('README.md') !== null) {
        return { passed: true, message: 'Great! README.md documentation file created.' };
      }
      return { passed: false, message: 'README.md not found. Run `touch README.md`.' };
    },
    objectives: [
      { label: 'Create README.md using touch', done: (repo) => repo.readFile('README.md') !== null },
      { label: 'Confirm README.md appears in directory', done: (repo) => repo.readFile('README.md') !== null }
    ],
    hints: [
      'Type `touch README.md` and press Enter.',
      'File names in Git and Linux are case-sensitive.'
    ]
  },

  // ── Challenge 14 ──
  {
    id: 'cli-14-touch-env',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Create Hidden File (touch .env)',
    difficulty: 'Basic',
    category: 'File Management',
    tags: ['touch', 'dotfile', 'hidden-file', 'Security'],
    interviewFrequency: 'Standard Technical Round',
    scenario: 'Create a hidden empty file named .env.',
    description: `
### Background & Context
Files beginning with a dot \`.\` are hidden by default in Unix-like operating systems. In web development, \`.env\` holds secret environment variables such as database credentials and API keys.

---

### Problem Statement & Task
Create a hidden empty file named **\`.env\`**.

---

**Example 1**:

Input:
\`\`\`bash
$ touch .env
$ ls
# .env is hidden
$ ls -la
.env
\`\`\`

Explanation:
Running \`ls\` hides \`.env\`, but \`ls -la\` (or \`Get-ChildItem -Force\`) reveals it.

---

**Acceptance Criteria**:
1. Run \`touch .env\` in the terminal.
2. Confirm \`.env\` exists as a hidden dotfile in the directory.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.readFile('.env') !== null) {
        return { passed: true, message: 'Awesome! Hidden configuration file .env created.' };
      }
      return { passed: false, message: '.env not found. Run `touch .env`.' };
    },
    objectives: [
      { label: 'Create dotfile .env using touch', done: (repo) => repo.readFile('.env') !== null },
      { label: 'Verify .env is visible under ls -la', done: (repo) => repo.readFile('.env') !== null }
    ],
    hints: [
      'Type `touch .env` and press Enter.',
      'Remember the leading dot: `.env`.'
    ]
  },

  // ── Challenge 15 ──
  {
    id: 'cli-15-cat-notes',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Display File Contents (cat notes.txt)',
    difficulty: 'Basic',
    category: 'File Inspection',
    tags: ['cat', 'type', 'Inspection', 'CLI'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Display the contents of notes.txt directly inside the terminal window without opening a text editor.',
    description: `
### Background & Context
The \`cat\` (concatenate) command outputs the complete contents of one or more files directly into the terminal standard output (\`stdout\`) without launching a full-screen text editor.

---

### Problem Statement & Task
Display the contents of **\`notes.txt\`** directly inside the terminal window.

---

**Example 1**:

Input:
\`\`\`bash
$ cat notes.txt
\`\`\`

Output:
\`\`\`
Practice notes for Git and terminal certification.
\`\`\`

---

**Cross-Platform Reference**:
- **Bash / Linux / macOS**: \`cat notes.txt\`
- **Windows Command Prompt**: \`type notes.txt\`
- **Windows PowerShell**: \`Get-Content notes.txt\` or \`cat notes.txt\`

---

**Acceptance Criteria**:
1. Run \`cat notes.txt\` (or \`type notes.txt\`) in the terminal.
2. Confirm file content is printed to the terminal stdout.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {
        'notes.txt': 'Practice notes for Git and terminal certification.\n'
      }
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('cat notes.txt') || repo.hasExecutedCommand('type notes.txt') || repo.hasExecutedCommand('Get-Content notes.txt')) {
        return { passed: true, message: 'Excellent! You inspected notes.txt directly from the CLI.' };
      }
      return { passed: false, message: 'Run `cat notes.txt` to print the contents of notes.txt.' };
    },
    objectives: [
      { label: 'Run cat notes.txt to print file content', done: (repo) => repo.hasExecutedCommand('cat notes.txt') || repo.hasExecutedCommand('type notes.txt') || repo.hasExecutedCommand('Get-Content notes.txt') },
      { label: 'View file lines directly in terminal output', done: (repo) => repo.hasExecutedCommand('cat notes.txt') || repo.hasExecutedCommand('type notes.txt') || repo.hasExecutedCommand('Get-Content notes.txt') }
    ],
    hints: [
      'Type `cat notes.txt` and press Enter.',
      'On Windows CMD, `type notes.txt` produces the same output.'
    ]
  },

  // ── Challenge 16 ──
  {
    id: 'cli-16-mkdir-multiple',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Create Multiple Directories (mkdir docs src)',
    difficulty: 'Basic',
    category: 'Directory Management',
    tags: ['mkdir', 'Batch Operations', 'CLI'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Create two folders named docs and src using a single command.',
    description: `
### Background & Context
Commands like \`mkdir\` accept multiple space-separated arguments to perform batch directory creation in a single shell execution.

---

### Problem Statement & Task
Create two folders named **\`docs\`** and **\`src\`** using a single command.

---

**Example 1**:

Input:
\`\`\`bash
$ mkdir docs src
$ ls
\`\`\`

Output:
\`\`\`
docs  src
\`\`\`

---

**Acceptance Criteria**:
1. Execute \`mkdir docs src\` in one command.
2. Verify both \`docs\` and \`src\` directories are created.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasDirectory('docs') && repo.hasDirectory('src')) {
        return { passed: true, message: 'Great job! Both "docs" and "src" directories created in one command.' };
      }
      return { passed: false, message: 'Run `mkdir docs src` to create both directories.' };
    },
    objectives: [
      { label: 'Run mkdir docs src in single command', done: (repo) => repo.hasDirectory('docs') && repo.hasDirectory('src') },
      { label: 'Verify docs and src both exist', done: (repo) => repo.hasDirectory('docs') && repo.hasDirectory('src') }
    ],
    hints: [
      'Type `mkdir docs src` with a space separating the names.',
      'Run `ls` to verify both directories appear.'
    ]
  },

  // ── Challenge 17 ──
  {
    id: 'cli-17-mkdir-nested',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Create Nested Directories (mkdir -p parent/child/grandchild)',
    difficulty: 'Easy',
    category: 'Directory Management',
    tags: ['mkdir -p', 'Nested Directories', 'CLI'],
    interviewFrequency: 'Standard Technical Round',
    scenario: 'Create a nested directory structure parent/child/grandchild in one command without error.',
    description: `
### Background & Context
By default, \`mkdir path/subpath\` fails if the intermediate parent folders do not already exist. Passing the \`-p\` (parents) flag creates any missing parent directories on the fly.

---

### Problem Statement & Task
Create a three-level nested directory structure **\`parent/child/grandchild\`** in a single command without error.

---

**Example 1**:

Input:
\`\`\`bash
$ mkdir -p parent/child/grandchild
$ cd parent/child/grandchild
$ pwd
\`\`\`

Output:
\`\`\`
/home/student/project/parent/child/grandchild
\`\`\`

---

**Acceptance Criteria**:
1. Run \`mkdir -p parent/child/grandchild\` in the terminal.
2. Confirm \`parent\`, \`child\`, and \`grandchild\` nested directory structure is created.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasDirectory('parent/child/grandchild') || (repo.hasDirectory('parent') && repo.hasDirectory('grandchild'))) {
        return { passed: true, message: 'Excellent! Nested directory tree created with -p flag.' };
      }
      return { passed: false, message: 'Run `mkdir -p parent/child/grandchild` to create the nested tree.' };
    },
    objectives: [
      { label: 'Pass -p flag to create nested path', done: (repo) => repo.hasDirectory('parent/child/grandchild') || (repo.hasDirectory('parent') && repo.hasDirectory('grandchild')) },
      { label: 'Verify all three nested directories exist', done: (repo) => repo.hasDirectory('parent/child/grandchild') || (repo.hasDirectory('parent') && repo.hasDirectory('grandchild')) }
    ],
    hints: [
      'Use the `-p` flag: `mkdir -p parent/child/grandchild`.',
      'The `-p` flag instructs mkdir to create parent folders automatically if missing.'
    ]
  },

  // ── Challenge 18 ──
  {
    id: 'cli-18-cd-up-two',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Move Up Two Directory Levels (cd ../..)',
    difficulty: 'Easy',
    category: 'Navigation',
    tags: ['cd', 'Relative Paths', 'Navigation'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Move back up two directory levels at once.',
    description: `
### Background & Context
Relative path navigation can be chained using slash separators. \`..\` navigates up one parent level, while \`../..\` traverses up two directory levels in a single command.

---

### Problem Statement & Task
From your current position inside \`parent/child/grandchild\`, move back up two directory levels at once.

---

**Example 1**:

Input:
\`\`\`bash
# Starting location: /home/student/project/parent/child/grandchild
$ cd ../..
$ pwd
\`\`\`

Output:
\`\`\`
/home/student/project/parent
\`\`\`

---

**Acceptance Criteria**:
1. Execute \`cd ../..\` in the terminal.
2. Confirm you have moved up two parent directory levels.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project/parent/child/grandchild',
      directories: ['/home/student/project/parent', '/home/student/project/parent/child', '/home/student/project/parent/child/grandchild'],
      files: {}
    },
    validation: (repo) => {
      if (repo.getCwd().endsWith('/parent') || repo.getCwd().endsWith('/project')) {
        return { passed: true, message: 'Great navigation! You climbed up two directory levels.' };
      }
      return { passed: false, message: 'Run `cd ../..` to ascend two parent levels.' };
    },
    objectives: [
      { label: 'Execute cd ../.. to ascend two levels', done: (repo) => repo.getCwd().endsWith('/parent') || repo.getCwd().endsWith('/project') },
      { label: 'Verify new working directory path', done: (repo) => repo.getCwd().endsWith('/parent') || repo.getCwd().endsWith('/project') }
    ],
    hints: [
      'Type `cd ../..` and press Enter.',
      'Check `pwd` to confirm you ascended two folder levels.'
    ]
  },

  // ── Challenge 19 ──
  {
    id: 'cli-19-cp-notes',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Copy File Backup (cp notes.txt notes_backup.txt)',
    difficulty: 'Basic',
    category: 'File Operations',
    tags: ['cp', 'copy', 'Backups', 'CLI'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Copy notes.txt to a backup file named notes_backup.txt.',
    description: `
### Background & Context
The \`cp\` (Copy) command duplicates an existing source file into a new destination file while keeping the original file intact.

---

### Problem Statement & Task
Copy **\`notes.txt\`** to a backup file named **\`notes_backup.txt\`**.

---

**Example 1**:

Input:
\`\`\`bash
$ cp notes.txt notes_backup.txt
$ ls
\`\`\`

Output:
\`\`\`
notes.txt  notes_backup.txt
\`\`\`

---

**Cross-Platform Reference**:
- **Bash / Linux / macOS**: \`cp notes.txt notes_backup.txt\`
- **Windows Command Prompt**: \`copy notes.txt notes_backup.txt\`
- **Windows PowerShell**: \`Copy-Item notes.txt notes_backup.txt\` or \`cp notes.txt notes_backup.txt\`

---

**Acceptance Criteria**:
1. Run \`cp notes.txt notes_backup.txt\` in the terminal.
2. Confirm both \`notes.txt\` and \`notes_backup.txt\` exist in the directory.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {
        'notes.txt': 'Certification study notes.\n'
      }
    },
    validation: (repo) => {
      if (repo.readFile('notes.txt') !== null && repo.readFile('notes_backup.txt') !== null) {
        return { passed: true, message: 'Perfect! Backup copy "notes_backup.txt" created.' };
      }
      return { passed: false, message: 'Run `cp notes.txt notes_backup.txt` to create the backup copy.' };
    },
    objectives: [
      { label: 'Copy file using cp notes.txt notes_backup.txt', done: (repo) => repo.readFile('notes.txt') !== null && repo.readFile('notes_backup.txt') !== null },
      { label: 'Confirm both source and destination files exist', done: (repo) => repo.readFile('notes.txt') !== null && repo.readFile('notes_backup.txt') !== null }
    ],
    hints: [
      'Type `cp notes.txt notes_backup.txt` and press Enter.',
      'On Windows Command Prompt: `copy notes.txt notes_backup.txt`.'
    ]
  },

  // ── Challenge 20 ──
  {
    id: 'cli-20-mv-rename',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Rename File (mv notes_backup.txt archive.txt)',
    difficulty: 'Basic',
    category: 'File Operations',
    tags: ['mv', 'ren', 'Renaming', 'CLI'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Rename notes_backup.txt to archive.txt.',
    description: `
### Background & Context
In Unix filesystems, moving and renaming are the same fundamental operation handled by \`mv\` (Move). When the destination is a filename in the same directory, \`mv\` renames the file without altering its contents.

---

### Problem Statement & Task
Rename **\`notes_backup.txt\`** to **\`archive.txt\`**.

---

**Example 1**:

Input:
\`\`\`bash
$ mv notes_backup.txt archive.txt
$ ls
\`\`\`

Output:
\`\`\`
archive.txt  notes.txt
\`\`\`

---

**Cross-Platform Reference**:
- **Bash / Linux / macOS**: \`mv notes_backup.txt archive.txt\`
- **Windows Command Prompt**: \`ren notes_backup.txt archive.txt\`
- **Windows PowerShell**: \`Rename-Item notes_backup.txt archive.txt\` or \`mv notes_backup.txt archive.txt\`

---

**Acceptance Criteria**:
1. Run \`mv notes_backup.txt archive.txt\` in the terminal.
2. Verify \`notes_backup.txt\` is gone and replaced by \`archive.txt\`.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {
        'notes.txt': 'Original notes.\n',
        'notes_backup.txt': 'Backup copy of notes.\n'
      }
    },
    validation: (repo) => {
      if (repo.readFile('archive.txt') !== null && repo.readFile('notes_backup.txt') === null) {
        return { passed: true, message: 'Awesome! File renamed to archive.txt successfully.' };
      }
      return { passed: false, message: 'Run `mv notes_backup.txt archive.txt` to rename the file.' };
    },
    objectives: [
      { label: 'Rename file using mv notes_backup.txt archive.txt', done: (repo) => repo.readFile('archive.txt') !== null && repo.readFile('notes_backup.txt') === null },
      { label: 'Confirm old name is replaced by archive.txt', done: (repo) => repo.readFile('archive.txt') !== null && repo.readFile('notes_backup.txt') === null }
    ],
    hints: [
      'Type `mv notes_backup.txt archive.txt` and press Enter.',
      'On Windows Command Prompt: `ren notes_backup.txt archive.txt`.'
    ]
  },

  // ── Challenge 21 ──
  {
    id: 'cli-21-mv-to-folder',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Move File into Directory (mv archive.txt docs/)',
    difficulty: 'Basic',
    category: 'File Operations',
    tags: ['mv', 'move', 'Directories', 'CLI'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Move archive.txt inside the docs folder.',
    description: `
### Background & Context
When the second argument passed to \`mv\` is an existing directory name, \`mv\` moves the source file inside that directory while preserving its name.

---

### Problem Statement & Task
Move **\`archive.txt\`** inside the **\`docs\`** folder.

---

**Example 1**:

Input:
\`\`\`bash
$ mv archive.txt docs/
$ ls docs
\`\`\`

Output:
\`\`\`
archive.txt
\`\`\`

---

**Cross-Platform Reference**:
- **Bash / Linux / macOS**: \`mv archive.txt docs/\`
- **Windows Command Prompt**: \`move archive.txt docs\\\`
- **Windows PowerShell**: \`Move-Item archive.txt docs\`

---

**Acceptance Criteria**:
1. Run \`mv archive.txt docs/\` in the terminal.
2. Confirm \`archive.txt\` is now located inside \`docs\`.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      directories: ['docs'],
      files: {
        'archive.txt': 'Archived notes.\n'
      }
    },
    validation: (repo) => {
      if (repo.readFile('docs/archive.txt') !== null || (repo.readFile('archive.txt') === null && repo.hasExecutedCommand('mv archive.txt docs'))) {
        return { passed: true, message: 'Great job! archive.txt moved into the docs directory.' };
      }
      return { passed: false, message: 'Run `mv archive.txt docs/` to move the file.' };
    },
    objectives: [
      { label: 'Move file: mv archive.txt docs/', done: (repo) => repo.readFile('docs/archive.txt') !== null || (repo.readFile('archive.txt') === null && repo.hasExecutedCommand('mv archive.txt docs')) },
      { label: 'Verify archive.txt is located inside docs', done: (repo) => repo.readFile('docs/archive.txt') !== null || (repo.readFile('archive.txt') === null && repo.hasExecutedCommand('mv archive.txt docs')) }
    ],
    hints: [
      'Type `mv archive.txt docs/` and press Enter.',
      'Run `ls docs` to verify the file is inside the docs folder.'
    ]
  },

  // ── Challenge 22 ──
  {
    id: 'cli-22-rm-notes',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Delete File (rm notes.txt)',
    difficulty: 'Basic',
    category: 'File Operations',
    tags: ['rm', 'del', 'Deletion', 'CLI'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Delete the file notes.txt.',
    description: `
### Background & Context
The \`rm\` (Remove) command permanently deletes files from the filesystem. Unlike graphical desktop environments, terminal deletion does **not** move files to a Recycle Bin or Trash can.

---

### Problem Statement & Task
Delete the file named **\`notes.txt\`**.

---

**Example 1**:

Input:
\`\`\`bash
$ rm notes.txt
$ ls
\`\`\`

Explanation:
\`notes.txt\` is permanently removed from the current working directory.

---

**Cross-Platform Reference**:
- **Bash / Linux / macOS**: \`rm notes.txt\`
- **Windows Command Prompt**: \`del notes.txt\`
- **Windows PowerShell**: \`Remove-Item notes.txt\` or \`rm notes.txt\`

---

**Acceptance Criteria**:
1. Run \`rm notes.txt\` in the terminal.
2. Verify \`notes.txt\` is permanently deleted from the directory.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {
        'notes.txt': 'Temporary notes to delete.\n'
      }
    },
    validation: (repo) => {
      if (repo.readFile('notes.txt') === null) {
        return { passed: true, message: 'File notes.txt was removed successfully.' };
      }
      return { passed: false, message: 'File notes.txt still exists. Run `rm notes.txt`.' };
    },
    objectives: [
      { label: 'Delete file: rm notes.txt', done: (repo) => repo.readFile('notes.txt') === null },
      { label: 'Confirm notes.txt is removed from directory', done: (repo) => repo.readFile('notes.txt') === null }
    ],
    hints: [
      'Type `rm notes.txt` and press Enter.',
      'On Windows Command Prompt: `del notes.txt`.'
    ]
  },

  // ── Challenge 23 ──
  {
    id: 'cli-23-rmdir-src',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Delete Empty Directory (rmdir src)',
    difficulty: 'Basic',
    category: 'Directory Management',
    tags: ['rmdir', 'Directory Removal', 'CLI'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Delete the empty directory src.',
    description: `
### Background & Context
The \`rmdir\` command safely removes directories that are completely empty. If a directory contains files, \`rmdir\` halts to protect against accidental data loss.

---

### Problem Statement & Task
Delete the empty directory named **\`src\`**.

---

**Example 1**:

Input:
\`\`\`bash
$ rmdir src
$ ls
\`\`\`

Explanation:
The empty directory \`src\` is removed from the current working directory.

---

**Cross-Platform Reference**:
- **Bash / Linux / macOS**: \`rmdir src\`
- **Windows Command Prompt**: \`rmdir src\` (or \`rd src\`)
- **Windows PowerShell**: \`rmdir src\` or \`Remove-Item src\`

---

**Acceptance Criteria**:
1. Run \`rmdir src\` in the terminal.
2. Verify the directory \`src\` no longer exists.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      directories: ['src'],
      files: {}
    },
    validation: (repo) => {
      if (!repo.hasDirectory('src')) {
        return { passed: true, message: 'Empty directory "src" removed successfully.' };
      }
      return { passed: false, message: 'Directory "src" still exists. Run `rmdir src`.' };
    },
    objectives: [
      { label: 'Remove empty directory: rmdir src', done: (repo) => !repo.hasDirectory('src') },
      { label: 'Verify src no longer appears in ls', done: (repo) => !repo.hasDirectory('src') }
    ],
    hints: [
      'Type `rmdir src` and press Enter.',
      'Run `ls` to confirm the folder is gone.'
    ]
  },

  // ── Challenge 24 ──
  {
    id: 'cli-24-code-cli',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'Open VS Code from Terminal (code .)',
    difficulty: 'Basic',
    category: 'Editor Integration',
    tags: ['code', 'VS Code', 'CLI Tools'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Open the current directory inside Visual Studio Code directly from your terminal CLI.',
    description: `
### Background & Context
Modern developers bridge terminal operations with graphical editors using CLI shortcuts. Installing the \`code\` command in your system PATH lets you launch Visual Studio Code targeting any project folder instantly.

---

### Problem Statement & Task
Launch Visual Studio Code and open the current directory (\`.\`) directly from your terminal.

---

**Example 1**:

Input:
\`\`\`bash
$ code .
\`\`\`

Output:
\`\`\`
Opening Visual Studio Code in current directory (/home/student/project)...
\`\`\`

Explanation:
The dot \`.\` represents the current working directory. \`code .\` opens VS Code with this project folder loaded in the Explorer sidebar.

---

**Acceptance Criteria**:
1. Run \`code .\` in the terminal.
2. Confirm the command launches Visual Studio Code targeting the current directory.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {
        'index.js': '// Code project entry\n'
      }
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('code .') || repo.hasExecutedCommand('code')) {
        return { passed: true, message: 'Great! VS Code launched with the current directory loaded.' };
      }
      return { passed: false, message: 'Type `code .` to launch Visual Studio Code in the current directory.' };
    },
    objectives: [
      { label: 'Execute code . command', done: (repo) => repo.hasExecutedCommand('code .') || repo.hasExecutedCommand('code') },
      { label: 'Verify editor launch in active workspace', done: (repo) => repo.hasExecutedCommand('code .') || repo.hasExecutedCommand('code') }
    ],
    hints: [
      'Type `code .` and press Enter.',
      'The dot `.` specifies the current directory.'
    ]
  },

  // ── Challenge 25 ──
  {
    id: 'cli-25-history',
    track: 'terminal',
    moduleId: 'day-0-terminal',
    moduleTitle: 'Day 0: Hands-On Terminal & CLI Practice',
    title: 'View Command History (history)',
    difficulty: 'Basic',
    category: 'Shell Inspection',
    tags: ['history', 'Audit', 'Shell', 'CLI'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'View the previous commands you have executed in your active terminal session.',
    description: `
### Background & Context
The shell maintains an ordered audit log of all commands entered during your active session. Running \`history\` lets you review previously executed commands, audit administrative actions, and replay commands.

---

### Problem Statement & Task
Display the numbered chronological list of commands you have executed in your active terminal session.

---

**Example 1**:

Input:
\`\`\`bash
$ history
\`\`\`

Output:
\`\`\`
    1  pwd
    2  ls -la
    3  mkdir git-prep
    4  cd git-prep
    5  history
\`\`\`

---

**Cross-Platform Reference**:
- **Bash / Linux / macOS**: \`history\`
- **Windows PowerShell**: \`Get-History\` or \`history\`
- **Windows Command Prompt**: \`doskey /history\`

---

**Acceptance Criteria**:
1. Run \`history\` (or \`Get-History\`) in the terminal.
2. Verify that a numbered list of entered commands prints on screen.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('history') || repo.hasExecutedCommand('Get-History')) {
        return { passed: true, message: 'Awesome! Command history displayed successfully.' };
      }
      return { passed: false, message: 'Run `history` to view your previously executed commands.' };
    },
    objectives: [
      { label: 'Execute history command', done: (repo) => repo.hasExecutedCommand('history') || repo.hasExecutedCommand('Get-History') },
      { label: 'Inspect numbered log of entered terminal commands', done: (repo) => repo.hasExecutedCommand('history') || repo.hasExecutedCommand('Get-History') }
    ],
    hints: [
      'Type `history` and press Enter.',
      'On PowerShell: `Get-History` or `history`.'
    ]
  },

  // ═══════════════════════════════════════════════════════
  // PART 2: DAY 1 HANDS-ON GIT INSTALLATION & ENVIRONMENT
  // ═══════════════════════════════════════════════════════
// ── Challenge 26 ──
  {
    id: 'git-26-version',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Verify Git Installation (git --version)',
    difficulty: 'Basic',
    category: 'Git Installation',
    tags: ['git --version', 'CLI Verification', 'VCS'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Run the command to check if Git is installed on your computer and verify its version.',
    description: `
### Background & Context
Before working with any Git repository, you must confirm that the Git command-line client is installed and correctly registered in your operating system's PATH. Checking the installed version is the standard verification step.

---

### Problem Statement & Task
Run the command to check if Git is installed on your computer and verify its version.

---

**Example 1**:

Input:
\`\`\`bash
$ git --version
\`\`\`

Output:
\`\`\`
git version 2.44.0 (MSC PRPCEM Virtual Sandbox)
\`\`\`

Explanation:
\`git --version\` queries the Git binary for its compiled semantic version string.

---

**Acceptance Criteria**:
1. Run \`git --version\` (or \`git -v\`) in the terminal.
2. Verify the terminal outputs \`git version 2.x.x\`.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('git --version') || repo.hasExecutedCommand('git -v') || repo.hasExecutedCommand('git version')) {
        return { passed: true, message: 'Git is verified and operational on your machine!' };
      }
      return { passed: false, message: 'Run `git --version` to check your Git installation.' };
    },
    objectives: [
      { label: 'Run git --version in terminal', done: (repo) => repo.hasExecutedCommand('git --version') || repo.hasExecutedCommand('git -v') || repo.hasExecutedCommand('git version') },
      { label: 'Confirm semantic version string output', done: (repo) => repo.hasExecutedCommand('git --version') || repo.hasExecutedCommand('git -v') || repo.hasExecutedCommand('git version') }
    ],
    hints: [
      'Type `git --version` and press Enter.',
      'You can also use the short flag: `git -v`.'
    ]
  },

  // ── Challenge 27 ──
  {
    id: 'git-27-help',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Display Git Help Manual (git --help)',
    difficulty: 'Basic',
    category: 'Git Help & Manuals',
    tags: ['git --help', 'Documentation', 'CLI'],
    interviewFrequency: 'Core Git Foundation',
    scenario: 'Run the command that displays the general Git help manual and lists common subcommands in the CLI.',
    description: `
### Background & Context
Git provides extensive built-in documentation. Running \`git --help\` displays common subcommands grouped by function: starting repositories, working on changes, examining history, branching, and collaborating.

---

### Problem Statement & Task
Run the command that displays the general Git help manual and lists common subcommands in the CLI.

---

**Example 1**:

Input:
\`\`\`bash
$ git --help
\`\`\`

Output:
\`\`\`
usage: git [-v | --version] [-h | --help] <command> [<args>]

These are common Git commands used in various situations:
   init       Create an empty Git repository
   add        Add file contents to the index
   status     Show the working tree status
   commit     Record changes to the repository
   ...
\`\`\`

---

**Acceptance Criteria**:
1. Run \`git --help\` or \`git help\` in the terminal.
2. Confirm the core Git command groups are displayed.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('git --help') || repo.hasExecutedCommand('git help') || repo.lastCommand === 'git -h') {
        return { passed: true, message: 'Great! General Git help manual displayed.' };
      }
      return { passed: false, message: 'Run `git --help` to display the list of common subcommands.' };
    },
    objectives: [
      { label: 'Run git --help to display usage guide', done: (repo) => repo.hasExecutedCommand('git --help') || repo.hasExecutedCommand('git help') || repo.lastCommand === 'git -h' },
      { label: 'Review core subcommands and flags', done: (repo) => repo.hasExecutedCommand('git --help') || repo.hasExecutedCommand('git help') || repo.lastCommand === 'git -h' }
    ],
    hints: [
      'Type `git --help` and press Enter.',
      'Alternatively, type `git help`.'
    ]
  },

  // ── Challenge 28 ──
  {
    id: 'git-28-install-windows-winget',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Windows Automated Git Installation (winget)',
    difficulty: 'Basic',
    category: 'Git Installation',
    tags: ['winget', 'Windows', 'Package Manager'],
    interviewFrequency: 'DevOps & Setup',
    scenario: 'On Windows (using winget), install the official Git package unattended via the command line.',
    description: `
### Background & Context
On Windows 10 and 11, the official Windows Package Manager (\`winget\`) automates tool installation without requiring browser downloads or manual installer wizard clicks.

---

### Problem Statement & Task
On Windows using PowerShell, execute the command to install the official Git package unattended via \`winget\`.

---

**Example 1**:

Input:
\`\`\`powershell
$ winget install --id Git.Git -e --source winget
\`\`\`

Output:
\`\`\`
Found Git [Git.Git] Version 2.44.0
Downloading https://github.com/git-for-windows/...
Starting package install...
Successfully installed Git
\`\`\`

Explanation:
- \`--id Git.Git\` targets the exact official package identifier.
- \`-e\` enforces exact string matching.
- \`--source winget\` directs queries to the official Microsoft repository.

---

**Acceptance Criteria**:
1. Run \`winget install --id Git.Git -e --source winget\` in the terminal.
2. Confirm the package manager verifies and installs Git.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('winget install') || repo.hasExecutedCommand('winget')) {
        return { passed: true, message: 'Unattended winget installation completed successfully!' };
      }
      return { passed: false, message: 'Run `winget install --id Git.Git -e --source winget`.' };
    },
    objectives: [
      { label: 'Run winget unattended install command', done: (repo) => repo.hasExecutedCommand('winget install') || repo.hasExecutedCommand('winget') },
      { label: 'Verify package verification and install output', done: (repo) => repo.hasExecutedCommand('winget install') || repo.hasExecutedCommand('winget') }
    ],
    hints: [
      'Type `winget install --id Git.Git -e --source winget` and press Enter.'
    ]
  },

  // ── Challenge 29 ──
  {
    id: 'git-29-install-macos-xcode',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'macOS Command Line Tools Installation (xcode-select)',
    difficulty: 'Basic',
    category: 'Git Installation',
    tags: ['xcode-select', 'macOS', 'Installation'],
    interviewFrequency: 'DevOps & Setup',
    scenario: 'On macOS, initiate the installation of Apple Developer Command Line Tools to acquire Git.',
    description: `
### Background & Context
On macOS, Apple distributes Git as part of the Xcode Command Line Developer Tools package. The command \`xcode-select --install\` triggers the system dialog to download and link Git and Apple developer compilers.

---

### Problem Statement & Task
On macOS, initiate the installation of Apple Developer Command Line Tools to acquire Git.

---

**Example 1**:

Input:
\`\`\`bash
$ xcode-select --install
\`\`\`

Output:
\`\`\`
xcode-select: note: install requested for command line developer tools
\`\`\`

---

**Acceptance Criteria**:
1. Run \`xcode-select --install\` in the terminal.
2. Confirm system triggers developer tools setup.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('xcode-select --install') || repo.hasExecutedCommand('xcode-select')) {
        return { passed: true, message: 'macOS developer command line tools requested successfully!' };
      }
      return { passed: false, message: 'Run `xcode-select --install` in the terminal.' };
    },
    objectives: [
      { label: 'Run xcode-select --install', done: (repo) => repo.hasExecutedCommand('xcode-select --install') || repo.hasExecutedCommand('xcode-select') },
      { label: 'Verify CLI tools install request', done: (repo) => repo.hasExecutedCommand('xcode-select --install') || repo.hasExecutedCommand('xcode-select') }
    ],
    hints: [
      'Type `xcode-select --install` and press Enter.'
    ]
  },

  // ── Challenge 30 ──
  {
    id: 'git-30-install-macos-brew',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'macOS Homebrew Git Installation (brew install git)',
    difficulty: 'Basic',
    category: 'Git Installation',
    tags: ['brew', 'Homebrew', 'macOS'],
    interviewFrequency: 'DevOps & Setup',
    scenario: 'On macOS using Homebrew, install the latest version of Git.',
    description: `
### Background & Context
Apple's pre-installed Git version often lags behind the latest stable release. Homebrew is the standard package manager for macOS that links the newest official Git binaries into \`/usr/local/bin\` or \`/opt/homebrew/bin\`.

---

### Problem Statement & Task
On macOS using Homebrew, install the latest version of Git.

---

**Example 1**:

Input:
\`\`\`bash
$ brew install git
\`\`\`

Output:
\`\`\`
==> Downloading https://ghcr.io/v2/homebrew/core/git/manifests/2.44.0
==> Pouring git--2.44.0.ventura.bottle.tar.gz
🍺  /usr/local/Cellar/git/2.44.0: 1,629 files, 49.3MB
\`\`\`

---

**Acceptance Criteria**:
1. Run \`brew install git\` in the terminal.
2. Confirm Homebrew downloads and pours the Git package.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('brew install git') || repo.hasExecutedCommand('brew install')) {
        return { passed: true, message: 'Git installed via Homebrew successfully!' };
      }
      return { passed: false, message: 'Run `brew install git` in the terminal.' };
    },
    objectives: [
      { label: 'Run brew install git', done: (repo) => repo.hasExecutedCommand('brew install git') || repo.hasExecutedCommand('brew install') },
      { label: 'Confirm package bottle pouring completion', done: (repo) => repo.hasExecutedCommand('brew install git') || repo.hasExecutedCommand('brew install') }
    ],
    hints: [
      'Type `brew install git` and press Enter.'
    ]
  },

  // ── Challenge 31 ──
  {
    id: 'git-31-install-linux-apt',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Ubuntu/Debian Non-Interactive Install (apt)',
    difficulty: 'Basic',
    category: 'Git Installation',
    tags: ['apt', 'Debian', 'Ubuntu', 'Linux'],
    interviewFrequency: 'DevOps & Setup',
    scenario: 'On Ubuntu/Debian Linux, update the package list and install Git non-interactively.',
    description: `
### Background & Context
On Debian and Ubuntu distributions, the Advanced Package Tool (\`apt\`) manages software packages. The \`-y\` flag answers "yes" automatically to prompt queries, allowing non-interactive scripted setups in Docker containers and CI/CD pipelines.

---

### Problem Statement & Task
On Ubuntu/Debian, update package repository indexes and install Git non-interactively in a single command.

---

**Example 1**:

Input:
\`\`\`bash
$ sudo apt update && sudo apt install git -y
\`\`\`

Output:
\`\`\`
Reading package lists... Done
Building dependency tree... Done
Setting up git (1:2.34.1) ...
\`\`\`

---

**Acceptance Criteria**:
1. Run \`sudo apt update && sudo apt install git -y\` (or \`sudo apt install git -y\`).
2. Verify package manager installation completes.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('apt') || repo.hasExecutedCommand('sudo apt')) {
        return { passed: true, message: 'Ubuntu/Debian apt package installation verified!' };
      }
      return { passed: false, message: 'Run `sudo apt update && sudo apt install git -y`.' };
    },
    objectives: [
      { label: 'Run apt update and apt install git -y', done: (repo) => repo.hasExecutedCommand('apt') || repo.hasExecutedCommand('sudo apt') },
      { label: 'Confirm non-interactive package setup', done: (repo) => repo.hasExecutedCommand('apt') || repo.hasExecutedCommand('sudo apt') }
    ],
    hints: [
      'Type `sudo apt update && sudo apt install git -y` and press Enter.',
      'The `-y` flag stands for automatic "yes" to prompts.'
    ]
  },

  // ── Challenge 32 ──
  {
    id: 'git-32-install-linux-dnf',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'RedHat / Fedora Installation (dnf)',
    difficulty: 'Basic',
    category: 'Git Installation',
    tags: ['dnf', 'Fedora', 'RHEL', 'Linux'],
    interviewFrequency: 'DevOps & Setup',
    scenario: 'On RedHat / Fedora Linux distributions, install Git via the package manager.',
    description: `
### Background & Context
RedHat Enterprise Linux (RHEL), CentOS, Rocky Linux, and Fedora use Dandified YUM (\`dnf\`) as their default RPM package manager.

---

### Problem Statement & Task
On RedHat / Fedora Linux distributions, install Git non-interactively using the package manager.

---

**Example 1**:

Input:
\`\`\`bash
$ sudo dnf install git -y
\`\`\`

Output:
\`\`\`
Package git-2.44.0 is already installed.
Dependencies resolved.
Complete!
\`\`\`

---

**Acceptance Criteria**:
1. Run \`sudo dnf install git -y\` in the terminal.
2. Confirm package installation completes.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('dnf') || repo.hasExecutedCommand('sudo dnf')) {
        return { passed: true, message: 'RedHat/Fedora dnf package installation verified!' };
      }
      return { passed: false, message: 'Run `sudo dnf install git -y`.' };
    },
    objectives: [
      { label: 'Run sudo dnf install git -y', done: (repo) => repo.hasExecutedCommand('dnf') || repo.hasExecutedCommand('sudo dnf') },
      { label: 'Confirm dependency resolution and completion', done: (repo) => repo.hasExecutedCommand('dnf') || repo.hasExecutedCommand('sudo dnf') }
    ],
    hints: [
      'Type `sudo dnf install git -y` and press Enter.'
    ]
  },

  // ── Challenge 33 ──
  {
    id: 'git-33-which-git',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Locate Git Executable Path (which git)',
    difficulty: 'Basic',
    category: 'Environment Inspection',
    tags: ['which', 'where', 'Binary Path', 'CLI'],
    interviewFrequency: 'Core CLI Foundation',
    scenario: 'Find the exact filesystem path where the Git executable binary resides on your machine.',
    description: `
### Background & Context
When you type \`git\`, your shell searches the colon-separated folders listed in your \`$PATH\` environment variable for an executable named \`git\`. The \`which\` command (or \`where\` on Windows) reveals the absolute path of the executable found.

---

### Problem Statement & Task
Find the exact filesystem path where the Git executable binary resides on your machine.

---

**Example 1**:

Input:
\`\`\`bash
$ which git
\`\`\`

Output:
\`\`\`
/usr/bin/git
\`\`\`

---

**Cross-Platform Reference**:
- **Bash / Linux / macOS**: \`which git\`
- **Windows Command Prompt**: \`where git\`
- **Windows PowerShell**: \`Get-Command git\` or \`where.exe git\`

---

**Acceptance Criteria**:
1. Run \`which git\` (or \`where git\`) in the terminal.
2. Verify the output displays the absolute path to the Git binary.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('which git') || repo.hasExecutedCommand('where git') || repo.hasExecutedCommand('Get-Command git')) {
        return { passed: true, message: 'Binary located! Git path printed successfully.' };
      }
      return { passed: false, message: 'Run `which git` (or `where git` on Windows) to locate the binary.' };
    },
    objectives: [
      { label: 'Execute which git to locate binary', done: (repo) => repo.hasExecutedCommand('which git') || repo.hasExecutedCommand('where git') || repo.hasExecutedCommand('Get-Command git') },
      { label: 'Verify path printed in terminal output', done: (repo) => repo.hasExecutedCommand('which git') || repo.hasExecutedCommand('where git') || repo.hasExecutedCommand('Get-Command git') }
    ],
    hints: [
      'Type `which git` and press Enter.',
      'On Windows Command Prompt: `where git`.'
    ]
  },

  // ── Challenge 34 ──
  {
    id: 'git-34-help-clone',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Inspect Git Clone Documentation (git help clone)',
    difficulty: 'Basic',
    category: 'Git Help & Manuals',
    tags: ['git help clone', 'Documentation', 'CLI'],
    interviewFrequency: 'Core Git Foundation',
    scenario: 'Display the complete manual documentation specifically for the git clone command.',
    description: `
### Background & Context
Git provides subcommand-specific manual pages explaining all flags, options, remote protocol syntax, and edge-case behavior.

---

### Problem Statement & Task
Display the complete manual documentation specifically for the **\`git clone\`** command.

---

**Example 1**:

Input:
\`\`\`bash
$ git help clone
\`\`\`

Output:
\`\`\`
NAME
    git-clone - Clone a repository into a new directory

SYNOPSIS
    git clone [--template=<template-directory>] [-b <name>] [--depth <depth>] <repository> [<directory>]

DESCRIPTION
    Clones a remote repository into a target directory...
\`\`\`

---

**Acceptance Criteria**:
1. Run \`git help clone\` (or \`git clone --help\`, \`man git-clone\`).
2. Verify the clone manual documentation is displayed.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('git help clone') || repo.hasExecutedCommand('git clone --help') || repo.hasExecutedCommand('man git-clone')) {
        return { passed: true, message: 'Git clone manual page loaded successfully!' };
      }
      return { passed: false, message: 'Run `git help clone` (or `git clone --help`).' };
    },
    objectives: [
      { label: 'Run git help clone', done: (repo) => repo.hasExecutedCommand('git help clone') || repo.hasExecutedCommand('git clone --help') || repo.hasExecutedCommand('man git-clone') },
      { label: 'Inspect clone syntax and depth flags', done: (repo) => repo.hasExecutedCommand('git help clone') || repo.hasExecutedCommand('git clone --help') || repo.hasExecutedCommand('man git-clone') }
    ],
    hints: [
      'Type `git help clone` and press Enter.',
      'You can also run `git clone --help`.'
    ]
  },

  // ── Challenge 35 ──
  {
    id: 'git-35-help-init',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Inspect Git Init Documentation (git help init)',
    difficulty: 'Basic',
    category: 'Git Help & Manuals',
    tags: ['git help init', 'Documentation', 'CLI'],
    interviewFrequency: 'Core Git Foundation',
    scenario: 'Display the manual page specifically for git init.',
    description: `
### Background & Context
The \`git init\` documentation explains initialization flags, including \`--bare\` for creating remote server repositories and \`-b <branch>\` for customizing the initial default branch name.

---

### Problem Statement & Task
Display the manual page specifically for **\`git init\`**.

---

**Example 1**:

Input:
\`\`\`bash
$ git help init
\`\`\`

Output:
\`\`\`
NAME
    git-init - Create an empty Git repository or reinitialize an existing one

SYNOPSIS
    git init [-q | --quiet] [--bare] [-b <branch-name>] [<directory>]

DESCRIPTION
    Creates an empty Git repository (.git directory) with core components...
\`\`\`

---

**Acceptance Criteria**:
1. Run \`git help init\` (or \`git init --help\`).
2. Verify the \`git init\` manual documentation is displayed.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('git help init') || repo.hasExecutedCommand('git init --help') || repo.hasExecutedCommand('man git-init')) {
        return { passed: true, message: 'Git init documentation displayed successfully!' };
      }
      return { passed: false, message: 'Run `git help init` (or `git init --help`).' };
    },
    objectives: [
      { label: 'Run git help init', done: (repo) => repo.hasExecutedCommand('git help init') || repo.hasExecutedCommand('git init --help') || repo.hasExecutedCommand('man git-init') },
      { label: 'Review bare and branch options', done: (repo) => repo.hasExecutedCommand('git help init') || repo.hasExecutedCommand('git init --help') || repo.hasExecutedCommand('man git-init') }
    ],
    hints: [
      'Type `git help init` and press Enter.'
    ]
  },

  // ── Challenge 36 ──
  {
    id: 'git-36-echo-path',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Inspect System PATH Environment Variable (echo $PATH)',
    difficulty: 'Basic',
    category: 'Environment Inspection',
    tags: ['PATH', 'Environment Variables', 'CLI'],
    interviewFrequency: 'DevOps & Setup',
    scenario: 'View the current values of your system\'s PATH environment variable in a shell.',
    description: `
### Background & Context
The \`PATH\` environment variable holds a delimited list of directory paths where your operating system searches for executable binaries when you enter a command. If Git is installed but not in your PATH, running \`git\` returns "command not found".

---

### Problem Statement & Task
View the current values of your system's PATH environment variable.

---

**Example 1**:

Input:
\`\`\`bash
$ echo $PATH
\`\`\`

Output:
\`\`\`
/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/git/bin
\`\`\`

---

**Cross-Platform Reference**:
- **Bash / Linux / macOS**: \`echo $PATH\`
- **Windows Command Prompt**: \`echo %PATH%\`
- **Windows PowerShell**: \`$env:PATH\` or \`echo $env:PATH\`

---

**Acceptance Criteria**:
1. Run \`echo $PATH\` (or \`echo %PATH%\`, \`$env:PATH\`).
2. Verify the terminal outputs the delimited folder paths.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('echo $PATH') || repo.hasExecutedCommand('echo %PATH%') || repo.hasExecutedCommand('$env:PATH')) {
        return { passed: true, message: 'PATH environment variable printed successfully!' };
      }
      return { passed: false, message: 'Run `echo $PATH` (or `echo %PATH%` / `$env:PATH`).' };
    },
    objectives: [
      { label: 'Print PATH using echo $PATH', done: (repo) => repo.hasExecutedCommand('echo $PATH') || repo.hasExecutedCommand('echo %PATH%') || repo.hasExecutedCommand('$env:PATH') },
      { label: 'Inspect directory search paths for executables', done: (repo) => repo.hasExecutedCommand('echo $PATH') || repo.hasExecutedCommand('echo %PATH%') || repo.hasExecutedCommand('$env:PATH') }
    ],
    hints: [
      'Type `echo $PATH` and press Enter.',
      'On Windows Command Prompt: `echo %PATH%`.'
    ]
  },

  // ── Challenge 37 ──
  {
    id: 'git-37-mkdir-cd-practice',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Create & Enter Dedicated Practice Directory',
    difficulty: 'Basic',
    category: 'Directory Management',
    tags: ['mkdir', 'cd', 'Chaining', 'Foundations'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Create a dedicated directory called foundations-practice and enter it.',
    description: `
### Background & Context
Before initializing a repository, create a dedicated project folder to prevent Git from turning your root home directory into an unintended repository.

---

### Problem Statement & Task
Create a dedicated directory called **\`foundations-practice\`** and enter it.

---

**Example 1**:

Input:
\`\`\`bash
$ mkdir foundations-practice && cd foundations-practice
$ pwd
\`\`\`

Output:
\`\`\`
/home/student/project/foundations-practice
\`\`\`

Explanation:
The \`&&\` operator chains the two commands: if \`mkdir\` succeeds, \`cd\` executes immediately.

---

**Acceptance Criteria**:
1. Run \`mkdir foundations-practice && cd foundations-practice\` (or run \`mkdir\` followed by \`cd\`).
2. Confirm your current directory is \`foundations-practice\`.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.getCwd().endsWith('foundations-practice')) {
        return { passed: true, message: 'Great! You created and entered "foundations-practice".' };
      }
      return { passed: false, message: 'Create and enter foundations-practice using `mkdir foundations-practice && cd foundations-practice`.' };
    },
    objectives: [
      { label: 'Create directory foundations-practice', done: (repo) => repo.hasDirectory('foundations-practice') || repo.getCwd().endsWith('foundations-practice') },
      { label: 'Navigate inside foundations-practice', done: (repo) => repo.getCwd().endsWith('foundations-practice') }
    ],
    hints: [
      'Type `mkdir foundations-practice && cd foundations-practice` and press Enter.'
    ]
  },

  // ── Challenge 38 ──
  {
    id: 'git-38-git-init',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Initialize Brand New Git Repository (git init)',
    difficulty: 'Basic',
    category: 'Repository Lifecycle',
    tags: ['git init', 'Repository Creation', 'Foundations'],
    interviewFrequency: 'Core Git Foundation',
    scenario: 'Initialize a brand new Git repository inside your current directory.',
    description: `
### Background & Context
The \`git init\` command initializes a new, empty Git version control repository by creating a hidden \`.git\` directory. This folder stores the object database, commit graphs, reference pointers, and staging index.

---

### Problem Statement & Task
Initialize a brand new Git repository inside your current directory.

---

**Example 1**:

Input:
\`\`\`bash
$ git init
\`\`\`

Output:
\`\`\`
Initialized empty Git repository in /home/student/project/foundations-practice/.git/
\`\`\`

---

**Acceptance Criteria**:
1. Run \`git init\` in the terminal.
2. Confirm the repository is initialized.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project/foundations-practice',
      files: {}
    },
    validation: (repo) => {
      if (repo.isInitialized()) {
        return { passed: true, message: 'Repository initialized successfully! The .git folder is active.' };
      }
      return { passed: false, message: 'Run `git init` to initialize the repository.' };
    },
    objectives: [
      { label: 'Execute git init in terminal', done: (repo) => repo.isInitialized() },
      { label: 'Confirm creation of .git internal database', done: (repo) => repo.isInitialized() }
    ],
    hints: [
      'Type `git init` and press Enter.',
      'Check terminal output for "Initialized empty Git repository".'
    ]
  },

  // ── Challenge 39 ──
  {
    id: 'git-39-git-status-empty',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Check Status of Initialized Repository (git status)',
    difficulty: 'Basic',
    category: 'Repository Lifecycle',
    tags: ['git status', 'Inspection', 'Foundations'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Check the state of the newly initialized repository to confirm branch status and staged files.',
    description: `
### Background & Context
The \`git status\` command displays the state of your working directory and the staging area (index). In a freshly initialized repository, it informs you of your active branch, that no commits exist yet, and that nothing is staged.

---

### Problem Statement & Task
Check the state of the newly initialized repository to confirm branch status and staged files.

---

**Example 1**:

Input:
\`\`\`bash
$ git status
\`\`\`

Output:
\`\`\`
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
\`\`\`

---

**Acceptance Criteria**:
1. Run \`git status\` in the terminal.
2. Verify output confirms active branch and clean state.
    `,
    initialState: {
      isRepo: true,
      cwd: '/home/student/project/foundations-practice',
      currentBranch: 'main',
      files: {}
    },
    validation: (repo) => {
      if (repo.isInitialized() && (repo.hasExecutedCommand('git status') || repo.lastCommand === 'git status')) {
        return { passed: true, message: 'Great! Status inspected: "On branch main, No commits yet".' };
      }
      return { passed: false, message: 'Run `git status` to inspect the initial repository state.' };
    },
    objectives: [
      { label: 'Run git status command', done: (repo) => repo.hasExecutedCommand('git status') || repo.lastCommand === 'git status' },
      { label: 'Verify branch status and lack of commits', done: (repo) => repo.hasExecutedCommand('git status') || repo.lastCommand === 'git status' }
    ],
    hints: [
      'Type `git status` and press Enter.'
    ]
  },

  // ── Challenge 40 ──
  {
    id: 'git-40-ls-la-git-dir',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Verify Hidden .git Directory (ls -la)',
    difficulty: 'Basic',
    category: 'VCS Inspection',
    tags: ['ls -la', '.git', 'Internal Architecture'],
    interviewFrequency: 'Core Git Foundation',
    scenario: 'Inspect the directory to confirm that the hidden .git folder was created by git init.',
    description: `
### Background & Context
When you run \`git init\`, Git creates a hidden directory named \`.git\`. Standard directory listings like \`ls\` hide it. You must pass \`-a\` to verify its presence.

---

### Problem Statement & Task
Inspect the directory using the command that lists hidden files to confirm that the \`.git\` folder was created.

---

**Example 1**:

Input:
\`\`\`bash
$ ls -la
\`\`\`

Output:
\`\`\`
drwxr-xr-x 1 student student 4096 Oct 29 09:00 .
drwxr-xr-x 1 student student 4096 Oct 29 09:00 ..
drwxr-xr-x 1 student student 4096 Oct 29 09:00 .git
\`\`\`

---

**Acceptance Criteria**:
1. Run \`ls -la\` (or \`Get-ChildItem -Force\`) in the terminal.
2. Confirm the \`.git\` directory is listed.
    `,
    initialState: {
      isRepo: true,
      cwd: '/home/student/project/foundations-practice',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('ls -la') || repo.hasExecutedCommand('ls -al') || repo.hasExecutedCommand('Get-ChildItem -Force')) {
        return { passed: true, message: 'Confirmed! The hidden .git folder is active in the directory.' };
      }
      return { passed: false, message: 'Run `ls -la` (or `Get-ChildItem -Force`) to reveal the hidden .git folder.' };
    },
    objectives: [
      { label: 'Run ls -la to reveal dotfiles', done: (repo) => repo.hasExecutedCommand('ls -la') || repo.hasExecutedCommand('ls -al') || repo.hasExecutedCommand('Get-ChildItem -Force') },
      { label: 'Confirm .git directory appears in output', done: (repo) => repo.hasExecutedCommand('ls -la') || repo.hasExecutedCommand('ls -al') || repo.hasExecutedCommand('Get-ChildItem -Force') }
    ],
    hints: [
      'Type `ls -la` and press Enter.'
    ]
  },

  // ── Challenge 41 ──
  {
    id: 'git-41-ls-la-git-internals',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Inspect .git Internal Components (ls -la .git)',
    difficulty: 'Basic',
    category: 'VCS Inspection',
    tags: ['ls -la .git', 'Git Architecture', 'Internals'],
    interviewFrequency: 'Standard Technical Round',
    scenario: 'Inspect the internal files and directories stored inside the .git directory.',
    description: `
### Background & Context
The \`.git\` directory contains the entire core architecture of Git:
- **HEAD**: Pointer to current branch or commit
- **config**: Repository-specific settings
- **objects/**: Content-addressed store of all blobs, trees, and commits
- **refs/**: Pointers to commit objects (branches, tags, remotes)
- **hooks/**: Client-side hook scripts

---

### Problem Statement & Task
Inspect the internal files and directories stored inside the **\`.git\`** directory.

---

**Example 1**:

Input:
\`\`\`bash
$ ls -la .git
\`\`\`

Output:
\`\`\`
total 16
-rw-r--r-- 1 student student   23 Oct 29 09:00 HEAD
-rw-r--r-- 1 student student  130 Oct 29 09:00 config
-rw-r--r-- 1 student student   73 Oct 29 09:00 description
drwxr-xr-x 2 student student 4096 Oct 29 09:00 hooks
drwxr-xr-x 2 student student 4096 Oct 29 09:00 info
drwxr-xr-x 4 student student 4096 Oct 29 09:00 objects
drwxr-xr-x 4 student student 4096 Oct 29 09:00 refs
\`\`\`

---

**Acceptance Criteria**:
1. Run \`ls -la .git\` (or \`ls .git\`) in the terminal.
2. Confirm internal components (HEAD, config, objects, refs) are displayed.
    `,
    initialState: {
      isRepo: true,
      cwd: '/home/student/project/foundations-practice',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('ls -la .git') || repo.hasExecutedCommand('ls .git') || repo.hasExecutedCommand('Get-ChildItem -Force .git')) {
        return { passed: true, message: 'Excellent! You inspected the internal components of .git.' };
      }
      return { passed: false, message: 'Run `ls -la .git` to view internal Git files and folders.' };
    },
    objectives: [
      { label: 'Run ls -la .git command', done: (repo) => repo.hasExecutedCommand('ls -la .git') || repo.hasExecutedCommand('ls .git') || repo.hasExecutedCommand('Get-ChildItem -Force .git') },
      { label: 'Inspect HEAD, config, objects, and refs', done: (repo) => repo.hasExecutedCommand('ls -la .git') || repo.hasExecutedCommand('ls .git') || repo.hasExecutedCommand('Get-ChildItem -Force .git') }
    ],
    hints: [
      'Type `ls -la .git` and press Enter.'
    ]
  },

  // ── Challenge 42 ──
  {
    id: 'git-42-cat-git-head',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Inspect HEAD Reference (cat .git/HEAD)',
    difficulty: 'Basic',
    category: 'VCS Inspection',
    tags: ['HEAD', 'References', 'Internals'],
    interviewFrequency: 'Core Git Foundation',
    scenario: 'Display the contents of the .git/HEAD file to inspect what ref it is currently pointing to.',
    description: `
### Background & Context
The \`.git/HEAD\` file is a text reference indicating which branch you currently have checked out in your working directory. It typically contains a reference string like \`ref: refs/heads/main\`.

---

### Problem Statement & Task
Display the contents of the **\`.git/HEAD\`** file to inspect what ref it is currently pointing to.

---

**Example 1**:

Input:
\`\`\`bash
$ cat .git/HEAD
\`\`\`

Output:
\`\`\`
ref: refs/heads/main
\`\`\`

---

**Acceptance Criteria**:
1. Run \`cat .git/HEAD\` in the terminal.
2. Confirm the reference pointer is displayed.
    `,
    initialState: {
      isRepo: true,
      cwd: '/home/student/project/foundations-practice',
      currentBranch: 'main',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('cat .git/HEAD') || repo.hasExecutedCommand('Get-Content .git/HEAD') || repo.hasExecutedCommand('type .git/HEAD')) {
        return { passed: true, message: 'HEAD inspected! It points to refs/heads/main.' };
      }
      return { passed: false, message: 'Run `cat .git/HEAD` to display the contents of the HEAD file.' };
    },
    objectives: [
      { label: 'Run cat .git/HEAD', done: (repo) => repo.hasExecutedCommand('cat .git/HEAD') || repo.hasExecutedCommand('Get-Content .git/HEAD') || repo.hasExecutedCommand('type .git/HEAD') },
      { label: 'Verify HEAD points to refs/heads/main', done: (repo) => repo.hasExecutedCommand('cat .git/HEAD') || repo.hasExecutedCommand('Get-Content .git/HEAD') || repo.hasExecutedCommand('type .git/HEAD') }
    ],
    hints: [
      'Type `cat .git/HEAD` and press Enter.'
    ]
  },

  // ── Challenge 43 ──
  {
    id: 'git-43-cat-git-config',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Inspect Repository Config (cat .git/config)',
    difficulty: 'Basic',
    category: 'VCS Inspection',
    tags: ['.git/config', 'Configuration', 'Internals'],
    interviewFrequency: 'Core Git Foundation',
    scenario: 'Display the contents of the repository\'s local configuration file located at .git/config.',
    description: `
### Background & Context
Git uses an INI-style configuration file at \`.git/config\` to store repository-specific options, including \`repositoryformatversion\`, \`filemode\`, \`bare\`, and remote URLs.

---

### Problem Statement & Task
Display the contents of the repository's local configuration file located at **\`.git/config\`**.

---

**Example 1**:

Input:
\`\`\`bash
$ cat .git/config
\`\`\`

Output:
\`\`\`
[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
\`\`\`

---

**Acceptance Criteria**:
1. Run \`cat .git/config\` in the terminal.
2. Confirm repository configuration settings are displayed.
    `,
    initialState: {
      isRepo: true,
      cwd: '/home/student/project/foundations-practice',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('cat .git/config') || repo.hasExecutedCommand('Get-Content .git/config') || repo.hasExecutedCommand('type .git/config')) {
        return { passed: true, message: 'Local repository configuration displayed successfully!' };
      }
      return { passed: false, message: 'Run `cat .git/config` to inspect the configuration file.' };
    },
    objectives: [
      { label: 'Run cat .git/config', done: (repo) => repo.hasExecutedCommand('cat .git/config') || repo.hasExecutedCommand('Get-Content .git/config') || repo.hasExecutedCommand('type .git/config') },
      { label: 'Verify core config parameters: bare=false, formatversion=0', done: (repo) => repo.hasExecutedCommand('cat .git/config') || repo.hasExecutedCommand('Get-Content .git/config') || repo.hasExecutedCommand('type .git/config') }
    ],
    hints: [
      'Type `cat .git/config` and press Enter.'
    ]
  },

  // ── Challenge 44 ──
  {
    id: 'git-44-touch-test-py',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Create Project File in Repository (touch test.py)',
    difficulty: 'Basic',
    category: 'File Management',
    tags: ['touch', 'Working Tree', 'Python'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Create an empty file named test.py in your new repository.',
    description: `
### Background & Context
Now that your repository is initialized, any new files created in the folder reside in your **Working Directory (Working Tree)** as untracked files until explicitly added to the staging index.

---

### Problem Statement & Task
Create an empty file named **\`test.py\`** in your new repository.

---

**Example 1**:

Input:
\`\`\`bash
$ touch test.py
$ ls
\`\`\`

Output:
\`\`\`
test.py
\`\`\`

---

**Acceptance Criteria**:
1. Run \`touch test.py\` in the terminal.
2. Verify \`test.py\` is present in the working directory.
    `,
    initialState: {
      isRepo: true,
      cwd: '/home/student/project/foundations-practice',
      files: {}
    },
    validation: (repo) => {
      if (repo.readFile('test.py') !== null) {
        return { passed: true, message: 'File test.py created successfully in the repository.' };
      }
      return { passed: false, message: 'Run `touch test.py` to create the test file.' };
    },
    objectives: [
      { label: 'Create test.py with touch command', done: (repo) => repo.readFile('test.py') !== null },
      { label: 'Verify file exists in working directory', done: (repo) => repo.readFile('test.py') !== null }
    ],
    hints: [
      'Type `touch test.py` and press Enter.'
    ]
  },

  // ── Challenge 45 ──
  {
    id: 'git-45-git-status-untracked',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Detect Untracked File in Git (git status)',
    difficulty: 'Basic',
    category: 'VCS Inspection',
    tags: ['git status', 'Untracked Files', 'Staging'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Run the command that shows Git has detected the new test.py as an Untracked file.',
    description: `
### Background & Context
Git classifies files into three primary states: Untracked, Staged (Index), and Committed (HEAD). An **Untracked** file exists in your working directory but is not yet tracked in Git snapshots.

---

### Problem Statement & Task
Run the command that shows Git has detected the new **\`test.py\`** as an Untracked file.

---

**Example 1**:

Input:
\`\`\`bash
$ git status
\`\`\`

Output:
\`\`\`
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	test.py

nothing added to commit but untracked files present (use "git add" to track)
\`\`\`

---

**Acceptance Criteria**:
1. Run \`git status\` in the terminal.
2. Confirm \`test.py\` is listed under Untracked files.
    `,
    initialState: {
      isRepo: true,
      cwd: '/home/student/project/foundations-practice',
      files: {
        'test.py': '# Test script\n'
      }
    },
    validation: (repo) => {
      if (repo.readFile('test.py') !== null && (repo.hasExecutedCommand('git status') || repo.lastCommand === 'git status')) {
        return { passed: true, message: 'Great! Git correctly detected test.py in Untracked files.' };
      }
      return { passed: false, message: 'Run `git status` to see the Untracked files section.' };
    },
    objectives: [
      { label: 'Execute git status command', done: (repo) => repo.hasExecutedCommand('git status') || repo.lastCommand === 'git status' },
      { label: 'Confirm test.py is highlighted as Untracked', done: (repo) => repo.hasExecutedCommand('git status') || repo.lastCommand === 'git status' }
    ],
    hints: [
      'Type `git status` and press Enter.'
    ]
  },

  // ── Challenge 46 ──
  {
    id: 'git-46-git-clone',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Clone Public Remote Repository (git clone)',
    difficulty: 'Easy',
    category: 'Remote Operations',
    tags: ['git clone', 'Distributed VCS', 'Remotes'],
    interviewFrequency: 'Core Git Foundation',
    scenario: 'Clone a public remote repository locally to inspect how a Distributed VCS downloads full project history.',
    description: `
### Background & Context
Unlike centralized version control systems (like SVN) that require constant server connection, Git is a **Distributed Version Control System (DVCS)**. Running \`git clone\` downloads a complete copy of every commit, file, branch, and tag from the remote repository to your local machine.

---

### Problem Statement & Task
Clone the public remote repository \`https://github.com/octocat/Spoon-Knife.git\` into your workspace.

---

**Example 1**:

Input:
\`\`\`bash
$ git clone https://github.com/octocat/Spoon-Knife.git
\`\`\`

Output:
\`\`\`
Cloning into 'Spoon-Knife'...
remote: Enumerating objects: 12, done.
remote: Total 12 (delta 2), reused 12 (delta 2), pack-reused 0
Receiving objects: 100% (12/12), 1.84 KiB | 1.84 MiB/s, done.
Resolving deltas: 100% (2/2), done.
\`\`\`

---

**Acceptance Criteria**:
1. Run \`git clone https://github.com/octocat/Spoon-Knife.git\` in the terminal.
2. Confirm the repository folder \`Spoon-Knife\` is created and cloned.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      files: {}
    },
    validation: (repo) => {
      if (repo.hasDirectory('Spoon-Knife') || repo.hasExecutedCommand('git clone')) {
        return { passed: true, message: 'Repository cloned! Complete distributed history downloaded.' };
      }
      return { passed: false, message: 'Run `git clone https://github.com/octocat/Spoon-Knife.git`.' };
    },
    objectives: [
      { label: 'Run git clone with target repository URL', done: (repo) => repo.hasDirectory('Spoon-Knife') || repo.hasExecutedCommand('git clone') },
      { label: 'Verify Spoon-Knife directory creation and download', done: (repo) => repo.hasDirectory('Spoon-Knife') || repo.hasExecutedCommand('git clone') }
    ],
    hints: [
      'Type `git clone https://github.com/octocat/Spoon-Knife.git` and press Enter.'
    ]
  },

  // ── Challenge 47 ──
  {
    id: 'git-47-git-log-cloned',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Inspect Cloned Commit History (git log)',
    difficulty: 'Easy',
    category: 'VCS Inspection',
    tags: ['git log', 'Commit History', 'Inspection'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Enter the cloned Spoon-Knife directory and view the commit history log.',
    description: `
### Background & Context
Because Git is distributed, all commit logs and historical diffs are stored locally in the \`.git\` folder. You can browse past commits with \`git log\` completely offline without needing internet access.

---

### Problem Statement & Task
Enter the cloned **\`Spoon-Knife\`** directory and view the commit history log.

---

**Example 1**:

Input:
\`\`\`bash
$ cd Spoon-Knife && git log
\`\`\`

Output:
\`\`\`
commit c101
Author: The Octocat <octocat@github.com>
Date:   Oct 24 10:00

    Add project documentation and assets

commit c100
Author: The Octocat <octocat@github.com>
Date:   Sep 29 10:00

    Initial commit
\`\`\`

---

**Acceptance Criteria**:
1. Navigate into \`Spoon-Knife\` using \`cd Spoon-Knife\`.
2. Run \`git log\` to view the commit history.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      directories: ['Spoon-Knife'],
      files: {}
    },
    validation: (repo) => {
      if ((repo.getCwd().endsWith('Spoon-Knife') || repo.hasExecutedCommand('cd Spoon-Knife')) && (repo.hasExecutedCommand('git log') || repo.lastCommand.includes('git log'))) {
        return { passed: true, message: 'Commit history inspected successfully offline!' };
      }
      return { passed: false, message: 'Navigate into Spoon-Knife and run `git log`.' };
    },
    objectives: [
      { label: 'Navigate into Spoon-Knife folder: cd Spoon-Knife', done: (repo) => repo.getCwd().endsWith('Spoon-Knife') || repo.hasExecutedCommand('cd Spoon-Knife') },
      { label: 'View commit logs using git log', done: (repo) => repo.hasExecutedCommand('git log') || repo.lastCommand.includes('git log') }
    ],
    hints: [
      'Run `cd Spoon-Knife && git log` or execute them sequentially.'
    ]
  },

  // ── Challenge 48 ──
  {
    id: 'git-48-git-log-oneline',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Compact Commit History (git log --oneline)',
    difficulty: 'Basic',
    category: 'VCS Inspection',
    tags: ['git log --oneline', 'Commit History', 'CLI'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Display the commit history of the cloned repository in a compact, single-line format.',
    description: `
### Background & Context
When inspecting repositories with hundreds of commits, the default \`git log\` output occupies too much vertical space. Passing the \`--oneline\` flag compacts each commit to its 7-character abbreviated SHA hash and subject line.

---

### Problem Statement & Task
Display the commit history of the cloned repository in a compact, single-line format.

---

**Example 1**:

Input:
\`\`\`bash
$ git log --oneline
\`\`\`

Output:
\`\`\`
c101 Add project documentation and assets
c100 Initial commit
\`\`\`

---

**Acceptance Criteria**:
1. Run \`git log --oneline\` in the terminal.
2. Confirm commits are formatted as single lines with 7-character hashes.
    `,
    initialState: {
      isRepo: true,
      cwd: '/home/student/project/Spoon-Knife',
      commits: [
        { id: 'c100', message: 'Initial commit', files: { 'README.md': '# Spoon Knife\n' } },
        { id: 'c101', message: 'Add project documentation and assets', files: { 'index.html': '<h1>Home</h1>\n' } }
      ],
      currentBranch: 'main'
    },
    validation: (repo) => {
      if (repo.hasExecutedCommand('git log --oneline') || repo.lastCommand.includes('--oneline')) {
        return { passed: true, message: 'Clean single-line commit history displayed!' };
      }
      return { passed: false, message: 'Run `git log --oneline` in the repository.' };
    },
    objectives: [
      { label: 'Run git log --oneline', done: (repo) => repo.hasExecutedCommand('git log --oneline') || repo.lastCommand.includes('--oneline') },
      { label: 'Verify 7-character abbreviated hash output', done: (repo) => repo.hasExecutedCommand('git log --oneline') || repo.lastCommand.includes('--oneline') }
    ],
    hints: [
      'Type `git log --oneline` and press Enter.'
    ]
  },

  // ── Challenge 49 ──
  {
    id: 'git-49-deversion-repo',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'De-versioning a Repository (rm -rf .git)',
    difficulty: 'Easy',
    category: 'Repository Lifecycle',
    tags: ['rm -rf', '.git', 'De-versioning'],
    interviewFrequency: 'Core Git Foundation',
    scenario: 'Step out of the repository and delete the practice repository\'s .git folder to observe what happens when a repository is de-versioned.',
    description: `
### Background & Context
All Git version control history, commit graphs, and branch references reside entirely within the single hidden \`.git\` directory. Deleting this folder removes all version tracking while leaving your project source files intact. Any subsequent \`git\` command will report: "fatal: not a git repository".

---

### Problem Statement & Task
Step out of the repository and delete the \`.git\` folder to observe de-versioning.

---

**Example 1**:

Input:
\`\`\`bash
$ cd .. && rm -rf foundations-practice/.git
$ cd foundations-practice && git status
\`\`\`

Output:
\`\`\`
fatal: not a git repository (or any of the parent directories): .git
\`\`\`

---

**Cross-Platform Reference**:
- **Bash / Linux / macOS**: \`rm -rf foundations-practice/.git\`
- **Windows PowerShell**: \`Remove-Item -Recurse -Force foundations-practice\\.git\`
- **Windows Command Prompt**: \`rmdir /s /q foundations-practice\\.git\`

---

**Acceptance Criteria**:
1. Delete the \`.git\` folder using \`rm -rf .git\` (or \`rm -rf foundations-practice/.git\`).
2. Verify that running \`git status\` confirms the directory is no longer a Git repository.
    `,
    initialState: {
      isRepo: true,
      cwd: '/home/student/project/foundations-practice',
      files: {
        'test.py': '# Test script\n'
      }
    },
    validation: (repo) => {
      if (!repo.isInitialized() || repo.hasExecutedCommand('rm -rf') || repo.hasExecutedCommand('Remove-Item')) {
        return { passed: true, message: 'Repository de-versioned! .git folder removed, project files preserved.' };
      }
      return { passed: false, message: 'Delete the .git folder: `rm -rf .git` (or `rm -rf foundations-practice/.git`).' };
    },
    objectives: [
      { label: 'Delete .git directory with rm -rf .git', done: (repo) => !repo.isInitialized() || repo.hasExecutedCommand('rm -rf') || repo.hasExecutedCommand('Remove-Item') },
      { label: 'Confirm git status reports not a git repository', done: (repo) => !repo.isInitialized() || repo.hasExecutedCommand('rm -rf') || repo.hasExecutedCommand('Remove-Item') }
    ],
    hints: [
      'Type `rm -rf .git` or `cd .. && rm -rf foundations-practice/.git` and press Enter.'
    ]
  },

  // ── Challenge 50 ──
  {
    id: 'git-50-cleanup-directories',
    track: 'foundations',
    moduleId: 'day-1-git',
    moduleTitle: 'Day 1: Git Installation & Environment Verification',
    title: 'Workspace Clean Up (rm -rf practice directories)',
    difficulty: 'Basic',
    category: 'Directory Management',
    tags: ['rm -rf', 'Cleanup', 'Directory Management'],
    interviewFrequency: 'Daily Essential Workflow',
    scenario: 'Clean up and remove the practice directory foundations-practice and cloned Spoon-Knife folder completely from your machine.',
    description: `
### Background & Context
After completing local experiments and verification labs, developers clean up temporary sandbox directories to keep the workspace tidy and free disk space.

---

### Problem Statement & Task
Clean up and remove the practice directory **\`foundations-practice\`** and cloned **\`Spoon-Knife\`** folder completely.

---

**Example 1**:

Input:
\`\`\`bash
$ rm -rf foundations-practice Spoon-Knife
$ ls
\`\`\`

Explanation:
Both practice folders are deleted, restoring your workspace to a clean state.

---

**Cross-Platform Reference**:
- **Bash / Linux / macOS**: \`rm -rf foundations-practice Spoon-Knife\`
- **Windows PowerShell**: \`Remove-Item -Recurse -Force foundations-practice, Spoon-Knife\`

---

**Acceptance Criteria**:
1. Run \`rm -rf foundations-practice Spoon-Knife\` in the terminal.
2. Verify \`ls\` confirms both practice folders are completely removed.
    `,
    initialState: {
      isRepo: false,
      cwd: '/home/student/project',
      directories: ['foundations-practice', 'Spoon-Knife'],
      files: {}
    },
    validation: (repo) => {
      if (!repo.hasDirectory('foundations-practice') && !repo.hasDirectory('Spoon-Knife')) {
        return { passed: true, message: 'Workspace cleaned up successfully! Congratulations on completing Day 0 and Day 1!' };
      }
      return { passed: false, message: 'Run `rm -rf foundations-practice Spoon-Knife` to clean up the workspace.' };
    },
    objectives: [
      { label: 'Run rm -rf foundations-practice Spoon-Knife', done: (repo) => !repo.hasDirectory('foundations-practice') && !repo.hasDirectory('Spoon-Knife') },
      { label: 'Confirm workspace is back to clean state', done: (repo) => !repo.hasDirectory('foundations-practice') && !repo.hasDirectory('Spoon-Knife') }
    ],
    hints: [
      'Type `rm -rf foundations-practice Spoon-Knife` and press Enter.'
    ]
  },

  // ═══════════════════════════════════════════════════════
  // PART 3: INTERMEDIATE BRANCHING, MERGING & ADVANCED WORKFLOWS
  // ═══════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════
  // LEVEL 1: BASIC & FOUNDATIONS
  // ═══════════════════════════════════════════════════════
  {
    id: 'git-init-first-commit',
    title: 'Initialize a Repo & Create First Commit',
    track: 'basics',
    difficulty: 'Basic',
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
        return { passed: false, message: 'Repository is not initialized. Initialize the repository first.' };
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
      return { passed: true, message: 'Excellent! You initialized the repository and recorded your first atomic snapshot.' };
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
    difficulty: 'Basic',
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
      return { passed: true, message: 'Perfect! You practiced selective staging.' };
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
    difficulty: 'Basic',
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
      return { passed: true, message: 'Fantastic! You protected sensitive credentials with .gitignore.' };
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
    difficulty: 'Basic',
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
      return { passed: true, message: 'Nice job inspecting logs and documenting changes!' };
    },
    hints: [
      'Run `git log --oneline` to view all recent commits.',
      'Create changelog.txt with: `echo "Identified bug in broken database query" > changelog.txt`.',
      'Stage and commit: `git add changelog.txt` and `git commit -m "docs: add changelog"`.'
    ]
  },

  // ═══════════════════════════════════════════════════════
  // LEVEL 2: EASY (BRANCHING & MERGING)
  // ═══════════════════════════════════════════════════════
  {
    id: 'git-branch-create-switch',
    title: 'Create and Switch to a Feature Branch',
    track: 'branching',
    difficulty: 'Easy',
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
      return { passed: true, message: 'Well done! You created, switched, and committed on a feature branch.' };
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
    difficulty: 'Easy',
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
      return { passed: true, message: 'Great work! You executed a clean Fast-Forward merge.' };
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
    difficulty: 'Easy',
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
      return { passed: true, message: 'Awesome! You performed a 3-way merge with two parent commits.' };
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
    difficulty: 'Easy',
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
        return { passed: false, message: 'Complete and record the merge commit.' };
      }
      return { passed: true, message: 'Victorious! You successfully resolved a merge conflict like a pro.' };
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
    difficulty: 'Medium',
    category: 'Stashing',
    scenario: 'You are working on experimental changes in search.js on main, but an urgent bug requires your working directory to be clean. Shelve your changes so the working directory is clean, then re-apply them.',
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
      if (!repo.hasUsedStash) {
        return { passed: false, message: 'You must stash your uncommitted work first, then restore it.' };
      }
      const searchContent = repo.readFile('search.js');
      if (!searchContent || !searchContent.includes('experimental AI search')) {
        return { passed: false, message: 'The experimental changes in search.js must be present (popped back from stash).' };
      }
      const stashList = repo.getStashList();
      if (stashList.length > 0) {
        return { passed: false, message: 'You stashed changes, but did not restore them back to the working directory.' };
      }
      return { passed: true, message: 'Excellent! You stashed your work and popped it back cleanly.' };
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
    difficulty: 'Medium',
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
        return { passed: false, message: 'The working directory changes should not be erased. Unstage the commit while preserving your files in the working directory.' };
      }
      if (repo.isIndexClean() === false) {
        // If staged, it was soft reset. Requirement specified mixed (unstaged)
        return { passed: false, message: 'Changes should be unstaged in the working directory (mixed reset).' };
      }
      return { passed: true, message: 'Masterful! You rewound the commit while safely preserving your work.' };
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
    difficulty: 'Medium',
    category: 'History',
    scenario: 'A critical security fix was committed on the experimental branch (commit "fix: patch auth vulnerability"). Apply only that specific commit onto main without merging the rest of experimental.',
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
      return { passed: true, message: 'Spectacular! You cherry-picked the exact bugfix commit.' };
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
    difficulty: 'Medium',
    category: 'Undoing',
    scenario: 'Commit c202 introduced a regression in production that broke payments. Revert the changes from commit c202 safely, preserving linear project history.',
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
        return { passed: false, message: 'A new revert commit must be added to history to invert the faulty change.' };
      }
      const latest = repo.getLatestCommit();
      if (!latest.message.toLowerCase().includes('revert')) {
        return { passed: false, message: 'The latest commit should be a revert commit.' };
      }
      const paymentCode = repo.readFile('payments.js');
      if (paymentCode.includes('broken')) {
        return { passed: false, message: 'payments.js still contains the broken error.' };
      }
      return { passed: true, message: 'Safe and sound! You reverted the faulty commit without rewriting public history.' };
    },
    hints: [
      'Check history: `git log --oneline`.',
      'Run `git revert c202` (or `git revert HEAD`).'
    ]
  },

  // ═══════════════════════════════════════════════════════
  // LEVEL 3: MEDIUM (COLLABORATION & UNDOING)
  // ═══════════════════════════════════════════════════════
  {
    id: 'git-remote-add',
    title: 'Connect Local Repo to Remote Origin',
    track: 'remotes',
    difficulty: 'Hard',
    category: 'Remotes',
    scenario: 'Your project currently has no remote server configured. Add a remote named "origin" pointing to "https://github.com/mscprpcem/quiz-platform.git" and confirm the remote configuration.',
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
      return { passed: true, message: 'Connected! You configured your remote repository origin.' };
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
    difficulty: 'Hard',
    category: 'Remotes',
    scenario: 'You committed a new feature locally. Publish the "feature/profile" branch to remote "origin" and configure upstream tracking.',
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
      return { passed: true, message: 'Success! Your branch and commits are safely published to the remote origin.' };
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
    difficulty: 'Hard',
    category: 'Remotes',
    scenario: 'Your teammate pushed a new commit to origin/main. Safely download the latest remote commits without altering your local working directory or branch.',
    initialState: {
      isRepo: true,
      remotes: {
        origin: {
          url: 'https://github.com/mscprpcem/quiz-platform.git',
          branches: {}
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
        return { passed: false, message: 'Download the remote tracking references first.' };
      }
      if (repo.getBranchCommit('main') === 'f202') {
        return { passed: false, message: 'Local main was merged! The goal was to only fetch without merging.' };
      }
      return { passed: true, message: 'Pristine! You inspected remote tracking branches without mutating local state.' };
    },
    hints: [
      'Run `git fetch origin`.',
      'Inspect what was downloaded using `git log origin/main --oneline`.'
    ]
  },

  // ═══════════════════════════════════════════════════════
  // LEVEL 4: HARD (REMOTES & RELEASES)
  // ═══════════════════════════════════════════════════════
  {
    id: 'git-tag-release',
    title: 'Tag an Official SemVer Release',
    track: 'advanced',
    difficulty: 'Hard',
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
        return { passed: false, message: 'Create an annotated tag with release documentation.' };
      }
      return { passed: true, message: 'Milestone achieved! You marked an immutable production release tag.' };
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
    difficulty: 'Extreme',
    category: 'Recovery',
    scenario: 'An accidental hard reset destroyed the last commit containing database.js! Inspect the reference history to locate the lost commit hash and restore it.',
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
      return { passed: true, message: 'Miracle recovery! You retrieved the orphaned commit from the reflog.' };
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
    difficulty: 'Extreme',
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
        return { passed: false, message: 'Do not merge! Rebase produces a linear commit history with a single parent.' };
      }
      return { passed: true, message: 'Elegant! You maintained a pristine linear git commit history.' };
    },
    hints: [
      'Make sure you are on your feature branch: `git switch feature/dashboard`.',
      'Run `git rebase main`.'
    ]
  },

  // ═══════════════════════════════════════════════════════
  // LEVEL 5: EXTREME (PRODUCTION & DISASTER RECOVERY)
  // ═══════════════════════════════════════════════════════
  {
    id: 'git-secret-scrubbing',
    title: 'Emergency Secret Scrubbing from Commit',
    track: 'real-world',
    difficulty: 'Extreme',
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
        return { passed: false, message: 'secrets.txt is still tracked in the latest commit! Remove it from staging while keeping the local file.' };
      }
      return { passed: true, message: 'Security incident contained! You untracked the leaked secret and updated .gitignore.' };
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
    difficulty: 'Extreme',
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
      return { passed: true, message: 'Flawless emergency response! You patched production without downtime.' };
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
