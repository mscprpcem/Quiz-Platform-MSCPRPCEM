// =========================================================================
// 📘 CHAPTER 5 (DAY 4): ADVANCED FILTERING (LIKE, IN, BETWEEN, NULL)
// =========================================================================

export const CHAPTER_4_METADATA = {
  id: 'mod-05',
  number: 5,
  title: 'Day 4: Advanced Filtering (LIKE, IN, BETWEEN, NULL)',
  shortTitle: 'Advanced Filtering',
  status: 'available',
  badge: 'Day 4 • Live',
  releaseDate: 'Available Now',
  description: 'Master row-level data filtering: LIKE pattern matching with wildcards (%, _), IN discrete value matching, inclusive BETWEEN range queries, three-valued NULL logic (IS NULL / IS NOT NULL), compound boolean expressions, 40 standardized practice questions (Basic to FAANG Staff), and interview questions.',
  topics: [
    {
      id: 'top-05-01',
      title: 'LIKE Operator & Wildcards (%, _)',
      lessonCode: '5.1',
      summary: 'Learn text pattern matching with LIKE, explore the % and _ wildcards, case-insensitivity in MySQL, and real-world search implementations.',
      estimatedTime: '20 min'
    },
    {
      id: 'top-05-02',
      title: 'IN Operator vs OR Comparison',
      lessonCode: '5.2',
      summary: 'Filter records across discrete lists of values using IN, compare readability and performance against chained OR conditions, and prepare for subqueries.',
      estimatedTime: '20 min'
    },
    {
      id: 'top-05-03',
      title: 'BETWEEN Operator & Inclusive Ranges',
      lessonCode: '5.3',
      summary: 'Filter numerical and date ranges with BETWEEN, master the inclusive boundary rule (both limits included), and use NOT BETWEEN.',
      estimatedTime: '20 min'
    },
    {
      id: 'top-05-04',
      title: 'The NULL Concept (IS NULL & IS NOT NULL)',
      lessonCode: '5.4',
      summary: 'Understand Three-Valued Logic (TRUE, FALSE, UNKNOWN), why WHERE col = NULL fails, and why NULL is neither zero nor an empty string.',
      estimatedTime: '25 min'
    },
    {
      id: 'top-05-05',
      title: 'Combined Real-World Queries & Memory Box',
      lessonCode: '5.5',
      summary: 'Combine LIKE, IN, and BETWEEN into high-performance multi-condition queries with AND/OR operator precedence and quick memory anchors.',
      estimatedTime: '20 min'
    },
    {
      id: 'top-05-06',
      title: 'Top 5 Advanced Filtering Interview Questions',
      lessonCode: '5.6',
      summary: 'Master key interview answers: IN vs BETWEEN, LIKE vs =, why = NULL fails, wildcard performance (% vs _), and inclusive range rules.',
      estimatedTime: '30 min'
    },
    {
      id: 'top-05-07',
      title: '40 Advanced Filtering Practice Questions Bank (Basic to FAANG)',
      lessonCode: '5.7',
      summary: '40 curated coding problems across 8 difficulty tiers (Level 1: LIKE to Level 8: FAANG Staff) on the employees table with instant solution reveals.',
      estimatedTime: '45 min'
    }
  ]
};

export const CHAPTER_4_TOPICS = {
  // =========================================================================
  // LESSON 5.1: LIKE OPERATOR & WILDCARDS
  // =========================================================================
  'top-05-01': {
    id: 'top-05-01',
    chapterNumber: 5,
    lessonNumber: 1,
    lessonCode: '5.1',
    title: 'LIKE Operator & Wildcard Pattern Matching (%, _)',
    subtitle: 'Pattern Search, Wildcard Mechanics, and Case-Insensitive String Filtering',
    intro: 'In real-world applications, users rarely search for exact matches. When a customer types "lap" into an e-commerce search bar or searches for an employee named "Priya", your database needs pattern matching. The SQL LIKE operator allows you to search for specified string patterns using two specialized wildcard symbols: `%` and `_`.',

    infographicImage: '/assets/sql-like-wildcards-guide.jpg',
    infographicTitle: 'SQL LIKE Operator & Wildcards (%, _)',
    infographicCaption: 'Visual Guide: % matches any sequence of characters, while _ matches strictly one single character.',

    beginnerMentalModel: {
      title: 'Wildcards Mental Model: The Accordion vs The Parking Spot',
      analogy: "Think of '%' like a stretchy elastic accordion or wildcard joker card: it can stretch to match 0 letters, 1 letter, 5 letters, or 100 letters! Think of '_' like a single reserved parking spot: exactly ONE character must park in that space.",
      keyTrick: "Memorize the 4 sacred patterns: 'A%' (starts with A), '%a' (ends with a), '%it%' (contains 'it' anywhere), and '_a%' (second letter is 'a')!",
      gotcha: "Never write WHERE name = 'A%'! The '=' operator treats '%' as a literal character and looks for someone literally named 'A%'. You MUST use LIKE with wildcards!"
    },

    comparisonTable: {
      title: 'SQL Wildcards & Pattern Semantics',
      badge: 'Core Syntax Matrix',
      headers: ['Wildcard', 'Definition / Matches', 'Example Pattern', 'What It Matches'],
      rows: [
        {
          feature: '% (Percent)',
          values: [
            'Represents zero, one, or multiple characters of any type',
            "'A%'",
            "Starts with 'A' (e.g. 'Amit', 'Ananya', 'A')"
          ]
        },
        {
          feature: '% (Percent)',
          values: [
            'Represents zero, one, or multiple characters of any type',
            "'%a'",
            "Ends with 'a' (e.g. 'Priya', 'Neha', 'Sneha')"
          ]
        },
        {
          feature: '% (Percent)',
          values: [
            'Represents zero, one, or multiple characters of any type',
            "'%it%'",
            "Contains 'it' anywhere (e.g. 'IT', 'Amit', 'Digital')"
          ]
        },
        {
          feature: '_ (Underscore)',
          values: [
            'Represents exactly ONE single character (strictly 1)',
            "'_a%'",
            "Second letter is 'a' (e.g. 'Rahul', 'Karan', 'Farhan')"
          ]
        },
        {
          feature: '_ (Underscore)',
          values: [
            'Represents exactly ONE single character (strictly 1)',
            "'_____' (5 underscores)",
            "Any name with an exact length of 5 characters"
          ]
        }
      ]
    },

    sqlSteps: [
      {
        step: 1,
        title: 'Purpose & Standard LIKE Syntax',
        badge: 'Core Syntax',
        explanation: 'The LIKE operator is paired with the WHERE clause to evaluate character patterns. Unlike the equals operator (=) which tests for identical equality, LIKE compares against a flexible template.',
        code: `-- Syntax:
SELECT column_name
FROM table_name
WHERE column_name LIKE pattern;`
      },
      {
        step: 2,
        title: "Prefix Matching: Starts with 'A'",
        badge: "Starts with 'A'",
        explanation: "Placing the wildcard '%' at the end means the string must begin with 'A', followed by any sequence of 0 or more characters.",
        code: `-- Find all employees whose name begins with 'A'
SELECT * FROM employees
WHERE name LIKE 'A%';`
      },
      {
        step: 3,
        title: "Suffix Matching: Ends with 'a'",
        badge: "Ends with 'a'",
        explanation: "Placing the wildcard '%' at the start means the string can begin with anything, but must terminate with the character 'a'.",
        code: `-- Find all employees whose name ends with 'a'
SELECT * FROM employees
WHERE name LIKE '%a';`
      },
      {
        step: 4,
        title: "Substring Matching: Contains 'it'",
        badge: "Contains 'it'",
        explanation: "Placing wildcards on both sides ('%it%') matches the substring 'it' anywhere inside the column value, whether at the beginning, middle, or end.",
        code: `-- Find all employees whose department contains 'it'
SELECT * FROM employees
WHERE department LIKE '%it%';`
      },
      {
        step: 5,
        title: "Exact Positional Matching: Second Letter is 'a'",
        badge: "Positional '_'",
        explanation: "The single underscore '_' specifies that there is exactly 1 character before 'a', followed by any number of characters ('%').",
        code: `-- Find all employees where the second character is 'a'
SELECT * FROM employees
WHERE name LIKE '_a%';`
      }
    ],

    mistakes: [
      {
        title: 'Using Equals (=) with Wildcards',
        badCode: `SELECT * FROM employees WHERE name = 'A%';`,
        explanation: "The equals operator treats '% ' as a literal character! It searches for an employee literally named 'A%' instead of performing pattern matching. You MUST use LIKE with wildcards."
      },
      {
        title: 'Confusing Underscore (_) with Percent (%)',
        badCode: `SELECT * FROM employees WHERE name LIKE '_a'; -- Only matches 2-letter names!`,
        explanation: "Underscore matches exactly ONE character. To match any characters after 'a', you must add a percent sign: `_a%`."
      }
    ],

    keyPoints: [
      'LIKE is used for pattern matching and text searching in SQL.',
      "% matches any number of characters (0, 1, or more).",
      '_ matches exactly one single character.',
      'In MySQL with standard collations, LIKE is case-insensitive by default.',
      'LIKE is the foundational mechanism powering autocomplete and backend search features.'
    ],

    note: "Interview Tip: When asked in an interview if LIKE is case-sensitive, explain that in MySQL, it depends on the column collation. By default (utf8mb4_0900_ai_ci), it is case-insensitive ('_ci' stands for case-insensitive)."
  },

  // =========================================================================
  // LESSON 5.2: IN OPERATOR
  // =========================================================================
  'top-05-02': {
    id: 'top-05-02',
    chapterNumber: 5,
    lessonNumber: 2,
    lessonCode: '5.2',
    title: 'IN Operator & Multi-Value Set Filtering',
    subtitle: 'Why IN is Better, Faster, and Cleaner than Chained OR Conditions',
    intro: 'When querying databases, you frequently need to check whether a column matches any one of multiple candidate values (for example, finding customers residing in Mumbai, Delhi, or Pune). While you could write multiple OR conditions, the IN operator provides a cleaner, more readable, and significantly more efficient syntax.',

    infographicImage: '/assets/sql-in-operator-guide.jpg',
    infographicTitle: 'SQL IN Operator vs Multiple OR Conditions',
    infographicCaption: 'Visual Guide: The IN operator groups candidate values into a clean, optimized set filter instead of repetitive OR checks.',

    beginnerMentalModel: {
      title: 'IN Operator Mental Model: The VIP Guest List',
      analogy: "Imagine a club bouncer checking IDs. Instead of asking: 'Are you Alice? OR are you Bob? OR are you Charlie?', you simply hand the bouncer a single VIP list: name IN ('Alice', 'Bob', 'Charlie'). Faster, cleaner, and zero headaches!",
      keyTrick: "Use IN whenever you compare the SAME column against multiple acceptable values. It is cleaner, faster, and works seamlessly with nested subqueries.",
      gotcha: "Quotes matter! Text values require quotes ('Mumbai', 'Delhi'), but numbers must NEVER have quotes (40000, 50000). Also beware: if a list contains NULL during a NOT IN check, it returns 0 rows!"
    },

    comparisonTable: {
      title: 'Chained OR vs IN Operator Architecture',
      badge: 'Code Quality Benchmark',
      headers: ['Dimension', 'Chained OR Syntax', 'IN Operator Syntax', 'Engineering Winner'],
      rows: [
        {
          feature: 'Readability',
          values: [
            "city = 'Mumbai' OR city = 'Delhi' OR city = 'Pune'",
            "city IN ('Mumbai', 'Delhi', 'Pune')",
            'IN (High signal-to-noise ratio)'
          ]
        },
        {
          feature: 'Subquery Support',
          values: [
            'Cannot be used directly with nested subqueries',
            'Seamlessly accepts subqueries (e.g. IN (SELECT id FROM ...))',
            'IN (Universal enterprise pattern)'
          ]
        },
        {
          feature: 'Query Optimizer',
          values: [
            'Evaluated sequentially as boolean expression tree',
            'Optimized via internal hash lookup or binary sort',
            'IN (Faster execution on large sets)'
          ]
        },
        {
          feature: 'Maintainability',
          values: [
            'Adding a 4th value requires repeating column name and OR',
            'Simply add another item to the list: city IN (..., new_val)',
            'IN (Zero code bloat)'
          ]
        }
      ]
    },

    sqlSteps: [
      {
        step: 1,
        title: 'Purpose & Basic IN Syntax',
        badge: 'Basic Syntax',
        explanation: 'The IN operator allows you to specify multiple discrete values in a WHERE clause. It acts as a shorthand for multiple OR conditions on the same column.',
        code: `-- Standard IN Syntax:
SELECT column_name
FROM table_name
WHERE column_name IN (value1, value2, value3);`
      },
      {
        step: 2,
        title: 'Filtering by Multiple Cities',
        badge: 'Example',
        explanation: "Retrieves employees whose city is either 'Mumbai' or 'Delhi'. If an employee's city matches either one, the condition evaluates to TRUE.",
        code: `-- Example: Filtering by multiple cities
SELECT * FROM employees
WHERE city IN ('Mumbai', 'Delhi');`
      },
      {
        step: 3,
        title: 'Filtering by Multiple Departments',
        badge: 'Example',
        explanation: "Easily filter by multiple categorical departments without repeating 'department = ...'.",
        code: `-- Select all employees in HR or IT
SELECT * FROM employees
WHERE department IN ('HR', 'IT');`
      },
      {
        step: 4,
        title: 'Filtering Numbers with IN (No Quotes)',
        badge: 'Numeric List',
        explanation: 'When comparing integer or decimal columns, omit quotes from the numbers inside the parenthesis.',
        code: `-- Find employees earning exactly 40000, 50000, or 60000
SELECT * FROM employees
WHERE salary IN (40000, 50000, 60000);`
      },
      {
        step: 5,
        title: 'Negating with NOT IN',
        badge: 'NOT IN',
        explanation: 'To exclude multiple values, prefix IN with NOT. This returns rows whose value does NOT appear in the specified list.',
        code: `-- Find employees who do NOT live in Mumbai or Delhi
SELECT * FROM employees
WHERE city NOT IN ('Mumbai', 'Delhi');`
      }
    ],

    mistakes: [
      {
        title: 'Forgetting Quotes Around String Literals in IN Lists',
        badCode: `WHERE city IN (Mumbai, Delhi);`,
        explanation: "Text values in SQL must ALWAYS be wrapped in single quotes: `('Mumbai', 'Delhi')`. Unquoted words are interpreted as column names."
      },
      {
        title: 'Using NOT IN with a List Containing NULL',
        badCode: `WHERE city NOT IN ('Mumbai', NULL); -- Always returns ZERO rows!`,
        explanation: "In SQL Three-Valued Logic, comparing any value against NULL results in UNKNOWN. If an IN list contains NULL during a NOT IN check, the entire condition evaluates to UNKNOWN and returns 0 rows!"
      }
    ],

    keyPoints: [
      'IN matches a column against a discrete list of values.',
      'Always prefer IN over multiple OR conditions on the same column.',
      'Text values must be single-quoted; numbers must not be quoted.',
      'IN works seamlessly with subqueries in advanced SQL.',
      'NOT IN excludes rows matching any value in the list.'
    ],

    note: 'Interview Tip: If an interviewer asks "Why is IN better than OR?", answer with the 3 Pillars: 1) Readability (eliminates repetitive column declarations), 2) Maintainability (easy to add/remove values), and 3) Subquery compatibility.'
  },

  // =========================================================================
  // LESSON 5.3: BETWEEN OPERATOR
  // =========================================================================
  'top-05-03': {
    id: 'top-05-03',
    chapterNumber: 5,
    lessonNumber: 3,
    lessonCode: '5.3',
    title: 'BETWEEN Operator & Inclusive Range Filtering',
    subtitle: 'Filtering Continuous Numerical & Date Ranges with Inclusive Boundaries',
    intro: 'When filtering data across continuous spectrums (such as salary brackets, age ranges, price intervals, or date periods), writing `>= min AND <= max` can be cumbersome. The BETWEEN operator simplifies range queries into an intuitive and clean syntax. However, one rule is paramount: BETWEEN is ALWAYS inclusive of both boundary values.',

    infographicImage: '/assets/sql-between-operator-guide.jpg',
    infographicTitle: 'SQL BETWEEN Operator (Inclusive Range Filtering)',
    infographicCaption: 'Visual Guide: Both the lower and upper bounds are strictly included: salary >= min AND salary <= max.',

    beginnerMentalModel: {
      title: 'BETWEEN Mental Model: The Inclusive Ruler',
      analogy: "If a theme park operator says 'Height must be between 40 and 60 inches', someone who is exactly 40 or exactly 60 inches IS ALLOWED ON! Both borders are included in SQL: salary >= min AND salary <= max.",
      keyTrick: "The smaller number MUST always go first: 'BETWEEN 40000 AND 60000'. Works cleanly for numbers and dates ('2023-01-01' AND '2023-12-31').",
      gotcha: "Never flip the order! 'BETWEEN 60000 AND 40000' produces 0 rows without any error message, because no number can simultaneously be >= 60000 AND <= 40000!"
    },

    comparisonTable: {
      title: 'Range Evaluation Mechanics',
      badge: 'Boundary Rules',
      headers: ['Query Syntax', 'Under-the-Hood Equivalent', 'Lower Boundary', 'Upper Boundary'],
      rows: [
        {
          feature: 'BETWEEN 40000 AND 60000',
          values: [
            'salary >= 40000 AND salary <= 60000',
            'INCLUDED (40,000 matches)',
            'INCLUDED (60,000 matches)'
          ]
        },
        {
          feature: 'NOT BETWEEN 40000 AND 60000',
          values: [
            'salary < 40000 OR salary > 60000',
            'EXCLUDED',
            'EXCLUDED'
          ]
        }
      ]
    },

    sqlSteps: [
      {
        step: 1,
        title: 'Purpose & Standard BETWEEN Syntax',
        badge: 'Core Syntax',
        explanation: 'BETWEEN is used to filter a column within a specified numerical, text, or date range. The smaller value must always come first, followed by AND and the larger value.',
        code: `-- Syntax:
SELECT column_name
FROM table_name
WHERE column_name BETWEEN value1 AND value2;`
      },
      {
        step: 2,
        title: 'Salary Range Filtering (40000 to 60000)',
        badge: 'Example',
        explanation: 'Retrieves all employees whose salary is between 40000 and 60000. Because BETWEEN is inclusive, employees earning exactly 40000 or 60000 are included.',
        code: `-- Find employees earning between 40,000 and 60,000
SELECT * FROM employees
WHERE salary BETWEEN 40000 AND 60000;`
      },
      {
        step: 3,
        title: 'Primary Key ID Ranges',
        badge: 'Numeric Range',
        explanation: 'Filter sequences of records by their unique identifiers.',
        code: `-- Find employees whose emp_id is between 2 and 4 (IDs 2, 3, 4)
SELECT * FROM employees
WHERE emp_id BETWEEN 2 AND 4;`
      },
      {
        step: 4,
        title: 'Excluding Ranges with NOT BETWEEN',
        badge: 'NOT BETWEEN',
        explanation: 'NOT BETWEEN selects records outside the range (strictly less than the minimum or strictly greater than the maximum).',
        code: `-- Select employees earning outside 40000–60000
SELECT * FROM employees
WHERE salary NOT BETWEEN 40000 AND 60000;`
      }
    ],

    mistakes: [
      {
        title: 'Reversing Boundary Values (Placing High Value First)',
        badCode: `WHERE salary BETWEEN 60000 AND 40000; -- Returns 0 rows!`,
        explanation: 'In SQL, `col BETWEEN a AND b` translates to `col >= a AND col <= b`. If a > b (e.g. 60000 > 40000), no number can simultaneously be >= 60000 AND <= 40000, so it always returns empty results.'
      },
      {
        title: 'Assuming BETWEEN is Exclusive',
        badCode: `-- Assuming 40000 and 60000 will NOT be included`,
        explanation: 'BETWEEN is ALWAYS inclusive of both endpoints! If you need strict exclusivity, write `salary > 40000 AND salary < 60000`.'
      }
    ],

    keyPoints: [
      'BETWEEN tests whether a value falls within an inclusive range.',
      'Both the lower and upper bounds are included.',
      'The smaller value MUST be placed first: BETWEEN min AND max.',
      'Works with numbers, dates, and alphabetical strings.',
      'NOT BETWEEN filters for values strictly outside the boundary.'
    ],

    note: 'Interview Question: "Is BETWEEN inclusive or exclusive?" Always answer immediately: "BETWEEN is inclusive. It includes both the starting and ending values, equivalent to >= AND <=."'
  },

  // =========================================================================
  // LESSON 5.4: THE NULL CONCEPT
  // =========================================================================
  'top-05-04': {
    id: 'top-05-04',
    chapterNumber: 5,
    lessonNumber: 4,
    lessonCode: '5.4',
    title: 'The NULL Concept: IS NULL & IS NOT NULL',
    subtitle: 'Three-Valued Logic (3VL), The Meaning of NULL, and Why = NULL Always Fails',
    intro: 'NULL is one of the most misunderstood concepts in all of database engineering. In SQL, NULL does NOT mean zero (0), nor does it mean an empty string (\'\') or spaces (\' \'). NULL represents an UNKNOWN or MISSING value. Because an unknown value cannot be compared to anything (even another unknown), SQL uses Three-Valued Logic: TRUE, FALSE, and UNKNOWN.',

    infographicImage: '/assets/sql-null-concept-guide.jpg',
    customComponent: 'NullLogicGuide',
    infographicTitle: 'The NULL Concept & Three-Valued Logic in SQL',
    infographicCaption: 'Visual Guide: NULL represents unknown or missing data (NOT zero, NOT empty string). Never compare with = NULL; always use IS NULL and IS NOT NULL.',

    beginnerMentalModel: {
      title: 'NULL Mental Model: The Mystery Gift Box',
      analogy: "Imagine an opaque, wrapped gift box with a question mark. Is whatever is inside equal to 0? No! Is it an empty string? No! Is it equal to another mysterious gift box? Nobody knows! That's why in SQL, NULL represents UNKNOWN.",
      keyTrick: "Because NULL is unknown, comparisons with '=' or '!=' evaluate to UNKNOWN and fail. You must ALWAYS use the dedicated operators 'IS NULL' and 'IS NOT NULL'!",
      gotcha: "Writing 'WHERE city = NULL' will NEVER throw an error, but it will return ZERO rows every single time, confusing every new developer! Always write 'WHERE city IS NULL'."
    },

    comparisonTable: {
      title: 'The Fundamental NULL Reality Matrix',
      badge: 'Core Theory',
      headers: ['Representation', 'Data Type / Nature', 'Is it NULL?', 'Comparison with = Operator'],
      rows: [
        {
          feature: '0 (Zero)',
          values: ['Integer number', 'NO (0 is a known quantity)', '0 = 0 evaluates to TRUE']
        },
        {
          feature: "'' (Empty String)",
          values: ['Text with 0 characters', "NO ('' is a known empty text)", "'' = '' evaluates to TRUE"]
        },
        {
          feature: "' ' (Single Space)",
          values: ['Text with 1 space char', 'NO (Length is 1)', "' ' = ' ' evaluates to TRUE"]
        },
        {
          feature: 'NULL',
          values: ['Absence of a value / Unknown', 'YES', 'NULL = NULL evaluates to UNKNOWN!']
        }
      ]
    },

    sqlSteps: [
      {
        step: 1,
        title: 'The Fatal Mistake: Why WHERE column = NULL Fails',
        badge: 'Common Trap',
        explanation: 'If you write `WHERE city = NULL`, the database does NOT return rows where city is missing! In SQL, comparing anything to NULL using `= ` or `!= ` yields UNKNOWN. Since a WHERE clause only returns rows where the condition is TRUE, zero rows are returned.',
        code: `-- ❌ WRONG (Never returns anything):
SELECT * FROM employees WHERE city = NULL;

-- ❌ WRONG (Also fails):
SELECT * FROM employees WHERE city != NULL;`
      },
      {
        step: 2,
        title: 'The Correct Syntax: IS NULL',
        badge: 'IS NULL',
        explanation: 'To check for missing or unassigned values, SQL provides the dedicated IS NULL operator.',
        code: `-- ✅ CORRECT: Finds employees who have no city recorded
SELECT * FROM employees
WHERE city IS NULL;`
      },
      {
        step: 3,
        title: 'Finding Populated Records: IS NOT NULL',
        badge: 'IS NOT NULL',
        explanation: 'To filter for records that definitely contain a valid, recorded value, use IS NOT NULL.',
        code: `-- ✅ CORRECT: Finds employees with a known city
SELECT * FROM employees
WHERE city IS NOT NULL;`
      },
      {
        step: 4,
        title: 'Aggregating with NULL: COUNT(*) vs COUNT(column)',
        badge: 'Aggregation Rule',
        explanation: 'COUNT(*) counts all physical rows, regardless of whether columns are NULL. However, COUNT(column_name) ignores NULL values!',
        code: `-- Count how many employees have a missing city
SELECT COUNT(*) AS count
FROM employees
WHERE city IS NULL;`
      }
    ],

    mistakes: [
      {
        title: 'Using = NULL or != NULL',
        badCode: `SELECT * FROM employees WHERE city = NULL;`,
        explanation: 'Always use `IS NULL` or `IS NOT NULL`. Equals comparisons with NULL evaluate to UNKNOWN and never return rows.'
      },
      {
        title: 'Assuming NULL Equals NULL',
        badCode: `-- Assuming two NULLs in the same column are equal`,
        explanation: 'Two unknown values cannot be considered equal because neither value is known.'
      }
    ],

    keyPoints: [
      'NULL represents unknown, missing, or unavailable information.',
      'NULL is NOT equal to 0, and NOT equal to an empty string.',
      'Never compare NULL with = or !=; always use IS NULL and IS NOT NULL.',
      'SQL operates on Three-Valued Logic: TRUE, FALSE, and UNKNOWN.',
      'COUNT(*) includes NULL rows; COUNT(column) ignores NULLs.'
    ],

    note: 'Interview Gold: "Why cannot NULL be compared using =?" Answer: "Because in SQL, NULL represents an UNKNOWN value. In Three-Valued Logic, comparing something to an unknown yields UNKNOWN, never TRUE. Therefore, the special operators IS NULL and IS NOT NULL must be used."'
  },

  // =========================================================================
  // LESSON 5.5: COMBINED REAL-WORLD QUERIES & MEMORY BOX
  // =========================================================================
  'top-05-05': {
    id: 'top-05-05',
    chapterNumber: 5,
    lessonNumber: 5,
    lessonCode: '5.5',
    title: 'Combined Real-World Queries & Memory Box',
    subtitle: 'Combining LIKE, IN, BETWEEN & NULL with Operator Precedence',
    intro: 'In production software and enterprise analytics, filter criteria rarely consist of a single condition. You routinely need to filter by geographic clusters (IN), budget constraints (BETWEEN), search terms (LIKE), and data integrity states (IS NOT NULL) in one unified statement.',

    infographicImage: '/assets/sql-advanced-filtering-3d.jpg',
    infographicTitle: 'Mastering Advanced Filtering in SQL',
    infographicCaption: 'Visual Architecture: Combining pattern matching, discrete set matching, range filtering, and NULL handling into one unified query.',

    beginnerMentalModel: {
      title: 'Master Query Mental Model: The Superpower Combination',
      analogy: "Think of SQL like building with LEGO superpowers: LIKE gives you the spyglass (pattern search), IN gives you the sorting tray (discrete sets), BETWEEN gives you the slider ruler (ranges), and IS NULL cleans up the unknown mystery boxes!",
      keyTrick: "Parentheses are your best friend: in SQL, AND takes precedence over OR. If you want employees from (Mumbai OR Pune) earning > 50k, ALWAYS wrap the OR in parentheses: (city = 'Mumbai' OR city = 'Pune') AND salary > 50000!",
      gotcha: "If you omit parentheses in 'city = Mumbai OR city = Pune AND salary > 50000', the query grabs EVERY SINGLE person in Mumbai regardless of salary, plus Pune earners > 50k!"
    },

    comparisonTable: {
      title: 'Quick Memory Box — Cheat Sheet',
      badge: 'Flashcard Anchor',
      headers: ['Operator', 'Primary Role', 'Syntax Anchor', 'Key Interview Rule'],
      rows: [
        {
          feature: 'LIKE',
          values: ['Pattern search', "WHERE name LIKE 'A%'", '% = any chars; _ = single char']
        },
        {
          feature: 'IN',
          values: ['Discrete set matching', "WHERE city IN ('Mumbai', 'Delhi')", 'Cleaner & faster than chained OR']
        },
        {
          feature: 'BETWEEN',
          values: ['Continuous range', 'WHERE salary BETWEEN 40k AND 70k', 'Inclusive of both boundaries']
        },
        {
          feature: 'IS NULL',
          values: ['Missing values', 'WHERE city IS NULL', 'Never compare with = NULL']
        }
      ]
    },

    sqlSteps: [
      {
        step: 1,
        title: 'The Master Combined Query',
        badge: 'Enterprise Standard',
        explanation: 'A compound query combining set membership (IN), numerical boundaries (BETWEEN), and prefix pattern matching (LIKE).',
        code: `-- Combined Real-World Filtering Query
SELECT name, salary
FROM employees
WHERE city IN ('Mumbai', 'Delhi')
  AND salary BETWEEN 40000 AND 70000
  AND name LIKE 'A%';`
      },
      {
        step: 2,
        title: 'Operator Precedence: AND takes precedence over OR',
        badge: 'Operator Precedence',
        explanation: 'In SQL, AND has higher precedence than OR. When mixing AND with OR, ALWAYS wrap OR clauses in parentheses to avoid unexpected logical evaluation.',
        code: `-- Correct: Grouping OR inside parentheses
SELECT * FROM employees
WHERE (city = 'Mumbai' OR city = 'Pune')
  AND salary > 50000;`
      }
    ],

    mistakes: [
      {
        title: 'Omitting Parentheses When Mixing AND with OR',
        badCode: `SELECT * FROM employees WHERE city = 'Mumbai' OR city = 'Pune' AND salary > 50000;`,
        explanation: "Because AND is evaluated before OR, this query returns: Anyone in Mumbai (regardless of salary!) PLUS Pune employees earning > 50000. Always use parentheses: `(city = 'Mumbai' OR city = 'Pune') AND salary > 50000`."
      }
    ],

    keyPoints: [
      'Combine multiple filtering operators using AND and OR.',
      'AND has higher logical precedence than OR.',
      'Always use explicit parentheses when mixing AND with OR conditions.',
      'The Quick Memory Box anchors LIKE, %, _, IN, BETWEEN, and IS NULL.'
    ],

    note: 'Best Practice: Whenever your query contains both AND and OR, write parentheses explicitly. It prevents subtle bugs and makes your code self-documenting.'
  },

  // =========================================================================
  // LESSON 5.6: TOP 5 ADVANCED FILTERING INTERVIEW QUESTIONS
  // =========================================================================
  'top-05-06': {
    id: 'top-05-06',
    chapterNumber: 5,
    lessonNumber: 6,
    lessonCode: '5.6',
    title: 'Top 5 Advanced Filtering Interview Questions',
    subtitle: 'Standard Tech Interview Questions with In-Depth Technical Explanations',
    intro: 'During SQL and backend engineering interviews, technical recruiters frequently test your understanding of edge cases, three-valued logic, and operator performance. Here are the top 5 questions with comprehensive, high-scoring answers.',

    beginnerMentalModel: {
      title: 'Interview Success Mental Model: Confidence in the Edge Cases',
      analogy: "Tech recruiters ask these questions not to test your memory, but to see if you understand HOW databases actually think under the hood (Three-Valued Logic, continuous intervals, and string parser cost).",
      keyTrick: "Whenever asked about NULL, immediately mention 'Three-Valued Logic: TRUE, FALSE, and UNKNOWN'. Whenever asked about BETWEEN, immediately say 'It is strictly inclusive of both borders'.",
      gotcha: "Never say 'NULL is zero or empty'. That is the #1 mistake that disqualifies junior applicants in database rounds!"
    },

    comparisonTable: {
      title: 'Top 5 Filtering Questions Quick Reference',
      badge: 'Interview Cheatsheet',
      headers: ['Question', 'Core Concept', 'Expected High-Scoring Answer'],
      rows: [
        {
          feature: '1. IN vs BETWEEN',
          values: ['Discrete vs Continuous', 'IN checks discrete distinct lists; BETWEEN checks a continuous range.']
        },
        {
          feature: '2. LIKE vs =',
          values: ['Pattern vs Exact', '= tests exact byte/character equality; LIKE supports wildcards (% and _).']
        },
        {
          feature: '3. Why = NULL fails',
          values: ['Three-Valued Logic', 'NULL is unknown; comparisons with = yield UNKNOWN (never TRUE).']
        },
        {
          feature: '4. % vs _ Speed',
          values: ['Wildcard Performance', '_ is generally faster because it has a fixed length (1 character).']
        },
        {
          feature: '5. Is BETWEEN inclusive?',
          values: ['Range Boundaries', 'YES, always inclusive of both minimum and maximum bounds.']
        }
      ]
    },

    sqlSteps: [
      {
        step: 1,
        title: 'Q1: What is the difference between IN and BETWEEN?',
        badge: 'Interview Q1',
        explanation: 'IN is used for matching against a discrete, individual list of values (e.g. city IN (\'Mumbai\', \'Pune\')). BETWEEN is used for continuous ranges between two boundary limits (e.g. salary BETWEEN 40000 AND 60000).',
        code: `-- IN: Discrete specific values
SELECT * FROM employees WHERE emp_id IN (1, 3, 5);

-- BETWEEN: Continuous inclusive range
SELECT * FROM employees WHERE emp_id BETWEEN 1 AND 5; -- (includes 1, 2, 3, 4, 5)`
      },
      {
        step: 2,
        title: 'Q2: What is the difference between LIKE and = operator?',
        badge: 'Interview Q2',
        explanation: "The equals operator (=) performs an exact character-by-character match without wildcard expansion. The LIKE operator enables pattern matching using wildcards ('%' and '_') to match variable substrings.",
        code: `-- Exact match:
SELECT * FROM employees WHERE name = 'Amit';

-- Pattern match:
SELECT * FROM employees WHERE name LIKE 'A%';`
      },
      {
        step: 3,
        title: 'Q3: Why cannot NULL be compared using the = operator?',
        badge: 'Interview Q3',
        explanation: 'In ANSI SQL, NULL represents an UNKNOWN value. In Three-Valued Logic, comparing an unknown value to anything (even another unknown value) results in UNKNOWN. Since SQL WHERE clauses only return records that evaluate to TRUE, `= NULL` always evaluates to UNKNOWN and returns 0 rows.',
        code: `-- Correct approach:
SELECT * FROM employees WHERE city IS NULL;`
      },
      {
        step: 4,
        title: 'Q4: Which wildcard is faster: % or _?',
        badge: 'Interview Q4',
        explanation: "The underscore '_' wildcard is generally faster because the database engine knows the exact character length required (precisely 1 character). The '%' wildcard requires the engine to test variable lengths (0 to N characters), which increases parsing and regex backtrack overhead.",
        code: `-- Faster (Exact 1 char check):
SELECT * FROM employees WHERE name LIKE '_a';

-- Slower (Variable length search):
SELECT * FROM employees WHERE name LIKE '%a';`
      },
      {
        step: 5,
        title: 'Q5: Is the BETWEEN operator inclusive or exclusive?',
        badge: 'Interview Q5',
        explanation: 'BETWEEN is ALWAYS inclusive of both endpoints. Writing `BETWEEN 40000 AND 60000` is mathematically equivalent to `>= 40000 AND <= 60000`.',
        code: `-- Inclusive boundaries:
SELECT * FROM employees
WHERE salary BETWEEN 40000 AND 60000;`
      }
    ],

    mistakes: [],
    keyPoints: [
      'Master the distinction between discrete sets (IN) and continuous ranges (BETWEEN).',
      'Explain Three-Valued Logic when discussing NULL.',
      'Remember that BETWEEN includes both minimum and maximum values.',
      'Explain wildcard backtracking when discussing % vs _.'
    ],

    note: 'Confidence Builder: If you can articulate Three-Valued Logic and inclusive boundaries smoothly, interviewers immediately recognize strong database fundamentals.'
  },

  // =========================================================================
  // LESSON 5.7: 40 ADVANCED FILTERING PRACTICE QUESTIONS BANK
  // =========================================================================
  'top-05-07': {
    id: 'top-05-07',
    chapterNumber: 5,
    lessonNumber: 7,
    lessonCode: '5.7',
    title: '40 Advanced Filtering Practice Questions Bank (Basic to FAANG)',
    subtitle: 'Comprehensive 8-Level Hands-on Question Set on the employees Table with Instant Solution Reveals',
    intro: 'Put your Day 4 Advanced Filtering skills to the test with 40 standardized coding and interview problems on the employees table. Questions progress smoothly from Level 1 (LIKE Foundations) through Level 7 (FAANG Senior Traps like ESCAPE, Collation, NOT IN NULL) and Level 8 (FAANG Staff Extreme like Sargable Indexes and Search Simulators). Try writing each query first before revealing the verified solution!',

    isQuestionsBankTopic: true,
    isQuestionBank: true,
    questionBankType: 'filtering',

    sqlSteps: [],
    mistakes: [],
    keyPoints: [
      'Level 1 (LIKE): Prefix, suffix, substring, and single-character wildcard queries.',
      'Level 2 (IN): Multiple values, numeric sets, and primary key lists.',
      'Level 3 (BETWEEN): Inclusive ranges and NOT BETWEEN exclusion.',
      'Level 4 (NULL): IS NULL, IS NOT NULL, and COUNT(*) on NULLs (Q20).',
      'Level 5 (MIXED): Compound queries with AND/OR logic.',
      'Level 6 (REAL THINKING): Advanced functions like LENGTH(name) = 5 (Q29) and vowel REGEXP (Q30).',
      'Level 7 (FAANG TRAPS): Wildcard ESCAPE, safe NOT IN NULL guards, case-sensitive binary checks, and regex backreferences.',
      'Level 8 (FAANG STAFF): Production search simulators, palindrome string symmetry, disjunctive data quarantine, and index-sargable range filtering.'
    ],
    note: 'Mastering these 40 questions ensures complete command over SQL filtering from absolute beginner fundamentals up to Staff-level FAANG technical interviews.'
  }
};
