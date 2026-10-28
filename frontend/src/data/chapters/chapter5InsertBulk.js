// =========================================================================
// 📘 CHAPTER 6 (DAY 5): INSERT AND BULK DATA INGESTION
// =========================================================================

export const CHAPTER_5_METADATA = {
  id: 'mod-day5',
  number: 6,
  title: 'Day 5: INSERT and Bulk Data Ingestion',
  shortTitle: 'Day 5 • INSERT & Ingestion',
  status: 'available',
  badge: 'Day 5 • Live',
  releaseDate: 'Available Now',
  description: 'Master row-level data ingestion: Positional vs explicit column mapping, high-throughput multi-row batching (10x–50x speedup), INSERT INTO SELECT streaming, hands-on e-commerce lab schema setup, realistic seed data, and constraint traps (1062, 1452, 3819).',
  topics: [
    {
      id: 'top-day5-01',
      title: 'Day 5: Conceptual Deep-Dive & Architecture',
      lessonCode: '6.1',
      summary: 'Explore the role of DML, positional vs explicit syntax, single-row vs multi-row batching throughput gains, INSERT INTO SELECT, and default/auto-increment values.',
      estimatedTime: '25 min'
    },
    {
      id: 'top-day5-02',
      title: 'Hands-on Lab: schema.sql Setup',
      lessonCode: '6.2',
      summary: 'Set up the clean ecommerce_lab sandbox database with customers, products, orders, and order_items with strict PK, FK, and CHECK constraints.',
      estimatedTime: '20 min'
    },
    {
      id: 'top-day5-03',
      title: 'Practical Work: seed.sql (6 Ingestion Patterns)',
      lessonCode: '6.3',
      summary: 'Execute the 6 core data ingestion patterns: single-row, multi-row batching, relational order mapping, and direct table streaming into archives.',
      estimatedTime: '25 min'
    },
    {
      id: 'top-day5-04',
      title: 'Edge Cases & Constraint Traps (Errors 1062, 1452, 3819)',
      lessonCode: '6.4',
      summary: 'Deep-dive into MySQL constraint error codes: duplicate entry (1062), foreign key fails (1452), check constraint violated (3819), and positional hazards.',
      estimatedTime: '20 min'
    },
    {
      id: 'top-day5-05',
      title: 'Day 5 Practice Exercises & Sequence Checks',
      lessonCode: '6.5',
      summary: 'Hands-on exercises: Column variations, batch transactional atomicity in InnoDB, conditional INSERT SELECT, and LAST_INSERT_ID() inspection.',
      estimatedTime: '25 min'
    },
    {
      id: 'top-day5-questions-bank',
      title: '50 Practice Problems: INSERT & Ingestion (Part 1–8)',
      lessonCode: '6.6',
      summary: '50 categorized hands-on problems across 8 parts (Single-row, column order permutations, defaults & functions, batching, positional, INSERT INTO SELECT, upserts/ON DUPLICATE, edge cases).',
      estimatedTime: '45 min'
    }
  ]
};

export const CHAPTER_5_TOPICS = {
  // =========================================================================
  // LESSON 6.1: CONCEPTUAL DEEP-DIVE & ARCHITECTURE
  // =========================================================================
  'top-day5-01': {
    id: 'top-day5-01',
    chapterNumber: 6,
    lessonNumber: 1,
    lessonCode: '6.1',
    title: 'Day 5: INSERT and Bulk Data Ingestion',
    subtitle: 'The Role of DML, Positional vs Explicit Columns, Single-Row vs Multi-Row Batching & Engine Internals',
    intro: 'Data Manipulation Language (DML) handles data records within existing schema structures without altering table definitions. Unlike DDL statements which auto-commit and modify the system data dictionary, DML commands (INSERT, UPDATE, DELETE, SELECT) operate inside transactional boundaries that can be rolled back upon error. The fundamental write command is INSERT INTO.',

    infographicImage: '/assets/sql-insert-bulk-ingestion.jpg',
    infographicTitle: 'SQL INSERT & Bulk Data Ingestion Architecture',
    infographicCaption: 'Figure 5.1: High-Performance Data Ingestion Architecture — Explicit Column Mapping vs. Positional, Single-Row vs. Multi-Row Batching (10x–50x Throughput), Direct Table Streaming (INSERT INTO ... SELECT), and Engine Constraint Gates.',

    beginnerMentalModel: {
      title: "Noob Developer's Mental Model: Positional vs Explicit & Batching",
      analogy: 'Think of Positional INSERT like packing an unlabelled bento box where you blindly place food into slots by order. If the chef adds an extra divider tomorrow, dessert goes into the soup slot! Explicit Column INSERT is like reading the label on each compartment before placing food inside.',
      keyTrick: 'Always write the column list: INSERT INTO table (col1, col2) VALUES (...). Never rely on default column order in production backend applications.',
      gotcha: 'Executing 1,000 separate single-row INSERT statements causes 1,000 distinct transactions and WAL disk flushes. Combining them into one batch insert delivers a 10x–50x speedup!'
    },

    comparisonTable: {
      title: 'INSERT Ingestion Strategies Compared',
      badge: 'Architecture Matrix',
      headers: ['Ingestion Method', 'Syntax Structure', 'Throughput & Performance Impact'],
      rows: [
        {
          feature: 'Single-Row (Positional)',
          values: [
            'INSERT INTO table VALUES (v1, v2, v3);',
            'Fragile anti-pattern. Any ALTER TABLE column reordering or addition immediately breaks application writes.'
          ]
        },
        {
          feature: 'Single-Row (Explicit Columns)',
          values: [
            'INSERT INTO table (c1, c2) VALUES (v1, v2);',
            'Universal production standard for individual application mutations (e.g. user signup API endpoints).'
          ]
        },
        {
          feature: 'Multi-Row Batch Insert',
          values: [
            'INSERT INTO table (c1, c2) VALUES (r1_1, r1_2), (r2_1, r2_2);',
            '10x–50x faster ingestion. Commits multiple records in a single parser pass and one atomic WAL log flush.'
          ]
        },
        {
          feature: 'INSERT INTO ... SELECT',
          values: [
            'INSERT INTO archive (c1, c2) SELECT c1, c2 FROM live_table;',
            'Zero-copy server-side ETL pipeline. Moves or transforms records directly in database engine storage without network roundtrips.'
          ]
        }
      ]
    },

    sqlSteps: [
      {
        step: 1,
        title: 'Positional Insert (All Columns) — Discouraged in Production',
        badge: 'Positional Insert',
        explanation: 'Requires supplying a value for every single column in the exact positional sequence defined in the physical schema. If any column is added, removed, or reordered via ALTER TABLE, this query will immediately break or insert values into wrong columns.',
        code: `-- Positional Insert: Requires exact value for every column in exact schema order
INSERT INTO table_name
VALUES (val1, val2, val3, ...);`
      },
      {
        step: 2,
        title: 'Explicit Column Insert (Recommended Production Standard)',
        badge: 'Explicit Columns',
        explanation: 'Explicitly lists destination columns before VALUES. Missing columns automatically take their declared DEFAULT value, generate an AUTO_INCREMENT sequence, or insert NULL if allowed. Decouples application logic from schema changes.',
        code: `-- Explicit Column Insert: Production standard
INSERT INTO table_name (col1, col3)
VALUES (val1, val3);`
      },
      {
        step: 3,
        title: 'Single-Row Anti-Pattern vs Multi-Row Batch Ingestion',
        badge: 'Batch Ingestion',
        explanation: 'Executing 1,000 separate INSERT statements incurs 1,000 network roundtrips, 1,000 transaction locks, and 1,000 WAL disk flushes. In contrast, multi-row batching combines records into comma-separated tuples within a single statement, delivering a 10x–50x throughput speedup.',
        code: `-- Multi-Row (Batch) Insert: 1 statement, 1 transaction, 1 WAL flush
INSERT INTO table_name (col1, col2)
VALUES
  (val1_a, val2_a),
  (val1_b, val2_b),
  (val1_c, val2_c);`
      },
      {
        step: 4,
        title: 'Inserting from Existing Tables: INSERT INTO ... SELECT',
        badge: 'Direct Streaming',
        explanation: 'Enables moving or transforming data directly within the database engine without exporting bytes over the network to an application layer. Column data types and count in the SELECT clause must map directly to the target table columns.',
        code: `-- Server-side zero-copy table ingestion
INSERT INTO target_table (col1, col2)
SELECT source_col1, source_col2
FROM source_table
WHERE condition;`
      },
      {
        step: 5,
        title: 'Handling Default Values and AUTO_INCREMENT Sequences',
        badge: 'Identity & Defaults',
        explanation: 'For AUTO_INCREMENT, omit the column or supply NULL/DEFAULT to trigger the next sequence. For DEFAULT, omit the column or pass the explicit keyword DEFAULT.',
        code: `-- Omitting column or supplying DEFAULT keyword
INSERT INTO customers (first_name, last_name, email, status)
VALUES ('Alex', 'Smith', 'alex@example.com', DEFAULT);`
      }
    ],

    mistakes: [
      {
        title: 'Duplicate Key Violations (UNIQUE / PRIMARY KEY) — Error 1062',
        badCode: `-- Attempting to re-insert an existing unique email
INSERT INTO customers (first_name, last_name, email)
VALUES ('Aarav', 'Sharma', 'aarav.sharma@example.com');
-- Error Code: 1062. Duplicate entry 'aarav.sharma@example.com' for key 'customers.email'`,
        explanation: 'UNIQUE and PRIMARY KEY constraints reject duplicate entries. Remediation: verify uniqueness, use INSERT IGNORE, or employ ON DUPLICATE KEY UPDATE in MySQL.'
      },
      {
        title: 'Foreign Key Constraint Failures — Error 1452',
        badCode: `-- Attempting to insert an order for non-existent customer_id = 999
INSERT INTO orders (customer_id, status) VALUES (999, 'PENDING');
-- Error Code: 1452. Cannot add or update a child row: a foreign key constraint fails`,
        explanation: 'Foreign keys guarantee referential integrity. You cannot insert child records referencing non-existent parent primary keys.'
      },
      {
        title: 'Check Constraint Violations — Error 3819',
        badCode: `-- Attempting to insert a negative price violating CHECK (price >= 0)
INSERT INTO products (product_name, category, price, stock_qty)
VALUES ('Defective Desk', 'Furniture', -25.00, 10);
-- Error Code: 3819. Check constraint 'products_chk_1' is violated.`,
        explanation: 'CHECK constraints evaluate expressions upon every insert. Negative prices or invalid status strings are rejected at the engine level.'
      },
      {
        title: 'Positional Column Mapping Fragility in Backend Code',
        badCode: `-- Positional insert breaks when columns are added or reordered
INSERT INTO customers VALUES (1, 'Alex', 'Smith', 'alex@example.com', NOW(), 'ACTIVE');`,
        explanation: 'If an ALTER TABLE statement adds a new column, positional inserts will immediately throw column count mismatch errors in production.'
      }
    ],

    keyPoints: [
      'Data Manipulation Language (DML) manages data rows inside tables without modifying structure.',
      'Explicit column lists insulate your application code against downstream schema changes.',
      'Multi-row batch ingestion delivers 10x–50x speedups by combining records into a single atomic transaction.',
      'Server-side INSERT INTO ... SELECT enables high-speed data migration without network overhead.',
      'Database constraints act as immutable runtime guardrails against corrupt or orphan data.'
    ],

    note: 'Day 5 Engineering Rule: Use explicit column lists for backend application code, multi-row batching for high-throughput data loads, and server-side INSERT INTO SELECT for zero-copy archival pipelines.'
  },

  // =========================================================================
  // LESSON 6.2: HANDS-ON LAB: SCHEMA.SQL SETUP
  // =========================================================================
  'top-day5-02': {
    id: 'top-day5-02',
    chapterNumber: 6,
    lessonNumber: 2,
    lessonCode: '6.2',
    title: 'Hands-on Lab: schema.sql Setup',
    subtitle: 'Production Sandbox Environment with Primary Keys, Foreign Keys, and CHECK Constraints',
    intro: 'Before testing data ingestion strategies, we must establish a clean, production-grade schema. Run this script in MySQL Workbench or MySQL Command Line Client to prepare the 4 core relational tables of your e-commerce capstone.',

    setupGuide: [
      {
        step: 1,
        title: 'Create Clean Sandbox Database (ecommerce_lab)',
        description: 'Drop existing tables in reverse dependency order and create a fresh sandbox schema for testing.',
        code: `CREATE DATABASE IF NOT EXISTS ecommerce_lab;
USE ecommerce_lab;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;`,
        tip: 'Dropping child tables (order_items, orders) before parent tables (products, customers) prevents foreign key constraint drop errors.'
      },
      {
        step: 2,
        title: 'Create Customers Table with Primary & Unique Keys',
        description: 'Define the customers entity with AUTO_INCREMENT primary key and UNIQUE email constraint.',
        code: `CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(50) NOT NULL,
    last_name   VARCHAR(50) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    status      VARCHAR(20) DEFAULT 'ACTIVE'
);`
      },
      {
        step: 3,
        title: 'Create Products Table with CHECK Constraints',
        description: 'Enforce domain integrity with CHECK constraints verifying price >= 0 and stock_qty >= 0.',
        code: `CREATE TABLE products (
    product_id   INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category     VARCHAR(50) NOT NULL,
    price        DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_qty    INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0)
);`
      },
      {
        step: 4,
        title: 'Create Orders Table with Foreign Key Safeguard',
        description: 'Link orders to customers via customer_id with ON DELETE RESTRICT to protect historical order records.',
        code: `CREATE TABLE orders (
    order_id    INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date  DATETIME DEFAULT CURRENT_TIMESTAMP,
    status      VARCHAR(30) DEFAULT 'PENDING',
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON DELETE RESTRICT
);`
      },
      {
        step: 5,
        title: 'Create Order Items Table with Cascade & Domain Constraints',
        description: 'Junction table supporting line-item quantities with ON DELETE CASCADE when an order is deleted.',
        code: `CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id      INT NOT NULL,
    product_id    INT NOT NULL,
    quantity      INT NOT NULL CHECK (quantity > 0),
    unit_price    DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    CONSTRAINT fk_items_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_items_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE RESTRICT
);`
      }
    ],

    sqlSteps: [
      {
        step: 1,
        title: 'Execute Full schema.sql Script',
        badge: 'DDL Schema',
        explanation: 'Run the entire DDL script to generate the 4 relational tables inside MySQL Server.',
        code: `-- 1. Create a clean sandbox database
CREATE DATABASE IF NOT EXISTS ecommerce_lab;
USE ecommerce_lab;

-- 2. Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;

-- 3. Create tables with keys and constraints
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(50) NOT NULL,
    last_name   VARCHAR(50) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    status      VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE products (
    product_id  INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category     VARCHAR(50) NOT NULL,
    price        DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_qty    INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0)
);

CREATE TABLE orders (
    order_id    INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date  DATETIME DEFAULT CURRENT_TIMESTAMP,
    status      VARCHAR(30) DEFAULT 'PENDING',
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON DELETE RESTRICT
);

CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id      INT NOT NULL,
    product_id    INT NOT NULL,
    quantity      INT NOT NULL CHECK (quantity > 0),
    unit_price    DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    CONSTRAINT fk_items_order
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_items_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE RESTRICT
);`
      }
    ],

    keyPoints: [
      'Drop tables in reverse dependency order: order_items -> orders -> products -> customers.',
      'customer_id in orders is a Foreign Key referencing customers(customer_id).',
      'product_id in order_items is a Foreign Key referencing products(product_id).',
      'ON DELETE CASCADE removes order_items automatically when parent order is deleted.',
      'ON DELETE RESTRICT prevents deleting a customer who has existing orders.'
    ]
  },

  // =========================================================================
  // LESSON 6.3: PRACTICAL WORK: SEED.SQL (6 INGESTION PATTERNS)
  // =========================================================================
  'top-day5-03': {
    id: 'top-day5-03',
    chapterNumber: 6,
    lessonNumber: 3,
    lessonCode: '6.3',
    title: 'Practical Work: seed.sql (6 Ingestion Patterns)',
    subtitle: 'Single-Row, Multi-Row Batching, Relational Matching, and Internal ETL Streaming',
    intro: 'Execute these 6 data ingestion patterns in your ecommerce_lab sandbox to populate realistic records across all relational boundaries.',

    sqlSteps: [
      {
        step: 1,
        title: 'Pattern 1: Single-Row Insert Using Explicit Columns',
        badge: 'Explicit Columns',
        explanation: 'Explicitly specify the destination columns. Unspecified columns with defaults (such as created_at and status) or auto-incrementing identity keys (customer_id) are handled by the engine automatically.',
        code: `USE ecommerce_lab;

-- Pattern 1: Single-row insert using explicit columns
INSERT INTO customers (first_name, last_name, email)
VALUES ('Aarav', 'Sharma', 'aarav.sharma@example.com');`
      },
      {
        step: 2,
        title: 'Pattern 2: Multi-Row (Batch) Ingestion into Customers',
        badge: 'High Throughput',
        explanation: 'Combines multiple record tuples into a single statement separated by commas. Generates 1 network roundtrip, 1 parser pass, and 1 transaction log flush instead of 4 separate transactions.',
        code: `-- Pattern 2: Multi-row (batch) insert
INSERT INTO customers (first_name, last_name, email, status)
VALUES
    ('Diya', 'Patel', 'diya.patel@example.com', 'ACTIVE'),
    ('Rohan', 'Verma', 'rohan.verma@example.com', 'ACTIVE'),
    ('Ananya', 'Iyer', 'ananya.iyer@example.com', 'INACTIVE'),
    ('Kabir', 'Mehta', 'kabir.mehta@example.com', 'ACTIVE');`
      },
      {
        step: 3,
        title: 'Pattern 3: Batch Insert into Products Catalog',
        badge: 'Batch Catalog Load',
        explanation: 'Bulk populating the products catalog with categorized merchandise, price points, and initial inventory quantities.',
        code: `-- Pattern 3: Batch insert into products
INSERT INTO products (product_name, category, price, stock_qty)
VALUES
    ('Mechanical Keyboard', 'Electronics', 119.99, 45),
    ('Wireless Mouse', 'Electronics', 49.50, 120),
    ('Ergonomic Chair', 'Furniture', 289.00, 15),
    ('Standing Desk', 'Furniture', 450.00, 8),
    ('USB-C Hub', 'Electronics', 35.75, 80),
    ('Ceramic Coffee Mug', 'Kitchenware', 14.00, 200);`
      },
      {
        step: 4,
        title: 'Pattern 4: Relational Multi-Row Inserts into Orders',
        badge: 'Relational Matching',
        explanation: 'Create order records referencing valid customer_id values (1, 2, 3) established in previous steps, satisfying the foreign key constraint.',
        code: `-- Pattern 4: Relational multi-row inserts into orders
-- Referencing valid customer IDs (1, 2, 3)
INSERT INTO orders (customer_id, status, order_date)
VALUES
    (1, 'COMPLETED', '2026-10-15 10:30:00'),
    (2, 'PROCESSING', '2026-10-18 14:15:00'),
    (1, 'COMPLETED', '2026-10-20 09:00:00'),
    (3, 'CANCELLED', '2026-10-22 18:45:00');`
      },
      {
        step: 5,
        title: 'Pattern 5: Inserting Order Line Items with Explicit Pricing',
        badge: 'Junction Ingestion',
        explanation: 'Attach line items to active orders with historical unit prices captured at time of purchase, adhering to foreign key checks.',
        code: `-- Pattern 5: Inserting order line items with explicit pricing
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES
    (1, 1, 1, 119.99),
    (1, 2, 1, 49.50),
    (2, 3, 1, 289.00),
    (3, 5, 2, 35.75),
    (4, 6, 4, 14.00);`
      },
      {
        step: 6,
        title: 'Pattern 6: Bulk Ingestion via INSERT INTO ... SELECT',
        badge: 'Direct Table Streaming',
        explanation: 'Extract, transform, and load records directly between tables inside the engine without round-tripping data to an external application server.',
        code: `-- Pattern 6: Bulk Ingestion via INSERT INTO ... SELECT
-- Create an archival/staging table for inactive customers
CREATE TABLE IF NOT EXISTS archived_customers (
    archive_id  INT AUTO_INCREMENT PRIMARY KEY,
    original_id INT,
    full_name   VARCHAR(105),
    email       VARCHAR(100),
    archived_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Ingest into archive directly from customers table using SELECT
INSERT INTO archived_customers (original_id, full_name, email)
SELECT 
    customer_id, 
    CONCAT(first_name, ' ', last_name), 
    email
FROM customers
WHERE status = 'INACTIVE';

-- Verification Query
SELECT * FROM archived_customers;`
      }
    ],

    keyPoints: [
      'Pattern 1 demonstrates safe single-row inserts with explicit columns.',
      'Pattern 2 demonstrates high-throughput multi-row batching.',
      'Pattern 4 validates relational integrity referencing existing customer IDs (1, 2, 3).',
      'Pattern 5 captures point-in-time unit pricing on line items.',
      'Pattern 6 demonstrates server-side ETL streaming into archived_customers.'
    ]
  },

  // =========================================================================
  // LESSON 6.4: EDGE CASES & CONSTRAINT TRAPS
  // =========================================================================
  'top-day5-04': {
    id: 'top-day5-04',
    chapterNumber: 6,
    lessonNumber: 4,
    lessonCode: '6.4',
    title: 'Edge Cases & Constraint Traps (Errors 1062, 1452, 3819)',
    subtitle: 'Understanding MySQL Error Codes: 1062 (Duplicate Key), 1452 (Foreign Key), and 3819 (Check Constraint)',
    intro: 'Relational database engines enforce data integrity through strict constraint gates. When an insert violates a constraint, the database rejects the operation with an explicit error code.',

    mistakes: [
      {
        title: 'Duplicate Key Violations (UNIQUE / PRIMARY KEY) — Error 1062',
        badCode: `-- Attempting to re-insert an existing unique email
INSERT INTO customers (first_name, last_name, email)
VALUES ('Aarav', 'Sharma', 'aarav.sharma@example.com');
-- Error Code: 1062. Duplicate entry 'aarav.sharma@example.com' for key 'customers.email'`,
        explanation: 'UNIQUE and PRIMARY KEY constraints reject duplicate entries. Remediation: verify uniqueness, use INSERT IGNORE, or employ ON DUPLICATE KEY UPDATE in MySQL.'
      },
      {
        title: 'Foreign Key Constraint Failures — Error 1452',
        badCode: `-- Attempting to insert an order for non-existent customer_id = 999
INSERT INTO orders (customer_id, status) VALUES (999, 'PENDING');
-- Error Code: 1452. Cannot add or update a child row: a foreign key constraint fails`,
        explanation: 'Foreign keys guarantee referential integrity. You cannot insert child records referencing non-existent parent primary keys.'
      },
      {
        title: 'Check Constraint Violations — Error 3819',
        badCode: `-- Attempting to insert a negative price violating CHECK (price >= 0)
INSERT INTO products (product_name, category, price, stock_qty)
VALUES ('Defective Desk', 'Furniture', -25.00, 10);
-- Error Code: 3819. Check constraint 'products_chk_1' is violated.`,
        explanation: 'CHECK constraints evaluate expressions upon every insert. Negative prices or invalid status strings are rejected at the engine level.'
      },
      {
        title: 'Positional Column Mapping Fragility in Backend Code',
        badCode: `-- Positional insert breaks when columns are added or reordered
INSERT INTO customers VALUES (1, 'Alex', 'Smith', 'alex@example.com', NOW(), 'ACTIVE');`,
        explanation: 'If an ALTER TABLE statement adds a new column, positional inserts will immediately throw column count mismatch errors in production.'
      }
    ],

    keyPoints: [
      'Error Code 1062 indicates a UNIQUE or PRIMARY KEY collision.',
      'Error Code 1452 indicates a FOREIGN KEY failure (missing parent row).',
      'Error Code 3819 indicates a CHECK constraint violation.',
      'Never rely on positional inserts in production backend code.'
    ]
  },

  // =========================================================================
  // LESSON 6.5: DAY 5 PRACTICE EXERCISES & SEQUENCE CHECKS
  // =========================================================================
  'top-day5-05': {
    id: 'top-day5-05',
    chapterNumber: 6,
    lessonNumber: 5,
    lessonCode: '6.5',
    title: 'Day 5 Practice Exercises & Sequence Checks',
    subtitle: 'Hands-on Verification Exercises: Column Defaults, Batch Atomicity, Conditional Streaming, and LAST_INSERT_ID()',
    intro: 'Test your understanding of SQL data ingestion by executing these 4 hands-on verification exercises independently in MySQL Workbench.',

    sqlSteps: [
      {
        step: 1,
        title: 'Exercise 1 (Column Variations & Defaults)',
        badge: 'Exercise 1',
        explanation: 'Write an INSERT statement for the products table that only provides product_name, category, and price. Observe whether stock_qty receives its declared default value of 0 and product_id auto-increments.',
        code: `-- Exercise 1: Omitting stock_qty to test default constraint
INSERT INTO products (product_name, category, price)
VALUES ('Gaming Headset', 'Electronics', 79.99);

-- Verification:
SELECT product_id, product_name, price, stock_qty 
FROM products 
WHERE product_name = 'Gaming Headset';`
      },
      {
        step: 2,
        title: 'Exercise 2 (Batch Transactional Integrity in InnoDB)',
        badge: 'Exercise 2',
        explanation: 'Write a single multi-row INSERT statement for customers containing 3 rows where the 2nd row contains an already-existing email (diya.patel@example.com). Observe that the entire batch aborts atomically with zero rows inserted.',
        code: `-- Exercise 2: Testing batch atomicity upon constraint failure
INSERT INTO customers (first_name, last_name, email)
VALUES
    ('Vikram', 'Rao', 'vikram.rao@example.com'),
    ('Duplicate Diya', 'Patel', 'diya.patel@example.com'), -- Fails UNIQUE key
    ('Pooja', 'Nair', 'pooja.nair@example.com');

-- Result: Error Code 1062. Entire statement fails atomically.
-- Neither Vikram nor Pooja are inserted.`
      },
      {
        step: 3,
        title: 'Exercise 3 (Conditional INSERT ... SELECT)',
        badge: 'Exercise 3',
        explanation: 'Create a backup table high_value_products (product_id INT, product_name VARCHAR(100), price DECIMAL(10,2)). Populate it using INSERT INTO ... SELECT for all products with a price greater than 100.00.',
        code: `-- Exercise 3: Filtered table-to-table ingestion
CREATE TABLE IF NOT EXISTS high_value_products (
    product_id   INT,
    product_name VARCHAR(100),
    price        DECIMAL(10, 2)
);

INSERT INTO high_value_products (product_id, product_name, price)
SELECT product_id, product_name, price
FROM products
WHERE price > 100.00;

-- Verification:
SELECT * FROM high_value_products;`
      },
      {
        step: 4,
        title: 'Exercise 4 (Identity Generation with LAST_INSERT_ID())',
        badge: 'Exercise 4',
        explanation: 'Execute SELECT LAST_INSERT_ID(); immediately after inserting a new customer record to inspect the generated primary key sequence value for the active connection.',
        code: `-- Exercise 4: Capturing generated identity value
INSERT INTO customers (first_name, last_name, email)
VALUES ('Sneha', 'Kulkarni', 'sneha.k@example.com');

-- Retrieve the generated customer_id:
SELECT LAST_INSERT_ID() AS new_customer_id;`
      }
    ],

    keyPoints: [
      'Exercise 1 confirms that omitted columns automatically receive their schema DEFAULT value.',
      'Exercise 2 proves that multi-row INSERT statements in InnoDB are atomic: all rows succeed or all abort.',
      'Exercise 3 demonstrates how INSERT INTO ... SELECT filters and clones datasets in a single engine operation.',
      'Exercise 4 demonstrates how application backends capture generated primary keys using LAST_INSERT_ID().'
    ],

    note: 'Congratulations on completing Day 5! You have mastered the write side of SQL data manipulation.'
  },

  // =========================================================================
  // LESSON 6.6: 50 PRACTICE QUESTIONS BANK (PART 1–8)
  // =========================================================================
  'top-day5-questions-bank': {
    id: 'top-day5-questions-bank',
    chapterNumber: 6,
    lessonNumber: 6,
    lessonCode: '6.6',
    title: '50 Practice Problems: INSERT & Bulk Ingestion',
    isQuestionsBankTopic: true,
    questionBankType: 'insert'
  }
};
