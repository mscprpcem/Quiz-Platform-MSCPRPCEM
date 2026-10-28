// =============================================================================
// 📘 50 INSERT & BULK INGESTION PRACTICE CHALLENGES (DAY 5 MASTERCLASS)
// Interactive Practice Runner Format for /practice/sql/:slug
// Database: ecommerce_day5_lab
// =============================================================================

import { DAY5_ECOMMERCE_SETUP_SQL, INSERT_QUESTIONS_DATA } from './insertQuestionsData.js';

const TABLE_SCHEMAS = {
  customers: `Table: \`customers\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **customer_id** | INTEGER | Primary Key, Auto Increment |
| **first_name** | VARCHAR | Customer first name |
| **last_name** | VARCHAR | Customer last name |
| **email** | VARCHAR | Unique customer email address |
| **created_at** | DATETIME | Registration timestamp (DEFAULT NOW) |
| **status** | VARCHAR | Account status (DEFAULT 'ACTIVE') |`,

  products: `Table: \`products\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **product_id** | INTEGER | Primary Key, Auto Increment |
| **product_name** | VARCHAR | Product catalog name |
| **category** | VARCHAR | Department category name |
| **price** | DECIMAL | Unit retail price (CHECK >= 0) |
| **stock_qty** | INTEGER | Available units in inventory |`,

  orders: `Table: \`orders\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **order_id** | INTEGER | Primary Key, Auto Increment |
| **customer_id** | INTEGER | Foreign Key referencing \`customers(customer_id)\` |
| **order_date** | DATETIME | Order creation timestamp |
| **status** | VARCHAR | Order status ('PENDING', 'COMPLETED', etc.) |`,

  order_items: `Table: \`order_items\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **order_item_id**| INTEGER | Primary Key, Auto Increment |
| **order_id** | INTEGER | Foreign Key referencing \`orders(order_id)\` |
| **product_id** | INTEGER | Foreign Key referencing \`products(product_id)\` |
| **quantity** | INTEGER | Purchased units (CHECK > 0) |
| **unit_price** | DECIMAL | Price charged per unit |`,

  product_catalog_backup: `Table: \`product_catalog_backup\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **product_id** | INTEGER | Catalog product identifier |
| **product_name** | VARCHAR | Name of backed-up product |
| **price** | DECIMAL | Price snapshot value |`,

  marketing_leads: `Table: \`marketing_leads\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **lead_id** | INTEGER | Primary Key, Auto Increment |
| **lead_email** | VARCHAR | Unique prospect/lead email |
| **lead_name** | VARCHAR | Full combined name |
| **source_status**| VARCHAR | Source customer account status |`,

  out_of_stock_alerts: `Table: \`out_of_stock_alerts\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **alert_id** | INTEGER | Primary Key, Auto Increment |
| **product_id** | INTEGER | Out-of-stock product identifier |
| **product_name** | VARCHAR | Name of out-of-stock product |
| **detected_at** | DATETIME | Automated detection timestamp |`,

  order_financial_snapshots: `Table: \`order_financial_snapshots\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **order_id** | INTEGER | Primary Key. Target order identifier |
| **total_revenue**| DECIMAL | Sum total revenue for the order |`,

  temp_customer_emails: `Table: \`temp_customer_emails\`

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **cid** | INTEGER | Customer identifier |
| **clean_email** | VARCHAR | Lowercased sanitized email |`
};

export const INSERT_CHALLENGES = INSERT_QUESTIONS_DATA.map((q) => {
  const schemaDoc = TABLE_SCHEMAS[q.targetTable] || TABLE_SCHEMAS.products;

  let challengeSetup = DAY5_ECOMMERCE_SETUP_SQL;
  if (q.id === 43 || q.id === 44) {
    challengeSetup += `\nINSERT OR IGNORE INTO customers (first_name, last_name, email, status) VALUES ('Priya', 'Nair', 'priya.nair@example.com', 'ACTIVE'), ('Rahul', 'Dravid', 'rahul.d@example.com', 'ACTIVE');`;
  } else if (q.id === 46) {
    challengeSetup += `\nINSERT OR IGNORE INTO order_financial_snapshots (order_id, total_revenue) VALUES (1, 49.98);`;
  } else if (q.id === 47) {
    challengeSetup += `\nINSERT OR IGNORE INTO marketing_leads (lead_email, lead_name, source_status) VALUES ('priya.nair@example.com', 'Priya Nair', 'ACTIVE');`;
  }

  return {
    id: q.challengeId,
    moduleId: `insert-${q.section}`,
    moduleTitle: q.sectionTitle,
    title: q.question,
    difficulty: q.difficulty,
    tags: ['DML', 'INSERT', 'Bulk Ingestion', q.sectionTitle],
    description: `${schemaDoc}\n\n---\n\n### Task\nWrite a solution to: ${q.task}\n\n- **Target Table**: \`${q.targetTable}\`\n- **Category**: ${q.sectionTitle}\n- **Difficulty**: ${q.difficulty}\n\n---\n\n### Concept Note\n${q.explanation}`,
    setupSql: challengeSetup,
    starterSql: `-- Target Table: ${q.targetTable} (Database: ecommerce_day5_lab)\n-- Write your SQL query or INSERT statement below:\n\n`,
    expectedSql: q.sql,
    checkOrder: false,
    hints: [
      `Inspect the '${q.targetTable}' table in the Database Tables tab to view columns and sample data.`,
      `Remember: Explicit column mapping prevents schema migration errors.`,
      q.explanation
    ],
    explanation: q.explanation
  };
});
