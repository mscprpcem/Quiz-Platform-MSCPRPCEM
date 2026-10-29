// Git Interactive Practice Challenges (70 Hands-on Labs)
// Designed for MSC PRPCEM Assessment & Learning Platform
// Track 1: Terminal & Shell Foundations (Challenges 1-25)
// Track 2: Git Setup & Repository Management (Challenges 26-50)
// Track 3: Git Branching & Advanced Workflows (Challenges 51-70)
export function slugifyTitle(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getGitChallengeSlug(challenge) {
  if (!challenge) return '';
  if (challenge.slug) return challenge.slug;
  return slugifyTitle(challenge.title) || challenge.id;
}

const RAW_GIT_CHALLENGES = [
  {
    id: "cli-01-pwd",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Print Current Working Directory",
    difficulty: "Basic",
    category: "Terminal Navigation",
    tags: ["Terminal","Navigation","Paths","Filesystem"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Determine and print the absolute filesystem path of your active working location.",
    description: "### Background & Context\nWhen operating inside a command-line interface (CLI) or terminal, your shell maintains a pointer to an active location on disk known as the **Current Working Directory (CWD)**. All relative file operations resolve against this location.\n\n---\n\n### Problem Statement & Task\nWrite and execute the standard POSIX command to determine and print the full, absolute file path of the directory you are currently standing in.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Active Shell Session: standard interactive terminal\n- Directory Hierarchy: user home directory containing active workspace\n\n**Expected Output Format**:\n```output\n/home/student/project\n```\n\n**Explanation**:\nThe terminal standard output prints the complete, unambiguous absolute directory path starting from the root filesystem `/`.\n\n---\n\n**Constraints & Specifications**:\n- Must be executed directly in the active shell environment.\n- The path must be absolute (commencing with `/` in POSIX or drive root on Windows).\n\n---\n\n**Acceptance Criteria**:\n1. The full absolute path of the current directory is written to standard output.\n2. The working directory state remains unchanged.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const usedCommand = history.some(c => c.trim() === 'pwd' || c.trim() === 'echo $PWD' || c.trim() === 'cd' || c.trim() === 'gl' || c.trim() === 'Get-Location');
          if (usedCommand) {
            return { passed: true, message: 'Correct! The absolute working directory path was displayed.' };
          }
          return { passed: false, message: 'Please run the command that prints the current working directory path.' };
        },
    objectives: [
      { label: "Determine and print current working directory path", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => ['pwd', 'echo $PWD', 'cd', 'gl', 'Get-Location'].includes(c.trim())) }
    ],
    hints: [
      "Consider which standard POSIX command prints the active working directory path.",
      "Think of a three-letter acronym that stands for \"print working directory\"."
    ]
  },

  {
    id: "cli-02-ls",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "List Directory Contents",
    difficulty: "Basic",
    category: "Directory Operations",
    tags: ["Terminal","Directory Listing","Filesystem"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Query the directory table to inspect all non-hidden files and folders in your working directory.",
    description: "### Background & Context\nNavigating project files requires regularly querying directory structures to see which source files, configuration assets, and subdirectories are present.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command that lists all visible (non-hidden) files and folders located in your current directory.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Current Directory: `/home/student/project`\n- Files Present: `README.md`, `package.json`, `src`\n\n**Expected Output Format**:\n```output\nREADME.md  package.json  src\n```\n\n**Explanation**:\nThe terminal standard output lists each non-hidden entry residing inside the target directory.\n\n---\n\n**Constraints & Specifications**:\n- Hidden files (names prefixed with a period `.`) should be omitted in this basic query.\n\n---\n\n**Acceptance Criteria**:\n1. All non-hidden files and subdirectories are listed in standard output.",
    initialState: {
        "isRepo": false,
        "files": {
            "README.md": "# Project\n",
            "package.json": "{\n  \"name\": \"project\"\n}\n",
            "src/index.js": "console.log(\"hello\");\n"
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const usedCommand = history.some(c => c.trim() === 'ls' || c.trim() === 'dir' || c.trim() === 'Get-ChildItem');
          if (usedCommand) {
            return { passed: true, message: 'Great job! Directory contents were listed.' };
          }
          return { passed: false, message: 'Execute the command that lists directory entries.' };
        },
    objectives: [
      { label: "Query and list non-hidden directory entries", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => ['ls', 'dir', 'Get-ChildItem'].includes(c.trim())) }
    ],
    hints: [
      "Which standard two-letter command is used in Unix-like systems to list directory contents?",
      "On Windows Command Prompt, the equivalent utility is \"dir\"."
    ]
  },

  {
    id: "cli-03-ls-la",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Detailed & Hidden File Inspection",
    difficulty: "Basic",
    category: "File Inspection",
    tags: ["File Systems","Permissions","Hidden Files","Metadata"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Reveal hidden configuration files and display detailed metadata including file permissions, sizes, and timestamps.",
    description: "### Background & Context\nOperating systems conceal internal configuration files (such as environment definitions and version control directories) by prefixing their names with a dot (`.`). Additionally, verifying file access permissions, user ownership, byte size, and modification timestamps is essential for system auditing.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command that displays a detailed, long-format listing of every file and folder in the current directory, explicitly including hidden dotfiles.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Current Directory: `/home/student/project`\n- Files Present: `.env` (hidden), `README.md` (visible)\n\n**Expected Output Format**:\n```output\ndrwxr-xr-x 1 student student  4096 Oct 29 09:00 .\ndrwxr-xr-x 1 student student  4096 Oct 29 09:00 ..\n-rw-r--r-- 1 student student   120 Oct 29 09:00 .env\n-rw-r--r-- 1 student student   350 Oct 29 09:00 README.md\n```\n\n**Explanation**:\nThe listing reveals file permissions (`drwxr-xr-x`), link counts, owner/group identity, file byte size, timestamp, and all dotfile entries.\n\n---\n\n**Constraints & Specifications**:\n- Output must display long-format metadata columns.\n- Hidden dotfiles starting with a period must be included.\n\n---\n\n**Acceptance Criteria**:\n1. Detailed file permissions, ownership, and byte size attributes are shown.\n2. Hidden configuration files starting with `.` appear in the output stream.",
    initialState: {
        "isRepo": false,
        "files": {
            ".env": "PORT=3000\nSECRET=supersecret\n",
            "README.md": "# Secret Project\n"
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const passed = history.some(c => /ls\s+(-[a-zA-Z]*l[a-zA-Z]*a[a-zA-Z]*|-[a-zA-Z]*a[a-zA-Z]*l[a-zA-Z]*|-la|-al|-l\s+-a|-a\s+-l)/.test(c) || c.includes('Get-ChildItem -Force') || c.includes('dir /a') || c.includes('dir /ah'));
          if (passed) {
            return { passed: true, message: 'Correct! Detailed metadata and hidden dotfiles were revealed.' };
          }
          return { passed: false, message: 'Please run the directory listing command with options for long format and all files.' };
        },
    objectives: [
      { label: "Display detailed file permissions, size, and metadata columns", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => /ls\s+(-[a-zA-Z]*l|-l)/.test(c) || c.includes('dir /') || c.includes('Get-ChildItem')) },
      { label: "Reveal hidden dotfiles in directory listing", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => /ls\s+(-[a-zA-Z]*a|-a)/.test(c) || c.includes('dir /a') || c.includes('-Force')) }
    ],
    hints: [
      "Think about which command lists directory contents, and look up options for \"long listing\" and \"all files\".",
      "In POSIX shells, individual single-character flags can be combined into a single flag argument after a hyphen."
    ]
  },

  {
    id: "cli-04-mkdir-git-prep",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Create Subdirectory git-prep",
    difficulty: "Basic",
    category: "Directory Management",
    tags: ["Directories","Filesystem","CLI"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Create a dedicated subdirectory named git-prep inside your current working directory.",
    description: "### Background & Context\nOrganizing codebases requires structured directory hierarchies to isolate modules, assets, and preparation workspaces.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to create a new folder named `git-prep` in your current working location.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Current Directory: `/home/student/project`\n- Existing Folders: None\n\n**Expected Output Format**:\n```output\nDirectory /home/student/project/git-prep created.\n```\n\n**Explanation**:\nA new directory node `git-prep` is created within the active directory table.\n\n---\n\n**Acceptance Criteria**:\n1. Directory `git-prep` exists in the current working location.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (repo.hasDirectory('git-prep')) {
            return { passed: true, message: 'Directory git-prep created successfully.' };
          }
          return { passed: false, message: 'Folder git-prep was not found. Please create it.' };
        },
    objectives: [
      { label: "Create directory named git-prep in active folder", done: (repo) => repo.hasDirectory('git-prep') }
    ],
    hints: [
      "Which command is used across operating systems to make a new directory?",
      "Pass the directory name as an argument to the make directory command."
    ]
  },

  {
    id: "cli-05-cd-git-prep",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Navigate into Subdirectory",
    difficulty: "Basic",
    category: "Terminal Navigation",
    tags: ["Navigation","Path Resolution","Shell"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Change your active working directory to enter the newly created git-prep folder.",
    description: "### Background & Context\nNavigating down through project trees allows you to execute commands relative to a specific subcomponent without referencing long absolute paths.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to change your active working directory into the `git-prep` folder.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Initial Directory: `/home/student/project`\n- Subfolder: `git-prep`\n\n**Expected Output Format**:\n```output\nCurrent Working Directory: /home/student/project/git-prep\n```\n\n**Explanation**:\nThe shell updates its internal CWD pointer to point to the child directory `git-prep`.\n\n---\n\n**Acceptance Criteria**:\n1. The shell's active working directory ends with `/git-prep`.",
    initialState: {
        "isRepo": false,
        "files": {
            "git-prep/.keep": ""
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          const cwd = repo.getCwd ? repo.getCwd() : '';
          if (cwd.endsWith('git-prep')) {
            return { passed: true, message: 'Navigation successful. You are now inside git-prep.' };
          }
          return { passed: false, message: 'Active directory does not end in git-prep. Please change directory.' };
        },
    objectives: [
      { label: "Change current working location into git-prep", done: (repo) => (repo.getCwd ? repo.getCwd() : '').endsWith('git-prep') }
    ],
    hints: [
      "Which two-letter command is universally used to change directories?",
      "Provide the target folder name as the navigation target."
    ]
  },

  {
    id: "cli-06-cd-parent",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Navigate to Parent Directory",
    difficulty: "Basic",
    category: "Terminal Navigation",
    tags: ["Navigation","Relative Paths","Filesystem"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Move back up one directory level from git-prep into the parent project directory.",
    description: "### Background & Context\nHierarchical filesystems provide standard relative aliases to represent the active directory and its immediate parent without having to type absolute paths.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to move up one level into the parent directory, exiting `git-prep`.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Initial Directory: `/home/student/project/git-prep`\n\n**Expected Output Format**:\n```output\nCurrent Working Directory: /home/student/project\n```\n\n**Explanation**:\nThe shell traverses up the directory tree using the parent relative path token.\n\n---\n\n**Acceptance Criteria**:\n1. The shell's active working directory is `/home/student/project`.",
    initialState: {
        "isRepo": false,
        "files": {
            "git-prep/.keep": ""
        },
        "currentBranch": "main",
        "initialCwd": "/home/student/project/git-prep"
    },
    validation: (repo) => {
          const cwd = repo.getCwd ? repo.getCwd() : '';
          if (cwd.endsWith('/project') || cwd.endsWith('\\project')) {
            return { passed: true, message: 'Returned to parent directory successfully.' };
          }
          return { passed: false, message: 'You are still inside git-prep. Navigate up to the parent directory.' };
        },
    objectives: [
      { label: "Navigate to parent directory one level above", done: (repo) => !(repo.getCwd ? repo.getCwd() : '').endsWith('git-prep') }
    ],
    hints: [
      "Recall which two characters denote the parent directory in relative filesystem paths.",
      "Combine the change directory command with the two-dot relative path alias."
    ]
  },

  {
    id: "cli-07-mkdir-spaces",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Create Directory Containing Spaces",
    difficulty: "Basic",
    category: "Directory Management",
    tags: ["Directory Management","Quoting","Escaping"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Create a single directory named \"cert practice\" containing a space without causing the shell to split it into two folders.",
    description: "### Background & Context\nCommand-line shells tokenize inputs using whitespace as argument delimiters. If an unquoted folder name with spaces is provided to a command, the shell treats each word as a distinct argument, creating multiple unwanted directories.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to create a single directory named `cert practice` in your current working location without creating separate `cert` and `practice` folders.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Working Directory: `/home/student/project`\n\n**Expected Output Format**:\n```output\nDirectory 'cert practice' created successfully.\n```\n\n**Explanation**:\nQuoting or escaping prevents word-splitting, ensuring a single folder node is registered.\n\n---\n\n**Acceptance Criteria**:\n1. A single directory named `cert practice` is created.\n2. No separate directories named `cert` or `practice` exist.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (repo.hasDirectory('cert practice') && !repo.hasDirectory('cert') && !repo.hasDirectory('practice')) {
            return { passed: true, message: 'Directory "cert practice" created successfully with proper whitespace escaping.' };
          }
          if (repo.hasDirectory('cert') || repo.hasDirectory('practice')) {
            return { passed: false, message: 'Shell word splitting occurred: separate folders "cert" and "practice" were created. Quote the argument.' };
          }
          return { passed: false, message: 'Directory "cert practice" not found. Please create it.' };
        },
    objectives: [
      { label: "Create single directory containing space in name", done: (repo) => repo.hasDirectory('cert practice') && !repo.hasDirectory('cert') }
    ],
    hints: [
      "How do you tell the shell to treat a string with spaces as a single argument?",
      "Wrap the directory name in double quotes or escape the space character with a backslash."
    ]
  },

  {
    id: "cli-08-cd-spaces",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Navigate into Directory with Spaces",
    difficulty: "Basic",
    category: "Terminal Navigation",
    tags: ["Navigation","Quoting","Paths"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Change directory into the folder named \"cert practice\" using proper shell quoting.",
    description: "### Background & Context\nWhen changing directory into folders that contain spaces, unquoted arguments cause the shell to interpret subsequent tokens as additional parameters.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to change your active working directory into `cert practice`.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Current Directory: `/home/student/project`\n- Folder Present: `cert practice`\n\n**Expected Output Format**:\n```output\nCurrent Working Directory: /home/student/project/cert practice\n```\n\n**Explanation**:\nThe shell resolves the quoted folder destination and updates the active path.\n\n---\n\n**Acceptance Criteria**:\n1. Active working directory ends with `cert practice`.",
    initialState: {
        "isRepo": false,
        "files": {
            "cert practice/.keep": ""
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          const cwd = repo.getCwd ? repo.getCwd() : '';
          if (cwd.endsWith('cert practice')) {
            return { passed: true, message: 'Navigation into "cert practice" successful.' };
          }
          return { passed: false, message: 'Active directory is not "cert practice". Please change directory.' };
        },
    objectives: [
      { label: "Change active directory into folder with spaces", done: (repo) => (repo.getCwd ? repo.getCwd() : '').endsWith('cert practice') }
    ],
    hints: [
      "Just like when creating a directory with spaces, quote the destination path when navigating.",
      "Pass the folder name enclosed in quotes to the directory change command."
    ]
  },

  {
    id: "cli-09-cd-home",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Return to User Home Directory",
    difficulty: "Basic",
    category: "Terminal Navigation",
    tags: ["Navigation","Home Directory","Shortcuts"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Navigate directly to your user account home directory in a single step regardless of current nesting depth.",
    description: "### Background & Context\nWorking deep within nested subprojects can require rapidly returning to your base home profile root. Standard shells provide shortcuts to jump to home immediately.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to navigate directly to your user's Home directory in one step.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Current Directory: `/home/student/project/cert practice`\n\n**Expected Output Format**:\n```output\nCurrent Working Directory: /home/student\n```\n\n**Explanation**:\nThe shell interprets the home shortcut and updates the CWD to the user root.\n\n---\n\n**Acceptance Criteria**:\n1. Active working directory is `/home/student`.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main",
        "initialCwd": "/home/student/project/cert practice"
    },
    validation: (repo) => {
          const cwd = repo.getCwd ? repo.getCwd() : '';
          if (cwd === '/home/student' || cwd === '~' || cwd === 'C:\\Users\\student') {
            return { passed: true, message: 'Successfully navigated directly to user home directory.' };
          }
          return { passed: false, message: 'Current directory is not user home. Please navigate to ~.' };
        },
    objectives: [
      { label: "Navigate directly to user home directory root", done: (repo) => ['/home/student', '~', 'C:\\Users\\student'].includes(repo.getCwd ? repo.getCwd() : '') }
    ],
    hints: [
      "Which special symbol represents the current user home directory in Unix-like shells?",
      "In many shells, running the change directory command with no arguments also defaults to home."
    ]
  },

  {
    id: "cli-10-cd-desktop",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Navigate to Desktop Directory",
    difficulty: "Basic",
    category: "Terminal Navigation",
    tags: ["Navigation","Desktop","Relative Paths"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "From your home directory, navigate into the Desktop folder.",
    description: "### Background & Context\nUser home directories contain standard subfolders such as `Documents`, `Downloads`, and `Desktop`.\n\n---\n\n### Problem Statement & Task\nFrom your user home directory, write and execute the command to enter your `Desktop` directory.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Current Directory: `/home/student`\n- Destination Folder: `Desktop`\n\n**Expected Output Format**:\n```output\nCurrent Working Directory: /home/student/Desktop\n```\n\n**Acceptance Criteria**:\n1. Active working directory ends with `/Desktop`.",
    initialState: {
        "isRepo": false,
        "files": {
            "Desktop/.keep": ""
        },
        "currentBranch": "main",
        "initialCwd": "/home/student"
    },
    validation: (repo) => {
          const cwd = repo.getCwd ? repo.getCwd() : '';
          if (cwd.endsWith('/Desktop') || cwd.endsWith('\\Desktop')) {
            return { passed: true, message: 'Navigation to Desktop directory successful.' };
          }
          return { passed: false, message: 'Active directory does not end in Desktop.' };
        },
    objectives: [
      { label: "Change active working directory to Desktop", done: (repo) => (repo.getCwd ? repo.getCwd() : '').endsWith('Desktop') }
    ],
    hints: [
      "Use the change directory command with \"Desktop\" as the relative destination.",
      "Ensure the capitalization matches \"Desktop\"."
    ]
  },

  {
    id: "cli-11-clear",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Clear Screen Buffer Clutter",
    difficulty: "Basic",
    category: "Terminal Control",
    tags: ["Terminal","Buffer","Display"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Reset and clear the terminal screen buffer of clutter without closing the terminal window.",
    description: "### Background & Context\nLong interactive terminal sessions accumulate extensive command output that can obscure recent results. Shells provide a command to reset the visible screen buffer.\n\n---\n\n### Problem Statement & Task\nExecute the command that clears terminal output history from the visible console buffer.\n\n---\n\n**Example 1**:\n\n**Input**: Terminal filled with previous command outputs.\n**Expected Output Format**: Clean screen with prompt reset to top of window.\n\n---\n\n**Acceptance Criteria**:\n1. Terminal buffer clear command is executed.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const usedCommand = history.some(c => c.trim() === 'clear' || c.trim() === 'cls');
          if (usedCommand) {
            return { passed: true, message: 'Screen buffer cleared.' };
          }
          return { passed: false, message: 'Please run the screen clearing command.' };
        },
    objectives: [
      { label: "Clear visible terminal console screen buffer", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => ['clear', 'cls'].includes(c.trim())) }
    ],
    hints: [
      "In POSIX shells, what English word resets the display buffer?",
      "On Windows Command Prompt, the three-letter equivalent is \"cls\"."
    ]
  },

  {
    id: "cli-12-touch-notes",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Create Empty Text File",
    difficulty: "Basic",
    category: "File Management",
    tags: ["File Creation","Filesystem","POSIX"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Create an empty plain-text file named notes.txt inside your current directory.",
    description: "### Background & Context\nQuickly provisioning new files without launching a heavy visual editor is a fundamental CLI competency.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to create an empty plain-text file named `notes.txt` in your active directory.\n\n---\n\n**Example 1**:\n\n**Input**: Current directory without `notes.txt`.\n**Expected Output Format**: File `notes.txt` (0 bytes) created in current directory.\n\n---\n\n**Acceptance Criteria**:\n1. File `notes.txt` exists in the current directory.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (repo.hasFile('notes.txt')) {
            return { passed: true, message: 'File notes.txt created successfully.' };
          }
          return { passed: false, message: 'notes.txt not found. Please create it.' };
        },
    objectives: [
      { label: "Create empty file notes.txt in active directory", done: (repo) => repo.hasFile('notes.txt') }
    ],
    hints: [
      "Which standard utility creates an empty file if it does not already exist?",
      "The command name is \"touch\" in POSIX shells."
    ]
  },

  {
    id: "cli-13-touch-readme",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Create Markdown Project Documentation",
    difficulty: "Basic",
    category: "File Management",
    tags: ["File Creation","Markdown","Documentation"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Create an empty Markdown file named README.md in your project root.",
    description: "### Background & Context\nOpen-source repositories require a top-level `README.md` file to document installation, usage, and project architecture.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to create an empty Markdown file named `README.md`.\n\n---\n\n**Example 1**:\n\n**Input**: Project directory without README.\n**Expected Output Format**: File `README.md` exists in current directory.\n\n---\n\n**Acceptance Criteria**:\n1. File `README.md` exists in current directory.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (repo.hasFile('README.md')) {
            return { passed: true, message: 'README.md created successfully.' };
          }
          return { passed: false, message: 'README.md not found. Please create it.' };
        },
    objectives: [
      { label: "Create empty Markdown file README.md", done: (repo) => repo.hasFile('README.md') }
    ],
    hints: [
      "Use the standard file creation command with the target filename README.md.",
      "Ensure proper capitalization of README.md."
    ]
  },

  {
    id: "cli-14-touch-env",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Create Hidden Configuration File",
    difficulty: "Basic",
    category: "File Management",
    tags: ["Hidden Files","Configuration","File Creation"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Create a hidden empty environment configuration file named .env.",
    description: "### Background & Context\nDotfiles (files starting with `.`) store sensitive environment secrets, API keys, and tool settings that are hidden by default to avoid clutter.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to create a hidden empty file named `.env`.\n\n---\n\n**Example 1**:\n\n**Input**: Current directory without `.env`.\n**Expected Output Format**: Hidden file `.env` created in current directory.\n\n---\n\n**Acceptance Criteria**:\n1. File `.env` exists in the current directory.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (repo.hasFile('.env')) {
            return { passed: true, message: 'Hidden file .env created successfully.' };
          }
          return { passed: false, message: '.env file not found. Ensure the leading period is included.' };
        },
    objectives: [
      { label: "Create hidden environment file starting with a dot", done: (repo) => repo.hasFile('.env') }
    ],
    hints: [
      "Include the leading dot in the filename to ensure it is marked hidden by the filesystem.",
      "Use the empty file creation utility with .env as the target."
    ]
  },

  {
    id: "cli-15-cat-notes",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Display File Contents in Terminal",
    difficulty: "Basic",
    category: "File Inspection",
    tags: ["File Inspection","Streams","Stdout"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Display the contents of notes.txt directly inside the terminal window without opening a text editor.",
    description: "### Background & Context\nQuickly inspecting the contents of configuration, log, or code files from the terminal stream avoids interrupting your flow by launching full editors.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to print the text contents of `notes.txt` directly to the terminal standard output stream.\n\n---\n\n**Example 1**:\n\n**Input**: File `notes.txt` containing \"Welcome to MSC PRPCEM\".\n**Expected Output Format**:\n```output\nWelcome to MSC PRPCEM\n```\n\n**Acceptance Criteria**:\n1. Contents of `notes.txt` are written to stdout.",
    initialState: {
        "isRepo": false,
        "files": {
            "notes.txt": "Welcome to MSC PRPCEM CLI Practice!\nMastering terminal commands is essential for software engineers.\n"
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.trim().startsWith('cat notes.txt') || c.trim().startsWith('type notes.txt') || c.trim().startsWith('Get-Content notes.txt'));
          if (used) {
            return { passed: true, message: 'Contents of notes.txt successfully displayed.' };
          }
          return { passed: false, message: 'Please run the command that outputs the file contents to terminal.' };
        },
    objectives: [
      { label: "Display file contents of notes.txt in stdout", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => ['cat', 'type', 'Get-Content'].some(cmd => c.trim().startsWith(cmd) && c.includes('notes.txt'))) }
    ],
    hints: [
      "Which command concatenates and prints file contents to standard output?",
      "The command name is short for \"concatenate\" (cat)."
    ]
  },

  {
    id: "cli-16-mkdir-multiple",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Create Multiple Sibling Directories",
    difficulty: "Basic",
    category: "Directory Management",
    tags: ["Directories","Batch Operations","CLI"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Create two directories named docs and src simultaneously using a single command line.",
    description: "### Background & Context\nCreating project scaffold structures efficiently involves passing multiple directory names to a single command rather than running multiple sequential commands.\n\n---\n\n### Problem Statement & Task\nWrite and execute a single command that creates both `docs` and `src` directories in your current working location.\n\n---\n\n**Example 1**:\n\n**Input**: Current directory without `docs` and `src`.\n**Expected Output Format**: Both `docs/` and `src/` exist in current directory.\n\n---\n\n**Acceptance Criteria**:\n1. Both `docs` and `src` directories are created.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (repo.hasDirectory('docs') && repo.hasDirectory('src')) {
            return { passed: true, message: 'Both docs and src created successfully.' };
          }
          return { passed: false, message: 'Ensure both docs and src directories exist.' };
        },
    objectives: [
      { label: "Create docs and src directories in one command", done: (repo) => repo.hasDirectory('docs') && repo.hasDirectory('src') }
    ],
    hints: [
      "Most directory creation commands accept multiple directory names separated by spaces.",
      "Pass both folder names as separate arguments to the make directory utility."
    ]
  },

  {
    id: "cli-17-mkdir-nested",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Create Nested Directory Hierarchy",
    difficulty: "Basic",
    category: "Directory Management",
    tags: ["Nested Directories","Path Hierarchy","Flags"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Create a nested directory structure parent/child/grandchild in one command without error.",
    description: "### Background & Context\nAttempting to create a deep subdirectory whose intermediate parent folders do not yet exist will result in a \"No such file or directory\" error unless the parent-creation flag is specified.\n\n---\n\n### Problem Statement & Task\nWrite and execute a command to create the complete nested directory path `parent/child/grandchild` in one command.\n\n---\n\n**Example 1**:\n\n**Input**: Neither `parent`, `child`, nor `grandchild` exists.\n**Expected Output Format**: Directory path `parent/child/grandchild` created.\n\n---\n\n**Acceptance Criteria**:\n1. All three nested folders (`parent/child/grandchild`) exist.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (repo.hasDirectory('parent/child/grandchild')) {
            return { passed: true, message: 'Nested hierarchy parent/child/grandchild created successfully.' };
          }
          return { passed: false, message: 'Nested directory tree parent/child/grandchild not found. Use the parent flag.' };
        },
    objectives: [
      { label: "Create full parent/child/grandchild folder tree", done: (repo) => repo.hasDirectory('parent/child/grandchild') }
    ],
    hints: [
      "Which flag instructs the directory creation utility to create intermediate parent directories as needed?",
      "Look up the \"-p\" flag (parents) for make directory."
    ]
  },

  {
    id: "cli-18-cd-up-two",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Move Up Multiple Directory Levels",
    difficulty: "Basic",
    category: "Terminal Navigation",
    tags: ["Navigation","Relative Paths","Directory Traversal"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Move back up two directory levels at once from grandchild to parent.",
    description: "### Background & Context\nTraversing up multiple levels of a directory tree does not require executing multiple sequential navigation steps. Relative path tokens can be chained.\n\n---\n\n### Problem Statement & Task\nFrom inside `parent/child/grandchild`, write and execute a single command to move up two directory levels to return to `parent`.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Current Directory: `/home/student/project/parent/child/grandchild`\n\n**Expected Output Format**:\n```output\nCurrent Working Directory: /home/student/project/parent\n```\n\n**Acceptance Criteria**:\n1. Active working directory ends with `/parent`.",
    initialState: {
        "isRepo": false,
        "files": {
            "parent/child/grandchild/.keep": ""
        },
        "currentBranch": "main",
        "initialCwd": "/home/student/project/parent/child/grandchild"
    },
    validation: (repo) => {
          const cwd = repo.getCwd ? repo.getCwd() : '';
          if (cwd.endsWith('/parent') || cwd.endsWith('\\parent')) {
            return { passed: true, message: 'Moved up two directory levels successfully.' };
          }
          return { passed: false, message: 'Active directory does not end in parent. Use double parent traversal.' };
        },
    objectives: [
      { label: "Traverse two parent directory levels in one step", done: (repo) => (repo.getCwd ? repo.getCwd() : '').endsWith('parent') }
    ],
    hints: [
      "Recall that \"..\" moves up one level. How do you chain two relative path segments?",
      "Combine two sets of double dots separated by a path slash."
    ]
  },

  {
    id: "cli-19-cp-notes",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Create File Backup Copy",
    difficulty: "Basic",
    category: "File Operations",
    tags: ["File Operations","Backups","Copying"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Copy notes.txt to a backup file named notes_backup.txt.",
    description: "### Background & Context\nCreating safety duplicates of important configurations or notes before editing prevents accidental data loss.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to copy `notes.txt` to a new backup file named `notes_backup.txt`, keeping the original intact.\n\n---\n\n**Example 1**:\n\n**Input**: File `notes.txt` exists.\n**Expected Output Format**: Both `notes.txt` and `notes_backup.txt` exist with identical contents.\n\n---\n\n**Acceptance Criteria**:\n1. Both `notes.txt` and `notes_backup.txt` exist.",
    initialState: {
        "isRepo": false,
        "files": {
            "notes.txt": "Important engineering study notes.\n"
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (repo.hasFile('notes.txt') && repo.hasFile('notes_backup.txt')) {
            return { passed: true, message: 'File backup notes_backup.txt created successfully.' };
          }
          return { passed: false, message: 'Ensure both notes.txt and notes_backup.txt exist.' };
        },
    objectives: [
      { label: "Copy notes.txt to notes_backup.txt", done: (repo) => repo.hasFile('notes.txt') && repo.hasFile('notes_backup.txt') }
    ],
    hints: [
      "Which command copies files from a source to a destination?",
      "Pass the source file first, followed by the target destination filename."
    ]
  },

  {
    id: "cli-20-mv-rename",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Rename File Archive",
    difficulty: "Basic",
    category: "File Operations",
    tags: ["File Renaming","File Operations","Filesystem"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Rename notes_backup.txt to archive.txt.",
    description: "### Background & Context\nIn Unix-like filesystems, renaming a file and moving a file are the exact same fundamental filesystem operation: updating the directory table pointer.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to rename `notes_backup.txt` to `archive.txt`.\n\n---\n\n**Example 1**:\n\n**Input**: File `notes_backup.txt` exists.\n**Expected Output Format**: `notes_backup.txt` is removed and replaced by `archive.txt`.\n\n---\n\n**Acceptance Criteria**:\n1. `archive.txt` exists.\n2. `notes_backup.txt` no longer exists.",
    initialState: {
        "isRepo": false,
        "files": {
            "notes_backup.txt": "Important engineering study notes.\n"
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (repo.hasFile('archive.txt') && !repo.hasFile('notes_backup.txt')) {
            return { passed: true, message: 'notes_backup.txt renamed to archive.txt successfully.' };
          }
          return { passed: false, message: 'Ensure notes_backup.txt is renamed to archive.txt.' };
        },
    objectives: [
      { label: "Rename notes_backup.txt to archive.txt", done: (repo) => repo.hasFile('archive.txt') && !repo.hasFile('notes_backup.txt') }
    ],
    hints: [
      "Which command moves or renames files in command-line environments?",
      "Specify the old filename first, followed by the new filename."
    ]
  },

  {
    id: "cli-21-mv-to-folder",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Relocate File to Subdirectory",
    difficulty: "Basic",
    category: "File Operations",
    tags: ["File Relocation","Organization","CLI"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Move archive.txt inside the existing docs folder.",
    description: "### Background & Context\nOrganizing project assets often involves relocating files into designated documentation or resource subfolders.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to move `archive.txt` into the `docs` directory.\n\n---\n\n**Example 1**:\n\n**Input**: `archive.txt` in root, directory `docs/` exists.\n**Expected Output Format**: `docs/archive.txt` exists, root `archive.txt` removed.\n\n---\n\n**Acceptance Criteria**:\n1. `docs/archive.txt` exists.\n2. `archive.txt` is no longer in current directory root.",
    initialState: {
        "isRepo": false,
        "files": {
            "archive.txt": "Important engineering study notes.\n",
            "docs/.keep": ""
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (repo.hasFile('docs/archive.txt') && !repo.hasFile('archive.txt')) {
            return { passed: true, message: 'archive.txt relocated into docs/ successfully.' };
          }
          return { passed: false, message: 'Ensure archive.txt is moved into docs/.' };
        },
    objectives: [
      { label: "Move archive.txt into docs directory", done: (repo) => repo.hasFile('docs/archive.txt') && !repo.hasFile('archive.txt') }
    ],
    hints: [
      "Use the move command with the filename as source and target directory as destination.",
      "Append a trailing slash or folder name as the destination."
    ]
  },

  {
    id: "cli-22-rm-notes",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Delete File Permanently",
    difficulty: "Basic",
    category: "File Operations",
    tags: ["File Deletion","Cleanup","Filesystem"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Permanently remove the file notes.txt from the filesystem.",
    description: "### Background & Context\nUnlike graphical file managers, command-line deletion bypasses the desktop Recycle Bin / Trash, permanently unlinking the inode from the directory table.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to delete `notes.txt` permanently.\n\n---\n\n**Example 1**:\n\n**Input**: File `notes.txt` exists.\n**Expected Output Format**: File `notes.txt` deleted.\n\n---\n\n**Acceptance Criteria**:\n1. `notes.txt` is removed.",
    initialState: {
        "isRepo": false,
        "files": {
            "notes.txt": "Temporary notes to delete.\n"
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (!repo.hasFile('notes.txt')) {
            return { passed: true, message: 'notes.txt permanently deleted.' };
          }
          return { passed: false, message: 'notes.txt still exists. Please remove it.' };
        },
    objectives: [
      { label: "Delete notes.txt from current directory", done: (repo) => !repo.hasFile('notes.txt') }
    ],
    hints: [
      "Which two-letter command permanently removes files from Unix filesystems?",
      "Pass the filename to the remove utility."
    ]
  },

  {
    id: "cli-23-rmdir-src",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Remove Empty Directory",
    difficulty: "Basic",
    category: "Directory Management",
    tags: ["Directory Removal","Cleanup","Safety"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Delete the empty directory named src safely.",
    description: "### Background & Context\nTo prevent accidental deletion of important files, operating systems provide a safe directory removal utility that succeeds only if the target directory is completely empty.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to delete the empty directory named `src`.\n\n---\n\n**Example 1**:\n\n**Input**: Empty directory `src` exists.\n**Expected Output Format**: Directory `src` removed.\n\n---\n\n**Acceptance Criteria**:\n1. Directory `src` no longer exists.",
    initialState: {
        "isRepo": false,
        "files": {},
        "directories": [
            "src"
        ],
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (!repo.hasDirectory('src')) {
            return { passed: true, message: 'Empty directory src removed.' };
          }
          return { passed: false, message: 'Directory src still exists. Please remove it.' };
        },
    objectives: [
      { label: "Remove empty directory src", done: (repo) => !repo.hasDirectory('src') }
    ],
    hints: [
      "Which dedicated command safely removes directories that contain no files?",
      "The command name is short for \"remove directory\" (rmdir)."
    ]
  },

  {
    id: "cli-24-code-cli",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Launch Code Editor from CLI",
    difficulty: "Basic",
    category: "Editor Integration",
    tags: ["VS Code","CLI Tools","Developer Workflow"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "Open the current directory inside Visual Studio Code directly from your terminal CLI.",
    description: "### Background & Context\nProfessional developers launch their IDE directly from the active terminal workspace, passing the working folder as a target.\n\n---\n\n### Problem Statement & Task\nExecute the command that launches Visual Studio Code targeting the current working directory (`.`).\n\n---\n\n**Example 1**:\n\n**Input**: Active terminal standing in project folder.\n**Expected Output Format**: Editor spawned targeting active directory.\n\n---\n\n**Acceptance Criteria**:\n1. Editor launch command targeting current directory is executed.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.trim().startsWith('code ') || c.trim() === 'code .');
          if (used) {
            return { passed: true, message: 'Visual Studio Code launched targeting active directory.' };
          }
          return { passed: false, message: 'Please run the command that opens VS Code for the current directory.' };
        },
    objectives: [
      { label: "Open current working directory in VS Code", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.trim().startsWith('code ') || c.trim() === 'code .') }
    ],
    hints: [
      "What is the CLI binary name for Visual Studio Code?",
      "Pass the current directory symbol (.) to open the active folder."
    ]
  },

  {
    id: "cli-25-history",
    track: "terminal",
    moduleId: "terminal-foundations",
    moduleTitle: "Terminal & Shell Foundations",
    title: "Display Session Command History",
    difficulty: "Basic",
    category: "Shell Inspection",
    tags: ["History","Shell Built-ins","Audit"],
    interviewFrequency: "Core CLI Foundation",
    scenario: "View the previous commands you have executed in your active terminal session.",
    description: "### Background & Context\nShells maintain an in-memory chronological buffer of commands entered during the session to enable auditing, re-running previous scripts, and debugging syntax errors.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command that outputs the numbered list of previously executed commands in your active session.\n\n---\n\n**Example 1**:\n\n**Input**: Multiple commands previously run.\n**Expected Output Format**: Chronological list of entered commands.\n\n---\n\n**Acceptance Criteria**:\n1. Session command history is printed to standard output.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.trim() === 'history' || c.trim() === 'Get-History');
          if (used) {
            return { passed: true, message: 'Command history retrieved successfully.' };
          }
          return { passed: false, message: 'Please run the command that displays shell execution history.' };
        },
    objectives: [
      { label: "Display recorded terminal session history", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => ['history', 'Get-History'].includes(c.trim())) }
    ],
    hints: [
      "Which shell built-in command displays previous command records?",
      "The command is named \"history\"."
    ]
  },

  {
    id: "git-26-version",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Verify Git Installation & Version",
    difficulty: "Basic",
    category: "Git Verification",
    tags: ["Git","CLI","Version Check","Environment"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Verify whether Git is properly installed and query its active release version string.",
    description: "### Background & Context\nBefore initializing projects or executing version control commands, engineers verify that the Git binary is installed, accessible in the system PATH, and meets required version specifications.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command that checks if Git is installed and prints its current version string to standard output.\n\n---\n\n**Example 1**:\n\n**Input**: Terminal environment with Git installed.\n**Expected Output Format**:\n```output\ngit version 2.43.0\n```\n\n**Explanation**:\nThe command verifies that the binary responds and outputs the semantic version of the installed package.\n\n---\n\n**Acceptance Criteria**:\n1. Git version string is printed to standard output.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.trim().startsWith('git --version') || c.trim() === 'git -v' || c.trim() === 'git version');
          if (used) {
            return { passed: true, message: 'Git installation and version verified.' };
          }
          return { passed: false, message: 'Please run the command that checks the installed Git version.' };
        },
    objectives: [
      { label: "Display installed Git version string", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => ['git --version', 'git -v', 'git version'].some(cmd => c.trim().startsWith(cmd))) }
    ],
    hints: [
      "Call the Git binary with the standard long flag used to query version information across CLI tools.",
      "Flags starting with double hyphens often spell out the full word \"version\"."
    ]
  },

  {
    id: "git-27-help",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Display General Git CLI Help Manual",
    difficulty: "Basic",
    category: "Git Manuals",
    tags: ["Git","Documentation","Help","Subcommands"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Display the general Git help manual and overview of common subcommands in the CLI.",
    description: "### Background & Context\nGit offers dozens of specialized porcelain and plumbing subcommands. Accessing the top-level help guide directly from the terminal lists available workflow commands without needing internet access.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to print the main Git help guide and common subcommand listing.\n\n---\n\n**Example 1**:\n\n**Input**: Git CLI environment.\n**Expected Output Format**:\n```output\nusage: git [--version] [--help] [-C <path>] [-c <name>=<value>]\n...\nThese are common Git commands used in various situations:\n   clone             Clone a repository into a new directory\n   init              Create an empty Git repository or reinitialize an existing one\n   add               Add file contents to the index\n```\n\n**Acceptance Criteria**:\n1. General Git help manual is output to terminal.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.trim() === 'git --help' || c.trim() === 'git help' || c.trim() === 'git -h');
          if (used) {
            return { passed: true, message: 'Git general help manual displayed.' };
          }
          return { passed: false, message: 'Please run the top-level Git help command.' };
        },
    objectives: [
      { label: "Output general Git CLI reference manual", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => ['git --help', 'git help', 'git -h'].includes(c.trim())) }
    ],
    hints: [
      "Git accepts either a double-hyphen flag or a dedicated subcommand named \"help\".",
      "Try querying help directly from the git command."
    ]
  },

  {
    id: "git-28-install-windows-winget",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Unattended Windows Package Installation",
    difficulty: "Basic",
    category: "Git Installation",
    tags: ["Package Managers","Windows","DevOps","Automation"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Automate official Git package installation on Windows non-interactively via the Windows Package Manager CLI.",
    description: "### Background & Context\nDevOps and IT automated environment setup scripts avoid manual GUI installers by leveraging command-line package managers like the Windows Package Manager (`winget`).\n\n---\n\n### Problem Statement & Task\nWrite and execute the unattended command to install the official Git package using `winget` from the command line.\n\n---\n\n**Example 1**:\n\n**Input**: Windows PowerShell CLI session.\n**Expected Output Format**: Automated download and unattended package installation of official Git.\n\n---\n\n**Acceptance Criteria**:\n1. Windows Package Manager command targeting official Git package is executed.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.includes('winget') && c.includes('Git.Git'));
          if (used) {
            return { passed: true, message: 'winget unattended Git installation executed.' };
          }
          return { passed: false, message: 'Run winget install specifying the official Git.Git package ID.' };
        },
    objectives: [
      { label: "Execute automated winget Git package installation", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.includes('winget') && c.includes('Git.Git')) }
    ],
    hints: [
      "Use the Windows Package Manager command \"winget install\".",
      "Pass the exact package ID \"--id Git.Git\" with exact match flags."
    ]
  },

  {
    id: "git-29-install-macos-xcode",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Trigger macOS Developer Tools Installation",
    difficulty: "Basic",
    category: "Git Installation",
    tags: ["macOS","Developer Tools","Apple","Setup"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Trigger the installation of Apple Developer Command Line Tools on macOS to acquire Git.",
    description: "### Background & Context\nOn fresh macOS installations, executing Git prompts the system to install Apple's Command Line Tools bundle containing Clang, Make, and Git.\n\n---\n\n### Problem Statement & Task\nWrite and execute the native macOS developer command that prompts the operating system to install Developer Command Line Tools.\n\n---\n\n**Example 1**:\n\n**Input**: macOS zsh terminal session.\n**Expected Output Format**: Dialog / background installer triggered for developer CLI tools.\n\n---\n\n**Acceptance Criteria**:\n1. Command Line Tools installation trigger command is executed.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.trim() === 'xcode-select --install');
          if (used) {
            return { passed: true, message: 'macOS Command Line Tools installation triggered.' };
          }
          return { passed: false, message: 'Execute the xcode-select command with the install flag.' };
        },
    objectives: [
      { label: "Initiate Apple Developer Tools installer", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.trim() === 'xcode-select --install') }
    ],
    hints: [
      "Which macOS utility manages active Xcode developer tool paths?",
      "Pass the \"--install\" flag to the developer tools selector utility."
    ]
  },

  {
    id: "git-30-install-macos-brew",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Install Git via macOS Homebrew",
    difficulty: "Basic",
    category: "Git Installation",
    tags: ["Homebrew","macOS","Package Management"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Install the latest version of Git on macOS using the Homebrew package manager.",
    description: "### Background & Context\nApple's bundled developer tools often lag behind the latest Git releases. Mac developers use Homebrew (`brew`) to keep their developer toolchain continuously updated.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to install the latest Git package using Homebrew.\n\n---\n\n**Example 1**:\n\n**Input**: macOS terminal with Homebrew configured.\n**Expected Output Format**: Formula download and symlinking of the Git binary.\n\n---\n\n**Acceptance Criteria**:\n1. Homebrew installation command targeting Git is executed.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.trim().startsWith('brew install git'));
          if (used) {
            return { passed: true, message: 'Homebrew Git installation executed.' };
          }
          return { passed: false, message: 'Run brew install targeting git.' };
        },
    objectives: [
      { label: "Install Git via Homebrew package manager", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.trim().startsWith('brew install git')) }
    ],
    hints: [
      "Use the Homebrew package manager command \"brew\".",
      "The subcommand is \"install\", followed by the package name \"git\"."
    ]
  },

  {
    id: "git-31-install-linux-apt",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Automate Debian/Ubuntu Package Installation",
    difficulty: "Basic",
    category: "Git Installation",
    tags: ["Ubuntu","Debian","apt","Linux"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Update package lists and install Git non-interactively on an Ubuntu/Debian Linux system.",
    description: "### Background & Context\nAutomated CI/CD runners (like GitHub Actions and Docker containers) based on Ubuntu or Debian require updating package repositories and installing packages without waiting for interactive keyboard confirmation prompts.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command chain that updates the package index and installs Git non-interactively using `apt`.\n\n---\n\n**Example 1**:\n\n**Input**: Debian/Ubuntu Linux shell session.\n**Expected Output Format**: Repository synchronization followed by unattended package install.\n\n---\n\n**Acceptance Criteria**:\n1. Package manager update and non-interactive install command is executed.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.includes('apt') && c.includes('install') && c.includes('git'));
          if (used) {
            return { passed: true, message: 'Debian/Ubuntu automated package installation executed.' };
          }
          return { passed: false, message: 'Run apt update and apt install git with the -y flag.' };
        },
    objectives: [
      { label: "Update package repository and install Git non-interactively", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.includes('apt') && c.includes('install') && c.includes('git')) }
    ],
    hints: [
      "Use the Advanced Packaging Tool (\"apt\") with superuser privileges (\"sudo\").",
      "Add the \"-y\" flag to automatically answer yes to all confirmation prompts."
    ]
  },

  {
    id: "git-32-install-linux-dnf",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Automate Fedora/RHEL Package Installation",
    difficulty: "Basic",
    category: "Git Installation",
    tags: ["Fedora","RHEL","dnf","Linux"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Install Git non-interactively on a RedHat / Fedora / CentOS Linux distribution.",
    description: "### Background & Context\nEnterprise Linux distributions in the Red Hat family (RHEL, Fedora, Rocky Linux) utilize the Dandified YUM (`dnf`) package manager to install system utilities.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to install Git using `dnf` with automatic confirmation.\n\n---\n\n**Example 1**:\n\n**Input**: Red Hat Enterprise Linux or Fedora shell session.\n**Expected Output Format**: Package metadata check and non-interactive install of Git.\n\n---\n\n**Acceptance Criteria**:\n1. Non-interactive `dnf` installation command targeting Git is executed.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => (c.includes('dnf') || c.includes('yum')) && c.includes('install') && c.includes('git'));
          if (used) {
            return { passed: true, message: 'Fedora/RHEL automated package installation executed.' };
          }
          return { passed: false, message: 'Run dnf install git with the -y flag.' };
        },
    objectives: [
      { label: "Install Git package via dnf package manager", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => (c.includes('dnf') || c.includes('yum')) && c.includes('install') && c.includes('git')) }
    ],
    hints: [
      "Which package manager is native to modern RedHat and Fedora Linux?",
      "Combine \"dnf install git\" with the non-interactive confirmation flag."
    ]
  },

  {
    id: "git-33-which-git",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Locate Binary Path in System PATH",
    difficulty: "Basic",
    category: "Environment Inspection",
    tags: ["PATH","Binary Resolution","CLI","Diagnostics"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Find the exact filesystem path where the Git executable binary resides on your machine.",
    description: "### Background & Context\nWhen multiple versions of Git exist (for instance, Apple's built-in Git versus a Homebrew Git or custom binary), finding which binary takes precedence in the PATH is vital for troubleshooting.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command that searches your system PATH and outputs the exact absolute filesystem path to the active Git executable binary.\n\n---\n\n**Example 1**:\n\n**Input**: POSIX or Windows terminal session.\n**Expected Output Format**:\n```output\n/usr/bin/git\n```\n\n**Explanation**:\nThe utility returns the first directory in the PATH containing an executable matching the requested name.\n\n---\n\n**Acceptance Criteria**:\n1. Path location of the Git executable is printed.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.trim().startsWith('which git') || c.trim().startsWith('where git') || c.trim().startsWith('where.exe git') || c.trim().startsWith('Get-Command git'));
          if (used) {
            return { passed: true, message: 'Git executable path located.' };
          }
          return { passed: false, message: 'Run the command that locates an executable in the PATH (e.g. which or where).' };
        },
    objectives: [
      { label: "Identify filesystem location of Git executable", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => ['which git', 'where git', 'where.exe git', 'Get-Command git'].some(cmd => c.trim().startsWith(cmd))) }
    ],
    hints: [
      "In Unix environments, what question word is used as a utility to find command locations?",
      "On Windows Command Prompt, the equivalent utility is \"where\"."
    ]
  },

  {
    id: "git-34-help-clone",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Access Dedicated Clone Command Manual",
    difficulty: "Basic",
    category: "Git Manuals",
    tags: ["Documentation","Manuals","Git Clone"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Display the complete manual documentation specifically for the git clone command.",
    description: "### Background & Context\nEvery Git subcommand contains extensive documentation describing flags, depth settings, remote protocols, and mirror options. Accessing subcommand-specific manuals directly from the CLI provides detailed specifications.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to open the dedicated documentation manual page specifically for the `clone` subcommand.\n\n---\n\n**Example 1**:\n\n**Input**: Git CLI environment.\n**Expected Output Format**:\n```output\nGIT-CLONE(1)                      Git Manual                      GIT-CLONE(1)\n\nNAME\n       git-clone - Clone a repository into a new directory\nSYNOPSIS\n       git clone [--template=<template-directory>]\n                 [-l] [-s] [--no-hardlinks] [-q] [-n] [--bare] [--mirror]\n```\n\n**Acceptance Criteria**:\n1. Specific manual page for repository cloning is displayed.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.trim() === 'git help clone' || c.trim() === 'git clone --help' || c.trim() === 'man git-clone');
          if (used) {
            return { passed: true, message: 'Dedicated git clone manual accessed.' };
          }
          return { passed: false, message: 'Please access the help manual specifically for the clone subcommand.' };
        },
    objectives: [
      { label: "Display manual documentation for clone subcommand", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => ['git help clone', 'git clone --help', 'man git-clone'].includes(c.trim())) }
    ],
    hints: [
      "You can request help for any subcommand by placing \"help\" before the subcommand name.",
      "Alternatively, append the \"--help\" flag directly after the subcommand name."
    ]
  },

  {
    id: "git-35-help-init",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Access Dedicated Init Command Manual",
    difficulty: "Basic",
    category: "Git Manuals",
    tags: ["Documentation","Manuals","Git Init"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Display the official manual page explaining repository initialization options and defaults.",
    description: "### Background & Context\nUnderstanding initialization parameters (such as default branch names and bare repository templates) is critical for repository governance.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to display the official manual documentation for the repository initialization subcommand.\n\n---\n\n**Example 1**:\n\n**Input**: Git CLI environment.\n**Expected Output Format**: Dedicated manual page for repository initialization.\n\n---\n\n**Acceptance Criteria**:\n1. Manual documentation for repository initialization is displayed.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.trim() === 'git help init' || c.trim() === 'git init --help' || c.trim() === 'man git-init');
          if (used) {
            return { passed: true, message: 'git init documentation displayed.' };
          }
          return { passed: false, message: 'Please access the help documentation specifically for git init.' };
        },
    objectives: [
      { label: "Display manual documentation for init subcommand", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => ['git help init', 'git init --help', 'man git-init'].includes(c.trim())) }
    ],
    hints: [
      "Use the help mechanism targeting the initialization subcommand.",
      "Try \"git help init\" or \"git init --help\"."
    ]
  },

  {
    id: "git-36-echo-path",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Inspect System PATH Environment Variable",
    difficulty: "Basic",
    category: "Environment Inspection",
    tags: ["Environment Variables","PATH","Shell Configuration"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Print the current value of the PATH environment variable to inspect executable discovery folders.",
    description: "### Background & Context\nThe `PATH` environment variable holds an ordered, delimited list of directory paths where the operating system searches for executable binaries when a command is entered in the terminal.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command that prints the value of your system's `PATH` environment variable to standard output.\n\n---\n\n**Example 1**:\n\n**Input**: Active terminal shell.\n**Expected Output Format**:\n```output\n/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin\n```\n\n**Explanation**:\nDirectory paths separated by colons (or semicolons on Windows) are displayed.\n\n---\n\n**Acceptance Criteria**:\n1. `PATH` environment variable contents are printed to standard output.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.includes('echo $PATH') || c.includes('echo %PATH%') || c.includes('$env:PATH'));
          if (used) {
            return { passed: true, message: 'System PATH environment variable printed.' };
          }
          return { passed: false, message: 'Print the PATH environment variable using echo.' };
        },
    objectives: [
      { label: "Print PATH environment variable contents", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.includes('PATH')) }
    ],
    hints: [
      "In POSIX shells, environment variables are referenced with a leading dollar sign ($).",
      "Use the echo command with the variable name."
    ]
  },

  {
    id: "git-37-mkdir-cd-practice",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Compound Directory Creation & Navigation",
    difficulty: "Basic",
    category: "Terminal Navigation",
    tags: ["Chaining","Compound Commands","Workflow"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Create a dedicated directory called foundations-practice and enter it in a single chained command.",
    description: "### Background & Context\nEngineers frequently chain directory creation and directory navigation into a single compound command line so the second step executes only if the first succeeds.\n\n---\n\n### Problem Statement & Task\nWrite and execute a single chained command that creates a new directory named `foundations-practice` and immediately changes your active directory into it.\n\n---\n\n**Example 1**:\n\n**Input**: `foundations-practice` does not exist.\n**Expected Output Format**: Directory `foundations-practice` created and active CWD updated to it.\n\n---\n\n**Acceptance Criteria**:\n1. Directory `foundations-practice` exists.\n2. Active working directory ends with `/foundations-practice`.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const cwd = repo.getCwd ? repo.getCwd() : '';
          if (repo.hasDirectory('foundations-practice') && cwd.endsWith('foundations-practice')) {
            return { passed: true, message: 'Created and entered foundations-practice successfully in one step.' };
          }
          return { passed: false, message: 'Ensure foundations-practice is created and active CWD is inside it.' };
        },
    objectives: [
      { label: "Create and enter foundations-practice in one command", done: (repo) => repo.hasDirectory('foundations-practice') && (repo.getCwd ? repo.getCwd() : '').endsWith('foundations-practice') }
    ],
    hints: [
      "Chain the directory creation command and directory change command using the \"&&\" logical AND operator.",
      "Example: command1 && command2"
    ]
  },

  {
    id: "git-38-git-init",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Initialize Empty Git Repository",
    difficulty: "Basic",
    category: "Repository Setup",
    tags: ["Git Init","Repository Creation","Version Control"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Initialize a brand new Git repository inside your current directory.",
    description: "### Background & Context\nTo place an existing folder under Git version tracking, the repository must be initialized, which provisions the hidden metadata database and reference structures.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command that initializes a new, empty Git repository in your current working location.\n\n---\n\n**Example 1**:\n\n**Input**: Regular folder with no version control.\n**Expected Output Format**:\n```output\nInitialized empty Git repository in /home/student/project/.git/\n```\n\n**Explanation**:\nA hidden `.git` directory is generated containing the object database, reference pointers, and configuration files.\n\n---\n\n**Acceptance Criteria**:\n1. Git repository initialization command is executed.\n2. Repository state is active with a default branch.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (repo.isInitialized()) {
            return { passed: true, message: 'Empty Git repository initialized successfully.' };
          }
          return { passed: false, message: 'Repository is not yet initialized. Run the initialization subcommand.' };
        },
    objectives: [
      { label: "Initialize empty Git repository in active folder", done: (repo) => repo.isInitialized() }
    ],
    hints: [
      "Which Git subcommand creates a new repository or reinitializes an existing one?",
      "The subcommand is short for \"initialize\" (init)."
    ]
  },

  {
    id: "git-39-git-status-empty",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Inspect Initialized Repository Status",
    difficulty: "Basic",
    category: "Repository Setup",
    tags: ["Git Status","Working Tree","Staging"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Check the state of the newly initialized repository to confirm branch status and staging contents.",
    description: "### Background & Context\nThe status subcommand is the primary diagnostic instrument in Git, reporting the current branch, commit count, staged changes, and untracked files.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to inspect the current state of your repository.\n\n---\n\n**Example 1**:\n\n**Input**: Freshly initialized empty repository.\n**Expected Output Format**:\n```output\nOn branch main\n\nNo commits yet\n\nnothing to commit (create/copy files and use \"git add\" to track)\n```\n\n**Acceptance Criteria**:\n1. Working tree and branch status is displayed.",
    initialState: {
        "isRepo": true,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.trim().startsWith('git status') || c.trim() === 'git status -s');
          if (used) {
            return { passed: true, message: 'Repository status checked.' };
          }
          return { passed: false, message: 'Please run the status inspection command.' };
        },
    objectives: [
      { label: "Display Git working tree status", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.trim().startsWith('git status')) }
    ],
    hints: [
      "Which command displays the state of the working directory and the staging area?",
      "The subcommand is named \"status\"."
    ]
  },

  {
    id: "git-40-ls-la-git-dir",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Verify Hidden Metadata Directory Creation",
    difficulty: "Basic",
    category: "Repository Inspection",
    tags: ["Hidden Directories","Git Architecture","Filesystem"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Inspect the directory to confirm that the hidden .git folder was created by repository initialization.",
    description: "### Background & Context\nWhen Git initializes a repository, it places all metadata, object stores, and revision trees inside a single hidden directory named `.git`. Because it starts with a dot, normal directory listings hide it.\n\n---\n\n### Problem Statement & Task\nWrite and execute the directory listing command that reveals the hidden `.git` metadata directory in your project root.\n\n---\n\n**Example 1**:\n\n**Input**: Initialized Git repository.\n**Expected Output Format**: Long-format directory listing showing the `.git` directory node.\n\n---\n\n**Acceptance Criteria**:\n1. Directory listing command revealing hidden dotfiles is executed.",
    initialState: {
        "isRepo": true,
        "files": {
            ".git/HEAD": "ref: refs/heads/main\n"
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => /ls\s+(-[a-zA-Z]*a[a-zA-Z]*|-a)/.test(c) || c.includes('Get-ChildItem -Force') || c.includes('dir /a'));
          if (used) {
            return { passed: true, message: 'Hidden .git directory verified.' };
          }
          return { passed: false, message: 'List directory contents with the all flag to confirm .git is present.' };
        },
    objectives: [
      { label: "Confirm existence of hidden .git directory", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => /ls\s+(-[a-zA-Z]*a|-a)/.test(c) || c.includes('-Force') || c.includes('dir /a')) }
    ],
    hints: [
      "Remember how we inspected hidden dotfiles in earlier terminal labs.",
      "Use the listing command with the option that shows all files."
    ]
  },

  {
    id: "git-41-ls-la-git-internals",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Inspect Internal Git Architecture Directories",
    difficulty: "Basic",
    category: "Repository Inspection",
    tags: ["Git Internals","Architecture","Objects","Refs"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Inspect the internal files and directories stored inside the .git metadata directory.",
    description: "### Background & Context\nInside `.git`, Git organizes its internal data structures: the `objects` content-addressable database, branch pointers in `refs`, hook scripts in `hooks`, and the `HEAD` tracking ref.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to list the internal contents of the `.git` directory.\n\n---\n\n**Example 1**:\n\n**Input**: Initialized Git repository.\n**Expected Output Format**:\n```output\nHEAD  config  description  hooks  info  objects  refs\n```\n\n**Acceptance Criteria**:\n1. Directory listing targeting `.git` is executed.",
    initialState: {
        "isRepo": true,
        "files": {
            ".git/HEAD": "ref: refs/heads/main\n",
            ".git/config": "[core]\n\trepositoryformatversion = 0\n"
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => (c.startsWith('ls') || c.startsWith('dir') || c.startsWith('Get-ChildItem')) && c.includes('.git'));
          if (used) {
            return { passed: true, message: 'Internal .git architecture contents inspected.' };
          }
          return { passed: false, message: 'List the contents of the .git directory.' };
        },
    objectives: [
      { label: "Inspect internal contents of .git directory", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.includes('.git') && (c.startsWith('ls') || c.startsWith('dir') || c.startsWith('Get-ChildItem'))) }
    ],
    hints: [
      "Pass \".git\" as the target directory path argument to the directory listing command."
    ]
  },

  {
    id: "git-42-cat-git-head",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Inspect HEAD Active Branch Pointer",
    difficulty: "Basic",
    category: "Repository Inspection",
    tags: ["HEAD","Branch Pointers","Git Internals"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Display the contents of .git/HEAD to inspect which symbolic ref it currently points to.",
    description: "### Background & Context\nThe `HEAD` file is a plain-text pointer located in `.git/HEAD` that identifies your currently active branch reference.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to print the text contents of `.git/HEAD` directly to standard output.\n\n---\n\n**Example 1**:\n\n**Input**: Default Git repository on main branch.\n**Expected Output Format**:\n```output\nref: refs/heads/main\n```\n\n**Acceptance Criteria**:\n1. Contents of `.git/HEAD` are printed to stdout.",
    initialState: {
        "isRepo": true,
        "files": {
            ".git/HEAD": "ref: refs/heads/main\n"
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => (c.startsWith('cat') || c.startsWith('type') || c.startsWith('Get-Content')) && c.includes('.git/HEAD'));
          if (used) {
            return { passed: true, message: 'HEAD symbolic reference inspected.' };
          }
          return { passed: false, message: 'Print the contents of .git/HEAD to stdout.' };
        },
    objectives: [
      { label: "Inspect HEAD active branch reference pointer", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.includes('.git/HEAD')) }
    ],
    hints: [
      "Use the file concatenation utility with the path to the HEAD file (.git/HEAD)."
    ]
  },

  {
    id: "git-43-cat-git-config",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Inspect Local Repository Configuration File",
    difficulty: "Basic",
    category: "Repository Inspection",
    tags: ["Configuration","Git Internals","Metadata"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Display the contents of the repository local configuration file located at .git/config.",
    description: "### Background & Context\nGit configuration operates at three levels: system, global, and local. Repository-specific settings (such as remotes and branch tracking) are saved in INI format in `.git/config`.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to print the contents of the local repository configuration file at `.git/config`.\n\n---\n\n**Example 1**:\n\n**Input**: Initialized Git repository.\n**Expected Output Format**:\n```output\n[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n```\n\n**Acceptance Criteria**:\n1. Contents of `.git/config` are printed to stdout.",
    initialState: {
        "isRepo": true,
        "files": {
            ".git/config": "[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n"
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => (c.startsWith('cat') || c.startsWith('type') || c.startsWith('Get-Content')) && c.includes('.git/config'));
          if (used) {
            return { passed: true, message: 'Local repository configuration inspected.' };
          }
          return { passed: false, message: 'Print the contents of .git/config to stdout.' };
        },
    objectives: [
      { label: "Inspect local repository configuration file", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.includes('.git/config')) }
    ],
    hints: [
      "Use the file display command with \".git/config\" as the file path."
    ]
  },

  {
    id: "git-44-touch-test-py",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Create Untracked Project Script",
    difficulty: "Basic",
    category: "Repository Setup",
    tags: ["Filesystem","Python","Untracked Files"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Create a new script file named test.py in your repository.",
    description: "### Background & Context\nWhen source code files are created in a project directory, Git immediately notices their existence on disk but classifies them as untracked until explicitly staged.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to create an empty Python script named `test.py` in your repository.\n\n---\n\n**Example 1**:\n\n**Input**: Initialized Git repository.\n**Expected Output Format**: File `test.py` created in working tree.\n\n---\n\n**Acceptance Criteria**:\n1. File `test.py` exists in repository root.",
    initialState: {
        "isRepo": true,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (repo.hasFile('test.py')) {
            return { passed: true, message: 'File test.py created successfully.' };
          }
          return { passed: false, message: 'File test.py not found. Please create it.' };
        },
    objectives: [
      { label: "Create new project file test.py", done: (repo) => repo.hasFile('test.py') }
    ],
    hints: [
      "Use the empty file creation utility with \"test.py\" as the filename."
    ]
  },

  {
    id: "git-45-git-status-untracked",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Detect Untracked File in Staging Lifecycle",
    difficulty: "Basic",
    category: "Repository Setup",
    tags: ["Git Status","Untracked Files","Staging Lifecycle"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Run the command that shows Git has detected test.py as an Untracked file.",
    description: "### Background & Context\nUntracked files are files that exist in your working directory but were not in your previous commit and have not been staged into the index.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command that inspects repository status and confirms that `test.py` is listed under Untracked files.\n\n---\n\n**Example 1**:\n\n**Input**: Repository with unstaged `test.py`.\n**Expected Output Format**:\n```output\nUntracked files:\n  (use \"git add <file>...\" to include in what will be committed)\n\ttest.py\n```\n\n**Acceptance Criteria**:\n1. Status command reporting untracked files is executed.",
    initialState: {
        "isRepo": true,
        "files": {
            "test.py": "print(\"Hello Git\")\n"
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.trim().startsWith('git status'));
          if (used) {
            return { passed: true, message: 'Untracked file status detected.' };
          }
          return { passed: false, message: 'Run the status command to inspect untracked files.' };
        },
    objectives: [
      { label: "Inspect untracked files in repository status", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.trim().startsWith('git status')) }
    ],
    hints: [
      "Which Git subcommand reports working tree status and lists untracked files?"
    ]
  },

  {
    id: "git-46-git-clone",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Clone Public Remote Distributed Repository",
    difficulty: "Basic",
    category: "Remote Operations",
    tags: ["Git Clone","Distributed VCS","Remotes"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Clone the public Spoon-Knife repository locally to inspect how Git downloads complete commit histories.",
    description: "### Background & Context\nGit is a Distributed Version Control System (DVCS). When you clone a repository, you do not simply check out the latest snapshot; you copy the full revision history, all branch refs, and all project commits locally.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to clone the public repository at `https://github.com/octocat/Spoon-Knife.git`.\n\n---\n\n**Example 1**:\n\n**Input**: Terminal with internet / remote simulator access.\n**Expected Output Format**:\n```output\nCloning into 'Spoon-Knife'...\nremote: Enumerating objects: 16, done.\nResolving deltas: 100%, done.\n```\n\n**Acceptance Criteria**:\n1. Directory `Spoon-Knife` is cloned with complete commit records.",
    initialState: {
        "isRepo": false,
        "files": {},
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (repo.hasDirectory('Spoon-Knife')) {
            return { passed: true, message: 'Remote repository Spoon-Knife cloned successfully.' };
          }
          return { passed: false, message: 'Clone https://github.com/octocat/Spoon-Knife.git into your workspace.' };
        },
    objectives: [
      { label: "Clone remote repository Spoon-Knife locally", done: (repo) => repo.hasDirectory('Spoon-Knife') }
    ],
    hints: [
      "Which Git subcommand downloads a remote repository and its full commit history?",
      "Use \"git clone\" followed by the target repository URL."
    ]
  },

  {
    id: "git-47-git-log-cloned",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Inspect Cloned Repository Commit History",
    difficulty: "Basic",
    category: "History",
    tags: ["Git Log","Commit History","Inspection"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Enter the cloned Spoon-Knife directory and view the full commit history log.",
    description: "### Background & Context\nOnce a repository is cloned, you can inspect its commit history offline without connecting to the remote host.\n\n---\n\n### Problem Statement & Task\nNavigate into `Spoon-Knife` and display its commit history log.\n\n---\n\n**Example 1**:\n\n**Input**: Active directory inside cloned repository.\n**Expected Output Format**:\n```output\ncommit a1b2c3d4e5...\nAuthor: Octocat <octocat@github.com>\nDate:   Mon Oct 29 10:00:00 2026\n\n    Initial commit for Spoon-Knife\n```\n\n**Acceptance Criteria**:\n1. Commit history log of the cloned repository is displayed.",
    initialState: {
        "isRepo": false,
        "files": {
            "Spoon-Knife/.git/HEAD": "ref: refs/heads/main\n"
        },
        "directories": [
            "Spoon-Knife"
        ],
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.includes('git log'));
          if (used) {
            return { passed: true, message: 'Cloned commit history inspected.' };
          }
          return { passed: false, message: 'Navigate into Spoon-Knife and run the commit log command.' };
        },
    objectives: [
      { label: "Inspect commit log of cloned repository", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.includes('git log')) }
    ],
    hints: [
      "First enter the cloned folder with \"cd Spoon-Knife\".",
      "Then execute the standard Git subcommand used to inspect commit history logs."
    ]
  },

  {
    id: "git-48-git-log-oneline",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Compact Single-Line Commit History Log",
    difficulty: "Basic",
    category: "History",
    tags: ["Git Log","Oneline","History Compaction"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Display the commit log in a condensed single-line format showing abbreviated hashes and commit subjects.",
    description: "### Background & Context\nIn repositories with hundreds of commits, the verbose multi-line log output is unwieldy. The compact single-line flag outputs the 7-character abbreviated SHA hash and commit subject line on one line per commit.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command that displays the commit log formatted into condensed single lines.\n\n---\n\n**Example 1**:\n\n**Input**: Git repository with commit history.\n**Expected Output Format**:\n```output\na1b2c3d Update README with installation instructions\n8f3a9e1 Add responsive layout styles\n4c2d1b0 Initial repository commit\n```\n\n**Acceptance Criteria**:\n1. Commit log formatted with single-line option is displayed.",
    initialState: {
        "isRepo": true,
        "files": {
            "README.md": "# Project\n"
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          const history = repo.getCommandHistory ? repo.getCommandHistory() : [];
          const used = history.some(c => c.includes('git log') && c.includes('--oneline'));
          if (used) {
            return { passed: true, message: 'Compact single-line commit history displayed.' };
          }
          return { passed: false, message: 'Run git log with the --oneline flag.' };
        },
    objectives: [
      { label: "Display compact commit history with --oneline", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.includes('git log') && c.includes('--oneline')) }
    ],
    hints: [
      "Which flag condenses git log output so each commit occupies only a single line?",
      "Add \"--oneline\" to the log command."
    ]
  },

  {
    id: "git-49-deversion-repo",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "De-versioning a Repository Directory",
    difficulty: "Basic",
    category: "Repository Lifecycle",
    tags: ["De-versioning","Metadata Removal","Cleanup"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Safely de-version a repository by removing the hidden .git directory while keeping your working files untouched.",
    description: "### Background & Context\nBecause Git encapsulates 100% of its configuration, history, and metadata inside the single hidden `.git` directory, deleting `.git` converts a Git repository back into a regular folder without deleting your working files.\n\n---\n\n### Problem Statement & Task\nWrite and execute the recursive forced deletion command that permanently removes the `.git` metadata directory.\n\n---\n\n**Example 1**:\n\n**Input**: Git repository with files and `.git/`.\n**Expected Output Format**: Working files preserved, `.git/` deleted.\n\n---\n\n**Acceptance Criteria**:\n1. `.git` metadata directory is permanently removed.\n2. Regular source files remain intact.",
    initialState: {
        "isRepo": true,
        "files": {
            "README.md": "# Preserved Project\n",
            ".git/HEAD": "ref: refs/heads/main\n"
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (!repo.isInitialized() || !repo.hasDirectory('.git')) {
            return { passed: true, message: 'Repository successfully de-versioned (.git removed).' };
          }
          return { passed: false, message: 'The .git folder still exists. Remove it with rm -rf .git.' };
        },
    objectives: [
      { label: "Permanently remove hidden .git directory", done: (repo) => !repo.isInitialized() || !repo.hasDirectory('.git') }
    ],
    hints: [
      "To delete a non-empty directory in POSIX shells, combine recursive (-r) and forced (-f) options.",
      "Target the .git directory directly."
    ]
  },

  {
    id: "git-50-cleanup-directories",
    track: "git-basics",
    moduleId: "git-setup-mgmt",
    moduleTitle: "Git Setup & Repository Management",
    title: "Clean Up Practice Workspace Directories",
    difficulty: "Basic",
    category: "Directory Management",
    tags: ["Workspace Cleanup","Recursive Deletion","CLI"],
    interviewFrequency: "Core Git Foundation",
    scenario: "Delete the practice directories foundations-practice and Spoon-Knife to restore a clean workspace.",
    description: "### Background & Context\nCleaning up temporary practice repositories and test clones prevents cluttering your primary development disk workspace.\n\n---\n\n### Problem Statement & Task\nWrite and execute the command to recursively remove both `foundations-practice` and `Spoon-Knife` directories in a single command.\n\n---\n\n**Example 1**:\n\n**Input**: Practice directories `foundations-practice` and `Spoon-Knife` present.\n**Expected Output Format**: Both folders removed, workspace clean.\n\n---\n\n**Acceptance Criteria**:\n1. Both `foundations-practice` and `Spoon-Knife` directories are deleted.",
    initialState: {
        "isRepo": false,
        "files": {
            "foundations-practice/.keep": "",
            "Spoon-Knife/.keep": ""
        },
        "directories": [
            "foundations-practice",
            "Spoon-Knife"
        ],
        "currentBranch": "main"
    },
    validation: (repo) => {
          if (!repo.hasDirectory('foundations-practice') && !repo.hasDirectory('Spoon-Knife')) {
            return { passed: true, message: 'Practice directories cleaned up successfully.' };
          }
          return { passed: false, message: 'Ensure both foundations-practice and Spoon-Knife are removed.' };
        },
    objectives: [
      { label: "Recursively remove temporary practice directories", done: (repo) => !repo.hasDirectory('foundations-practice') && !repo.hasDirectory('Spoon-Knife') }
    ],
    hints: [
      "Use the recursive remove utility (-r) with forced execution (-f).",
      "Pass both directory names as space-delimited arguments."
    ]
  },

  {
    id: "git-init-first-commit",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Initialize Repository & Create First Commit",
    difficulty: "Basic",
    category: "Repository Foundations",
    tags: ["Git Init","Commits","Staging Area","Foundations"],
    interviewFrequency: "Core Concept",
    scenario: "You are starting a brand new project for Microsoft Student Club. Initialize a Git repository, create a README.md file, stage it, and commit it with a descriptive message.",
    description: "### Background & Context\nWhen establishing a new software project, initializing a Git repository creates the foundational database where all historical revisions and snapshots are anchored.\n\n---\n\n### Problem Statement & Task\nInitialize a new Git version control repository in the workspace, add the existing project documentation file `README.md` to the staging index, and record your first atomic commit snapshot.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Working Directory: contains unstaged `README.md`\n- Repository: Not yet initialized\n\n**Expected Output Format**:\n```output\n[main (root-commit) 7a8b9c0] Initial commit\n 1 file changed, 2 insertions(+)\n create mode 100644 README.md\n```\n\n**Explanation**:\nThe repository database is initialized, `README.md` is added to the index, and a root commit snapshot is recorded on the main branch.\n\n---\n\n**Constraints & Specifications**:\n- All changes must be cleanly committed (working tree clean).\n- The commit must include `README.md`.\n\n---\n\n**Acceptance Criteria**:\n1. Git repository is initialized with default branch `main` or `master`.\n2. `README.md` is included in the latest commit snapshot.\n3. Staging index and working tree are clean.",
    initialState: {
        "isRepo": false,
        "files": {
            "README.md": "# MSC PRPCEM Quiz Platform\nOfficial repository for student technical assessments.\n"
        },
        "currentBranch": "main"
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
    objectives: [
      { label: "Initialize Git version tracking", done: (repo) => repo.isInitialized() },
      { label: "Stage and commit README.md to main", done: (repo) => repo.isInitialized() && repo.getCommitHistory().length > 0 && repo.isWorkingTreeClean() }
    ],
    hints: [
      "Recall which command initializes an empty Git repository in an existing directory.",
      "Before taking a commit snapshot, stage the documentation file using the add subcommand."
    ]
  },

  {
    id: "git-staging-workflow",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Selective Staging Area Workflow",
    difficulty: "Basic",
    category: "Staging & Index",
    tags: ["Selective Staging","Git Index","Atomic Commits"],
    interviewFrequency: "Core Concept",
    scenario: "You modified index.html, styles.css, and created draft.txt. Your goal is to stage and commit ONLY index.html and styles.css as part of a clean atomic commit, leaving draft.txt uncommitted.",
    description: "### Background & Context\nGit separates the working tree from the commit history using a middle layer known as the **Staging Area (Index)**. This enables engineers to craft clean, atomic commits by selecting specific modified files while leaving work-in-progress drafts uncommitted.\n\n---\n\n### Problem Statement & Task\nYou have modified `index.html`, `styles.css`, and created an untracked `draft.txt`. Selectively stage and commit ONLY `index.html` and `styles.css`. Leave `draft.txt` uncommitted in the working tree.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Modified files: `index.html`, `styles.css`\n- Untracked file: `draft.txt`\n\n**Expected Output Format**:\n```output\n[main a2b3c4d] feat: update markup and styles\n 2 files changed, 4 insertions(+)\n```\n\n**Explanation**:\nOnly the two styling/markup files are packaged into the commit snapshot, leaving `draft.txt` untouched.\n\n---\n\n**Constraints & Specifications**:\n- `draft.txt` must NOT be committed to history.\n- The latest commit must contain both `index.html` and `styles.css`.\n\n---\n\n**Acceptance Criteria**:\n1. `index.html` and `styles.css` are committed.\n2. `draft.txt` remains uncommitted in the working directory.",
    initialState: {
        "isRepo": true,
        "commits": [
            {
                "message": "Initial commit",
                "files": {
                    "index.html": "<h1>Home</h1>\n",
                    "styles.css": "body { margin: 0; }\n"
                }
            }
        ],
        "files": {
            "index.html": "<h1>Home</h1>\n<nav><a href=\"/about\">About</a></nav>\n",
            "styles.css": "body { margin: 0; background: #f0f4f8; }\n",
            "draft.txt": "Notes for next week meeting.\n"
        },
        "currentBranch": "main"
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
    objectives: [
      { label: "Selectively stage index.html and styles.css", done: (repo) => repo.getLatestCommit()?.files?.['index.html'] && repo.getLatestCommit()?.files?.['styles.css'] },
      { label: "Keep draft.txt uncommitted in working directory", done: (repo) => !repo.getLatestCommit()?.files?.['draft.txt'] && repo.hasFile('draft.txt') }
    ],
    hints: [
      "Inspect repository status to review modified versus untracked files.",
      "You can pass specific filenames to the stage command rather than staging everything at once."
    ]
  },

  {
    id: "gitignore-secrets",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Safeguarding Secrets with .gitignore",
    difficulty: "Basic",
    category: "Security & Configuration",
    tags: ["Security",".gitignore","Environment Secrets"],
    interviewFrequency: "Core Concept",
    scenario: "Your project has an environment file containing an API key (.env) and a node_modules folder. Create a .gitignore file to ignore them and commit your .gitignore.",
    description: "### Background & Context\nAccidentally committing credentials, private keys, or environment files to version control is a critical security vulnerability. Git uses `.gitignore` to permanently prevent specific file patterns from being tracked.\n\n---\n\n### Problem Statement & Task\nConfigure a `.gitignore` file that instructs Git to ignore `.env` and the `node_modules/` directory. Stage and commit `.gitignore` while ensuring `.env` remains uncommitted.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Sensitive file: `.env`\n- Dependency directory: `node_modules/`\n\n**Expected Output Format**:\n```output\n[main c4d5e6f] chore: add .gitignore rules\n 1 file changed, 2 insertions(+)\n create mode 100644 .gitignore\n```\n\n**Explanation**:\nGit ignores `.env` and `node_modules` so they never appear in untracked lists or commit snapshots.\n\n---\n\n**Constraints & Specifications**:\n- `.env` must NOT be committed.\n- `.gitignore` must be committed to the repository.\n\n---\n\n**Acceptance Criteria**:\n1. `.gitignore` contains rules ignoring `.env` and `node_modules/`.\n2. `.gitignore` is committed to history.\n3. `.env` is not present in repository commits.",
    initialState: {
        "isRepo": true,
        "commits": [
            {
                "message": "Initial commit",
                "files": {
                    "package.json": "{\n  \"name\": \"quiz-app\"\n}\n"
                }
            }
        ],
        "files": {
            "package.json": "{\n  \"name\": \"quiz-app\"\n}\n",
            ".env": "AZURE_SECRET_KEY=secret_12345\nDB_PASS=admin\n",
            "node_modules/express.js": "// express package\n"
        },
        "currentBranch": "main"
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
    objectives: [
      { label: "Create .gitignore containing rules for .env and node_modules/", done: (repo) => repo.hasFile('.gitignore') && repo.getFileContent('.gitignore').includes('.env') },
      { label: "Commit .gitignore while keeping .env untracked", done: (repo) => repo.getLatestCommit()?.files?.['.gitignore'] && !repo.getLatestCommit()?.files?.['.env'] }
    ],
    hints: [
      "Create a file named .gitignore at the repository root and append the target filenames.",
      "Once .gitignore is saved, stage and commit .gitignore only."
    ]
  },

  {
    id: "git-status-log-inspection",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Navigating Repository History with Git Log",
    difficulty: "Basic",
    category: "History & Auditing",
    tags: ["Git Log","History","Auditing","Commit Inspection"],
    interviewFrequency: "Core Concept",
    scenario: "A bug was reported. Inspect the commit history, identify the bad commit message, and make a new commit documenting the fix in changelog.txt.",
    description: "### Background & Context\nAuditing a team's code history requires inspecting commit hashes, authors, timestamps, and commit messages to identify when changes or regressions were introduced.\n\n---\n\n### Problem Statement & Task\nInspect the commit log to find the commit message of the previous broken commit. Create a new documentation file `changelog.txt` detailing your audit findings, stage it, and commit it.\n\n---\n\n**Example 1**:\n\n**Input**: Existing repository with multiple past commits.\n**Expected Output Format**: Commit log inspected and new documentation committed.\n\n---\n\n**Acceptance Criteria**:\n1. Commit history is inspected.\n2. `changelog.txt` is staged and committed to the repository.",
    initialState: {
        "isRepo": true,
        "commits": [
            {
                "message": "Initial commit",
                "files": {
                    "app.js": "console.log(\"App loaded\");\n"
                }
            },
            {
                "message": "fix: update port configuration",
                "files": {
                    "app.js": "const PORT = 5000;\n"
                }
            },
            {
                "message": "refactor: broken database query",
                "files": {
                    "app.js": "const PORT = 5000;\n// bug here\n"
                }
            }
        ],
        "files": {
            "app.js": "const PORT = 5000;\n// bug here\n"
        },
        "currentBranch": "main"
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
    objectives: [
      { label: "Inspect repository commit history log", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.includes('git log')) },
      { label: "Create, stage, and commit changelog.txt", done: (repo) => repo.getLatestCommit()?.files?.['changelog.txt'] }
    ],
    hints: [
      "Use the log command with the single-line option to quickly scan commit messages.",
      "Write your findings into changelog.txt, then stage and commit the file."
    ]
  },

  {
    id: "git-branch-create-switch",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Create and Switch to Feature Branch",
    difficulty: "Easy",
    category: "Branching & Isolation",
    tags: ["Branching","Feature Branches","Git Switch"],
    interviewFrequency: "Core Concept",
    scenario: "The development team requires all new features to be built on dedicated branches. Create a new branch called \"feature/auth\", switch to it, create auth.js, and commit it on that branch.",
    description: "### Background & Context\nBranches provide isolated environments where features can be developed without destabilizing production code on `main`.\n\n---\n\n### Problem Statement & Task\nCreate and switch to a new branch named `feature/auth`. In this branch, create a new file named `auth.js`, stage it, and commit it with a descriptive message.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Active Branch: `main`\n- Desired Branch: `feature/auth`\n\n**Expected Output Format**:\n```output\nSwitched to a new branch 'feature/auth'\n[feature/auth 8b9c0d1] feat: add authentication service\n 1 file changed, 1 insertion(+)\n create mode 100644 auth.js\n```\n\n**Acceptance Criteria**:\n1. Active branch is `feature/auth`.\n2. `auth.js` is committed to `feature/auth`.\n3. Working tree is clean.",
    initialState: {
        "isRepo": true,
        "commits": [
            {
                "message": "Initial commit",
                "files": {
                    "server.js": "console.log(\"Server starting\");\n"
                }
            }
        ],
        "files": {
            "server.js": "console.log(\"Server starting\");\n"
        },
        "currentBranch": "main"
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
    objectives: [
      { label: "Create and switch to feature/auth branch", done: (repo) => repo.getHeadBranch() === 'feature/auth' },
      { label: "Commit auth.js on feature/auth", done: (repo) => repo.getHeadBranch() === 'feature/auth' && repo.getLatestCommit()?.files?.['auth.js'] }
    ],
    hints: [
      "Which command allows creating and switching to a new branch in a single operation?",
      "Create auth.js on the new branch, then stage and commit it."
    ]
  },

  {
    id: "git-fast-forward-merge",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Execute Fast-Forward Branch Merge",
    difficulty: "Easy",
    category: "Branching & Merging",
    tags: ["Merging","Fast-Forward","Branch Integration"],
    interviewFrequency: "Core Concept",
    scenario: "A teammate completed the \"feature/cart\" branch. The main branch has not had any new commits. Switch to main and merge feature/cart using a fast-forward merge.",
    description: "### Background & Context\nWhen the target branch (`main`) has not diverged since the feature branch was created, Git can incorporate changes by simply advancing the target branch pointer directly to the tip of the feature branch.\n\n---\n\n### Problem Statement & Task\nSwitch to the `main` branch and merge the commits from `feature/cart` using a fast-forward merge.\n\n---\n\n**Example 1**:\n\n**Input**:\n- `main` pointer is an ancestor of `feature/cart`\n- `feature/cart` contains cart implementation commits\n\n**Expected Output Format**:\n```output\nUpdating a1b2c3d..e4f5a6b\nFast-forward\n cart.js | 15 +++++++++++++++\n 1 file changed, 15 insertions(+)\n create mode 100644 cart.js\n```\n\n**Acceptance Criteria**:\n1. Active branch is `main`.\n2. `main` pointer incorporates all commits from `feature/cart`.",
    initialState: {
        "isRepo": true,
        "branches": {
            "main": {
                "commits": [
                    {
                        "id": "c1",
                        "message": "Initial commit",
                        "files": {
                            "index.html": "<h1>Shop</h1>\n"
                        }
                    }
                ]
            },
            "feature/cart": {
                "baseCommit": 0,
                "commits": [
                    {
                        "id": "c2",
                        "message": "feat: add cart component",
                        "files": {
                            "cart.js": "export const cart = [];\n"
                        }
                    }
                ]
            }
        },
        "currentBranch": "feature/cart"
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
    objectives: [
      { label: "Switch to main branch", done: (repo) => repo.getHeadBranch() === 'main' },
      { label: "Merge feature/cart into main via fast-forward", done: (repo) => repo.getHeadBranch() === 'main' && repo.getLatestCommit()?.files?.['cart.js'] }
    ],
    hints: [
      "Always switch to the destination branch before running a merge command.",
      "Execute the merge command specifying the feature branch name."
    ]
  },

  {
    id: "git-three-way-merge",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Execute 3-Way Merge Commit",
    difficulty: "Easy",
    category: "Branching & Merging",
    tags: ["3-Way Merge","Merge Commit","History Integration"],
    interviewFrequency: "Core Concept",
    scenario: "Both main and feature/contact have diverged with separate independent commits. Merge feature/contact into main, creating a true 3-way merge commit.",
    description: "### Background & Context\nWhen both the main branch and a feature branch have received independent commits since diverging, a simple pointer move is impossible. Git performs a 3-way merge using the two branch tips and their common ancestor, generating a dedicated merge commit.\n\n---\n\n### Problem Statement & Task\nSwitch to `main` and merge `feature/contact` into `main`, producing a dedicated merge commit that ties both historical lines together.\n\n---\n\n**Example 1**:\n\n**Input**:\n- `main` has diverged with commit A\n- `feature/contact` has diverged with commit B\n\n**Expected Output Format**:\n```output\nMerge made by the 'ort' strategy.\n contact.html | 8 ++++++++\n 1 file changed, 8 insertions(+)\n create mode 100644 contact.html\n```\n\n**Acceptance Criteria**:\n1. Dedicated merge commit created on `main`.\n2. Both branch lineages are merged.",
    initialState: {
        "isRepo": true,
        "branches": {
            "main": {
                "commits": [
                    {
                        "id": "c1",
                        "message": "Initial commit",
                        "files": {
                            "index.html": "<h1>Welcome</h1>\n"
                        }
                    },
                    {
                        "id": "c2",
                        "message": "feat: add footer on main",
                        "files": {
                            "footer.html": "<footer>MSC 2026</footer>\n"
                        }
                    }
                ]
            },
            "feature/contact": {
                "baseCommit": 0,
                "commits": [
                    {
                        "id": "c3",
                        "message": "feat: add contact page",
                        "files": {
                            "contact.html": "<form>Contact us</form>\n"
                        }
                    }
                ]
            }
        },
        "currentBranch": "main"
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
    objectives: [
      { label: "Switch to main branch", done: (repo) => repo.getHeadBranch() === 'main' },
      { label: "Create 3-way merge commit incorporating feature/contact", done: (repo) => repo.getHeadBranch() === 'main' && repo.getLatestCommit()?.files?.['contact.html'] }
    ],
    hints: [
      "Ensure you are standing on main before initiating the merge.",
      "Git will automatically combine non-overlapping changes and create the merge commit."
    ]
  },

  {
    id: "git-branch-merge-conflict",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Resolve Merge Conflict on Main",
    difficulty: "Easy",
    category: "Merge Conflicts",
    tags: ["Conflict Resolution","Merge Conflict","Collaboration"],
    interviewFrequency: "Core Concept",
    scenario: "Both main and feature/redesign modified header.html differently. Merge feature/redesign into main, resolve the conflict cleanly by removing conflict markers, stage, and commit.",
    description: "### Background & Context\nMerge conflicts happen when simultaneous edits modify the exact same lines of code in different branches. Git halts the merge and injects conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) into the affected files for manual resolution.\n\n---\n\n### Problem Statement & Task\nInitiate a merge of `feature/redesign` into `main`. Resolve the resulting conflict in `header.html`, stage the resolved file, and finalize the merge commit.\n\n---\n\n**Example 1**:\n\n**Input**:\n- Conflicting lines in `header.html` between `main` and `feature/redesign`\n\n**Expected Output Format**:\n```output\nCONFLICT (content): Merge conflict in header.html\nAutomatic merge failed; fix conflicts and then commit the result.\n...\n[main 9d0e1f2] Merge and resolve header conflict\n```\n\n**Acceptance Criteria**:\n1. Conflict markers are cleared from `header.html`.\n2. Resolved file is staged.\n3. Merge commit is finalized on `main`.",
    initialState: {
        "isRepo": true,
        "branches": {
            "main": {
                "commits": [
                    {
                        "id": "c1",
                        "message": "Initial commit",
                        "files": {
                            "README.md": "# Project\n"
                        }
                    },
                    {
                        "id": "c2",
                        "message": "Update header on main",
                        "files": {
                            "header.html": "<h1>Welcome to MSC v2.0</h1>\n"
                        }
                    }
                ]
            },
            "feature/redesign": {
                "baseCommit": 0,
                "commits": [
                    {
                        "id": "c3",
                        "message": "Update header redesign",
                        "files": {
                            "header.html": "<h1>Welcome to MSC Redesign</h1>\n"
                        }
                    }
                ]
            }
        },
        "currentBranch": "main"
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
    objectives: [
      { label: "Initiate merge and identify conflicting file", done: (repo) => true },
      { label: "Resolve conflict markers and commit final version", done: (repo) => repo.getHeadBranch() === 'main' && !repo.getFileContent('header.html')?.includes('<<<<<<<') && repo.isWorkingTreeClean() }
    ],
    hints: [
      "Run the merge to trigger Git conflict markers in header.html.",
      "Edit header.html to keep the desired code and remove all conflict markers.",
      "Stage the resolved file and commit to conclude the merge."
    ]
  },

  {
    id: "git-stash-workflow",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Context Switching with Git Stash",
    difficulty: "Medium",
    category: "Stashing & Context Switching",
    tags: ["Git Stash","Work in Progress","Context Switch"],
    interviewFrequency: "Core Concept",
    scenario: "You are working on experimental changes in search.js on main, but an urgent bug requires your working directory to be clean. Shelve your changes so the working directory is clean, then re-apply them.",
    description: "### Background & Context\nWhen production bugs require immediate attention while you have incomplete, broken code in your working tree, you cannot commit half-baked work. Git stash shelves dirty changes in a temporary stack, returning your working directory to a clean state.\n\n---\n\n### Problem Statement & Task\nYou have uncommitted edits in `app.js`. Stash your uncommitted work so your working tree is clean. Then restore your shelved changes back to the working directory.\n\n---\n\n**Example 1**:\n\n**Input**: Uncommitted changes in `app.js`.\n**Expected Output Format**:\n```output\nSaved working directory and index state WIP on main\n...\nOn branch main: working tree clean\n...\nChanges restored from stash stack.\n```\n\n**Acceptance Criteria**:\n1. Stash operation is executed.\n2. Changes are restored and present in working tree.",
    initialState: {
        "isRepo": true,
        "commits": [
            {
                "message": "Initial commit",
                "files": {
                    "search.js": "// basic search\n"
                }
            }
        ],
        "files": {
            "search.js": "// basic search\n// In-progress experimental AI search\nconst query = \"azure\";\n"
        },
        "currentBranch": "main"
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
    objectives: [
      { label: "Stash uncommitted changes to clean working tree", done: (repo) => true },
      { label: "Pop stashed changes back into active working tree", done: (repo) => repo.hasFile('app.js') && repo.getFileContent('app.js').includes('wip') }
    ],
    hints: [
      "Which Git command saves your uncommitted modifications to a temporary stack?",
      "After checking that the tree is clean, pop the latest stash entry back into your workspace."
    ]
  },

  {
    id: "git-reset-mixed",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Undo Last Commit with Mixed Reset",
    difficulty: "Medium",
    category: "Undoing Changes",
    tags: ["Git Reset","Mixed Reset","Undoing"],
    interviewFrequency: "Core Concept",
    scenario: "You accidentally committed a WIP message with unfinished code. Undo the last commit using a mixed reset so that the code remains in your working directory unstaged.",
    description: "### Background & Context\nIf an accidental commit was made locally that bundled unwanted files, resetting the branch pointer backward without losing your working directory code allows you to restage cleanly.\n\n---\n\n### Problem Statement & Task\nUndo the most recent commit on your branch using a mixed reset. Keep your changes in the working directory as unstaged modifications.\n\n---\n\n**Example 1**:\n\n**Input**: Commit history with accidental commit at HEAD.\n**Expected Output Format**:\n```output\nUnstaged changes after reset:\nM\tschema.sql\n```\n\n**Acceptance Criteria**:\n1. HEAD pointer moved back by 1 commit (`HEAD~1`).\n2. Modified files remain in the working tree as unstaged changes.",
    initialState: {
        "isRepo": true,
        "commits": [
            {
                "message": "feat: setup database schema",
                "files": {
                    "schema.sql": "CREATE TABLE users (id INT);\n"
                }
            },
            {
                "message": "wip: half-broken query",
                "files": {
                    "schema.sql": "CREATE TABLE users (id INT);\n-- broken\n"
                }
            }
        ],
        "files": {
            "schema.sql": "CREATE TABLE users (id INT);\n-- broken\n"
        },
        "currentBranch": "main"
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
    objectives: [
      { label: "Reset branch HEAD pointer backward by 1 commit", done: (repo) => repo.getCommitHistory().length === 1 },
      { label: "Retain modifications as unstaged working tree files", done: (repo) => repo.hasFile('schema.sql') && !repo.isWorkingTreeClean() }
    ],
    hints: [
      "Recall which Git reset mode moves HEAD and unstages files while preserving working directory edits.",
      "Specify HEAD~1 as the target commit."
    ]
  },

  {
    id: "git-cherry-pick",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Cherry-Pick Isolated Bugfix Commit",
    difficulty: "Medium",
    category: "Selective Integration",
    tags: ["Cherry-Pick","Hotfixes","Selective Merging"],
    interviewFrequency: "Core Concept",
    scenario: "A critical security fix was committed on the experimental branch (commit \"fix: patch auth vulnerability\"). Apply only that specific commit onto main without merging the rest of experimental.",
    description: "### Background & Context\nWhen an experimental branch contains several risky features along with one critical bugfix commit, merging the entire branch would pull in unfinished code. Cherry-picking applies only the specific bugfix commit onto your target branch.\n\n---\n\n### Problem Statement & Task\nSwitch to `main` and cherry-pick the isolated bugfix commit (`c103`) from the `experimental` branch without merging the rest of the branch.\n\n---\n\n**Example 1**:\n\n**Input**:\n- `main` branch lacks the critical bugfix\n- `experimental` branch contains commit `c103` with `patch.js`\n\n**Expected Output Format**:\n```output\n[main d1e2f3a] fix: patch security flaw\n 1 file changed, 5 insertions(+)\n create mode 100644 patch.js\n```\n\n**Acceptance Criteria**:\n1. Active branch is `main`.\n2. Commit `c103` changes are applied on `main`.",
    initialState: {
        "isRepo": true,
        "branches": {
            "main": {
                "commits": [
                    {
                        "id": "c101",
                        "message": "Initial commit",
                        "files": {
                            "app.js": "const app = {};\n"
                        }
                    }
                ]
            },
            "experimental": {
                "baseCommit": 0,
                "commits": [
                    {
                        "id": "c102",
                        "message": "feat: add experimental VR UI",
                        "files": {
                            "vr.js": "// VR\n"
                        }
                    },
                    {
                        "id": "c103",
                        "message": "fix: patch auth vulnerability",
                        "files": {
                            "patch.txt": "AUTH_PATCH_APPLIED\n"
                        }
                    }
                ]
            }
        },
        "currentBranch": "main"
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
    objectives: [
      { label: "Switch to main branch", done: (repo) => repo.getHeadBranch() === 'main' },
      { label: "Apply isolated bugfix commit via cherry-pick", done: (repo) => repo.getHeadBranch() === 'main' && repo.getLatestCommit()?.files?.['patch.js'] }
    ],
    hints: [
      "Ensure you are standing on main before cherry-picking.",
      "Pass the commit hash identifier (c103) to the cherry-pick command."
    ]
  },

  {
    id: "git-revert-commit",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Safe Collaborative History Reverting",
    difficulty: "Medium",
    category: "Undoing Changes",
    tags: ["Git Revert","History Preservation","Collaboration"],
    interviewFrequency: "Core Concept",
    scenario: "Commit c202 introduced a regression in production that broke payments. Revert the changes from commit c202 safely, preserving linear project history.",
    description: "### Background & Context\nUsing reset to remove commits from shared remote branches breaks history for other team members. The safe collaborative approach is to record a new inverse commit that un-does the faulty change.\n\n---\n\n### Problem Statement & Task\nRevert the faulty commit (`c202`) on your active branch, generating a clean inverse commit that documents the rollback.\n\n---\n\n**Example 1**:\n\n**Input**: Faulty commit at HEAD introducing `buggy_feature.js`.\n**Expected Output Format**:\n```output\n[main 7f8a9b0] Revert \"feat: add broken payment gateway\"\n 1 file changed, 0 insertions(+), 10 deletions(-)\n delete mode 100644 buggy_feature.js\n```\n\n**Acceptance Criteria**:\n1. Revert commit recorded on active branch.\n2. Faulty file `buggy_feature.js` is removed from latest snapshot.",
    initialState: {
        "isRepo": true,
        "commits": [
            {
                "id": "c201",
                "message": "Initial stable commit",
                "files": {
                    "payments.js": "function pay() { return true; }\n"
                }
            },
            {
                "id": "c202",
                "message": "feat: broken payments update",
                "files": {
                    "payments.js": "function pay() { throw new Error(\"broken\"); }\n"
                }
            }
        ],
        "files": {
            "payments.js": "function pay() { throw new Error(\"broken\"); }\n"
        },
        "currentBranch": "main"
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
    objectives: [
      { label: "Execute git revert targeting the faulty commit", done: (repo) => !repo.getLatestCommit()?.files?.['buggy_feature.js'] && repo.getCommitHistory().length >= 3 }
    ],
    hints: [
      "Which command generates a new commit that inverses the changes of an earlier commit?",
      "Pass the target commit hash (c202) to the revert command."
    ]
  },

  {
    id: "git-remote-add",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Connect Local Repository to Remote Origin",
    difficulty: "Hard",
    category: "Remote Operations",
    tags: ["Git Remote","Origin","Cloud Git"],
    interviewFrequency: "Core Concept",
    scenario: "Your project currently has no remote server configured. Add a remote named \"origin\" pointing to \"https://github.com/mscprpcem/quiz-platform.git\" and confirm the remote configuration.",
    description: "### Background & Context\nTo share local work with team members and push code to GitHub or GitLab, a local repository must be configured with a named remote endpoint URL.\n\n---\n\n### Problem Statement & Task\nAdd a remote tracking endpoint named `origin` pointing to `https://github.com/mscprpcem/quiz-platform.git`. Verify the remote configuration.\n\n---\n\n**Example 1**:\n\n**Input**: Local repository with no remotes.\n**Expected Output Format**:\n```output\norigin\thttps://github.com/mscprpcem/quiz-platform.git (fetch)\norigin\thttps://github.com/mscprpcem/quiz-platform.git (push)\n```\n\n**Acceptance Criteria**:\n1. Remote `origin` is configured.\n2. URL matches `https://github.com/mscprpcem/quiz-platform.git`.",
    initialState: {
        "isRepo": true,
        "commits": [
            {
                "message": "Initial commit",
                "files": {
                    "README.md": "# Quiz Platform\n"
                }
            }
        ],
        "files": {
            "README.md": "# Quiz Platform\n"
        },
        "remotes": {},
        "currentBranch": "main"
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
    objectives: [
      { label: "Register remote origin URL", done: (repo) => repo.hasRemote('origin') },
      { label: "Verify remote configuration via -v flag", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.trim() === 'git remote -v') }
    ],
    hints: [
      "Use the remote subcommand with the \"add\" operation.",
      "Specify \"origin\" as the remote name followed by the URL."
    ]
  },

  {
    id: "git-push-origin",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Push Commits & Establish Upstream Tracking",
    difficulty: "Hard",
    category: "Remote Operations",
    tags: ["Git Push","Upstream Tracking","Remotes"],
    interviewFrequency: "Core Concept",
    scenario: "You committed a new feature locally. Publish the \"feature/profile\" branch to remote \"origin\" and configure upstream tracking.",
    description: "### Background & Context\nPublishing local commits to a cloud Git hosting platform requires pushing your branch. Establishing upstream tracking links your local branch with its remote tracking branch so future pulls and pushes need no arguments.\n\n---\n\n### Problem Statement & Task\nFrom the `feature/profile` branch, push your commits to the `origin` remote while setting upstream tracking.\n\n---\n\n**Example 1**:\n\n**Input**: Local branch `feature/profile` with unpushed commits.\n**Expected Output Format**:\n```output\nTo https://github.com/mscprpcem/quiz-platform.git\n * [new branch]      feature/profile -> feature/profile\nBranch 'feature/profile' set up to track remote branch 'feature/profile' from 'origin'.\n```\n\n**Acceptance Criteria**:\n1. Push command targeting `origin feature/profile` is executed.\n2. Upstream tracking is established.",
    initialState: {
        "isRepo": true,
        "remotes": {
            "origin": {
                "url": "https://github.com/mscprpcem/quiz-platform.git",
                "branches": {}
            }
        },
        "branches": {
            "main": {
                "commits": [
                    {
                        "id": "p1",
                        "message": "Initial commit",
                        "files": {
                            "README.md": "# Readme\n"
                        }
                    }
                ]
            },
            "feature/profile": {
                "baseCommit": 0,
                "commits": [
                    {
                        "id": "p2",
                        "message": "feat: user profile page",
                        "files": {
                            "profile.html": "<h1>Profile</h1>\n"
                        }
                    }
                ]
            }
        },
        "currentBranch": "feature/profile"
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
    objectives: [
      { label: "Push feature branch commits to origin remote", done: (repo) => true },
      { label: "Configure upstream branch tracking (-u flag)", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.includes('git push') && (c.includes('-u') || c.includes('--set-upstream'))) }
    ],
    hints: [
      "Which flag sets the upstream tracking reference during a push?",
      "Use \"-u\" with \"origin\" and your branch name."
    ]
  },

  {
    id: "git-fetch-inspect",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Fetch Remote Changes Without Merging",
    difficulty: "Hard",
    category: "Remote Operations",
    tags: ["Git Fetch","Remote Tracking","Inspection"],
    interviewFrequency: "Core Concept",
    scenario: "Your teammate pushed a new commit to origin/main. Safely download the latest remote commits without altering your local working directory or branch.",
    description: "### Background & Context\nUnlike `git pull` (which immediately merges remote changes into your local files), `git fetch` safely downloads remote objects and updates remote tracking branches (`origin/main`) without touching your working tree.\n\n---\n\n### Problem Statement & Task\nFetch incoming changes from the `origin` remote and inspect the downloaded remote commit history without modifying your local working files.\n\n---\n\n**Example 1**:\n\n**Input**: Remote has newer commits not yet in local working tree.\n**Expected Output Format**:\n```output\nFrom https://github.com/mscprpcem/quiz-platform\n * [new branch]      main       -> origin/main\n```\n\n**Acceptance Criteria**:\n1. Remote objects are fetched from `origin`.\n2. Remote tracking log is inspected.",
    initialState: {
        "isRepo": true,
        "remotes": {
            "origin": {
                "url": "https://github.com/mscprpcem/quiz-platform.git",
                "branches": {}
            }
        },
        "branches": {
            "main": {
                "commits": [
                    {
                        "id": "f201",
                        "message": "Initial commit",
                        "files": {
                            "README.md": "# App\n"
                        }
                    }
                ]
            }
        },
        "remoteCommits": {
            "f202": {
                "id": "f202",
                "message": "feat: teammate added azure api",
                "files": {
                    "azure.js": "// azure\n"
                }
            }
        },
        "currentBranch": "main"
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
    objectives: [
      { label: "Fetch updates from remote origin", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.trim().startsWith('git fetch')) },
      { label: "Inspect remote tracking branch history", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.includes('origin/main') || c.includes('--all')) }
    ],
    hints: [
      "Run the fetch subcommand targeting origin.",
      "Inspect the downloaded commits using the log command targeting origin/main."
    ]
  },

  {
    id: "git-tag-release",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Tag Semantic Version Production Release",
    difficulty: "Hard",
    category: "Release Management",
    tags: ["Git Tag","SemVer","Releases"],
    interviewFrequency: "Core Concept",
    scenario: "Your application has passed all security audits and QA tests. Create an annotated tag named \"v1.0.0\" with the release message \"Production Release v1.0.0\".",
    description: "### Background & Context\nTags create permanent, human-readable semantic reference markers (e.g. `v1.0.0`) pinned to specific commits in history, marking production releases.\n\n---\n\n### Problem Statement & Task\nCreate an annotated release tag named `v1.0.0` on your latest commit with the release message `\"Production Release v1.0.0\"`.\n\n---\n\n**Example 1**:\n\n**Input**: Production-ready commit snapshot on `main`.\n**Expected Output Format**: Tag `v1.0.0` registered in repository metadata.\n\n---\n\n**Acceptance Criteria**:\n1. Annotated tag `v1.0.0` is created.\n2. Tag includes descriptive message.",
    initialState: {
        "isRepo": true,
        "commits": [
            {
                "id": "rel1",
                "message": "feat: completed core quiz platform",
                "files": {
                    "app.js": "const ready = true;\n"
                }
            }
        ],
        "tags": {},
        "currentBranch": "main"
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
    objectives: [
      { label: "Create annotated release tag v1.0.0 with message", done: (repo) => repo.hasTag('v1.0.0') }
    ],
    hints: [
      "Use the tag command with the \"-a\" option for annotated tags.",
      "Pass the release message using the \"-m\" flag."
    ]
  },

  {
    id: "git-reflog-recovery",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Disaster Recovery via Git Reflog",
    difficulty: "Extreme",
    category: "Disaster Recovery",
    tags: ["Reflog","Disaster Recovery","HEAD Restoration"],
    interviewFrequency: "Core Concept",
    scenario: "An accidental hard reset destroyed the last commit containing database.js! Inspect the reference history to locate the lost commit hash and restore it.",
    description: "### Background & Context\nIf an engineer accidentally executes a hard reset and loses important commits from the branch log, the data is not lost. Git maintains a private local history known as the **Reference Log (reflog)** recording every single movement of the HEAD pointer.\n\n---\n\n### Problem Statement & Task\nA catastrophic hard reset was run, detaching commit `c902`. Use the reference log to locate the lost commit and restore HEAD back to it.\n\n---\n\n**Example 1**:\n\n**Input**: Commit history missing the lost commit after hard reset.\n**Expected Output Format**:\n```output\nHEAD@{0}: reset: moving to HEAD~1\nHEAD@{1}: commit: crucial architectural feature\n...\nHEAD restored to c902.\n```\n\n**Acceptance Criteria**:\n1. Reflog is inspected.\n2. HEAD is restored to the lost commit.",
    initialState: {
        "isRepo": true,
        "commits": [
            {
                "id": "c901",
                "message": "Initial commit",
                "files": {
                    "index.html": "<h1>Home</h1>\n"
                }
            }
        ],
        "reflog": [
            {
                "from": "c902",
                "to": "c901",
                "action": "reset: moving to HEAD~1",
                "message": "accidental reset"
            },
            {
                "from": "c901",
                "to": "c902",
                "action": "commit",
                "message": "feat: critical database module"
            }
        ],
        "lostCommits": {
            "c902": {
                "id": "c902",
                "message": "feat: critical database module",
                "files": {
                    "index.html": "<h1>Home</h1>\n",
                    "database.js": "export const db = {};\n"
                }
            }
        },
        "currentBranch": "main"
    },
    validation: (repo) => {
          const latest = repo.getLatestCommit();
          if (latest.id !== 'c902' && (!latest.files || !latest.files['database.js'])) {
            return { passed: false, message: 'The lost commit (containing database.js) has not been restored.' };
          }
          return { passed: true, message: 'Miracle recovery! You retrieved the orphaned commit from the reflog.' };
        },
    objectives: [
      { label: "Inspect HEAD movements using reflog", done: (repo) => (repo.getCommandHistory ? repo.getCommandHistory() : []).some(c => c.trim().startsWith('git reflog')) },
      { label: "Restore lost commit using hard reset", done: (repo) => repo.getLatestCommit()?.id === 'c902' || repo.getLatestCommit()?.files?.['crucial.js'] }
    ],
    hints: [
      "Run the reflog command to review recent HEAD movements and find the commit hash.",
      "Use a hard reset targeting the discovered commit hash to restore it."
    ]
  },

  {
    id: "git-rebase-linear",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Linear Rebasing of Feature Branch",
    difficulty: "Extreme",
    category: "Branching & Rebasing",
    tags: ["Git Rebase","Linear History","Clean Commits"],
    interviewFrequency: "Core Concept",
    scenario: "Main has moved ahead with a new commit. Rebase your \"feature/dashboard\" branch on top of main so that your branch has a clean, linear history.",
    description: "### Background & Context\nRebasing replays the commits of your feature branch on top of the newest tip of the base branch, avoiding cluttering git history with unnecessary merge commits.\n\n---\n\n### Problem Statement & Task\nFrom your active feature branch `feature/dashboard`, rebase your work onto the latest commits of `main` to achieve a clean linear history.\n\n---\n\n**Example 1**:\n\n**Input**: Feature branch branched from an older commit on `main`.\n**Expected Output Format**:\n```output\nFirst, rewinding head to replay your work on top of it...\nApplying: feat: add dashboard charts\n```\n\n**Acceptance Criteria**:\n1. `feature/dashboard` is rebased on top of `main`.\n2. Commit history is linear.",
    initialState: {
        "isRepo": true,
        "branches": {
            "main": {
                "commits": [
                    {
                        "id": "m1",
                        "message": "Initial commit",
                        "files": {
                            "app.js": "// app\n"
                        }
                    },
                    {
                        "id": "m2",
                        "message": "feat: updated branding colors",
                        "files": {
                            "theme.css": "body { color: #0078D4; }\n"
                        }
                    }
                ]
            },
            "feature/dashboard": {
                "baseCommit": 0,
                "commits": [
                    {
                        "id": "d1",
                        "message": "feat: add analytics widgets",
                        "files": {
                            "dashboard.js": "export const widgets = [];\n"
                        }
                    }
                ]
            }
        },
        "currentBranch": "feature/dashboard"
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
    objectives: [
      { label: "Ensure active branch is feature/dashboard", done: (repo) => repo.getHeadBranch() === 'feature/dashboard' },
      { label: "Rebase commits on top of main", done: (repo) => repo.getHeadBranch() === 'feature/dashboard' && repo.getCommitHistory().length >= 3 }
    ],
    hints: [
      "Make sure you are standing on the feature branch before rebasing.",
      "Run the rebase command specifying main as the upstream target."
    ]
  },

  {
    id: "git-secret-scrubbing",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Untrack Leaked Secrets from Index",
    difficulty: "Extreme",
    category: "Security & Remediation",
    tags: ["Security","Secret Scrubbing","Cached Removal"],
    interviewFrequency: "Core Concept",
    scenario: "A developer accidentally committed secrets.txt with a private database password in the latest commit. Untrack secrets.txt, add it to .gitignore, and amend/create a commit securing the repo.",
    description: "### Background & Context\nIf a credentials file `secrets.txt` was accidentally committed to the repository, simply adding it to `.gitignore` has no effect because Git already tracks the file. You must explicitly remove it from the index/cache without deleting your local copy.\n\n---\n\n### Problem Statement & Task\nUntrack `secrets.txt` from the Git index while keeping the file on your local disk. Add `secrets.txt` to `.gitignore` and commit the change.\n\n---\n\n**Example 1**:\n\n**Input**: `secrets.txt` is currently tracked in Git index.\n**Expected Output Format**:\n```output\nrm 'secrets.txt'\n[main e5f6a7b] chore: stop tracking leaked secret\n 2 files changed, 2 insertions(+), 1 deletion(-)\n create mode 100644 .gitignore\n delete mode 100644 secrets.txt\n```\n\n**Acceptance Criteria**:\n1. `secrets.txt` is removed from the Git index/cache.\n2. `secrets.txt` remains present in the local filesystem.\n3. `.gitignore` ignores `secrets.txt` and is committed.",
    initialState: {
        "isRepo": true,
        "commits": [
            {
                "message": "Initial setup",
                "files": {
                    "index.js": "// app\n"
                }
            },
            {
                "message": "feat: add config",
                "files": {
                    "index.js": "// app\n",
                    "secrets.txt": "DB_PASS=super_secret_production_pass\n"
                }
            }
        ],
        "files": {
            "index.js": "// app\n",
            "secrets.txt": "DB_PASS=super_secret_production_pass\n"
        },
        "currentBranch": "main"
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
    objectives: [
      { label: "Remove secrets.txt from Git index using cached removal", done: (repo) => !repo.getLatestCommit()?.files?.['secrets.txt'] && repo.hasFile('secrets.txt') },
      { label: "Add to .gitignore and commit security fix", done: (repo) => repo.getLatestCommit()?.files?.['.gitignore'] }
    ],
    hints: [
      "Which option tells the remove command to unlink a file from Git tracking without deleting it from disk?",
      "Look up the \"--cached\" option for git rm."
    ]
  },

  {
    id: "git-hotfix-workflow",
    track: "git-advanced",
    moduleId: "git-advanced-workflows",
    moduleTitle: "Git Branching & Advanced Workflows",
    title: "Production Hotfix & Tagging Protocol",
    difficulty: "Extreme",
    category: "Emergency Workflow",
    tags: ["Production Hotfix","CVE Patching","SemVer Tagging"],
    interviewFrequency: "Core Concept",
    scenario: "Production has a critical vulnerability in server.js. Create a \"hotfix/cve-auth\" branch off main, apply the security fix, merge it back into main, and create release tag v1.0.1.",
    description: "### Background & Context\nWhen a critical vulnerability is identified in production, development cannot pause active feature branches. An emergency hotfix branch is spawned directly from production `main`, patched, merged back, and tagged with an updated patch version.\n\n---\n\n### Problem Statement & Task\nSpawn a new hotfix branch `hotfix/cve-auth` from `main`. Patch `server.js` to secure the vulnerability, commit the fix, merge it back into `main`, and tag the release as `v1.0.1`.\n\n---\n\n**Example 1**:\n\n**Input**: Vulnerable `server.js` on production `main`.\n**Expected Output Format**: Hotfix branch created, committed, merged to `main`, and tagged with `v1.0.1`.\n\n---\n\n**Acceptance Criteria**:\n1. Vulnerability patched and committed.\n2. Patch merged into `main`.\n3. Tag `v1.0.1` created on the merge commit.",
    initialState: {
        "isRepo": true,
        "commits": [
            {
                "id": "v100",
                "message": "Release v1.0.0",
                "files": {
                    "server.js": "const allowAll = true; // VULNERABILITY\n"
                }
            }
        ],
        "files": {
            "server.js": "const allowAll = true; // VULNERABILITY\n"
        },
        "tags": {
            "v1.0.0": {
                "commitId": "v100",
                "annotated": true
            }
        },
        "currentBranch": "main"
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
    objectives: [
      { label: "Create hotfix branch and apply security patch to server.js", done: (repo) => repo.hasFile('server.js') && repo.getFileContent('server.js').includes('SECURED') },
      { label: "Merge hotfix into main and tag v1.0.1", done: (repo) => repo.getHeadBranch() === 'main' && repo.hasTag('v1.0.1') }
    ],
    hints: [
      "Create and switch to the hotfix branch from main.",
      "Patch the file, commit the change, switch back to main, and merge.",
      "Apply the annotated patch tag v1.0.1 to conclude the hotfix."
    ]
  }
];

export const GIT_CHALLENGES = RAW_GIT_CHALLENGES.map(c => ({
  ...c,
  slug: c.slug || slugifyTitle(c.title) || c.id
}));
