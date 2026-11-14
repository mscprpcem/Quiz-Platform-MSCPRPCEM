import { CHAPTER_0_METADATA, CHAPTER_0_TOPICS } from './chapter0Fundamentals.js';
import { CHAPTER_2_METADATA, CHAPTER_2_TOPICS } from './chapter2BuildingBlocks.js';
import { CHAPTER_1_METADATA, CHAPTER_1_TOPICS } from './chapter1Ddl.js';
import { CHAPTER_3_METADATA, CHAPTER_3_TOPICS } from './chapter3Dml.js';
import { CHAPTER_4_METADATA, CHAPTER_4_TOPICS } from './chapter4Filtering.js';
import { CHAPTER_5_METADATA, CHAPTER_5_TOPICS } from './chapter5InsertBulk.js';

// All Chapters Catalog with Availability Status (Chapters 1 through 30)
export const CHAPTER_CATALOG = [
  CHAPTER_0_METADATA,
  CHAPTER_2_METADATA,
  CHAPTER_1_METADATA,
  CHAPTER_3_METADATA,
  CHAPTER_4_METADATA,
  CHAPTER_5_METADATA,
  {
    id: 'mod-06',
    number: 7,
    title: 'SQL Built-in Functions',
    shortTitle: 'Built-in Functions',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Deep dive into string formatting (CONCAT, SUBSTRING, UPPER, LOWER), date-time arithmetic (NOW, DATEDIFF, DATE_ADD), mathematical calculations (ROUND, CEIL, ABS), and conditional branching (CASE WHEN).',
    plannedTopics: ['String Manipulation Functions', 'Date & Time Processing', 'Mathematical Operations', 'CASE WHEN Conditional Branching', 'COALESCE & NULLIF Handling']
  },
  {
    id: 'mod-07',
    number: 8,
    title: 'GROUP BY & Aggregations',
    shortTitle: 'GROUP BY & Aggregations',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Master analytical grouping: COUNT, SUM, AVG, MIN, MAX aggregates, multi-column GROUP BY buckets, and filtering aggregated results with HAVING vs WHERE.',
    plannedTopics: ['Aggregate Functions (COUNT, SUM, AVG)', 'GROUP BY Categorical Bucketing', 'HAVING vs WHERE Deep Dive', 'Multi-Column Grouping', 'Rollups & Grouping Sets']
  },
  {
    id: 'mod-08',
    number: 9,
    title: 'JOINS Mastery',
    shortTitle: 'JOINS Mastery',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Master multi-table relational joins: INNER JOIN, LEFT OUTER JOIN, RIGHT OUTER JOIN, FULL OUTER JOIN, CROSS JOIN, SELF JOIN, and query execution optimizer join algorithms.',
    plannedTopics: ['Relational Linkage & Foreign Keys', 'INNER JOIN (Intersection of Tables)', 'LEFT JOIN (Preserving Left Parent Records)', 'RIGHT & FULL OUTER JOINS', 'SELF JOINS & Hierarchical Trees', 'CROSS JOIN (Cartesian Products)']
  },
  {
    id: 'mod-09',
    number: 10,
    title: 'Subqueries & CTEs',
    shortTitle: 'Subqueries & CTEs',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Master nested subqueries: Scalar subqueries, correlated subqueries with EXISTS / NOT EXISTS, and clean Common Table Expressions (WITH clauses).',
    plannedTopics: ['Single-Value Scalar Subqueries', 'IN & ANY / ALL Multi-Row Subqueries', 'Correlated Subqueries & EXISTS', 'Common Table Expressions (WITH Clause)', 'Recursive CTEs for Tree Traversal']
  },
  {
    id: 'mod-10',
    number: 11,
    title: 'Views & Virtual Tables',
    shortTitle: 'Views & Virtual Tables',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Learn how to encapsulate complex queries into reusable virtual tables: CREATE VIEW, updating views, security layer filtering, and Materialized Views performance.',
    plannedTopics: ['CREATE VIEW (Virtual Table Encapsulation)', 'Security & Row-Level Masking with Views', 'Updatable vs Read-Only Views', 'Materialized Views vs Standard Views', 'DROP & ALTER VIEW']
  },
  {
    id: 'mod-11',
    number: 12,
    title: 'Advanced SQL & Index Optimization',
    shortTitle: 'Index Optimization',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Enterprise SQL engineering: Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD), EXPLAIN query plans, B+ Tree index design, composite indexes, and transaction isolation levels.',
    plannedTopics: ['Window Functions (OVER, PARTITION BY)', 'Ranking Functions (ROW_NUMBER, DENSE_RANK)', 'Lead & Lag Value Windowing', 'EXPLAIN ANALYZE & Query Plans', 'B+ Tree Indexing & Cardinality', 'Transaction Isolation (ACID & MVCC)']
  },
  {
    id: 'mod-12',
    number: 13,
    title: 'CASE Expressions & Conditional Logic',
    shortTitle: 'CASE Statements',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Master conditional branching inside SELECT, WHERE, ORDER BY, and aggregates: Simple vs Searched CASE, COALESCE, NULLIF, and conditional pivoting.',
    plannedTopics: ['Searched CASE Expressions', 'Conditional Aggregations (SUM CASE)', 'Custom Sorting with CASE', 'COALESCE vs IFNULL vs NULLIF']
  },
  {
    id: 'mod-13',
    number: 14,
    title: 'Window Functions Analytics',
    shortTitle: 'Window Functions',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Advanced modern SQL analytics: OVER, PARTITION BY, ORDER BY frames, ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG, LEAD, FIRST_VALUE, and running totals.',
    plannedTopics: ['The OVER() Clause Architecture', 'Ranking Functions vs Traditional GROUP BY', 'Navigational Windowing (LAG, LEAD)', 'Running Totals & Moving Averages']
  },
  {
    id: 'mod-14',
    number: 15,
    title: 'Common Table Expressions (CTEs)',
    shortTitle: 'CTEs & Recursion',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Readable and modular SQL: WITH clauses, chained CTEs, recursive CTEs for tree hierarchies, graph traversal, and bill-of-materials calculations.',
    plannedTopics: ['Standard WITH Clauses', 'Chained Multi-CTE Pipelines', 'Recursive CTE Anchor & Recursive Members', 'Organizational Charts & Tree Queries']
  },
  {
    id: 'mod-15',
    number: 16,
    title: 'Transactions & Concurrency Control',
    shortTitle: 'Transactions & ACID',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Production database reliability: ACID deep dive, START TRANSACTION, COMMIT, ROLLBACK, SAVEPOINT, Dirty Reads, Non-Repeatable Reads, Phantom Reads, and Isolation Levels.',
    plannedTopics: ['ACID Engine Guarantees', 'Manual Transaction Boundaries', 'Isolation Levels (Read Committed to Serializable)', 'Deadlock Prevention & Row Locking']
  },
  {
    id: 'mod-16',
    number: 17,
    title: 'Database Security & DCL Privileges',
    shortTitle: 'Security & Privileges',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'User access management: CREATE USER, GRANT, REVOKE, Role-Based Access Control (RBAC), principle of least privilege, and SQL injection prevention.',
    plannedTopics: ['User Account Management', 'Object-Level & Column-Level Grants', 'Database Roles & Inheritance', 'SQL Injection Hardening']
  },
  {
    id: 'mod-17',
    number: 18,
    title: 'Stored Procedures & Triggers',
    shortTitle: 'Procedures & Triggers',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Programmable database logic: DELIMITER, IN/OUT parameters, conditional IF/ELSE, loops (WHILE), cursor iteration, BEFORE/AFTER INSERT/UPDATE triggers, and audit logging.',
    plannedTopics: ['Stored Procedure Parameters & Execution', 'Control Flow & Exception Handling', 'Cursor Iteration Mechanics', 'Audit Logging with Database Triggers']
  },
  {
    id: 'mod-18',
    number: 19,
    title: 'Query Execution Plans & EXPLAIN',
    shortTitle: 'EXPLAIN & Profiling',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Optimizer mechanics: Reading EXPLAIN output, type column (ALL, index, range, ref, eq_ref, const), key selection, rows examined vs returned, and EXPLAIN ANALYZE tree.',
    plannedTopics: ['Understanding the Query Optimizer', 'Full Table Scan vs Index Lookup', 'Reading EXPLAIN Output Columns', 'EXPLAIN ANALYZE Execution Trees']
  },
  {
    id: 'mod-19',
    number: 20,
    title: 'Database Normalization (1NF to BCNF)',
    shortTitle: 'Database Normalization',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Eliminating anomalies: Update, insertion, and deletion anomalies, Functional Dependencies, 1NF (Atomic Values), 2NF (Partial Dependencies), 3NF (Transitive Dependencies), and BCNF.',
    plannedTopics: ['Data Redundancy Anomalies', 'First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF) & BCNF']
  },
  {
    id: 'mod-20',
    number: 21,
    title: 'Index Architecture: B+ Trees & Hashes',
    shortTitle: 'Index Architecture',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Physical storage engine structures: Clustered vs Secondary indexes, B+ Tree page splits, composite index column ordering (Leftmost Prefix Rule), and covering indexes.',
    plannedTopics: ['B+ Tree Node Structure & Height', 'Clustered vs Secondary Indexes', 'Composite Index Leftmost Prefix Rule', 'Covering Indexes (Using Index)']
  },
  {
    id: 'mod-21',
    number: 22,
    title: 'Partitioning & Sharding Fundamentals',
    shortTitle: 'Partitioning & Sharding',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Scaling large datasets: Range, List, Hash, and Key partitioning, partition pruning, horizontal sharding architectures, and distributed transactions.',
    plannedTopics: ['Horizontal Table Partitioning Types', 'Partition Pruning in Queries', 'Sharding Keys & Hashing Algorithms', 'Cross-Shard Query Challenges']
  },
  {
    id: 'mod-22',
    number: 23,
    title: 'JSON Data Types & Semi-Structured SQL',
    shortTitle: 'JSON & Semi-Structured',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Combining relational and document paradigms: Native JSON storage, JSON_EXTRACT (->, ->>), JSON_ARRAY, JSON_OBJECT, path expressions, and indexing virtual generated columns.',
    plannedTopics: ['JSON Document Storage in MySQL', 'JSON Extraction Operators (->, ->>)', 'JSON Search & Modification Functions', 'Indexing JSON via Generated Columns']
  },
  {
    id: 'mod-23',
    number: 24,
    title: 'Full-Text Search & Pattern Matching',
    shortTitle: 'Full-Text Search',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'High-speed textual discovery: FULLTEXT indexes, MATCH() AGAINST(), Natural Language Mode, Boolean Mode operators (+, -, *, ~), stop words, and token minimum lengths.',
    plannedTopics: ['FULLTEXT Inverted Index Internals', 'Natural Language Text Searches', 'Boolean Mode Advanced Querying', 'Fuzzy Matching & Relevance Scoring']
  },
  {
    id: 'mod-24',
    number: 25,
    title: 'Temporal Tables & Time-Travel Queries',
    shortTitle: 'Temporal Tables',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Historical point-in-time state tracking: System-versioned temporal tables, AS OF queries, tracking SCD (Slowly Changing Dimensions) Type 2, and event-sourced relational models.',
    plannedTopics: ['System-Versioned Relational Storage', 'Point-in-Time AS OF Querying', 'Slowly Changing Dimensions (SCD Type 1 & 2)', 'Historical Audit Logging Architecture']
  },
  {
    id: 'mod-25',
    number: 26,
    title: 'Data Warehousing & Star Schemas',
    shortTitle: 'Data Warehousing',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'OLTP vs OLAP architecture: Fact tables, Dimension tables, Star schema vs Snowflake schema design, surrogate keys, and columnar execution engines.',
    plannedTopics: ['OLTP (Transactional) vs OLAP (Analytical)', 'Fact & Dimension Table Modeling', 'Star Schema vs Snowflake Schemas', 'Columnar Storage & Vectorized Execution']
  },
  {
    id: 'mod-26',
    number: 27,
    title: 'NoSQL vs Relational Multi-Model SQL',
    shortTitle: 'NoSQL vs SQL',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Architectural trade-offs: Document, Key-Value, Column-Family, and Graph databases vs ACID relational SQL. CAP theorem, BASE vs ACID, and Polyglot Persistence.',
    plannedTopics: ['The CAP Theorem & PACELC', 'BASE Consistency vs Relational ACID', 'Document vs Relational Storage Trade-offs', 'Polyglot Persistence in Modern Backends']
  },
  {
    id: 'mod-27',
    number: 28,
    title: 'FAANG & Top Tech Interview Drill (Part 1)',
    shortTitle: 'FAANG Interviews (1)',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Live whiteboard problem solving: Top recurring FAANG questions: Second Highest Salary, Consecutive Numbers, Customers Who Never Order, Duplicate Emails, and Department Top 3 Salaries.',
    plannedTopics: ['Second Highest Salary (LIMIT vs DENSE_RANK)', 'Finding Consecutive Streaks in Log Data', 'Anti-Joins & LEFT JOIN IS NULL', 'Department Top 3 Salaries (DENSE_RANK)']
  },
  {
    id: 'mod-28',
    number: 29,
    title: 'FAANG & Top Tech Interview Drill (Part 2)',
    shortTitle: 'FAANG Interviews (2)',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Advanced interview scenarios: Retention rate calculations, Churn analytics, Sessionization with window lags, Tripping trip cancellation rates, and Median salary calculations.',
    plannedTopics: ['Day-1 to Day-30 User Retention Queries', 'Sessionizing Web Clickstream Events', 'Cancellation & Failure Rate Calculations', 'Calculating Medians with Window Functions']
  },
  {
    id: 'mod-29',
    number: 30,
    title: 'Grand Master Capstone Assessment',
    shortTitle: 'Grand Capstone',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Comprehensive 50-query end-to-end production database engineering capstone covering schema design, indexing, window analytics, and query optimization.',
    plannedTopics: ['End-to-End Enterprise Schema Setup', 'High-Throughput Ingestion Pipelines', 'Executive Reporting Window Analytics', 'Query Optimization & Index Profiling']
  }
];

// Unified Topic Details Map
export const ALL_TOPIC_DETAILS = {
  ...CHAPTER_0_TOPICS,
  ...CHAPTER_2_TOPICS,
  ...CHAPTER_1_TOPICS,
  ...CHAPTER_3_TOPICS,
  ...CHAPTER_4_TOPICS,
  ...CHAPTER_5_TOPICS
};

// Helper utilities
export function getChapterMetadata(moduleId) {
  return CHAPTER_CATALOG.find(m => m.id === moduleId) || CHAPTER_CATALOG[0];
}

export function isChapterAvailable(moduleId) {
  const meta = getChapterMetadata(moduleId);
  return meta.status === 'available';
}
