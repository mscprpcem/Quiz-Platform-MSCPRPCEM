import { CHAPTER_0_METADATA, CHAPTER_0_TOPICS } from './chapter0Fundamentals.js';
import { CHAPTER_2_METADATA, CHAPTER_2_TOPICS } from './chapter2BuildingBlocks.js';
import { CHAPTER_1_METADATA, CHAPTER_1_TOPICS } from './chapter1Ddl.js';
import { CHAPTER_3_METADATA, CHAPTER_3_TOPICS } from './chapter3Dml.js';
import { CHAPTER_4_METADATA, CHAPTER_4_TOPICS } from './chapter4Filtering.js';
import { CHAPTER_5_METADATA, CHAPTER_5_TOPICS } from './chapter5InsertBulk.js';

// All Chapters Catalog with Availability Status
export const CHAPTER_CATALOG = [
  CHAPTER_0_METADATA,
  CHAPTER_2_METADATA,
  CHAPTER_1_METADATA,
  CHAPTER_3_METADATA,
  CHAPTER_4_METADATA,
  CHAPTER_5_METADATA,
  {
    id: 'mod-06',
    number: 6,
    title: 'SQL Built-in Functions',
    shortTitle: 'Functions',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Deep dive into string formatting (CONCAT, SUBSTRING, UPPER, LOWER), date-time arithmetic (NOW, DATEDIFF, DATE_ADD), mathematical calculations (ROUND, CEIL, ABS), and conditional branching (CASE WHEN).',
    plannedTopics: ['String Manipulation Functions', 'Date & Time Processing', 'Mathematical Operations', 'CASE WHEN Conditional Branching', 'COALESCE & NULLIF Handling']
  },
  {
    id: 'mod-07',
    number: 7,
    title: 'GROUP BY & Aggregations',
    shortTitle: 'GROUP BY & HAVING',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Master analytical grouping: COUNT, SUM, AVG, MIN, MAX aggregates, multi-column GROUP BY buckets, and filtering aggregated results with HAVING vs WHERE.',
    plannedTopics: ['Aggregate Functions (COUNT, SUM, AVG)', 'GROUP BY Categorical Bucketing', 'HAVING vs WHERE Deep Dive', 'Multi-Column Grouping', 'Rollups & Grouping Sets']
  },
  {
    id: 'mod-08',
    number: 8,
    title: 'JOINS Mastery',
    shortTitle: 'JOINS',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Master multi-table relational joins: INNER JOIN, LEFT OUTER JOIN, RIGHT OUTER JOIN, FULL OUTER JOIN, CROSS JOIN, SELF JOIN, and query execution optimizer join algorithms.',
    plannedTopics: ['Relational Linkage & Foreign Keys', 'INNER JOIN (Intersection of Tables)', 'LEFT JOIN (Preserving Left Parent Records)', 'RIGHT & FULL OUTER JOINS', 'SELF JOINS & Hierarchical Trees', 'CROSS JOIN (Cartesian Products)']
  },
  {
    id: 'mod-09',
    number: 9,
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
    number: 10,
    title: 'Views & Virtual Tables',
    shortTitle: 'Views',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Learn how to encapsulate complex queries into reusable virtual tables: CREATE VIEW, updating views, security layer filtering, and Materialized Views performance.',
    plannedTopics: ['CREATE VIEW (Virtual Table Encapsulation)', 'Security & Row-Level Masking with Views', 'Updatable vs Read-Only Views', 'Materialized Views vs Standard Views', 'DROP & ALTER VIEW']
  },
  {
    id: 'mod-11',
    number: 11,
    title: 'Advanced SQL & Index Optimization',
    shortTitle: 'Advanced SQL',
    status: 'coming_soon',
    badge: 'In Production',
    releaseDate: 'Coming Soon',
    description: 'Enterprise SQL engineering: Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD), EXPLAIN query plans, B+ Tree index design, composite indexes, and transaction isolation levels.',
    plannedTopics: ['Window Functions (OVER, PARTITION BY)', 'Ranking Functions (ROW_NUMBER, DENSE_RANK)', 'Lead & Lag Value Windowing', 'EXPLAIN ANALYZE & Query Plans', 'B+ Tree Indexing & Cardinality', 'Transaction Isolation (ACID & MVCC)']
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
