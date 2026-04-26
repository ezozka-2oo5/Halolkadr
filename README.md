# MedHire Transparency

MedHire Transparency is a healthcare recruitment platform focused on making hiring more open, traceable, and fair. The project is built for healthcare institutions and job seekers in Uzbekistan, with a front-end experience for browsing roles and applying, and a back-end API for authentication, vacancies, documents, and complaints.

## Aim

The main goal of the platform is to reduce confusion and unfairness in healthcare hiring by giving applicants and institutions a clearer process.

What the platform aims to do:

- make healthcare vacancies easier to find by category
- simplify the application process for candidates
- support document submission and structured verification
- create a space for complaints and feedback when recruitment is unfair
- improve trust in public and private healthcare hiring

## How The Platform Works

The current platform flow is:

1. A visitor opens the landing page and explores healthcare job categories such as clinical, technical, administrative, and service roles.
2. The visitor selects a category and sees positions related to that section.
3. The applicant opens an application form, fills in personal information, chooses work location preferences, selects education details, and uploads documents.
4. A user can register and log in through the authentication system.
5. Hospital admins can create vacancies through the API.
6. Applicants can submit applications to vacancies.
7. Applicants can open the Document Verification Center, upload identity, diploma, certificate, work experience, license, and recommendation files.
8. The platform runs mock document verification logic, calculates document scores, and records verification history.
9. HR or admin users can review pending or suspicious files and manually approve or reject them.
10. Admins can open the Admin Document Review page to review all uploaded files, add notes, and keep a visible audit trail during the demo.
11. Complaints can be submitted as part of the transparency goal of the system.

## Document Verification Center

The Document Verification Center is a dedicated documentation dashboard for applicants and HR reviewers.

Route:

- `/documents`
- `/admin/documents`

What it does:

- lets applicants upload six required document categories
- tracks verification status for each document
- calculates a score per document and a total document score out of 100
- shows verification history for transparency
- gives admins or HR reviewers a place to approve, reject, or flag suspicious documents
- writes document actions into the audit log chain

## Admin Document Review

The Admin Document Review page is the manual verification dashboard for the hackathon demo.

What it does:

- shows all uploaded applicant documents in one place
- lets admin users filter by applicant, document type, status, and score range
- supports manual actions: verify, reject, mark suspicious, and add review notes
- calculates applicant-level progress, verified counts, and total document scores
- stores review decisions and audit entries in browser localStorage so changes stay visible during the demo session
- demonstrates anti-corruption controls by making every review action visible and traceable

Manual review behavior:

- `Verify` sets the status to `Verified`, applies the full document score, and uses the message `Manually verified by admin`
- `Reject` sets the status to `Rejected`, sets the score to `0`, and requires a rejection reason
- `Mark suspicious` sets the status to `Suspicious`, sets the score to `0`, and requires a suspicious reason
- `Add review note` records extra reviewer context without changing the score

### Supported document categories

- Passport / ID Card
- Diploma
- Qualification Certificate
- Work Experience Document
- Medical License / Professional Permission
- Recommendation Letter

### Mock verification logic

This hackathon prototype does not use a real government verification API yet.

Instead, it uses predefined valid document numbers for each category:

- Passport / ID: `AD1234567`, `AA9876543`
- Diploma: `DP2024001`, `DP2023007`
- Certificate: `CF2024010`, `CF2023025`
- Work experience: `WE2024011`, `WE2023003`
- License: `LC2024099`, `LC2023012`
- Recommendation: `RC2024005`, `RC2023018`

Verification behavior:

- no file uploaded: `Not submitted`, score `0`
- valid number match: `Verified`, full score
- file uploaded but number not in trusted list: `Pending review`, 50% score
- clearly invalid or suspicious number format: `Suspicious`, score `0`
- manually rejected by HR/admin: `Rejected`, score `0`

### Document scoring

Total document score = `100`

- Passport / ID: `15`
- Diploma: `25`
- Qualification Certificate: `20`
- Work Experience Document: `20`
- Medical License / Professional Permission: `15`
- Recommendation Letter: `5`

### Overall candidate scoring

The updated candidate scoring model uses:

- Document score: `40%`
- Professional test score: `30%`
- Work experience: `20%`
- Vacancy match: `10%`

### Anti-corruption value

This module helps reduce corruption by:

- standardizing what every applicant must submit
- making document review visible and trackable
- assigning a clear verification status instead of informal judgment
- recording document actions in the audit log
- separating automatic checks from manual HR review
- making scoring more transparent and explainable

## Current Product Scope

The front end currently includes:

- multilingual interface with English, Uzbek, and Russian
- light and dark theme switching
- landing page with category-based navigation
- category pages and application forms
- document verification dashboard with status badges, score summaries, and admin review tools
- dedicated admin document review page with filters, applicant progress, and local audit logs
- about and feedback pages
- login, register, dashboard, and vacancies screens

The back end currently includes:

- JWT-based login
- user registration
- vacancy listing and vacancy creation for hospital admins
- application submission and score updates
- document upload, verification, scoring, and audit logging
- complaint submission
- SQLite database for local persistence

## Architecture

This repository has two main parts:

- `client/`: React front end
- `server/`: Express API with SQLite

Important backend tables include:

- `users`
- `hospitals`
- `vacancies`
- `applications`
- `documents`
- `complaints`
- `tests`
- `test_results`
- `audit_logs`
- `attendance`

## Tech Stack

Frontend:

- React
- React Router
- Tailwind CSS
- Axios
- i18next / react-i18next

Backend:

- Node.js
- Express
- SQLite
- JWT
- Multer
- bcryptjs

## Local Setup

### 1. Install dependencies

```bash
cd server
npm install
```

```bash
cd client
npm install
```

### 2. Seed the database

```bash
cd server
node seed.js
```

### 3. Start the server

```bash
cd server
node index.js
```

The API runs on `http://localhost:5000`.

### 4. Start the client

```bash
cd client
npm start
```

The web app runs on `http://localhost:3000`.

## Demo Accounts

- `admin@medhire.uz` / `password`
- `hospital@medhire.uz` / `password`

## Notes

- Document verification is currently mock logic.
- Application scoring is currently mock logic.
- The project is structured like a strong prototype / MVP and can be extended into a more complete hiring transparency platform.

## Package Reference

See [requirements.md](./requirements.md) for a package-by-package summary of the libraries used in this project.
