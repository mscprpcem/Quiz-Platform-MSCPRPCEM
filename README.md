# 🏆 MSC PRPCEM Quiz & Technical Assessment Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Database: Neon Postgres](https://img.shields.io/badge/Database-Neon%20Serverless%20Postgres-00E599?logo=postgresql&logoColor=white)](https://neon.com)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B%20LTS-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18%2B%20Vite-61dafb.svg)](https://reactjs.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8%2B-010101.svg)](https://socket.io)
[![Status](https://img.shields.io/badge/Security%20Policy-Active-success.svg)](SECURITY.md)

An enterprise-grade, dual-mode real-time testing, event registration, and credentialing ecosystem engineered for the **Microsoft Student Club (MSC PRPCEM)**. Supports high-concurrency synchronized live multiplayer competitions, formal proctored scheduled certifications, public event registration with deadline controls, an email dispatch broadcast hub, and centralized Single Sign-On (SSO / OIDC).

---

## ⚡ Infrastructure Partner & Sponsorship

<div align="center">
  <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; max-width: 820px; width: 100%;">
    <tr>
      <td align="center" style="background: linear-gradient(180deg, #161616 0%, #0d0d0d 100%); border: 1px solid #27272a; border-radius: 16px; padding: 28px 24px; box-shadow: 0 10px 30px rgba(0, 229, 153, 0.08);">
        <a href="https://neon.com" target="_blank" rel="noopener noreferrer">
          <img src="docs/assets/neon-logo.svg" alt="Neon Serverless Postgres" width="360" />
        </a>
        <br /><br />
        <p style="font-size: 16px; color: #ffffff; margin: 4px 0 8px 0; font-weight: 700;">
          Official Database Infrastructure Partner of the MSC Quiz Platform
        </p>
        <p style="font-size: 13px; color: #a1a1aa; max-width: 620px; line-height: 1.6; margin: 0 auto 16px auto;">
          MSC Quiz Platform is proudly sponsored by the <a href="https://neon.com" target="_blank" style="color: #34D59A; font-weight: bold; text-decoration: none;">Neon Open Source Program</a>. Real-time multiplayer quiz room state, sub-50ms question synchronization, automated schema migrations, and instant zero-risk database branching are powered by <strong>Neon Serverless Postgres</strong>.
        </p>
        <div style="margin: 14px 0;">
          <a href="https://neon.com" target="_blank">
            <img src="https://img.shields.io/badge/Neon-Serverless%20Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=white" alt="Neon Database" />
          </a>
          &nbsp;
          <a href="https://neon.com" target="_blank">
            <img src="https://img.shields.io/badge/PgBouncer-Pooled%20Concurrency-orange?style=for-the-badge" alt="PgBouncer" />
          </a>
          &nbsp;
          <a href="docs/neon-guide.md">
            <img src="https://img.shields.io/badge/Deployment%20Guide-Read%20Tutorial-0078D4?style=for-the-badge&logo=gitbook&logoColor=white" alt="Deployment Guide" />
          </a>
        </div>
        <p style="margin: 12px 0 0 0;">
          <a href="docs/neon-guide.md"><strong>📘 Explore the Complete Neon Deployment &amp; Scaling Guide &rarr;</strong></a>
        </p>
      </td>
    </tr>
  </table>
</div>

---

## 🌟 Key Platform Capabilities

### 1. ⚡ Dual-Mode Assessment Engines
- **Mode A: Real-Time Live Quiz (Host-Driven)**: Sub-50ms WebSocket room synchronization. Admins control question releases, countdown timers, instant answer reveals, and dynamic top-podium rankings.
- **Mode B: Scheduled Self-Paced Exam (Candidate-Driven)**: Window-based availability (`valid_from` to `valid_until`), independent timers, auto-save on selection, negative marking, attempt limits, and automated submission upon expiry.

### 2. 📅 Flagship Event Management & Public Registration
- Create, schedule, and configure events with start/end datetimes, registration deadlines, and seat capacity limits.
- Public registration gateway ([`/register/:slug`](file:///c:/Quiz-platform/frontend/src/pages/EventRegister.jsx)) with live countdown timers and instant email confirmations.
- Automatic transition of ended events into the **Completed / Past Events** archive.
- High-performance poster uploads backed by **Azure Blob Storage**.

### 3. 📧 Email Dispatch & Broadcast Hub
- Targeted student email broadcasts filtered by event registrants, quiz participants, or student directory.
- Dynamic placeholder merge-tags (`{name}`, `{college}`, `{quiz_title}`, `{score}`, `{join_code}`, `{status}`).
- Production-ready SMTP transport with responsive Microsoft Fluent HTML email templates.

### 4. 🔑 Centralized SSO & OAuth 2.0 / OpenID Connect Provider
- Seamless Single Sign-On bridge across the MSC community ecosystem.
- Secure authorization code grant flow with cryptographic PKCE verification and `/oauth/userinfo` profile endpoints.

### 5. 🛡️ Client-Side & Server-Side Anti-Cheating Suite
- Enforced fullscreen lockdown with focus-loss and tab-switch violation listeners.
- Randomized question ordering (`shuffle_questions`) and option shuffling (`shuffle_answers`).
- Server-side answer isolation to prevent inspection leakages.

### 6. 📊 Analytics, Leaderboards & Excel Data Pipelines
- Real-time leaderboard calculations weighting speed and accuracy.
- Visualized score distributions, difficulty indexes, and question accuracy metrics.
- Complete `.xlsx` and `.csv` exports for attendance, scores, and question-by-question responses.

---

## 🏗️ Architectural Topology

```
Quiz-platform/
├── backend/
│   ├── src/
│   │   ├── config/               # Database connection (Neon Serverless Postgres / SQLite)
│   │   ├── middleware/           # Strict JWT authentication & rate limiting
│   │   ├── models/               # Sequelize models (User, Quiz, Event, Question, etc.)
│   │   ├── routes/               # Modular Express API endpoints
│   │   │   ├── analytics.js      # Public & Admin statistics
│   │   │   ├── auth.js           # Admin login & verification
│   │   │   ├── branding.js       # Dynamic chapter branding & theme config
│   │   │   ├── emailDispatch.js  # Targeted mass email broadcasting
│   │   │   ├── eventsApi.js      # Flagship event lifecycle & registration
│   │   │   ├── export.js         # Excel / CSV data pipelines
│   │   │   ├── quiz.js           # Synchronized Live Quiz operations
│   │   │   ├── scheduledQuiz.js  # Asynchronous Scheduled Quiz operations
│   │   │   ├── sso.js            # OAuth 2.0 / OIDC identity provider
│   │   │   ├── studentSync.js    # Student authentication, OTPs & certificates
│   │   │   └── userDirectory.js  # Admin user management & directory
│   │   ├── services/             # Azure Blob Storage, Email, Socket.IO, Schema Migration
│   │   └── server.js             # Express app entry & auto-migrations
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Footer, AdminLayout, EventSelector, Modals
│   │   ├── context/              # AuthContext (SSO session) & SocketContext
│   │   ├── pages/                # Client & Admin page views
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminEvents.jsx
│   │   │   ├── AdminEmailDispatch.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── CreateScheduledQuiz.jsx
│   │   │   ├── Documentation.jsx # In-app platform & database docs
│   │   │   ├── EventRegister.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── LiveQuiz.jsx
│   │   │   ├── QuizManagement.jsx
│   │   │   ├── ScheduledQuizDetails.jsx
│   │   │   ├── ScheduledQuizTake.jsx
│   │   │   └── WaitingRoom.jsx
│   │   └── index.css             # Tailwind CSS & Fluent design tokens
│   └── package.json
│
├── docs/
│   ├── assets/
│   │   └── neon-logo.svg         # Official Neon dark-mode logo asset
│   └── neon-guide.md             # Complete Neon deployment & scaling guide
│
├── report.md                     # Comprehensive security audit & remediation scorecard
├── DESIGN.md                     # Full engineering design & architecture specification
└── README.md
```

---

## 🚀 Quickstart & Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Database**: **[Neon Serverless PostgreSQL](https://neon.com)** (Recommended for production & high concurrency; see [📘 Neon Guide](docs/neon-guide.md)) or SQLite (local offline development)
- **Azure Storage** (optional): Connection string for blob poster uploads
- **SMTP Server**: Valid credentials for email OTPs and broadcast notifications

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/mscprpcem/Quiz-platform.git
cd Quiz-platform

# Install root, backend, and frontend dependencies
npm run install-all
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:

```ini
# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
PUBLIC_QUIZ_URL=http://localhost:5173

# Security & Secrets
JWT_SECRET=your_super_secret_jwt_key_2026
SSO_SHARED_SECRET=your_sso_shared_secret_key_2026

# Database (Neon Serverless PostgreSQL - Pooled Connection)
DATABASE_URL=postgresql://user:password@ep-sample-pooler.neon.tech/msc_quiz?sslmode=require
DB_SSL_REJECT_UNAUTHORIZED=true
# (Leave DATABASE_URL blank to automatically fall back to local SQLite)

# Admin Master Credentials
ADMIN_EMAIL=admin@mscprpcem.tech
ADMIN_PASSWORD=YourSecureAdminPasswordHere

# SMTP Email Configuration
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=no-reply@mscprpcem.tech
SMTP_PASS=YourSmtpPasswordHere
EMAIL_FROM="Microsoft Student Club PRPCEM" <no-reply@mscprpcem.tech>

# Azure Blob Storage (Optional)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_CONTAINER_NAME=events
```

> [!TIP]
> Follow the **[Neon Deployment Guide](docs/neon-guide.md)** for a complete walkthrough on obtaining your pooled connection string and setting up instant database branches.

### 3. Launch Development Servers
```bash
# Concurrently start backend (port 5000) and frontend (port 5173)
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📚 Platform Documentation & Guides

- 📘 **[Neon Serverless Postgres Guide](docs/neon-guide.md)**: Full guide to running, branching, and scaling with Neon.
- 📐 **[Design & Architecture Specification](DESIGN.md)**: Comprehensive architectural topology, ERDs, and state diagrams.
- 🔒 **[Security Audit & Remediation Report](report.md)**: 100% verified security audit covering all 19 remediations.

---

## 🔒 Security & Hardening Highlights

- **100% Remediated Scorecard**: All 19 audited vulnerabilities resolved and verified (see [`report.md`](file:///c:/Quiz-platform/report.md)).
- **Role-Based Access Control**: Strict Bearer JWT validation across all admin management routes (`/api/quizzes`, `/api/scheduled-quizzes`, `/api/events`, `/api/admin/users`, `/api/admin/email-dispatch`).
- **Answer Sanitization**: Plaintext `correct_answer` fields are stripped from all public and candidate-facing payloads until post-quiz review.
- **Brute-Force Protection**: Strict rate limiters on auth and OTP endpoints (10 requests/15min).
- **Cryptographic Randomness**: Secure OTPs and session tokens powered by Node.js `crypto.randomInt` and `crypto.randomBytes`.

---

## 📜 License & Copyright

Distributed under the **MIT License**. Engineered with ❤️ by the **Microsoft Student Club PRPCEM Technical Team**. Proudly supported by **[Neon](https://neon.com)**.

