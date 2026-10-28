// 30-Day Guided SQL Roadmap Data
export const SQL_30_DAY_ROADMAP = [
  // WEEK 1: FUNDAMENTALS & CRUD (DDL/DML)
  {
    day: 1,
    week: 1,
    phase: 'Foundations & Database Concepts',
    title: 'DBMS + SQL + Setup',
    moduleId: 'mod-01',
    topicId: 'top-01-01',
    estimatedMinutes: 45,
    difficulty: 'Beginner',
    summary: 'Master DBMS vs RDBMS, Tables, Rows, Columns, Schema, SQL command types (DDL, DML, DQL, DCL, TCL), and step-by-step setup of MySQL & MySQL Workbench.',
    goals: [
      'Understand Database Fundamentals: DBMS vs RDBMS, ACID properties & relational concepts',
      'Master the relational structure: Tables, Rows (Records), Columns (Attributes), and Schema blueprint',
      'Categorize SQL commands: DDL, DML, DQL, DCL, and TCL with real-world examples',
      'Install and configure MySQL Community Server and MySQL Workbench on your system',
      'Connect on Port 3306 and execute handshake verification queries'
    ],
    milestone: false
  },
  {
    day: 2,
    week: 1,
    phase: 'Foundations & Database Concepts',
    title: 'SQL Syntax & Command Categories',
    moduleId: 'mod-01',
    topicId: 'top-01-02',
    estimatedMinutes: 30,
    difficulty: 'Beginner',
    summary: 'Explore SQL syntax rules, keywords, comments, and the 5 command families: DDL, DML, DQL, DCL, TCL.',
    goals: [
      'Master SQL keywords, semicolons, comments, and casing conventions',
      'Distinguish between DDL, DML, DQL, DCL, and TCL',
      'Complete the Command Categories Practice Quiz'
    ],
    milestone: false
  },
  {
    day: 3,
    week: 1,
    phase: 'DDL - Schema Design',
    title: 'CREATE DATABASE & CREATE TABLE with Constraints',
    moduleId: 'mod-02',
    topicId: 'top-02-01',
    estimatedMinutes: 40,
    difficulty: 'Beginner',
    summary: 'Create databases and tables with data types, PRIMARY KEY, NOT NULL, AUTO_INCREMENT, and DEFAULT.',
    goals: [
      'Write CREATE DATABASE and CREATE TABLE queries',
      'Apply data types (INT, VARCHAR, DATE, BOOLEAN, DECIMAL)',
      'Add inline constraints and default column values'
    ],
    milestone: false
  },
  {
    day: 4,
    week: 1,
    phase: 'DQL - Advanced Filtering',
    title: 'DAY 4 — ADVANCED FILTERING (LIKE, IN, BETWEEN, NULL)',
    moduleId: 'mod-05',
    topicId: 'top-05-01',
    estimatedMinutes: 45,
    difficulty: 'Beginner',
    summary: 'Master LIKE wildcards (%, _), discrete IN matching, inclusive BETWEEN ranges, and Three-Valued Logic (IS NULL / IS NOT NULL).',
    goals: [
      'Master pattern matching with LIKE, %, and _ wildcards',
      'Filter multi-value sets with IN and understand why IN beats OR',
      'Execute continuous range queries with inclusive BETWEEN',
      'Understand Three-Valued Logic (TRUE/FALSE/UNKNOWN) and IS NULL',
      'Solve 30 practice questions across Level 1 to Level 6'
    ],
    milestone: false
  },
  {
    day: 5,
    week: 1,
    phase: 'DML - Data Manipulation',
    title: 'INSERT & Bulk Data Ingestion',
    moduleId: 'mod-day5',
    topicId: 'top-day5-01',
    estimatedMinutes: 45,
    difficulty: 'Beginner',
    summary: 'Master positional vs explicit syntax, multi-row batch ingestion (10x–50x speedup), INSERT INTO SELECT, ecommerce_lab schema setup, seed data, and constraint traps (1062, 1452, 3819).',
    goals: [
      'Understand the role of DML and transactional boundaries for write commands',
      'Distinguish between fragile Positional Inserts and recommended Explicit Column Inserts',
      'Execute multi-row batch inserts for 10x–50x write throughput gains',
      'Perform zero-copy server-side table migrations using INSERT INTO ... SELECT',
      'Build and seed the ecommerce_lab database schema with PK, FK, and CHECK constraints',
      'Identify and remediate MySQL Error Codes: 1062 (Duplicate Key), 1452 (Foreign Key), and 3819 (Check Constraint)'
    ],
    milestone: false
  },
  {
    day: 6,
    week: 1,
    phase: 'DML - Data Modification',
    title: 'UPDATE & DELETE with Safe Filtering',
    moduleId: 'mod-03',
    topicId: 'top-03-02',
    estimatedMinutes: 35,
    difficulty: 'Beginner',
    summary: 'Update records safely with WHERE clauses, modify multiple columns, and delete targeted records.',
    goals: [
      'Execute UPDATE statements with single & multiple column assignments',
      'Avoid accidental table-wide updates and deletions by enforcing WHERE checks',
      'Compare DELETE behavior with TRUNCATE'
    ],
    milestone: false
  },
  {
    day: 7,
    week: 1,
    phase: 'Weekly Milestone Assessment',
    title: 'Week 1 Review & DDL/DML Mastery Challenge',
    moduleId: 'mod-02',
    topicId: 'top-02-ddl-review',
    estimatedMinutes: 45,
    difficulty: 'Beginner',
    summary: 'Consolidate Week 1 learning with comprehensive scenario-based questions and DDL/DML code lab challenges.',
    goals: [
      'Pass the Week 1 Comprehensive DDL & DML Quiz with 80%+',
      'Solve 3 interactive hands-on schema modification challenges',
      'Earn the "Schema Architect Beginner" milestone badge'
    ],
    milestone: true,
    badgeName: 'Schema Architect'
  },

  // WEEK 2: DQL, FILTERING, AGGREGATION & CONSTRAINTS
  {
    day: 8,
    week: 2,
    phase: 'DQL - Querying Data',
    title: 'SELECT Basics, Column Aliases & Expressions',
    moduleId: 'mod-04',
    topicId: 'top-04-01',
    estimatedMinutes: 30,
    difficulty: 'Beginner',
    summary: 'Query table data, pick specific columns, alias column headers, and compute calculated expressions.',
    goals: [
      'Retrieve data with SELECT * vs selective column projections',
      'Use column aliases (AS) for clean reporting headers',
      'Write calculated expressions (e.g., salary * 1.10)'
    ],
    milestone: false
  },
  {
    day: 9,
    week: 2,
    phase: 'DQL - Filtering & Sorting',
    title: 'WHERE Clause, Logical Operators & ORDER BY',
    moduleId: 'mod-04',
    topicId: 'top-04-02',
    estimatedMinutes: 35,
    difficulty: 'Beginner',
    summary: 'Filter records with comparison and logical operators (AND, OR, NOT), and sort results with ORDER BY ASC/DESC.',
    goals: [
      'Combine multiple filtering criteria using parentheses and precedence rules',
      'Sort records by single and multiple columns in ascending/descending order',
      'Use DISTINCT to eliminate duplicate result rows'
    ],
    milestone: false
  },
  {
    day: 10,
    week: 2,
    phase: 'DQL - Pagination & Advanced Filtering',
    title: 'LIMIT, OFFSET, LIKE Wildcards & BETWEEN',
    moduleId: 'mod-05',
    topicId: 'top-05-01',
    estimatedMinutes: 40,
    difficulty: 'Beginner',
    summary: 'Paginate results with LIMIT/OFFSET, match text patterns with LIKE & %/_, and test ranges with BETWEEN.',
    goals: [
      'Implement API-style pagination with LIMIT and OFFSET',
      'Master pattern matching with % (any chars) and _ (single char)',
      'Filter numeric and date ranges using BETWEEN and NOT BETWEEN'
    ],
    milestone: false
  },
  {
    day: 11,
    week: 2,
    phase: 'DQL - NULL Handling & IN Operator',
    title: 'IN / NOT IN & Three-Valued NULL Logic',
    moduleId: 'mod-05',
    topicId: 'top-05-02',
    estimatedMinutes: 35,
    difficulty: 'Intermediate',
    summary: 'Simplify multi-value checks with IN/NOT IN, and handle SQL three-valued logic with IS NULL / IS NOT NULL.',
    goals: [
      'Check against discrete value lists using IN and NOT IN',
      'Understand why `column = NULL` is false and use `IS NULL` instead',
      'Recognize differences between NULL, zero, and empty string'
    ],
    milestone: false
  },
  {
    day: 12,
    week: 2,
    phase: 'SQL Functions & Metrics',
    title: 'Aggregate Functions: COUNT, SUM, AVG, MIN, MAX',
    moduleId: 'mod-06',
    topicId: 'top-06-01',
    estimatedMinutes: 35,
    difficulty: 'Beginner',
    summary: 'Compute summary metrics across entire tables and combined with WHERE filtering.',
    goals: [
      'Difference between COUNT(*), COUNT(column), and COUNT(DISTINCT column)',
      'Calculate totals, averages, minimums, and maximums',
      'Combine aggregate calculations with WHERE filters'
    ],
    milestone: false
  },
  {
    day: 13,
    week: 2,
    phase: 'Aggregation & Grouping',
    title: 'GROUP BY & HAVING vs WHERE Clauses',
    moduleId: 'mod-07',
    topicId: 'top-07-01',
    estimatedMinutes: 45,
    difficulty: 'Intermediate',
    summary: 'Group data by single and multiple columns, filter aggregates with HAVING, and master execution order.',
    goals: [
      'Form groups with GROUP BY on one or multiple categorical columns',
      'Filter grouped summary data using HAVING (vs row-level WHERE)',
      'Internalize the SQL logical query processing order (FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT)'
    ],
    milestone: false
  },
  {
    day: 14,
    week: 2,
    phase: 'Relational Integrity Milestone',
    title: 'Keys, Constraints, Normalization & Week 2 Assessment',
    moduleId: 'mod-08',
    topicId: 'top-08-01',
    estimatedMinutes: 50,
    difficulty: 'Intermediate',
    summary: 'Master Primary/Foreign/Candidate keys, 1NF, 2NF, 3NF normalization, and pass the Week 2 Assessment.',
    goals: [
      'Define Primary, Foreign, Unique, and Composite keys',
      'Identify 1NF, 2NF, and 3NF anomalies and decomposition rules',
      'Pass the Week 2 Intermediate SQL Assessment Quiz',
      'Earn the "Relational Architect" milestone badge'
    ],
    milestone: true,
    badgeName: 'Relational Architect'
  },

  // WEEK 3: JOINS, SUBQUERIES & VIEWS
  {
    day: 15,
    week: 3,
    phase: 'Relational Queries',
    title: 'INNER JOIN & Multi-Table Relationships',
    moduleId: 'mod-09',
    topicId: 'top-09-01',
    estimatedMinutes: 40,
    difficulty: 'Intermediate',
    summary: 'Join two or more tables with matching keys using INNER JOIN syntax and table aliases.',
    goals: [
      'Write INNER JOIN statements with explicit ON clauses',
      'Use table aliases (e.g., `e.department_id = d.id`) for readability',
      'Query data spanning 2 to 3 related tables simultaneously'
    ],
    milestone: false
  },
  {
    day: 16,
    week: 3,
    phase: 'Relational Queries',
    title: 'LEFT JOIN, RIGHT JOIN & FULL OUTER JOIN',
    moduleId: 'mod-09',
    topicId: 'top-09-02',
    estimatedMinutes: 45,
    difficulty: 'Intermediate',
    summary: 'Preserve unmatched records with outer joins, understand NULL columns in non-matching rows.',
    goals: [
      'Use LEFT JOIN to find items that have no matching relationship',
      'Understand RIGHT JOIN and its equivalence to reversed LEFT JOIN',
      'Handle FULL OUTER JOIN and MySQL UNION simulation patterns'
    ],
    milestone: false
  },
  {
    day: 17,
    week: 3,
    phase: 'Specialized Joins',
    title: 'SELF JOIN & CROSS JOIN Hierarchies',
    moduleId: 'mod-09',
    topicId: 'top-09-03',
    estimatedMinutes: 40,
    difficulty: 'Intermediate',
    summary: 'Join tables with themselves for employee-manager reporting and generate Cartesian combinations with CROSS JOIN.',
    goals: [
      'Build hierarchical parent-child queries (e.g. Employee and their Manager)',
      'Write CROSS JOINs to produce all possible combinations',
      'Solve classic interview questions involving self-referencing joins'
    ],
    milestone: false
  },
  {
    day: 18,
    week: 3,
    phase: 'Nested Queries',
    title: 'Single-Row & Multi-Row Subqueries',
    moduleId: 'mod-10',
    topicId: 'top-10-01',
    estimatedMinutes: 40,
    difficulty: 'Intermediate',
    summary: 'Embed queries inside WHERE/HAVING/FROM clauses using scalar comparisons and IN/ANY/ALL operators.',
    goals: [
      'Write scalar subqueries (e.g. `salary > (SELECT AVG(salary) FROM employees)`)',
      'Use multi-row subqueries with IN, NOT IN, ANY, ALL',
      'Subqueries in the FROM clause (Derived tables)'
    ],
    milestone: false
  },
  {
    day: 19,
    week: 3,
    phase: 'Correlated Subqueries',
    title: 'EXISTS, NOT EXISTS & Correlated Subqueries',
    moduleId: 'mod-10',
    topicId: 'top-10-02',
    estimatedMinutes: 45,
    difficulty: 'Advanced',
    summary: 'Execute row-by-row subqueries correlated with the outer query, and optimize checks using EXISTS.',
    goals: [
      'Understand correlated subqueries vs standalone subqueries',
      'Use EXISTS and NOT EXISTS for high-performance boolean checks',
      'Compare performance differences between EXISTS and IN with NULLs'
    ],
    milestone: false
  },
  {
    day: 20,
    week: 3,
    phase: 'Virtual Tables & Indexing',
    title: 'Views & Index Performance Fundamentals',
    moduleId: 'mod-11',
    topicId: 'top-11-01',
    estimatedMinutes: 40,
    difficulty: 'Intermediate',
    summary: 'Create reusable virtual views (CREATE VIEW) and understand B-Tree indexes for fast query lookup.',
    goals: [
      'Create, query, update, and drop SQL Views',
      'Understand how indexes speed up SELECT and when they slow down INSERT/UPDATE',
      'Create single-column, unique, and composite indexes'
    ],
    milestone: false
  },
  {
    day: 21,
    week: 3,
    phase: 'Weekly Milestone Assessment',
    title: 'Week 3 Joins & Subqueries Pro Assessment',
    moduleId: 'mod-09',
    topicId: 'top-09-join-review',
    estimatedMinutes: 50,
    difficulty: 'Intermediate',
    summary: 'Demonstrate join mastery, subquery logic, and view creation with timed practice questions.',
    goals: [
      'Pass the Week 3 Joins & Subqueries Comprehensive Quiz',
      'Solve multi-table e-commerce and HR analytics query challenges',
      'Earn the "Query Specialist" milestone badge'
    ],
    milestone: true,
    badgeName: 'Query Specialist'
  },

  // WEEK 4: ADVANCED SQL, WINDOW FUNCTIONS, TRANSACTIONS & INTERVIEW DRILLS
  {
    day: 22,
    week: 4,
    phase: 'Conditional Logic',
    title: 'CASE Statements in SELECT, ORDER BY & Aggregations',
    moduleId: 'mod-13',
    topicId: 'top-13-01',
    estimatedMinutes: 35,
    difficulty: 'Intermediate',
    summary: 'Write IF-THEN-ELSE conditional logic in SQL queries, bin numerical ranges, and perform conditional sums.',
    goals: [
      'Implement Simple CASE and Searched CASE syntax',
      'Classify employee salaries, customer tiers, and order statuses',
      'Perform conditional aggregation (e.g. `SUM(CASE WHEN status="Delivered" THEN 1 ELSE 0 END)`)'
    ],
    milestone: false
  },
  {
    day: 23,
    week: 4,
    phase: 'Modern SQL Analytics',
    title: 'Window Functions: ROW_NUMBER(), RANK(), DENSE_RANK()',
    moduleId: 'mod-14',
    topicId: 'top-14-01',
    estimatedMinutes: 50,
    difficulty: 'Advanced',
    summary: 'Calculate rankings and analytics without collapsing rows using OVER(), PARTITION BY, and ORDER BY.',
    goals: [
      'Understand the difference between Window Functions and GROUP BY aggregations',
      'Compare ROW_NUMBER(), RANK(), and DENSE_RANK() with ties',
      'Partition rankings by department or product category'
    ],
    milestone: false
  },
  {
    day: 24,
    week: 4,
    phase: 'Advanced Window Calculations',
    title: 'Running Totals, Moving Averages & Value Navigation',
    moduleId: 'mod-14',
    topicId: 'top-14-02',
    estimatedMinutes: 45,
    difficulty: 'Advanced',
    summary: 'Compute cumulative running totals, moving metrics, and find Top N records per group.',
    goals: [
      'Write cumulative running totals with `SUM(amount) OVER (ORDER BY date)`',
      'Solve the classic "Top N Salaries per Department" problem',
      'Use LEAD() and LAG() concepts to inspect preceding/following rows'
    ],
    milestone: false
  },
  {
    day: 25,
    week: 4,
    phase: 'Modular & Recursive Queries',
    title: 'CTE (Common Table Expressions) & Recursive Queries',
    moduleId: 'mod-15',
    topicId: 'top-15-01',
    estimatedMinutes: 45,
    difficulty: 'Advanced',
    summary: 'Structure complex SQL with WITH clauses, chain multiple CTEs, and write Recursive CTEs for hierarchy.',
    goals: [
      'Write clean, readable multi-step queries using WITH (CTE)',
      'Combine CTEs with Window Functions and JOINs',
      'Traverse organizational charts with Recursive CTEs'
    ],
    milestone: false
  },
  {
    day: 26,
    week: 4,
    phase: 'Database Reliability & Security',
    title: 'Transactions (ACID, COMMIT, ROLLBACK) & DCL (GRANT/REVOKE)',
    moduleId: 'mod-16',
    topicId: 'top-16-01',
    estimatedMinutes: 40,
    difficulty: 'Intermediate',
    summary: 'Understand ACID properties, transaction boundaries with SAVEPOINT, and manage database user permissions.',
    goals: [
      'Explain Atomicity, Consistency, Isolation, and Durability',
      'Write safe banking transfers using COMMIT, ROLLBACK, and SAVEPOINT',
      'Grant and Revoke user permissions with DCL commands'
    ],
    milestone: false
  },
  {
    day: 27,
    week: 4,
    phase: 'Programmable SQL',
    title: 'Stored Procedures & Procedural Logic',
    moduleId: 'mod-18',
    topicId: 'top-18-01',
    estimatedMinutes: 35,
    difficulty: 'Intermediate',
    summary: 'Encapsulate repeatable SQL logic in Stored Procedures with IN/OUT parameters and conditional control.',
    goals: [
      'Create and invoke stored procedures (CREATE PROCEDURE, CALL)',
      'Use IN, OUT, and INOUT parameters',
      'Understand benefits of precompiled execution plans and security encapsulation'
    ],
    milestone: false
  },
  {
    day: 28,
    week: 4,
    phase: 'Interview Marathon',
    title: 'FAANG & Top Tech SQL Interview Drill (Part 1)',
    moduleId: 'mod-19',
    topicId: 'top-19-01',
    estimatedMinutes: 60,
    difficulty: 'Advanced',
    summary: 'Solve high-frequency technical interview questions: Nth Highest Salary, Duplicate Records, Unmatched Rows.',
    goals: [
      'Solve 2nd & Nth Highest Salary using 3 distinct approaches (LIMIT, DENSE_RANK, Subquery)',
      'Detect and remove duplicate records while preserving the lowest ID',
      'Find departments with zero employees and employees with missing managers'
    ],
    milestone: false
  },
  {
    day: 29,
    week: 4,
    phase: 'Interview Marathon',
    title: 'Complex Business Analytics & Edge Case Drill (Part 2)',
    moduleId: 'mod-19',
    topicId: 'top-19-02',
    estimatedMinutes: 60,
    difficulty: 'Advanced',
    summary: 'Tackle consecutive active days, customer retention, churned users, and running balance calculations.',
    goals: [
      'Solve consecutive login streaks using Window functions',
      'Compute customer lifetime value and churn rates on real e-commerce data',
      'Perform optimization analysis to eliminate full-table scans'
    ],
    milestone: false
  },
  {
    day: 30,
    week: 4,
    phase: 'Grand Capstone & Certification',
    title: 'Final SQL Grand Master Assessment & Real-World Capstone',
    moduleId: 'mod-20',
    topicId: 'top-20-capstone',
    estimatedMinutes: 75,
    difficulty: 'Advanced',
    summary: 'Complete the comprehensive 30-Day SQL Mastery exam, solve end-to-end business case queries, and achieve certification.',
    goals: [
      'Complete the 30-Day Grand Master Assessment (covering all 21 modules)',
      'Execute full analytical queries across Banking, Sales, and E-Commerce databases',
      'Earn the "SQL Grand Master" certified milestone badge'
    ],
    milestone: true,
    badgeName: 'SQL Grand Master'
  }
];

export const ROADMAP_WEEKS = [
  { week: 1, title: 'Week 1: Fundamentals & CRUD (DDL/DML)', days: 'Days 1–7', badge: 'Schema Architect' },
  { week: 2, title: 'Week 2: DQL, Filtering, Aggregation & Keys', days: 'Days 8–14', badge: 'Relational Architect' },
  { week: 3, title: 'Week 3: JOINs, Subqueries & Views', days: 'Days 15–21', badge: 'Query Specialist' },
  { week: 4, title: 'Week 4: Advanced Analytics, Window Functions & Interviews', days: 'Days 22–30', badge: 'SQL Grand Master' }
];
