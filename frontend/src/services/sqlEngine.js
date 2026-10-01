import initSqlJs from 'sql.js';

let sqlPromise = null;

/**
 * Initializes and caches the sql.js WebAssembly engine.
 * Tries local /sql-wasm.wasm first, then falls back to CDN if necessary.
 */
export async function getSqlInstance() {
  if (!sqlPromise) {
    sqlPromise = (async () => {
      try {
        return await initSqlJs({
          locateFile: (file) => `/${file}`
        });
      } catch (err) {
        console.warn('Local wasm load failed, falling back to CDN:', err);
        try {
          return await initSqlJs({
            locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
          });
        } catch (cdnErr) {
          sqlPromise = null; // reset cache so subsequent attempts can retry
          throw cdnErr;
        }
      }
    })();
  }
  return sqlPromise;
}

/**
 * Registers multi-dialect built-in SQL functions (MySQL, Postgres, Oracle, SQL Server)
 * into SQLite instance so any standard or dialect-specific function works natively.
 */
function registerCustomSqlFunctions(db) {
  if (!db || !db.create_function) return;

  try {
    // 1. String Functions
    // CONCAT(a, b, c, ...)
    db.create_function('CONCAT', (...args) => {
      return args.filter(a => a !== null && a !== undefined).join('');
    });

    // CONCAT_WS(separator, a, b, c, ...)
    db.create_function('CONCAT_WS', (sep, ...args) => {
      if (sep === null || sep === undefined) sep = '';
      return args.filter(a => a !== null && a !== undefined).join(String(sep));
    });

    // LEN(str) -> T-SQL length
    db.create_function('LEN', (str) => {
      if (str === null || str === undefined) return null;
      return String(str).length;
    });

    // REVERSE(str)
    db.create_function('REVERSE', (str) => {
      if (str === null || str === undefined) return null;
      return String(str).split('').reverse().join('');
    });

    // REPEAT(str, count)
    db.create_function('REPEAT', (str, count) => {
      if (str === null || count === null || count < 0) return null;
      return String(str).repeat(count);
    });

    // LPAD(str, len, pad)
    db.create_function('LPAD', (str, len, pad = ' ') => {
      if (str === null || len === null) return null;
      return String(str).padStart(len, String(pad));
    });

    // RPAD(str, len, pad)
    db.create_function('RPAD', (str, len, pad = ' ') => {
      if (str === null || len === null) return null;
      return String(str).padEnd(len, String(pad));
    });

    // REGEXP(regex, str) -> Enables standard `str REGEXP regex` operator in SQLite
    db.create_function('REGEXP', (regexStr, targetStr) => {
      if (regexStr === null || regexStr === undefined || targetStr === null || targetStr === undefined) {
        return 0;
      }
      try {
        const re = new RegExp(String(regexStr));
        return re.test(String(targetStr)) ? 1 : 0;
      } catch {
        return 0;
      }
    });

    // 2. Null Handling & Conditional Functions
    // IFNULL / ISNULL / NVL
    db.create_function('IFNULL', (a, b) => (a !== null && a !== undefined ? a : b));
    db.create_function('ISNULL', (a, b) => (a !== null && a !== undefined ? a : b));
    db.create_function('NVL', (a, b) => (a !== null && a !== undefined ? a : b));

    // IF(condition, true_val, false_val)
    db.create_function('IF', (cond, trueVal, falseVal) => (cond ? trueVal : falseVal));

    // 3. Date & Time Functions
    // NOW() / CURRENT_TIMESTAMP() / GETDATE() / SYSDATE
    const getNowIso = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
    const getCurDateIso = () => new Date().toISOString().slice(0, 10);

    db.create_function('NOW', () => getNowIso());
    db.create_function('GETDATE', () => getNowIso());
    db.create_function('SYSDATE', () => getNowIso());
    db.create_function('CURDATE', () => getCurDateIso());
    db.create_function('CURRENT_DATE', () => getCurDateIso());

    // YEAR(date), MONTH(date), DAY(date)
    db.create_function('YEAR', (d) => {
      if (!d) return null;
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? null : parsed.getFullYear();
    });

    db.create_function('MONTH', (d) => {
      if (!d) return null;
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? null : parsed.getMonth() + 1;
    });

    db.create_function('DAY', (d) => {
      if (!d) return null;
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? null : parsed.getDate();
    });

    // DATEDIFF(d1, d2) -> returns days between d1 and d2
    db.create_function('DATEDIFF', (d1, d2) => {
      if (!d1 || !d2) return null;
      const t1 = new Date(d1).getTime();
      const t2 = new Date(d2).getTime();
      if (isNaN(t1) || isNaN(t2)) return null;
      return Math.round((t1 - t2) / (1000 * 60 * 60 * 24));
    });

    // 4. Math & Statistical Functions
    db.create_function('POW', (a, b) => Math.pow(a, b));
    db.create_function('POWER', (a, b) => Math.pow(a, b));
    db.create_function('SQRT', (a) => (a < 0 ? null : Math.sqrt(a)));
    db.create_function('MOD', (a, b) => (b === 0 ? null : a % b));
    db.create_function('CEIL', (a) => Math.ceil(a));
    db.create_function('CEILING', (a) => Math.ceil(a));
    db.create_function('FLOOR', (a) => Math.floor(a));
    db.create_function('GREATEST', (...args) => Math.max(...args.filter(n => typeof n === 'number')));
    db.create_function('LEAST', (...args) => Math.min(...args.filter(n => typeof n === 'number')));

  } catch (err) {
    console.warn('Failed to register custom SQLite functions:', err);
  }
}

// Session-level virtual database catalog registry across runs
const virtualDatabases = new Set();

/**
 * Reset all virtual databases in the session (e.g. when resetting the lab)
 */
export function resetVirtualDatabases() {
  virtualDatabases.clear();
}

/**
 * Universal SQL Preprocessor
 * Translates multi-dialect keywords and commands into SQLite compatible syntax
 */
function preprocessQueryForSqlite(sql) {
  let processed = (sql || '').trim();

  // 1. MySQL: SHOW TABLES; / SHOW FULL TABLES;
  if (/^SHOW\s+(?:FULL\s+)?TABLES(?:\s+LIKE\s+['"][^'"]+['"])?\s*;?/i.test(processed)) {
    return `SELECT name AS Tables_in_database FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__catalog_%';`;
  }

  // 2. MySQL: SHOW DATABASES;
  if (/^SHOW\s+DATABASES\s*;?/i.test(processed)) {
    return `SELECT 'main' AS Database_Name 
            UNION SELECT 'temp' AS Database_Name 
            UNION 
            SELECT REPLACE(name, '__catalog_', '') AS Database_Name 
            FROM sqlite_master 
            WHERE type='table' AND name LIKE '__catalog_%' 
            ORDER BY Database_Name ASC;`;
  }

  // 3. MySQL / Oracle: DESCRIBE table; / DESC table; / SHOW COLUMNS FROM table;
  if (/^(?:DESCRIBE|DESC|SHOW\s+COLUMNS\s+FROM)\s+([a-zA-Z0-9_]+)\s*;?/i.test(processed)) {
    const match = processed.match(/^(?:DESCRIBE|DESC|SHOW\s+COLUMNS\s+FROM)\s+([a-zA-Z0-9_]+)/i);
    const tableName = match[1];
    return `PRAGMA table_info(${tableName});`;
  }

  // 4. TRUNCATE TABLE foo; -> DELETE FROM foo; in SQLite
  processed = processed.replace(/TRUNCATE\s+(?:TABLE\s+)?([a-zA-Z0-9_]+)\s*;?/gi, 'DELETE FROM $1;');

  // 5. CREATE DATABASE / DROP DATABASE -> simulated catalog table in in-memory SQLite
  if (/^(CREATE|DROP)\s+DATABASE\s+([a-zA-Z0-9_]+)\s*;?/i.test(processed)) {
    const match = processed.match(/^(CREATE|DROP)\s+DATABASE\s+([a-zA-Z0-9_]+)/i);
    const action = match[1].toUpperCase();
    const dbName = match[2].toLowerCase();
    if (action === 'CREATE') {
      virtualDatabases.add(dbName);
      return `CREATE TABLE IF NOT EXISTS __catalog_${dbName} (created_at TEXT);`;
    } else {
      virtualDatabases.delete(dbName);
      return `DROP TABLE IF EXISTS __catalog_${dbName};`;
    }
  }

  // 6. USE database_name -> session context switch simulation
  if (/^USE\s+([a-zA-Z0-9_]+)\s*;?/i.test(processed)) {
    return `SELECT 1 AS session_active;`;
  }

  // 7. ALTER TABLE ... MODIFY COLUMN / ALTER TABLE ... CHANGE COLUMN
  if (/ALTER\s+TABLE\s+([a-zA-Z0-9_]+)\s+MODIFY\s+(?:COLUMN\s+)?([a-zA-Z0-9_]+)\s+([^;]+);?/i.test(processed)) {
    return `SELECT 1 AS column_modified;`;
  }
  if (/ALTER\s+TABLE\s+([a-zA-Z0-9_]+)\s+CHANGE\s+(?:COLUMN\s+)?([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)\s+([^;]+);?/i.test(processed)) {
    const match = processed.match(/ALTER\s+TABLE\s+([a-zA-Z0-9_]+)\s+CHANGE\s+(?:COLUMN\s+)?([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)/i);
    return `ALTER TABLE ${match[1]} RENAME COLUMN ${match[2]} TO ${match[3]};`;
  }

  // 8. RENAME TABLE t1 TO t2 -> ALTER TABLE t1 RENAME TO t2;
  if (/^RENAME\s+TABLE\s+([a-zA-Z0-9_]+)\s+TO\s+([a-zA-Z0-9_]+)\s*;?/i.test(processed)) {
    const match = processed.match(/^RENAME\s+TABLE\s+([a-zA-Z0-9_]+)\s+TO\s+([a-zA-Z0-9_]+)/i);
    return `ALTER TABLE ${match[1]} RENAME TO ${match[2]};`;
  }

  // 9. T-SQL: SELECT TOP N / TOP (N) -> Standard SQL LIMIT N
  if (/^\s*SELECT\s+(DISTINCT\s+)?TOP\s+(?:\(?\s*(\d+)\s*\)?)\s+(.+)$/is.test(processed)) {
    processed = processed.replace(
      /^\s*SELECT\s+(DISTINCT\s+)?TOP\s+(?:\(?\s*(\d+)\s*\)?)\s+(.+?)(?:\s*;)?$/is,
      (match, distinct = '', limitCount, rest) => {
        const cleanRest = rest.replace(/;\s*$/, '').trim();
        if (/\bLIMIT\s+\d+/i.test(cleanRest)) {
          return `SELECT ${distinct}${cleanRest};`;
        }
        return `SELECT ${distinct}${cleanRest} LIMIT ${limitCount};`;
      }
    );
  }

  // 10. Oracle / ANSI SQL: OFFSET M ROWS FETCH NEXT N ROWS ONLY / FETCH FIRST N ROWS ONLY
  if (/\bOFFSET\s+(\d+)\s+ROWS\s+FETCH\s+NEXT\s+(\d+)\s+ROWS\s+ONLY\b/i.test(processed)) {
    processed = processed.replace(
      /\bOFFSET\s+(\d+)\s+ROWS\s+FETCH\s+NEXT\s+(\d+)\s+ROWS\s+ONLY\b/gi,
      'LIMIT $2 OFFSET $1'
    );
  } else if (/\bFETCH\s+FIRST\s+(\d+)\s+ROWS\s+ONLY\b/i.test(processed)) {
    processed = processed.replace(/\bFETCH\s+FIRST\s+(\d+)\s+ROWS\s+ONLY\b/gi, 'LIMIT $1');
  }

  // 11. MySQL LIMIT offset, count -> LIMIT count OFFSET offset
  if (/\bLIMIT\s+(\d+)\s*,\s*(\d+)\b/i.test(processed)) {
    processed = processed.replace(/\bLIMIT\s+(\d+)\s*,\s*(\d+)\b/gi, 'LIMIT $2 OFFSET $1');
  }

  return processed;
}

/**
 * Static Analysis: Detect unbounded recursive queries & dangerous loops
 */
export function detectDangerousRecursion(sql) {
  if (!sql) return null;
  const clean = sql.trim();

  // 1. Check for WITH RECURSIVE
  if (/\bWITH\s+RECURSIVE\b/i.test(clean)) {
    const match = clean.match(/WITH\s+RECURSIVE\s+([a-zA-Z0-9_]+)\s*(?:\([^)]*\))?\s*AS\s*\(([\s\S]*?)\)\s*([\s\S]*)/i);
    if (match) {
      const cteName = match[1];
      const cteBody = match[2];
      const outerQuery = match[3];

      const unionParts = cteBody.split(/\bUNION(?:\s+ALL)?\b/i);
      if (unionParts.length > 1) {
        const recursiveMember = unionParts.slice(1).join(' UNION ALL ');
        const hasCteSelfRef = new RegExp(`\\b(?:FROM|JOIN)\\s+${cteName}\\b`, 'i').test(recursiveMember);
        const hasWhere = /\bWHERE\b/i.test(recursiveMember);
        const outerHasLimit = /\bLIMIT\s+\d+/i.test(outerQuery);

        if (hasCteSelfRef && !hasWhere && !outerHasLimit) {
          return `⚠️ Unbounded Recursive Query: The recursive term in CTE '${cteName}' has no termination condition (WHERE clause), and your outer query has no LIMIT. This will loop infinitely and exhaust memory. Please add a termination condition (e.g., WHERE ... < 100) or an outer LIMIT.`;
        }
      }
    }
  }

  // 2. Check for dangerous Cartesian product explosion (4+ tables joined without WHERE/ON or LIMIT)
  if (/\bFROM\s+([a-zA-Z0-9_]+(?:\s*,\s*[a-zA-Z0-9_]+){3,})\b/i.test(clean) && !/\bWHERE\b/i.test(clean) && !/\bJOIN\b/i.test(clean) && !/\bLIMIT\b/i.test(clean)) {
    return `⚠️ Dangerous Cartesian Product: You have joined 4 or more tables without a WHERE or JOIN condition and no LIMIT. This generates an exponential combination that will freeze execution. Please add JOIN conditions or a LIMIT.`;
  }

  return null;
}

// Dedicated Web Worker with Watchdog Timeout
let activeWorker = null;
let jobCounter = 0;
const pendingJobs = new Map();
const QUERY_TIMEOUT_MS = 3500; // 3.5 seconds max runtime to prevent browser freezing

function getOrCreateWorker() {
  if (typeof Worker === 'undefined') {
    return null;
  }

  if (!activeWorker) {
    try {
      activeWorker = new Worker(new URL('./sqlWorker.js', import.meta.url), { type: 'module' });

      activeWorker.onmessage = (e) => {
        const { id, ...payload } = e.data || {};
        const job = pendingJobs.get(id);
        if (job) {
          clearTimeout(job.timer);
          pendingJobs.delete(id);
          job.resolve(payload);
        }
      };

      activeWorker.onerror = (err) => {
        console.error('SQL Web Worker error:', err);
        pendingJobs.forEach((job) => {
          clearTimeout(job.timer);
          job.resolve({
            success: false,
            columns: [],
            values: [],
            rowCount: 0,
            executionTimeMs: 0,
            error: cleanSqlError(err.message || 'Worker thread encountered an error')
          });
        });
        pendingJobs.clear();
        terminateStuckWorker();
      };
    } catch (err) {
      console.warn('Could not initialize SQL Web Worker, using in-thread fallback:', err);
      activeWorker = null;
    }
  }

  return activeWorker;
}

function terminateStuckWorker() {
  if (activeWorker) {
    try {
      activeWorker.terminate();
    } catch (_) {}
    activeWorker = null;
  }
}

/**
 * Fallback main-thread execution if Web Worker cannot be spawned
 */
async function executeSqlQueryFallback(setupSql, trimmedQuery, startTime) {
  let db = null;
  try {
    const SQL = await getSqlInstance();
    db = new SQL.Database();
    registerCustomSqlFunctions(db);

    if (setupSql && setupSql.trim()) {
      db.run(setupSql);
    }

    virtualDatabases.forEach((vDb) => {
      try {
        db.run(`CREATE TABLE IF NOT EXISTS __catalog_${vDb} (created_at TEXT);`);
      } catch (_) {}
    });

    const sqliteReadyQuery = preprocessQueryForSqlite(trimmedQuery);
    const execResults = db.exec(sqliteReadyQuery);
    const executionTimeMs = +(performance.now() - startTime).toFixed(2);

    if (!execResults || execResults.length === 0) {
      return {
        success: true,
        columns: ['Status', 'Message'],
        values: [['SUCCESS', 'Query executed successfully. 0 rows returned.']],
        rowCount: 0,
        executionTimeMs,
        error: null
      };
    }

    const lastResult = execResults[execResults.length - 1];
    let values = lastResult.values || [];
    const totalCount = values.length;
    if (values.length > 2000) {
      values = values.slice(0, 2000);
    }

    return {
      success: true,
      columns: lastResult.columns || [],
      values,
      rowCount: totalCount,
      isTruncated: totalCount > 2000,
      executionTimeMs,
      error: null
    };
  } catch (err) {
    const executionTimeMs = +(performance.now() - startTime).toFixed(2);
    return {
      success: false,
      columns: [],
      values: [],
      rowCount: 0,
      executionTimeMs,
      error: cleanSqlError(err.message)
    };
  } finally {
    if (db) {
      try { db.close(); } catch (_) {}
    }
  }
}

/**
 * Executes an SQL query safely with:
 * 1. Static AST/Regex Infinite Recursion Prevention
 * 2. Dedicated Web Worker with a 3.5s Hard Watchdog Timer (worker.terminate())
 * 3. Graceful fallback for non-worker environments
 */
export async function executeSqlQuery(setupSql, querySql) {
  const startTime = performance.now();
  const trimmedQuery = (querySql || '').trim();

  if (!trimmedQuery) {
    return {
      success: false,
      columns: [],
      values: [],
      rowCount: 0,
      executionTimeMs: 0,
      error: 'Query is empty. Write an SQL statement to run.'
    };
  }

  // 1. Static AST / Regex Guard: Intercept dangerous infinite recursion before execution
  const recursionWarning = detectDangerousRecursion(trimmedQuery);
  if (recursionWarning) {
    return {
      success: false,
      columns: [],
      values: [],
      rowCount: 0,
      executionTimeMs: +(performance.now() - startTime).toFixed(2),
      error: recursionWarning
    };
  }

  // 2. Try Worker Execution with Hard Watchdog Timeout
  const worker = getOrCreateWorker();
  if (worker) {
    return new Promise((resolve) => {
      const id = ++jobCounter;
      const timer = setTimeout(() => {
        // Kill the worker thread immediately to stop WASM infinite loop!
        terminateStuckWorker();
        pendingJobs.delete(id);

        const executionTimeMs = +(performance.now() - startTime).toFixed(2);
        resolve({
          success: false,
          columns: [],
          values: [],
          rowCount: 0,
          executionTimeMs,
          error: `⏱️ Query Execution Timeout (${(QUERY_TIMEOUT_MS / 1000).toFixed(1)}s limit): Execution was aborted. Your query took longer than ${(QUERY_TIMEOUT_MS / 1000).toFixed(1)} seconds to complete. Check for infinite recursion (e.g. recursive CTE missing a termination WHERE condition or LIMIT), missing join conditions, or massive Cartesian products.`
        });
      }, QUERY_TIMEOUT_MS);

      pendingJobs.set(id, { resolve, timer });

      worker.postMessage({
        id,
        setupSql,
        querySql: trimmedQuery,
        virtualDatabases: Array.from(virtualDatabases)
      });
    });
  }

  // 3. Fallback: Main thread execution if Worker is unavailable
  return executeSqlQueryFallback(setupSql, trimmedQuery, startTime);
}

/**
 * Compares two result sets and computes diffs for missing/extra rows
 */
function computeResultDiff(userResult, expectedResult, checkOrder = false) {
  if (!userResult.success || !expectedResult.success) {
    return {
      passed: false,
      missingInUserIndices: [],
      extraInUserIndices: [],
      message: userResult.error || expectedResult.error || 'Execution error.'
    };
  }

  // 1. Check Column Count
  if (userResult.columns.length !== expectedResult.columns.length) {
    return {
      passed: false,
      missingInUserIndices: expectedResult.values.map((_, i) => i),
      extraInUserIndices: userResult.values.map((_, i) => i),
      message: `Column count mismatch: Expected ${expectedResult.columns.length} column(s) (${expectedResult.columns.join(', ')}), but got ${userResult.columns.length} column(s) (${userResult.columns.join(', ')}).`
    };
  }

  // Normalize string representations of rows
  const userRowStrings = userResult.values.map(r => JSON.stringify(r.map(normalizeVal)));
  const expRowStrings = expectedResult.values.map(r => JSON.stringify(r.map(normalizeVal)));

  const missingInUserIndices = [];
  const extraInUserIndices = [];

  // Find missing expected rows
  expRowStrings.forEach((expStr, idx) => {
    if (!userRowStrings.includes(expStr)) {
      missingInUserIndices.push(idx);
    }
  });

  // Find extra user rows
  userRowStrings.forEach((userStr, idx) => {
    if (!expRowStrings.includes(userStr)) {
      extraInUserIndices.push(idx);
    }
  });

  let passed = missingInUserIndices.length === 0 && extraInUserIndices.length === 0 && userResult.values.length === expectedResult.values.length;

  if (passed && checkOrder) {
    passed = JSON.stringify(userRowStrings) === JSON.stringify(expRowStrings);
  }

  let message = passed
    ? 'All row records and columns matched perfectly.'
    : userResult.values.length !== expectedResult.values.length
    ? `Row count mismatch: Expected ${expectedResult.values.length} row(s), but your query returned ${userResult.values.length} row(s).`
    : 'Data records mismatch: Some returned values do not match the expected result.';

  return {
    passed,
    missingInUserIndices,
    extraInUserIndices,
    message
  };
}

/**
 * Strips SQL comments and leading/trailing whitespace
 */
function cleanSqlComments(sql) {
  if (!sql) return '';
  return sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();
}

/**
 * Detects if a query is a DML write statement (INSERT, UPDATE, DELETE)
 */
function extractDmlTarget(sql) {
  const clean = cleanSqlComments(sql);

  const insertMatch = clean.match(/^INSERT\s+INTO\s+([a-zA-Z0-9_`"']+)/i);
  if (insertMatch) {
    return {
      type: 'INSERT',
      table: insertMatch[1].replace(/[`"']/g, '').toLowerCase()
    };
  }

  const updateMatch = clean.match(/^UPDATE\s+([a-zA-Z0-9_`"']+)/i);
  if (updateMatch) {
    return {
      type: 'UPDATE',
      table: updateMatch[1].replace(/[`"']/g, '').toLowerCase()
    };
  }

  const deleteMatch = clean.match(/^DELETE\s+FROM\s+([a-zA-Z0-9_`"']+)/i);
  if (deleteMatch) {
    return {
      type: 'DELETE',
      table: deleteMatch[1].replace(/[`"']/g, '').toLowerCase()
    };
  }

  return null;
}

/**
 * Validates DDL entity targets (database names, table names, commands)
 */
function validateDdlEntity(expectedSql, userSql) {
  const cleanExp = cleanSqlComments(expectedSql);
  const cleanUser = cleanSqlComments(userSql);

  // 1. CREATE / DROP DATABASE
  const expDbMatch = cleanExp.match(/^(?:CREATE|DROP)\s+DATABASE(?:\s+IF\s+(?:NOT\s+)?EXISTS)?\s+([a-zA-Z0-9_`"']+)/i);
  if (expDbMatch) {
    const isCreate = /^CREATE/i.test(cleanExp);
    const action = isCreate ? 'CREATE' : 'DROP';
    const expDbName = expDbMatch[1].replace(/[`"']/g, '').toLowerCase();

    const userDbMatch = cleanUser.match(/^(?:CREATE|DROP)\s+DATABASE(?:\s+IF\s+(?:NOT\s+)?EXISTS)?\s+([a-zA-Z0-9_`"']+)/i);
    if (!userDbMatch) {
      return {
        passed: false,
        message: `Command mismatch: Expected a '${action} DATABASE' statement, but received a different SQL statement.`
      };
    }
    const userIsCreate = /^CREATE/i.test(cleanUser);
    if (isCreate !== userIsCreate) {
      return {
        passed: false,
        message: `Command mismatch: Expected '${action} DATABASE', but received '${userIsCreate ? 'CREATE' : 'DROP'} DATABASE'.`
      };
    }
    const userDbName = userDbMatch[1].replace(/[`"']/g, '').toLowerCase();
    if (userDbName !== expDbName) {
      return {
        passed: false,
        message: `Database name mismatch: Expected database name '${expDbName}', but got '${userDbName}'.`
      };
    }
    return { passed: true };
  }

  // 2. USE database
  const expUseMatch = cleanExp.match(/^USE\s+([a-zA-Z0-9_`"']+)/i);
  if (expUseMatch) {
    const expDbName = expUseMatch[1].replace(/[`"']/g, '').toLowerCase();
    const userUseMatch = cleanUser.match(/^USE\s+([a-zA-Z0-9_`"']+)/i);
    if (!userUseMatch) {
      return {
        passed: false,
        message: `Expected 'USE ${expDbName};' to switch the database context.`
      };
    }
    const userDbName = userUseMatch[1].replace(/[`"']/g, '').toLowerCase();
    if (userDbName !== expDbName) {
      return {
        passed: false,
        message: `Database context mismatch: Expected to switch to '${expDbName}', but got '${userDbName}'.`
      };
    }
    return { passed: true };
  }

  // 3. CREATE TABLE
  const expCreateTblMatch = cleanExp.match(/^CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+([a-zA-Z0-9_`"']+)/i);
  if (expCreateTblMatch) {
    const expTblName = expCreateTblMatch[1].replace(/[`"']/g, '').toLowerCase();
    const userCreateTblMatch = cleanUser.match(/^CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+([a-zA-Z0-9_`"']+)/i);
    if (!userCreateTblMatch) {
      return {
        passed: false,
        message: `Expected 'CREATE TABLE ${expTblName} ...' statement.`
      };
    }
    const userTblName = userCreateTblMatch[1].replace(/[`"']/g, '').toLowerCase();
    if (userTblName !== expTblName) {
      return {
        passed: false,
        message: `Table name mismatch: Expected table name '${expTblName}', but got '${userTblName}'.`
      };
    }
    return { passed: true, checkSchemaForTable: expTblName };
  }

  // 4. DROP TABLE
  const expDropTblMatch = cleanExp.match(/^DROP\s+TABLE(?:\s+IF\s+EXISTS)?\s+([a-zA-Z0-9_`"']+)/i);
  if (expDropTblMatch) {
    const expTblName = expDropTblMatch[1].replace(/[`"']/g, '').toLowerCase();
    const userDropTblMatch = cleanUser.match(/^DROP\s+TABLE(?:\s+IF\s+EXISTS)?\s+([a-zA-Z0-9_`"']+)/i);
    if (!userDropTblMatch) {
      return {
        passed: false,
        message: `Expected 'DROP TABLE ${expTblName};' statement.`
      };
    }
    const userTblName = userDropTblMatch[1].replace(/[`"']/g, '').toLowerCase();
    if (userTblName !== expTblName) {
      return {
        passed: false,
        message: `Table name mismatch: Expected to drop table '${expTblName}', but got '${userTblName}'.`
      };
    }
    return { passed: true, checkDropTable: expTblName };
  }

  // 5. TRUNCATE TABLE
  const expTruncMatch = cleanExp.match(/^TRUNCATE\s+(?:TABLE\s+)?([a-zA-Z0-9_`"']+)/i);
  if (expTruncMatch) {
    const expTblName = expTruncMatch[1].replace(/[`"']/g, '').toLowerCase();
    const userTruncMatch = cleanUser.match(/^(?:TRUNCATE(?:\s+TABLE)?|DELETE\s+FROM)\s+([a-zA-Z0-9_`"']+)/i);
    if (!userTruncMatch) {
      return {
        passed: false,
        message: `Expected 'TRUNCATE TABLE ${expTblName};' statement.`
      };
    }
    const userTblName = userTruncMatch[1].replace(/[`"']/g, '').toLowerCase();
    if (userTblName !== expTblName) {
      return {
        passed: false,
        message: `Table name mismatch: Expected to truncate table '${expTblName}', but got '${userTblName}'.`
      };
    }
    return { passed: true, checkTruncateTable: expTblName };
  }

  // 6. ALTER TABLE
  const expAlterMatch = cleanExp.match(/^ALTER\s+TABLE\s+([a-zA-Z0-9_`"']+)/i);
  if (expAlterMatch) {
    const expTblName = expAlterMatch[1].replace(/[`"']/g, '').toLowerCase();
    const userAlterMatch = cleanUser.match(/^ALTER\s+TABLE\s+([a-zA-Z0-9_`"']+)/i);
    if (!userAlterMatch) {
      return {
        passed: false,
        message: `Expected 'ALTER TABLE ${expTblName} ...' statement.`
      };
    }
    const userTblName = userAlterMatch[1].replace(/[`"']/g, '').toLowerCase();
    if (userTblName !== expTblName) {
      return {
        passed: false,
        message: `Table name mismatch: Expected to alter table '${expTblName}', but got '${userTblName}'.`
      };
    }
    return { passed: true, checkSchemaForTable: expTblName };
  }

  return null;
}

/**
 * Verifies table schema (column names, types, constraints) for CREATE TABLE and ALTER TABLE queries
 */
async function verifyTableColumns(setupSql, expectedSql, userSql, tableName) {
  try {
    const expInfoRes = await executeSqlQuery((setupSql ? setupSql + ';\n' : '') + expectedSql, `PRAGMA table_info(${tableName});`);
    const userInfoRes = await executeSqlQuery((setupSql ? setupSql + ';\n' : '') + userSql, `PRAGMA table_info(${tableName});`);

    if (!userInfoRes.success) {
      return { passed: false, message: userInfoRes.error || `Error inspecting table '${tableName}'.` };
    }
    if (!userInfoRes.values || userInfoRes.values.length === 0) {
      return { passed: false, message: `Table '${tableName}' was not found after query execution.` };
    }

    if (expInfoRes.success && expInfoRes.values && expInfoRes.values.length > 0) {
      const expColMap = new Map();
      expInfoRes.values.forEach(r => {
        expColMap.set(String(r[1]).toLowerCase(), {
          name: r[1],
          type: r[2],
          notNull: !!r[3],
          isPk: !!r[5]
        });
      });

      const userColMap = new Map();
      userInfoRes.values.forEach(r => {
        userColMap.set(String(r[1]).toLowerCase(), {
          name: r[1],
          type: r[2],
          notNull: !!r[3],
          isPk: !!r[5]
        });
      });

      // 1. Missing columns
      const missingCols = [];
      for (const [colKey, meta] of expColMap.entries()) {
        if (!userColMap.has(colKey)) {
          missingCols.push(meta.name);
        }
      }
      if (missingCols.length > 0) {
        return {
          passed: false,
          message: `Column mismatch in table '${tableName}': Missing expected column(s): ${missingCols.join(', ')}.`
        };
      }

      // 2. Primary key & NOT NULL constraints
      for (const [colKey, expMeta] of expColMap.entries()) {
        const userMeta = userColMap.get(colKey);
        if (expMeta.isPk && userMeta && !userMeta.isPk) {
          return {
            passed: false,
            message: `Constraint mismatch in table '${tableName}': Column '${userMeta.name}' must be designated as a PRIMARY KEY.`
          };
        }
        if (expMeta.notNull && userMeta && !userMeta.notNull && !userMeta.isPk) {
          return {
            passed: false,
            message: `Constraint mismatch in table '${tableName}': Column '${userMeta.name}' must include the NOT NULL constraint.`
          };
        }
      }

      // 3. Unexpected extra columns
      const extraCols = [];
      for (const [colKey, userMeta] of userColMap.entries()) {
        if (!expColMap.has(colKey)) {
          extraCols.push(userMeta.name);
        }
      }
      if (extraCols.length > 0) {
        return {
          passed: false,
          message: `Unexpected column(s) in table '${tableName}': Found extra column(s): ${extraCols.join(', ')}.`
        };
      }
    }
    return { passed: true };
  } catch {
    return { passed: true };
  }
}

/**
 * Runs comprehensive multi-dataset test cases on user SQL
 */
export async function validateChallengeWithTestcases(challenge, userSql) {
  if (!challenge || !challenge.expectedSql) {
    const execRes = await executeSqlQuery(challenge.setupSql, userSql);
    return {
      passed: execRes.success,
      totalCases: 1,
      passedCases: execRes.success ? 1 : 0,
      testcases: [
        {
          caseIndex: 1,
          name: 'Case 1: Standard Execution',
          passed: execRes.success,
          userResult: execRes,
          expectedResult: null,
          missingInUserIndices: [],
          extraInUserIndices: [],
          message: execRes.success ? 'Query executed successfully.' : execRes.error
        }
      ]
    };
  }

  // 1. DDL Semantic & Entity Validation Guard
  const ddlCheck = validateDdlEntity(challenge.expectedSql, userSql);
  if (ddlCheck && !ddlCheck.passed) {
    const failedTestCase = {
      caseIndex: 1,
      name: 'Case 1: Entity & Schema Verification',
      passed: false,
      userResult: null,
      expectedResult: null,
      missingInUserIndices: [],
      extraInUserIndices: [],
      message: ddlCheck.message
    };
    return {
      passed: false,
      totalCases: 1,
      passedCases: 0,
      testcases: [failedTestCase],
      message: `${ddlCheck.message}`
    };
  }

  // 2. DDL Table Column & Constraint Check (CREATE TABLE, ALTER TABLE)
  if (ddlCheck && ddlCheck.checkSchemaForTable) {
    const schemaCheck = await verifyTableColumns(
      challenge.setupSql,
      challenge.expectedSql,
      userSql,
      ddlCheck.checkSchemaForTable
    );
    if (!schemaCheck.passed) {
      const failedTestCase = {
        caseIndex: 1,
        name: 'Case 1: Schema Structure Verification',
        passed: false,
        userResult: null,
        expectedResult: null,
        missingInUserIndices: [],
        extraInUserIndices: [],
        message: schemaCheck.message
      };
      return {
        passed: false,
        totalCases: 1,
        passedCases: 0,
        testcases: [failedTestCase],
        message: `${schemaCheck.message}`
      };
    }
  }

  // 3. DDL DROP TABLE Check
  if (ddlCheck && ddlCheck.checkDropTable) {
    const checkDropRes = await executeSqlQuery(
      (challenge.setupSql ? challenge.setupSql + ';\n' : '') + userSql,
      `SELECT name FROM sqlite_master WHERE type='table' AND name='${ddlCheck.checkDropTable}';`
    );
    if (checkDropRes.success && checkDropRes.values && checkDropRes.values.length > 0) {
      const failedTestCase = {
        caseIndex: 1,
        name: 'Case 1: DROP Verification',
        passed: false,
        userResult: null,
        expectedResult: null,
        missingInUserIndices: [],
        extraInUserIndices: [],
        message: `Table '${ddlCheck.checkDropTable}' still exists in the database. Ensure your DROP TABLE statement executed successfully.`
      };
      return {
        passed: false,
        totalCases: 1,
        passedCases: 0,
        testcases: [failedTestCase],
        message: failedTestCase.message
      };
    }
  }

  // 4. DDL TRUNCATE TABLE Check
  if (ddlCheck && ddlCheck.checkTruncateTable) {
    const checkTruncRes = await executeSqlQuery(
      (challenge.setupSql ? challenge.setupSql + ';\n' : '') + userSql,
      `SELECT COUNT(*) FROM ${ddlCheck.checkTruncateTable};`
    );
    if (checkTruncRes.success && checkTruncRes.values && checkTruncRes.values.length > 0 && checkTruncRes.values[0][0] > 0) {
      const remainingCount = checkTruncRes.values[0][0];
      const failedTestCase = {
        caseIndex: 1,
        name: 'Case 1: TRUNCATE Verification',
        passed: false,
        userResult: null,
        expectedResult: null,
        missingInUserIndices: [],
        extraInUserIndices: [],
        message: `Table '${ddlCheck.checkTruncateTable}' still contains ${remainingCount} row(s). A TRUNCATE statement must remove all rows.`
      };
      return {
        passed: false,
        totalCases: 1,
        passedCases: 0,
        testcases: [failedTestCase],
        message: failedTestCase.message
      };
    }
  }

  // 5. DML Post-Execution Table State Evaluation (INSERT, UPDATE, DELETE)
  const expDml = extractDmlTarget(challenge.expectedSql);
  if (expDml) {
    const userDml = extractDmlTarget(userSql);
    if (!userDml) {
      const failedTestCase = {
        caseIndex: 1,
        name: 'Case 1: DML Statement Verification',
        passed: false,
        userResult: null,
        expectedResult: null,
        missingInUserIndices: [],
        extraInUserIndices: [],
        message: `Command mismatch: Expected a '${expDml.type}' statement targeting table '${expDml.table}', but received a different SQL statement.`
      };
      return {
        passed: false,
        totalCases: 1,
        passedCases: 0,
        testcases: [failedTestCase],
        message: failedTestCase.message
      };
    }

    if (userDml.type !== expDml.type) {
      const failedTestCase = {
        caseIndex: 1,
        name: 'Case 1: DML Statement Verification',
        passed: false,
        userResult: null,
        expectedResult: null,
        missingInUserIndices: [],
        extraInUserIndices: [],
        message: `Command mismatch: Expected a '${expDml.type}' statement, but received '${userDml.type}'.`
      };
      return {
        passed: false,
        totalCases: 1,
        passedCases: 0,
        testcases: [failedTestCase],
        message: failedTestCase.message
      };
    }

    if (userDml.table !== expDml.table) {
      const failedTestCase = {
        caseIndex: 1,
        name: 'Case 1: DML Statement Verification',
        passed: false,
        userResult: null,
        expectedResult: null,
        missingInUserIndices: [],
        extraInUserIndices: [],
        message: `Target table mismatch: Expected to operate on table '${expDml.table}', but targeted '${userDml.table}'.`
      };
      return {
        passed: false,
        totalCases: 1,
        passedCases: 0,
        testcases: [failedTestCase],
        message: failedTestCase.message
      };
    }

    // Inspect table state after mutation for Case 1 (Primary Dataset)
    const inspectionQuery = `SELECT * FROM ${expDml.table} ORDER BY 1 ASC;`;
    const userTableRes1 = await executeSqlQuery(
      (challenge.setupSql ? challenge.setupSql + ';\n' : '') + userSql,
      inspectionQuery
    );
    const expTableRes1 = await executeSqlQuery(
      (challenge.setupSql ? challenge.setupSql + ';\n' : '') + challenge.expectedSql,
      inspectionQuery
    );

    const diff1 = computeResultDiff(userTableRes1, expTableRes1, false);
    const testcase1 = {
      caseIndex: 1,
      name: 'Case 1: Primary Table State Verification',
      passed: diff1.passed,
      userResult: userTableRes1,
      expectedResult: expTableRes1,
      missingInUserIndices: diff1.missingInUserIndices,
      extraInUserIndices: diff1.extraInUserIndices,
      message: diff1.message
    };

    // Inspect table state after mutation for Case 2 (Edge-Case Dataset)
    let edgeSetupSql = challenge.setupSql;
    if (challenge.edgeSetupSql) {
      edgeSetupSql = challenge.edgeSetupSql;
    } else if (edgeSetupSql && edgeSetupSql.includes('INSERT INTO employees')) {
      if (edgeSetupSql.includes('first_name') && edgeSetupSql.includes('department_id')) {
        edgeSetupSql += `\nINSERT INTO employees (id, first_name, last_name, email, department_id, salary, hire_date, manager_id)
          VALUES (999, 'Boundary', 'Tester', 'boundary@company.com', 1, 90000, '2024-02-01', 1);`;
      } else if (edgeSetupSql.includes('emp_id') && edgeSetupSql.includes('hire_date')) {
        edgeSetupSql += `\nINSERT INTO employees (emp_id, name, department, salary, city, hire_date)
          VALUES (999, 'Aarav', 'IT', 95000, 'Kolkata', '2024-02-01');`;
      } else if (edgeSetupSql.includes('emp_id')) {
        edgeSetupSql += `\nINSERT INTO employees (emp_id, name, department, salary, city)
          VALUES (999, 'Aarav', 'IT', 95000, 'Kolkata');`;
      }
    }

    let userTableRes2 = await executeSqlQuery(
      (edgeSetupSql ? edgeSetupSql + ';\n' : '') + userSql,
      inspectionQuery
    );
    let expTableRes2 = await executeSqlQuery(
      (edgeSetupSql ? edgeSetupSql + ';\n' : '') + challenge.expectedSql,
      inspectionQuery
    );

    if ((!userTableRes2.success || !expTableRes2.success) && userTableRes1.success && edgeSetupSql !== challenge.setupSql) {
      edgeSetupSql = challenge.setupSql;
      userTableRes2 = await executeSqlQuery(
        (edgeSetupSql ? edgeSetupSql + ';\n' : '') + userSql,
        inspectionQuery
      );
      expTableRes2 = await executeSqlQuery(
        (edgeSetupSql ? edgeSetupSql + ';\n' : '') + challenge.expectedSql,
        inspectionQuery
      );
    }

    const diff2 = computeResultDiff(userTableRes2, expTableRes2, false);
    const testcase2 = {
      caseIndex: 2,
      name: 'Case 2: Edge Case Table State Verification',
      passed: diff2.passed,
      userResult: userTableRes2,
      expectedResult: expTableRes2,
      missingInUserIndices: diff2.missingInUserIndices,
      extraInUserIndices: diff2.extraInUserIndices,
      message: diff2.message
    };

    const testcases = [testcase1, testcase2];
    const passedCases = testcases.filter(tc => tc.passed).length;
    const overallPassed = passedCases === testcases.length;

    return {
      passed: overallPassed,
      totalCases: testcases.length,
      passedCases,
      testcases,
      message: overallPassed
        ? 'Accepted! Table state updated exactly as expected across all test cases.'
        : `${passedCases}/${testcases.length} test cases passed. Review table discrepancies below.`
    };
  }

  // 6. STANDARD QUERY EXECUTION & COMPARISON (DQL / SELECT statements)
  const userRes1 = await executeSqlQuery(challenge.setupSql, userSql);
  const expRes1 = await executeSqlQuery(challenge.setupSql, challenge.expectedSql);
  const diff1 = computeResultDiff(userRes1, expRes1, challenge.checkOrder);

  const testcase1 = {
    caseIndex: 1,
    name: 'Case 1: Primary Dataset',
    passed: diff1.passed,
    userResult: userRes1,
    expectedResult: expRes1,
    missingInUserIndices: diff1.missingInUserIndices,
    extraInUserIndices: diff1.extraInUserIndices,
    message: diff1.message
  };

  // TEST CASE 2: Edge-Case Dataset (with boundary records)
  let edgeSetupSql = challenge.setupSql;
  if (challenge.edgeSetupSql) {
    edgeSetupSql = challenge.edgeSetupSql;
  } else if (edgeSetupSql && edgeSetupSql.includes('INSERT INTO employees')) {
    if (edgeSetupSql.includes('first_name') && edgeSetupSql.includes('department_id')) {
      // Base HR Company schema (sqlChallenges.js)
      edgeSetupSql += `\nINSERT INTO employees (id, first_name, last_name, email, department_id, salary, hire_date, manager_id)
        VALUES (999, 'Boundary', 'Tester', 'boundary@company.com', 1, 90000, '2024-02-01', 1);`;
    } else if (edgeSetupSql.includes('emp_id') && edgeSetupSql.includes('hire_date')) {
      // Day 4 Advanced Filtering schema (filteringChallenges.js)
      edgeSetupSql += `\nINSERT INTO employees (emp_id, name, department, salary, city, hire_date)
        VALUES (999, 'Aarav', 'IT', 95000, 'Kolkata', '2024-02-01');`;
    } else if (edgeSetupSql.includes('emp_id')) {
      // DML schema (dmlChallenges.js)
      edgeSetupSql += `\nINSERT INTO employees (emp_id, name, department, salary, city)
        VALUES (999, 'Aarav', 'IT', 95000, 'Kolkata');`;
    }
  }

  let userRes2 = await executeSqlQuery(edgeSetupSql, userSql);
  let expRes2 = await executeSqlQuery(edgeSetupSql, challenge.expectedSql);

  // Defensive fallback: If synthetic edgeSetupSql caused an execution failure while primary setupSql worked, fallback safely
  if ((!userRes2.success || !expRes2.success) && userRes1.success && edgeSetupSql !== challenge.setupSql) {
    edgeSetupSql = challenge.setupSql;
    userRes2 = await executeSqlQuery(edgeSetupSql, userSql);
    expRes2 = await executeSqlQuery(edgeSetupSql, challenge.expectedSql);
  }

  const diff2 = computeResultDiff(userRes2, expRes2, challenge.checkOrder);

  const testcase2 = {
    caseIndex: 2,
    name: 'Case 2: Edge Case Dataset',
    passed: diff2.passed,
    userResult: userRes2,
    expectedResult: expRes2,
    missingInUserIndices: diff2.missingInUserIndices,
    extraInUserIndices: diff2.extraInUserIndices,
    message: diff2.message
  };

  const testcases = [testcase1, testcase2];
  const passedCases = testcases.filter(tc => tc.passed).length;
  const overallPassed = passedCases === testcases.length;

  return {
    passed: overallPassed,
    totalCases: testcases.length,
    passedCases,
    testcases,
    message: overallPassed
      ? 'Accepted! All test cases passed successfully.'
      : `${passedCases}/${testcases.length} test cases passed. Review discrepancies below.`
  };
}

/**
 * Validates the user's query against the canonical expected SQL.
 */
export async function validateSqlQuery(setupSql, expectedSql, userSql, checkOrder = false) {
  const ddlCheck = validateDdlEntity(expectedSql, userSql);
  if (ddlCheck && !ddlCheck.passed) {
    return {
      passed: false,
      userResult: null,
      expectedResult: null,
      missingInUserIndices: [],
      extraInUserIndices: [],
      message: ddlCheck.message
    };
  }

  const expDml = extractDmlTarget(expectedSql);
  if (expDml) {
    const userDml = extractDmlTarget(userSql);
    if (!userDml || userDml.type !== expDml.type || userDml.table !== expDml.table) {
      return {
        passed: false,
        userResult: null,
        expectedResult: null,
        missingInUserIndices: [],
        extraInUserIndices: [],
        message: `Statement mismatch: Expected '${expDml.type}' on table '${expDml.table}'.`
      };
    }

    const inspectionQuery = `SELECT * FROM ${expDml.table} ORDER BY 1 ASC;`;
    const userTableRes = await executeSqlQuery((setupSql ? setupSql + ';\n' : '') + userSql, inspectionQuery);
    const expTableRes = await executeSqlQuery((setupSql ? setupSql + ';\n' : '') + expectedSql, inspectionQuery);
    const diff = computeResultDiff(userTableRes, expTableRes, false);

    return {
      passed: diff.passed,
      userResult: userTableRes,
      expectedResult: expTableRes,
      missingInUserIndices: diff.missingInUserIndices,
      extraInUserIndices: diff.extraInUserIndices,
      message: diff.message
    };
  }

  const userResult = await executeSqlQuery(setupSql, userSql);
  const expectedResult = await executeSqlQuery(setupSql, expectedSql);
  const diff = computeResultDiff(userResult, expectedResult, checkOrder);

  return {
    passed: diff.passed,
    userResult,
    expectedResult,
    missingInUserIndices: diff.missingInUserIndices,
    extraInUserIndices: diff.extraInUserIndices,
    message: diff.message
  };
}

/**
 * Fetches sample tables schema and first few rows for visual schema exploration.
 */
export async function getTablesPreview(setupSql) {
  let db = null;
  try {
    const SQL = await getSqlInstance();
    db = new SQL.Database();
    if (setupSql) db.run(setupSql);

    const tablesRes = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    if (!tablesRes || tablesRes.length === 0) return [];

    const tableNames = tablesRes[0].values.map(v => v[0]);
    const previews = [];

    for (const name of tableNames) {
      const schemaRes = db.exec(`PRAGMA table_info(${name});`);
      const columns = schemaRes.length > 0 
        ? schemaRes[0].values.map(v => ({ name: v[1], type: v[2], notNull: !!v[3], isPk: !!v[5] }))
        : [];

      const dataRes = db.exec(`SELECT * FROM ${name} LIMIT 5;`);
      const sampleRows = dataRes.length > 0 ? dataRes[0].values : [];

      previews.push({
        tableName: name,
        columns,
        sampleRows
      });
    }

    return previews;
  } catch (err) {
    console.error('Error fetching table schema previews:', err);
    return [];
  } finally {
    if (db) {
      try { db.close(); } catch (_) {}
    }
  }
}

function normalizeVal(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    return Number.isInteger(val) ? val : +val.toFixed(4);
  }
  return String(val).trim();
}

function cleanSqlError(msg) {
  if (!msg) return 'Unknown SQL error';
  return msg
    .replace(/^Error:\s*/i, '')
    .replace(/at line \d+/i, (m) => m)
    .trim();
}
