export const documentDefinitions = [
  {
    type: 'passport',
    name: 'Passport / ID Card',
    score: 15,
    fields: [
      { key: 'seriesNumber', label: 'Passport or ID series number' },
      { key: 'pinfl', label: 'PINFL / JSHSHIR' },
      { key: 'dateOfBirth', label: 'Date of birth', type: 'date' },
    ],
  },
  {
    type: 'diploma',
    name: 'Diploma',
    score: 25,
    fields: [
      { key: 'seriesNumber', label: 'Diplom seriya raqami' },
      { key: 'educationalInstitution', label: 'Educational institution' },
      { key: 'specialty', label: 'Tugatgan yo\'nalishi' },
      { key: 'graduationYear', label: 'Tugatgan yili', type: 'number' },
    ],
  },
  {
    type: 'certificate',
    name: 'Malaka oshirish sertifikati',
    score: 20,
    fields: [
      { key: 'seriesNumber', label: 'Sertifikat raqami' },
      { key: 'courseName', label: 'Kurs nomi' },
      { key: 'issueDate', label: 'Berilgan sana', type: 'date' },
      { key: 'expiryDate', label: 'Amal qilish muddati', type: 'date' },
    ],
  },
  {
    type: 'work_experience',
    name: 'Work Experience Document',
    score: 20,
    fields: [
      { key: 'seriesNumber', label: 'Experience reference number' },
      { key: 'organizationName', label: 'Organization name' },
      { key: 'position', label: 'Position' },
      { key: 'startYear', label: 'Start year', type: 'number' },
      { key: 'endYear', label: 'End year', type: 'number' },
      { key: 'totalYearsOfExperience', label: 'Total years of experience', type: 'number' },
    ],
  },
  {
    type: 'license',
    name: 'Medical License / Professional Permission',
    score: 15,
    fields: [
      { key: 'seriesNumber', label: 'License number' },
      { key: 'issuingAuthority', label: 'Issuing authority' },
      { key: 'issueDate', label: 'Issue date', type: 'date' },
      { key: 'expiryDate', label: 'Expiry date', type: 'date' },
    ],
  },
  {
    type: 'recommendation',
    name: 'Recommendation Letter',
    score: 5,
    fields: [
      { key: 'seriesNumber', label: 'Recommendation code' },
      { key: 'recommenderName', label: 'Recommender name' },
      { key: 'recommenderOrganization', label: 'Recommender organization' },
      { key: 'recommenderPosition', label: 'Recommender position' },
    ],
  },
];

export const statusStyles = {
  Verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Pending review': 'bg-amber-100 text-amber-700 border-amber-200',
  Rejected: 'bg-rose-100 text-rose-700 border-rose-200',
  Suspicious: 'bg-orange-100 text-orange-700 border-orange-200',
  'Not submitted': 'bg-slate-100 text-slate-600 border-slate-200',
};

export const importantDocumentTypes = ['passport', 'diploma', 'license', 'work_experience'];

export const getDocumentDefinition = (documentType) =>
  documentDefinitions.find((item) => item.type === documentType);

export const getDocumentLabel = (documentType) =>
  getDocumentDefinition(documentType)?.name || documentType;

export const getDocumentScoreValue = (documentType) =>
  getDocumentDefinition(documentType)?.score || 0;
