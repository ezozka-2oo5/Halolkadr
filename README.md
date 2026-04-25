# MedHire Transparency

MedHire Transparency is a healthcare recruitment platform focused on making hiring more open, traceable, and fair. The project is built for healthcare institutions and job seekers in Uzbekistan, with a front-end experience for browsing roles and applying, and a back-end API for authentication, vacancies, documents, and complaints.

## Aim

The main goal of the platform is to reduce confusion and unfairness in healthcare hiring by giving applicants and institutions a clearer process.

What the platform aims to do:

- make healthcare vacancies easier to find by category
- simplify the application process for candidates
- support document submission and basic verification
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
7. Documents can be uploaded and stored for review.
8. Complaints can be submitted as part of the transparency goal of the system.

## Current Product Scope

The front end currently includes:

- multilingual interface with English, Uzbek, and Russian
- light and dark theme switching
- landing page with category-based navigation
- category pages and application forms
- about and feedback pages
- login, register, dashboard, and vacancies screens

The back end currently includes:

- JWT-based login
- user registration
- vacancy listing and vacancy creation for hospital admins
- application submission and score updates
- document upload with mock verification
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

See [requirements.md](/c:/Users/COM/Desktop/medhire-transparency/requirements.md) for a package-by-package summary of the libraries used in this project.
