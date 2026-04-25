const db = require('./db');
const bcrypt = require('bcryptjs');

(async () => {
  const hashedPassword = await bcrypt.hash('password', 10);

  db.serialize(() => {
    // Seed hospitals
    db.run(`INSERT OR IGNORE INTO hospitals (name, address, region) VALUES ('Tashkent Central Hospital', 'Tashkent', 'Tashkent')`);
    db.run(`INSERT OR IGNORE INTO hospitals (name, address, region) VALUES ('Samarkand Clinic', 'Samarkand', 'Samarkand')`);

    // Seed users
    db.run(`INSERT OR IGNORE INTO users (full_name, passport_number, phone, email, password_hash, role) VALUES ('Admin', 'AA123456', '123456789', 'admin@medhire.uz', ?, 'admin')`, [hashedPassword]);
    db.run(`INSERT OR IGNORE INTO users (full_name, passport_number, phone, email, password_hash, role, hospital_id) VALUES ('Hospital Admin', 'AA123457', '123456790', 'hospital@medhire.uz', ?, 'hospital_admin', 1)`, [hashedPassword]);

    // Seed vacancies
    db.run(`INSERT OR IGNORE INTO vacancies (hospital_id, position_title, department, salary_min, salary_max, required_education, required_experience, open_positions) VALUES (1, 'Nurse', 'Emergency', 500, 800, 'Bachelor', 2, 5)`);

    console.log('Data seeded');
  });
})();