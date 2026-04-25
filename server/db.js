const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'medhire.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    passport_number TEXT UNIQUE,
    phone TEXT,
    email TEXT UNIQUE,
    date_of_birth TEXT,
    region TEXT,
    district TEXT,
    profile_photo TEXT,
    face_id_verified INTEGER DEFAULT 0,
    role TEXT DEFAULT 'applicant',
    password_hash TEXT,
    hospital_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
  )`);

  // Hospitals table
  db.run(`CREATE TABLE IF NOT EXISTS hospitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    region TEXT,
    admin_id INTEGER,
    transparency_score REAL DEFAULT 0,
    FOREIGN KEY (admin_id) REFERENCES users(id)
  )`);

  // Vacancies table
  db.run(`CREATE TABLE IF NOT EXISTS vacancies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hospital_id INTEGER,
    position_title TEXT,
    department TEXT,
    salary_min REAL,
    salary_max REAL,
    required_education TEXT,
    required_experience INTEGER,
    required_certificates TEXT,
    work_schedule TEXT,
    open_positions INTEGER,
    deadline TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
  )`);

  // Applications table
  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    vacancy_id INTEGER,
    status TEXT DEFAULT 'pending',
    score REAL DEFAULT 0,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (vacancy_id) REFERENCES vacancies(id)
  )`);

  // Documents table
  db.run(`CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    series_number TEXT,
    issue_date TEXT,
    issuing_org TEXT,
    file_path TEXT,
    verified INTEGER DEFAULT 0,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Tests table
  db.run(`CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    position TEXT,
    questions TEXT -- JSON string of questions
  )`);

  // Test results
  db.run(`CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    test_id INTEGER,
    score REAL,
    answers TEXT, -- JSON
    taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (test_id) REFERENCES tests(id)
  )`);

  // Complaints table
  db.run(`CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hospital_id INTEGER,
    vacancy_id INTEGER,
    category TEXT,
    description TEXT,
    evidence_file TEXT,
    anonymous INTEGER DEFAULT 1,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (vacancy_id) REFERENCES vacancies(id)
  )`);

  // Audit logs
  db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    user_id INTEGER,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    prev_hash TEXT,
    current_hash TEXT
  )`);

  // Attendance
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    check_in DATETIME,
    check_out DATETIME,
    verified INTEGER DEFAULT 0
  )`);

  console.log('Database initialized');
});

module.exports = db;