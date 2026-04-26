const { DOCUMENT_TYPE_MAP } = require('./documentRules');

const normalizeSeries = (seriesNumber = '') => seriesNumber.trim().toUpperCase();

const hasClearlyInvalidFormat = (seriesNumber = '') => {
  const normalized = normalizeSeries(seriesNumber);
  return normalized.length < 5 || !/^[A-Z0-9-]+$/.test(normalized);
};

const verifyDocument = ({ documentType, seriesNumber, fileName, manualStatus }) => {
  const config = DOCUMENT_TYPE_MAP[documentType];
  const maxScore = config ? config.score : 0;
  const normalizedSeries = normalizeSeries(seriesNumber);

  if (!fileName) {
    return {
      verificationStatus: 'Not submitted',
      verificationMessage: 'No file uploaded',
      score: 0,
    };
  }

  if (manualStatus === 'Rejected') {
    return {
      verificationStatus: 'Rejected',
      verificationMessage: 'Document was rejected manually',
      score: 0,
    };
  }

  if (hasClearlyInvalidFormat(normalizedSeries)) {
    return {
      verificationStatus: 'Suspicious',
      verificationMessage: 'Invalid or suspicious document number',
      score: 0,
    };
  }

  if (config && config.validSeries.includes(normalizedSeries)) {
    return {
      verificationStatus: 'Verified',
      verificationMessage: 'Document verified successfully',
      score: maxScore,
    };
  }

  return {
    verificationStatus: 'Pending review',
    verificationMessage: 'Document requires manual review',
    score: Math.round(maxScore * 0.5),
  };
};

module.exports = {
  verifyDocument,
  normalizeSeries,
};
