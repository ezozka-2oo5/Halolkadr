const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all vacancies
router.get('/', (req, res) => {
  db.all(
    `SELECT vacancies.*, hospitals.name AS hospital_name, hospitals.region AS hospital_region, hospitals.address AS hospital_address
     FROM vacancies
     LEFT JOIN hospitals ON hospitals.id = vacancies.hospital_id
     WHERE vacancies.status = 'active'`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Create vacancy (hospital admin)
router.post('/', authenticate, authorize(['hospital_admin']), (req, res) => {
  const { position_title, department, salary_min, salary_max, required_education, required_experience, required_certificates, work_schedule, open_positions, deadline } = req.body;
  db.run(`INSERT INTO vacancies (hospital_id, position_title, department, salary_min, salary_max, required_education, required_experience, required_certificates, work_schedule, open_positions, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.hospital_id, position_title, department, salary_min, salary_max, required_education, required_experience, required_certificates, work_schedule, open_positions, deadline],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

module.exports = router;
