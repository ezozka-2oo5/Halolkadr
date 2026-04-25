# Package Requirements

This file explains what packages are used in the project and why they are included.

## Frontend Packages

Source: [client/package.json](/c:/Users/COM/Desktop/medhire-transparency/client/package.json)

### Main dependencies

- `react`: core UI library for building the web interface
- `react-dom`: renders React components into the browser DOM
- `react-router-dom`: page routing for navigation between landing, login, vacancies, positions, and application pages
- `axios`: HTTP client used to connect the React app to the backend API
- `i18next`: translation engine for multilingual support
- `react-i18next`: React integration for `i18next`
- `react-scripts`: Create React App tooling for development and production builds
- `web-vitals`: basic performance measurement support
- `@tailwindcss/postcss`: Tailwind CSS integration with PostCSS

### Testing packages

- `@testing-library/react`: React component testing utilities
- `@testing-library/dom`: DOM testing helpers
- `@testing-library/jest-dom`: custom Jest matchers for DOM assertions
- `@testing-library/user-event`: simulates user interaction in tests

### Frontend dev dependencies

- `tailwindcss`: utility-first CSS framework used for styling
- `postcss`: CSS transformation pipeline used by Tailwind
- `autoprefixer`: adds vendor prefixes for browser compatibility

## Backend Packages

Source: [server/package.json](/c:/Users/COM/Desktop/medhire-transparency/server/package.json)

### Main dependencies

- `express`: backend web framework for API routes
- `cors`: allows the front end and back end to communicate across origins during development
- `sqlite3`: embedded database used for local storage and prototyping
- `jsonwebtoken`: creates and verifies JWT tokens for authentication
- `bcryptjs`: hashes passwords and verifies login credentials
- `multer`: handles file uploads for documents and complaint evidence
- `body-parser`: request body parsing support
- `uuid`: unique ID generation utility, available for future record/file naming needs

## Package Groups By Purpose

### UI and navigation

- `react`
- `react-dom`
- `react-router-dom`
- `tailwindcss`

### API communication

- `axios`
- `cors`
- `express`

### Authentication and security

- `bcryptjs`
- `jsonwebtoken`

### Data storage

- `sqlite3`

### File handling

- `multer`
- `uuid`

### Internationalization

- `i18next`
- `react-i18next`

### Testing

- `@testing-library/react`
- `@testing-library/dom`
- `@testing-library/jest-dom`
- `@testing-library/user-event`

## Summary

The platform uses a modern JavaScript stack:

- React for the client interface
- Express for the API
- SQLite for local data storage
- Tailwind CSS for styling
- JWT and bcryptjs for authentication
- Multer for uploads

This stack is well suited for a student project, prototype, or MVP that aims to demonstrate transparent healthcare recruitment workflows.
