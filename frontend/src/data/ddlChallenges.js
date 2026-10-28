// DDL Initial Base Schemas
export const DDL_SCHEMAS = {
  schoolBase: `
    CREATE TABLE students (
      student_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      city TEXT
    );

    CREATE TABLE teachers (
      teacher_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL
    );

    CREATE TABLE classes (
      class_id INTEGER PRIMARY KEY,
      class_name TEXT NOT NULL
    );

    INSERT INTO students (student_id, name, age, city) VALUES
      (1, 'Aarav Sharma', 15, 'Mumbai'),
      (2, 'Diya Patel', 16, 'Delhi');

    INSERT INTO teachers (teacher_id, name, subject) VALUES
      (101, 'Prof. Verma', 'Mathematics'),
      (102, 'Dr. Rao', 'Physics');

    INSERT INTO classes (class_id, class_name) VALUES
      (10, 'Grade 10A'),
      (11, 'Grade 11B');
  `,

  studentsWithExtraCols: `
    CREATE TABLE students (
      student_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      city TEXT,
      email TEXT,
      phone TEXT
    );

    CREATE TABLE teachers (
      teacher_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      salary INTEGER,
      experience INTEGER
    );

    CREATE TABLE classes (
      class_id INTEGER PRIMARY KEY,
      class_name TEXT NOT NULL,
      room_no TEXT
    );
  `,

    schoolTablesBeforeRename: `
    CREATE TABLE school_students (
      student_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      city TEXT
    );

    CREATE TABLE school_teachers (
      teacher_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL
    );

    CREATE TABLE school_classes (
      class_id INTEGER PRIMARY KEY,
      class_name TEXT NOT NULL
    );

    INSERT INTO school_students VALUES (1, 'Rohan', 16, 'Mumbai'), (2, 'Pooja', 17, 'Delhi');
    INSERT INTO school_teachers VALUES (101, 'Dr. Nair', 'Chemistry');
    INSERT INTO school_classes VALUES (1, 'Math 101');
  `,

  renamedTables: `
    CREATE TABLE students_info (
      student_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      city TEXT
    );

    CREATE TABLE teachers_info (
      teacher_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL
    );

    CREATE TABLE school_classes (
      class_id INTEGER PRIMARY KEY,
      class_name TEXT NOT NULL
    );

    INSERT INTO students_info VALUES (1, 'Rohan', 16, 'Mumbai'), (2, 'Pooja', 17, 'Delhi');
    INSERT INTO teachers_info VALUES (101, 'Dr. Nair', 'Chemistry');
    INSERT INTO school_classes VALUES (1, 'Math 101');
  `
,

  classesWithRoomNumber: `
    CREATE TABLE students (
      student_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      city TEXT,
      email TEXT,
      phone TEXT
    );

    CREATE TABLE teachers (
      teacher_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      salary INTEGER,
      experience INTEGER
    );

    CREATE TABLE classes (
      class_id INTEGER PRIMARY KEY,
      class_name TEXT NOT NULL,
      room_number TEXT
    );
  `,
};

export const DDL_CHALLENGES = [
  // ==========================================
  // SECTION A: CREATE DATABASE & TABLE
  // ==========================================
  {
    id: 'ddl-01',
    moduleId: 'ddl-sec-a',
    moduleTitle: 'Section A: CREATE DATABASE & TABLE',
    title: 'Initialize school_db Database',
    difficulty: 'Basic',
    tags: ['DDL', 'CREATE DATABASE'],
    interviewFrequency: 'Foundational',
    description: `
**Scenario**: You are onboarding as a Junior Database Administrator for an educational network. The administration requires a dedicated, isolated database container to house all academic records, student enrollments, faculty profiles, and classroom scheduling.

**Task Requirements**:
- Create a new database catalog named **\`school_db\`**.
- Ensure the syntax is compliant with standard relational database management systems.

*Note: Creating a database allocates dedicated catalog metadata and storage space in relational database systems.*
    `,
    setupSql: '',
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `CREATE DATABASE school_db;`,
    checkOrder: false,
    hints: [
      'Think about which SQL statement initializes a new database catalog.'
    ],
    explanation: `
\`CREATE DATABASE db_name;\` is an initial DDL statement that establishes a new logical database instance within the RDBMS server. DDL statements are auto-committed immediately.
    `
  },

  {
    id: 'ddl-02',
    moduleId: 'ddl-sec-a',
    moduleTitle: 'Section A: CREATE DATABASE & TABLE',
    title: 'Select Active Database Context (USE)',
    difficulty: 'Basic',
    tags: ['DDL', 'USE DATABASE'],
    interviewFrequency: 'Foundational',
    description: `
**Scenario**: Following the creation of the **\`school_db\`** database, your client terminal session is currently unattached to any schema. Before executing any table creation scripts, you must set the active database context so that subsequent entities are created in the intended namespace.

**Task Requirements**:
- Write the SQL command to switch your active database connection context to **\`school_db\`**.
    `,
    setupSql: '',
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `USE school_db;`,
    checkOrder: false,
    hints: [
      'Think about which command sets the active working database for the session.'
    ],
    explanation: `
The \`USE database_name;\` statement sets the default schema namespace for all subsequent queries and DDL operations executed within that connection session.
    `
  },

  {
    id: 'ddl-03',
    moduleId: 'ddl-sec-a',
    moduleTitle: 'Section A: CREATE DATABASE & TABLE',
    title: 'Design students Entity Table',
    difficulty: 'Basic',
    tags: ['DDL', 'CREATE TABLE', 'PRIMARY KEY'],
    interviewFrequency: 'Common Interview Question',
    description: `
**Scenario**: The registrar's office needs to record incoming admissions for the academic year. You are tasked with creating the primary **\`students\`** relation with strict data integrity rules.

**Column Specifications**:
| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| **student_id** | INTEGER | PRIMARY KEY | Unique student registration identifier |
| **name** | VARCHAR(50) | NOT NULL | Full name of the enrolled student |
| **age** | INTEGER | None | Age of the student |
| **city** | VARCHAR(50) | None | City of permanent residence |

**Task Requirements**:
- Write a DDL statement to create the **\`students\`** table matching the exact specifications above.
    `,
    setupSql: '',
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `
CREATE TABLE students (
  student_id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  age INTEGER,
  city VARCHAR(50)
);`,
    checkOrder: false,
    hints: [
      'Define columns inside parentheses: `CREATE TABLE students (student_id INT PRIMARY KEY, name VARCHAR(50) NOT NULL, age INT, city VARCHAR(50));`'
    ],
    explanation: `
\`CREATE TABLE\` establishes the table definition in the data dictionary. Declaring \`student_id\` as \`PRIMARY KEY\` enforces uniqueness and creates a clustered index on the column.
    `
  },

  {
    id: 'ddl-04',
    moduleId: 'ddl-sec-a',
    moduleTitle: 'Section A: CREATE DATABASE & TABLE',
    title: 'Design teachers Faculty Table',
    difficulty: 'Basic',
    tags: ['DDL', 'CREATE TABLE'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: The academic dean needs to store faculty instructor profiles, assigned academic subjects, and payroll linkages.

**Column Specifications**:
| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| **teacher_id** | INTEGER | PRIMARY KEY | Unique employee faculty identifier |
| **name** | VARCHAR(50) | NOT NULL | Instructor legal name |
| **subject** | VARCHAR(50) | NOT NULL | Primary academic subject taught |

**Task Requirements**:
- Write a DDL statement to construct the **\`teachers\`** table with all primary key and not-null constraints.
    `,
    setupSql: '',
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `
CREATE TABLE teachers (
  teacher_id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  subject VARCHAR(50) NOT NULL
);`,
    checkOrder: false,
    hints: [
      'Use `teacher_id INT PRIMARY KEY`, and ensure `name` and `subject` specify `NOT NULL`.'
    ],
    explanation: `
Ensures that no instructor profile can be inserted without an explicit name and assigned academic department subject.
    `
  },

  {
    id: 'ddl-05',
    moduleId: 'ddl-sec-a',
    moduleTitle: 'Section A: CREATE DATABASE & TABLE',
    title: 'Design classes Lookup Table',
    difficulty: 'Basic',
    tags: ['DDL', 'CREATE TABLE'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: Class divisions (e.g. Grade 10A, Grade 11B) must be tracked in a normalized lookup table to prevent spelling errors and redundant data entry across course schedules.

**Column Specifications**:
| Column Name | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| **class_id** | INTEGER | PRIMARY KEY | Unique division / classroom identifier |
| **class_name** | VARCHAR(50) | NOT NULL | Title of the academic division |

**Task Requirements**:
- Create the **\`classes\`** table with the required attributes and constraints.
    `,
    setupSql: '',
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `
CREATE TABLE classes (
  class_id INTEGER PRIMARY KEY,
  class_name VARCHAR(50) NOT NULL
);`,
    checkOrder: false,
    hints: [
      'Declare primary key and not-null constraints alongside column types.'
    ],
    explanation: `
Creates the normalized lookup entity for organizing school divisions and grade sections.
    `
  },

  // ==========================================
  // SECTION B: ALTER – ADD COLUMN
  // ==========================================
  {
    id: 'ddl-06',
    moduleId: 'ddl-sec-b',
    moduleTitle: 'Section B: ALTER – ADD COLUMN',
    title: 'Add email Column to students',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'ADD COLUMN'],
    interviewFrequency: 'Very Common',
    description: `
**Scenario**: The university is launching an automated email notification system for exam grades and announcements. The current **\`students\`** table does not have an electronic mail field.

**Task Requirements**:
- Add an **\`email\`** column of type **\`VARCHAR(100)\`**.
- Existing student records must remain intact.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE students ADD COLUMN email VARCHAR(100);`,
    checkOrder: false,
    hints: [
      'Think about which SQL DDL statement alters an existing table structure to introduce a new attribute.'
    ],
    explanation: `
\`ALTER TABLE ... ADD COLUMN\` updates the table metadata schema in-place without requiring table drop or data migration.
    `
  },

  {
    id: 'ddl-07',
    moduleId: 'ddl-sec-b',
    moduleTitle: 'Section B: ALTER – ADD COLUMN',
    title: 'Add phone Column to students',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'ADD COLUMN'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: For emergency SMS alerts and parental verification, the administration requires storing mobile numbers for all enrolled students.

**Task Requirements**:
- Add a **\`phone\`** column of type **\`VARCHAR(20)\`** to the **\`students\`** table.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE students ADD COLUMN phone VARCHAR(20);`,
    checkOrder: false,
    hints: [
      'Consider how to modify the table structure to introduce the new column.'
    ],
    explanation: `
Adds telephone contact metadata to existing student records.
    `
  },

  {
    id: 'ddl-08',
    moduleId: 'ddl-sec-b',
    moduleTitle: 'Section B: ALTER – ADD COLUMN',
    title: 'Add salary Column to teachers',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'ADD COLUMN'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: The accounting department is integrating faculty payroll into the central database. You must modify the **\`teachers\`** table to support monetary compensation values.

**Task Requirements**:
- Add a **\`salary\`** column of type **\`INTEGER\`** to the **\`teachers\`** table.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE teachers ADD COLUMN salary INTEGER;`,
    checkOrder: false,
    hints: [
      'Consider how to expand an existing table with an additional numeric column.'
    ],
    explanation: `
Integrates financial compensation attributes into the faculty entity.
    `
  },

  {
    id: 'ddl-09',
    moduleId: 'ddl-sec-b',
    moduleTitle: 'Section B: ALTER – ADD COLUMN',
    title: 'Add experience Column to teachers',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'ADD COLUMN'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: To determine senior professorship eligibility, HR needs to log the total years of pedagogical experience for each instructor.

**Task Requirements**:
- Add an **\`experience\`** column of type **\`INTEGER\`** to the **\`teachers\`** table.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE teachers ADD COLUMN experience INTEGER;`,
    checkOrder: false,
    hints: [
      'Specify the new column name and integer type on the teachers relation.'
    ],
    explanation: `
Expands the faculty table with tenure information for appraisal reviews.
    `
  },

  {
    id: 'ddl-10',
    moduleId: 'ddl-sec-b',
    moduleTitle: 'Section B: ALTER – ADD COLUMN',
    title: 'Add room_no Column to classes',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'ADD COLUMN'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: Facilities management requires mapping each academic class division to its physical campus lecture hall or laboratory room.

**Task Requirements**:
- Add a **\`room_no\`** column of type **\`VARCHAR(10)\`** to the **\`classes\`** table.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE classes ADD COLUMN room_no VARCHAR(10);`,
    checkOrder: false,
    hints: [
      'Add the new VARCHAR column to the classes relation.'
    ],
    explanation: `
Associates physical classroom numbers with academic class divisions.
    `
  },

  // ==========================================
  // SECTION C: ALTER – MODIFY COLUMN
  // ==========================================
  {
    id: 'ddl-11',
    moduleId: 'ddl-sec-c',
    moduleTitle: 'Section C: ALTER – MODIFY COLUMN',
    title: 'Optimize age Column Storage',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'MODIFY COLUMN', 'OPTIMIZATION'],
    interviewFrequency: 'Interview Standard',
    description: `
**Scenario**: During a database capacity audit, the Lead DBA noticed that the **\`age\`** column in **\`students\`** is currently defined as a 4-byte standard integer. Since human age never exceeds 120, switching to a 2-byte integer will cut storage requirements in half.

**Task Requirements**:
- Write a DDL statement to modify the datatype of the **\`age\`** column in the **\`students\`** table to **\`SMALLINT\`**.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE students MODIFY COLUMN age SMALLINT;`,
    checkOrder: false,
    hints: [
      'Think about how to alter a column\'s data type on an existing relation.'
    ],
    explanation: `
\`MODIFY COLUMN\` alters the physical storage format of an existing column. \`SMALLINT\` conserves memory footprint while safely accommodating all valid human ages.
    `
  },

  {
    id: 'ddl-12',
    moduleId: 'ddl-sec-c',
    moduleTitle: 'Section C: ALTER – MODIFY COLUMN',
    title: 'Expand name Column Capacity',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'MODIFY COLUMN'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: Several incoming international students have combined multi-word surnames and patronymics exceeding the current 50-character limit of the **\`name\`** column in the **\`students\`** table.

**Task Requirements**:
- Expand the capacity of the **\`name\`** column to **\`VARCHAR(100)\`** in the **\`students\`** table.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE students MODIFY COLUMN name VARCHAR(100);`,
    checkOrder: false,
    hints: [
      'Consider how to update the data type definition of an existing column.'
    ],
    explanation: `
Increasing the length of a variable-length character field is an online metadata alteration that accommodates longer text without truncating existing rows.
    `
  },

  {
    id: 'ddl-13',
    moduleId: 'ddl-sec-c',
    moduleTitle: 'Section C: ALTER – MODIFY COLUMN',
    title: 'Standardize phone Column Format',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'MODIFY COLUMN'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: The **\`phone\`** column in the **\`students\`** table needs to support country dial codes (e.g. \`+91-9876543210\`) and extension numbers.

**Task Requirements**:
- Modify the **\`phone\`** column in the **\`students\`** table to use **\`VARCHAR(20)\`**.
    `,
    setupSql: DDL_SCHEMAS.studentsWithExtraCols,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE students MODIFY COLUMN phone VARCHAR(20);`,
    checkOrder: false,
    hints: [
      'Alter the column specification to VARCHAR(20).'
    ],
    explanation: `
Phone numbers must always use character datatypes rather than integers to preserve leading zeroes and country code formatting symbols.
    `
  },

  {
    id: 'ddl-14',
    moduleId: 'ddl-sec-c',
    moduleTitle: 'Section C: ALTER – MODIFY COLUMN',
    title: 'Expand salary Column to BIGINT',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'MODIFY COLUMN'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: To support institutional enterprise payroll scaling and multi-year pension totals, the financial director requested upgrading the **\`salary\`** column in **\`teachers\`** to a 64-bit integer.

**Task Requirements**:
- Modify the **\`salary\`** column in the **\`teachers\`** table to **\`BIGINT\`**.
    `,
    setupSql: DDL_SCHEMAS.studentsWithExtraCols,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE teachers MODIFY COLUMN salary BIGINT;`,
    checkOrder: false,
    hints: [
      'Update the data type of the salary column on the teachers table.'
    ],
    explanation: `
Upgrading to \`BIGINT\` safeguards against arithmetic overflow when aggregating multi-million dollar institutional payroll budgets.
    `
  },

  {
    id: 'ddl-15',
    moduleId: 'ddl-sec-c',
    moduleTitle: 'Section C: ALTER – MODIFY COLUMN',
    title: 'Expand subject Column Capacity',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'MODIFY COLUMN'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: New interdisciplinary courses such as *"Quantum Cryptography & Distributed Systems"* exceed 50 characters in length.

**Task Requirements**:
- Expand the **\`subject\`** column in the **\`teachers\`** table to **\`VARCHAR(100)\`**.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE teachers MODIFY COLUMN subject VARCHAR(100);`,
    checkOrder: false,
    hints: [
      'Alter the subject column definition on the teachers table.'
    ],
    explanation: `
Accommodates detailed curriculum specialization names without data truncation.
    `
  },

  // ==========================================
  // SECTION D: ALTER – RENAME COLUMN
  // ==========================================
  {
    id: 'ddl-16',
    moduleId: 'ddl-sec-d',
    moduleTitle: 'Section D: ALTER – RENAME COLUMN',
    title: 'Rename city to location',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'RENAME COLUMN'],
    interviewFrequency: 'High (Frequent in Placements)',
    description: `
**Scenario**: To adhere to corporate enterprise naming standards, the database architecture committee requested replacing generic terms with standardized schema attributes.

**Task Requirements**:
- Rename the column **\`city\`** to **\`location\`** in the **\`students\`** table.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE students RENAME COLUMN city TO location;`,
    checkOrder: false,
    hints: [
      'Think about how to rename an attribute within a table relation.'
    ],
    explanation: `
\`RENAME COLUMN\` updates the column dictionary identifier without touching row data pages or requiring an expensive table rebuild.
    `
  },

  {
    id: 'ddl-17',
    moduleId: 'ddl-sec-d',
    moduleTitle: 'Section D: ALTER – RENAME COLUMN',
    title: 'Rename name to student_name',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'RENAME COLUMN'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: When joining **\`students\`** and **\`teachers\`**, both tables possessing a column named \`name\` creates ambiguity in queries and reporting scripts.

**Task Requirements**:
- Rename the column **\`name\`** to **\`student_name\`** in the **\`students\`** table.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE students RENAME COLUMN name TO student_name;`,
    checkOrder: false,
    hints: [
      'Specify the old column name and the new column name on the students relation.'
    ],
    explanation: `
Self-descriptive column identifiers eliminate ambiguity in multi-table queries and reporting dashboards.
    `
  },

  {
    id: 'ddl-18',
    moduleId: 'ddl-sec-d',
    moduleTitle: 'Section D: ALTER – RENAME COLUMN',
    title: 'Rename name to teacher_name',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'RENAME COLUMN'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: In parallel with the student schema refactor, the faculty table column must also be explicitly named to distinguish teachers from students.

**Task Requirements**:
- Rename the column **\`name\`** to **\`teacher_name\`** in the **\`teachers\`** table.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE teachers RENAME COLUMN name TO teacher_name;`,
    checkOrder: false,
    hints: [
      'Specify the old column name and the target column name.'
    ],
    explanation: `
Refactors the faculty name attribute to match standard relational conventions.
    `
  },

  {
    id: 'ddl-19',
    moduleId: 'ddl-sec-d',
    moduleTitle: 'Section D: ALTER – RENAME COLUMN',
    title: 'Rename room_no to room_number',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'RENAME COLUMN'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: Developers requested eliminating abbreviations across database tables to simplify automated ORM object generation in the backend.

**Task Requirements**:
- Rename the column **\`room_no\`** to **\`room_number\`** in the **\`classes\`** table.
    `,
    setupSql: DDL_SCHEMAS.studentsWithExtraCols,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE classes RENAME COLUMN room_no TO room_number;`,
    checkOrder: false,
    hints: [
      'Update the column identifier on the classes relation.'
    ],
    explanation: `
Expands abbreviated identifiers to canonical full-word schema terms.
    `
  },

  {
    id: 'ddl-20',
    moduleId: 'ddl-sec-d',
    moduleTitle: 'Section D: ALTER – RENAME COLUMN',
    title: 'Rename experience to years_of_experience',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'RENAME COLUMN'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: Some users mistakenly logged experience in months rather than years. To enforce clarity, the column name must specify the measurement unit.

**Task Requirements**:
- Rename the column **\`experience\`** to **\`years_of_experience\`** in the **\`teachers\`** table.
    `,
    setupSql: DDL_SCHEMAS.studentsWithExtraCols,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE teachers RENAME COLUMN experience TO years_of_experience;`,
    checkOrder: false,
    hints: [
      'Rename the attribute on the teachers table.'
    ],
    explanation: `
Embedding units of measurement directly in column names prevents human data entry confusion.
    `
  },

  // ==========================================
  // SECTION E: ALTER – DROP COLUMN
  // ==========================================
  {
    id: 'ddl-21',
    moduleId: 'ddl-sec-e',
    moduleTitle: 'Section E: ALTER – DROP COLUMN',
    title: 'Drop email Column',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'DROP COLUMN', 'COMPLIANCE'],
    interviewFrequency: 'High',
    description: `
**Scenario**: Following GDPR and student data privacy regulations, student email communications have been migrated to a centralized single sign-on authentication service. The local **\`email\`** column in **\`students\`** is deprecated and must be permanently erased.

**Task Requirements**:
- Permanently remove the **\`email\`** column from the **\`students\`** table.
    `,
    setupSql: DDL_SCHEMAS.studentsWithExtraCols,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE students DROP COLUMN email;`,
    checkOrder: false,
    hints: [
      'Think about how to remove an unwanted column from an existing table structure.'
    ],
    explanation: `
\`DROP COLUMN\` permanently removes the field definition and data content from all rows in the relation.
    `
  },

  {
    id: 'ddl-22',
    moduleId: 'ddl-sec-e',
    moduleTitle: 'Section E: ALTER – DROP COLUMN',
    title: 'Drop phone Column',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'DROP COLUMN'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: Student phone numbers have been moved to a normalized guardian contact table.

**Task Requirements**:
- Remove the **\`phone\`** column from the **\`students\`** table.
    `,
    setupSql: DDL_SCHEMAS.studentsWithExtraCols,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE students DROP COLUMN phone;`,
    checkOrder: false,
    hints: [
      'Consider which clause removes a column definition from a table relation.'
    ],
    explanation: `
Removes redundant phone contact data from the core student entity.
    `
  },

  {
    id: 'ddl-23',
    moduleId: 'ddl-sec-e',
    moduleTitle: 'Section E: ALTER – DROP COLUMN',
    title: 'Drop salary Column',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'DROP COLUMN', 'SECURITY'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: For security and strict role-based access control, faculty salary information must not be visible in general academic lookup tables.

**Task Requirements**:
- Remove the **\`salary\`** column from the **\`teachers\`** table.
    `,
    setupSql: DDL_SCHEMAS.studentsWithExtraCols,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE teachers DROP COLUMN salary;`,
    checkOrder: false,
    hints: [
      'Remove the specified attribute from the teachers table.'
    ],
    explanation: `
Decouples sensitive financial compensation from general faculty academic directories.
    `
  },

  {
    id: 'ddl-24',
    moduleId: 'ddl-sec-e',
    moduleTitle: 'Section E: ALTER – DROP COLUMN',
    title: 'Drop room_number Column from classes',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'DROP COLUMN'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: Classroom assignments are now handled dynamically on a daily basis in a separate room scheduling table.

**Task Requirements**:
- Remove the **\`room_number\`** column from the **\`classes\`** table.
    `,
    setupSql: DDL_SCHEMAS.classesWithRoomNumber,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE classes DROP COLUMN room_number;`,
    checkOrder: false,
    hints: [
      'Remove the room_number attribute from the classes table.'
    ],
    explanation: `
Eliminates static room allocations to support flexible daily schedule assignments.
    `
  },

  {
    id: 'ddl-25',
    moduleId: 'ddl-sec-e',
    moduleTitle: 'Section E: ALTER – DROP COLUMN',
    title: 'Drop years_of_experience Column from teachers',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'DROP COLUMN'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: Experience is now computed dynamically from \`hire_date\`. The static **\`years_of_experience\`** column is redundant.

**Task Requirements**:
- Remove the **\`years_of_experience\`** column from the **\`teachers\`** table.
    `,
    setupSql: `
      CREATE TABLE teachers (
        teacher_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        years_of_experience INTEGER
      );
    `,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE teachers DROP COLUMN years_of_experience;`,
    checkOrder: false,
    hints: [
      'Remove the column from the faculty table.'
    ],
    explanation: `
Removes statically computed columns in favor of dynamic date-based calculations.
    `
  },

  // ==========================================
  // SECTION F: RENAME TABLE
  // ==========================================
  {
    id: 'ddl-26',
    moduleId: 'ddl-sec-f',
    moduleTitle: 'Section F: RENAME TABLE',
    title: 'Rename students to school_students',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'RENAME TO'],
    interviewFrequency: 'Very High',
    description: `
**Scenario**: To prevent table name collisions with newly integrated college departments, prefix all secondary school entities with \`school_\`.

**Task Requirements**:
- Rename the table **\`students\`** to **\`school_students\`**.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE students RENAME TO school_students;`,
    checkOrder: false,
    hints: [
      'Think about how to change the name of an existing table entity in the schema.'
    ],
    explanation: `
\`RENAME TO\` updates the relation reference in the catalog without moving or modifying data rows.
    `
  },

  {
    id: 'ddl-27',
    moduleId: 'ddl-sec-f',
    moduleTitle: 'Section F: RENAME TABLE',
    title: 'Rename teachers to school_teachers',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'RENAME TO'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: Prefix the faculty entity with the institutional domain identifier.

**Task Requirements**:
- Rename the **\`teachers\`** table to **\`school_teachers\`**.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE teachers RENAME TO school_teachers;`,
    checkOrder: false,
    hints: [
      'Rename the table entity to its target name.'
    ],
    explanation: `
Renames the faculty table namespace.
    `
  },

  {
    id: 'ddl-28',
    moduleId: 'ddl-sec-f',
    moduleTitle: 'Section F: RENAME TABLE',
    title: 'Rename classes to school_classes',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'RENAME TO'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: Continue the institutional domain prefix refactoring for classroom divisions.

**Task Requirements**:
- Rename the **\`classes\`** table to **\`school_classes\`**.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE classes RENAME TO school_classes;`,
    checkOrder: false,
    hints: [
      'Rename the classes table to school_classes.'
    ],
    explanation: `
Standardizes table naming for classes.
    `
  },

  {
    id: 'ddl-29',
    moduleId: 'ddl-sec-f',
    moduleTitle: 'Section F: RENAME TABLE',
    title: 'Refactor Entity: school_students to students_info',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'RENAME TO'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: The data architecture team decided that entity tables should end with \`_info\` for clarity in data warehousing pipelines.

**Task Requirements**:
- Rename **\`school_students\`** to **\`students_info\`**.
    `,
    setupSql: DDL_SCHEMAS.schoolTablesBeforeRename,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE school_students RENAME TO students_info;`,
    checkOrder: false,
    hints: [
      'Rename the entity to students_info.'
    ],
    explanation: `
Refactors the entity name to students_info.
    `
  },

  {
    id: 'ddl-30',
    moduleId: 'ddl-sec-f',
    moduleTitle: 'Section F: RENAME TABLE',
    title: 'Refactor Entity: school_teachers to teachers_info',
    difficulty: 'Easy',
    tags: ['ALTER TABLE', 'RENAME TO'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: Match the faculty table naming with the new warehouse naming standard.

**Task Requirements**:
- Rename **\`school_teachers\`** to **\`teachers_info\`**.
    `,
    setupSql: DDL_SCHEMAS.schoolTablesBeforeRename,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `ALTER TABLE school_teachers RENAME TO teachers_info;`,
    checkOrder: false,
    hints: [
      'Rename the entity to teachers_info.'
    ],
    explanation: `
Updates table naming to teachers_info.
    `
  },

  // ==========================================
  // SECTION G: TRUNCATE TABLE
  // ==========================================
  {
    id: 'ddl-31',
    moduleId: 'ddl-sec-g',
    moduleTitle: 'Section G: TRUNCATE TABLE',
    title: 'Purge students_info Table',
    difficulty: 'Easy',
    tags: ['TRUNCATE', 'DELETE', 'DDL vs DML'],
    interviewFrequency: 'Very Common',
    description: `
**Scenario**: At the end of an academic trial cycle, all test student records must be wiped clean so the live semester can begin with fresh admissions. However, the schema structure, columns, and constraints must remain ready for new inserts.

**Task Requirements**:
- Write the standard DDL command to instantly remove all records from **\`students_info\`** while preserving the table schema.
    `,
    setupSql: DDL_SCHEMAS.renamedTables,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DELETE FROM students_info;`,
    checkOrder: false,
    hints: [
      'Consider the operation that wipes all table data in constant time while preserving structure.'
    ],
    explanation: `
\`TRUNCATE TABLE\` is a DDL operation that deallocates entire data storage pages. It is significantly faster than row-by-row \`DELETE\` and automatically resets identity sequences.
    `
  },

  {
    id: 'ddl-32',
    moduleId: 'ddl-sec-g',
    moduleTitle: 'Section G: TRUNCATE TABLE',
    title: 'Reset Faculty Records',
    difficulty: 'Easy',
    tags: ['TRUNCATE TABLE'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: Staging test faculty rows must be wiped before importing the live faculty roster from the HR database.

**Task Requirements**:
- Write a statement to truncate all records from **\`teachers_info\`**.
    `,
    setupSql: DDL_SCHEMAS.renamedTables,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DELETE FROM teachers_info;`,
    checkOrder: false,
    hints: [
      'Think about how to empty a table completely without removing the schema.'
    ],
    explanation: `
Empties faculty records while preserving table columns and constraints.
    `
  },

  {
    id: 'ddl-33',
    moduleId: 'ddl-sec-g',
    moduleTitle: 'Section G: TRUNCATE TABLE',
    title: 'Reset Classroom Allocations',
    difficulty: 'Easy',
    tags: ['TRUNCATE TABLE'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: The new academic semester requires resetting all assigned classroom sections.

**Task Requirements**:
- Write a query to truncate all records from the **\`school_classes\`** table.
    `,
    setupSql: DDL_SCHEMAS.renamedTables,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DELETE FROM school_classes;`,
    checkOrder: false,
    hints: [
      'Wipe all rows while keeping the table definition ready for new entries.'
    ],
    explanation: `
Wipes out all classroom assignment rows.
    `
  },

  {
    id: 'ddl-34',
    moduleId: 'ddl-sec-g',
    moduleTitle: 'Section G: TRUNCATE TABLE',
    title: 'Retruncate students_info Table',
    difficulty: 'Easy',
    tags: ['TRUNCATE TABLE', 'IDEMPOTENCY'],
    interviewFrequency: 'Conceptual',
    description: `
**Scenario**: Database automated deployment pipelines must be idempotent (safe to run multiple times without causing errors or unexpected states).

**Task Requirements**:
- Execute the command to truncate **\`students_info\`** again to verify that truncating an already empty table completes successfully.
    `,
    setupSql: DDL_SCHEMAS.renamedTables,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DELETE FROM students_info;`,
    checkOrder: false,
    hints: [
      'Run the data-clearing statement on the table.'
    ],
    explanation: `
Demonstrates that truncating empty tables safely resets high-water marks and identity seeds.
    `
  },

  {
    id: 'ddl-35',
    moduleId: 'ddl-sec-g',
    moduleTitle: 'Section G: TRUNCATE TABLE',
    title: 'Retruncate teachers_info Table',
    difficulty: 'Easy',
    tags: ['TRUNCATE TABLE'],
    interviewFrequency: 'Conceptual',
    description: `
**Scenario**: Finalize idempotent pipeline scripts for the faculty table.

**Task Requirements**:
- Write the command to truncate **\`teachers_info\`** again.
    `,
    setupSql: DDL_SCHEMAS.renamedTables,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DELETE FROM teachers_info;`,
    checkOrder: false,
    hints: [
      'Use `TRUNCATE TABLE teachers_info;` or `DELETE FROM teachers_info;`.'
    ],
    explanation: `
Confirms consistency in table lifecycle management.
    `
  },

  // ==========================================
  // SECTION H: DROP TABLE
  // ==========================================
  {
    id: 'ddl-36',
    moduleId: 'ddl-sec-h',
    moduleTitle: 'Section H: DROP TABLE',
    title: 'Permanently Erase students_info Table',
    difficulty: 'Easy',
    tags: ['DROP TABLE'],
    interviewFrequency: 'Very Common',
    description: `
**Scenario**: The student admissions service is being retired and replaced by an external cloud provider. The entire **\`students_info\`** relation must be completely removed from the database catalog.

**Task Requirements**:
- Write a DDL statement to permanently drop the **\`students_info\`** table, its schema definition, and all associated indexes.
    `,
    setupSql: DDL_SCHEMAS.renamedTables,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DROP TABLE students_info;`,
    checkOrder: false,
    hints: [
      'Think about how to completely erase a table definition from the schema catalog.'
    ],
    explanation: `
\`DROP TABLE\` removes the table definition, data records, triggers, and secondary indexes permanently from the database data dictionary.
    `
  },

  {
    id: 'ddl-37',
    moduleId: 'ddl-sec-h',
    moduleTitle: 'Section H: DROP TABLE',
    title: 'Permanently Erase teachers_info Table',
    difficulty: 'Easy',
    tags: ['DROP TABLE'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: The faculty table has been consolidated into a global staff directory.

**Task Requirements**:
- Write a DDL query to permanently drop the **\`teachers_info\`** table.
    `,
    setupSql: DDL_SCHEMAS.renamedTables,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DROP TABLE teachers_info;`,
    checkOrder: false,
    hints: [
      'Completely erase the teachers_info table and its structure.'
    ],
    explanation: `
Permanently drops the teachers_info relation.
    `
  },

  {
    id: 'ddl-38',
    moduleId: 'ddl-sec-h',
    moduleTitle: 'Section H: DROP TABLE',
    title: 'Permanently Erase school_classes Table',
    difficulty: 'Easy',
    tags: ['DROP TABLE'],
    interviewFrequency: 'Common',
    description: `
**Scenario**: Clean up the remaining classroom lookup table from the legacy schema.

**Task Requirements**:
- Write a DDL statement to drop the **\`school_classes\`** table.
    `,
    setupSql: DDL_SCHEMAS.renamedTables,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DROP TABLE school_classes;`,
    checkOrder: false,
    hints: [
      'Remove the school_classes table definition from the catalog.'
    ],
    explanation: `
Drops the school_classes relation.
    `
  },

  {
    id: 'ddl-39',
    moduleId: 'ddl-sec-h',
    moduleTitle: 'Section H: DROP TABLE',
    title: 'Safe Drop for classes Table',
    difficulty: 'Easy',
    tags: ['DROP TABLE', 'IF EXISTS'],
    interviewFrequency: 'High (Migration Standard)',
    description: `
**Scenario**: In CI/CD migration scripts, running a naive \`DROP TABLE\` fails if the table was previously dropped. To ensure zero build failures, professional migration scripts use conditional drop statements.

**Task Requirements**:
- Write a DDL query to safely drop the table **\`classes\`** only if it currently exists in the schema.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DROP TABLE IF EXISTS classes;`,
    checkOrder: false,
    hints: [
      'Consider which clause prevents errors if the table does not exist.'
    ],
    explanation: `
\`IF EXISTS\` checks the database catalog first. If the table is missing, the command completes with a notice rather than halting execution with a fatal error.
    `
  },

  {
    id: 'ddl-40',
    moduleId: 'ddl-sec-h',
    moduleTitle: 'Section H: DROP TABLE',
    title: 'Safe Drop for students Table',
    difficulty: 'Easy',
    tags: ['DROP TABLE', 'IF EXISTS'],
    interviewFrequency: 'High',
    description: `
**Scenario**: Apply the safe conditional drop pattern to the student relation.

**Task Requirements**:
- Write a safe DDL query to drop the **\`students\`** table if it exists.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DROP TABLE IF EXISTS students;`,
    checkOrder: false,
    hints: [
      'Use the conditional existence check clause when dropping.'
    ],
    explanation: `
Safely removes the students table without crashing deployment pipelines if already removed.
    `
  },

  // ==========================================
  // SECTION I: DROP DATABASE
  // ==========================================
  {
    id: 'ddl-41',
    moduleId: 'ddl-sec-i',
    moduleTitle: 'Section I: CREATE & DROP DATABASE',
    title: 'Drop school_db Database',
    difficulty: 'Basic',
    tags: ['DROP DATABASE', 'LIFECYCLE'],
    interviewFrequency: 'Core DDL',
    description: `
**Scenario**: The staging school test environment is being decommissioned. You must clean up the entire database catalog to free up server storage.

**Task Requirements**:
- Write the DDL statement to permanently delete the **\`school_db\`** database and all tables contained within it.
    `,
    setupSql: '',
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DROP DATABASE school_db;`,
    checkOrder: false,
    hints: [
      'Think about how to remove an entire database catalog.'
    ],
    explanation: `
\`DROP DATABASE\` deletes all data files, tables, indexes, and catalog metadata associated with the database instance.
    `
  },

  {
    id: 'ddl-42',
    moduleId: 'ddl-sec-i',
    moduleTitle: 'Section I: CREATE & DROP DATABASE',
    title: 'Create Office Database',
    difficulty: 'Basic',
    tags: ['CREATE DATABASE'],
    interviewFrequency: 'Core DDL',
    description: `
**Scenario**: The administration is opening a new administrative regional office.

**Task Requirements**:
- Write a DDL statement to create a new database catalog named **\`office_db\`**.
    `,
    setupSql: '',
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `CREATE DATABASE office_db;`,
    checkOrder: false,
    hints: [
      'Recall how to create a new database catalog.'
    ],
    explanation: `
Allocates a new relational database named office_db.
    `
  },

  {
    id: 'ddl-43',
    moduleId: 'ddl-sec-i',
    moduleTitle: 'Section I: CREATE & DROP DATABASE',
    title: 'Drop Office Database',
    difficulty: 'Basic',
    tags: ['DROP DATABASE'],
    interviewFrequency: 'Core DDL',
    description: `
**Scenario**: The regional office trial has concluded.

**Task Requirements**:
- Write the DDL statement to permanently drop **\`office_db\`**.
    `,
    setupSql: '',
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DROP DATABASE office_db;`,
    checkOrder: false,
    hints: [
      'Remove the specified database from the server.'
    ],
    explanation: `
Removes the office_db database.
    `
  },

  {
    id: 'ddl-44',
    moduleId: 'ddl-sec-i',
    moduleTitle: 'Section I: CREATE & DROP DATABASE',
    title: 'Create Test Database',
    difficulty: 'Basic',
    tags: ['CREATE DATABASE'],
    interviewFrequency: 'Core DDL',
    description: `
**Scenario**: Set up a sandbox database for automated integration and regression unit testing.

**Task Requirements**:
- Write a query to create a testing database named **\`test_db\`**.
    `,
    setupSql: '',
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `CREATE DATABASE test_db;`,
    checkOrder: false,
    hints: [
      'Create the specified database.'
    ],
    explanation: `
Creates test_db for staging and automated unit testing.
    `
  },

  {
    id: 'ddl-45',
    moduleId: 'ddl-sec-i',
    moduleTitle: 'Section I: CREATE & DROP DATABASE',
    title: 'Drop Test Database',
    difficulty: 'Basic',
    tags: ['DROP DATABASE'],
    interviewFrequency: 'Core DDL',
    description: `
**Scenario**: Automated unit tests have passed. Clean up the temporary testing database.

**Task Requirements**:
- Write the statement to permanently drop **\`test_db\`**.
    `,
    setupSql: '',
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DROP DATABASE test_db;`,
    checkOrder: false,
    hints: [
      'Remove the test database.'
    ],
    explanation: `
Cleans up the testing database after test suites complete.
    `
  },

  // ==========================================
  // SECTION J: INTERVIEW / THINKING
  // ==========================================
  {
    id: 'ddl-46',
    moduleId: 'ddl-sec-j',
    moduleTitle: 'Section J: INTERVIEW / THINKING',
    title: 'Delete Only Table Structure But Keep Database',
    difficulty: 'Basic',
    tags: ['INTERVIEW', 'DROP TABLE', 'CONCEPT'],
    interviewFrequency: 'Top Technical Round Question',
    description: `
**Interview Question**: *"In an interview, you are asked: What statement permanently erases a table structure and its data, but leaves the containing database completely intact?"*

**Problem Context**:
Candidates often confuse \`DROP DATABASE\` with \`DROP TABLE\`. If you wish to delete the **\`students\`** table definition from the schema without removing the parent database:

**Task Requirements**:
- Write the exact DDL statement to remove the **\`students\`** table while keeping the database intact.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DROP TABLE students;`,
    checkOrder: false,
    hints: [
      'Differentiate between table deletion and database deletion.'
    ],
    explanation: `
\`DROP TABLE\` removes the relation entry from the catalog dictionary while leaving the database container and all other sibling tables intact.
    `
  },

  {
    id: 'ddl-47',
    moduleId: 'ddl-sec-j',
    moduleTitle: 'Section J: INTERVIEW / THINKING',
    title: 'Delete All Records But Retain Table Structure',
    difficulty: 'Easy',
    tags: ['INTERVIEW', 'TRUNCATE', 'CONCEPT'],
    interviewFrequency: 'Top Technical Round Question',
    description: `
**Interview Question**: *"Which command wipes out every single record in a table, but preserves its schema columns, datatypes, and constraints for future use?"*

**Problem Context**:
A common placement interview trap tests if a candidate knows the distinction between dropping a table vs truncating its contents.

**Task Requirements**:
- Write the DDL statement to clear all records from **\`students\`** while retaining the structure intact.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DELETE FROM students;`,
    checkOrder: false,
    hints: [
      'Differentiate between dropping a table and clearing its data contents.'
    ],
    explanation: `
\`TRUNCATE TABLE\` purges all row entries instantaneously without modifying the table's structural definition in the schema catalog.
    `
  },

  {
    id: 'ddl-48',
    moduleId: 'ddl-sec-j',
    moduleTitle: 'Section J: INTERVIEW / THINKING',
    title: 'Identify Which Is Faster: DELETE vs TRUNCATE',
    difficulty: 'Easy',
    tags: ['INTERVIEW', 'PERFORMANCE', 'TRUNCATE vs DELETE'],
    interviewFrequency: 'Crucial (Asked in 95% of DBMS Interviews)',
    description: `
**Interview Question**: *"Why is TRUNCATE significantly faster than DELETE on large tables with millions of records?"*

**Key Architectural Insights**:
1. **Speed & Mechanism**: \`TRUNCATE\` deallocates entire physical data pages directly in $O(1)$ constant time. \`DELETE\` performs a row-by-row scan ($O(N)$), firing triggers and recording individual rollbacks.
2. **Transaction Logging**: \`DELETE\` writes every row removal to the WAL/transaction log. \`TRUNCATE\` logs only page deallocations.
3. **Identity Resets**: \`TRUNCATE\` resets auto-increment primary key counters back to 1.

**Task Requirements**:
- Demonstrate clearing the **\`students\`** table using the high-performance DDL method.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DELETE FROM students;`,
    checkOrder: false,
    hints: [
      'TRUNCATE is a DDL command that deallocates pages without row-by-row undo logging.'
    ],
    explanation: `
TRUNCATE is faster because it operates on physical disk extents rather than traversing B-Tree rows individually.
    `
  },

  {
    id: 'ddl-49',
    moduleId: 'ddl-sec-j',
    moduleTitle: 'Section J: INTERVIEW / THINKING',
    title: 'Why DDL Commands Cannot Be Rolled Back',
    difficulty: 'Easy',
    tags: ['INTERVIEW', 'AUTO-COMMIT', 'ROLLBACK'],
    interviewFrequency: 'Top Placement Question',
    description: `
**Interview Question**: *"Why can DDL commands generally NOT be rolled back using standard ROLLBACK statements in MySQL/Oracle?"*

**Core Concept: Implicit Auto-Commit**:
In enterprise relational databases, any DDL statement (\`CREATE\`, \`ALTER\`, \`DROP\`, \`TRUNCATE\`) causes the database engine to immediately trigger an **implicit AUTO-COMMIT** before and after execution. This permanently writes changes to the data dictionary.

**Task Requirements**:
- Demonstrate permanently removing the **\`students\`** table using DDL.
    `,
    setupSql: DDL_SCHEMAS.schoolBase,
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DROP TABLE students;`,
    checkOrder: false,
    hints: [
      'Think about which structural command triggers an implicit commit.'
    ],
    explanation: `
DDL commands alter metadata catalogs and trigger automatic transaction commits. Therefore, a subsequent \`ROLLBACK\` cannot restore dropped tables or columns in standard MySQL/Oracle configurations.
    `
  },

  {
    id: 'ddl-50',
    moduleId: 'ddl-sec-j',
    moduleTitle: 'Section J: INTERVIEW / THINKING',
    title: 'Disaster Recovery: Permanently Delete a Database',
    difficulty: 'Easy',
    tags: ['INTERVIEW', 'DROP DATABASE', 'DISASTER RECOVERY'],
    interviewFrequency: 'High',
    description: `
**Interview Question**: *"Which DDL command permanently erases an entire database along with all its tables, constraints, stored procedures, and triggers?"*

**Problem Context**:
A complete database drop is a catastrophic, unrecoverable action without external backups. In enterprise cloud architectures, this requires elevated DBA privileges.

**Task Requirements**:
- Write the command to permanently delete the **\`school_db\`** database.
    `,
    setupSql: '',
    starterSql: `-- Write your SQL statement below\n`,
    expectedSql: `DROP DATABASE school_db;`,
    checkOrder: false,
    hints: [
      'Use `DROP DATABASE school_db;`'
    ],
    explanation: `
\`DROP DATABASE\` deletes all data files and metadata entries associated with the database schema. In production systems, this operation is protected by strict DBA permissions and offsite backups.
    `
  }
];
