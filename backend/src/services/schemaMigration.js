const { Sequelize } = require('sequelize');

/**
 * Robust database schema migration helper for SQLite & PostgreSQL (Neon / Azure / Self-hosted).
 * Ensures all required columns and tables exist without failing on type constraints or casing.
 */
async function runAutoMigrations(sequelize) {
  const isPostgres = sequelize.getDialect() === 'postgres';
  const quote = isPostgres ? '"' : '`';
  const boolType = isPostgres ? 'BOOLEAN' : 'TINYINT(1)';
  const dateType = isPostgres ? 'TIMESTAMP WITH TIME ZONE' : 'DATETIME';
  const ifNotExists = isPostgres ? 'IF NOT EXISTS ' : '';
  const boolTrue = isPostgres ? 'TRUE' : '1';
  const boolFalse = isPostgres ? 'FALSE' : '0';

  const queries = [
    // ═══════════════════════════════════════════
    // 1. Quizzes Table Columns
    // ═══════════════════════════════════════════
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}mode${quote} VARCHAR(255) DEFAULT 'LIVE';`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}schedule_type${quote} VARCHAR(255);`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}timezone${quote} VARCHAR(255) DEFAULT 'Asia/Kolkata';`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}time_limit${quote} INTEGER DEFAULT 30;`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}max_attempts${quote} INTEGER DEFAULT 1;`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}score_policy${quote} VARCHAR(255) DEFAULT 'BEST';`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}shuffle_questions${quote} ${boolType} DEFAULT ${boolFalse};`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}shuffle_answers${quote} ${boolType} DEFAULT ${boolFalse};`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}require_fullscreen${quote} ${boolType} DEFAULT ${boolFalse};`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}anti_cheat_enabled${quote} ${boolType} DEFAULT ${boolTrue};`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}max_violations${quote} INTEGER DEFAULT 3;`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}positive_marks${quote} INTEGER DEFAULT 1;`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}negative_marks${quote} INTEGER DEFAULT 0;`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}show_leaderboard${quote} ${boolType} DEFAULT ${boolTrue};`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}schedule_config${quote} TEXT;`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}subject${quote} VARCHAR(255) DEFAULT 'DBMS';`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}scheduled_start${quote} ${dateType};`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}scheduled_end${quote} ${dateType};`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}verification_synced${quote} ${boolType} DEFAULT ${boolFalse};`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}verification_synced_at${quote} ${dateType};`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}verification_event_id${quote} VARCHAR(255);`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}verification_error${quote} TEXT;`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}svg_template${quote} TEXT;`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}custom_slug${quote} VARCHAR(255);`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}badge_title${quote} VARCHAR(255);`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}event_id${quote} UUID;`,
    `ALTER TABLE ${quote}Quizzes${quote} ADD COLUMN ${ifNotExists}${quote}difficulty${quote} VARCHAR(255) DEFAULT 'Intermediate';`,

    // ═══════════════════════════════════════════
    // 2. Questions Table Columns
    // ═══════════════════════════════════════════
    `ALTER TABLE ${quote}Questions${quote} ADD COLUMN ${ifNotExists}${quote}occurrence_number${quote} INTEGER DEFAULT 1;`,
    `ALTER TABLE ${quote}Questions${quote} ADD COLUMN ${ifNotExists}${quote}section_name${quote} VARCHAR(255);`,
    `ALTER TABLE ${quote}Questions${quote} ADD COLUMN ${ifNotExists}${quote}section_description${quote} TEXT;`,
    `ALTER TABLE ${quote}Questions${quote} ADD COLUMN ${ifNotExists}${quote}difficulty${quote} VARCHAR(255) DEFAULT 'Intermediate';`,
    `ALTER TABLE ${quote}Questions${quote} ADD COLUMN ${ifNotExists}${quote}question_type${quote} VARCHAR(50) DEFAULT 'single';`,
    ...(isPostgres ? [
      `ALTER TABLE "Questions" ALTER COLUMN "correct_answer" TYPE VARCHAR(255) USING "correct_answer"::VARCHAR(255);`,
      `ALTER TABLE IF EXISTS questions ALTER COLUMN correct_answer TYPE VARCHAR(255) USING correct_answer::VARCHAR(255);`,
      `ALTER TABLE "Answers" ALTER COLUMN "selected_answer" TYPE VARCHAR(255) USING "selected_answer"::VARCHAR(255);`,
      `ALTER TABLE IF EXISTS answers ALTER COLUMN selected_answer TYPE VARCHAR(255) USING selected_answer::VARCHAR(255);`
    ] : []),

    // ═══════════════════════════════════════════
    // 3. Users Table Columns
    // ═══════════════════════════════════════════
    `ALTER TABLE ${quote}Users${quote} ADD COLUMN ${ifNotExists}${quote}subject_id${quote} VARCHAR(255);`,
    `ALTER TABLE ${quote}Users${quote} ADD COLUMN ${ifNotExists}${quote}username${quote} VARCHAR(255);`,
    `ALTER TABLE ${quote}Users${quote} ADD COLUMN ${ifNotExists}${quote}otp${quote} VARCHAR(255);`,
    `ALTER TABLE ${quote}Users${quote} ADD COLUMN ${ifNotExists}${quote}otp_expiry${quote} ${dateType};`,
    `ALTER TABLE ${quote}Users${quote} ADD COLUMN ${ifNotExists}${quote}is_verified${quote} ${boolType} DEFAULT ${boolTrue};`,

    // ═══════════════════════════════════════════
    // 4. Participants & QuizAttempts Table Columns
    // ═══════════════════════════════════════════
    `ALTER TABLE ${quote}Participants${quote} ADD COLUMN ${ifNotExists}${quote}sso_user_id${quote} VARCHAR(255);`,
    `ALTER TABLE ${quote}Participants${quote} ADD COLUMN ${ifNotExists}${quote}disqualified${quote} ${boolType} DEFAULT ${boolFalse};`,
    `ALTER TABLE ${quote}QuizAttempts${quote} ADD COLUMN ${ifNotExists}${quote}sso_user_id${quote} VARCHAR(255);`,
    `ALTER TABLE ${quote}QuizAttempts${quote} ADD COLUMN ${ifNotExists}${quote}question_order${quote} TEXT;`,
    `ALTER TABLE ${quote}QuizAttempts${quote} ADD COLUMN ${ifNotExists}${quote}option_orders${quote} TEXT;`,

    // ═══════════════════════════════════════════
    // 5. Events Table
    // ═══════════════════════════════════════════
    `CREATE TABLE IF NOT EXISTS ${quote}Events${quote} (
      ${quote}id${quote} UUID PRIMARY KEY,
      ${quote}name${quote} VARCHAR(255) NOT NULL,
      ${quote}slug${quote} VARCHAR(255),
      ${quote}description${quote} TEXT,
      ${quote}poster_url${quote} VARCHAR(255),
      ${quote}category${quote} VARCHAR(255) DEFAULT 'Technical Workshop',
      ${quote}mode${quote} VARCHAR(255) DEFAULT 'Offline',
      ${quote}venue${quote} VARCHAR(255) DEFAULT 'PRPCEM Amravati',
      ${quote}start_date${quote} ${dateType},
      ${quote}end_date${quote} ${dateType},
      ${quote}registration_start_date${quote} ${dateType},
      ${quote}registration_end_date${quote} ${dateType},
      ${quote}max_registrations${quote} INTEGER,
      ${quote}initial_registration_count${quote} INTEGER DEFAULT 0,
      ${quote}fee${quote} VARCHAR(255) DEFAULT 'Free',
      ${quote}is_registration_open${quote} ${boolType} DEFAULT ${boolTrue},
      ${quote}rewards${quote} VARCHAR(255) DEFAULT 'Certificates & Swags',
      ${quote}status${quote} VARCHAR(255) DEFAULT 'upcoming',
      ${quote}createdAt${quote} ${dateType},
      ${quote}updatedAt${quote} ${dateType}
    );`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}slug${quote} VARCHAR(255);`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}description${quote} TEXT;`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}poster_url${quote} VARCHAR(255);`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}category${quote} VARCHAR(255) DEFAULT 'Technical Workshop';`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}mode${quote} VARCHAR(255) DEFAULT 'Offline';`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}venue${quote} VARCHAR(255) DEFAULT 'PRPCEM Amravati';`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}start_date${quote} ${dateType};`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}end_date${quote} ${dateType};`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}registration_start_date${quote} ${dateType};`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}registration_end_date${quote} ${dateType};`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}max_registrations${quote} INTEGER;`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}initial_registration_count${quote} INTEGER DEFAULT 0;`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}fee${quote} VARCHAR(255) DEFAULT 'Free';`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}is_registration_open${quote} ${boolType} DEFAULT ${boolTrue};`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}rewards${quote} VARCHAR(255) DEFAULT 'Certificates & Swags';`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}status${quote} VARCHAR(255) DEFAULT 'upcoming';`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}registration_type${quote} VARCHAR(255) DEFAULT 'internal';`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}external_registration_url${quote} VARCHAR(1024);`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}auto_redirect_external${quote} ${boolType} DEFAULT ${boolFalse};`,

    // PostgreSQL Enum Self-Healing for enum_Events_status
    ...(isPostgres ? [
      `ALTER TYPE "enum_Events_status" ADD VALUE IF NOT EXISTS 'past';`,
      `ALTER TYPE "enum_Events_status" ADD VALUE IF NOT EXISTS 'completed';`,
      `ALTER TYPE "enum_Events_status" ADD VALUE IF NOT EXISTS 'upcoming';`,
      `ALTER TYPE "enum_Events_status" ADD VALUE IF NOT EXISTS 'live';`,
      `ALTER TYPE "enum_Events_status" ADD VALUE IF NOT EXISTS 'active';`,
      `ALTER TYPE enum_events_status ADD VALUE IF NOT EXISTS 'past';`,
      `ALTER TYPE enum_events_status ADD VALUE IF NOT EXISTS 'completed';`,
      `ALTER TYPE enum_events_status ADD VALUE IF NOT EXISTS 'upcoming';`,
      `ALTER TYPE enum_events_status ADD VALUE IF NOT EXISTS 'live';`,
      `ALTER TYPE enum_events_status ADD VALUE IF NOT EXISTS 'active';`,
      `ALTER TABLE "Events" ALTER COLUMN "status" TYPE VARCHAR(255) USING "status"::VARCHAR(255);`,
      `ALTER TABLE IF EXISTS events ALTER COLUMN status TYPE VARCHAR(255) USING status::VARCHAR(255);`
    ] : []),

    // ═══════════════════════════════════════════
    // 6. EventRegistrations Table
    // ═══════════════════════════════════════════
    `CREATE TABLE IF NOT EXISTS ${quote}EventRegistrations${quote} (
      ${quote}id${quote} UUID PRIMARY KEY,
      ${quote}event_id${quote} VARCHAR(255) NOT NULL,
      ${quote}event_name${quote} VARCHAR(255) NOT NULL,
      ${quote}user_id${quote} UUID,
      ${quote}full_name${quote} VARCHAR(255) NOT NULL,
      ${quote}email${quote} VARCHAR(255) NOT NULL,
      ${quote}phone${quote} VARCHAR(255),
      ${quote}college${quote} VARCHAR(255),
      ${quote}branch${quote} VARCHAR(255),
      ${quote}year_of_study${quote} VARCHAR(255),
      ${quote}roll_no${quote} VARCHAR(255),
      ${quote}notes${quote} TEXT,
      ${quote}status${quote} VARCHAR(255) DEFAULT 'registered',
      ${quote}createdAt${quote} ${dateType},
      ${quote}updatedAt${quote} ${dateType}
    );`,
    `ALTER TABLE ${quote}EventRegistrations${quote} ADD COLUMN ${ifNotExists}${quote}notes${quote} TEXT;`,
    `ALTER TABLE ${quote}EventRegistrations${quote} ADD COLUMN ${ifNotExists}${quote}status${quote} VARCHAR(255) DEFAULT 'registered';`,

    // ═══════════════════════════════════════════
    // 7. Subscribers Table (Notify Me for Future Quizzes)
    // ═══════════════════════════════════════════
    `CREATE TABLE IF NOT EXISTS ${quote}Subscribers${quote} (
      ${quote}id${quote} UUID PRIMARY KEY,
      ${quote}email${quote} VARCHAR(255) NOT NULL,
      ${quote}source${quote} VARCHAR(255) DEFAULT 'Courses Page',
      ${quote}topic${quote} VARCHAR(255) DEFAULT 'Future Quizzes & Course Releases',
      ${quote}ip_address${quote} VARCHAR(255),
      ${quote}synced_to_sheet${quote} BOOLEAN DEFAULT FALSE,
      ${quote}sheet_sync_error${quote} TEXT,
      ${quote}createdAt${quote} ${dateType},
      ${quote}updatedAt${quote} ${dateType}
    );`,

    // ═══════════════════════════════════════════
    // 7. Postgres Unquoted Lowercase Fallbacks (if tables created unquoted)
    // ═══════════════════════════════════════════
    ...(isPostgres ? [
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS slug VARCHAR(255);`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS description TEXT;`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS poster_url VARCHAR(255);`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS category VARCHAR(255) DEFAULT 'Technical Workshop';`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS mode VARCHAR(255) DEFAULT 'Offline';`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS venue VARCHAR(255) DEFAULT 'PRPCEM Amravati';`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS start_date ${dateType};`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS end_date ${dateType};`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS registration_start_date ${dateType};`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS registration_end_date ${dateType};`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS max_registrations INTEGER;`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS initial_registration_count INTEGER DEFAULT 0;`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS fee VARCHAR(255) DEFAULT 'Free';`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS is_registration_open BOOLEAN DEFAULT TRUE;`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS rewards VARCHAR(255) DEFAULT 'Certificates & Swags';`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS status VARCHAR(255) DEFAULT 'upcoming';`,
      `ALTER TABLE IF EXISTS eventregistrations ADD COLUMN IF NOT EXISTS notes TEXT;`,
      `ALTER TABLE IF EXISTS eventregistrations ADD COLUMN IF NOT EXISTS status VARCHAR(255) DEFAULT 'registered';`
    ] : [])
  ];

  for (const q of queries) {
    try {
      await sequelize.query(q);
    } catch (err) {
      // Ignored if column or table already exists or handled by database
      // Only log unexpected critical syntax failures in development
      if (process.env.DEBUG_DB) {
        console.warn(`[Auto-Migration Notice] query '${q.slice(0, 50)}...' returned:`, err.message);
      }
    }
  }

  // Safe table synchronization
  try {
    await sequelize.sync();
  } catch (syncErr) {
    console.warn("⚠️ Database sync warning:", syncErr.message);
  }

  // High-performance database indexes
  const indexQueries = [
    `CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON ${quote}Questions${quote} (${quote}quiz_id${quote});`,
    `CREATE INDEX IF NOT EXISTS idx_participants_quiz_id ON ${quote}Participants${quote} (${quote}quiz_id${quote});`,
    `CREATE INDEX IF NOT EXISTS idx_answers_participant_id ON ${quote}Answers${quote} (${quote}participant_id${quote});`,
    `CREATE INDEX IF NOT EXISTS idx_answers_question_id ON ${quote}Answers${quote} (${quote}question_id${quote});`,
    `CREATE INDEX IF NOT EXISTS idx_occurrences_quiz_id ON ${quote}ScheduledOccurrences${quote} (${quote}quiz_id${quote});`,
    `CREATE INDEX IF NOT EXISTS idx_quizattempts_occurrence_id ON ${quote}QuizAttempts${quote} (${quote}occurrence_id${quote});`,
    `CREATE INDEX IF NOT EXISTS idx_quizattempts_quiz_id ON ${quote}QuizAttempts${quote} (${quote}quiz_id${quote});`,
    `CREATE INDEX IF NOT EXISTS idx_quizzes_custom_slug ON ${quote}Quizzes${quote} (${quote}custom_slug${quote});`,
    `CREATE INDEX IF NOT EXISTS idx_quizzes_join_code ON ${quote}Quizzes${quote} (${quote}join_code${quote});`,
    `CREATE INDEX IF NOT EXISTS idx_events_slug ON ${quote}Events${quote} (${quote}slug${quote});`,
    `CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON ${quote}EventRegistrations${quote} (${quote}event_id${quote});`,
    `CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON ${quote}EventRegistrations${quote} (${quote}email${quote});`
  ];

  for (const idxQ of indexQueries) {
    try {
      await sequelize.query(idxQ);
    } catch (e) {
      // Index already exists
    }
  }

  console.log("✅ Database Schema Auto-Migrated & High-Performance Indexes Ready");
}

/**
 * On-demand self-healing helper for Events table.
 * Can be called during runtime if an operation encounters missing columns.
 */
async function ensureEventsTableSchema(sequelize) {
  const isPostgres = sequelize.getDialect() === 'postgres';
  const quote = isPostgres ? '"' : '`';
  const boolType = isPostgres ? 'BOOLEAN' : 'TINYINT(1)';
  const dateType = isPostgres ? 'TIMESTAMP WITH TIME ZONE' : 'DATETIME';
  const ifNotExists = isPostgres ? 'IF NOT EXISTS ' : '';
  const boolTrue = isPostgres ? 'TRUE' : '1';

  const queries = [
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}slug${quote} VARCHAR(255);`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}description${quote} TEXT;`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}poster_url${quote} VARCHAR(255);`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}category${quote} VARCHAR(255) DEFAULT 'Technical Workshop';`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}mode${quote} VARCHAR(255) DEFAULT 'Offline';`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}venue${quote} VARCHAR(255) DEFAULT 'PRPCEM Amravati';`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}start_date${quote} ${dateType};`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}end_date${quote} ${dateType};`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}registration_start_date${quote} ${dateType};`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}registration_end_date${quote} ${dateType};`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}max_registrations${quote} INTEGER;`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}initial_registration_count${quote} INTEGER DEFAULT 0;`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}fee${quote} VARCHAR(255) DEFAULT 'Free';`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}is_registration_open${quote} ${boolType} DEFAULT ${boolTrue};`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}rewards${quote} VARCHAR(255) DEFAULT 'Certificates & Swags';`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}status${quote} VARCHAR(255) DEFAULT 'upcoming';`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}registration_type${quote} VARCHAR(255) DEFAULT 'internal';`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}external_registration_url${quote} VARCHAR(1024);`,
    `ALTER TABLE ${quote}Events${quote} ADD COLUMN ${ifNotExists}${quote}auto_redirect_external${quote} ${boolType} DEFAULT ${boolFalse};`,
    ...(isPostgres ? [
      `ALTER TYPE "enum_Events_status" ADD VALUE IF NOT EXISTS 'past';`,
      `ALTER TYPE "enum_Events_status" ADD VALUE IF NOT EXISTS 'completed';`,
      `ALTER TYPE "enum_Events_status" ADD VALUE IF NOT EXISTS 'upcoming';`,
      `ALTER TYPE "enum_Events_status" ADD VALUE IF NOT EXISTS 'live';`,
      `ALTER TYPE "enum_Events_status" ADD VALUE IF NOT EXISTS 'active';`,
      `ALTER TYPE enum_events_status ADD VALUE IF NOT EXISTS 'past';`,
      `ALTER TYPE enum_events_status ADD VALUE IF NOT EXISTS 'completed';`,
      `ALTER TYPE enum_events_status ADD VALUE IF NOT EXISTS 'upcoming';`,
      `ALTER TYPE enum_events_status ADD VALUE IF NOT EXISTS 'live';`,
      `ALTER TYPE enum_events_status ADD VALUE IF NOT EXISTS 'active';`,
      `ALTER TABLE "Events" ALTER COLUMN "status" TYPE VARCHAR(255) USING "status"::VARCHAR(255);`,
      `ALTER TABLE IF EXISTS events ALTER COLUMN status TYPE VARCHAR(255) USING status::VARCHAR(255);`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS is_registration_open BOOLEAN DEFAULT TRUE;`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS max_registrations INTEGER;`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS initial_registration_count INTEGER DEFAULT 0;`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS registration_start_date ${dateType};`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS registration_end_date ${dateType};`,
      `ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS status VARCHAR(255) DEFAULT 'upcoming';`
    ] : [])
  ];

  for (const q of queries) {
    try {
      await sequelize.query(q);
    } catch (e) {
      // Ignored
    }
  }
}

module.exports = {
  runAutoMigrations,
  ensureEventsTableSchema
};
