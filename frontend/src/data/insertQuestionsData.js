// =============================================================================
// 📘 50 INSERT & BULK INGESTION PRACTICE QUESTIONS DATA 
// Target Database: ecommerce_day5_lab
// Tables: customers, products, orders, order_items, product_catalog_backup,
//         marketing_leads, out_of_stock_alerts, order_financial_snapshots
// =============================================================================

export const DAY5_ECOMMERCE_SETUP_SQL = `CREATE TABLE IF NOT EXISTS customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name  TEXT NOT NULL,
    last_name   TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
    status      TEXT DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS products (
    product_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    category     TEXT NOT NULL,
    price        REAL NOT NULL CHECK (price >= 0),
    stock_qty    INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0)
);

CREATE TABLE IF NOT EXISTS orders (
    order_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    order_date  TEXT DEFAULT CURRENT_TIMESTAMP,
    status      TEXT DEFAULT 'PENDING',
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id      INTEGER NOT NULL,
    product_id    INTEGER NOT NULL,
    quantity      INTEGER NOT NULL CHECK (quantity > 0),
    unit_price    REAL NOT NULL CHECK (unit_price >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE IF NOT EXISTS product_catalog_backup (
    product_id   INTEGER,
    product_name TEXT,
    price        REAL
);

CREATE TABLE IF NOT EXISTS marketing_leads (
    lead_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_email    TEXT UNIQUE,
    lead_name     TEXT,
    source_status TEXT
);

CREATE TABLE IF NOT EXISTS out_of_stock_alerts (
    alert_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id   INTEGER,
    product_name TEXT,
    detected_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_financial_snapshots (
    order_id      INTEGER PRIMARY KEY,
    total_revenue REAL
);

-- Initial seed data for visual inspection and reference
INSERT OR IGNORE INTO customers (customer_id, first_name, last_name, email, created_at, status) VALUES
    (1, 'Anita', 'Desai', 'anita.d@store.com', '2026-10-01 10:00:00', 'ACTIVE'),
    (2, 'Rohan', 'Mehta', 'rohan.m@store.com', '2026-10-02 11:30:00', 'ACTIVE'),
    (3, 'Kiran', 'Bedi', 'kiran.b@store.com', '2026-10-03 14:15:00', 'ACTIVE'),
    (4, 'Sunil', 'Gavaskar', 'sunil.g@store.com', '2026-10-04 16:45:00', 'SUSPENDED'),
    (5, 'Deepak', 'Verma', 'deepak.v@store.com', '2026-10-05 09:20:00', 'ACTIVE');

INSERT OR IGNORE INTO products (product_id, product_name, category, price, stock_qty) VALUES
    (1, 'Desk Lamp', 'Electronics', 24.99, 50),
    (2, 'Monitor Stand', 'Furniture', 39.50, 25),
    (3, 'Gel Pens (Pack of 10)', 'Stationery', 19.99, 100),
    (4, 'Ultra-Wide Monitor', 'Electronics', 599.00, 12),
    (5, 'Noise-Cancelling Headphones', 'Electronics', 149.99, 0),
    (6, 'Accessory Bundle', 'Electronics', 64.50, 40),
    (7, 'Notebook Spiral', 'Stationery', 4.50, 300),
    (8, 'Correction Tape', 'Stationery', 2.25, 150),
    (9, 'Stapler Heavy Duty', 'Stationery', 12.00, 80),
    (10, 'Bluetooth Adapter', 'Electronics', 15.99, 120);

INSERT OR IGNORE INTO orders (order_id, customer_id, order_date, status) VALUES
    (1, 1, '2026-10-10 09:00:00', 'COMPLETED'),
    (2, 2, '2026-10-11 10:15:00', 'COMPLETED'),
    (3, 3, '2026-10-12 14:30:00', 'PROCESSING'),
    (4, 1, '2026-10-13 16:00:00', 'SHIPPED'),
    (5, 5, '2026-10-13 18:00:00', 'CANCELLED'),
    (6, 2, '2026-10-14 11:00:00', 'COMPLETED'),
    (7, 3, '2026-10-15 13:20:00', 'COMPLETED'),
    (8, 1, '2026-10-16 15:45:00', 'PROCESSING'),
    (9, 5, '2026-10-25 15:45:00', 'PENDING');

INSERT OR IGNORE INTO order_items (order_item_id, order_id, product_id, quantity, unit_price) VALUES
    (1, 1, 1, 2, 24.99),
    (2, 2, 2, 1, 35.00),
    (3, 3, 3, 3, 19.99),
    (4, 4, 4, 1, 539.10),
    (5, 5, 1, 1, 24.99),
    (6, 5, 2, 2, 39.50),
    (7, 5, 7, 4, 4.50),
    (8, 6, 4, 1, 599.00),
    (9, 6, 10, 5, 15.00),
    (10, 7, 6, 1, 64.50),
    (11, 8, 8, 3, 2.25);`;

export const INSERT_SECTIONS = [
  { id: 'all', label: 'All 50 Problems' },
  { id: 'part-1', label: 'Part 1: Single-Row Explicit (Q1–8)' },
  { id: 'part-2', label: 'Part 2: Column Permutations (Q9–14)' },
  { id: 'part-3', label: 'Part 3: Defaults & Expressions (Q15–20)' },
  { id: 'part-4', label: 'Part 4: Multi-Row Batching (Q21–28)' },
  { id: 'part-5', label: 'Part 5: Positional Inserts (Q29–33)' },
  { id: 'part-6', label: 'Part 6: INSERT ... SELECT (Q34–42)' },
  { id: 'part-7', label: 'Part 7: Upserts & ON DUPLICATE (Q43–47)' },
  { id: 'part-8', label: 'Part 8: Advanced Edge Cases (Q48–50)' }
];

export const INSERT_QUESTIONS_DATA = [
  // ── PART 1: SINGLE-ROW INSERTS WITH EXPLICIT COLUMNS (Q1–Q8) ──
  {
    id: 1,
    section: 'part-1',
    sectionTitle: 'Part 1: Single-Row Explicit Columns',
    targetTable: 'customers',
    difficulty: 'Easy',
    challengeId: 'insert-01',
    question: "Register a new customer named Priya Nair with email priya.nair@example.com.",
    task: "Register a new customer named Priya Nair with email priya.nair@example.com. Do not pass values for customer_id, created_at, or status so schema defaults and auto-increment apply.",
    sql: `INSERT INTO customers (first_name, last_name, email)\nVALUES ('Priya', 'Nair', 'priya.nair@example.com');`,
    explanation: "Omitting customer_id triggers AUTO_INCREMENT; created_at receives CURRENT_TIMESTAMP; status defaults to 'ACTIVE'."
  },
  {
    id: 2,
    section: 'part-1',
    sectionTitle: 'Part 1: Single-Row Explicit Columns',
    targetTable: 'products',
    difficulty: 'Basic',
    challengeId: 'insert-02',
    question: "Add a product called 'Desk Lamp' to the 'Electronics' category.",
    task: "Add a product called 'Desk Lamp' to the 'Electronics' category with a price of $24.99 and an initial stock quantity of 50.",
    sql: `INSERT INTO products (product_name, category, price, stock_qty)\nVALUES ('Desk Lamp', 'Electronics', 24.99, 50);`,
    explanation: "Explicitly populates all 4 non-identity columns in products table while product_id auto-increments."
  },
  {
    id: 3,
    section: 'part-1',
    sectionTitle: 'Part 1: Single-Row Explicit Columns',
    targetTable: 'orders',
    difficulty: 'Basic',
    challengeId: 'insert-03',
    question: "Create an order for the customer whose ID is 1 with status 'PENDING'.",
    task: "Create an order for the customer whose ID is 1, marking the order status as 'PENDING'.",
    sql: `INSERT INTO orders (customer_id, status)\nVALUES (1, 'PENDING');`,
    explanation: "Customer 1 exists from Problem 1, satisfying the foreign key constraint fk_orders_customer."
  },
  {
    id: 4,
    section: 'part-1',
    sectionTitle: 'Part 1: Single-Row Explicit Columns',
    targetTable: 'order_items',
    difficulty: 'Basic',
    challengeId: 'insert-04',
    question: "Add line-item details to order 1 for product 1.",
    task: "Add line-item details to order 1 for product 1, purchasing a quantity of 2 units at $24.99 each.",
    sql: `INSERT INTO order_items (order_id, product_id, quantity, unit_price)\nVALUES (1, 1, 2, 24.99);`,
    explanation: "Links order 1 and product 1 through junction table order_items with explicit point-in-time price."
  },
  {
    id: 5,
    section: 'part-1',
    sectionTitle: 'Part 1: Single-Row Explicit Columns',
    targetTable: 'customers',
    difficulty: 'Basic',
    challengeId: 'insert-05',
    question: "Insert customer Rahul Dravid with email rahul.d@example.com.",
    task: "Insert a customer named Rahul Dravid (rahul.d@example.com) while explicitly providing 'ACTIVE' for the status column.",
    sql: `INSERT INTO customers (first_name, last_name, email, status)\nVALUES ('Rahul', 'Dravid', 'rahul.d@example.com', 'ACTIVE');`,
    explanation: "Explicitly passes the status value rather than relying on schema default."
  },
  {
    id: 6,
    section: 'part-1',
    sectionTitle: 'Part 1: Single-Row Explicit Columns',
    targetTable: 'products',
    difficulty: 'Basic',
    challengeId: 'insert-06',
    question: "Add an item named 'Monitor Stand' categorized under 'Furniture'.",
    task: "Add an item named 'Monitor Stand' categorized under 'Furniture' with a price of $39.50 and 25 units in stock.",
    sql: `INSERT INTO products (product_name, category, price, stock_qty)\nVALUES ('Monitor Stand', 'Furniture', 39.50, 25);`,
    explanation: "Creates product ID 2 with category Furniture satisfying CHECK (price >= 0)."
  },
  {
    id: 7,
    section: 'part-1',
    sectionTitle: 'Part 1: Single-Row Explicit Columns',
    targetTable: 'orders',
    difficulty: 'Basic',
    challengeId: 'insert-07',
    question: "Log a backdated order for customer 2 with status 'COMPLETED'.",
    task: "Log an order for customer 2 backdated to October 1, 2026 at 11:20:00 AM ('2026-10-01 11:20:00') with the status 'COMPLETED'.",
    sql: `INSERT INTO orders (customer_id, status, order_date)\nVALUES (2, 'COMPLETED', '2026-10-01 11:20:00');`,
    explanation: "Explicit order_date overrides the default CURRENT_TIMESTAMP."
  },
  {
    id: 8,
    section: 'part-1',
    sectionTitle: 'Part 1: Single-Row Explicit Columns',
    targetTable: 'order_items',
    difficulty: 'Basic',
    challengeId: 'insert-08',
    question: "Record a discounted line item for order 2 and product 2.",
    task: "Record a line item for order 2 and product 2 with quantity 1, overriding the standard unit price with a discounted value of $35.00.",
    sql: `INSERT INTO order_items (order_id, product_id, quantity, unit_price)\nVALUES (2, 2, 1, 35.00);`,
    explanation: "Stores transaction-specific unit price without mutating the catalog product price."
  },

  // ── PART 2: COLUMN ORDER VARIATIONS & PERMUTATIONS (Q9–Q14) ──
  {
    id: 9,
    section: 'part-2',
    sectionTitle: 'Part 2: Column Permutations',
    targetTable: 'customers',
    difficulty: 'Basic',
    challengeId: 'insert-09',
    question: "Insert a customer starting declaration order with email, last_name, first_name.",
    task: "Insert a customer where the column declaration order starts with email, followed by last_name, then first_name ('vikram.s@example.com', 'Seth', 'Vikram').",
    sql: `INSERT INTO customers (email, last_name, first_name)\nVALUES ('vikram.s@example.com', 'Seth', 'Vikram');`,
    explanation: "Demonstrates that values bind to the explicitly specified column list order, not table definition order."
  },
  {
    id: 10,
    section: 'part-2',
    sectionTitle: 'Part 2: Column Permutations',
    targetTable: 'products',
    difficulty: 'Easy',
    challengeId: 'insert-10',
    question: "Insert a product placing price and stock_qty ahead of category and product_name.",
    task: "Insert a stationery product ('Gel Pens (Pack of 10)') by placing the price and stock_qty columns ahead of category and product_name in the insert statement ($19.99, 100 stock).",
    sql: `INSERT INTO products (price, stock_qty, category, product_name)\nVALUES (19.99, 100, 'Stationery', 'Gel Pens (Pack of 10)');`,
    explanation: "Reorders numeric columns ahead of textual columns successfully."
  },
  {
    id: 11,
    section: 'part-2',
    sectionTitle: 'Part 2: Column Permutations',
    targetTable: 'orders',
    difficulty: 'Easy',
    challengeId: 'insert-11',
    question: "Create an order for customer 3 listing status before customer_id.",
    task: "Create an order for customer 3 by listing the status column ('PROCESSING') before the customer_id column.",
    sql: `INSERT INTO orders (status, customer_id)\nVALUES ('PROCESSING', 3);`,
    explanation: "Correctly maps values matching the custom column sequence: status then customer_id."
  },
  {
    id: 12,
    section: 'part-2',
    sectionTitle: 'Part 2: Column Permutations',
    targetTable: 'order_items',
    difficulty: 'Easy',
    challengeId: 'insert-12',
    question: "Insert an order item structuring columns in reverse: unit_price, quantity, product_id, order_id.",
    task: "Insert an item record into order 3 for product 3 with quantity 3 at $19.99 each, structuring the column list in reverse: unit_price, quantity, product_id, order_id.",
    sql: `INSERT INTO order_items (unit_price, quantity, product_id, order_id)\nVALUES (19.99, 3, 3, 3);`,
    explanation: "Reversed column ordering functions identically provided the VALUES tuple mirrors the declaration."
  },
  {
    id: 13,
    section: 'part-2',
    sectionTitle: 'Part 2: Column Permutations',
    targetTable: 'customers',
    difficulty: 'Easy',
    challengeId: 'insert-13',
    question: "Insert a customer with columns: status, email, first_name, last_name.",
    task: "Insert a customer with first_name Suresh, last_name K, email suresh.k@example.com, and status 'SUSPENDED', specifying the columns in this order: status, email, first_name, last_name.",
    sql: `INSERT INTO customers (status, email, first_name, last_name)\nVALUES ('SUSPENDED', 'suresh.k@example.com', 'Suresh', 'K');`,
    explanation: "Enforces custom status value while altering typical column order."
  },
  {
    id: 14,
    section: 'part-2',
    sectionTitle: 'Part 2: Column Permutations',
    targetTable: 'products',
    difficulty: 'Easy',
    challengeId: 'insert-14',
    question: "Insert an 'Ultra-Wide Monitor' with stock_qty first and category last.",
    task: "Insert an 'Ultra-Wide Monitor' into the 'Electronics' category with price $599.00 and stock 12, listing stock_qty first and category last.",
    sql: `INSERT INTO products (stock_qty, price, product_name, category)\nVALUES (12, 599.00, 'Ultra-Wide Monitor', 'Electronics');`,
    explanation: "Arbitrary column permutation validates that MySQL matches positional VALUES directly to declared columns."
  },

  // ── PART 3: HANDLING DEFAULTS, EXPRESSIONS & SYSTEM FUNCTIONS (Q15–Q20) ──
  {
    id: 15,
    section: 'part-3',
    sectionTitle: 'Part 3: Defaults & Expressions',
    targetTable: 'customers',
    difficulty: 'Easy',
    challengeId: 'insert-15',
    question: "Insert customer Meera Sen using explicit keyword DEFAULT for status.",
    task: "Insert a new customer (Meera Sen, meera.sen@example.com) using the explicit SQL keyword DEFAULT to populate the status column.",
    sql: `INSERT INTO customers (first_name, last_name, email, status)\nVALUES ('Meera', 'Sen', 'meera.sen@example.com', DEFAULT);`,
    explanation: "Using the DEFAULT keyword explicitly requests the column's defined default value ('ACTIVE')."
  },
  {
    id: 16,
    section: 'part-3',
    sectionTitle: 'Part 3: Defaults & Expressions',
    targetTable: 'products',
    difficulty: 'Easy',
    challengeId: 'insert-16',
    question: "Insert 'Noise-Cancelling Headphones', omitting stock_qty to trigger default (0).",
    task: "Insert a product named 'Noise-Cancelling Headphones' categorized under 'Electronics' for $149.99, omitting the stock_qty column so the schema default (0) is applied automatically.",
    sql: `INSERT INTO products (product_name, category, price)\nVALUES ('Noise-Cancelling Headphones', 'Electronics', 149.99);`,
    explanation: "Omitting columns with default values cleanly populates them with their schema-defined fallback."
  },
  {
    id: 17,
    section: 'part-3',
    sectionTitle: 'Part 3: Defaults & Expressions',
    targetTable: 'customers',
    difficulty: 'Easy',
    challengeId: 'insert-17',
    question: "Insert customer Amit Kumar with dynamically generated lowercase email.",
    task: "Insert a customer named Amit Kumar where the email is dynamically generated by concatenating his lowercase names with '@example.com'.",
    sql: `INSERT INTO customers (first_name, last_name, email)\nVALUES ('Amit', 'Kumar', LOWER(CONCAT('Amit', '.', 'Kumar', '@example.com')));`,
    explanation: "Demonstrates that SQL functions can compute values directly inside the VALUES clause."
  },
  {
    id: 18,
    section: 'part-3',
    sectionTitle: 'Part 3: Defaults & Expressions',
    targetTable: 'orders',
    difficulty: 'Easy',
    challengeId: 'insert-18',
    question: "Insert an order for customer 1 setting order_date to current timestamp with NOW().",
    task: "Insert an order for customer 1 with status 'SHIPPED', explicitly setting the order_date to the current system timestamp using NOW().",
    sql: `INSERT INTO orders (customer_id, status, order_date)\nVALUES (1, 'SHIPPED', NOW());`,
    explanation: "System functions like NOW() or CURRENT_TIMESTAMP evaluate at statement execution time."
  },
  {
    id: 19,
    section: 'part-3',
    sectionTitle: 'Part 3: Defaults & Expressions',
    targetTable: 'order_items',
    difficulty: 'Easy',
    challengeId: 'insert-19',
    question: "Insert an order item calculating unit_price as 10% discount off $599.00.",
    task: "Insert an order item for order 4 and product 4 with quantity 1, calculating the unit_price directly within the statement as a 10% discount off $599.00 rounded to two decimal places.",
    sql: `INSERT INTO order_items (order_id, product_id, quantity, unit_price)\nVALUES (4, 4, 1, ROUND(599.00 * 0.90, 2));`,
    explanation: "Inline arithmetic and ROUND functions avoid pre-calculating values on client application servers."
  },
  {
    id: 20,
    section: 'part-3',
    sectionTitle: 'Part 3: Defaults & Expressions',
    targetTable: 'products',
    difficulty: 'Easy',
    challengeId: 'insert-20',
    question: "Insert 'Accessory Bundle' setting price as 49.50 + 15.00 and stock as 5 * 8.",
    task: "Insert a product called 'Accessory Bundle' into 'Electronics', setting its price as the sum of 49.50 + 15.00 and its stock quantity as the arithmetic product 5 * 8.",
    sql: `INSERT INTO products (product_name, category, price, stock_qty)\nVALUES ('Accessory Bundle', 'Electronics', 49.50 + 15.00, 5 * 8);`,
    explanation: "SQL evaluates mathematical expressions directly before committing values to storage."
  },

  // ── PART 4: MULTI-ROW BATCH INGESTION (Q21–Q28) ──
  {
    id: 21,
    section: 'part-4',
    sectionTitle: 'Part 4: Multi-Row Batch Ingestion',
    targetTable: 'customers',
    difficulty: 'Easy',
    challengeId: 'insert-21',
    question: "Insert three customer records in a single batch statement.",
    task: "Insert three customer records (Arjun Kapoor, Pooja Hegde, Karan Johar) in a single batch statement with their respective emails and statuses ('ACTIVE', 'ACTIVE', 'INACTIVE').",
    sql: `INSERT INTO customers (first_name, last_name, email, status)\nVALUES\n    ('Arjun', 'Kapoor', 'arjun.k@example.com', 'ACTIVE'),\n    ('Pooja', 'Hegde', 'pooja.h@example.com', 'ACTIVE'),\n    ('Karan', 'Johar', 'karan.j@example.com', 'INACTIVE');`,
    explanation: "Multi-row INSERT reduces round trips and network overhead by committing multiple rows in a single query."
  },
  {
    id: 22,
    section: 'part-4',
    sectionTitle: 'Part 4: Multi-Row Batch Ingestion',
    targetTable: 'products',
    difficulty: 'Easy',
    challengeId: 'insert-22',
    question: "Bulk insert three stationery supplies with stock quantities in one query.",
    task: "Bulk insert three stationery supplies ('Notebook Spiral' at $4.50, 'Correction Tape' at $2.25, 'Stapler Heavy Duty' at $12.00) with appropriate stock quantities (300, 150, 80) in one query.",
    sql: `INSERT INTO products (product_name, category, price, stock_qty)\nVALUES\n    ('Notebook Spiral', 'Stationery', 4.50, 300),\n    ('Correction Tape', 'Stationery', 2.25, 150),\n    ('Stapler Heavy Duty', 'Stationery', 12.00, 80);`,
    explanation: "Bulk inserts to catalog tables achieve maximum write throughput."
  },
  {
    id: 23,
    section: 'part-4',
    sectionTitle: 'Part 4: Multi-Row Batch Ingestion',
    targetTable: 'orders',
    difficulty: 'Easy',
    challengeId: 'insert-23',
    question: "Ingest four separate order records across customers 1, 2, 3, and 5 in one batch.",
    task: "Ingest four separate order records across customers 1, 2, 3, and 5 in a single multi-row statement with custom dates.",
    sql: `INSERT INTO orders (customer_id, status, order_date)\nVALUES\n    (1, 'COMPLETED', '2026-10-10 09:00:00'),\n    (2, 'COMPLETED', '2026-10-11 10:15:00'),\n    (3, 'PENDING',   '2026-10-12 14:30:00'),\n    (5, 'CANCELLED', '2026-10-13 18:00:00');`,
    explanation: "Validates multiple foreign keys concurrently in a single atomic transaction."
  },
  {
    id: 24,
    section: 'part-4',
    sectionTitle: 'Part 4: Multi-Row Batch Ingestion',
    targetTable: 'order_items',
    difficulty: 'Easy',
    challengeId: 'insert-24',
    question: "Add three distinct line items belonging to order 5 in a single batch query.",
    task: "Add three distinct line items belonging to order 5 in a single batch query (product 1 qty 1 @ 24.99, product 2 qty 2 @ 39.50, product 7 qty 4 @ 4.50).",
    sql: `INSERT INTO order_items (order_id, product_id, quantity, unit_price)\nVALUES\n    (5, 1, 1, 24.99),\n    (5, 2, 2, 39.50),\n    (5, 7, 4, 4.50);`,
    explanation: "Batch ingestion of order items ensures cart items commit atomically."
  },
  {
    id: 25,
    section: 'part-4',
    sectionTitle: 'Part 4: Multi-Row Batch Ingestion',
    targetTable: 'order_items',
    difficulty: 'Easy',
    challengeId: 'insert-25',
    question: "Add line items across three different orders (6, 7, and 8) in a single query.",
    task: "Add line items across three different orders (6, 7, and 8) in a single query.",
    sql: `INSERT INTO order_items (order_id, product_id, quantity, unit_price)\nVALUES\n    (6, 4, 1, 599.00),\n    (7, 6, 1, 149.99),\n    (8, 8, 3, 2.25);`,
    explanation: "Demonstrates that multi-row statements are not constrained to a single parent key."
  },
  {
    id: 26,
    section: 'part-4',
    sectionTitle: 'Part 4: Multi-Row Batch Ingestion',
    targetTable: 'products',
    difficulty: 'Easy',
    challengeId: 'insert-26',
    question: "Ingest four hardware accessories into 'Electronics' in one batch statement.",
    task: "Ingest four hardware accessories into the 'Electronics' category in one batch statement (Bluetooth Adapter, HDMI 2.1 Cable, Webcam 1080p, Condenser Mic).",
    sql: `INSERT INTO products (product_name, category, price, stock_qty)\nVALUES\n    ('Bluetooth Adapter', 'Electronics', 15.99, 120),\n    ('HDMI 2.1 Cable', 'Electronics', 18.50, 200),\n    ('Webcam 1080p', 'Electronics', 55.00, 40),\n    ('Condenser Mic', 'Electronics', 75.00, 30);`,
    explanation: "Standard catalog seeding pattern for retail departments."
  },
  {
    id: 27,
    section: 'part-4',
    sectionTitle: 'Part 4: Multi-Row Batch Ingestion',
    targetTable: 'customers',
    difficulty: 'Easy',
    challengeId: 'insert-27',
    question: "Insert three customers with varying account states in a single query.",
    task: "Insert three customers with varying account states ('ACTIVE', 'PENDING_VERIFICATION', 'ACTIVE') in a single query.",
    sql: `INSERT INTO customers (first_name, last_name, email, status)\nVALUES\n    ('Siddharth', 'Roy', 'sid.roy@example.com', 'ACTIVE'),\n    ('Tara', 'Sutaria', 'tara.s@example.com', 'PENDING_VERIFICATION'),\n    ('Varun', 'Dhawan', 'varun.d@example.com', 'ACTIVE');`,
    explanation: "Batch ingestion handles distinct row-level statuses within the same command."
  },
  {
    id: 28,
    section: 'part-4',
    sectionTitle: 'Part 4: Multi-Row Batch Ingestion',
    targetTable: 'order_items',
    difficulty: 'Easy',
    challengeId: 'insert-28',
    question: "Record two separate line items for order 6 at volume discounts.",
    task: "Record two separate line items for order 6 at negotiated volume discounts ($550.00 and $15.00).",
    sql: `INSERT INTO order_items (order_id, product_id, quantity, unit_price)\nVALUES\n    (6, 4, 2, 550.00),\n    (6, 10, 5, 15.00);`,
    explanation: "Negotiated line prices are recorded directly onto transactional order items."
  },

  // ── PART 5: FULL-TUPLE POSITIONAL INSERTS (Q29–Q33) ──
  {
    id: 29,
    section: 'part-5',
    sectionTitle: 'Part 5: Positional Inserts',
    targetTable: 'customers',
    difficulty: 'Easy',
    challengeId: 'insert-29',
    question: "Insert a customer positionally, setting customer_id explicitly to 50.",
    task: "Insert a customer record by providing every column positionally, setting customer_id explicitly to 50 ('Gaurav', 'Kapoor', 'gaurav.k@example.com', '2026-10-01 00:00:00', 'ACTIVE').",
    sql: `INSERT INTO customers\nVALUES (50, 'Gaurav', 'Kapoor', 'gaurav.k@example.com', '2026-10-01 00:00:00', 'ACTIVE');`,
    explanation: "Positional insert supplies values in exact physical column order of the schema."
  },
  {
    id: 30,
    section: 'part-5',
    sectionTitle: 'Part 5: Positional Inserts',
    targetTable: 'customers',
    difficulty: 'Easy',
    challengeId: 'insert-30',
    question: "Insert a customer positionally using NULL to trigger AUTO_INCREMENT.",
    task: "Insert a customer record positionally while supplying NULL for the first column to trigger the AUTO_INCREMENT sequence ('Rhea', 'Pillai', 'rhea.p@example.com', NOW(), 'ACTIVE').",
    sql: `INSERT INTO customers\nVALUES (NULL, 'Rhea', 'Pillai', 'rhea.p@example.com', NOW(), 'ACTIVE');`,
    explanation: "Passing NULL to an AUTO_INCREMENT primary key triggers the next integer in the sequence."
  },
  {
    id: 31,
    section: 'part-5',
    sectionTitle: 'Part 5: Positional Inserts',
    targetTable: 'products',
    difficulty: 'Easy',
    challengeId: 'insert-31',
    question: "Positionally insert a product using DEFAULT for both ID and stock_qty.",
    task: "Positionally insert a furniture product, using the DEFAULT keyword for both the product_id and the trailing stock_qty column ('Footrest Ergonomic', 'Furniture', 29.99).",
    sql: `INSERT INTO products\nVALUES (DEFAULT, 'Footrest Ergonomic', 'Furniture', 29.99, DEFAULT);`,
    explanation: "DEFAULT keyword allows positional inserts to skip specific auto-increment and default columns."
  },
  {
    id: 32,
    section: 'part-5',
    sectionTitle: 'Part 5: Positional Inserts',
    targetTable: 'orders',
    difficulty: 'Easy',
    challengeId: 'insert-32',
    question: "Insert an order positionally for customer 50 with status 'PENDING'.",
    task: "Insert an order positionally for customer 50 with status 'PENDING', passing DEFAULT for order_id and an explicit timestamp ('2026-10-25 15:45:00').",
    sql: `INSERT INTO orders\nVALUES (DEFAULT, 50, '2026-10-25 15:45:00', 'PENDING');`,
    explanation: "Validates positional insertion against foreign key pointing to customer 50."
  },
  {
    id: 33,
    section: 'part-5',
    sectionTitle: 'Part 5: Positional Inserts',
    targetTable: 'order_items',
    difficulty: 'Easy',
    challengeId: 'insert-33',
    question: "Insert two order items positionally in one query using NULL for primary keys.",
    task: "Insert two order items positionally in a single query using NULL for the auto-increment primary keys for order 9.",
    sql: `INSERT INTO order_items\nVALUES \n    (NULL, 9, 1, 1, 24.99),\n    (NULL, 9, 2, 2, 39.50);`,
    explanation: "Combines multi-row batching with positional syntax."
  },

  // ── PART 6: SELECTIVE INGESTION (INSERT INTO ... SELECT) (Q34–Q42) ──
  {
    id: 34,
    section: 'part-6',
    sectionTitle: 'Part 6: INSERT ... SELECT',
    targetTable: 'product_catalog_backup',
    difficulty: 'Medium',
    challengeId: 'insert-34',
    question: "Copy all products with price > $50.00 into product_catalog_backup.",
    task: "Copy all products with a price greater than $50.00 from the products table into the product_catalog_backup table.",
    sql: `INSERT INTO product_catalog_backup (product_id, product_name, price)\nSELECT product_id, product_name, price\nFROM products\nWHERE price > 50.00;`,
    explanation: "Direct server-side table streaming without sending records through the client application."
  },
  {
    id: 35,
    section: 'part-6',
    sectionTitle: 'Part 6: INSERT ... SELECT',
    targetTable: 'product_catalog_backup',
    difficulty: 'Medium',
    challengeId: 'insert-35',
    question: "Back up all products in the 'Furniture' category into product_catalog_backup.",
    task: "Back up all products in the 'Furniture' category into product_catalog_backup.",
    sql: `INSERT INTO product_catalog_backup (product_id, product_name, price)\nSELECT product_id, product_name, price\nFROM products\nWHERE category = 'Furniture';`,
    explanation: "Clones categorized sub-inventories into backup staging tables."
  },
  {
    id: 36,
    section: 'part-6',
    sectionTitle: 'Part 6: INSERT ... SELECT',
    targetTable: 'marketing_leads',
    difficulty: 'Medium',
    challengeId: 'insert-36',
    question: "Populate marketing_leads with all customers whose status is 'ACTIVE'.",
    task: "Populate the marketing_leads table with all customers whose account status is currently 'ACTIVE'. Combine first and last names into lead_name.",
    sql: `INSERT INTO marketing_leads (lead_email, lead_name, source_status)\nSELECT email, CONCAT(first_name, ' ', last_name), status\nFROM customers\nWHERE status = 'ACTIVE';`,
    explanation: "Transforms customer names during ingestion into the leads table."
  },
  {
    id: 37,
    section: 'part-6',
    sectionTitle: 'Part 6: INSERT ... SELECT',
    targetTable: 'marketing_leads',
    difficulty: 'Medium',
    challengeId: 'insert-37',
    question: "Populate marketing_leads with customers having 'PENDING_VERIFICATION' status.",
    task: "Populate marketing_leads with customers who have a 'PENDING_VERIFICATION' status.",
    sql: `INSERT INTO marketing_leads (lead_email, lead_name, source_status)\nSELECT email, CONCAT(first_name, ' ', last_name), status\nFROM customers\nWHERE status = 'PENDING_VERIFICATION';`,
    explanation: "Appends secondary segments into the marketing leads table."
  },
  {
    id: 38,
    section: 'part-6',
    sectionTitle: 'Part 6: INSERT ... SELECT',
    targetTable: 'out_of_stock_alerts',
    difficulty: 'Medium',
    challengeId: 'insert-38',
    question: "Identify out-of-stock products (stock_qty = 0) and copy into out_of_stock_alerts.",
    task: "Identify any products where stock_qty = 0 and copy their identifiers, names, and the current timestamp into out_of_stock_alerts.",
    sql: `INSERT INTO out_of_stock_alerts (product_id, product_name, detected_at)\nSELECT product_id, product_name, NOW()\nFROM products\nWHERE stock_qty = 0;`,
    explanation: "Automated alert ingestion snapshotting zero-stock catalog items."
  },
  {
    id: 39,
    section: 'part-6',
    sectionTitle: 'Part 6: INSERT ... SELECT',
    targetTable: 'order_financial_snapshots',
    difficulty: 'Medium',
    challengeId: 'insert-39',
    question: "Populate order_financial_snapshots computing line item revenue for orders 1 through 5.",
    task: "Populate order_financial_snapshots by computing the sum of line item totals (quantity * unit_price) grouped by order_id for orders 1 through 5.",
    sql: `INSERT INTO order_financial_snapshots (order_id, total_revenue)\nSELECT order_id, SUM(quantity * unit_price)\nFROM order_items\nWHERE order_id <= 5\nGROUP BY order_id;`,
    explanation: "Aggregates revenue directly into a snapshot summary reporting table."
  },
  {
    id: 40,
    section: 'part-6',
    sectionTitle: 'Part 6: INSERT ... SELECT',
    targetTable: 'order_financial_snapshots',
    difficulty: 'Medium',
    challengeId: 'insert-40',
    question: "Ingest calculated financial totals for orders numbered greater than 5.",
    task: "Ingest the calculated financial totals for orders numbered greater than 5 into order_financial_snapshots.",
    sql: `INSERT INTO order_financial_snapshots (order_id, total_revenue)\nSELECT order_id, SUM(quantity * unit_price)\nFROM order_items\nWHERE order_id > 5\nGROUP BY order_id;`,
    explanation: "Completes the financial rollup table with remaining order batches."
  },
  {
    id: 41,
    section: 'part-6',
    sectionTitle: 'Part 6: INSERT ... SELECT',
    targetTable: 'product_catalog_backup',
    difficulty: 'Medium',
    challengeId: 'insert-41',
    question: "Backup 'Stationery' products inflating their price by 10% during insertion.",
    task: "Insert records into product_catalog_backup by taking products in the 'Stationery' category and artificially inflating their price by 10% during insertion.",
    sql: `INSERT INTO product_catalog_backup (product_id, product_name, price)\nSELECT product_id, product_name, ROUND(price * 1.10, 2)\nFROM products\nWHERE category = 'Stationery';`,
    explanation: "Transforms numerical values on the fly during bulk table copying."
  },
  {
    id: 42,
    section: 'part-6',
    sectionTitle: 'Part 6: INSERT ... SELECT',
    targetTable: 'temp_customer_emails',
    difficulty: 'Medium',
    challengeId: 'insert-42',
    question: "Create and populate a temporary table temp_customer_emails with lowercased emails.",
    task: "Create and populate a temporary table temp_customer_emails containing customer IDs and lowercased emails from customers.",
    sql: `CREATE TEMPORARY TABLE temp_customer_emails (\n    cid INT,\n    clean_email VARCHAR(100)\n);\n\nINSERT INTO temp_customer_emails (cid, clean_email)\nSELECT customer_id, LOWER(email)\nFROM customers;`,
    explanation: "Temporary tables exist only for the current database session and auto-drop upon disconnect."
  },

  // ── PART 7: UPSERTS & CONFLICT HANDLING (ON DUPLICATE KEY UPDATE / IGNORE) (Q43–Q47) ──
  {
    id: 43,
    section: 'part-7',
    sectionTitle: 'Part 7: Upserts & ON DUPLICATE',
    targetTable: 'customers',
    difficulty: 'Medium',
    challengeId: 'insert-43',
    question: "Attempt to insert Priya Nair with INSERT IGNORE to silence duplicate key errors.",
    task: "Attempt to insert a customer with an email that already exists ('priya.nair@example.com'), using INSERT IGNORE to silence duplicate key errors.",
    sql: `INSERT IGNORE INTO customers (first_name, last_name, email)\nVALUES ('Priya', 'Nair', 'priya.nair@example.com');`,
    explanation: "INSERT IGNORE turns duplicate key errors into warnings, skipping the row without crashing."
  },
  {
    id: 44,
    section: 'part-7',
    sectionTitle: 'Part 7: Upserts & ON DUPLICATE',
    targetTable: 'customers',
    difficulty: 'Medium',
    challengeId: 'insert-44',
    question: "Insert Rahul Dravid; if email exists, update status to 'VERIFIED'.",
    task: "Insert a customer with email 'rahul.d@example.com'. If the email already exists, update their status to 'VERIFIED' using ON DUPLICATE KEY UPDATE.",
    sql: `INSERT INTO customers (first_name, last_name, email, status)\nVALUES ('Rahul', 'Dravid', 'rahul.d@example.com', 'ACTIVE')\nON DUPLICATE KEY UPDATE \n    status = 'VERIFIED';`,
    explanation: "Performs an atomic upsert: inserts if absent, mutates status if unique constraint trips."
  },
  {
    id: 45,
    section: 'part-7',
    sectionTitle: 'Part 7: Upserts & ON DUPLICATE',
    targetTable: 'products',
    difficulty: 'Medium',
    challengeId: 'insert-45',
    question: "Insert product ID 1; if present, increment stock_qty by 15 units.",
    task: "Insert product ID 1 ('Desk Lamp') with 15 units. If the primary key already exists, increment its stock_qty by 15 units instead of throwing an error.",
    sql: `INSERT INTO products (product_id, product_name, category, price, stock_qty)\nVALUES (1, 'Desk Lamp', 'Electronics', 24.99, 15)\nON DUPLICATE KEY UPDATE \n    stock_qty = stock_qty + VALUES(stock_qty);`,
    explanation: "Uses the incoming row value to atomically increment inventory levels without race conditions."
  },
  {
    id: 46,
    section: 'part-7',
    sectionTitle: 'Part 7: Upserts & ON DUPLICATE',
    targetTable: 'order_financial_snapshots',
    difficulty: 'Medium',
    challengeId: 'insert-46',
    question: "Insert or update order_financial_snapshots for order 1 with recalculated revenue.",
    task: "Insert or update an entry in order_financial_snapshots for order 1, replacing total_revenue with a recalculated value ($99.98) if the key is already present.",
    sql: `INSERT INTO order_financial_snapshots (order_id, total_revenue)\nVALUES (1, 99.98)\nON DUPLICATE KEY UPDATE \n    total_revenue = VALUES(total_revenue);`,
    explanation: "Overwrites stale summary figures when refreshing analytical materialized snapshots."
  },
  {
    id: 47,
    section: 'part-7',
    sectionTitle: 'Part 7: Upserts & ON DUPLICATE',
    targetTable: 'marketing_leads',
    difficulty: 'Medium',
    challengeId: 'insert-47',
    question: "Batch insert two marketing leads using INSERT IGNORE to skip existing emails.",
    task: "Batch insert two marketing leads using INSERT IGNORE so that existing emails are skipped without halting the transaction.",
    sql: `INSERT IGNORE INTO marketing_leads (lead_email, lead_name, source_status)\nVALUES \n    ('priya.nair@example.com', 'Priya Nair', 'ACTIVE'),\n    ('new.lead@example.com', 'New Lead', 'PROSPECT');`,
    explanation: "INSERT IGNORE allows valid rows in a batch to succeed while safely skipping duplicate collisions."
  },

  // ── PART 8: ADVANCED INGESTION EDGE CASES (Q48–Q50) ──
  {
    id: 48,
    section: 'part-8',
    sectionTitle: 'Part 8: Advanced Edge Cases',
    targetTable: 'customers',
    difficulty: 'Medium',
    challengeId: 'insert-48',
    question: "Insert new customer Kavita Krishnan and retrieve key using LAST_INSERT_ID().",
    task: "Insert a new customer and retrieve their generated identity key in the same session using LAST_INSERT_ID().",
    sql: `INSERT INTO customers (first_name, last_name, email)\nVALUES ('Kavita', 'Krishnan', 'kavita.k@example.com');\n\nSELECT LAST_INSERT_ID() AS newly_generated_customer_id;`,
    explanation: "LAST_INSERT_ID() retrieves the most recent AUTO_INCREMENT value generated during the active session."
  },
  {
    id: 49,
    section: 'part-8',
    sectionTitle: 'Part 8: Advanced Edge Cases',
    targetTable: 'orders',
    difficulty: 'Medium',
    challengeId: 'insert-49',
    question: "Insert order tied directly to new customer using LAST_INSERT_ID().",
    task: "Use the generated LAST_INSERT_ID() from Problem 48 to insert an order tied directly to that new customer without hardcoding their ID.",
    sql: `INSERT INTO orders (customer_id, status)\nVALUES (LAST_INSERT_ID(), 'PENDING');`,
    explanation: "Links relational parents and children dynamically without needing to read keys into client memory."
  },
  {
    id: 50,
    section: 'part-8',
    sectionTitle: 'Part 8: Advanced Edge Cases',
    targetTable: 'order_financial_snapshots',
    difficulty: 'Medium',
    challengeId: 'insert-50',
    question: "Insert into snapshots with conditional CASE enforcing minimum floor of $10.00.",
    task: "Insert into order_financial_snapshots using an inline conditional CASE expression inside the SELECT query to enforce a minimum recorded floor of $10.00.",
    sql: `INSERT INTO order_financial_snapshots (order_id, total_revenue)\nSELECT \n    order_id, \n    CASE \n        WHEN SUM(quantity * unit_price) < 10.00 THEN 10.00 \n        ELSE SUM(quantity * unit_price) \n    END AS final_revenue\nFROM order_items\nWHERE order_id NOT IN (SELECT order_id FROM order_financial_snapshots)\nGROUP BY order_id;`,
    explanation: "Conditional CASE statements embedded in SELECT allow enforcing business rules during ingestion."
  }
];
