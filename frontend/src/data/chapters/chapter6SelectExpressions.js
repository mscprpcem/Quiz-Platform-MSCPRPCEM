// =========================================================================
// CHAPTER 7: SELECT EXPRESSIONS, ALIASES, AND DISTINCT
// =========================================================================

export const CHAPTER_6_METADATA = {
  id: 'mod-06',
  number: 7,
  title: 'Chapter 7: SELECT Expressions, Aliases, and DISTINCT',
  shortTitle: 'Chapter 7: SELECT & Aliases',
  status: 'available',
  badge: 'Interactive Lab Active',
  releaseDate: 'Available Now',
  description: 'Master query projection and craftsmanship: The 8-step logical query processing order, SELECT * performance penalties, explicit column aliases (AS), calculated arithmetic expressions, string formatting, the NULL contagion rule, and deduplication with DISTINCT.',
  topics: [
    {
      id: 'top-ch07-01',
      title: 'Conceptual Deep-Dive: SELECT & Execution Order',
      lessonCode: '7.1',
      summary: 'Explore the 8-step logical query processing order (FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT), column projection vs SELECT *, aliases, calculated expressions, and DISTINCT.',
      estimatedTime: '25 min'
    },
    {
      id: 'top-ch07-02',
      title: 'Hands-On Lab Setup: schema_and_seed_ch07.sql',
      lessonCode: '7.2',
      summary: 'Set up the clean ecommerce_lab sandbox database with customers, products, orders, and order_items containing rich seed records, duplicate combinations, and NULL test cases.',
      estimatedTime: '20 min'
    },
    {
      id: 'top-ch07-03',
      title: 'Core Deliverable: 10 Chapter-07 Practice Queries (queries.sql)',
      lessonCode: '7.3',
      summary: 'Execute the 10 production practice queries: Selective projection, clean reporting aliases, GST tax calculation, margin percentage, COALESCE NULL handling, inventory valuation, CONCAT, and DISTINCT deduplication.',
      estimatedTime: '30 min'
    },
    {
      id: 'top-ch07-04',
      title: 'Common Pitfalls & Debugging Lab (Must-Test)',
      lessonCode: '7.4',
      summary: 'Diagnose and fix classic SQL traps: The missing comma alias trap, the WHERE alias trap (Error 1054), and Integer division (DIV) vs decimal division (/).',
      estimatedTime: '20 min'
    }
  ]
};

export const CHAPTER_6_TOPICS = {
  // =========================================================================
  // LESSON 7.1: CONCEPTUAL DEEP-DIVE & ARCHITECTURE
  // =========================================================================
  'top-ch07-01': {
    id: 'top-ch07-01',
    chapterNumber: 7,
    lessonNumber: 1,
    lessonCode: '7.1',
    title: 'Chapter 7: SELECT Expressions, Aliases, and DISTINCT',
    subtitle: 'The SELECT Clause, Logical Query Execution Order, Column Projection & Aliases',
    intro: 'When you write a SQL query, SELECT is the first word you type, but it is one of the last clauses the database engine actually executes. Understanding logical query processing order is the key to mastering alias visibility, index covering scans, and predictable expression calculations.',

    infographicImage: '/assets/sql-select-execution-order.jpg',
    infographicTitle: 'SQL Logical Query Execution Order & Projection Pipeline',
    infographicCaption: 'Figure 7.1: Written Syntax Order vs. Database Engine Execution Order (FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT), Covering Index Projection, and Alias Scope Boundaries.',

    beginnerMentalModel: {
      title: 'Mental Model: Written Order vs. Engine Execution Order',
      analogy: 'Writing SQL is like ordering at a sandwich shop: You say "I want turkey and cheese" (SELECT) before telling them what bread to slice it from (FROM). But the sandwich artist must pull out the loaf (FROM), filter out stale pieces (WHERE), prepare the ingredients (GROUP BY / HAVING), and only THEN assemble your chosen toppings (SELECT) and bag it for you (ORDER BY / LIMIT).',
      keyTrick: 'Because WHERE evaluates in Step 2 and SELECT evaluates in Step 5, you can never use a column alias inside a WHERE clause. However, ORDER BY runs in Step 7, so SELECT aliases are 100% valid in ORDER BY!',
      gotcha: 'SELECT * is an anti-pattern in production code. It prevents Covering Index scans in memory, wastes network bandwidth, and silently breaks application code when table columns are modified.'
    },

    comparisonTable: {
      title: 'Logical Query Processing Sequence',
      badge: 'Engine Execution Order',
      headers: ['Step', 'SQL Clause', 'Database Engine Action & Scope'],
      rows: [
        {
          feature: 'Step 1',
          values: ['FROM & JOIN', 'Identifies target tables and executes joins; pulls raw records into buffer pool.']
        },
        {
          feature: 'Step 2',
          values: ['WHERE', 'Filters out rows based on predicates. Column aliases DO NOT exist yet (Error 1054 if used!).']
        },
        {
          feature: 'Step 3',
          values: ['GROUP BY', 'Buckets the remaining rows into summary groups based on common categorical values.']
        },
        {
          feature: 'Step 4',
          values: ['HAVING', 'Filters the summary groups using aggregate expressions (e.g. HAVING COUNT(*) > 5).']
        },
        {
          feature: 'Step 5',
          values: ['SELECT', 'Projects requested columns, computes calculated expressions, and assigns column aliases.']
        },
        {
          feature: 'Step 6',
          values: ['DISTINCT', 'Eliminates duplicate rows from the projected intermediate result set.']
        },
        {
          feature: 'Step 7',
          values: ['ORDER BY', 'Sorts the final output records (SELECT column aliases ARE valid here!).']
        },
        {
          feature: 'Step 8',
          values: ['LIMIT / OFFSET', 'Restricts the number of returned rows before sending the payload over the network.']
        }
      ]
    },

    sqlSteps: [
      {
        step: 1,
        title: 'Column Projection vs. SELECT * (Covering Index Scanning)',
        badge: 'Projection',
        explanation: 'Projection selects only the vertical columns your application needs. SELECT * forces the engine to read the full table data pages from disk, whereas selecting specific columns (e.g. SELECT email FROM customers) can be served entirely from memory using a Covering Index.',
        code: `-- Recommended: Selective Column Projection
SELECT customer_id, first_name, email, city 
FROM customers;

-- Anti-Pattern for Production APIs: Full Table Disk Scan
SELECT * FROM customers;`
      },
      {
        step: 2,
        title: 'Column Aliases: Explicit AS vs Implicit & Multi-Word Syntax',
        badge: 'Aliases (AS)',
        explanation: 'Aliases give a temporary, human-readable label to a column or calculated expression. Always use explicit AS. If you omit the comma between two columns, MySQL treats the second column as an alias, returning only one column without any syntax error!',
        code: `-- Explicit AS: Clean and safe
SELECT 
    product_name AS "Product Title", 
    category AS "Department", 
    price AS "Retail Price ($)" 
FROM products;

-- Silent Trap: Missing comma makes last_name an alias for first_name!
SELECT first_name last_name FROM customers;`
      },
      {
        step: 3,
        title: 'Calculated Arithmetic Expressions & GST Tax Computation',
        badge: 'Arithmetic',
        explanation: 'Compute values on the fly using standard operators (+, -, *, /, DIV, %). Multiplication and division execute before addition and subtraction. Use parentheses () to make intent explicit: (price - discount) * 1.18.',
        code: `-- 18% GST tax and final taxed retail price
SELECT 
    product_name, 
    price AS base_price, 
    ROUND(price * 0.18, 2) AS gst_amount, 
    ROUND(price * 1.18, 2) AS final_taxed_price 
FROM products;`
      },
      {
        step: 4,
        title: 'Safe Arithmetic with NULL Handling (COALESCE)',
        badge: 'NULL Handling',
        explanation: 'The NULL Contagion Rule: Any mathematical operation with NULL returns NULL (100 - NULL = NULL). Wrap nullable columns in COALESCE(col, fallback) to prevent missing discounts from destroying your calculations.',
        code: `-- Demonstrating the NULL trap vs COALESCE fix
SELECT 
    product_name, 
    price, 
    discount AS raw_discount, 
    price - discount AS broken_null_math, -- Returns NULL if discount is NULL!
    price - COALESCE(discount, 0.00) AS effective_price 
FROM products;`
      },
      {
        step: 5,
        title: 'Deduplication with DISTINCT (Single vs Multi-Column Pairs)',
        badge: 'DISTINCT',
        explanation: 'DISTINCT removes duplicate rows from the final projected result set. Single-column DISTINCT returns unique values. Multi-column DISTINCT applies to the entire row combination, returning unique pairs.',
        code: `-- Single-Column Deduplication
SELECT DISTINCT city FROM customers;

-- Multi-Column Deduplication (Unique customer_id + status combinations)
SELECT DISTINCT customer_id, status FROM orders;`
      }
    ],

    mistakes: [
      {
        title: 'The WHERE Alias Trap (MySQL Error 1054)',
        badCode: `-- Throws Error Code 1054: Unknown column 'line_subtotal' in 'where clause'
SELECT order_id, (quantity * unit_price) AS line_subtotal
FROM order_items
WHERE line_subtotal > 100;`,
        explanation: 'Because WHERE (Step 2) executes before SELECT (Step 5), column aliases do not exist yet when WHERE is evaluated. Fix: Repeat the full expression in WHERE, or wrap the query inside a CTE/subquery.'
      },
      {
        title: 'The Missing Comma Alias Trap',
        badCode: `-- Missing comma between first_name and last_name
SELECT first_name last_name, email FROM customers;`,
        explanation: 'MySQL does NOT throw a syntax error. It silently treats last_name as the alias for first_name, returning only 2 columns instead of 3. Always use explicit AS to prevent silent bugs.'
      },
      {
        title: 'The NULL Contagion Trap in Mathematical Calculations',
        badCode: `-- If discount is NULL, the result is NULL
SELECT product_name, price - discount AS final_price FROM products;`,
        explanation: 'In SQL arithmetic, NULL propagates through every operation. Always wrap nullable columns with COALESCE(discount, 0) before applying subtraction or division.'
      }
    ]
  },

  // =========================================================================
  // LESSON 7.2: HANDS-ON LAB SETUP (schema_and_seed_ch07.sql)
  // =========================================================================
  'top-ch07-02': {
    id: 'top-ch07-02',
    chapterNumber: 7,
    lessonNumber: 2,
    lessonCode: '7.2',
    title: 'Hands-On Lab Setup: schema_and_seed_ch07.sql',
    subtitle: 'Database Initialization, E-Commerce Schema & Seed Data with NULL/Duplicate Test Cases',
    intro: 'Run this complete setup script in MySQL Workbench to establish the ecommerce_lab database with rich customers, products, orders, and order_items tables containing realistic duplicate combinations, discounts, and NULL values for testing.',

    beginnerMentalModel: {
      title: 'Lab Sandbox Objectives',
      analogy: 'A flight simulator must have turbulence, bad weather, and engine faults to train a pilot. Similarly, our seed database intentionally contains NULL discounts, duplicate cities, and pending orders so you can see edge cases firsthand.',
      keyTrick: 'Always run DROP TABLE in reverse dependency order: order_items first, then orders, products, and finally customers.',
      gotcha: 'Never run DROP TABLE scripts on a production database! Only run these inside your local sandbox environment.'
    },

    sqlSteps: [
      {
        step: 1,
        title: 'Create and Select Sandbox Database',
        badge: 'Database Init',
        explanation: 'Ensures the ecommerce_lab database exists and points your active session to it.',
        code: `CREATE DATABASE IF NOT EXISTS ecommerce_lab;
USE ecommerce_lab;`
      },
      {
        step: 2,
        title: 'Drop Existing Tables in Reverse Dependency Order',
        badge: 'Drop Tables',
        explanation: 'Child tables containing foreign keys (order_items, orders) must be dropped before parent tables (customers, products) to prevent constraint violations.',
        code: `DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;`
      },
      {
        step: 3,
        title: 'Create Tables with Constraints, Defaults, and Foreign Keys',
        badge: 'DDL Schema',
        explanation: 'Creates customers, products, orders, and order_items with strict primary keys, foreign keys, and default values.',
        code: `CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(50) NOT NULL,
    last_name   VARCHAR(50) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    city        VARCHAR(50),
    status      VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE products (
    product_id   INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category     VARCHAR(50) NOT NULL,
    cost_price   DECIMAL(10, 2) NOT NULL,
    price        DECIMAL(10, 2) NOT NULL,
    discount     DECIMAL(10, 2) DEFAULT NULL,
    stock_qty    INT NOT NULL DEFAULT 0
);

CREATE TABLE orders (
    order_id     INT AUTO_INCREMENT PRIMARY KEY,
    customer_id  INT NOT NULL,
    order_date   DATE NOT NULL,
    status       VARCHAR(30) DEFAULT 'PENDING',
    shipping_fee DECIMAL(10, 2) DEFAULT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id      INT NOT NULL,
    product_id    INT NOT NULL,
    quantity      INT NOT NULL,
    unit_price    DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);`
      },
      {
        step: 4,
        title: 'Seed Sandbox Tables with Test Records',
        badge: 'DML Seed Data',
        explanation: 'Seeds data containing duplicate cities (Mumbai, Bengaluru), NULL cities, NULL discounts, and duplicate customer order status combinations.',
        code: `-- Seed Customers
INSERT INTO customers (first_name, last_name, email, city, status) VALUES
('Aarav', 'Sharma', 'aarav@example.com', 'Mumbai', 'ACTIVE'),
('Diya', 'Patel', 'diya@example.com', 'Mumbai', 'ACTIVE'),
('Rohan', 'Verma', 'rohan@example.com', 'Delhi', 'INACTIVE'),
('Ananya', 'Iyer', 'ananya@example.com', 'Bengaluru', 'ACTIVE'),
('Kabir', 'Mehta', 'kabir@example.com', NULL, 'PENDING'),
('Sneha', 'Nair', 'sneha@example.com', 'Bengaluru', 'INACTIVE');

-- Seed Products (includes NULL discounts)
INSERT INTO products (product_name, category, cost_price, price, discount, stock_qty) VALUES
('Mechanical Keyboard', 'Electronics', 70.00, 120.00, 10.00, 45),
('Wireless Mouse', 'Electronics', 20.00, 50.00, NULL, 120),
('Ergonomic Chair', 'Furniture', 150.00, 290.00, 25.00, 15),
('Standing Desk', 'Furniture', 250.00, 450.00, NULL, 8),
('USB-C Hub', 'Electronics', 15.00, 36.00, 4.00, 80),
('Ceramic Coffee Mug', 'Kitchenware', 4.00, 14.00, NULL, 200),
('LED Desk Lamp', 'Electronics', 12.00, 28.00, 3.00, 0);

-- Seed Orders
INSERT INTO orders (customer_id, order_date, status, shipping_fee) VALUES
(1, '2026-10-10', 'COMPLETED', 5.00),
(1, '2026-10-15', 'COMPLETED', 0.00),
(1, '2026-10-20', 'PENDING', NULL),
(2, '2026-10-18', 'PROCESSING', 10.00),
(3, '2026-10-22', 'CANCELLED', NULL),
(4, '2026-10-25', 'COMPLETED', 5.00);

-- Seed Order Items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 120.00),
(1, 2, 2, 50.00),
(2, 3, 1, 290.00),
(3, 5, 3, 36.00),
(4, 4, 1, 450.00),
(5, 6, 4, 14.00),
(6, 1, 2, 110.00);`
      }
    ]
  },

  // =========================================================================
  // LESSON 7.3: CORE DELIVERABLE: 10 CHAPTER-07 PRACTICE QUERIES
  // =========================================================================
  'top-ch07-03': {
    id: 'top-ch07-03',
    chapterNumber: 7,
    lessonNumber: 3,
    lessonCode: '7.3',
    title: 'Core Deliverable: 10 Chapter-07 Practice Queries (queries.sql)',
    subtitle: 'Hands-On Problem Statements, Production Queries, and Analytical Output',
    intro: 'Master these 10 core practice queries demonstrating selective projection, multi-word aliases, GST tax calculation, margin percentages, NULL handling with COALESCE, inventory valuation, CONCAT formatting, and DISTINCT deduplication.',

    beginnerMentalModel: {
      title: 'Practice Query Execution Strategy',
      analogy: 'Think of writing queries like preparing a financial executive report. Raw database tables contain internal system IDs and raw numbers; your job in SELECT is to calculate meaningful metrics, format currency labels, and deduplicate lists.',
      keyTrick: 'Always verify calculations by checking the raw input columns alongside the computed output column (e.g. price, discount, AND net_price together).',
      gotcha: 'Never assume a column has no NULLs unless declared NOT NULL in the table schema. Always use COALESCE when doing arithmetic on optional columns.'
    },

    sqlSteps: [
      {
        step: 1,
        title: 'Query 1: Selective Column Projection',
        badge: 'Query 1',
        explanation: 'Problem: Retrieve only the customer_id, first_name, email, and city of all customers without using SELECT *.',
        code: `SELECT customer_id, first_name, email, city 
FROM customers;`
      },
      {
        step: 2,
        title: 'Query 2: Clean Reporting Headers with Multi-Word Aliases',
        badge: 'Query 2',
        explanation: 'Problem: Display product_name as "Product Title", category as "Department", and price as "Retail Price ($)".',
        code: `SELECT 
    product_name AS "Product Title", 
    category AS "Department", 
    price AS "Retail Price ($)" 
FROM products;`
      },
      {
        step: 3,
        title: 'Query 3: Percentage Increase Calculation (18% GST Tax Application)',
        badge: 'Query 3',
        explanation: 'Problem: Calculate an 18% GST tax amount and the final tax-inclusive price for every product, rounded to 2 decimal places.',
        code: `SELECT 
    product_name, 
    price AS base_price, 
    ROUND(price * 0.18, 2) AS gst_amount, 
    ROUND(price * 1.18, 2) AS final_taxed_price 
FROM products;`
      },
      {
        step: 4,
        title: 'Query 4: Gross Profit & Margin Percentage Expression',
        badge: 'Query 4',
        explanation: 'Problem: Using price and cost_price, calculate unit profit (price - cost_price) and markup percentage (((price - cost_price) / cost_price) * 100) rounded to 2 decimals.',
        code: `SELECT 
    product_name, 
    cost_price, 
    price AS selling_price, 
    (price - cost_price) AS unit_profit, 
    ROUND(((price - cost_price) / cost_price) * 100, 2) AS markup_percentage 
FROM products;`
      },
      {
        step: 5,
        title: 'Query 5: Safe Arithmetic with NULL Handling (COALESCE)',
        badge: 'Query 5',
        explanation: 'Problem: Calculate the effective selling price of each product by subtracting discount from price. Ensure products with a NULL discount still return regular price instead of NULL.',
        code: `SELECT 
    product_name, 
    price, 
    discount AS raw_discount, 
    price - discount AS broken_null_math, -- Demonstrates the NULL trap!
    price - COALESCE(discount, 0.00) AS effective_price 
FROM products;`
      },
      {
        step: 6,
        title: 'Query 6: Inventory Valuation & Potential Revenue',
        badge: 'Query 6',
        explanation: 'Problem: Calculate total capital tied up in stock (stock_qty * cost_price) and total potential retail revenue (stock_qty * price) for each product.',
        code: `SELECT 
    product_name, 
    stock_qty, 
    (stock_qty * cost_price) AS inventory_cost_value, 
    (stock_qty * price) AS potential_retail_revenue, 
    (stock_qty * (price - cost_price)) AS potential_profit 
FROM products;`
      },
      {
        step: 7,
        title: 'Query 7: Order Line-Item Subtotal & Taxed Total',
        badge: 'Query 7',
        explanation: 'Problem: From order_items, display order_id, product_id, quantity, unit_price, line_subtotal (quantity * unit_price), and line_total_with_tax (adding 10% tax).',
        code: `SELECT 
    order_id, 
    product_id, 
    quantity, 
    unit_price, 
    (quantity * unit_price) AS line_subtotal, 
    ROUND((quantity * unit_price) * 1.10, 2) AS line_total_with_tax 
FROM order_items;`
      },
      {
        step: 8,
        title: 'Query 8: String Expressions & Formatting (CONCAT)',
        badge: 'Query 8',
        explanation: 'Problem: Generate a formatted customer contact badge in the format "Aarav Sharma <aarav@example.com>" aliased as customer_contact, alongside their uppercase status.',
        code: `SELECT 
    customer_id, 
    CONCAT(first_name, ' ', last_name, ' <', email, '>') AS customer_contact, 
    UPPER(status) AS account_state 
FROM customers;`
      },
      {
        step: 9,
        title: 'Query 9: Single-Column Deduplication (DISTINCT)',
        badge: 'Query 9',
        explanation: 'Problem: Retrieve a deduplicated list of all cities where customers are located (observe how NULL is included once).',
        code: `SELECT DISTINCT city 
FROM customers;`
      },
      {
        step: 10,
        title: 'Query 10: Multi-Column Deduplication (DISTINCT Combinations)',
        badge: 'Query 10',
        explanation: 'Problem: Retrieve all unique combinations of customer_id and status from the orders table so duplicate COMPLETED orders by Customer 1 collapse into a single row.',
        code: `SELECT DISTINCT customer_id, status 
FROM orders;`
      }
    ]
  },

  // =========================================================================
  // LESSON 7.4: COMMON PITFALLS & DEBUGGING LAB
  // =========================================================================
  'top-ch07-04': {
    id: 'top-ch07-04',
    chapterNumber: 7,
    lessonNumber: 4,
    lessonCode: '7.4',
    title: 'Common Pitfalls & Debugging Lab (Must-Test)',
    subtitle: 'Classic Interview Traps: Missing Commas, WHERE Alias Resolution & Integer Division',
    intro: 'Run these 3 essential debugging test cases in MySQL Workbench to witness how the relational engine responds to common developer mistakes and learn production-grade resolutions.',

    beginnerMentalModel: {
      title: 'Debugging Mindset',
      analogy: 'SQL engines are deterministic compilers: When an error occurs (like Error 1054), it is not a flaw in MySQL, but a consequence of execution order. Understanding that WHERE executes before SELECT makes the solution immediately intuitive.',
      keyTrick: 'If you need to filter on a calculated expression, either repeat the expression in WHERE, or use a Common Table Expression (WITH clause) or derived table.',
      gotcha: 'In MySQL, the / operator always yields a floating-point decimal. If you need whole integer buckets, use the DIV operator.'
    },

    sqlSteps: [
      {
        step: 1,
        title: 'The Missing Comma Trap (Silent Aliasing)',
        badge: 'Trap 1',
        explanation: 'When you forget a comma between two column names, MySQL does not fail! It treats the second column as an alias for the first column.',
        code: `-- Notice there is NO comma between first_name and last_name!
SELECT first_name last_name, email FROM customers;

-- Result: Only 2 columns return! first_name values are displayed under the header 'last_name'.`
      },
      {
        step: 2,
        title: 'The WHERE Alias Trap (Error Code 1054)',
        badge: 'Trap 2',
        explanation: 'Referencing a SELECT alias in WHERE fails because WHERE executes before SELECT. The fix is to repeat the calculation in WHERE, or sort on the alias in ORDER BY.',
        code: `-- Fails with Error Code 1054: Unknown column 'line_subtotal' in 'where clause'
-- SELECT order_id, (quantity * unit_price) AS line_subtotal
-- FROM order_items
-- WHERE line_subtotal > 100;

-- Production Fix: Repeat expression in WHERE, use alias in ORDER BY
SELECT order_id, (quantity * unit_price) AS line_subtotal
FROM order_items
WHERE (quantity * unit_price) > 100
ORDER BY line_subtotal DESC;`
      },
      {
        step: 3,
        title: 'Integer Division (DIV) vs Decimal Division (/) vs Modulo (%)',
        badge: 'Trap 3',
        explanation: 'The / operator always returns a decimal float. The DIV operator truncates the decimal part, returning integer packages. The % or MOD operator returns remaining units.',
        code: `-- Comparing Division Operators in MySQL
SELECT 
    product_name, 
    stock_qty, 
    stock_qty / 10 AS exact_decimal_boxes, 
    stock_qty DIV 10 AS full_boxes_of_10, 
    stock_qty % 10 AS leftover_loose_units 
FROM products;`
      }
    ]
  }
};

