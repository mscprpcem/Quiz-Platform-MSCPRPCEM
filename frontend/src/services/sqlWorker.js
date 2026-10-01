import initSqlJs from 'sql.js';

let sqlPromise = null;

async function getSqlInstance() {
  if (!sqlPromise) {
    sqlPromise = (async () => {
      try {
        return await initSqlJs({
          locateFile: (file) => `/${file}`
        });
      } catch (err) {
        try {
          return await initSqlJs({
            locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
          });
        } catch (cdnErr) {
          sqlPromise = null;
          throw cdnErr;
        }
      }
    })();
  }
  return sqlPromise;
}

function registerCustomSqlFunctions(db) {
  if (!db || !db.create_function) return;

  try {
    db.create_function('CONCAT', (...args) => {
      return args.filter(a => a !== null && a !== undefined).join('');
    });

    db.create_function('CONCAT_WS', (sep, ...args) => {
      if (sep === null || sep === undefined) sep = '';
      return args.filter(a => a !== null && a !== undefined).join(String(sep));
    });

    db.create_function('LEN', (str) => {
      if (str === null || str === undefined) return null;
      return String(str).length;
    });

    db.create_function('REVERSE', (str) => {
      if (str === null || str === undefined) return null;
      return String(str).split('').reverse().join('');
    });

    db.create_function('REPEAT', (str, count) => {
      if (str === null || count === null || count < 0) return null;
      return String(str).repeat(count);
    });

    db.create_function('LPAD', (str, len, pad = ' ') => {
      if (str === null || len === null) return null;
      return String(str).padStart(len, String(pad));
    });

    db.create_function('RPAD', (str, len, pad = ' ') => {
      if (str === null || len === null) return null;
      return String(str).padEnd(len, String(pad));
    });

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

    db.create_function('IFNULL', (a, b) => (a !== null && a !== undefined ? a : b));
    db.create_function('ISNULL', (a, b) => (a !== null && a !== undefined ? a : b));
    db.create_function('NVL', (a, b) => (a !== null && a !== undefined ? a : b));
    db.create_function('IF', (cond, trueVal, falseVal) => (cond ? trueVal : falseVal));

    const getNowIso = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
    const getCurDateIso = () => new Date().toISOString().slice(0, 10);

    db.create_function('NOW', () => getNowIso());
    db.create_function('GETDATE', () => getNowIso());
    db.create_function('SYSDATE', () => getNowIso());
    db.create_function('CURDATE', () => getCurDateIso());
    db.create_function('CURRENT_DATE', () => getCurDateIso());

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

    db.create_function('DATEDIFF', (d1, d2) => {
      if (!d1 || !d2) return null;
      const t1 = new Date(d1).getTime();
      const t2 = new Date(d2).getTime();
      if (isNaN(t1) || isNaN(t2)) return null;
      return Math.round((t1 - t2) / (1000 * 60 * 60 * 24));
    });

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
    console.warn('Worker: Failed to register custom functions:', err);
  }
}

function preprocessQueryForSqlite(sql, virtualDatabases = []) {
  let processed = (sql || '').trim();

  if (/^SHOW\s+(?:FULL\s+)?TABLES(?:\s+LIKE\s+['"][^'"]+['"])?\s*;?/i.test(processed)) {
    return `SELECT name AS Tables_in_database FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__catalog_%';`;
  }

  if (/^SHOW\s+DATABASES\s*;?/i.test(processed)) {
    return `SELECT 'main' AS Database_Name 
            UNION SELECT 'temp' AS Database_Name 
            UNION 
            SELECT REPLACE(name, '__catalog_', '') AS Database_Name 
            FROM sqlite_master 
            WHERE type='table' AND name LIKE '__catalog_%' 
            ORDER BY Database_Name ASC;`;
  }

  if (/^(?:DESCRIBE|DESC|SHOW\s+COLUMNS\s+FROM)\s+([a-zA-Z0-9_]+)\s*;?/i.test(processed)) {
    const match = processed.match(/^(?:DESCRIBE|DESC|SHOW\s+COLUMNS\s+FROM)\s+([a-zA-Z0-9_]+)/i);
    return `PRAGMA table_info(${match[1]});`;
  }

  processed = processed.replace(/TRUNCATE\s+(?:TABLE\s+)?([a-zA-Z0-9_]+)\s*;?/gi, 'DELETE FROM $1;');

  if (/^(CREATE|DROP)\s+DATABASE\s+([a-zA-Z0-9_]+)\s*;?/i.test(processed)) {
    const match = processed.match(/^(CREATE|DROP)\s+DATABASE\s+([a-zA-Z0-9_]+)/i);
    const action = match[1].toUpperCase();
    const dbName = match[2].toLowerCase();
    if (action === 'CREATE') {
      return `CREATE TABLE IF NOT EXISTS __catalog_${dbName} (created_at TEXT);`;
    } else {
      return `DROP TABLE IF EXISTS __catalog_${dbName};`;
    }
  }

  if (/^USE\s+([a-zA-Z0-9_]+)\s*;?/i.test(processed)) {
    return `SELECT 1 AS session_active;`;
  }

  if (/ALTER\s+TABLE\s+([a-zA-Z0-9_]+)\s+MODIFY\s+(?:COLUMN\s+)?([a-zA-Z0-9_]+)\s+([^;]+);?/i.test(processed)) {
    return `SELECT 1 AS column_modified;`;
  }
  if (/ALTER\s+TABLE\s+([a-zA-Z0-9_]+)\s+CHANGE\s+(?:COLUMN\s+)?([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)\s+([^;]+);?/i.test(processed)) {
    const match = processed.match(/ALTER\s+TABLE\s+([a-zA-Z0-9_]+)\s+CHANGE\s+(?:COLUMN\s+)?([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)/i);
    return `ALTER TABLE ${match[1]} RENAME COLUMN ${match[2]} TO ${match[3]};`;
  }

  if (/^RENAME\s+TABLE\s+([a-zA-Z0-9_]+)\s+TO\s+([a-zA-Z0-9_]+)\s*;?/i.test(processed)) {
    const match = processed.match(/^RENAME\s+TABLE\s+([a-zA-Z0-9_]+)\s+TO\s+([a-zA-Z0-9_]+)/i);
    return `ALTER TABLE ${match[1]} RENAME TO ${match[2]};`;
  }

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

  if (/\bOFFSET\s+(\d+)\s+ROWS\s+FETCH\s+NEXT\s+(\d+)\s+ROWS\s+ONLY\b/i.test(processed)) {
    processed = processed.replace(
      /\bOFFSET\s+(\d+)\s+ROWS\s+FETCH\s+NEXT\s+(\d+)\s+ROWS\s+ONLY\b/gi,
      'LIMIT $2 OFFSET $1'
    );
  } else if (/\bFETCH\s+FIRST\s+(\d+)\s+ROWS\s+ONLY\b/i.test(processed)) {
    processed = processed.replace(/\bFETCH\s+FIRST\s+(\d+)\s+ROWS\s+ONLY\b/gi, 'LIMIT $1');
  }

  if (/\bLIMIT\s+(\d+)\s*,\s*(\d+)\b/i.test(processed)) {
    processed = processed.replace(/\bLIMIT\s+(\d+)\s*,\s*(\d+)\b/gi, 'LIMIT $2 OFFSET $1');
  }

  return processed;
}

function cleanSqlError(msg) {
  if (!msg) return 'Unknown SQL error';
  return msg
    .replace(/^Error:\s*/i, '')
    .replace(/at line \d+/i, (m) => m)
    .trim();
}

self.onmessage = async (e) => {
  const { id, setupSql, querySql, virtualDatabases = [] } = e.data || {};
  const startTime = performance.now();
  let db = null;

  try {
    const SQL = await getSqlInstance();
    db = new SQL.Database();
    registerCustomSqlFunctions(db);

    if (setupSql && setupSql.trim()) {
      db.run(setupSql);
    }

    if (Array.isArray(virtualDatabases)) {
      virtualDatabases.forEach((vDb) => {
        try {
          db.run(`CREATE TABLE IF NOT EXISTS __catalog_${vDb} (created_at TEXT);`);
        } catch (_) {}
      });
    }

    const trimmedQuery = (querySql || '').trim();
    if (!trimmedQuery) {
      throw new Error('Query is empty. Write an SQL statement to run.');
    }

    const sqliteReadyQuery = preprocessQueryForSqlite(trimmedQuery, virtualDatabases);
    const execResults = db.exec(sqliteReadyQuery);
    const executionTimeMs = +(performance.now() - startTime).toFixed(2);

    if (!execResults || execResults.length === 0) {
      self.postMessage({
        id,
        success: true,
        columns: ['Status', 'Message'],
        values: [['SUCCESS', 'Query executed successfully. 0 rows returned.']],
        rowCount: 0,
        executionTimeMs,
        error: null
      });
      return;
    }

    const lastResult = execResults[execResults.length - 1];
    let values = lastResult.values || [];
    const totalReturned = values.length;

    // Safety cap: Never send more than 2,000 rows across message boundary to prevent DOM freezing
    if (values.length > 2000) {
      values = values.slice(0, 2000);
    }

    self.postMessage({
      id,
      success: true,
      columns: lastResult.columns || [],
      values,
      rowCount: totalReturned,
      isTruncated: totalReturned > 2000,
      executionTimeMs,
      error: null
    });
  } catch (err) {
    const executionTimeMs = +(performance.now() - startTime).toFixed(2);
    self.postMessage({
      id,
      success: false,
      columns: [],
      values: [],
      rowCount: 0,
      executionTimeMs,
      error: cleanSqlError(err.message)
    });
  } finally {
    if (db) {
      try { db.close(); } catch (_) {}
    }
  }
};
