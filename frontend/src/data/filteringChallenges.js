// =========================================================================
// 📘 40 ADVANCED FILTERING PRACTICE CHALLENGES (Masterclass)
// Real Coding Platform Format (LeetCode / HackerRank Style)
// Target Table: employees (emp_id, name, department, salary, city, hire_date)
// =========================================================================

export const FILTERING_COMMON_SETUP = `CREATE TABLE IF NOT EXISTS employees (
    emp_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT,
    salary INTEGER,
    city TEXT,
    hire_date TEXT
);

INSERT INTO employees (emp_id, name, department, salary, city, hire_date) VALUES
  (1, 'Amit', 'IT', 60000, 'Mumbai', '2023-01-10'),
  (2, 'Ravi', 'HR', 40000, 'Pune', '2022-06-15'),
  (3, 'Sneha', 'IT', 70000, 'Delhi', '2023-01-28'),
  (4, 'Priya', 'Finance', 50000, 'Mumbai', '2021-03-20'),
  (5, 'Karan', 'HR', 45000, 'Delhi', '2023-02-01'),
  (6, 'Rahul', 'IT', 55000, 'Pune', '2022-11-05'),
  (7, 'Neha', 'HR', 48000, 'Mumbai', '2023-01-18'),
  (8, 'Arjun', 'Finance', 65000, 'Delhi', '2020-08-12'),
  (9, 'Meena', 'IT', 72000, 'Mumbai', '2022-12-01'),
  (10, 'Suresh', 'HR', 38000, NULL, '2021-09-14'),
  (11, 'Ananya', 'IT', 62000, 'Delhi', '2023-01-05'),
  (12, 'Pooja', 'Finance', NULL, 'Mumbai', '2022-04-18'),
  (13, 'Ekta', 'Marketing', 58000, 'Pune', '2023-03-01'),
  (14, 'Farhan', 'Finance', 64000, 'Bangalore', '2021-07-22'),
  (15, 'Amita', NULL, 53000, 'Delhi', '2023-01-31'),
  (16, 'Dev_Lead', 'IT', 85000, 'Bangalore', '2022-05-19'),
  (17, 'Nayan', 'HR', 52000, 'Mumbai', '2023-02-14');`;

const TABLE_SCHEMA_DOC = `Table: \`employees\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **emp_id** | INTEGER | Primary Key. Unique employee ID |
| **name** | VARCHAR | Full name of the employee |
| **department** | VARCHAR | Department name (e.g. IT, HR, Finance) |
| **salary** | INTEGER | Annual salary in USD |
| **city** | VARCHAR | Base office location (can be NULL) |
| **hire_date** | DATE | Joining date (YYYY-MM-DD) |`;

export const FILTERING_CHALLENGES = [
  // ── 🟢 LEVEL 1 — LIKE OPERATOR & WILDCARDS (Q1–Q5) ──
  {
    id: "filt-01",
    moduleId: "filt-sec-1",
    moduleTitle: "Pattern Matching (LIKE)",
    title: "Find all employees whose name starts with 'A'",
    difficulty: "Basic",
    tags: ["LIKE", "Wildcards", "Prefix Matching"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all columns for all employees whose **\`name\`** begins with the letter **'A'**.

Return the result table in any order.

---

### Example 1:
**Input:**
\`employees\` table:
| emp_id | name | department | salary | city |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Amit | IT | 60000 | Mumbai |
| 2 | Ravi | HR | 40000 | Pune |
| 3 | Sneha | IT | 70000 | Delhi |
| 11 | Ananya | IT | 62000 | Delhi |

**Output:**
| emp_id | name | department | salary | city |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Amit | IT | 60000 | Mumbai |
| 11 | Ananya | IT | 62000 | Delhi |

**Explanation:**
Amit and Ananya start with 'A'. Ravi and Sneha do not.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE name LIKE 'A%';",
    checkOrder: false,
    hints: [],
    explanation: "LIKE 'A%' searches for strings starting with 'A'."
  },
  {
    id: "filt-02",
    moduleId: "filt-sec-1",
    moduleTitle: "Pattern Matching (LIKE)",
    title: "Find all employees whose name ends with 'a'",
    difficulty: "Basic",
    tags: ["LIKE", "Wildcards", "Suffix Matching"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all columns for all employees whose **\`name\`** terminates with the character **'a'**.

Return the result table in any order.

---

### Example 1:
**Input:**
\`employees\` table:
| emp_id | name | department | salary | city |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Amit | IT | 60000 | Mumbai |
| 3 | Sneha | IT | 70000 | Delhi |
| 4 | Priya | Finance | 50000 | Mumbai |

**Output:**
| emp_id | name | department | salary | city |
| :--- | :--- | :--- | :--- | :--- |
| 3 | Sneha | IT | 70000 | Delhi |
| 4 | Priya | Finance | 50000 | Mumbai |

**Explanation:**
Sneha and Priya end with 'a'. Amit ends with 't'.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE name LIKE '%a';",
    checkOrder: false,
    hints: [],
    explanation: "LIKE '%a' matches any string that terminates with 'a'."
  },
  {
    id: "filt-03",
    moduleId: "filt-sec-1",
    moduleTitle: "Pattern Matching (LIKE)",
    title: "Find all employees whose name contains 'r'",
    difficulty: "Basic",
    tags: ["LIKE", "Wildcards", "Substring Matching"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all columns for all employees whose **\`name\`** contains the letter **'r'** anywhere in their name.

Return the result table in any order.

---

### Example 1:
**Input:**
\`employees\` table:
| emp_id | name | department | salary | city |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Amit | IT | 60000 | Mumbai |
| 2 | Ravi | HR | 40000 | Pune |
| 5 | Karan | HR | 45000 | Delhi |

**Output:**
| emp_id | name | department | salary | city |
| :--- | :--- | :--- | :--- | :--- |
| 2 | Ravi | HR | 40000 | Pune |
| 5 | Karan | HR | 45000 | Delhi |

**Explanation:**
Ravi and Karan both contain the letter 'r'. Amit does not contain 'r'.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE name LIKE '%r%';",
    checkOrder: false,
    hints: [],
    explanation: "LIKE '%r%' matches the letter 'r' anywhere in the name."
  },
  {
    id: "filt-04",
    moduleId: "filt-sec-1",
    moduleTitle: "Pattern Matching (LIKE)",
    title: "Find all employees whose name has 'a' as the second letter",
    difficulty: "Basic",
    tags: ["LIKE", "Underscore", "Positional Matching"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all columns for all employees whose **\`name\`** has the letter **'a'** as their exact second character.

Return the result table in any order.

---

### Example 1:
**Input:**
\`employees\` table:
| emp_id | name | department | salary | city |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Amit | IT | 60000 | Mumbai |
| 2 | Ravi | HR | 40000 | Pune |
| 5 | Karan | HR | 45000 | Delhi |
| 6 | Rahul | IT | 55000 | Pune |

**Output:**
| emp_id | name | department | salary | city |
| :--- | :--- | :--- | :--- | :--- |
| 2 | Ravi | HR | 40000 | Pune |
| 5 | Karan | HR | 45000 | Delhi |
| 6 | Rahul | IT | 55000 | Pune |

**Explanation:**
Ravi, Karan, and Rahul all have 'a' as their 2nd character. Amit has 'm' as its 2nd character.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE name LIKE '_a%';",
    checkOrder: false,
    hints: [],
    explanation: "The underscore '_' matches exactly 1 character before 'a'."
  },
  {
    id: "filt-05",
    moduleId: "filt-sec-1",
    moduleTitle: "Pattern Matching (LIKE)",
    title: "Find all employees whose name starts with 'S'",
    difficulty: "Basic",
    tags: ["LIKE", "Prefix Matching"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all columns for all employees whose **\`name\`** begins with the letter **'S'**.

Return the result table in any order.

---

### Example 1:
**Input:**
\`employees\` table:
| emp_id | name | department | salary | city |
| :--- | :--- | :--- | :--- | :--- |
| 3 | Sneha | IT | 70000 | Delhi |
| 4 | Priya | Finance | 50000 | Mumbai |
| 10 | Suresh | HR | 38000 | NULL |

**Output:**
| emp_id | name | department | salary | city |
| :--- | :--- | :--- | :--- | :--- |
| 3 | Sneha | IT | 70000 | Delhi |
| 10 | Suresh | HR | 38000 | NULL |

**Explanation:**
Sneha and Suresh start with 'S'. Priya starts with 'P'.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE name LIKE 'S%';",
    checkOrder: false,
    hints: [],
    explanation: "LIKE 'S%' selects names beginning with 'S'."
  },

  // ── 🔵 LEVEL 2 — IN OPERATOR (Q6–Q10) ──
  {
    id: "filt-06",
    moduleId: "filt-sec-2",
    moduleTitle: "Set Membership (IN)",
    title: "Find employees in HR or IT departments",
    difficulty: "Basic",
    tags: ["IN", "Discrete Sets", "Readability"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution using the **\`IN\`** operator to report all employees who belong to either the **'HR'** or **'IT'** department.

Return the result table in any order.

---

### Example 1:
**Input:**
\`employees\` table:
| emp_id | name | department | salary | city |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Amit | IT | 60000 | Mumbai |
| 2 | Ravi | HR | 40000 | Pune |
| 4 | Priya | Finance | 50000 | Mumbai |

**Output:**
| emp_id | name | department | salary | city |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Amit | IT | 60000 | Mumbai |
| 2 | Ravi | HR | 40000 | Pune |

**Explanation:**
Amit is in IT and Ravi is in HR. Priya is in Finance and is therefore excluded.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE department IN ('HR', 'IT');",
    checkOrder: false,
    hints: [],
    explanation: "IN ('HR', 'IT') selects employees in HR or IT."
  },
  {
    id: "filt-07",
    moduleId: "filt-sec-2",
    moduleTitle: "Set Membership (IN)",
    title: "Find employees from Mumbai, Delhi, or Pune",
    difficulty: "Basic",
    tags: ["IN", "Categorical Lists"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees who reside in **'Mumbai'**, **'Delhi'**, or **'Pune'**.

Return the result table in any order.

---

### Example 1:
**Input:**
\`employees\` table:
| emp_id | name | city |
| :--- | :--- | :--- |
| 1 | Amit | Mumbai |
| 2 | Ravi | Pune |
| 14 | Farhan | Bangalore |

**Output:**
| emp_id | name | city |
| :--- | :--- | :--- |
| 1 | Amit | Mumbai |
| 2 | Ravi | Pune |

**Explanation:**
Farhan resides in Bangalore, which is not in the specified list.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE city IN ('Mumbai', 'Delhi', 'Pune');",
    checkOrder: false,
    hints: [],
    explanation: "Matches rows where city is in the specified 3-city list."
  },
  {
    id: "filt-08",
    moduleId: "filt-sec-2",
    moduleTitle: "Set Membership (IN)",
    title: "Find employees with salary of 40000, 50000, or 60000",
    difficulty: "Basic",
    tags: ["IN", "Numeric Sets"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`salary\`** is exactly **40000**, **50000**, or **60000**.

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE salary IN (40000, 50000, 60000);",
    checkOrder: false,
    hints: [],
    explanation: "Matches exact numeric values in the set."
  },
  {
    id: "filt-09",
    moduleId: "filt-sec-2",
    moduleTitle: "Set Membership (IN)",
    title: "Find employees whose emp_id is 1, 3, 5, or 7",
    difficulty: "Basic",
    tags: ["IN", "Primary Key Filter"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`emp_id\`** is **1**, **3**, **5**, or **7**.

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE emp_id IN (1, 3, 5, 7);",
    checkOrder: false,
    hints: [],
    explanation: "Filters for records with primary key IDs in (1, 3, 5, 7)."
  },
  {
    id: "filt-10",
    moduleId: "filt-sec-2",
    moduleTitle: "Set Membership (IN)",
    title: "Find employees in HR, IT, or Finance",
    difficulty: "Basic",
    tags: ["IN", "Department Filter"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees who belong to **'HR'**, **'IT'**, or **'Finance'**.

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE department IN ('HR', 'IT', 'Finance');",
    checkOrder: false,
    hints: [],
    explanation: "Filters rows matching any of the three specified departments."
  },

  // ── 🟡 LEVEL 3 — BETWEEN OPERATOR (Q11–Q15) ──
  {
    id: "filt-11",
    moduleId: "filt-sec-3",
    moduleTitle: "Range Queries (BETWEEN)",
    title: "Salary between 40000 and 60000",
    difficulty: "Easy",
    tags: ["BETWEEN", "Numeric Range", "Inclusive"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution using the **\`BETWEEN\`** operator to find all employees whose **\`salary\`** is between **40000** and **60000** (inclusive of both boundaries).

Return the result table in any order.

---

### Example 1:
**Input:**
\`employees\` table:
| emp_id | name | salary |
| :--- | :--- | :--- |
| 1 | Amit | 60000 |
| 2 | Ravi | 40000 |
| 3 | Sneha | 70000 |
| 10 | Suresh | 38000 |

**Output:**
| emp_id | name | salary |
| :--- | :--- | :--- |
| 1 | Amit | 60000 |
| 2 | Ravi | 40000 |

**Explanation:**
40000 and 60000 are included because BETWEEN is inclusive. 38000 is too low and 70000 is too high.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE salary BETWEEN 40000 AND 60000;",
    checkOrder: false,
    hints: [],
    explanation: "BETWEEN 40000 AND 60000 selects all salaries >= 40000 and <= 60000."
  },
  {
    id: "filt-12",
    moduleId: "filt-sec-3",
    moduleTitle: "Range Queries (BETWEEN)",
    title: "Salary between 50000 and 70000",
    difficulty: "Easy",
    tags: ["BETWEEN", "Numeric Range"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`salary\`** is between **50000** and **70000** (inclusive).

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE salary BETWEEN 50000 AND 70000;",
    checkOrder: false,
    hints: [],
    explanation: "Selects salaries between 50000 and 70000."
  },
  {
    id: "filt-13",
    moduleId: "filt-sec-3",
    moduleTitle: "Range Queries (BETWEEN)",
    title: "Employees with emp_id between 3 and 7",
    difficulty: "Easy",
    tags: ["BETWEEN", "ID Sequence"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`emp_id\`** is between **3** and **7** (inclusive).

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE emp_id BETWEEN 3 AND 7;",
    checkOrder: false,
    hints: [],
    explanation: "Returns records where emp_id is 3, 4, 5, 6, or 7."
  },
  {
    id: "filt-14",
    moduleId: "filt-sec-3",
    moduleTitle: "Range Queries (BETWEEN)",
    title: "Salary between 30000 and 50000",
    difficulty: "Easy",
    tags: ["BETWEEN", "Compensation"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`salary\`** is between **30000** and **50000** (inclusive).

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE salary BETWEEN 30000 AND 50000;",
    checkOrder: false,
    hints: [],
    explanation: "Selects employees with salary between 30k and 50k."
  },
  {
    id: "filt-15",
    moduleId: "filt-sec-3",
    moduleTitle: "Range Queries (BETWEEN)",
    title: "Employees whose emp_id is between 1 and 5",
    difficulty: "Easy",
    tags: ["BETWEEN", "Pagination Window"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`emp_id\`** is between **1** and **5** (inclusive).

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE emp_id BETWEEN 1 AND 5;",
    checkOrder: false,
    hints: [],
    explanation: "Matches primary keys 1 through 5."
  },

  // ── 🟣 LEVEL 4 — NULL OPERATOR (Q16–Q20) ──
  {
    id: "filt-16",
    moduleId: "filt-sec-4",
    moduleTitle: "NULL Value Handling",
    title: "Find employees whose city is NULL",
    difficulty: "Easy",
    tags: ["IS NULL", "Missing Data", "Three-Valued Logic"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`city\`** is missing or unrecorded (**NULL**).

Return the result table in any order.

---

### Example 1:
**Input:**
\`employees\` table:
| emp_id | name | city |
| :--- | :--- | :--- |
| 1 | Amit | Mumbai |
| 10 | Suresh | NULL |

**Output:**
| emp_id | name | city |
| :--- | :--- | :--- |
| 10 | Suresh | NULL |

**Explanation:**
Suresh has no city recorded.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE city IS NULL;",
    checkOrder: false,
    hints: [],
    explanation: "IS NULL checks for missing or unassigned values."
  },
  {
    id: "filt-17",
    moduleId: "filt-sec-4",
    moduleTitle: "NULL Value Handling",
    title: "Find employees whose city is NOT NULL",
    difficulty: "Easy",
    tags: ["IS NOT NULL", "Data Validation"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees who have a recorded, valid **\`city\`** (**IS NOT NULL**).

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE city IS NOT NULL;",
    checkOrder: false,
    hints: [],
    explanation: "IS NOT NULL selects only rows that have a populated city value."
  },
  {
    id: "filt-18",
    moduleId: "filt-sec-4",
    moduleTitle: "NULL Value Handling",
    title: "Find employees whose department is NULL",
    difficulty: "Easy",
    tags: ["IS NULL", "Unassigned Records"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees who currently do not have an assigned **\`department\`** (department is **NULL**).

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE department IS NULL;",
    checkOrder: false,
    hints: [],
    explanation: "Finds employees without an assigned department."
  },
  {
    id: "filt-19",
    moduleId: "filt-sec-4",
    moduleTitle: "NULL Value Handling",
    title: "Find employees whose department is NOT NULL",
    difficulty: "Easy",
    tags: ["IS NOT NULL", "Active Department"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees who have an assigned **\`department\`** (**department IS NOT NULL**).

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE department IS NOT NULL;",
    checkOrder: false,
    hints: [],
    explanation: "Selects employees with an assigned department."
  },
  {
    id: "filt-20",
    moduleId: "filt-sec-4",
    moduleTitle: "NULL Value Handling",
    title: "Count employees whose city is NULL",
    difficulty: "Easy",
    tags: ["COUNT", "IS NULL", "Aggregations"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to calculate the total number of employees whose **\`city\`** is **NULL**.

The output should contain a single column named \`count\` or the aggregate result.

---

### Example 1:
**Output:**
| COUNT(*) |
| :--- |
| 1 |`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT COUNT(*) FROM employees\nWHERE ",
    expectedSql: "SELECT COUNT(*) FROM employees\nWHERE city IS NULL;",
    checkOrder: false,
    hints: [],
    explanation: "COUNT(*) paired with WHERE city IS NULL counts rows with a missing city."
  },

  // ── 🟠 LEVEL 5 — MIXED LOGIC & COMPOUND FILTERING (Q21–Q25) ──
  {
    id: "filt-21",
    moduleId: "filt-sec-5",
    moduleTitle: "Compound Boolean Logic",
    title: "IT Department AND name starts with 'A'",
    difficulty: "Easy",
    tags: ["AND", "LIKE", "Compound Filter"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees who belong to the **'IT'** department **AND** whose **\`name\`** starts with the letter **'A'**.

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE department = 'IT' AND name LIKE 'A%';",
    checkOrder: false,
    hints: [],
    explanation: "Combines exact equality on department with wildcard matching on name."
  },
  {
    id: "filt-22",
    moduleId: "filt-sec-5",
    moduleTitle: "Compound Boolean Logic",
    title: "HR Department AND salary between 40000 and 50000",
    difficulty: "Easy",
    tags: ["AND", "BETWEEN", "Targeted Budget"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees who work in **'HR'** **AND** have a **\`salary\`** between **40000** and **50000** (inclusive).

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE department = 'HR' AND salary BETWEEN 40000 AND 50000;",
    checkOrder: false,
    hints: [],
    explanation: "Combines department filter with inclusive range filter."
  },
  {
    id: "filt-23",
    moduleId: "filt-sec-5",
    moduleTitle: "Compound Boolean Logic",
    title: "Mumbai or Delhi AND salary > 50000",
    difficulty: "Easy",
    tags: ["IN", "Comparison", "Compound"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees who live in **'Mumbai'** or **'Delhi'** **AND** earn a **\`salary\`** strictly greater than **50000**.

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE city IN ('Mumbai', 'Delhi') AND salary > 50000;",
    checkOrder: false,
    hints: [],
    explanation: "Combines city membership with numeric comparison."
  },
  {
    id: "filt-24",
    moduleId: "filt-sec-5",
    moduleTitle: "Compound Boolean Logic",
    title: "Name contains 'a' AND city IS NOT NULL",
    difficulty: "Easy",
    tags: ["LIKE", "IS NOT NULL"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`name\`** contains the letter **'a'** **AND** whose **\`city\`** is recorded (**IS NOT NULL**).

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE name LIKE '%a%' AND city IS NOT NULL;",
    checkOrder: false,
    hints: [],
    explanation: "Filters names containing 'a' while eliminating missing city rows."
  },
  {
    id: "filt-25",
    moduleId: "filt-sec-5",
    moduleTitle: "Compound Boolean Logic",
    title: "Salary IN (40000, 50000, 60000) AND department = 'IT'",
    difficulty: "Easy",
    tags: ["IN", "Equality"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`salary\`** is **40000**, **50000**, or **60000** **AND** who belong to the **'IT'** department.

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE salary IN (40000, 50000, 60000) AND department = 'IT';",
    checkOrder: false,
    hints: [],
    explanation: "Combines discrete salary matching with department equality."
  },

  // ── 🔴 LEVEL 6 — REAL THINKING (Q26–Q30) ──
  {
    id: "filt-26",
    moduleId: "filt-sec-6",
    moduleTitle: "String & Pattern Logic",
    title: "Employees whose name does NOT start with 'A'",
    difficulty: "Easy",
    tags: ["NOT LIKE", "Inversion"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`name\`** does **NOT** begin with the letter **'A'**.

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE name NOT LIKE 'A%';",
    checkOrder: false,
    hints: [],
    explanation: "NOT LIKE inverts pattern matching."
  },
  {
    id: "filt-27",
    moduleId: "filt-sec-6",
    moduleTitle: "String & Pattern Logic",
    title: "Salary outside 40000 to 60000",
    difficulty: "Easy",
    tags: ["NOT BETWEEN", "Range Exclusion"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`salary\`** is strictly outside the range of 40000 to 60000 (i.e. strictly less than 40000 OR strictly greater than 60000).

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE salary NOT BETWEEN 40000 AND 60000;",
    checkOrder: false,
    hints: [],
    explanation: "NOT BETWEEN matches values outside the boundaries (< 40000 or > 60000)."
  },
  {
    id: "filt-28",
    moduleId: "filt-sec-6",
    moduleTitle: "String & Pattern Logic",
    title: "Cities except Mumbai and Delhi",
    difficulty: "Easy",
    tags: ["NOT IN", "Exclusion"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees who reside in any city **except** **'Mumbai'** and **'Delhi'**.

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE city NOT IN ('Mumbai', 'Delhi');",
    checkOrder: false,
    hints: [],
    explanation: "NOT IN excludes rows matching any item in the target list."
  },
  {
    id: "filt-29",
    moduleId: "filt-sec-6",
    moduleTitle: "String & Pattern Logic",
    title: "Employees whose name length is 5",
    difficulty: "Easy",
    tags: ["LENGTH", "Functions", "Underscore"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`name\`** has an exact character length of **5**.

Return the result table in any order.

---

### Example 1:
**Input:**
\`employees\` table:
| emp_id | name |
| :--- | :--- |
| 1 | Amit (4 chars) |
| 2 | Ravi (4 chars) |
| 3 | Sneha (5 chars) |
| 4 | Priya (5 chars) |
| 5 | Karan (5 chars) |
| 6 | Rahul (5 chars) |

**Output:**
| emp_id | name |
| :--- | :--- |
| 3 | Sneha |
| 4 | Priya |
| 5 | Karan |
| 6 | Rahul |`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE LENGTH(name) = 5;",
    checkOrder: false,
    hints: [],
    explanation: "LENGTH(name) = 5 tests the string character count."
  },
  {
    id: "filt-30",
    moduleId: "filt-sec-6",
    moduleTitle: "String & Pattern Logic",
    title: "Employees whose name starts AND ends with a vowel",
    difficulty: "Medium",
    tags: ["REGEXP", "Regex", "Phonetics"],
    interviewFrequency: "High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`name\`** begins with a vowel (A, E, I, O, U) **AND** terminates with a vowel (A, E, I, O, U).

Return the result table in any order.

---

### Example 1:
**Input:**
\`employees\` table:
| emp_id | name |
| :--- | :--- |
| 1 | Amit (starts with A, ends with t - NO) |
| 11 | Ananya (starts with A, ends with a - YES) |
| 13 | Ekta (starts with E, ends with a - YES) |
| 15 | Amita (starts with A, ends with a - YES) |

**Output:**
| emp_id | name |
| :--- | :--- |
| 11 | Ananya |
| 13 | Ekta |
| 15 | Amita |`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE name REGEXP '^[AEIOUaeiou].*[AEIOUaeiou]$';",
    checkOrder: false,
    hints: [],
    explanation: "Anchors to the start with a vowel and ends with a vowel."
  },

  // ── 🔥 LEVEL 7 — FAANG SENIOR INTERVIEW TRAPS (Q31–Q35) ──
  {
    id: "filt-31",
    moduleId: "filt-sec-7",
    moduleTitle: "Edge Cases & Traps",
    title: "Wildcard Escaping: Search for literal underscore ('_')",
    difficulty: "Medium",
    tags: ["ESCAPE", "Wildcard Trap", "FAANG Interview"],
    interviewFrequency: "Very High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`name\`** contains a literal underscore character (**'_'**).

**Note:** In SQL, the underscore is ordinarily a single-character wildcard that matches any character. Your query must safely escape the underscore so that it matches only physical underscore symbols in the string.

Return the result table in any order.

---

### Example 1:
**Input:**
\`employees\` table:
| emp_id | name |
| :--- | :--- |
| 1 | Amit |
| 16 | Dev_Lead |

**Output:**
| emp_id | name |
| :--- | :--- |
| 16 | Dev_Lead |`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE name LIKE '%!_%' ESCAPE '!';",
    checkOrder: false,
    hints: [],
    explanation: "The ESCAPE clause defines an escape symbol that converts wildcards into literal characters."
  },
  {
    id: "filt-32",
    moduleId: "filt-sec-7",
    moduleTitle: "Edge Cases & Traps",
    title: "The Google NOT IN NULL Trap: Safe exclusion query",
    difficulty: "Medium",
    tags: ["NOT IN", "Three-Valued Logic", "Google Trap"],
    interviewFrequency: "Very High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a production-safe query to report all employees whose **\`city\`** is **NOT** in the list **('Pune')**, ensuring complete Three-Valued Logic safety (i.e. rows with a missing/NULL city must not cause the query to fail or return erroneous results).

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE city NOT IN ('Pune') AND city IS NOT NULL;",
    checkOrder: false,
    hints: [],
    explanation: "Guards against SQL Three-Valued Logic bugs where NULL causes NOT IN to return zero records."
  },
  {
    id: "filt-33",
    moduleId: "filt-sec-7",
    moduleTitle: "Edge Cases & Traps",
    title: "Strict Case-Sensitive Prefix Search",
    difficulty: "Medium",
    tags: ["Case-Sensitivity", "Collation", "Security"],
    interviewFrequency: "Very High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to perform a strictly **CASE-SENSITIVE** search for employees whose **\`name\`** begins with the uppercase letter **'A'** only (excluding lowercase 'a').

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE name LIKE 'A%' AND SUBSTR(name, 1, 1) = 'A';",
    checkOrder: false,
    hints: [],
    explanation: "Ensures case-sensitive character verification."
  },
  {
    id: "filt-34",
    moduleId: "filt-sec-7",
    moduleTitle: "Edge Cases & Traps",
    title: "Regex Backreference: Consecutive duplicate characters",
    difficulty: "Hard",
    tags: ["REGEXP", "Backreference", "String Algorithms"],
    interviewFrequency: "Very High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`name\`** contains consecutive identical duplicate characters (e.g. 'ee' in Meena, 'oo' in Pooja).

Return the result table in any order.

---

### Example 1:
**Input:**
\`employees\` table:
| emp_id | name |
| :--- | :--- |
| 1 | Amit |
| 9 | Meena (has 'ee') |
| 12 | Pooja (has 'oo') |

**Output:**
| emp_id | name |
| :--- | :--- |
| 9 | Meena |
| 12 | Pooja |`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE name REGEXP '(.)\\1';",
    checkOrder: false,
    hints: [],
    explanation: "The backreference '\\1' checks if the previous captured character immediately repeats."
  },
  {
    id: "filt-35",
    moduleId: "filt-sec-7",
    moduleTitle: "Edge Cases & Traps",
    title: "Half-Open Date Interval: The Timestamp Boundary Problem",
    difficulty: "Medium",
    tags: ["Timestamps", "Half-Open Intervals", "Staff Engineering"],
    interviewFrequency: "Very High",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees hired in **January 2023** (between **2023-01-01** and **2023-01-31**).

**Engineering Note:** In production systems with timestamp precision (hours, minutes, seconds), traditional BETWEEN queries can miss records logged on the final day after 00:00:00. Construct your query using half-open boundary intervals to guarantee complete coverage of all records in the calendar month.

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE hire_date >= '2023-01-01' AND hire_date < '2023-02-01';",
    checkOrder: false,
    hints: [],
    explanation: "Half-open intervals avoid missing timestamp records that include time components."
  },

  // ── 🚀 LEVEL 8 — FAANG STAFF-LEVEL EXTREME (Q36–Q40) ──
  {
    id: "filt-36",
    moduleId: "filt-sec-8",
    moduleTitle: "Query Optimization",
    title: "Search Engine Simulator: Multi-Token Filter with NULL Safety",
    difficulty: "Hard",
    tags: ["Search Simulator", "Compound Logic", "Staff Level"],
    interviewFrequency: "Extreme",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Simulate a production search query engine. Write a solution to report all employees who satisfy ALL of the following four conditions simultaneously:
1. The **\`name\`** contains the character **'a'** anywhere.
2. The **\`city\`** is either **'Mumbai'** or **'Delhi'**.
3. The **\`salary\`** is at least **50000** (\`salary >= 50000\`).
4. The **\`department\`** does **NOT** begin with the letter **'H'** (ensure that employees with an unassigned or NULL department are also retained).

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE name LIKE '%a%'\n  AND city IN ('Mumbai', 'Delhi')\n  AND salary >= 50000\n  AND (department NOT LIKE 'H%' OR department IS NULL);",
    checkOrder: false,
    hints: [],
    explanation: "Production search compilation requires handling NULL states in negated LIKE checks."
  },
  {
    id: "filt-37",
    moduleId: "filt-sec-8",
    moduleTitle: "Query Optimization",
    title: "Palindromic Matching: Case-Insensitive String Symmetry",
    difficulty: "Hard",
    tags: ["REVERSE", "LOWER", "String Algorithms"],
    interviewFrequency: "Extreme",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`name\`** is a **palindrome** (reads the exact same forward and backward, evaluated in a case-insensitive manner).

Return the result table in any order.

---

### Example 1:
**Input:**
\`employees\` table:
| emp_id | name |
| :--- | :--- |
| 1 | Amit ('amit' != 'tima') |
| 17 | Nayan ('nayan' == 'nayan' - YES) |

**Output:**
| emp_id | name |
| :--- | :--- |
| 17 | Nayan |`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE LOWER(name) = REVERSE(LOWER(name));",
    checkOrder: false,
    hints: [],
    explanation: "Reverses the lowercased string and checks for symmetric equality."
  },
  {
    id: "filt-38",
    moduleId: "filt-sec-8",
    moduleTitle: "Query Optimization",
    title: "Composite Data Integrity: Missing Attribute Quarantine",
    difficulty: "Hard",
    tags: ["Data Integrity", "OR Disjunction", "Dead Letter Queue"],
    interviewFrequency: "Extreme",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees who have **AT LEAST ONE missing attribute** across the columns **\`department\`**, **\`salary\`**, or **\`city\`**.

Return the result table in any order.

---

### Example 1:
**Input:**
\`employees\` table:
| emp_id | name | department | salary | city |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Amit | IT | 60000 | Mumbai |
| 10 | Suresh | HR | 38000 | NULL |
| 12 | Pooja | Finance | NULL | Mumbai |
| 15 | Amita | NULL | 53000 | Delhi |

**Output:**
| emp_id | name | department | salary | city |
| :--- | :--- | :--- | :--- | :--- |
| 10 | Suresh | HR | 38000 | NULL |
| 12 | Pooja | Finance | NULL | Mumbai |
| 15 | Amita | NULL | 53000 | Delhi |

**Explanation:**
Suresh has a missing city, Pooja has a missing salary, and Amita has a missing department. Amit has all attributes filled and is excluded.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE department IS NULL\n   OR salary IS NULL\n   OR city IS NULL;",
    checkOrder: false,
    hints: [],
    explanation: "Disjunctive NULL verification flags any row with missing or incomplete information."
  },
  {
    id: "filt-39",
    moduleId: "filt-sec-8",
    moduleTitle: "Query Optimization",
    title: "Phonetic Acoustic Filter: Alternating Vowel-Consonant-Vowel",
    difficulty: "Hard",
    tags: ["REGEXP", "Phonetics", "NLP Pattern"],
    interviewFrequency: "Extreme",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write a solution to report all employees whose **\`name\`** contains an alternating **Vowel-Consonant-Vowel (V-C-V)** phonetic sequence anywhere in their name.

**Definitions:**
- A vowel is any character in \`[aeiouAEIOU]\`.
- A consonant is any letter that is not a vowel: \`[b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z]\`.
- The sequence must consist of: **Vowel &rarr; Consonant &rarr; Vowel**.

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE name REGEXP '[aeiouAEIOU][b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z][aeiouAEIOU]';",
    checkOrder: false,
    hints: [],
    explanation: "Detects acoustic melodic syllables matching V-C-V phonetic transitions."
  },
  {
    id: "filt-40",
    moduleId: "filt-sec-8",
    moduleTitle: "Query Optimization",
    title: "Index-Sargable Safe Filtering: Optimize NULL compensation",
    difficulty: "Hard",
    tags: ["Sargability", "B-Tree Optimization", "Staff Engineering"],
    interviewFrequency: "Extreme",
    description: `${TABLE_SCHEMA_DOC}

---

### Task
Write an **index-sargable** solution to report all employees earning a **\`salary\`** between **40000** and **70000** (inclusive), while treating employees with a **NULL** salary as also eligible for inclusion.

**Critical Database Engineering Constraint:**
In high-throughput databases (such as MySQL InnoDB or PostgreSQL B+ Trees), wrapping an indexed column in a function (such as \`COALESCE(salary, 50000)\`) disables index seek capabilities and forces a catastrophic full table scan. Your solution MUST be formulated without wrapping the \`salary\` column in a function call, allowing the query optimizer to perform an index range scan.

Return the result table in any order.`,
    setupSql: FILTERING_COMMON_SETUP,
    starterSql: "-- Write your SQL query below\nSELECT * FROM employees\nWHERE ",
    expectedSql: "SELECT * FROM employees\nWHERE (salary BETWEEN 40000 AND 70000) OR (salary IS NULL);",
    checkOrder: false,
    hints: [],
    explanation: "Eliminates function wrappers around the indexed column, allowing the query optimizer to perform an index range scan."
  }
];
