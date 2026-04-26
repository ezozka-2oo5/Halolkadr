const db = require('../db');

const getDocumentScore = (userId) =>
  new Promise((resolve, reject) => {
    db.all(`SELECT score FROM documents WHERE user_id = ?`, [userId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const total = rows.reduce((sum, item) => sum + (item.score || 0), 0);
      resolve(Math.min(100, total));
    });
  });

const getWorkExperienceScore = (userId) =>
  new Promise((resolve, reject) => {
    db.get(
      `SELECT total_years_experience AS totalYears FROM documents
       WHERE user_id = ? AND document_type = 'work_experience'
       ORDER BY updated_at DESC, id DESC LIMIT 1`,
      [userId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        const years = Number(row?.totalYears || 0);
        resolve(Math.min(100, years * 20));
      }
    );
  });

const getProfessionalTestScore = (userId) =>
  new Promise((resolve, reject) => {
    db.get(
      `SELECT score FROM test_results WHERE user_id = ? ORDER BY taken_at DESC, id DESC LIMIT 1`,
      [userId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(Number(row?.score || 0));
      }
    );
  });

const getVacancyMatchScore = (vacancyId) =>
  new Promise((resolve, reject) => {
    db.get(
      `SELECT required_experience, required_certificates FROM vacancies WHERE id = ?`,
      [vacancyId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(0);
          return;
        }

        let score = 60;
        if (row.required_experience && Number(row.required_experience) >= 3) {
          score += 20;
        }
        if (row.required_certificates) {
          score += 20;
        }
        resolve(Math.min(100, score));
      }
    );
  });

const calculateOverallCandidateScore = async ({ userId, vacancyId }) => {
  const [documentScore, professionalTestScore, workExperienceScore, vacancyMatchScore] =
    await Promise.all([
      getDocumentScore(userId),
      getProfessionalTestScore(userId),
      getWorkExperienceScore(userId),
      getVacancyMatchScore(vacancyId),
    ]);

  const overallScore =
    documentScore * 0.4 +
    professionalTestScore * 0.3 +
    workExperienceScore * 0.2 +
    vacancyMatchScore * 0.1;

  return {
    overallScore: Math.round(overallScore),
    breakdown: {
      documentScore,
      professionalTestScore,
      workExperienceScore,
      vacancyMatchScore,
    },
  };
};

module.exports = {
  calculateOverallCandidateScore,
};
