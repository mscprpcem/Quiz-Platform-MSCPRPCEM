// =========================================================================
// 📘 50 DML PRACTICE CHALLENGES (DATA MANIPULATION LANGUAGE)
// Target Table: employees (emp_id, name, department, salary, city)
// =========================================================================

export const DML_CHALLENGES = [
  {
    "id": "dml-01",
    "moduleId": "dml-sec-insert",
    "moduleTitle": "Section I: INSERT (Q1–12)",
    "title": "Add one employee with values: 1, Amit, IT, 60000, Mumbai.",
    "difficulty": "Basic",
    "tags": [
      "DML",
      "INSERT",
      "Core DML"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Add one employee with values: 1, Amit, IT, 60000, Mumbai.\n- Target table: `employees`\n- Required DML command: **INSERT**\n- Difficulty Level: **Basic**\n\n*Concept Note*: Explicitly maps all 5 columns and passes single-quoted strings for text columns.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);",
    "starterSql": "",
    "expectedSql": "INSERT INTO employees (emp_id, name, department, salary, city)\nVALUES (1, 'Amit', 'IT', 60000, 'Mumbai');",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Explicitly maps all 5 columns and passes single-quoted strings for text columns."
    ],
    "explanation": "Explicitly maps all 5 columns and passes single-quoted strings for text columns."
  },
  {
    "id": "dml-02",
    "moduleId": "dml-sec-insert",
    "moduleTitle": "Section I: INSERT (Q1–12)",
    "title": "Add one employee with values: 2, Ravi, HR, 40000, Pune.",
    "difficulty": "Basic",
    "tags": [
      "DML",
      "INSERT",
      "Core DML"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Add one employee with values: 2, Ravi, HR, 40000, Pune.\n- Target table: `employees`\n- Required DML command: **INSERT**\n- Difficulty Level: **Basic**\n\n*Concept Note*: Inserts employee record for Ravi in HR department.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);",
    "starterSql": "",
    "expectedSql": "INSERT INTO employees (emp_id, name, department, salary, city)\nVALUES (2, 'Ravi', 'HR', 40000, 'Pune');",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Inserts employee record for Ravi in HR department."
    ],
    "explanation": "Inserts employee record for Ravi in HR department."
  },
  {
    "id": "dml-03",
    "moduleId": "dml-sec-insert",
    "moduleTitle": "Section I: INSERT (Q1–12)",
    "title": "Add one employee with values: 3, Sneha, IT, 70000, Delhi.",
    "difficulty": "Basic",
    "tags": [
      "DML",
      "INSERT",
      "Core DML"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Add one employee with values: 3, Sneha, IT, 70000, Delhi.\n- Target table: `employees`\n- Required DML command: **INSERT**\n- Difficulty Level: **Basic**\n\n*Concept Note*: Inserts employee record for Sneha in IT department located in Delhi.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);",
    "starterSql": "",
    "expectedSql": "INSERT INTO employees (emp_id, name, department, salary, city)\nVALUES (3, 'Sneha', 'IT', 70000, 'Delhi');",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Inserts employee record for Sneha in IT department located in Delhi."
    ],
    "explanation": "Inserts employee record for Sneha in IT department located in Delhi."
  },
  {
    "id": "dml-04",
    "moduleId": "dml-sec-insert",
    "moduleTitle": "Section I: INSERT (Q1–12)",
    "title": "Add two employees together: (4, Priya, Finance, 50000, Mumbai) and (5, Karan, HR, 45000, Delhi).",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "INSERT",
      "Bulk Insert"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Add two employees together: (4, Priya, Finance, 50000, Mumbai) and (5, Karan, HR, 45000, Delhi).\n- Target table: `employees`\n- Required DML command: **INSERT**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Multi-row batch insert: comma-separated value tuples execute in a single round-trip.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);",
    "starterSql": "",
    "expectedSql": "INSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi');",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Multi-row batch insert: comma-separated value tuples execute in a single round-trip."
    ],
    "explanation": "Multi-row batch insert: comma-separated value tuples execute in a single round-trip."
  },
  {
    "id": "dml-05",
    "moduleId": "dml-sec-insert",
    "moduleTitle": "Section I: INSERT (Q1–12)",
    "title": "Add three employees in one operation: (6, Rahul, IT, 55000, Pune), (7, Neha, HR, 48000, Mumbai), and (8, Arjun, Finance, 65000, Delhi).",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "INSERT",
      "Bulk Insert"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Add three employees in one operation: (6, Rahul, IT, 55000, Pune), (7, Neha, HR, 48000, Mumbai), and (8, Arjun, Finance, 65000, Delhi).\n- Target table: `employees`\n- Required DML command: **INSERT**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Three-row bulk insert saving engine lock and log flush overhead.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);",
    "starterSql": "",
    "expectedSql": "INSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi');",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Three-row bulk insert saving engine lock and log flush overhead."
    ],
    "explanation": "Three-row bulk insert saving engine lock and log flush overhead."
  },
  {
    "id": "dml-06",
    "moduleId": "dml-sec-insert",
    "moduleTitle": "Section I: INSERT (Q1–12)",
    "title": "Add an employee whose salary is greater than 70000: 9, Meena, IT, 72000, Mumbai.",
    "difficulty": "Basic",
    "tags": [
      "DML",
      "INSERT",
      "Core DML"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Add an employee whose salary is greater than 70000: 9, Meena, IT, 72000, Mumbai.\n- Target table: `employees`\n- Required DML command: **INSERT**\n- Difficulty Level: **Basic**\n\n*Concept Note*: Inserts Meena with a salary of 72000.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);",
    "starterSql": "",
    "expectedSql": "INSERT INTO employees (emp_id, name, department, salary, city)\nVALUES (9, 'Meena', 'IT', 72000, 'Mumbai');",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Inserts Meena with a salary of 72000."
    ],
    "explanation": "Inserts Meena with a salary of 72000."
  },
  {
    "id": "dml-07",
    "moduleId": "dml-sec-insert",
    "moduleTitle": "Section I: INSERT (Q1–12)",
    "title": "Add an employee whose salary is less than 40000: 10, Suresh, HR, 38000, Pune.",
    "difficulty": "Basic",
    "tags": [
      "DML",
      "INSERT",
      "Core DML"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Add an employee whose salary is less than 40000: 10, Suresh, HR, 38000, Pune.\n- Target table: `employees`\n- Required DML command: **INSERT**\n- Difficulty Level: **Basic**\n\n*Concept Note*: Inserts Suresh with a salary of 38000.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);",
    "starterSql": "",
    "expectedSql": "INSERT INTO employees (emp_id, name, department, salary, city)\nVALUES (10, 'Suresh', 'HR', 38000, 'Pune');",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Inserts Suresh with a salary of 38000."
    ],
    "explanation": "Inserts Suresh with a salary of 38000."
  },
  {
    "id": "dml-08",
    "moduleId": "dml-sec-insert",
    "moduleTitle": "Section I: INSERT (Q1–12)",
    "title": "Add an employee working in Delhi: 11, Pooja, IT, 61000, Delhi.",
    "difficulty": "Basic",
    "tags": [
      "DML",
      "INSERT",
      "Core DML"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Add an employee working in Delhi: 11, Pooja, IT, 61000, Delhi.\n- Target table: `employees`\n- Required DML command: **INSERT**\n- Difficulty Level: **Basic**\n\n*Concept Note*: Inserts Pooja working in Delhi city.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);",
    "starterSql": "",
    "expectedSql": "INSERT INTO employees (emp_id, name, department, salary, city)\nVALUES (11, 'Pooja', 'IT', 61000, 'Delhi');",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Inserts Pooja working in Delhi city."
    ],
    "explanation": "Inserts Pooja working in Delhi city."
  },
  {
    "id": "dml-09",
    "moduleId": "dml-sec-insert",
    "moduleTitle": "Section I: INSERT (Q1–12)",
    "title": "Add an employee working in Finance department: 12, Ramesh, Finance, 54000, Mumbai.",
    "difficulty": "Basic",
    "tags": [
      "DML",
      "INSERT",
      "Core DML"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Add an employee working in Finance department: 12, Ramesh, Finance, 54000, Mumbai.\n- Target table: `employees`\n- Required DML command: **INSERT**\n- Difficulty Level: **Basic**\n\n*Concept Note*: Inserts Ramesh in the Finance department.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);",
    "starterSql": "",
    "expectedSql": "INSERT INTO employees (emp_id, name, department, salary, city)\nVALUES (12, 'Ramesh', 'Finance', 54000, 'Mumbai');",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Inserts Ramesh in the Finance department."
    ],
    "explanation": "Inserts Ramesh in the Finance department."
  },
  {
    "id": "dml-10",
    "moduleId": "dml-sec-insert",
    "moduleTitle": "Section I: INSERT (Q1–12)",
    "title": "Add an employee whose name starts with \"A\": 13, Ankit, HR, 42000, Pune.",
    "difficulty": "Basic",
    "tags": [
      "DML",
      "INSERT",
      "Core DML"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Add an employee whose name starts with \"A\": 13, Ankit, HR, 42000, Pune.\n- Target table: `employees`\n- Required DML command: **INSERT**\n- Difficulty Level: **Basic**\n\n*Concept Note*: Inserts Ankit in the HR department.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);",
    "starterSql": "",
    "expectedSql": "INSERT INTO employees (emp_id, name, department, salary, city)\nVALUES (13, 'Ankit', 'HR', 42000, 'Pune');",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Inserts Ankit in the HR department."
    ],
    "explanation": "Inserts Ankit in the HR department."
  },
  {
    "id": "dml-11",
    "moduleId": "dml-sec-insert",
    "moduleTitle": "Section I: INSERT (Q1–12)",
    "title": "Add an employee with the highest salary so far: 14, Kavita, IT, 75000, Delhi.",
    "difficulty": "Basic",
    "tags": [
      "DML",
      "INSERT",
      "Core DML"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Add an employee with the highest salary so far: 14, Kavita, IT, 75000, Delhi.\n- Target table: `employees`\n- Required DML command: **INSERT**\n- Difficulty Level: **Basic**\n\n*Concept Note*: Inserts Kavita with a top-bracket salary of 75000.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);",
    "starterSql": "",
    "expectedSql": "INSERT INTO employees (emp_id, name, department, salary, city)\nVALUES (14, 'Kavita', 'IT', 75000, 'Delhi');",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Inserts Kavita with a top-bracket salary of 75000."
    ],
    "explanation": "Inserts Kavita with a top-bracket salary of 75000."
  },
  {
    "id": "dml-12",
    "moduleId": "dml-sec-insert",
    "moduleTitle": "Section I: INSERT (Q1–12)",
    "title": "Add an employee with duplicate city but different department: 15, Mohit, Finance, 58000, Mumbai.",
    "difficulty": "Basic",
    "tags": [
      "DML",
      "INSERT",
      "Core DML"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Add an employee with duplicate city but different department: 15, Mohit, Finance, 58000, Mumbai.\n- Target table: `employees`\n- Required DML command: **INSERT**\n- Difficulty Level: **Basic**\n\n*Concept Note*: Inserts Mohit in Mumbai under the Finance department.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);",
    "starterSql": "",
    "expectedSql": "INSERT INTO employees (emp_id, name, department, salary, city)\nVALUES (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Inserts Mohit in Mumbai under the Finance department."
    ],
    "explanation": "Inserts Mohit in Mumbai under the Finance department."
  },
  {
    "id": "dml-13",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Update the salary to 65000 for the employee where emp_id is 1.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "Targeted Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Update the salary to 65000 for the employee where emp_id is 1.\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Filters by primary key emp_id = 1 to guarantee exactly one row is modified.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET salary = 65000\nWHERE emp_id = 1;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Filters by primary key emp_id = 1 to guarantee exactly one row is modified."
    ],
    "explanation": "Filters by primary key emp_id = 1 to guarantee exactly one row is modified."
  },
  {
    "id": "dml-14",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Update the city to Mumbai for the employee where emp_id is 2.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "Targeted Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Update the city to Mumbai for the employee where emp_id is 2.\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Modifies city string value for emp_id 2.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET city = 'Mumbai'\nWHERE emp_id = 2;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Modifies city string value for emp_id 2."
    ],
    "explanation": "Modifies city string value for emp_id 2."
  },
  {
    "id": "dml-15",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Update the department to Finance for the employee where emp_id is 3.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "Targeted Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Update the department to Finance for the employee where emp_id is 3.\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Transfers employee 3 to the Finance department.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET department = 'Finance'\nWHERE emp_id = 3;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Transfers employee 3 to the Finance department."
    ],
    "explanation": "Transfers employee 3 to the Finance department."
  },
  {
    "id": "dml-16",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Update both salary and city for the employee where emp_id is 4 (salary = 55000, city = Pune).",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "Multi-Column Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Update both salary and city for the employee where emp_id is 4 (salary = 55000, city = Pune).\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Comma-separated SET clause updates multiple columns simultaneously.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET salary = 55000, city = 'Pune'\nWHERE emp_id = 4;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Comma-separated SET clause updates multiple columns simultaneously."
    ],
    "explanation": "Comma-separated SET clause updates multiple columns simultaneously."
  },
  {
    "id": "dml-17",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Increase the salary by 5000 for all employees working in HR department.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "Computed Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Increase the salary by 5000 for all employees working in HR department.\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Atomic in-place addition increments salary by 5000 for all matching HR employees.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET salary = salary + 5000\nWHERE department = 'HR';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Atomic in-place addition increments salary by 5000 for all matching HR employees."
    ],
    "explanation": "Atomic in-place addition increments salary by 5000 for all matching HR employees."
  },
  {
    "id": "dml-18",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Increase the salary by 10% for all employees working in IT department.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "Computed Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Increase the salary by 10% for all employees working in IT department.\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Multiplies current salary by 1.10 for a 10% raise.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET salary = salary * 1.10\nWHERE department = 'IT';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Multiplies current salary by 1.10 for a 10% raise."
    ],
    "explanation": "Multiplies current salary by 1.10 for a 10% raise."
  },
  {
    "id": "dml-19",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Update the city to Delhi for all employees currently working in Pune.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "Batch Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Update the city to Delhi for all employees currently working in Pune.\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Transfers all Pune-based employees to Delhi.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET city = 'Delhi'\nWHERE city = 'Pune';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Transfers all Pune-based employees to Delhi."
    ],
    "explanation": "Transfers all Pune-based employees to Delhi."
  },
  {
    "id": "dml-20",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Update the department to IT for employees whose salary is greater than 70000.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "Conditional Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Update the department to IT for employees whose salary is greater than 70000.\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Filters with comparison operator > 70000.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET department = 'IT'\nWHERE salary > 70000;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Filters with comparison operator > 70000."
    ],
    "explanation": "Filters with comparison operator > 70000."
  },
  {
    "id": "dml-21",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Update salary to 50000 for employees whose salary is less than 40000.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "Conditional Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Update salary to 50000 for employees whose salary is less than 40000.\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Raises minimum floor compensation for lower-salary employees.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET salary = 50000\nWHERE salary < 40000;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Raises minimum floor compensation for lower-salary employees."
    ],
    "explanation": "Raises minimum floor compensation for lower-salary employees."
  },
  {
    "id": "dml-22",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Update the city to Mumbai for employees working in Finance department.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "Batch Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Update the city to Mumbai for employees working in Finance department.\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Consolidates all Finance staff into Mumbai.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET city = 'Mumbai'\nWHERE department = 'Finance';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Consolidates all Finance staff into Mumbai."
    ],
    "explanation": "Consolidates all Finance staff into Mumbai."
  },
  {
    "id": "dml-23",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Update the department to HR for employees working in Delhi.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "Batch Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Update the department to HR for employees working in Delhi.\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Assigns all Delhi employees to HR.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET department = 'HR'\nWHERE city = 'Delhi';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Assigns all Delhi employees to HR."
    ],
    "explanation": "Assigns all Delhi employees to HR."
  },
  {
    "id": "dml-24",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Update salary to 60000 for employees named Ravi.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "Targeted Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Update salary to 60000 for employees named Ravi.\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Filters by name equality condition.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET salary = 60000\nWHERE name = 'Ravi';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Filters by name equality condition."
    ],
    "explanation": "Filters by name equality condition."
  },
  {
    "id": "dml-25",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Update salary to 62000 for employees whose emp_id is 11 or 12.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "List Filter Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Update salary to 62000 for employees whose emp_id is 11 or 12.\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Uses IN operator for clean multi-key matching.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET salary = 62000\nWHERE emp_id IN (11, 12);",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Uses IN operator for clean multi-key matching."
    ],
    "explanation": "Uses IN operator for clean multi-key matching."
  },
  {
    "id": "dml-26",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Update city to Mumbai and department to IT for employee where emp_id is 13.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "Multi-Column Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Update city to Mumbai and department to IT for employee where emp_id is 13.\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Updates both city and department in a single atomic statement.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET city = 'Mumbai', department = 'IT'\nWHERE emp_id = 13;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Updates both city and department in a single atomic statement."
    ],
    "explanation": "Updates both city and department in a single atomic statement."
  },
  {
    "id": "dml-27",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Increase salary by 3000 for all employees except those in Finance department.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "Negation Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Increase salary by 3000 for all employees except those in Finance department.\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Uses != (or <>) negation operator to exclude Finance employees.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET salary = salary + 3000\nWHERE department != 'Finance';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Uses != (or <>) negation operator to exclude Finance employees."
    ],
    "explanation": "Uses != (or <>) negation operator to exclude Finance employees."
  },
  {
    "id": "dml-28",
    "moduleId": "dml-sec-update",
    "moduleTitle": "Section II: UPDATE (Q13–28)",
    "title": "Update department to Operations for employees whose salary is between 45000 and 55000.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "UPDATE",
      "Range Update"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Update department to Operations for employees whose salary is between 45000 and 55000.\n- Target table: `employees`\n- Required DML command: **UPDATE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Uses inclusive BETWEEN range condition.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "UPDATE employees\nSET department = 'Operations'\nWHERE salary BETWEEN 45000 AND 55000;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Uses inclusive BETWEEN range condition."
    ],
    "explanation": "Uses inclusive BETWEEN range condition."
  },
  {
    "id": "dml-29",
    "moduleId": "dml-sec-delete",
    "moduleTitle": "Section III: DELETE (Q29–38)",
    "title": "Delete the employee where emp_id is 15.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "DELETE",
      "Targeted Delete"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Delete the employee where emp_id is 15.\n- Target table: `employees`\n- Required DML command: **DELETE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Deletes single targeted row using primary key filter.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "DELETE FROM employees\nWHERE emp_id = 15;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Deletes single targeted row using primary key filter."
    ],
    "explanation": "Deletes single targeted row using primary key filter."
  },
  {
    "id": "dml-30",
    "moduleId": "dml-sec-delete",
    "moduleTitle": "Section III: DELETE (Q29–38)",
    "title": "Delete employees working in HR department.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "DELETE",
      "Batch Delete"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Delete employees working in HR department.\n- Target table: `employees`\n- Required DML command: **DELETE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Deletes all employees matching department HR.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "DELETE FROM employees\nWHERE department = 'HR';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Deletes all employees matching department HR."
    ],
    "explanation": "Deletes all employees matching department HR."
  },
  {
    "id": "dml-31",
    "moduleId": "dml-sec-delete",
    "moduleTitle": "Section III: DELETE (Q29–38)",
    "title": "Delete employees whose salary is less than 40000.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "DELETE",
      "Conditional Delete"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Delete employees whose salary is less than 40000.\n- Target table: `employees`\n- Required DML command: **DELETE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Filters with < 40000.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "DELETE FROM employees\nWHERE salary < 40000;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Filters with < 40000."
    ],
    "explanation": "Filters with < 40000."
  },
  {
    "id": "dml-32",
    "moduleId": "dml-sec-delete",
    "moduleTitle": "Section III: DELETE (Q29–38)",
    "title": "Delete employees working in Pune city.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "DELETE",
      "Batch Delete"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Delete employees working in Pune city.\n- Target table: `employees`\n- Required DML command: **DELETE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Removes all records where city is Pune.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "DELETE FROM employees\nWHERE city = 'Pune';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Removes all records where city is Pune."
    ],
    "explanation": "Removes all records where city is Pune."
  },
  {
    "id": "dml-33",
    "moduleId": "dml-sec-delete",
    "moduleTitle": "Section III: DELETE (Q29–38)",
    "title": "Delete employees from Finance department working in Delhi.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "DELETE",
      "Multi-Condition Delete"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Delete employees from Finance department working in Delhi.\n- Target table: `employees`\n- Required DML command: **DELETE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Combines multiple conditions using logical AND.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "DELETE FROM employees\nWHERE department = 'Finance' AND city = 'Delhi';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Combines multiple conditions using logical AND."
    ],
    "explanation": "Combines multiple conditions using logical AND."
  },
  {
    "id": "dml-34",
    "moduleId": "dml-sec-delete",
    "moduleTitle": "Section III: DELETE (Q29–38)",
    "title": "Delete employees whose salary is greater than 75000.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "DELETE",
      "Conditional Delete"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Delete employees whose salary is greater than 75000.\n- Target table: `employees`\n- Required DML command: **DELETE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Deletes rows meeting the upper salary threshold.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "DELETE FROM employees\nWHERE salary > 75000;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Deletes rows meeting the upper salary threshold."
    ],
    "explanation": "Deletes rows meeting the upper salary threshold."
  },
  {
    "id": "dml-35",
    "moduleId": "dml-sec-delete",
    "moduleTitle": "Section III: DELETE (Q29–38)",
    "title": "Delete employees named Suresh.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "DELETE",
      "Targeted Delete"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Delete employees named Suresh.\n- Target table: `employees`\n- Required DML command: **DELETE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Removes records with name Suresh.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "DELETE FROM employees\nWHERE name = 'Suresh';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Removes records with name Suresh."
    ],
    "explanation": "Removes records with name Suresh."
  },
  {
    "id": "dml-36",
    "moduleId": "dml-sec-delete",
    "moduleTitle": "Section III: DELETE (Q29–38)",
    "title": "Delete employees whose emp_id is 10 or 11.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "DELETE",
      "List Filter Delete"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Delete employees whose emp_id is 10 or 11.\n- Target table: `employees`\n- Required DML command: **DELETE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Uses IN (10, 11) to delete specific IDs.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "DELETE FROM employees\nWHERE emp_id IN (10, 11);",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Uses IN (10, 11) to delete specific IDs."
    ],
    "explanation": "Uses IN (10, 11) to delete specific IDs."
  },
  {
    "id": "dml-37",
    "moduleId": "dml-sec-delete",
    "moduleTitle": "Section III: DELETE (Q29–38)",
    "title": "Delete all employees except those working in IT department.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "DELETE",
      "Negation Delete"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Delete all employees except those working in IT department.\n- Target table: `employees`\n- Required DML command: **DELETE**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Excludes IT staff from deletion using !=.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "DELETE FROM employees\nWHERE department != 'IT';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Excludes IT staff from deletion using !=."
    ],
    "explanation": "Excludes IT staff from deletion using !=."
  },
  {
    "id": "dml-38",
    "moduleId": "dml-sec-delete",
    "moduleTitle": "Section III: DELETE (Q29–38)",
    "title": "Delete all records from the employees table.",
    "difficulty": "Basic",
    "tags": [
      "DML",
      "DELETE",
      "Full Table Delete"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Delete all records from the employees table.\n- Target table: `employees`\n- Required DML command: **DELETE**\n- Difficulty Level: **Basic**\n\n*Concept Note*: DELETE without WHERE wipes all rows while preserving the table schema and column structure.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "DELETE FROM employees;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "DELETE without WHERE wipes all rows while preserving the table schema and column structure."
    ],
    "explanation": "DELETE without WHERE wipes all rows while preserving the table schema and column structure."
  },
  {
    "id": "dml-39",
    "moduleId": "dml-sec-select",
    "moduleTitle": "Section IV: SELECT (Q39–50)",
    "title": "Retrieve all employee records.",
    "difficulty": "Basic",
    "tags": [
      "DML",
      "SELECT",
      "Basic SELECT"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Retrieve all employee records.\n- Target table: `employees`\n- Required DML command: **SELECT**\n- Difficulty Level: **Basic**\n\n*Concept Note*: The asterisk (*) selects all columns from the employees table.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "SELECT * FROM employees;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "The asterisk (*) selects all columns from the employees table."
    ],
    "explanation": "The asterisk (*) selects all columns from the employees table."
  },
  {
    "id": "dml-40",
    "moduleId": "dml-sec-select",
    "moduleTitle": "Section IV: SELECT (Q39–50)",
    "title": "Retrieve only employee names and salaries.",
    "difficulty": "Basic",
    "tags": [
      "DML",
      "SELECT",
      "Projection"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Retrieve only employee names and salaries.\n- Target table: `employees`\n- Required DML command: **SELECT**\n- Difficulty Level: **Basic**\n\n*Concept Note*: Explicitly projects only the name and salary columns.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "SELECT name, salary FROM employees;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Explicitly projects only the name and salary columns."
    ],
    "explanation": "Explicitly projects only the name and salary columns."
  },
  {
    "id": "dml-41",
    "moduleId": "dml-sec-select",
    "moduleTitle": "Section IV: SELECT (Q39–50)",
    "title": "Retrieve employees working in IT department.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "SELECT",
      "Filtering"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Retrieve employees working in IT department.\n- Target table: `employees`\n- Required DML command: **SELECT**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Filters records matching department IT.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "SELECT * FROM employees\nWHERE department = 'IT';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Filters records matching department IT."
    ],
    "explanation": "Filters records matching department IT."
  },
  {
    "id": "dml-42",
    "moduleId": "dml-sec-select",
    "moduleTitle": "Section IV: SELECT (Q39–50)",
    "title": "Retrieve employees working in Mumbai.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "SELECT",
      "Filtering"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Retrieve employees working in Mumbai.\n- Target table: `employees`\n- Required DML command: **SELECT**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Filters records matching city Mumbai.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "SELECT * FROM employees\nWHERE city = 'Mumbai';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Filters records matching city Mumbai."
    ],
    "explanation": "Filters records matching city Mumbai."
  },
  {
    "id": "dml-43",
    "moduleId": "dml-sec-select",
    "moduleTitle": "Section IV: SELECT (Q39–50)",
    "title": "Retrieve employees whose salary is greater than 60000.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "SELECT",
      "Comparison"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Retrieve employees whose salary is greater than 60000.\n- Target table: `employees`\n- Required DML command: **SELECT**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Uses > 60000 numeric comparison filter.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "SELECT * FROM employees\nWHERE salary > 60000;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Uses > 60000 numeric comparison filter."
    ],
    "explanation": "Uses > 60000 numeric comparison filter."
  },
  {
    "id": "dml-44",
    "moduleId": "dml-sec-select",
    "moduleTitle": "Section IV: SELECT (Q39–50)",
    "title": "Retrieve employees whose salary is between 45000 and 65000.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "SELECT",
      "Range Filtering"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Retrieve employees whose salary is between 45000 and 65000.\n- Target table: `employees`\n- Required DML command: **SELECT**\n- Difficulty Level: **Easy**\n\n*Concept Note*: BETWEEN filter includes boundaries 45000 and 65000.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "SELECT * FROM employees\nWHERE salary BETWEEN 45000 AND 65000;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "BETWEEN filter includes boundaries 45000 and 65000."
    ],
    "explanation": "BETWEEN filter includes boundaries 45000 and 65000."
  },
  {
    "id": "dml-45",
    "moduleId": "dml-sec-select",
    "moduleTitle": "Section IV: SELECT (Q39–50)",
    "title": "Retrieve employees working in HR department and Delhi city.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "SELECT",
      "Multi-Condition"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Retrieve employees working in HR department and Delhi city.\n- Target table: `employees`\n- Required DML command: **SELECT**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Requires both department and city conditions to evaluate to TRUE.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "SELECT * FROM employees\nWHERE department = 'HR' AND city = 'Delhi';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Requires both department and city conditions to evaluate to TRUE."
    ],
    "explanation": "Requires both department and city conditions to evaluate to TRUE."
  },
  {
    "id": "dml-46",
    "moduleId": "dml-sec-select",
    "moduleTitle": "Section IV: SELECT (Q39–50)",
    "title": "Retrieve employees working in IT or Finance department.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "SELECT",
      "Logical OR"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Retrieve employees working in IT or Finance department.\n- Target table: `employees`\n- Required DML command: **SELECT**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Uses IN operator for multi-value categorical matching.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "SELECT * FROM employees\nWHERE department IN ('IT', 'Finance');",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Uses IN operator for multi-value categorical matching."
    ],
    "explanation": "Uses IN operator for multi-value categorical matching."
  },
  {
    "id": "dml-47",
    "moduleId": "dml-sec-select",
    "moduleTitle": "Section IV: SELECT (Q39–50)",
    "title": "Retrieve employees not working in HR department.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "SELECT",
      "Negation"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Retrieve employees not working in HR department.\n- Target table: `employees`\n- Required DML command: **SELECT**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Excludes HR staff using != operator.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "SELECT * FROM employees\nWHERE department != 'HR';",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Excludes HR staff using != operator."
    ],
    "explanation": "Excludes HR staff using != operator."
  },
  {
    "id": "dml-48",
    "moduleId": "dml-sec-select",
    "moduleTitle": "Section IV: SELECT (Q39–50)",
    "title": "Retrieve employees whose salary is the highest among all employees.",
    "difficulty": "Medium",
    "tags": [
      "DML",
      "SELECT",
      "Subquery / Sorting"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Retrieve employees whose salary is the highest among all employees.\n- Target table: `employees`\n- Required DML command: **SELECT**\n- Difficulty Level: **Medium**\n\n*Concept Note*: Uses a scalar subquery with MAX(salary) to retrieve the top earner.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "SELECT * FROM employees\nWHERE salary = (SELECT MAX(salary) FROM employees);",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Uses a scalar subquery with MAX(salary) to retrieve the top earner."
    ],
    "explanation": "Uses a scalar subquery with MAX(salary) to retrieve the top earner."
  },
  {
    "id": "dml-49",
    "moduleId": "dml-sec-select",
    "moduleTitle": "Section IV: SELECT (Q39–50)",
    "title": "Retrieve employees whose city is Mumbai and salary is greater than 50000.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "SELECT",
      "Compound Filter"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Retrieve employees whose city is Mumbai and salary is greater than 50000.\n- Target table: `employees`\n- Required DML command: **SELECT**\n- Difficulty Level: **Easy**\n\n*Concept Note*: Filters Mumbai residents with salary above 50,000.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "SELECT * FROM employees\nWHERE city = 'Mumbai' AND salary > 50000;",
    "checkOrder": false,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "Filters Mumbai residents with salary above 50,000."
    ],
    "explanation": "Filters Mumbai residents with salary above 50,000."
  },
  {
    "id": "dml-50",
    "moduleId": "dml-sec-select",
    "moduleTitle": "Section IV: SELECT (Q39–50)",
    "title": "Retrieve employees sorted by salary in descending order.",
    "difficulty": "Easy",
    "tags": [
      "DML",
      "SELECT",
      "Sorting"
    ],
    "interviewFrequency": "High",
    "description": "**Scenario**: You are maintaining the human resources database records on the **`employees`** table (`emp_id`, `name`, `department`, `salary`, `city`).\n\n**Task Requirements**:\n- Retrieve employees sorted by salary in descending order.\n- Target table: `employees`\n- Required DML command: **SELECT**\n- Difficulty Level: **Easy**\n\n*Concept Note*: ORDER BY salary DESC sorts results from highest to lowest salary.",
    "setupSql": "CREATE TABLE IF NOT EXISTS employees (\n    emp_id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    department TEXT NOT NULL,\n    salary INTEGER NOT NULL,\n    city TEXT NOT NULL\n);\n\nINSERT INTO employees (emp_id, name, department, salary, city) VALUES\n  (1, 'Amit', 'IT', 60000, 'Mumbai'),\n  (2, 'Ravi', 'HR', 40000, 'Pune'),\n  (3, 'Sneha', 'IT', 70000, 'Delhi'),\n  (4, 'Priya', 'Finance', 50000, 'Mumbai'),\n  (5, 'Karan', 'HR', 45000, 'Delhi'),\n  (6, 'Rahul', 'IT', 55000, 'Pune'),\n  (7, 'Neha', 'HR', 48000, 'Mumbai'),\n  (8, 'Arjun', 'Finance', 65000, 'Delhi'),\n  (9, 'Meena', 'IT', 72000, 'Mumbai'),\n  (10, 'Suresh', 'HR', 38000, 'Pune'),\n  (11, 'Pooja', 'IT', 61000, 'Delhi'),\n  (12, 'Ramesh', 'Finance', 54000, 'Mumbai'),\n  (13, 'Ankit', 'HR', 42000, 'Pune'),\n  (14, 'Kavita', 'IT', 75000, 'Delhi'),\n  (15, 'Mohit', 'Finance', 58000, 'Mumbai');",
    "starterSql": "",
    "expectedSql": "SELECT * FROM employees\nORDER BY salary DESC;",
    "checkOrder": true,
    "hints": [
      "Review the table structure: employees(emp_id, name, department, salary, city).",
      "Remember: Strings require single quotes ('value'); numbers do not have quotes.",
      "ORDER BY salary DESC sorts results from highest to lowest salary."
    ],
    "explanation": "ORDER BY salary DESC sorts results from highest to lowest salary."
  }
];
