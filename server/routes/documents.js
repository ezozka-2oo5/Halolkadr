const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { DOCUMENT_DEFINITIONS, DOCUMENT_TYPE_MAP } = require('../services/documentRules');
const { verifyDocument, normalizeSeries } = require('../services/documentVerification');
const { calculateOverallCandidateScore } = require('../services/candidateScore');
const { logAudit } = require('../services/auditLog');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeType = (req.body.documentType || 'document').replace(/[^a-z0-9_-]/gi, '-');
    cb(null, `${safeType}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

const runAsync = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });

const getAsync = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });

const allAsync = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });

const mapDocumentRow = (row) => ({
  id: row.id,
  userId: row.user_id,
  documentType: row.document_type || row.type,
  seriesNumber: row.series_number || '',
  title: row.title || row.name || '',
  name: row.name || '',
  issuingOrganization: row.issuing_organization || row.issuing_org || '',
  issueDate: row.issue_date || '',
  expiryDate: row.expiry_date || '',
  fileUrl: row.file_url || (row.file_name ? `/uploads/${row.file_name}` : null),
  fileName: row.file_name || (row.file_path ? path.basename(row.file_path) : null),
  verificationStatus: row.verification_status || (row.verified ? 'Verified' : 'Not submitted'),
  verificationMessage: row.verification_message || '',
  score: row.score || 0,
  dateOfBirth: row.date_of_birth || '',
  pinfl: row.pinfl || '',
  educationalInstitution: row.educational_institution || '',
  specialty: row.specialty || '',
  graduationYear: row.graduation_year || '',
  courseName: row.course_name || '',
  organizationName: row.organization_name || '',
  position: row.position || '',
  startYear: row.start_year || '',
  endYear: row.end_year || '',
  totalYearsOfExperience: row.total_years_experience || 0,
  issuingAuthority: row.issuing_authority || '',
  recommenderName: row.recommender_name || '',
  recommenderOrganization: row.recommender_organization || '',
  recommenderPosition: row.recommender_position || '',
  createdAt: row.created_at || row.uploaded_at || '',
  updatedAt: row.updated_at || row.uploaded_at || '',
});

const buildScoreSummary = (documents) => {
  const totalScore = Math.min(100, documents.reduce((sum, doc) => sum + (doc.score || 0), 0));
  const verifiedCount = documents.filter((doc) => doc.verificationStatus === 'Verified').length;
  const pendingCount = documents.filter((doc) => doc.verificationStatus === 'Pending review').length;
  const blockedCount = documents.filter((doc) =>
    ['Rejected', 'Suspicious'].includes(doc.verificationStatus)
  ).length;
  const submittedCount = documents.filter((doc) => doc.fileName).length;
  const progress = Math.round((submittedCount / DOCUMENT_DEFINITIONS.length) * 100);

  return {
    totalScore,
    progress,
    verifiedCount,
    pendingCount,
    blockedCount,
    submittedCount,
    totalRequiredDocuments: DOCUMENT_DEFINITIONS.length,
  };
};

const canAccessUserDocuments = (requestUser, targetUserId) =>
  Number(requestUser.id) === Number(targetUserId) ||
  ['admin', 'hospital_admin', 'super_admin'].includes(requestUser.role);

router.get('/admin/list', authenticate, authorize(['admin', 'hospital_admin']), async (req, res) => {
  try {
    const params = [];
    let query = `
      SELECT d.*, u.full_name, u.email
      FROM documents d
      LEFT JOIN users u ON u.id = d.user_id
    `;

    if (req.query.status) {
      query += ` WHERE d.verification_status = ?`;
      params.push(req.query.status);
    }

    query += ` ORDER BY d.updated_at DESC, d.id DESC`;
    const rows = await allAsync(query, params);
    res.json(rows.map((row) => ({ ...mapDocumentRow(row), applicantName: row.full_name, applicantEmail: row.email })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/score/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!canAccessUserDocuments(req.user, userId)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const rows = await allAsync(
      `SELECT * FROM documents WHERE user_id = ? ORDER BY updated_at DESC, id DESC`,
      [userId]
    );
    const documents = rows.map(mapDocumentRow);
    res.json(buildScoreSummary(documents));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!canAccessUserDocuments(req.user, userId)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const rows = await allAsync(
      `SELECT * FROM documents WHERE user_id = ? ORDER BY updated_at DESC, id DESC`,
      [userId]
    );
    const documents = rows.map(mapDocumentRow);
    res.json({
      documents,
      summary: buildScoreSummary(documents),
      history: documents.map((doc) => ({
        documentType: doc.documentType,
        seriesNumber: doc.seriesNumber,
        status: doc.verificationStatus,
        score: doc.score,
        verificationDate: doc.updatedAt,
        message: doc.verificationMessage,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    const {
      userId,
      documentType,
      seriesNumber,
      title,
      name,
      issuingOrganization,
      issueDate,
      expiryDate,
      dateOfBirth,
      pinfl,
      educationalInstitution,
      specialty,
      graduationYear,
      courseName,
      organizationName,
      position,
      startYear,
      endYear,
      totalYearsOfExperience,
      issuingAuthority,
      recommenderName,
      recommenderOrganization,
      recommenderPosition,
    } = req.body;

    const targetUserId = Number(userId || req.user.id);
    if (!canAccessUserDocuments(req.user, targetUserId)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (!DOCUMENT_TYPE_MAP[documentType]) {
      res.status(400).json({ error: 'Unknown document type' });
      return;
    }

    const existingDocument = await getAsync(
      `SELECT * FROM documents WHERE user_id = ? AND document_type = ? ORDER BY id DESC LIMIT 1`,
      [targetUserId, documentType]
    );

    const uploadedFileName = req.file ? req.file.filename : existingDocument?.file_name || null;
    const uploadedFileUrl = uploadedFileName ? `/uploads/${uploadedFileName}` : null;

    const verification = verifyDocument({
      documentType,
      seriesNumber,
      fileName: uploadedFileName,
    });

    const payload = [
      targetUserId,
      documentType,
      normalizeSeries(seriesNumber),
      title || DOCUMENT_TYPE_MAP[documentType].label,
      name || title || DOCUMENT_TYPE_MAP[documentType].label,
      issuingOrganization || '',
      issueDate || '',
      expiryDate || '',
      dateOfBirth || '',
      pinfl || '',
      educationalInstitution || '',
      specialty || '',
      graduationYear || '',
      courseName || '',
      organizationName || '',
      position || '',
      startYear || '',
      endYear || '',
      Number(totalYearsOfExperience || 0),
      issuingAuthority || '',
      recommenderName || '',
      recommenderOrganization || '',
      recommenderPosition || '',
      uploadedFileUrl,
      uploadedFileName,
      verification.verificationStatus,
      verification.verificationMessage,
      verification.score,
      verification.verificationStatus === 'Verified' ? 1 : 0,
      new Date().toISOString(),
    ];

    let documentId = existingDocument?.id;

    if (existingDocument) {
      await runAsync(
        `UPDATE documents
         SET user_id = ?, document_type = ?, series_number = ?, title = ?, name = ?,
             issuing_organization = ?, issue_date = ?, expiry_date = ?, date_of_birth = ?, pinfl = ?,
             educational_institution = ?, specialty = ?, graduation_year = ?, course_name = ?,
             organization_name = ?, position = ?, start_year = ?, end_year = ?, total_years_experience = ?,
             issuing_authority = ?, recommender_name = ?, recommender_organization = ?, recommender_position = ?,
             file_url = ?, file_name = ?, verification_status = ?, verification_message = ?, score = ?,
             verified = ?, updated_at = ?
         WHERE id = ?`,
        [...payload, documentId]
      );
    } else {
      const result = await runAsync(
        `INSERT INTO documents (
          user_id, document_type, series_number, title, name, issuing_organization, issue_date,
          expiry_date, date_of_birth, pinfl, educational_institution, specialty, graduation_year,
          course_name, organization_name, position, start_year, end_year, total_years_experience,
          issuing_authority, recommender_name, recommender_organization, recommender_position,
          file_url, file_name, verification_status, verification_message, score, verified, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        payload
      );
      documentId = result.lastID;
    }

    await logAudit({
      action: existingDocument ? 'Document replaced' : 'Document uploaded',
      userId: req.user.id,
      documentId,
      details: { documentType, verificationStatus: verification.verificationStatus },
    });

    const saved = await getAsync(`SELECT * FROM documents WHERE id = ?`, [documentId]);
    res.json(mapDocumentRow(saved));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify', authenticate, async (req, res) => {
  try {
    const { documentId, manualStatus, rejectionReason } = req.body;
    const document = await getAsync(`SELECT * FROM documents WHERE id = ?`, [documentId]);

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const isAdmin = ['admin', 'hospital_admin', 'super_admin'].includes(req.user.role);
    if (!canAccessUserDocuments(req.user, document.user_id) && !isAdmin) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    let verification;
    if (manualStatus && isAdmin) {
      if (manualStatus === 'Verified') {
        verification = {
          verificationStatus: 'Verified',
          verificationMessage: 'Document approved manually',
          score: DOCUMENT_TYPE_MAP[document.document_type]?.score || 0,
        };
      } else if (manualStatus === 'Rejected') {
        verification = {
          verificationStatus: 'Rejected',
          verificationMessage: rejectionReason || 'Document rejected manually',
          score: 0,
        };
      } else if (manualStatus === 'Suspicious') {
        verification = {
          verificationStatus: 'Suspicious',
          verificationMessage: rejectionReason || 'Document marked suspicious manually',
          score: 0,
        };
      }
    }

    if (!verification) {
      verification = verifyDocument({
        documentType: document.document_type,
        seriesNumber: document.series_number,
        fileName: document.file_name,
      });
    }

    await runAsync(
      `UPDATE documents
       SET verification_status = ?, verification_message = ?, score = ?, verified = ?, updated_at = ?
       WHERE id = ?`,
      [
        verification.verificationStatus,
        verification.verificationMessage,
        verification.score,
        verification.verificationStatus === 'Verified' ? 1 : 0,
        new Date().toISOString(),
        documentId,
      ]
    );

    await logAudit({
      action:
        verification.verificationStatus === 'Verified' && manualStatus
          ? 'Document approved manually'
          : verification.verificationStatus === 'Rejected'
            ? 'Document rejected'
            : verification.verificationStatus === 'Suspicious'
              ? 'Document marked suspicious'
              : 'Document verified',
      userId: req.user.id,
      documentId,
      details: {
        status: verification.verificationStatus,
        message: verification.verificationMessage,
      },
    });

    const saved = await getAsync(`SELECT * FROM documents WHERE id = ?`, [documentId]);
    res.json(mapDocumentRow(saved));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:documentId', authenticate, async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await getAsync(`SELECT * FROM documents WHERE id = ?`, [documentId]);

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const isAdmin = ['admin', 'hospital_admin', 'super_admin'].includes(req.user.role);
    if (!canAccessUserDocuments(req.user, document.user_id) && !isAdmin) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const {
      seriesNumber,
      title,
      issuingOrganization,
      issueDate,
      expiryDate,
      educationalInstitution,
      specialty,
      graduationYear,
      courseName,
      organizationName,
      position,
      startYear,
      endYear,
      totalYearsOfExperience,
      issuingAuthority,
      recommenderName,
      recommenderOrganization,
      recommenderPosition,
      dateOfBirth,
      pinfl,
    } = req.body;

    await runAsync(
      `UPDATE documents
       SET series_number = ?, title = ?, name = ?, issuing_organization = ?, issue_date = ?,
           expiry_date = ?, educational_institution = ?, specialty = ?, graduation_year = ?,
           course_name = ?, organization_name = ?, position = ?, start_year = ?, end_year = ?,
           total_years_experience = ?, issuing_authority = ?, recommender_name = ?, recommender_organization = ?,
           recommender_position = ?, date_of_birth = ?, pinfl = ?, updated_at = ?
       WHERE id = ?`,
      [
        normalizeSeries(seriesNumber || document.series_number),
        title || document.title,
        title || document.name,
        issuingOrganization || document.issuing_organization,
        issueDate || document.issue_date,
        expiryDate || document.expiry_date,
        educationalInstitution || document.educational_institution,
        specialty || document.specialty,
        graduationYear || document.graduation_year,
        courseName || document.course_name,
        organizationName || document.organization_name,
        position || document.position,
        startYear || document.start_year,
        endYear || document.end_year,
        Number(totalYearsOfExperience || document.total_years_experience || 0),
        issuingAuthority || document.issuing_authority,
        recommenderName || document.recommender_name,
        recommenderOrganization || document.recommender_organization,
        recommenderPosition || document.recommender_position,
        dateOfBirth || document.date_of_birth,
        pinfl || document.pinfl,
        new Date().toISOString(),
        documentId,
      ]
    );

    await logAudit({
      action: 'Document updated',
      userId: req.user.id,
      documentId,
      details: { documentType: document.document_type },
    });

    const saved = await getAsync(`SELECT * FROM documents WHERE id = ?`, [documentId]);
    res.json(mapDocumentRow(saved));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:documentId', authenticate, async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await getAsync(`SELECT * FROM documents WHERE id = ?`, [documentId]);

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const isAdmin = ['admin', 'hospital_admin', 'super_admin'].includes(req.user.role);
    if (!canAccessUserDocuments(req.user, document.user_id) && !isAdmin) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await runAsync(`DELETE FROM documents WHERE id = ?`, [documentId]);

    await logAudit({
      action: 'Document deleted',
      userId: req.user.id,
      documentId,
      details: { documentType: document.document_type },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/application-score/:userId/:vacancyId', authenticate, async (req, res) => {
  try {
    const { userId, vacancyId } = req.params;
    if (!canAccessUserDocuments(req.user, userId)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const score = await calculateOverallCandidateScore({
      userId: Number(userId),
      vacancyId: Number(vacancyId),
    });

    res.json(score);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
