import {
  documentDefinitions,
  getDocumentLabel,
  getDocumentScoreValue,
  importantDocumentTypes,
} from './documentReviewConfig';

const DOCUMENTS_KEY = 'halolkadr_admin_document_review_records';
const AUDIT_LOG_KEY = 'halolkadr_admin_document_review_audit';

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const createDocId = (applicantId, documentType) => `${applicantId}-${documentType}`;

const getNowIso = () => new Date().toISOString();

const buildReviewDetails = (item) => ({
  pinfl: item.pinfl || '',
  dateOfBirth: item.dateOfBirth || '',
  educationalInstitution: item.educationalInstitution || '',
  specialty: item.specialty || '',
  graduationYear: item.graduationYear || '',
  courseName: item.courseName || '',
  issuingOrganization: item.issuingOrganization || '',
  issueDate: item.issueDate || '',
  expiryDate: item.expiryDate || '',
  organizationName: item.organizationName || '',
  position: item.position || '',
  startYear: item.startYear || '',
  endYear: item.endYear || '',
  totalYearsOfExperience: item.totalYearsOfExperience || '',
  issuingAuthority: item.issuingAuthority || '',
  recommenderName: item.recommenderName || '',
  recommenderOrganization: item.recommenderOrganization || '',
  recommenderPosition: item.recommenderPosition || '',
});

const createMockDocuments = () => [
  {
    id: createDocId('101', 'passport'),
    applicantId: '101',
    applicantName: 'Aziza Karimova',
    documentType: 'passport',
    documentName: getDocumentLabel('passport'),
    seriesNumber: 'AD1234567',
    uploadedFileName: 'passport-aziza.pdf',
    fileUrl: '',
    uploadDate: '2026-04-20T10:15:00.000Z',
    status: 'Verified',
    score: 15,
    verificationMessage: 'Manually verified by admin',
    reviewNote: 'Passport data matched candidate profile.',
    reviewedManually: true,
  },
  {
    id: createDocId('101', 'diploma'),
    applicantId: '101',
    applicantName: 'Aziza Karimova',
    documentType: 'diploma',
    documentName: getDocumentLabel('diploma'),
    seriesNumber: 'DP2023007',
    uploadedFileName: 'diploma-aziza.pdf',
    fileUrl: '',
    uploadDate: '2026-04-20T10:25:00.000Z',
    status: 'Pending review',
    score: 12.5,
    verificationMessage: 'Document requires manual review',
    reviewNote: '',
    reviewedManually: false,
  },
  {
    id: createDocId('102', 'license'),
    applicantId: '102',
    applicantName: 'Dilshod Ergashev',
    documentType: 'license',
    documentName: getDocumentLabel('license'),
    seriesNumber: 'LC2024099',
    uploadedFileName: 'license-dilshod.pdf',
    fileUrl: '',
    uploadDate: '2026-04-21T09:00:00.000Z',
    status: 'Verified',
    score: 15,
    verificationMessage: 'Manually verified by admin',
    reviewNote: 'Active medical license confirmed for demo.',
    reviewedManually: true,
  },
  {
    id: createDocId('102', 'work_experience'),
    applicantId: '102',
    applicantName: 'Dilshod Ergashev',
    documentType: 'work_experience',
    documentName: getDocumentLabel('work_experience'),
    seriesNumber: 'WE2024999',
    uploadedFileName: 'experience-dilshod.pdf',
    fileUrl: '',
    uploadDate: '2026-04-21T09:15:00.000Z',
    status: 'Suspicious',
    score: 0,
    verificationMessage: 'Manual review flagged inconsistent reference number',
    reviewNote: 'Reference number differs from submitted experience letter.',
    reviewedManually: true,
  },
  {
    id: createDocId('103', 'certificate'),
    applicantId: '103',
    applicantName: 'Malika Usmonova',
    documentType: 'certificate',
    documentName: getDocumentLabel('certificate'),
    seriesNumber: 'CF2024010',
    uploadedFileName: 'certificate-malika.pdf',
    fileUrl: '',
    uploadDate: '2026-04-22T14:10:00.000Z',
    status: 'Rejected',
    score: 0,
    verificationMessage: 'Manual review rejected this document',
    reviewNote: 'Certificate issue date and seal do not match attached copy.',
    reviewedManually: true,
  },
  {
    id: createDocId('103', 'recommendation'),
    applicantId: '103',
    applicantName: 'Malika Usmonova',
    documentType: 'recommendation',
    documentName: getDocumentLabel('recommendation'),
    seriesNumber: 'RC2023018',
    uploadedFileName: 'recommendation-malika.pdf',
    fileUrl: '',
    uploadDate: '2026-04-22T14:15:00.000Z',
    status: 'Pending review',
    score: 2.5,
    verificationMessage: 'Document requires manual review',
    reviewNote: '',
    reviewedManually: false,
  },
];

export const loadAdminReviewDocuments = () => {
  if (typeof window === 'undefined') return [];

  const stored = safeJsonParse(window.localStorage.getItem(DOCUMENTS_KEY), null);
  if (Array.isArray(stored) && stored.length > 0) {
    return stored;
  }

  const seed = createMockDocuments();
  window.localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(seed));
  return seed;
};

export const saveAdminReviewDocuments = (documents) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
};

export const loadAdminAuditLog = () => {
  if (typeof window === 'undefined') return [];
  return safeJsonParse(window.localStorage.getItem(AUDIT_LOG_KEY), []);
};

export const saveAdminAuditLog = (entries) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(entries));
};

export const appendAdminAuditLog = (entry) => {
  const nextEntries = [entry, ...loadAdminAuditLog()];
  saveAdminAuditLog(nextEntries);
  return nextEntries;
};

const normalizeApplicantName = (user) =>
  user?.fullName || user?.full_name || user?.name || user?.email || `Applicant ${user?.id || ''}`.trim();

export const syncApplicantDocumentsToAdminStore = ({ user, documents }) => {
  if (typeof window === 'undefined' || !user?.id) return [];

  const current = loadAdminReviewDocuments();
  const applicantId = String(user.id);
  const applicantName = normalizeApplicantName(user);
  const applicantEmail = user.email || '';
  const existingApplicantDocs = current.filter((item) => String(item.applicantId) === applicantId);
  const otherDocs = current.filter((item) => String(item.applicantId) !== applicantId);

  const nextApplicantDocs = (documents || [])
    .filter((item) => item.fileName || item.fileUrl)
    .map((item) => {
      const id = createDocId(applicantId, item.documentType);
      const previous = existingApplicantDocs.find((doc) => doc.id === id);
      const nextFileName = item.fileName || item.fileUrl?.split('/').pop() || '';
      const details = buildReviewDetails(item);
      const documentChanged =
        previous &&
        (previous.seriesNumber !== (item.seriesNumber || '') ||
          previous.uploadedFileName !== nextFileName);

      const keepManualReview = previous?.reviewedManually && !documentChanged;

      return {
        id,
        applicantId,
        applicantName,
        applicantEmail,
        documentType: item.documentType,
        documentName: getDocumentLabel(item.documentType),
        seriesNumber: item.seriesNumber || '',
        uploadedFileName: nextFileName,
        fileUrl: item.fileUrl || '',
        uploadDate: item.updatedAt || item.createdAt || getNowIso(),
        status: keepManualReview ? previous.status : 'Pending review',
        score: keepManualReview ? previous.score : 0,
        verificationMessage: keepManualReview
          ? previous.verificationMessage
          : 'Tekshirish jarayonida',
        reviewNote: keepManualReview ? previous.reviewNote || '' : '',
        reviewedManually: keepManualReview,
        details,
        ...details,
      };
    });

  const nextDocuments = [...otherDocs, ...nextApplicantDocs].sort(
    (left, right) => new Date(right.uploadDate).getTime() - new Date(left.uploadDate).getTime()
  );

  saveAdminReviewDocuments(nextDocuments);
  return nextDocuments;
};

export const scoreRangeMatches = (score, range) => {
  if (!range) return true;
  if (range === '0') return Number(score) === 0;
  if (range === '1-10') return Number(score) > 0 && Number(score) <= 10;
  if (range === '11-20') return Number(score) >= 11 && Number(score) <= 20;
  if (range === '21+') return Number(score) >= 21;
  return true;
};

export const calculateAdminDashboardStats = (documents) => {
  const totalUploaded = documents.length;
  const pendingDocuments = documents.filter((item) => item.status === 'Pending review').length;
  const verifiedDocuments = documents.filter((item) => item.status === 'Verified').length;
  const rejectedDocuments = documents.filter((item) => item.status === 'Rejected').length;
  const suspiciousDocuments = documents.filter((item) => item.status === 'Suspicious').length;
  const averageDocumentScore = totalUploaded
    ? Math.round(
        (documents.reduce((sum, item) => sum + Number(item.score || 0), 0) / totalUploaded) * 10
      ) / 10
    : 0;

  return {
    totalUploaded,
    pendingDocuments,
    verifiedDocuments,
    rejectedDocuments,
    suspiciousDocuments,
    averageDocumentScore,
  };
};

export const calculateApplicantProgress = (documents) => {
  const grouped = documents.reduce((acc, item) => {
    const key = String(item.applicantId);
    if (!acc[key]) {
      acc[key] = {
        applicantId: item.applicantId,
        applicantName: item.applicantName,
        documents: [],
      };
    }
    acc[key].documents.push(item);
    return acc;
  }, {});

  return Object.values(grouped).map((entry) => {
    const totalScore = Math.round(
      entry.documents.reduce((sum, item) => sum + Number(item.score || 0), 0) * 10
    ) / 10;
    const verifiedCount = entry.documents.filter((item) => item.status === 'Verified').length;
    const pendingCount = entry.documents.filter((item) => item.status === 'Pending review').length;
    const rejectedCount = entry.documents.filter((item) => item.status === 'Rejected').length;
    const suspiciousCount = entry.documents.filter((item) => item.status === 'Suspicious').length;
    const reviewedCount = verifiedCount + rejectedCount + suspiciousCount;
    const progress = Math.round((reviewedCount / documentDefinitions.length) * 100);
    const hasBlockedImportantDocument = entry.documents.some(
      (item) =>
        importantDocumentTypes.includes(item.documentType) &&
        ['Rejected', 'Suspicious'].includes(item.status)
    );

    let overallStatus = 'Needs review';
    if (hasBlockedImportantDocument) {
      overallStatus = 'Not eligible';
    } else if (pendingCount > 0) {
      overallStatus = 'Needs review';
    } else if (totalScore >= 70) {
      overallStatus = 'Ready for review';
    }

    return {
      applicantId: entry.applicantId,
      applicantName: entry.applicantName,
      totalScore,
      progress,
      verifiedCount,
      pendingCount,
      rejectedCount,
      suspiciousCount,
      overallStatus,
    };
  });
};

export const createManualReviewUpdate = (document, nextStatus, note) => {
  const fullScore = getDocumentScoreValue(document.documentType);
  const trimmedNote = note.trim();

  if (nextStatus === 'Verified') {
    return {
      ...document,
      status: 'Verified',
      score: fullScore,
      verificationMessage: 'Manually verified by admin',
      reviewNote: trimmedNote,
      reviewedManually: true,
      reviewedAt: getNowIso(),
    };
  }

  if (nextStatus === 'Rejected') {
    return {
      ...document,
      status: 'Rejected',
      score: 0,
      verificationMessage: trimmedNote || 'Manual review rejected this document',
      reviewNote: trimmedNote,
      reviewedManually: true,
      reviewedAt: getNowIso(),
    };
  }

  return {
    ...document,
    status: 'Suspicious',
    score: 0,
    verificationMessage: trimmedNote || 'Manual review flagged this document as suspicious',
    reviewNote: trimmedNote,
    reviewedManually: true,
    reviewedAt: getNowIso(),
  };
};

export const mergeApplicantDocumentsWithReviewStore = ({ userId, documents, storedDocuments }) => {
  const source = Array.isArray(storedDocuments) ? storedDocuments : loadAdminReviewDocuments();
  const applicantDocuments = source.filter((item) => String(item.applicantId) === String(userId));

  return (documents || []).map((document) => {
    const match = applicantDocuments.find((item) => item.documentType === document.documentType);
    if (!match) {
      return document;
    }

    return {
      ...document,
      fileName: match.uploadedFileName || document.fileName,
      fileUrl: match.fileUrl || document.fileUrl,
      verificationStatus: match.status || document.verificationStatus,
      verificationMessage: match.verificationMessage || document.verificationMessage,
      score: typeof match.score === 'number' ? match.score : document.score,
      updatedAt: match.reviewedAt || match.uploadDate || document.updatedAt,
      ...match.details,
    };
  });
};

export const buildApplicantSummaryFromDocuments = (documents) => {
  const totalScore = Math.min(100, (documents || []).reduce((sum, item) => sum + Number(item.score || 0), 0));
  const verifiedCount = (documents || []).filter((item) => item.verificationStatus === 'Verified').length;
  const pendingCount = (documents || []).filter((item) => item.verificationStatus === 'Pending review').length;
  const blockedCount = (documents || []).filter((item) =>
    ['Rejected', 'Suspicious'].includes(item.verificationStatus)
  ).length;
  const submittedCount = (documents || []).filter((item) => item.fileName || item.fileUrl).length;

  return {
    totalScore,
    progress: Math.round((submittedCount / documentDefinitions.length) * 100),
    verifiedCount,
    pendingCount,
    blockedCount,
    submittedCount,
    totalRequiredDocuments: documentDefinitions.length,
  };
};

export const buildApplicantHistoryFromDocuments = (documents) =>
  (documents || []).map((document) => ({
    documentType: document.documentType,
    seriesNumber: document.seriesNumber,
    status: document.verificationStatus,
    score: document.score || 0,
    verificationDate: document.updatedAt || document.createdAt || '',
    message: document.verificationMessage || '',
  }));
