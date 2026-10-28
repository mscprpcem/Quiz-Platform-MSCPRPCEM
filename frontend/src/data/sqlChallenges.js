import { DDL_CHALLENGES } from './ddlChallenges.js';
import { DML_CHALLENGES } from './dmlChallenges.js';
import { FILTERING_CHALLENGES } from './filteringChallenges.js';
import { INSERT_CHALLENGES } from './insertChallenges.js';

// Enterprise & E-Commerce Seed Schemas
export const COMMON_SCHEMAS = {
  hrCompany: `
    CREATE TABLE departments (
      id INTEGER PRIMARY KEY,
      department_name TEXT NOT NULL,
      location TEXT NOT NULL,
      budget INTEGER NOT NULL
    );

    CREATE TABLE employees (
      id INTEGER PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      department_id INTEGER,
      salary INTEGER NOT NULL,
      hire_date TEXT NOT NULL,
      manager_id INTEGER,
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (manager_id) REFERENCES employees(id)
    );

    INSERT INTO departments (id, department_name, location, budget) VALUES
      (1, 'Engineering', 'San Francisco', 1500000),
      (2, 'Product & Design', 'New York', 850000),
      (3, 'Data Science', 'San Francisco', 1100000),
      (4, 'Marketing & Sales', 'Chicago', 720000),
      (5, 'Human Resources', 'Austin', 400000);

    INSERT INTO employees (id, first_name, last_name, email, department_id, salary, hire_date, manager_id) VALUES
      (1, 'Vikram', 'Aditya', 'vikram.a@company.com', 1, 145000, '2020-03-15', NULL), -- VP of Eng
      (2, 'Ananya', 'Iyer', 'ananya.i@company.com', 1, 115000, '2021-06-01', 1),
      (3, 'Rohan', 'Deshmukh', 'rohan.d@company.com', 1, 92000, '2022-01-10', 2),
      (4, 'Priya', 'Sharma', 'priya.s@company.com', 2, 108000, '2021-04-18', 1),
      (5, 'Kabir', 'Mehta', 'kabir.m@company.com', 2, 78000, '2023-02-20', 4),
      (6, 'Sneha', 'Nair', 'sneha.n@company.com', 3, 125000, '2020-11-05', 1),
      (7, 'Arjun', 'Reddy', 'arjun.r@company.com', 3, 98000, '2022-08-14', 6),
      (8, 'Tanvi', 'Joshi', 'tanvi.j@company.com', 4, 85000, '2021-09-01', NULL), -- Marketing Lead
      (9, 'Dev', 'Patel', 'dev.p@company.com', 4, 62000, '2023-05-12', 8),
      (10, 'Ishaan', 'Gupta', 'ishaan.g@company.com', NULL, 70000, '2024-01-08', NULL); -- Intern/Unassigned
  `,

  ecommerce: `
    CREATE TABLE customers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL
    );

    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      order_date TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      stock_qty INTEGER NOT NULL
    );

    CREATE TABLE order_items (
      id INTEGER PRIMARY KEY,
      order_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL
    );

    INSERT INTO customers (id, name, email, city, country) VALUES
      (1, 'Aarav Mehta', 'aarav.m@example.com', 'Mumbai', 'India'),
      (2, 'Sophia Taylor', 'sophia.t@example.com', 'New York', 'USA'),
      (3, 'Rajesh Patel', 'rajesh.p@example.com', 'Pune', 'India'),
      (4, 'Liam O Connor', 'liam.o@example.com', 'Dublin', 'Ireland'),
      (5, 'Emma Watson', 'emma.w@example.com', 'London', 'UK'),
      (6, 'Neha Kulkarni', 'neha.k@example.com', 'Nagpur', 'India'),
      (7, 'Carlos Santana', 'aarav.m@example.com', 'Madrid', 'Spain'); -- Duplicate email intentional for interview question

    INSERT INTO orders (id, customer_id, order_date, total_amount, status) VALUES
      (1001, 1, '2024-01-15', 350.00, 'Delivered'),
      (1002, 2, '2024-01-18', 1200.50, 'Delivered'),
      (1003, 1, '2024-02-01', 89.99, 'Delivered'),
      (1004, 3, '2024-02-14', 420.00, 'Shipped'),
      (1005, 2, '2024-03-02', 750.00, 'Processing');

    INSERT INTO products (id, product_name, category, price, stock_qty) VALUES
      (1, 'Mechanical Keyboard', 'Electronics', 150.00, 45),
      (2, 'Wireless Mouse', 'Electronics', 100.00, 80),
      (3, '4K Ultra Gaming Monitor', 'Displays', 800.00, 20),
      (4, 'Ergonomic Desk Chair', 'Furniture', 400.50, 15),
      (5, 'USB-C Fast Hub', 'Electronics', 89.99, 120),
      (6, 'Noise-Canceling Headphones', 'Audio', 420.00, 30),
      (7, 'Standing Desk Converter', 'Furniture', 750.00, 10),
      (8, 'Smart LED Desk Lamp', 'Lighting', 65.00, 50); -- Never ordered

    INSERT INTO order_items (id, order_id, product_name, category, unit_price, quantity) VALUES
      (1, 1001, 'Mechanical Keyboard', 'Electronics', 150.00, 1),
      (2, 1001, 'Wireless Mouse', 'Electronics', 100.00, 2),
      (3, 1002, '4K Ultra Gaming Monitor', 'Displays', 800.00, 1),
      (4, 1002, 'Ergonomic Desk Chair', 'Furniture', 400.50, 1),
      (5, 1003, 'USB-C Fast Hub', 'Electronics', 89.99, 1),
      (6, 1004, 'Noise-Canceling Headphones', 'Audio', 420.00, 1),
      (7, 1005, 'Standing Desk Converter', 'Furniture', 750.00, 1);
  `
};

const BASE_CHALLENGES = [
  // ==========================================
  // MODULE 1: BASIC FILTERING & SORTING
  // ==========================================
  {
    id: 'sql-01',
    moduleId: 'module-1',
    moduleTitle: '1. Basic Filtering & Sorting',
    title: 'High-Earning Engineers',
    difficulty: 'Easy',
    tags: ['SELECT', 'WHERE', 'ORDER BY'],
    interviewFrequency: 'Very Common (TCS, Infosys, Cognizant)',
    description: `
Table: \`employees\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key. Unique employee ID |
| **first_name** | VARCHAR | First name of the employee |
| **last_name** | VARCHAR | Last name of the employee |
| **email** | VARCHAR | Registered company email |
| **department_id** | INTEGER | Foreign key pointing to departments table |
| **salary** | INTEGER | Annual salary in USD |
| **hire_date** | DATE | Date the employee joined the company |
| **manager_id** | INTEGER | ID of the employee's direct manager |

---

Write a solution to find the **\`first_name\`**, **\`last_name\`**, and **\`salary\`** of all employees who earn strictly greater than **$90,000**.

Return the result table ordered by **\`salary\`** in descending order (highest earners first).

---

**Example 1**:

Input:
\`employees\` table:
| id | first_name | last_name | salary |
| :--- | :--- | :--- | :--- |
| 1 | Vikram | Aditya | 145000 |
| 2 | Ananya | Iyer | 115000 |
| 3 | Rohan | Deshmukh | 92000 |
| 5 | Kabir | Mehta | 78000 |

Output:
| first_name | last_name | salary |
| :--- | :--- | :--- |
| Vikram | Aditya | 145000 |
| Ananya | Iyer | 115000 |
| Sneha | Nair | 125000 |
| Priya | Sharma | 108000 |
| Arjun | Reddy | 98000 |
| Rohan | Deshmukh | 92000 |

Explanation:
Employees earning 90,000 or below (such as Kabir with 78,000) are excluded. The results are ordered from highest compensation down to 92,000.
    `,
    setupSql: COMMON_SCHEMAS.hrCompany,
    starterSql: `-- Write your SQL query here
SELECT first_name, last_name, salary
FROM employees
WHERE salary > 90000
ORDER BY salary DESC;`,
    expectedSql: `
SELECT first_name, last_name, salary
FROM employees
WHERE salary > 90000
ORDER BY salary DESC;
    `,
    checkOrder: true,
    hints: [
      'Use the WHERE clause to filter salaries: `WHERE salary > 90000`',
      'Use `ORDER BY salary DESC` to display the highest earners first.'
    ],
    explanation: `
The query retrieves three columns from \`employees\`. The \`WHERE salary > 90000\` filter narrows down to employees earning above 90K, and \`ORDER BY salary DESC\` ensures the result is sorted from highest to lowest.
    `
  },

  {
    id: 'sql-02',
    moduleId: 'module-1',
    moduleTitle: '1. Basic Filtering & Sorting',
    title: 'Pattern Matching & Multiple Conditions',
    difficulty: 'Easy',
    tags: ['WHERE', 'LIKE', 'AND/OR'],
    interviewFrequency: 'Common Technical Round',
    description: `
Table: \`employees\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key. Unique employee ID |
| **first_name** | VARCHAR | First name of employee |
| **email** | VARCHAR | Registered company email |
| **hire_date** | DATE | Date employee joined |

---

Write a solution to report the **\`first_name\`**, **\`email\`**, and **\`hire_date\`** of all employees whose email ends with **\`@company.com\`** and who were hired on or after **January 1, 2021** (\`hire_date >= '2021-01-01'\`).

The order of the result table does not matter.

---

**Example 1**:

Input:
\`employees\` table:
| id | first_name | email | hire_date |
| :--- | :--- | :--- | :--- |
| 1 | Vikram | vikram.a@company.com | 2020-03-15 |
| 2 | Ananya | ananya.i@company.com | 2021-06-01 |
| 3 | Rohan | rohan.d@company.com | 2022-01-10 |

Output:
| first_name | email | hire_date |
| :--- | :--- | :--- |
| Ananya | ananya.i@company.com | 2021-06-01 |
| Rohan | rohan.d@company.com | 2022-01-10 |

Explanation:
Vikram was hired in 2020 (before 2021-01-01), so he is filtered out. Only records meeting both criteria are returned.
    `,
    setupSql: COMMON_SCHEMAS.hrCompany,
    starterSql: `-- Filter by email pattern and hire_date
SELECT first_name, email, hire_date
FROM employees
WHERE email LIKE '%@company.com' AND hire_date >= '2021-01-01';`,
    expectedSql: `
SELECT first_name, email, hire_date
FROM employees
WHERE email LIKE '%@company.com' AND hire_date >= '2021-01-01';
    `,
    checkOrder: false,
    hints: [
      'In SQL, pattern matching is performed using the `LIKE` operator with `%`.',
      'Combine conditions with the `AND` keyword: `hire_date >= \'2021-01-01\'`.'
    ],
    explanation: `
\`LIKE '%@company.com'\` ensures any prefix preceding \`@company.com\` matches, while \`hire_date >= '2021-01-01'\` restricts the date range.
    `
  },

  {
    id: 'sql-03',
    moduleId: 'module-1',
    moduleTitle: '1. Basic Filtering & Sorting',
    title: 'Distinct Geographic Cities',
    difficulty: 'Easy',
    tags: ['DISTINCT', 'IN', 'ORDER BY'],
    interviewFrequency: 'Common Placement Question',
    description: `
Table: \`customers\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key. Unique customer ID |
| **name** | VARCHAR | Customer legal name |
| **city** | VARCHAR | City of residence |
| **country** | VARCHAR | Country of residence |

---

Write a solution to report a distinct list of all **\`city\`** names where customers reside in either **\`'India'\`** or **\`'USA'\`**.

Return the result table ordered by **\`city\`** in ascending alphabetical order. Duplicate city names must be eliminated.

---

**Example 1**:

Input:
\`customers\` table:
| id | name | city | country |
| :--- | :--- | :--- | :--- |
| 1 | Aarav Mehta | Mumbai | India |
| 2 | Sophia Taylor | New York | USA |
| 3 | Rajesh Patel | Pune | India |
| 4 | Liam O Connor | Dublin | Ireland |
| 6 | Neha Kulkarni | Nagpur | India |

Output:
| city |
| :--- |
| Mumbai |
| Nagpur |
| New York |
| Pune |

Explanation:
Dublin is excluded because its country is Ireland. The remaining cities are deduplicated and sorted from M to P.
    `,
    setupSql: COMMON_SCHEMAS.ecommerce,
    starterSql: `-- Write distinct cities query
SELECT DISTINCT city
FROM customers
WHERE country IN ('India', 'USA')
ORDER BY city ASC;`,
    expectedSql: `
SELECT DISTINCT city
FROM customers
WHERE country IN ('India', 'USA')
ORDER BY city ASC;
    `,
    checkOrder: true,
    hints: [
      'Use `DISTINCT` right after `SELECT` to eliminate duplicate city entries.',
      'Use `WHERE country IN (\'India\', \'USA\')` for cleaner multi-value matching.'
    ],
    explanation: `
\`DISTINCT\` prevents duplicates from showing up if multiple customers reside in the same city. The \`IN\` clause efficiently checks against the set of allowed countries.
    `
  },

  // ==========================================
  // MODULE 2: AGGREGATIONS & GROUP BY / HAVING
  // ==========================================
  {
    id: 'sql-04',
    moduleId: 'module-2',
    moduleTitle: '2. Aggregations & GROUP BY / HAVING',
    title: 'Department Salary Metrics',
    difficulty: 'Medium',
    tags: ['COUNT', 'SUM', 'AVG', 'GROUP BY'],
    interviewFrequency: 'Very Common (TCS, Infosys, Wipro)',
    description: `
Table: \`employees\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key. Unique employee ID |
| **department_id** | INTEGER | Department foreign key (nullable) |
| **salary** | INTEGER | Annual salary |

---

For each department, calculate aggregate payroll statistics.
Write a solution to report:
1. **\`department_id\`**
2. **\`employee_count\`**: total number of employees in the department
3. **\`total_salary\`**: sum of all salaries paid
4. **\`avg_salary\`**: average salary rounded to 2 decimal places

Filter out any unassigned employees where **\`department_id IS NULL\`**.
Return the result table ordered by **\`total_salary\`** in descending order.

---

**Example 1**:

Input:
\`employees\` table:
| id | department_id | salary |
| :--- | :--- | :--- |
| 1 | 1 | 145000 |
| 2 | 1 | 115000 |
| 3 | 1 | 92000 |
| 4 | 2 | 108000 |
| 5 | 2 | 78000 |

Output:
| department_id | employee_count | total_salary | avg_salary |
| :--- | :--- | :--- | :--- |
| 1 | 3 | 352000 | 117333.33 |
| 2 | 2 | 186000 | 93000.0 |

Explanation:
Department 1 has 3 engineers totaling $352,000 with an average of $117,333.33. Department 2 has 2 staff totaling $186,000.
    `,
    setupSql: COMMON_SCHEMAS.hrCompany,
    starterSql: `-- Aggregate per department
SELECT 
  department_id,
  COUNT(*) AS employee_count,
  SUM(salary) AS total_salary,
  ROUND(AVG(salary), 2) AS avg_salary
FROM employees
WHERE department_id IS NOT NULL
GROUP BY department_id
ORDER BY total_salary DESC;`,
    expectedSql: `
SELECT 
  department_id,
  COUNT(*) AS employee_count,
  SUM(salary) AS total_salary,
  ROUND(AVG(salary), 2) AS avg_salary
FROM employees
WHERE department_id IS NOT NULL
GROUP BY department_id
ORDER BY total_salary DESC;
    `,
    checkOrder: true,
    hints: [
      'Group your records using `GROUP BY department_id`.',
      'Use alias names (`AS employee_count`, `AS total_salary`, `AS avg_salary`).',
      'Wrap `AVG(salary)` inside `ROUND(..., 2)`.'
    ],
    explanation: `
Grouping by \`department_id\` aggregates each department's headcount and payroll numbers. \`ROUND(AVG(salary), 2)\` keeps decimal values clean and standardized.
    `
  },

  {
    id: 'sql-05',
    moduleId: 'module-2',
    moduleTitle: '2. Aggregations & GROUP BY / HAVING',
    title: 'High-Budget Departments (HAVING)',
    difficulty: 'Medium',
    tags: ['GROUP BY', 'HAVING', 'AVG'],
    interviewFrequency: 'High (Standard Placement Question)',
    description: `
Table: \`employees\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key |
| **department_id** | INTEGER | Foreign key pointing to departments table |
| **salary** | INTEGER | Annual salary |

---

*Interview Concept*: *"What is the architectural difference between WHERE and HAVING in SQL?"*
- \`WHERE\` filters individual rows **before** aggregation takes place.
- \`HAVING\` filters summarized groups **after** aggregation has occurred.

Write a solution to find all **\`department_id\`**s where the average employee salary is **strictly greater than $85,000**.
Return the **\`department_id\`** and the **\`avg_salary\`** (rounded to 2 decimal places).
Exclude records where \`department_id IS NULL\`.

---

**Example 1**:

Input:
\`employees\` table:
| id | department_id | salary |
| :--- | :--- | :--- |
| 1 | 1 | 145000 |
| 2 | 1 | 115000 |
| 8 | 4 | 85000 |
| 9 | 4 | 62000 |

Output:
| department_id | avg_salary |
| :--- | :--- |
| 1 | 117333.33 |
| 2 | 93000.0 |
| 3 | 111500.0 |

Explanation:
Department 4 has an average salary of (85000 + 62000)/2 = 73,500, which is below 85,000. Thus, department 4 is filtered out by the HAVING clause.
    `,
    setupSql: COMMON_SCHEMAS.hrCompany,
    starterSql: `-- Use HAVING to filter aggregate results
SELECT 
  department_id,
  ROUND(AVG(salary), 2) AS avg_salary
FROM employees
WHERE department_id IS NOT NULL
GROUP BY department_id
HAVING AVG(salary) > 85000;`,
    expectedSql: `
SELECT 
  department_id,
  ROUND(AVG(salary), 2) AS avg_salary
FROM employees
WHERE department_id IS NOT NULL
GROUP BY department_id
HAVING AVG(salary) > 85000;
    `,
    checkOrder: false,
    hints: [
      'You cannot put `AVG(salary) > 85000` in the WHERE clause. Use `HAVING AVG(salary) > 85000`.',
      'Make sure you still use `WHERE department_id IS NOT NULL` before `GROUP BY`.'
    ],
    explanation: `
\`WHERE\` filters individual row records before grouping, while \`HAVING\` evaluates group aggregates after the \`GROUP BY\` stage.
    `
  },

  {
    id: 'sql-06',
    moduleId: 'module-2',
    moduleTitle: '2. Aggregations & GROUP BY / HAVING',
    title: 'Order Status Analytics',
    difficulty: 'Medium',
    tags: ['COUNT', 'SUM', 'GROUP BY'],
    interviewFrequency: 'Common',
    description: `
Table: \`orders\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key. Unique order ID |
| **customer_id** | INTEGER | ID of customer who placed order |
| **total_amount** | REAL | Dollar transaction value |
| **status** | VARCHAR | Order state ('Delivered', 'Shipped', 'Processing') |

---

Write a solution to summarize order fulfillment metrics.
For each distinct **\`status\`**, calculate:
1. **\`status\`**
2. **\`order_count\`**: total number of orders placed in this status
3. **\`revenue\`**: sum of \`total_amount\` rounded to 2 decimal places

Return the result table ordered by **\`revenue\`** in descending order.

---

**Example 1**:

Input:
\`orders\` table:
| id | total_amount | status |
| :--- | :--- | :--- |
| 1001 | 350.00 | Delivered |
| 1002 | 1200.50 | Delivered |
| 1004 | 420.00 | Shipped |
| 1005 | 750.00 | Processing |

Output:
| status | order_count | revenue |
| :--- | :--- | :--- |
| Delivered | 3 | 1640.49 |
| Processing | 1 | 750.0 |
| Shipped | 1 | 420.0 |
    `,
    setupSql: COMMON_SCHEMAS.ecommerce,
    starterSql: `-- Order status analytics
SELECT 
  status,
  COUNT(*) AS order_count,
  ROUND(SUM(total_amount), 2) AS revenue
FROM orders
GROUP BY status
ORDER BY revenue DESC;`,
    expectedSql: `
SELECT 
  status,
  COUNT(*) AS order_count,
  ROUND(SUM(total_amount), 2) AS revenue
FROM orders
GROUP BY status
ORDER BY revenue DESC;
    `,
    checkOrder: true,
    hints: [
      'Group by `status`.',
      'Use `COUNT(*)` as `order_count` and `ROUND(SUM(total_amount), 2)` as `revenue`.'
    ],
    explanation: `
Aggregates sales performance by status stage, giving immediate business insight into fulfilled versus in-flight capital.
    `
  },

  // ==========================================
  // MODULE 3: RELATIONAL MULTI-TABLE JOINS
  // ==========================================
  {
    id: 'sql-07',
    moduleId: 'module-3',
    moduleTitle: '3. Relational Multi-Table JOINs',
    title: 'Employee Directory with Department Location',
    difficulty: 'Medium',
    tags: ['INNER JOIN', 'ON'],
    interviewFrequency: 'High (Core Join Foundation)',
    description: `
Table: \`employees\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key |
| **first_name** | VARCHAR | First name |
| **last_name** | VARCHAR | Last name |
| **department_id** | INTEGER | Foreign key to departments |
| **salary** | INTEGER | Annual compensation |

Table: \`departments\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key |
| **department_name** | VARCHAR | Department name |
| **location** | VARCHAR | Office location city |

---

Write an \`INNER JOIN\` query to report:
- **\`full_name\`**: formatted as \`first_name || ' ' || last_name\`
- **\`department_name\`**
- **\`location\`**
- **\`salary\`**

Only include employees assigned to a valid department.
Order the result by **\`department_name\`** ascending, then by **\`salary\`** descending.

---

**Example 1**:

Input:
\`employees\` table:
| id | first_name | last_name | department_id | salary |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Vikram | Aditya | 1 | 145000 |

\`departments\` table:
| id | department_name | location |
| :--- | :--- | :--- |
| 1 | Engineering | San Francisco |

Output:
| full_name | department_name | location | salary |
| :--- | :--- | :--- | :--- |
| Vikram Aditya | Engineering | San Francisco | 145000 |
    `,
    setupSql: COMMON_SCHEMAS.hrCompany,
    starterSql: `-- Join employees and departments
SELECT 
  e.first_name || ' ' || e.last_name AS full_name,
  d.department_name,
  d.location,
  e.salary
FROM employees e
INNER JOIN departments d ON e.department_id = d.id
ORDER BY d.department_name ASC, e.salary DESC;`,
    expectedSql: `
SELECT 
  e.first_name || ' ' || e.last_name AS full_name,
  d.department_name,
  d.location,
  e.salary
FROM employees e
INNER JOIN departments d ON e.department_id = d.id
ORDER BY d.department_name ASC, e.salary DESC;
    `,
    checkOrder: true,
    hints: [
      'Join on `e.department_id = d.id`.',
      'Concatenate strings using the `||` operator: `e.first_name || \' \' || e.last_name AS full_name`.'
    ],
    explanation: `
An \`INNER JOIN\` matches rows that have corresponding keys in both tables. Any employee without a department or any empty department is excluded.
    `
  },

  {
    id: 'sql-08',
    moduleId: 'module-3',
    moduleTitle: '3. Relational Multi-Table JOINs',
    title: 'Customers Who Never Order (LeetCode 183)',
    difficulty: 'Easy',
    tags: ['LeetCode 183', 'LEFT JOIN', 'IS NULL'],
    interviewFrequency: 'Top LeetCode Classic (Apple, Amazon, Bloomberg)',
    description: `
Table: \`customers\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key. Customer ID |
| **name** | VARCHAR | Customer name |

Table: \`orders\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key. Order ID |
| **customer_id** | INTEGER | Foreign key referencing customers.id |

---

Write a solution to report all customers who **never placed any orders**.

Return the result table with the column aliased as **\`Customers\`**.
The order of output does not matter.

---

**Example 1**:

Input:
\`customers\` table:
| id | name |
| :--- | :--- |
| 1 | Aarav Mehta |
| 2 | Sophia Taylor |
| 4 | Liam O Connor |
| 5 | Emma Watson |

\`orders\` table:
| id | customer_id |
| :--- | :--- |
| 1001 | 1 |
| 1002 | 2 |

Output:
| Customers |
| :--- |
| Liam O Connor |
| Emma Watson |
| Neha Kulkarni |
| Carlos Santana |

Explanation:
Customers 1 and 2 placed orders. Customers 4, 5, 6, and 7 never placed an order, so they are returned as the output.
    `,
    setupSql: COMMON_SCHEMAS.ecommerce,
    starterSql: `-- LeetCode 183: Anti-Join
SELECT c.name AS Customers
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;`,
    expectedSql: `
SELECT c.name AS Customers
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;
    `,
    checkOrder: false,
    hints: [
      'Use a `LEFT JOIN` on `c.id = o.customer_id`.',
      'Add `WHERE o.id IS NULL` to isolate customers with zero matching orders.'
    ],
    explanation: `
A \`LEFT JOIN\` retains all records from the left table (\`customers\`). If no order exists, columns from \`orders\` become \`NULL\`. Filtering by \`WHERE o.id IS NULL\` performs an anti-join.
    `
  },

  {
    id: 'sql-09',
    moduleId: 'module-3',
    moduleTitle: '3. Relational Multi-Table JOINs',
    title: 'Manager-Employee Hierarchy (Self-Join)',
    difficulty: 'Hard',
    tags: ['SELF JOIN', 'Hierarchical Query'],
    interviewFrequency: 'High (Placement Standard)',
    description: `
Table: \`employees\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key. Employee ID |
| **first_name** | VARCHAR | First name |
| **last_name** | VARCHAR | Last name |
| **manager_id** | INTEGER | ID of direct manager (references employees.id) |

---

Write a self-join query to report all employees who have a designated manager.
Return:
- **\`employee_name\`**: \`first_name || ' ' || last_name\` of the subordinate
- **\`manager_name\`**: \`first_name || ' ' || last_name\` of their direct supervisor

Sort the results alphabetically by **\`manager_name\`** ascending, then by **\`employee_name\`** ascending.

---

**Example 1**:

Input:
\`employees\` table:
| id | first_name | last_name | manager_id |
| :--- | :--- | :--- | :--- |
| 1 | Vikram | Aditya | NULL |
| 2 | Ananya | Iyer | 1 |
| 3 | Rohan | Deshmukh | 2 |

Output:
| employee_name | manager_name |
| :--- | :--- |
| Rohan Deshmukh | Ananya Iyer |
| Ananya Iyer | Vikram Aditya |
| Priya Sharma | Vikram Aditya |
| Sneha Nair | Vikram Aditya |

Explanation:
Vikram has manager_id NULL (CEO / VP), so he is excluded from the subordinate list. Ananya reports to Vikram, and Rohan reports to Ananya.
    `,
    setupSql: COMMON_SCHEMAS.hrCompany,
    starterSql: `-- Self Join on employees
SELECT 
  emp.first_name || ' ' || emp.last_name AS employee_name,
  mgr.first_name || ' ' || mgr.last_name AS manager_name
FROM employees emp
INNER JOIN employees mgr ON emp.manager_id = mgr.id
ORDER BY manager_name ASC, employee_name ASC;`,
    expectedSql: `
SELECT 
  emp.first_name || ' ' || emp.last_name AS employee_name,
  mgr.first_name || ' ' || mgr.last_name AS manager_name
FROM employees emp
INNER JOIN employees mgr ON emp.manager_id = mgr.id
ORDER BY manager_name ASC, employee_name ASC;
    `,
    checkOrder: true,
    hints: [
      'Alias the `employees` table twice: `FROM employees emp INNER JOIN employees mgr ON emp.manager_id = mgr.id`.'
    ],
    explanation: `
Self-joins enable querying recursive, hierarchical tree relationships within a single table.
    `
  },

  {
    id: 'sql-10',
    moduleId: 'module-3',
    moduleTitle: '3. Relational Multi-Table JOINs',
    title: '3-Way Relational Join: Customer Order Items',
    difficulty: 'Hard',
    tags: ['3-Way JOIN', 'Relational Model'],
    interviewFrequency: 'Common (E-Commerce Backend Interviews)',
    description: `
Tables: \`customers\`, \`orders\`, \`order_items\`

---

Write a 3-way join query connecting \`customers\` $\\rightarrow$ \`orders\` $\\rightarrow$ \`order_items\` to generate an itemized fulfillment manifest.
Return:
- **\`customer_name\`**: customer's full name
- **\`order_id\`**: numeric order identifier
- **\`product_name\`**: item title
- **\`quantity\`**: unit count
- **\`unit_price\`**: price per unit

Only include orders with status **\`'Delivered'\`**.
Sort by **\`order_id\`** ascending, then by **\`product_name\`** ascending.

---

**Example 1**:

Output format:
| customer_name | order_id | product_name | quantity | unit_price |
| :--- | :--- | :--- | :--- | :--- |
| Aarav Mehta | 1001 | Mechanical Keyboard | 1 | 150.0 |
| Aarav Mehta | 1001 | Wireless Mouse | 2 | 100.0 |
| Sophia Taylor | 1002 | 4K Ultra Gaming Monitor | 1 | 800.0 |
| Sophia Taylor | 1002 | Ergonomic Desk Chair | 1 | 400.5 |
| Aarav Mehta | 1003 | USB-C Fast Hub | 1 | 89.99 |
    `,
    setupSql: COMMON_SCHEMAS.ecommerce,
    starterSql: `-- 3-Way Join
SELECT 
  c.name AS customer_name,
  o.id AS order_id,
  oi.product_name,
  oi.quantity,
  oi.unit_price
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
INNER JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'Delivered'
ORDER BY o.id ASC, oi.product_name ASC;`,
    expectedSql: `
SELECT 
  c.name AS customer_name,
  o.id AS order_id,
  oi.product_name,
  oi.quantity,
  oi.unit_price
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
INNER JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'Delivered'
ORDER BY o.id ASC, oi.product_name ASC;
    `,
    checkOrder: true,
    hints: [
      'Chain the joins: `FROM customers c INNER JOIN orders o ON c.id = o.customer_id INNER JOIN order_items oi ON o.id = oi.order_id`.'
    ],
    explanation: `
3-way joins normalize relational schemas: customer details are separated from the transaction header, which is separated from line items.
    `
  },

  {
    id: 'sql-11',
    moduleId: 'module-3',
    moduleTitle: '3. Relational Multi-Table JOINs',
    title: 'Customer Lifetime Value (LTV)',
    difficulty: 'Medium',
    tags: ['JOIN', 'SUM', 'GROUP BY'],
    interviewFrequency: 'High (Analytics & Placement Rounds)',
    description: `
Tables: \`customers\`, \`orders\`

---

Write a query to calculate the **Customer Lifetime Value (LTV)** for all customers who have placed at least one order.
Return:
- **\`customer_name\`**: customer's name
- **\`total_spent\`**: sum of all order \`total_amount\`s rounded to 2 decimal places
- **\`total_orders\`**: count of orders placed

Order by **\`total_spent\`** descending (top spenders first).

---

**Example 1**:

Output:
| customer_name | total_spent | total_orders |
| :--- | :--- | :--- |
| Sophia Taylor | 1950.5 | 2 |
| Aarav Mehta | 439.99 | 2 |
| Rajesh Patel | 420.0 | 1 |
    `,
    setupSql: COMMON_SCHEMAS.ecommerce,
    starterSql: `-- Calculate LTV
SELECT 
  c.name AS customer_name,
  ROUND(SUM(o.total_amount), 2) AS total_spent,
  COUNT(o.id) AS total_orders
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_spent DESC;`,
    expectedSql: `
SELECT 
  c.name AS customer_name,
  ROUND(SUM(o.total_amount), 2) AS total_spent,
  COUNT(o.id) AS total_orders
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_spent DESC;
    `,
    checkOrder: true,
    hints: [
      'Group by `c.id, c.name` to aggregate amounts per customer.',
      'Use `ROUND(SUM(o.total_amount), 2) AS total_spent`.'
    ],
    explanation: `
Aggregates order totals per customer entity, enabling revenue attribution.
    `
  },

  {
    id: 'sql-12',
    moduleId: 'module-3',
    moduleTitle: '3. Relational Multi-Table JOINs',
    title: 'Unsold Inventory Detection',
    difficulty: 'Medium',
    tags: ['LEFT JOIN', 'IS NULL', 'Inventory'],
    interviewFrequency: 'Common',
    description: `
Tables: \`products\`, \`order_items\`

---

Supply chain managers need to identify dead inventory items that have **never been ordered by any customer**.
Write a solution to report the **\`product_name\`**, **\`category\`**, and **\`price\`** of all products that have never been purchased.

Order the results by **\`price\`** descending.

---

**Example 1**:

Input:
\`products\` includes:
| id | product_name | category | price |
| :--- | :--- | :--- | :--- |
| 8 | Smart LED Desk Lamp | Lighting | 65.0 |

Output:
| product_name | category | price |
| :--- | :--- | :--- |
| Smart LED Desk Lamp | Lighting | 65.0 |

Explanation:
All other products (keyboards, monitors, chairs) appear in \`order_items\`. Only the Smart LED Desk Lamp has zero orders.
    `,
    setupSql: COMMON_SCHEMAS.ecommerce,
    starterSql: `-- Find unsold products
SELECT p.product_name, p.category, p.price
FROM products p
LEFT JOIN order_items oi ON p.product_name = oi.product_name
WHERE oi.id IS NULL
ORDER BY p.price DESC;`,
    expectedSql: `
SELECT p.product_name, p.category, p.price
FROM products p
LEFT JOIN order_items oi ON p.product_name = oi.product_name
WHERE oi.id IS NULL
ORDER BY p.price DESC;
    `,
    checkOrder: true,
    hints: [
      'Use a `LEFT JOIN` on `p.product_name = oi.product_name`.',
      'Filter with `WHERE oi.id IS NULL`.'
    ],
    explanation: `
Identifies cold stock in data warehousing by testing for unreferenced inventory records.
    `
  },

  // ==========================================
  // MODULE 4: SUBQUERIES & LEETCODE CLASSICS
  // ==========================================
  {
    id: 'sql-13',
    moduleId: 'module-4',
    moduleTitle: '4. Subqueries & LeetCode Classics',
    title: 'Second Highest Salary (LeetCode 176)',
    difficulty: 'Medium',
    tags: ['LeetCode 176', 'Subquery', 'MAX / LIMIT'],
    interviewFrequency: 'Top 5 Most Asked SQL Questions (FAANG)',
    description: `
Table: \`employees\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key. Employee ID |
| **salary** | INTEGER | Annual salary |

---

Write a solution to report the second highest salary from the \`employees\` table. If there is no second highest salary, return **\`NULL\`**.

Return the result table with the column aliased as **\`SecondHighestSalary\`**.

---

**Example 1**:

Input:
\`employees\` table:
| id | salary |
| :--- | :--- |
| 1 | 145000 |
| 2 | 115000 |
| 6 | 125000 |

Output:
| SecondHighestSalary |
| :--- |
| 125000 |

Explanation:
The highest salary is 145,000 (Vikram). The second highest salary is 125,000 (Sneha).
    `,
    setupSql: COMMON_SCHEMAS.hrCompany,
    starterSql: `-- LeetCode 176: Second Highest Salary
SELECT MAX(salary) AS SecondHighestSalary
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);`,
    expectedSql: `
SELECT MAX(salary) AS SecondHighestSalary
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);
    `,
    checkOrder: false,
    hints: [
      'The inner subquery `(SELECT MAX(salary) FROM employees)` gets the #1 top salary.',
      'The outer query finds the `MAX(salary)` strictly less than that top value.',
      'Using `MAX()` automatically returns `NULL` if no second salary exists.'
    ],
    explanation: `
\`SELECT MAX(salary)\` strictly less than the overall maximum isolates the second highest distinct salary, and gracefully returns \`NULL\` if there are fewer than 2 distinct salary values.
    `
  },

  {
    id: 'sql-14',
    moduleId: 'module-4',
    moduleTitle: '4. Subqueries & LeetCode Classics',
    title: 'Duplicate Emails Detector (LeetCode 182)',
    difficulty: 'Easy',
    tags: ['LeetCode 182', 'GROUP BY', 'HAVING'],
    interviewFrequency: 'High (LeetCode 182 / Amazon / Google)',
    description: `
Table: \`customers\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key. Unique identifier for each customer |
| **name** | VARCHAR | Full name of customer |
| **email** | VARCHAR | Registered email address (guaranteed not NULL) |
| **city** | VARCHAR | City of residence |
| **country** | VARCHAR | Country of residence |

---

Write a solution to report all the **duplicate emails** in the \`customers\` table.

Return the result table with the column aliased as **\`Email\`**. The order of output does not matter.

---

**Example 1**:

Input:
\`customers\` table:
| id | name | email | city | country |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Aarav Mehta | aarav.m@example.com | Mumbai | India |
| 2 | Sophia Taylor | sophia.t@example.com | New York | USA |
| 7 | Carlos Santana | aarav.m@example.com | Madrid | Spain |

Output:
| Email |
| :--- |
| aarav.m@example.com |

Explanation:
The email \`aarav.m@example.com\` is repeated twice across customer records, so it is reported as a duplicate.
    `,
    setupSql: COMMON_SCHEMAS.ecommerce,
    starterSql: `-- LeetCode 182: Detect duplicate emails
SELECT email AS Email
FROM customers
GROUP BY email
HAVING COUNT(email) > 1;`,
    expectedSql: `
SELECT email AS Email
FROM customers
GROUP BY email
HAVING COUNT(email) > 1;
    `,
    checkOrder: false,
    hints: [
      'Group records by `email`.',
      'Filter with `HAVING COUNT(email) > 1`.'
    ],
    explanation: `
Any email appearing more than once generates a group with count $\\ge 2$. \`HAVING COUNT(email) > 1\` filters out all unique emails and isolates duplicates.
    `
  },

  {
    id: 'sql-15',
    moduleId: 'module-4',
    moduleTitle: '4. Subqueries & LeetCode Classics',
    title: 'Employees Earning Above Department Average',
    difficulty: 'Hard',
    tags: ['Correlated Subquery', 'WHERE'],
    interviewFrequency: 'High (Senior SDE Placement Exam)',
    description: `
Table: \`employees\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key |
| **first_name** | VARCHAR | First name |
| **department_id** | INTEGER | Department ID |
| **salary** | INTEGER | Annual compensation |

---

Write a solution to find all employees who earn **strictly more than the average salary of their respective department**.
Return:
- **\`first_name\`**
- **\`salary\`**
- **\`department_id\`**

Sort the results by **\`department_id\`** ascending, then by **\`salary\`** descending.

---

**Example 1**:

Input:
\`employees\` table:
In Department 1 (Engineering):
- Vikram (145,000), Ananya (115,000), Rohan (92,000).
- Department 1 Average: (145000 + 115000 + 92000)/3 = 117,333.33.

Output:
| first_name | salary | department_id |
| :--- | :--- | :--- |
| Vikram | 145000 | 1 |
| Priya | 108000 | 2 |
| Sneha | 125000 | 3 |

Explanation:
Vikram (145K) is above Dept 1 avg (117.3K). Priya (108K) is above Dept 2 avg (93K). Sneha (125K) is above Dept 3 avg (111.5K).
    `,
    setupSql: COMMON_SCHEMAS.hrCompany,
    starterSql: `-- Correlated subquery
SELECT e1.first_name, e1.salary, e1.department_id
FROM employees e1
WHERE e1.salary > (
  SELECT AVG(e2.salary)
  FROM employees e2
  WHERE e2.department_id = e1.department_id
)
ORDER BY e1.department_id ASC, e1.salary DESC;`,
    expectedSql: `
SELECT e1.first_name, e1.salary, e1.department_id
FROM employees e1
WHERE e1.salary > (
  SELECT AVG(e2.salary)
  FROM employees e2
  WHERE e2.department_id = e1.department_id
)
ORDER BY e1.department_id ASC, e1.salary DESC;
    `,
    checkOrder: true,
    hints: [
      'This requires a correlated subquery where the inner query references `e1.department_id`.',
      'The inner query: `SELECT AVG(e2.salary) FROM employees e2 WHERE e2.department_id = e1.department_id`.'
    ],
    explanation: `
For every row evaluated in \`e1\`, the database executes the correlated subquery to calculate that specific department's average salary. If the employee's compensation exceeds that average, the row is selected.
    `
  },

  {
    id: 'sql-16',
    moduleId: 'module-4',
    moduleTitle: '4. Subqueries & LeetCode Classics',
    title: 'Department Top Earners (LeetCode 184)',
    difficulty: 'Hard',
    tags: ['LeetCode 184', 'Subquery', 'JOIN'],
    interviewFrequency: 'Top 3 Placement Classic (Google, Uber, Microsoft)',
    description: `
Table: \`employees\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key |
| **first_name** | VARCHAR | Employee name |
| **salary** | INTEGER | Annual salary |
| **department_id** | INTEGER | Foreign key pointing to departments |

Table: \`departments\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** | INTEGER | Primary Key |
| **department_name** | VARCHAR | Department title |

---

Write a solution to find employees who have the **highest salary in each of the departments**.
Return:
- **\`Department\`**: Department name
- **\`Employee\`**: Employee's first name
- **\`Salary\`**: Employee's compensation

Order the result by **\`Salary\`** descending.

---

**Example 1**:

Input:
In Department 1 (Engineering): Peak is Vikram (145,000).
In Department 2 (Product): Peak is Priya (108,000).
In Department 3 (Data Science): Peak is Sneha (125,000).
In Department 4 (Marketing): Peak is Tanvi (85,000).

Output:
| Department | Employee | Salary |
| :--- | :--- | :--- |
| Engineering | Vikram | 145000 |
| Data Science | Sneha | 125000 |
| Product & Design | Priya | 108000 |
| Marketing & Sales | Tanvi | 85000 |
    `,
    setupSql: COMMON_SCHEMAS.hrCompany,
    starterSql: `-- LeetCode 184: Department Highest Salary
SELECT 
  d.department_name AS Department,
  e.first_name AS Employee,
  e.salary AS Salary
FROM employees e
INNER JOIN departments d ON e.department_id = d.id
WHERE (e.department_id, e.salary) IN (
  SELECT department_id, MAX(salary)
  FROM employees
  WHERE department_id IS NOT NULL
  GROUP BY department_id
)
ORDER BY e.salary DESC;`,
    expectedSql: `
SELECT 
  d.department_name AS Department,
  e.first_name AS Employee,
  e.salary AS Salary
FROM employees e
INNER JOIN departments d ON e.department_id = d.id
WHERE (e.department_id, e.salary) IN (
  SELECT department_id, MAX(salary)
  FROM employees
  WHERE department_id IS NOT NULL
  GROUP BY department_id
)
ORDER BY e.salary DESC;
    `,
    checkOrder: true,
    hints: [
      'In the subquery, calculate `MAX(salary)` grouped by `department_id`.',
      'Check if `(e.department_id, e.salary)` matches that pair.',
      'Join with `departments` to get the department name.'
    ],
    explanation: `
The subquery groups by \`department_id\` and extracts the peak salary for each department. The outer query matches pairs of \`(department_id, salary)\` and joins with \`departments\` to present the final report. If two employees share the top salary, both will be included correctly.
    `
  }
];

export function slugifyTitle(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getChallengeSlug(challenge) {
  if (!challenge) return '';
  if (challenge.slug) return challenge.slug;
  return slugifyTitle(challenge.title) || challenge.id;
}

export const SQL_CHALLENGES = [...BASE_CHALLENGES, ...DDL_CHALLENGES, ...DML_CHALLENGES, ...FILTERING_CHALLENGES, ...INSERT_CHALLENGES].map(c => ({
  ...c,
  slug: c.slug || slugifyTitle(c.title) || c.id
}));

// Helper functions for Admin custom challenge management
export function getStoredCustomChallenges() {
  try {
    const raw = localStorage.getItem('msc_custom_sql_challenges');
    const parsed = raw ? JSON.parse(raw) : [];
    return parsed.map(c => ({
      ...c,
      slug: c.slug || slugifyTitle(c.title) || c.id
    }));
  } catch (err) {
    console.error('Error loading custom SQL challenges from localStorage:', err);
    return [];
  }
}

export function saveCustomChallenge(newChallenge) {
  const existing = getStoredCustomChallenges();
  const challengeWithSlug = {
    ...newChallenge,
    slug: newChallenge.slug || slugifyTitle(newChallenge.title) || newChallenge.id
  };
  const idx = existing.findIndex(c => c.id === challengeWithSlug.id);
  let updated;
  if (idx >= 0) {
    updated = [...existing];
    updated[idx] = challengeWithSlug;
  } else {
    updated = [...existing, challengeWithSlug];
  }
  localStorage.setItem('msc_custom_sql_challenges', JSON.stringify(updated));
  return updated;
}

export function deleteCustomChallenge(id) {
  const existing = getStoredCustomChallenges();
  const updated = existing.filter(c => c.id !== id);
  localStorage.setItem('msc_custom_sql_challenges', JSON.stringify(updated));
  return updated;
}

