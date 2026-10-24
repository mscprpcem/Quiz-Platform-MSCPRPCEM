# Security Policy & Vulnerability Guidelines

## Overview
The **Microsoft Student Club (MSC PRPCEM) Live Quiz Platform & Technical Event Portal** implements strict defense-in-depth security standards:
- **Zero Raw Shell Execution**: Virtualized in-browser sandboxes for technical practice labs (SQL & Git).
- **Proctored Assessment Guardrails**: Fullscreen enforcement, anti-cheat tab-switch tracking, and server-side timer verification.
- **Access Control & RBAC**: Strict JWT validation and administrative endpoint isolation (`/frogger/login`).
- **Data Protection & Cryptographic Hashing**: Sensitive credentials and authentication tokens hashed with industry-standard bcrypt and SHA-256 signatures.

---

## Supported Versions

| Version | Supported          | Status |
| :--- | :---: | :--- |
| 1.9.x | :white_check_mark: | Active Production |
| 1.8.x | :white_check_mark: | Maintained |
| < 1.8.0 | :x: | Deprecated |

---

## Reporting a Vulnerability

If you discover a security vulnerability within this platform:
1. **Do not open a public issue.**
2. Send an email to the platform security team at **security@mscprpcem.tech** or contact the platform maintainers directly.
3. Include detailed steps to reproduce, affected endpoints, and impact assessment.
4. The team will acknowledge receipt within 48 hours and work on a coordinated fix.
