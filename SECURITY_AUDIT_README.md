# Comprehensive Security Audit & Vulnerability Assessment Report

**Target Platform:** Microsoft Student Club (MSC) Quiz Platform  
**Audit Scope:** Full Application Codebase (`backend/`, `frontend/`, Authentication, Authorization, APIs, Infrastructure Config)  
**Date of Assessment:** October 2026  
**Auditor:** Automated Deep Vulnerability Assessment & Defensive Analysis  
**Overall Posture:** **CRITICAL RISK** (Immediate Remediation Required)

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Vulnerability Severity Summary & Metrics](#2-vulnerability-severity-summary--metrics)
3. [Deep-Dive Analysis: Admin Endpoint & Role Exposure (Reported Issue)](#3-deep-dive-analysis-admin-endpoint--role-exposure-reported-issue)
4. [Comprehensive Vulnerability Catalog (Scored with CVSS v3.1)](#4-comprehensive-vulnerability-catalog-scored-with-cvss-v31)
   - [SEC-01: Admin Portal Path Disclosure & Role Enumeration Oracle](#sec-01-admin-portal-path-disclosure--role-enumeration-oracle)
   - [SEC-02: Missing Role Verification in Auth Middleware (Systemic BFLA / Privilege Escalation)](#sec-02-missing-role-verification-in-auth-middleware-systemic-bfla--privilege-escalation)
   - [SEC-03: Hardcoded Default Cryptographic Fallback Secrets & Admin Credentials](#sec-03-hardcoded-default-cryptographic-fallback-secrets--admin-credentials)
   - [SEC-04: Remote Admin Account Takeover / Unauthorized Creation via External-Sync](#sec-04-remote-admin-account-takeover--unauthorized-creation-via-external-sync)
   - [SEC-05: Complete Account Takeover via Unauthenticated OAuth 2.0 / SSO Authorization Flow](#sec-05-complete-account-takeover-via-unauthenticated-oauth-20--sso-authorization-flow)
   - [SEC-06: Overly Permissive CORS Policy with Shared Cloud Subdomain Wildcards](#sec-06-overly-permissive-cors-policy-with-shared-cloud-subdomain-wildcards)
   - [SEC-07: Unrestricted Exposure of Live Quiz Correct Answers via API](#sec-07-unrestricted-exposure-of-live-quiz-correct-answers-via-api)
   - [SEC-08: Stored Cross-Site Scripting (XSS) via Unrestricted SVG Image Uploads](#sec-08-stored-cross-site-scripting-xss-via-unrestricted-svg-image-uploads)
   - [SEC-09: OTP Brute-Force Feasibility & Cleartext OTP Storage in Database](#sec-09-otp-brute-force-feasibility--cleartext-otp-storage-in-database)
   - [SEC-10: Personally Identifiable Information (PII) Leaked via Public Leaderboard](#sec-10-personally-identifiable-information-pii-leaked-via-public-leaderboard)
   - [SEC-11: Arbitrary Mass Email Dispatch & Domain Spoofing by Authenticated Students](#sec-11-arbitrary-mass-email-dispatch--domain-spoofing-by-authenticated-students)
   - [SEC-12: Sensitive Data Exposure via GET Query Strings to Webhook Proxy](#sec-12-sensitive-data-exposure-via-get-query-strings-to-webhook-proxy)
5. [Step-by-Step Remediation Plan & Code Patches](#5-step-by-step-remediation-plan--code-patches)
6. [Conclusion & Verification Checklist](#6-conclusion--verification-checklist)

---

## 1. Executive Summary

A comprehensive source code security assessment was performed across the MSC Quiz Platform. The audit uncovered **12 distinct security vulnerabilities**, spanning Critical, High, Medium, and Low severity classifications.

The initial concern raised regarding the error message:
> *"This email belongs to an Administrator. Please use the Administrator Portal (/frogger/login) to sign in."*

was confirmed as a **High-severity Information Disclosure and Account Enumeration vulnerability (SEC-01)**. Further investigation into the authentication and authorization architecture revealed multiple critical-severity issues, including:
- Complete lack of role-based authorization checks in `authMiddleware`, allowing any student account to execute administrative functions (such as promoting any user to admin, deleting quizzes, and downloading user directories).
- Unauthenticated OAuth/SSO login generation permitting account takeover with just an email address.
- Hardcoded fallback secrets and API keys enabling complete token forgery and remote admin password overwrites.
- Direct disclosure of correct answers for all quiz questions through the API.

Immediate defensive remediation is required before this platform handles production student records or high-stakes assessments.

---

## 2. Vulnerability Severity Summary & Metrics

### Severity Breakdown
| Severity | Count | CVSS v3.1 Score Range |
| :--- | :---: | :---: |
| **CRITICAL** | 4 | 9.0 – 9.8 |
| **HIGH** | 4 | 7.0 – 8.9 |
| **MEDIUM** | 3 | 4.0 – 6.9 |
| **LOW** | 1 | 0.1 – 3.9 |
| **TOTAL** | **12** | — |

### Master Vulnerability Table
| ID | Vulnerability Title | Affected File(s) | CWE ID | CVSS v3.1 | Severity |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **SEC-01** | Admin Portal Path & Role Disclosure Oracle | `backend/src/routes/studentSync.js` | CWE-200, CWE-209 | **7.5** | **HIGH** |
| **SEC-02** | Missing Role Checks in Auth Middleware (BFLA) | `backend/src/middleware/auth.js` | CWE-285, CWE-269 | **9.8** | **CRITICAL** |
| **SEC-03** | Hardcoded Fallback JWT Secrets & Admin Credentials | `backend/src/server.js`, `auth.js` | CWE-798, CWE-1188 | **9.8** | **CRITICAL** |
| **SEC-04** | Remote Admin Account Takeover via External-Sync | `backend/src/routes/auth.js` | CWE-287, CWE-306 | **9.8** | **CRITICAL** |
| **SEC-05** | Complete Account Takeover via Unauthenticated OAuth | `backend/src/routes/sso.js` | CWE-287, CWE-384 | **9.8** | **CRITICAL** |
| **SEC-06** | Insecure CORS Matching Shared Azure Subdomains | `backend/src/server.js` | CWE-942 | **8.1** | **HIGH** |
| **SEC-07** | Quiz Correct Answers Exposed via GET Endpoint | `backend/src/routes/quiz.js` | CWE-200 | **7.5** | **HIGH** |
| **SEC-08** | Stored XSS via Unrestricted SVG Uploads | `backend/src/services/azureBlobService.js` | CWE-79, CWE-434 | **8.2** | **HIGH** |
| **SEC-09** | OTP Brute-Force Feasibility & Plaintext OTP Storage | `backend/src/routes/studentSync.js`, `User.js`| CWE-307, CWE-312 | **6.5** | **MEDIUM** |
| **SEC-10** | Student Email Disclosure on Public Leaderboard | `backend/src/routes/analytics.js` | CWE-359 | **5.3** | **MEDIUM** |
| **SEC-11** | Mass Student Email Dispatch by Non-Admin Users | `backend/src/routes/emailDispatch.js` | CWE-862, CWE-918 | **8.6** | **HIGH** |
| **SEC-12** | Sensitive Subscriber Data Transmitted in Query String | `backend/src/services/googleSheetService.js` | CWE-598 | **3.7** | **LOW** |

---

## 3. Deep-Dive Analysis: Admin Endpoint & Role Exposure (Reported Issue)

### Root Cause
In `backend/src/routes/studentSync.js` at line 720:
```javascript
// Disallow admin accounts from student portal
if (await isAdministratorEmail(cleanEmail)) {
  return res.status(403).json({
    error: 'This email belongs to an Administrator. Please use the Administrator Portal (/frogger/login) to sign in.'
  });
}
```

The same pattern is repeated across lines 216, 446, 587, and 871:
- `POST /api/student/send-otp`
- `POST /api/student/register`
- `POST /api/student/forgot-password`
- `POST /api/student/reset-password`

### Security Implications
1. **Defeats Security Through Obscurity:**  
   The application intentionally uses `/frogger/login` as an obfuscated route to hide the administrative portal from standard crawlers and casual visitors. By outputting the literal string `(/frogger/login)` in public error responses, the obfuscation is nullified.
2. **Account Enumeration Oracle:**  
   An unauthenticated threat actor can automate requests with a dictionary of candidate email addresses (e.g. faculty, organizers, college leads). When an email returns `403` with the administrator message, the attacker immediately knows:
   - That account exists.
   - That account holds full platform administrative privileges.
   - The exact endpoint where administrative brute-force or credential stuffing should be directed.

### Immediate Fix
Replace verbose role disclosure with a generic, unified authentication error message:
```javascript
// SECURE: Generic response that does not reveal role, existence, or internal portal URLs
return res.status(401).json({
  error: 'Invalid email address or password. Please verify your credentials and sign in through your designated portal.'
});
```

---

## 4. Comprehensive Vulnerability Catalog (Scored with CVSS v3.1)

---

### SEC-01: Admin Portal Path Disclosure & Role Enumeration Oracle
- **File:** `backend/src/routes/studentSync.js` (Lines 720-724)
- **CWE:** CWE-200 (Exposure of Sensitive Information), CWE-209 (Generation of Error Message Containing Sensitive Information)
- **CVSS v3.1 Vector:** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`
- **CVSS Score:** **7.5 (High)**

#### Vulnerable Code
```javascript
if (await isAdministratorEmail(cleanEmail)) {
  return res.status(403).json({
    error: 'This email belongs to an Administrator. Please use the Administrator Portal (/frogger/login) to sign in.'
  });
}
```

#### Remediation
- Return generic error messages on both student and admin login routes.
- Prevent timing discrepancies and information leakage between existent and non-existent users.
- Use rate limiting per email, not just per IP.

---

### SEC-02: Missing Role Verification in Auth Middleware (Systemic BFLA / Privilege Escalation)
- **File:** `backend/src/middleware/auth.js` (Lines 6-20)
- **CWE:** CWE-285 (Improper Authorization), CWE-269 (Improper Privilege Management)
- **CVSS v3.1 Vector:** `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H`
- **CVSS Score:** **9.8 (Critical)**

#### Description
`authMiddleware` only verifies the cryptographic signature of the Bearer JWT and sets `req.user = decoded; next();`. It **never checks** `req.user.role === 'admin'`.

Because this single middleware is attached to all critical routes across:
- `backend/src/routes/userDirectory.js`
- `backend/src/routes/quiz.js`
- `backend/src/routes/scheduledQuiz.js`
- `backend/src/routes/emailDispatch.js`
- `backend/src/routes/export.js`
- `backend/src/routes/eventsApi.js`

**Any authenticated student** can:
1. Promote themselves or any student to administrator (`PATCH /api/admin/users/:id/role` with `{ "role": "admin" }`).
2. Delete all users or specific users (`DELETE /api/admin/users/:id` or `POST /api/admin/users/bulk-delete`).
3. Download the full database directory of students (`GET /api/admin/users`).
4. Read, modify, and delete live and scheduled quizzes (`POST /api/quizzes`, `DELETE /api/quizzes/:id`).
5. Send broadcast emails to all students (`POST /api/admin/email-dispatch/send`).

#### Vulnerable Code (`backend/src/middleware/auth.js`)
```javascript
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next(); // <--- NEVER VERIFIES req.user.role!
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
```

#### Remediation
Split authentication and role verification into distinct, composable middleware:
```javascript
const requireAuth = (req, res, next) => {
  // Verifies token signature and sets req.user
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: Insufficient privileges.' });
  }
  next();
};

module.exports = { requireAuth, requireAdmin: requireRole('admin') };
```

---

### SEC-03: Hardcoded Default Cryptographic Fallback Secrets & Admin Credentials
- **Files:**
  - `backend/src/middleware/auth.js` (Line 4)
  - `backend/src/routes/auth.js` (Lines 45, 65, 247-257)
  - `backend/src/routes/studentSync.js` (Lines 642, 1079, 1095, 1120-1130)
  - `backend/src/services/socket.js` (Line 8)
  - `backend/src/server.js` (Lines 246-248)
- **CWE:** CWE-798 (Use of Hard-coded Credentials), CWE-1188 (Insecure Default Initialization)
- **CVSS v3.1 Vector:** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`
- **CVSS Score:** **9.8 (Critical)**

#### Description
The codebase contains hardcoded strings as fallbacks whenever `.env` variables are missing or misconfigured:
- `JWT_SECRET = process.env.JWT_SECRET || 'msc_quiz_secret_key_2026'`
- `SSO_SHARED_SECRET = process.env.SSO_SHARED_SECRET || 'msc_prpcem_shared_sso_secret_2026'`
- `API_KEY = process.env.QUIZ_PLATFORM_API_KEY || 'msc_quiz_api_key_2026'`
- `VERIFICATION_API_KEY = 'msc_quiz_verification_secret_key_2026'`
- Default Admin seed: `email: "admin@mscprpcem.tech"`, `password: "Admin@123"`

#### Impact
An attacker possessing or guessing these static default strings can forge valid JWT tokens for any user or administrator ID without interacting with the database.

#### Remediation
Crash on startup if mandatory security secrets are not supplied in the environment. Never provide hardcoded fallback strings for secrets:
```javascript
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET environment variable is missing or insecure.');
  process.exit(1);
}
```

---

### SEC-04: Remote Admin Account Takeover / Unauthorized Creation via External-Sync
- **File:** `backend/src/routes/auth.js` (Lines 243-305) & `backend/src/routes/studentSync.js` (Lines 1117-1172)
- **CWE:** CWE-287 (Improper Authentication), CWE-306 (Missing Authentication for Critical Function)
- **CVSS v3.1 Vector:** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`
- **CVSS Score:** **9.8 (Critical)**

#### Description
The `/api/auth/external-sync` route checks authorization as follows:
```javascript
const isAuthorized = Boolean(
  !expectedKey ||
  providedKey === expectedKey ||
  providedKey === integrationKey ||
  providedKey === verificationKey ||
  providedKey === 'msc_quiz_verification_secret_key_2026' ||
  providedKey === 'msc_quiz_api_key_2026'
);
```

1. If `QUIZ_PLATFORM_API_KEY` is undefined or empty in `.env`, `!expectedKey` is `true`, so **no API key is required at all**.
2. Even with `.env` configured, sending `x-api-key: msc_quiz_verification_secret_key_2026` or `x-api-key: msc_quiz_api_key_2026` always succeeds because those values are hardcoded in the condition.
3. The endpoint updates the target admin's password:
   ```javascript
   if (admin) {
     if (password) admin.password = password; // Sets password immediately!
     await admin.save();
   }
   ```

#### Impact
Any unauthenticated actor on the internet can overwrite the credentials of any administrator account or create new administrators.

#### Remediation
- Remove hardcoded key comparisons.
- Enforce strict, constant-time API key verification using `crypto.timingSafeEqual`.
- Never allow `!expectedKey` to bypass security.

---

### SEC-05: Complete Account Takeover via Unauthenticated OAuth 2.0 / SSO Authorization Flow
- **File:** `backend/src/routes/sso.js` (Lines 41-78)
- **CWE:** CWE-287 (Improper Authentication), CWE-384 (Session Fixation / Improper Session Creation)
- **CVSS v3.1 Vector:** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`
- **CVSS Score:** **9.8 (Critical)**

#### Description
In `GET /oauth/authorize`:
```javascript
const targetEmail = (email || req.query.sso_email || '').toLowerCase().trim();
let user = null;
if (targetEmail) {
  user = await User.findOne({ where: { email: targetEmail } });
}

if (!user) {
  // redirect to login
}

// Generate Authorization Code WITHOUT password or authenticated session!
const { code } = createAuthorizationCode({
  clientId: client_id,
  redirectUri: redirect_uri,
  user,
  ...
});
```

The route issues a signed OAuth 2.0 authorization code directly for any user account merely based on the `email` query parameter, without verifying that the caller owns or authenticated into that account.

#### Impact
An attacker can trigger `/oauth/authorize?client_id=msc-quiz-web&redirect_uri=...&response_type=code&email=victim@prpcem.ac.in`, receive an authorization code for that victim, and exchange it at `/oauth/token` to gain full access to the victim's account.

#### Remediation
The `/oauth/authorize` endpoint must authenticate the active user session (via session cookie or verified JWT token) before generating an authorization code. Never accept identity claims from unauthenticated GET query parameters.

---

### SEC-06: Overly Permissive CORS Policy with Shared Cloud Subdomain Wildcards
- **File:** `backend/src/server.js` (Lines 39-54)
- **CWE:** CWE-942 (Permissive Cross-domain Policy with Untrusted Domains)
- **CVSS v3.1 Vector:** `CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N`
- **CVSS Score:** **8.1 (High)**

#### Description
The CORS configuration contains:
```javascript
const isAllowed =
  allowedOrigins.includes(origin) ||
  allowedOrigins.includes('*') ||
  origin.includes('localhost') ||
  origin.includes('127.0.0.1') ||
  origin.endsWith('.mscprpcem.tech') ||
  origin.endsWith('.azurestaticapps.net') ||
  origin.endsWith('.azurewebsites.net');
```
coupled with `credentials: true`.

#### Impact
Any tenant on Microsoft Azure can register an arbitrary Web App (e.g., `https://attacker-quiz.azurewebsites.net`). Because that origin ends in `.azurewebsites.net`, the backend reflects that origin and sets `Access-Control-Allow-Credentials: true`. The attacker can host a malicious script on Azure to make authenticated cross-origin requests to the API, stealing student tokens and exam data.

#### Remediation
Explicitly whitelist only exact, fully-qualified domain names owned by the organization:
```javascript
const EXACT_ALLOWED_ORIGINS = new Set([
  'https://quiz.mscprpcem.tech',
  'https://www.mscprpcem.tech',
  'https://verify.mscprpcem.tech'
]);
if (process.env.NODE_ENV !== 'production') {
  EXACT_ALLOWED_ORIGINS.add('http://localhost:5173');
  EXACT_ALLOWED_ORIGINS.add('http://localhost:3000');
}
```

---

### SEC-07: Unrestricted Exposure of Live Quiz Correct Answers via API
- **File:** `backend/src/routes/quiz.js` (Lines 352-368)
- **CWE:** CWE-200 (Exposure of Sensitive Information to an Unauthorized Actor)
- **CVSS v3.1 Vector:** `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N`
- **CVSS Score:** **7.5 (High)**

#### Description
When querying `GET /api/quizzes/:id`, the route returns the full Quiz model including questions:
```javascript
router.get('/:id', authMiddleware, async (req, res) => {
  const quiz = await Quiz.findByPk(req.params.id, {
    include: [{ model: Question, as: 'questions' }]
  });
  return res.json(quiz);
});
```
Because `Question` contains `correct_answer: DataTypes.STRING` and `authMiddleware` permits student tokens, any student can fetch this endpoint and view all correct answers before or during an exam.

*(Note: `scheduledQuiz.js` implemented `sanitizeQuizForPublic`, but `quiz.js` did not).*

#### Remediation
- Require admin role on `GET /api/quizzes/:id` for editing.
- For student exam-taking endpoints, explicitly exclude `correct_answer` using Sequelize attributes or projection mapping:
  ```javascript
  attributes: { exclude: ['correct_answer'] }
  ```

---

### SEC-08: Stored Cross-Site Scripting (XSS) via Unrestricted SVG Image Uploads
- **File:** `backend/src/services/azureBlobService.js` (Lines 26-29, 66) & `backend/src/routes/eventsApi.js` (Lines 25-32)
- **CWE:** CWE-79 (Cross-site Scripting - Stored), CWE-434 (Unrestricted Upload of File with Dangerous Type)
- **CVSS v3.1 Vector:** `CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:H/I:L/A:N`
- **CVSS Score:** **8.2 (High)**

#### Description
The poster upload filter permits SVG files (`image/svg+xml`). SVGs are XML documents that can embed inline `<script>` tags, malicious `<foreignObject>` elements, and event handlers.
When served directly from Azure Blob Storage or local `/uploads/events/` with a MIME type of `image/svg+xml`, opening or navigating to the poster URL executes JavaScript in the victim's browser.

#### Impact
An attacker can upload a malicious poster. When an admin or student visits the event page, the script executes, stealing `localStorage.getItem('msc_quiz_token')` and hijacking their session.

#### Remediation
- Disallow SVG uploads for user-submitted media. Only allow raster formats (`image/jpeg`, `image/png`, `image/webp`).
- If SVGs are required, sanitize them with DOMPurify / sanitize-svg on the backend before storage, and serve them with headers:
  `Content-Security-Policy: default-src 'none';` and `Content-Disposition: inline`.

---

### SEC-09: OTP Brute-Force Feasibility & Plaintext OTP Storage in Database
- **Files:** `backend/src/routes/studentSync.js` (Lines 281-350, 436-510), `backend/src/models/User.js` (Lines 46-50)
- **CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts), CWE-312 (Cleartext Storage of Sensitive Information)
- **CVSS v3.1 Vector:** `CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:L/A:N`
- **CVSS Score:** **6.5 (Medium)**

#### Description
1. The OTP is a 6-digit number (100,000 to 999,999) with a 15-minute expiration window.
2. In `verify-otp` and `reset-password`, failed verification attempts do not increment a failure counter or invalidate the OTP after 3–5 incorrect guesses.
3. In `User.js`, the OTP is stored in plaintext in the database (`otp: DataTypes.STRING`).

#### Remediation
- Invalidate the OTP after 5 consecutive incorrect attempts.
- Shorten OTP validity to 5 minutes.
- Hash OTPs in the database (e.g. SHA-256) instead of storing plaintext.

---

### SEC-10: Personally Identifiable Information (PII) Leaked via Public Leaderboard
- **File:** `backend/src/routes/analytics.js` (Lines 13-180)
- **CWE:** CWE-359 (Exposure of Private Personal Information to an Unauthorized Actor)
- **CVSS v3.1 Vector:** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N`
- **CVSS Score:** **5.3 (Medium)**

#### Description
The unauthenticated public leaderboard endpoint (`GET /api/analytics/public/leaderboard`) aggregates results and returns the entire object `{ ...u, accuracy, xp }`, where `u` contains `email: email`.

#### Impact
Unauthenticated scrapers can collect hundreds of valid student email addresses, their colleges, and performance metrics, creating targeted phishing and spam lists.

#### Remediation
Sanitize the public leaderboard response to only include public display properties:
```javascript
return {
  id: u.id,
  name: u.name,
  college: u.college,
  score: u.score,
  accuracy,
  xp,
  rank: index + 1
  // Explicitly omit u.email!
};
```

---

### SEC-11: Arbitrary Mass Email Dispatch & Domain Spoofing by Authenticated Students
- **File:** `backend/src/routes/emailDispatch.js` (Lines 667-720)
- **CWE:** CWE-862 (Missing Authorization), CWE-918 (Server-Side Email Abuse)
- **CVSS v3.1 Vector:** `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:N/I:H/A:N`
- **CVSS Score:** **8.6 (High)**

#### Description
The email dispatch route uses generic `authMiddleware`. Any registered student can send arbitrary email messages to any email or to all registered students under the institutional domain identity (`no-reply@mscprpcem.tech`).

#### Remediation
Restructure the route to strictly require verified `admin` role authorization.

---

### SEC-12: Sensitive Data Exposure via GET Query Strings to Webhook Proxy
- **File:** `backend/src/services/googleSheetService.js` (Lines 54-77)
- **CWE:** CWE-598 (Use of GET Request Method With Sensitive Query Strings)
- **CVSS v3.1 Vector:** `CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N`
- **CVSS Score:** **3.7 (Low)**

#### Description
When the POST sync to Google Apps Script fails, the fallback transmits subscriber emails and IP addresses formatted as URL query parameters in a GET request.
URL query parameters are logged in intermediate proxy logs, CDN logs, browser histories, and referer headers.

#### Remediation
Avoid fallback to GET query strings for sensitive personal data. If Google Apps Script redirects require handling, handle HTTP 302 redirects properly on POST or use a secure queue.

---

## 5. Step-by-Step Remediation Plan & Code Patches

### Phase 1: Immediate Critical Fixes (Execute Within 24 Hours)

#### Patch 1: Implement Strict Role-Based Middleware (`backend/src/middleware/auth.js`)
```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is missing.');
  process.exit(1);
}

// 1. Verify Authentication
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};

// 2. Verify Role Privileges
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
};

module.exports = {
  authMiddleware,
  requireAdmin
};
```

#### Patch 2: Remediate Admin Disclosure (`backend/src/routes/studentSync.js`)
Replace lines 720-724:
```javascript
// BEFORE (VULNERABLE):
// if (await isAdministratorEmail(cleanEmail)) {
//   return res.status(403).json({
//     error: 'This email belongs to an Administrator. Please use the Administrator Portal (/frogger/login) to sign in.'
//   });
// }

// AFTER (SECURE):
if (await isAdministratorEmail(cleanEmail)) {
  // Return generic error indistinguishable from standard invalid credentials
  return res.status(401).json({
    error: 'Invalid email address or password. Please verify your credentials and try again.'
  });
}
```

#### Patch 3: Secure `/api/auth/external-sync` (`backend/src/routes/auth.js`)
```javascript
const crypto = require('crypto');

router.post('/external-sync', async (req, res) => {
  try {
    const providedKey = req.headers['x-api-key'] || req.body.apiKey;
    const expectedKey = process.env.QUIZ_PLATFORM_API_KEY;

    // Fail closed: Must have expectedKey defined
    if (!expectedKey || !providedKey) {
      return res.status(401).json({ error: 'Unauthorized: Invalid API key.' });
    }

    const providedBuffer = Buffer.from(providedKey);
    const expectedBuffer = Buffer.from(expectedKey);

    if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
      return res.status(401).json({ error: 'Unauthorized: Invalid API key.' });
    }

    // Proceed with authorized sync logic...
```

#### Patch 4: Enforce Authentication on OAuth Authorize (`backend/src/routes/sso.js`)
```javascript
// GET /oauth/authorize MUST require an authenticated session
router.get('/authorize', authMiddleware, async (req, res) => {
  // Use verified user from token/session (req.user), NEVER unauthenticated query parameters
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(401).json({ error: 'Session invalid' });
  }
  // Proceed with authorization code generation for authenticated user...
});
```

---

### Phase 2: High-Priority Improvements (Execute Within 3–5 Days)

1. **Lock Down CORS Origins:**
   Replace domain wildcards with strict origin whitelisting in `backend/src/server.js`.
2. **Sanitize Quiz Question Endpoints:**
   Ensure `correct_answer` is never delivered to students in `backend/src/routes/quiz.js`.
3. **Restrict Upload Formats:**
   Disallow SVG files in `backend/src/services/azureBlobService.js` and `backend/src/routes/eventsApi.js`.
4. **Attach `requireAdmin` to Administrative Routes:**
   - User directory management (`userDirectory.js`)
   - Email dispatch broadcasts (`emailDispatch.js`)
   - Quiz creation and deletion (`quiz.js`, `scheduledQuiz.js`)
   - Result exports (`export.js`)
   - Subscriber downloads (`subscribers.js`)

---

### Phase 3: Architecture & Defense-in-Depth (Execute Within 2 Weeks)

1. **Secure Secret Management:**
   Migrate secrets to Azure Key Vault or environment secret injection in production.
2. **OTP Hardening:**
   Implement failed attempt counters (lock after 5 tries) and SHA-256 hash storage.
3. **Strip PII from Public Leaderboards:**
   Ensure no student email addresses are returned in public endpoints.
4. **Token Storage Hardening:**
   Consider migrating web authentication tokens from `localStorage` to `HttpOnly; Secure; SameSite=Strict` cookies to mitigate XSS impact.

---

## 6. Conclusion & Verification Checklist

| Remediation Item | Target Component | Status | Verified By |
| :--- | :--- | :---: | :---: |
| Remove `/frogger/login` & admin disclosure (SEC-01) | [`studentSync.js`](file:///d:/Quiz-platform/backend/src/routes/studentSync.js) | ✅ **FIXED** | Code Review & Syntax Check |
| Implement `requireAdmin` middleware (SEC-02) | [`middleware/auth.js`](file:///d:/Quiz-platform/backend/src/middleware/auth.js) | ✅ **FIXED** | Code Review & Syntax Check |
| Enforce `requireAdmin` on all admin endpoints (SEC-02) | [`userDirectory.js`](file:///d:/Quiz-platform/backend/src/routes/userDirectory.js), [`emailDispatch.js`](file:///d:/Quiz-platform/backend/src/routes/emailDispatch.js), [`quiz.js`](file:///d:/Quiz-platform/backend/src/routes/quiz.js), [`scheduledQuiz.js`](file:///d:/Quiz-platform/backend/src/routes/scheduledQuiz.js), [`export.js`](file:///d:/Quiz-platform/backend/src/routes/export.js), [`eventsApi.js`](file:///d:/Quiz-platform/backend/src/routes/eventsApi.js), [`subscribers.js`](file:///d:/Quiz-platform/backend/src/routes/subscribers.js) | ✅ **FIXED** | Code Review & Syntax Check |
| Randomize seed admin password in production (SEC-03) | [`server.js`](file:///d:/Quiz-platform/backend/src/server.js) | ✅ **FIXED** | Code Review & Syntax Check |
| Secure `/external-sync` fail-closed constant-time key check (SEC-04) | [`auth.js`](file:///d:/Quiz-platform/backend/src/routes/auth.js), [`studentSync.js`](file:///d:/Quiz-platform/backend/src/routes/studentSync.js) | ✅ **FIXED** | Code Review & Syntax Check |
| Require verified session token on `/oauth/authorize` (SEC-05) | [`sso.js`](file:///d:/Quiz-platform/backend/src/routes/sso.js) | ✅ **FIXED** | Code Review & Syntax Check |
| Restrict CORS to exact domains and eliminate wildcards (SEC-06) | [`server.js`](file:///d:/Quiz-platform/backend/src/server.js) | ✅ **FIXED** | Code Review & Syntax Check |
| Strip `correct_answer` from student quiz details API (SEC-07) | [`quiz.js`](file:///d:/Quiz-platform/backend/src/routes/quiz.js) | ✅ **FIXED** | Code Review & Syntax Check |
| Prohibit SVG poster uploads to prevent stored XSS (SEC-08) | [`azureBlobService.js`](file:///d:/Quiz-platform/backend/src/services/azureBlobService.js), [`eventsApi.js`](file:///d:/Quiz-platform/backend/src/routes/eventsApi.js) | ✅ **FIXED** | Code Review & Syntax Check |
| Add 5-attempt OTP lockout counter (SEC-09) | [`studentSync.js`](file:///d:/Quiz-platform/backend/src/routes/studentSync.js) | ✅ **FIXED** | Code Review & Syntax Check |
| Strip student email addresses from public leaderboard (SEC-10) | [`analytics.js`](file:///d:/Quiz-platform/backend/src/routes/analytics.js) | ✅ **FIXED** | Code Review & Syntax Check |
| Enforce admin role on mass email broadcast (SEC-11) | [`emailDispatch.js`](file:///d:/Quiz-platform/backend/src/routes/emailDispatch.js) | ✅ **FIXED** | Code Review & Syntax Check |
| Replace GET query parameter PII with POST fallback (SEC-12) | [`googleSheetService.js`](file:///d:/Quiz-platform/backend/src/services/googleSheetService.js) | ✅ **FIXED** | Code Review & Syntax Check |

*Report generated following standard NIST SP 800-115 technical security testing methodologies and OWASP Top 10 2021 / API Security Top 10 standards.*
