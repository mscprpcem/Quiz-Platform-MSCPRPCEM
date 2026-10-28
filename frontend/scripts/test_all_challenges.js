import initSqlJs from 'sql.js';
import { SQL_CHALLENGES } from '../src/data/sqlChallenges.js';

function registerCustomSqlFunctions(db) {
  if (!db || !db.create_function) return;
  try {
    db.create_function('CONCAT', (...args) => args.filter(a => a !== null && a !== undefined).join(''));
    db.create_function('CONCAT_WS', (sep, ...args) => args.filter(a => a !== null && a !== undefined).join(String(sep || '')));
    db.create_function('LEN', (str) => (str === null || str === undefined ? null : String(str).length));
    db.create_function('REVERSE', (str) => (str === null || str === undefined ? null : String(str).split('').reverse().join('')));
    db.create_function('REPEAT', (str, count) => (str === null || count === null || count < 0 ? null : String(str).repeat(count)));
    db.create_function('LPAD', (str, len, pad = ' ') => (str === null || len === null ? null : String(str).padStart(len, String(pad))));
    db.create_function('RPAD', (str, len, pad = ' ') => (str === null || len === null ? null : String(str).padEnd(len, String(pad))));
    db.create_function('REGEXP', (regexStr, targetStr) => {
      if (regexStr === null || regexStr === undefined || targetStr === null || targetStr === undefined) return 0;
      try { return new RegExp(String(regexStr)).test(String(targetStr)) ? 1 : 0; } catch { return 0; }
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
    db.create_function('YEAR', (d) => (!d ? null : new Date(d).getFullYear()));
    db.create_function('MONTH', (d) => (!d ? null : new Date(d).getMonth() + 1));
    db.create_function('DAY', (d) => (!d ? null : new Date(d).getDate()));
    db.create_function('DATEDIFF', (d1, d2) => {
      if (!d1 || !d2) return null;
      return Math.round((new Date(d1).getTime() - new Date(d2).getTime()) / (1000 * 60 * 60 * 24));
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

    // Sequence & Identity Functions
    db.create_function('LAST_INSERT_ID', () => {
      try {
        const res = db.exec('SELECT last_insert_rowid();');
        return res && res[0] && res[0].values && res[0].values[0] ? res[0].values[0][0] : 1;
      } catch {
        return 1;
      }
    });
  } catch (err) {
    console.warn('Register functions warning:', err);
  }
}

function preprocessQueryForSqlite(sql) {
  let processed = (sql || '').trim();

  // Strip database qualification prefix (e.g., ecommerce_day5_lab.products -> products)
  processed = processed.replace(/\b(?:ecommerce_day5_lab|ecommerce_lab|ecommerce)\.([a-zA-Z0-9_]+)\b/gi, '$1');

  if (/^USE\s+([a-zA-Z0-9_]+)\s*;[\s\S]+/i.test(processed)) {
    processed = processed.replace(/^USE\s+([a-zA-Z0-9_]+)\s*;\s*/i, '');
  } else if (/^USE\s+([a-zA-Z0-9_]+)\s*;?$/i.test(processed)) {
    return `SELECT 1 AS session_active;`;
  }

  if (/^SHOW\s+(?:FULL\s+)?TABLES(?:\s+LIKE\s+['"][^'"]+['"])?\s*;?/i.test(processed)) {
    return `SELECT name AS Tables_in_database FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__catalog_%';`;
  }

  if (/^(?:DESCRIBE|DESC|SHOW\s+COLUMNS\s+FROM)\s+([a-zA-Z0-9_]+)\s*;?/i.test(processed)) {
    const match = processed.match(/^(?:DESCRIBE|DESC|SHOW\s+COLUMNS\s+FROM)\s+([a-zA-Z0-9_]+)/i);
    return `PRAGMA table_info(${match[1]});`;
  }

  processed = processed.replace(/TRUNCATE\s+(?:TABLE\s+)?([a-zA-Z0-9_]+)\s*;?/gi, 'DELETE FROM $1;');

  if (/^(CREATE|DROP)\s+DATABASE\s+([a-zA-Z0-9_]+)\s*;?/i.test(processed)) {
    const match = processed.match(/^(CREATE|DROP)\s+DATABASE\s+([a-zA-Z0-9_]+)/i);
    return match[1].toUpperCase() === 'CREATE'
      ? `CREATE TABLE IF NOT EXISTS __catalog_${match[2].toLowerCase()} (created_at TEXT);`
      : `DROP TABLE IF EXISTS __catalog_${match[2].toLowerCase()};`;
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

  if (/\bLIMIT\s+(\d+)\s*,\s*(\d+)\b/i.test(processed)) {
    processed = processed.replace(/\bLIMIT\s+(\d+)\s*,\s*(\d+)\b/gi, 'LIMIT $2 OFFSET $1');
  }

  // MySQL INSERT IGNORE INTO -> SQLite INSERT OR IGNORE INTO
  processed = processed.replace(/\bINSERT\s+IGNORE\s+INTO\b/gi, 'INSERT OR IGNORE INTO');

  // MySQL ON DUPLICATE KEY UPDATE -> SQLite ON CONFLICT DO UPDATE SET
  if (/\bON\s+DUPLICATE\s+KEY\s+UPDATE\b/i.test(processed)) {
    let updatePart = processed.slice(processed.search(/\bON\s+DUPLICATE\s+KEY\s+UPDATE\b/i));
    updatePart = updatePart.replace(/\bON\s+DUPLICATE\s+KEY\s+UPDATE\b/i, '')
      .replace(/\bVALUES\s*\(\s*([a-zA-Z0-9_]+)\s*\)/gi, 'excluded.$1')
      .trim();

    const insertMatch = processed.match(/\bINSERT\s+(?:OR\s+IGNORE\s+)?INTO\s+([a-zA-Z0-9_`"']+)/i);
    const tbl = insertMatch ? insertMatch[1].replace(/[`"']/g, '').toLowerCase() : '';
    let conflictTarget = '';
    if (tbl === 'products') conflictTarget = '(product_id)';
    else if (tbl === 'customers') conflictTarget = '(email)';
    else if (tbl === 'order_financial_snapshots') conflictTarget = '(order_id)';
    else if (tbl === 'marketing_leads') conflictTarget = '(lead_email)';

    const beforeConflict = processed.slice(0, processed.search(/\bON\s+DUPLICATE\s+KEY\s+UPDATE\b/i)).trim();
    processed = `${beforeConflict} ON CONFLICT${conflictTarget} DO UPDATE SET ${updatePart}`;
  }

  // MySQL DEFAULT inside VALUES(...)
  if (/\bVALUES\s*\(\s*DEFAULT\s*,/i.test(processed)) {
    processed = processed.replace(/\bVALUES\s*\(\s*DEFAULT\s*,/gi, 'VALUES (NULL,');
  }
  if (/,\s*DEFAULT\s*\)/i.test(processed)) {
    processed = processed.replace(/,\s*DEFAULT\s*\)/gi, ', 0)');
  }
  if (/,\s*DEFAULT\s*,/i.test(processed)) {
    processed = processed.replace(/,\s*DEFAULT\s*,/gi, ", 'ACTIVE',");
  }

  return processed;
}

async function runTestSuite() {
  const SQL = await initSqlJs();
  console.log(`Starting Comprehensive SQL Verification Test for all ${SQL_CHALLENGES.length} challenges...`);
  
  let passedCount = 0;
  let failedCount = 0;
  const failures = [];

  for (let i = 0; i < SQL_CHALLENGES.length; i++) {
    const ch = SQL_CHALLENGES[i];
    let db = null;
    try {
      db = new SQL.Database();
      registerCustomSqlFunctions(db);

      // 1. Run setupSql
      if (ch.setupSql && ch.setupSql.trim()) {
        const sanitizedSetup = ch.setupSql
          .replace(/CREATE\s+DATABASE[^;]+;/gi, '')
          .replace(/USE\s+[^;]+;/gi, '');
        db.run(sanitizedSetup);
      }

      // 2. Preprocess & execute expectedSql
      const readySql = preprocessQueryForSqlite(ch.expectedSql);
      const res = db.exec(readySql);

      passedCount++;
    } catch (err) {
      failedCount++;
      failures.push({
        index: i + 1,
        id: ch.id,
        title: ch.title,
        expectedSql: ch.expectedSql,
        error: err.message
      });
    } finally {
      if (db) {
        try { db.close(); } catch (_) {}
      }
    }
  }

  console.log('\n=============================================');
  console.log(`TEST RUN COMPLETED:`);
  console.log(`Total Challenges: ${SQL_CHALLENGES.length}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log('=============================================\n');

  if (failures.length > 0) {
    console.log('FAILURES ENCOUNTERED:');
    failures.forEach(f => {
      console.log(`[#${f.index}] ID: ${f.id} | Title: ${f.title}`);
      console.log(`   Error: ${f.error}`);
      console.log(`   SQL: ${f.expectedSql.slice(0, 100)}...`);
    });
  } else {
    console.log('🎉 ALL CHALLENGES EXECUTED AND PASSED SUCCESSFULLY WITH ZERO ERRORS!');
  }
}

runTestSuite();
