const DOCUMENT_DEFINITIONS = [
  {
    type: 'passport',
    label: 'Passport / ID Card',
    score: 15,
    validSeries: ['AD1234567', 'AA9876543'],
  },
  {
    type: 'diploma',
    label: 'Diploma',
    score: 25,
    validSeries: ['DP2024001', 'DP2023007'],
  },
  {
    type: 'certificate',
    label: 'Qualification Certificate',
    score: 20,
    validSeries: ['CF2024010', 'CF2023025'],
  },
  {
    type: 'work_experience',
    label: 'Work Experience Document',
    score: 20,
    validSeries: ['WE2024011', 'WE2023003'],
  },
  {
    type: 'license',
    label: 'Medical License / Professional Permission',
    score: 15,
    validSeries: ['LC2024099', 'LC2023012'],
  },
  {
    type: 'recommendation',
    label: 'Recommendation Letter',
    score: 5,
    validSeries: ['RC2024005', 'RC2023018'],
  },
];

const DOCUMENT_TYPE_MAP = DOCUMENT_DEFINITIONS.reduce((acc, item) => {
  acc[item.type] = item;
  return acc;
}, {});

module.exports = {
  DOCUMENT_DEFINITIONS,
  DOCUMENT_TYPE_MAP,
};
