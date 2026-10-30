# MSC Quiz Platform - Version & Release History

Welcome to the official version registry and changelog for the **Microsoft Student Club (MSC) PRPCEM Live Quiz Platform & Technical Event Portal**. This document tracks all architectural milestones, major features, UI redesigns, database migrations, and security enhancements across releases.

---

## Release History Overview

| Version | Release Type | Key Highlights | Status |
| :--- | :--- | :--- | :--- |
| **v1.9.0** | **Minor (Current)** | Dedicated Git & GitHub 34-lesson curriculum, 30-Day Roadmap, Cheat Sheet, first-time tutor guide, responsive media queries, clean leaderboard scoring | **Active Production** |
| **v1.8.5** | Patch | Verification Platform Badge Sys ID integration, Live & Scheduled Quiz credentialing, Admin permission controls ("Issue Now" vs "Save for Later"), real-time attendee sync | Stable |
| **v1.8.4** | Patch | Standard MSC PRPCEM email template, simplified centered header, dynamic content wireframe, rich laptop/mobile preview, admin dispatch formatting toolbar, official link standardization | Stable |
| **v1.8.3** | Patch | Enterprise SQL grading engine, DDL entity & constraint verification, DML post-mutation table state diffing, qrcode bundle integrity | Stable |
| **v1.8.2** | Patch | Viewport-centered portal modals, verification revocation guardrails, event quiz delinking, cascade mail sync, institutional email preview, opaque theme system | Stable |
| **v1.8.1** | Patch | User Directory responsive overhaul, 1-click & bulk verification toggles, profile modal, deferred account creation until OTP verification, admin credential lockdown | Stable |
| **v1.8.0** | Minor | Homepage UX streamlining, single info button, collapsed FAQ default, normalized footer styles, version registry | Stable |
| **v1.7.0** | Minor | Light Theme UI overhaul, responsive FAQ accordion, Top 3 podium styling, scoring rules matrix modal | Stable |
| **v1.6.0** | Minor | Neon Serverless Postgres integration, Open Source Program guide, universal responsive email engine | Stable |
| **v1.5.0** | Minor | Azure Blob Storage asset migration, bidirectional Verification Portal SSO & password sync | Stable |
| **v1.4.0** | Minor | Interactive SQL Practice Lab (66+ challenges), in-browser SQL engine, DDL/DML tracks | Stable |
| **v1.3.0** | Minor | Multi-Quiz cumulative leaderboard, analytics dashboard, Excel ingestion/export engine | Stable |
| **v1.2.0** | Minor | Scheduled assessments, time-window availability, continuous numbering, IST standardization | Stable |
| **v1.1.0** | Minor | Student authentication, OTP email verification, anti-cheat proctoring, fullscreen enforcement | Stable |
| **v1.0.0** | **Major** | Initial launch: real-time Socket.io quiz engine, live lobby, admin question broadcaster | Legacy |

---

## Detailed Changelog

### Version 1.9.0 (Current Release)
*Theme: Dedicated Git & GitHub Interactive Learning Track, 30-Day Roadmap, Cheat Sheet Reference & Responsive Platform Polish*

- **Git & GitHub Learning Platform**:
  - 34-lesson interactive curriculum across 5 tiers with terminal command blocks and commit graph visualizations.
  - First-time student onboarding walkthrough with anchored contextual tooltips.
  - Interactive 30-Day Developer Roadmap (`/courses/git/roadmap`) with week filters and daily progress tracking.
  - Quick-reference Git Command Cheat Sheet (`/courses/git/cheatsheet`) with live search and copyable snippets.
  - Modernized Light Theme Course Hub (`/courses/git`) with streamlined action cards.
- **Enterprise SQL Roadmap**:
  - 30-Day structured SQL curriculum (`30_DAY_SQL_ROADMAP.md`) covering DDL, DML, Joins, Window Functions, and Capstone.
- **UI & System Polish**:
  - Responsive media query optimizations across mobile, tablet, and desktop views for all course pages.
  - Clean leaderboard rankings with descending score sorting and test account filtering.
  - Backend stability fixes and environment optimizations for SQLite/Postgres.

---

### Version 1.8.5
*Theme: Verification Platform Badge Sys ID Integration, Live & Scheduled Quiz Credentialing, Admin Permission Controls & Cryptographic Publishing*

- **Badge Sys ID & Verification Platform Alignment**:
  - Integrated `badge_sys_id` and `badge_issued_at` across both Live Quizzes and Scheduled Quizzes, mapping to the unique badge credential identifier registered on the Verification Platform (`verify.mscprpcem.tech`).
  - Added real-time quick picker allowing admins to select from existing Verification Platform badges or enter a custom `SYS-BADGE-XXXX` identifier.
- **Admin Permission & Decision Controls**:
  - Implemented dual-action admin permission controls:
    - **Save for Later**: Persists the Badge Sys ID and title configuration so credentials remain safe and pending until after event conclusion.
    - **Issue Badges Now**: Allows immediate verification sync and dispatch to all eligible participants scoring above the selectable threshold (All, ≥50%, ≥70%).
- **Unified IssueBadgeModal Component**:
  - Designed interactive viewport portal modal displaying live completion counts, attendee preview cards with email and scores, verification status banners, and safety confirmation checks.
  - Integrated seamlessly into Live Quiz management, Scheduled Quiz cards, and Scheduled Quiz details views.
- **Production Integrity & Runtime Guardrails**:
  - Resolved `ShieldCheck` icon import omission in `QuizManagement.jsx` that triggered the React ErrorBoundary (*"Quiz Session Recovery - ShieldCheck is not defined"*).
  - Fixed anti-cheat proctoring listener in `FullscreenHandler.jsx` by properly referencing `isMobileDevice()` and `isFullscreenAPISupported()`.
  - Hardened option selection fallback in `ScheduledQuizTake.jsx` using `questions[currentQIndex]`.
- **Clean Inputs & Suggestion Elimination**:
  - Removed all suggestions, datalists, preset buttons, and default pre-fills for Venue in Admin Events and for Badge Sys ID across `IssueBadgeModal`, `QuizManagement`, and `CreateScheduledQuiz`.
- **Landing Page Streamlining**:
  - Display latest 6 events only on the public homepage (matching quizzes).
  - Automatically hide the "Join Quiz" button if a quiz has ended or passed its scheduled duration, replacing it with a clean "Closed" status indicator.

### Version 1.8.4
*Theme: Official Standard MSC PRPCEM Email Template Architecture, Simplified Centered Header, Dynamic Content Wireframe, Admin Dispatch Formatting Toolbar & Social Link Standardization*

- **Simplified & Vertically Centered Header**:
  - Removed multi-line text (`MICROSOFT STUDENT CLUB` and `P R P C E M`) from the email header navigation bar across all platform templates.
  - Simplified header brand lockup to the official 44px transparent MSC hexagon logo and bold **`MSC PRPCEM`** (`20px`).
  - Aligned vertically on the exact same center axis with `Be a Force for Good.` on the right across desktop, mobile, and client previews.
- **Standardized Dynamic Content Area**:
  - Engineered the official dynamic content area box matching `media_1790869686492.png`: `1.5px dashed #93c5fd` sky-blue border, `#f8fafc` soft background, `16px` border-radius, clean standalone SVG photo/media outline icon (no inner box), bold `Dynamic Content Area` title, and subtitle `(Event details, certificate, voucher, reminder, updates, etc. will appear here)`.
  - Added rich live sample content mode rendering realistic student challenge invitations with schedule badges, 3-column stats cards, and action CTA buttons.
- **Laptop & Mobile Dual Viewport Preview Tooling**:
  - Engineered standalone interactive preview tool (`email_template_preview.html`) with embedded high-resolution assets.
  - Implemented **💻 Laptop View (740px)** with wide campus & clouds artwork (`email_hero_desktop.png`).
  - Implemented **📱 Mobile View (420px)** with responsive mobile campus artwork (`email_hero_banner.png`).
  - Added instant sub-mode toggle between **✨ Live Sample Content** and **📐 Wireframe (Dynamic Content Area)**.
  - Added **⚡ Live Scenarios** tab supporting OTP verification, quiz reminders, event tickets, and admin broadcasts.
- **Admin Email Dispatch Hub Rich Formatting Toolbar**:
  - Added a dedicated rich formatting toolbar above the message compose textarea in `AdminEmailDispatch.jsx`:
    - **Bold** (`**text**` or selection wrapping)
    - **Italic** (`*text*` or selection wrapping)
    - **Link** (`[Link Title](url)` with intelligent prompt and URL selection detection)
    - **Heading** (`### Section Heading`)
    - **Bullet List** (`• item`)
    - **Numbered List** (`1. item`)
    - **Badge / Code** (`` `badge` ``)
    - **Callout Notice Box** (`> 💡 Note: ...`)
    - **Divider Line** (`---`)
  - Implemented `parseEmailMarkdownToHtml()` for real-time live preview rendering in React and compiled email-safe HTML in `backend/src/routes/emailDispatch.js`.
- **Official Social Media & Link Verification**:
  - Verified and corrected all official social media URLs across all email templates, components, and previews:
    - **LinkedIn**: `https://www.linkedin.com/company/mscprpcem/` (standardized without hyphens)
    - **Instagram**: `https://www.instagram.com/mscprpcem/` (standardized without underscores)
    - **YouTube**: `https://youtube.com/@mscprpcem`
    - **Website**: `https://www.mscprpcem.tech`
  - Regenerated supersampled 64x64 transparent circular social icons (0% gray background artifacts) for the deep navy (`#081630`) footer bar.
- **Universal Platform-Wide Email Standard**:
  - Standardized `renderHtmlWrapper` in `backend/src/services/emailService.js` across all platform dispatch services (`sendOtpEmail`, `sendQuizReminderEmail`, `sendEventRegistrationEmail`, `sendCustomBroadcastEmail`, and `sendTestEmail`).

---

### Version 1.8.3
*Theme: Enterprise SQL Engine Validation: Strict DDL Entity & Constraint Checking, DML Post-Mutation State Diffing & Bundle Integrity*

- **Strict DDL Entity & Target Validation**:
  - Implemented semantic entity target verification in `sqlEngine.js` for all DDL operations (`CREATE DATABASE`, `DROP DATABASE`, `USE`, `CREATE TABLE`, `DROP TABLE`, `TRUNCATE TABLE`, `ALTER TABLE`).
  - Resolved the critical false-positive bug where non-matching database names (e.g., executing `CREATE DATABASE school_dl;` when `school_db` was requested) passed automated grading due to generic `0 rows returned` match.
  - Added targeted error reporting: `Database name mismatch: Expected database name 'school_db', but got 'school_dl'.`
  - Validates `USE` database context switches against required database targets.
- **Table Schema & Constraint Integrity (CREATE & ALTER TABLE)**:
  - Integrated live catalog inspection using SQLite `PRAGMA table_info(tableName)` to compare resulting table schema against canonical models.
  - Verifies presence of all required columns and flags unexpected extra columns.
  - Verifies `PRIMARY KEY` and `NOT NULL` constraint enforcement, preventing incomplete schema submissions from passing.
- **Active Table Existence & Row Count Verification (DROP & TRUNCATE)**:
  - Enforces catalog existence checks on `DROP TABLE` using `sqlite_master`, ensuring the table is genuinely destroyed.
  - Enforces `SELECT COUNT(*) FROM table` on `TRUNCATE TABLE`, guaranteeing the table is completely emptied (0 rows).
- **Comprehensive DML Mutation State Verification (INSERT, UPDATE, DELETE)**:
  - Overhauled validation for all 50 DML challenges: Statements that return zero tabular rows now automatically evaluate underlying table mutations via `SELECT * FROM table ORDER BY 1 ASC;`.
  - Compares full table data state after user execution against canonical expected mutations across both Primary (Case 1) and Edge-Case Boundary (Case 2) datasets.
  - Employs granular row-by-row and column-by-column diff calculation, catching incorrect values, missed rows, and unbounded updates/deletions immediately with visual table diffs in the student console.
- **Dependency & Build Resolution**:
  - Installed missing `qrcode` dependency following git pull and verified production build with zero Rollup/Vite compilation errors.

---

### Version 1.8.2
*Theme: Viewport Modal Portals, Revocation Guardrails, Event Quiz Delinking, Cascade Mail Sync & Unified Institutional Email Preview*

- **Viewport Modal Architecture & Background Scroll Lock**:
  - Migrated all administrative dialogs and modal cards across `AdminUsers.jsx`, `EventSelector.jsx`, `AdminScheduledQuizzes.jsx`, `AdminEmailDispatch.jsx`, and `AdminEvents.jsx` into React body portals (`createPortal(..., document.body)`).
  - Resolved the critical browser viewport jump bug where opening a modal reset `<main>` container scroll position to `0`, ensuring the modal appears perfectly centered in the administrator's active viewport without page jumps.
  - Implemented dual-layer background scroll lock (`document.body.style.overflow = 'hidden'` and `main.style.overflow = 'hidden'`) with touch/wheel event propagation barriers, preventing accidental background page scrolling while inspecting modals.
  - Preserved table scroll position during administrative operations by shifting data refreshes to silent background updates (`fetchUsers(true)`) and restricting table skeleton loaders to initial cold loads.
- **Verification Revocation Guardrails**:
  - Implemented dedicated confirmation modals for revoking verified status on student accounts (`AdminUsers.jsx`), preventing accidental un-verification while keeping fast 1-click verification for pending accounts.
  - Added a multi-user bulk revocation warning modal with item counts and safety confirmations before revoking verification in batches.
- **Event Quiz Delinking & Card De-cluttering**:
  - Moved quiz linkage and delinkage controls from direct event card buttons into the dedicated Event Management modal (`AdminEvents.jsx`), drastically reducing visual clutter on event dashboard cards.
  - Added an interactive Delink Quiz confirmation dialog with warning cues to safely decouple scheduled quizzes from events without accidental data loss.
  - Redesigned and polished all event action modals (Event Creation, Event Management, Link Quiz, Attendee Registrations) with consistent rounded geometry, typography, and backdrop blur.
- **Cascading User & Registration Deletion Mail Synchronization**:
  - Synchronized attendee removals in `eventsApi.js` to cascade-delete associated `QuizAttempt` and `Participant` records on linked quizzes, preventing orphaned participant entries.
  - Synchronized user deletions in `userDirectory.js` (both single and bulk) to cascade across `EventRegistration`, `QuizAttempt`, `Participant`, and `Subscriber` records.
  - Cleaned recipient resolution in `emailDispatch.js` by eliminating the 50-user database fallback and ghost participant injections, ensuring dispatch lists strictly reflect active verified registrations.
- **Unified Institutional Live Email Preview**:
  - Redesigned the Live Email Preview in `AdminEmailDispatch.jsx` to achieve a 1:1 pixel-accurate match with the backend `emailService.js` institutional HTML template.
  - Integrated official MSC branding: deep navy header banner (`#0f172a`), 3px brand blue accent rule, `MICROSOFT STUDENT CLUB • PRPCEM` pill badge, styled CTA button with box shadow and fallback URL, and institutional footer.
  - Added an interactive **Desktop (580px)** vs **Mobile (375px phone)** responsive viewport toggle with device chassis styling.
  - Implemented smart greeting deduplication (avoids prepending `"Hello {name},"` if already present in custom templates) and added realistic email envelope headers (`From`, `To`, `Subject`).
- **100% Solid Opaque Theme Dropdown System**:
  - Replaced semi-transparent and grey-toned theme selector dropdowns with a dedicated `ThemeDropdown.jsx` component.
  - Engineered 100% solid white background (`backgroundColor: '#ffffff'`, `opacity: 1`, `z-[70]`, `shadow-2xl shadow-slate-900/20`), completely eliminating underlying text bleed-through and grey artifacts across all pages.
- **Public Open-Source Sync Sanitization**:
  - Configured `repo-sync.yml` to automatically strip production build and deployment workflows (`.github/workflows/`) when synchronizing code to the public open-source repository (`Quiz-Platform-MSCPRPCEM`).
  - Ensures external community contributors and students receive clean repository code without triggering failing Azure deployments or missing secret alerts.
  - Added repository guardrails to `deploy` job in `main_quiz-api-sea.yml` as defense-in-depth against accidental remote executions.

---

### Version 1.8.1
*Theme: User Directory Overhaul, OTP Verification Guardrails & Admin Credential Lockdown*

- **User Directory Layout & Responsive Geometry**:
  - Structured minimum table width (`min-w-[1050px]`) with horizontal scrolling, completely resolving column clipping where `"Joined Date"` was squeezed to `"JOINI / DATE"` and the `"Actions"` column was hidden offscreen.
  - Formatted the `"Joined Date"` column with clean human-readable date formatting (`MMM DD, YYYY`).
  - Standardized user initials avatar container with gradient badges and text truncation on long student names.
  - Added copy-to-clipboard button with visual checkmark indicator for `@username` handles.
  - Added text truncation and hover tooltips for long college and institution names (`max-w-[190px]`).
- **Interactive Verification Management**:
  - Implemented 1-click Verify/Unverify action button on each row in the table, hitting `PATCH /api/users-directory/:id/verify`.
  - Configured live visual status toggling: Emerald checkmark for Verified accounts, Amber clock for Pending accounts.
  - Implemented `POST /api/users-directory/bulk-verify` allowing batch verification or revocation of selected user IDs.
  - Created a floating bulk action bar with user count indicator and instant bulk Verify, bulk Unverify, and bulk Delete controls.
- **Interactive User Profile Inspector Modal**:
  - Added an `"Eye"` icon on each row to open a dedicated Student Profile modal.
  - Displays user avatar, full name, username handle, Subject ID (`usr_...`), email, college, role, and exact registration timestamp.
  - Provided direct clickable link to the user's public Verification Portal card (`verify.mscprpcem.tech/u/@username`).
  - Integrated in-modal quick controls: Toggle verification status, switch system role (`STUDENT` / `ADMIN`), and trigger account deletion.
- **Enhanced Filters, KPI Cards & Column Sorting**:
  - Transformed the 4 KPI metric cards (Total Users, Verified, Students, Unverified/Pending) into interactive quick filters with active ring border indicators.
  - Enabled multi-column table sorting by Name, Email, Role, Status, and Joined Date with directional sort arrows (`↑` / `↓`).
  - Added instant search input with a clear button (`X`).
  - Added customizable items-per-page selector (10, 20, 50, 100).
  - Integrated auto-dismissing toast alert notifications for all actions.
- **OTP Verification Security Enforcement**:
  - Changed `User.is_verified` model default to `false` in `backend/src/models/User.js` so accounts are never auto-verified upon creation.
  - **Deferred Account Provisioning**: Enforced that no user record is created in the database during Step 1 of registration. User accounts are strictly created only after the 6-digit email OTP is submitted and confirmed.
  - Updated `POST /api/student/verify-otp` to provision pending registrations or mark unverified users as verified upon valid OTP verification.
  - **Login Verification Guard**: Blocked unverified accounts from logging in via `POST /api/student/login` and returned `requireVerification: true`.
  - Frontend `StudentAuth.jsx` seamlessly transitions unverified users attempting login into the OTP verification step.
- **Administrator Credential Lockdown**:
  - Prohibited student registration attempts using administrator email addresses configured in `Admin` table or `ADMIN_EMAIL` environment variable.
  - Prohibited reserved administrator handles (`admin`, `administrator`, `root`, `mscadmin`, `superadmin`, `mod`, `moderator`, `system`, `staff`).
  - Blocked administrator logins through the student auth endpoint and guided administrators to the Admin Portal (`/login`).
  - Prohibited administrator credentials from being provisioned into student directory via SSO exchange or external sync endpoints.
  - Configured dialect-safe search in `backend/src/routes/userDirectory.js` supporting both Neon PostgreSQL (`Op.iLike`) and SQLite (`Op.like`).

---

### Version 1.8.0
*Theme: Homepage UX Polish, Streamlined CTA Navigation & Version Registry*

- **Homepage CTA Cleanups**:
  - Removed the redundant `"All Quizzes"` navigation button from the Recent Quizzes section header to prevent visual clutter and maintain clean hierarchy.
  - Removed the bottom `"View All Quizzes & Courses ({count})"` button on the homepage, allowing users to naturally explore course offerings via the top navigation bar.
- **Information Actions Consolidation**:
  - Eliminated the duplicate circular `(i)` button adjacent to the `"Top Performers"` title.
  - Retained the primary, accessible `"Scoring Matrix & Rules"` button on the right side of the section header to trigger the evaluation matrix modal.
- **FAQ Accordion User Experience**:
  - Configured FAQ accordion items to start in a default-collapsed state (`openFaqs: {}`), ensuring a tidy initial presentation until a user explicitly expands a question.
- **Brand & Footer Harmonization**:
  - Removed outdated promotional text (`"A secure platform for conducting quizzes during club events."`) and the `"Verified Campus Portal"` badge under the footer brand column.
  - Standardized the `"Linktree"` link under the Connect section with regular font weight and muted slate text matching GitHub, LinkedIn, Instagram, and YouTube.
  - Harmonized verification search checkmark badges to unified brand blue tokens.
- **Version Registry Integration**:
  - Created `version.md` to permanently record the release history and feature milestones of the platform.
  - Updated website version indicators across the application and metadata to `Version 1.8.0`.

---

### Version 1.7.0
*Theme: Modern Light Theme Overhaul & Responsive FAQ System*

- **Design System Migration**:
  - Transitioned the entire frontend interface to a clean, modern Light Theme using Tailwind CSS and custom tokens.
  - Implemented subtle gradients (`#F5FAFF` base), glassmorphism cards, and soft ambient drop shadows.
- **Top 3 Medalist Podium**:
  - Introduced podium rank cards for 1st Place (Gold crown, warm amber accents), 2nd Place (Silver slate), and 3rd Place (Bronze orange).
  - Added participant speed indicators (`⏱ {seconds}s`) and fallback contenders to ensure consistent layout.
- **Interactive Scoring Matrix Modal**:
  - Built an informational dialog displaying difficulty weighting (Beginner 1.0x, Intermediate 2.0x, Hard 3.0x).
  - Clarified differences between live synchronous scoring and scheduled time-based evaluation.
  - Detailed the 4-tier tie-breaking hierarchy: Total Score → Accuracy Count → Speed / Time → Fewest Violations.
- **Responsive Multi-Open FAQ Accordion**:
  - Implemented an animated accordion supporting multi-expanded states with desktop dual-column grid.

---

### Version 1.6.0
*Theme: Neon Serverless Postgres Integration & Universal Email Engine*

- **Neon Postgres Architecture**:
  - Integrated Neon serverless PostgreSQL database with dynamic autoscaling, connection pooling, and SSL encryption.
  - Created diagnostic connection tests (`npm run test:neon`) and health monitors.
  - Authored comprehensive Neon Open Source Program guide with Mermaid architecture diagrams.
- **Universal Responsive Email Engine**:
  - Re-architected student email dispatching for OTP verification, quiz invitations, and event registrations.
  - Implemented single-column fluid mobile layouts preventing overflow on Outlook, Gmail, and Apple Mail.

---

### Version 1.5.0
*Theme: Cloud Storage Migration & Verification Platform SSO*

- **Azure Blob Storage Migration**:
  - Migrated database diagrams, curriculum media, problem assets, and club logos to Azure Blob Storage containers.
  - Implemented resilient fallback systems for image loading errors and offline handling.
- **Bidirectional Verification Platform SSO**:
  - Enabled cross-portal Single Sign-On (SSO) and password synchronization between Quiz Platform and the MSC Verification Portal (`verify.mscprpcem.tech`).
  - Added cryptographic verification lookup allowing instant handle (@username) and certificate ID searches.
- **Security Audit & Hardening**:
  - Audited 25 potential security vulnerabilities across JWT handling, rate limiting, and SQL parameterization.

---

### Version 1.4.0
*Theme: Interactive SQL Practice Lab & Engine*

- **In-Browser SQL Execution**:
  - Integrated `sql.js` (WebAssembly SQLite engine) enabling client-side query evaluation without backend roundtrips.
- **SQL Curriculum & Challenges**:
  - Added 66+ practice questions spanning Database Fundamentals, DDL (Data Definition Language), and DML (Data Manipulation Language).
  - Built interactive schema tables, expected output diffs, and query syntax highlighters.
- **Admin Authoring**:
  - Added admin capabilities to author, test, and publish new interactive SQL challenges.

---

### Version 1.3.0
*Theme: Cumulative Leaderboards, Analytics & Reporting*

- **Cumulative Tournament Leaderboards**:
  - Added multi-week score aggregation allowing organizers to evaluate season-long performance.
  - Standardized question scoring to a clean 1-point scale to avoid legacy 10,000-point inflation.
- **Excel Ingestion & Export Engine**:
  - Implemented full Excel (`.xlsx`) report generation for attendee scores, times, and anti-cheat violation counts.
  - Added clean spreadsheet ingestion templates supporting Multiple Choice, True/False, and Multi-Select formats.

---

### Version 1.2.0
*Theme: Scheduled Assessments & Timezone Standardization*

- **Scheduled Quizzes**:
  - Built time-window assessments allowing students to take scheduled tests asynchronously within designated availability windows.
  - Implemented continuous question numbering across multi-part modules.
- **IST Timezone Standardization**:
  - Enforced strict Indian Standard Time (`UTC+05:30`) formatting across all lobbies, clocks, and admin scheduling tools.

---

### Version 1.1.0
*Theme: Student Authentication & Anti-Cheat Proctoring*

- **Student Authentication & Verification**:
  - Added registration flow with email OTP validation and PRPCEM institutional domain checks.
  - Added persistent student profile tracking with XP accumulation.
- **Proctoring & Anti-Cheat Engine**:
  - Enforced mandatory fullscreen mode on desktop and mobile browsers.
  - Tracked tab switching, blur events, and window resizing, logging anti-cheat violations in real-time.

---

### Version 1.0.0
*Theme: Initial Launch*

- **Real-Time Live Quiz Core**:
  - Real-time synchronous multiplayer quiz rooms powered by Node.js, Express, and Socket.io.
  - Host admin control panel with question broadcasting, timers, and instant answer reveals.
  - Live participant lobby, dynamic scoreboards, and instant celebration screens.
