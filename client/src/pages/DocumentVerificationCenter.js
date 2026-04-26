import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import { getThemeClasses } from '../themeStyles';
import {
  buildApplicantHistoryFromDocuments,
  buildApplicantSummaryFromDocuments,
  mergeApplicantDocumentsWithReviewStore,
  syncApplicantDocumentsToAdminStore,
} from '../utils/adminDocumentReviewStore';
import { documentDefinitions, statusStyles } from '../utils/documentReviewConfig';

const API_BASE = 'http://localhost:5000/api/documents';

const defaultFormState = documentDefinitions.reduce((acc, item) => {
  acc[item.type] = {
    seriesNumber: '',
    pinfl: '',
    dateOfBirth: '',
    educationalInstitution: '',
    specialty: '',
    graduationYear: '',
    courseName: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    organizationName: '',
    position: '',
    startYear: '',
    endYear: '',
    totalYearsOfExperience: '',
    issuingAuthority: '',
    recommenderName: '',
    recommenderOrganization: '',
    recommenderPosition: '',
    file: null,
    fileName: '',
  };
  return acc;
}, {});

const decodeTokenPayload = (token) => {
  try {
    const base64 = token.split('.')[1];
    return JSON.parse(atob(base64));
  } catch (error) {
    return null;
  }
};

const SummaryCard = ({ title, value, hint, tone = 'sky' }) => {
  const tones = {
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
  };

  return (
    <div className={`rounded-[24px] border p-5 ${tones[tone]}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.18em]">{title}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm">{hint}</p>
    </div>
  );
};

const DocumentVerificationCenter = () => {
  const { darkMode } = useContext(ThemeContext);
  const theme = getThemeClasses(darkMode);
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const parsedUser = storedUser ? JSON.parse(storedUser) : decodeTokenPayload(token || '');
  const userId = parsedUser?.id;
  const userRole = parsedUser?.role || 'applicant';
  const isAdmin = ['admin', 'hospital_admin', 'super_admin'].includes(userRole);

  const [documents, setDocuments] = useState([]);
  const [summary, setSummary] = useState({
    totalScore: 0,
    progress: 0,
    verifiedCount: 0,
    pendingCount: 0,
    blockedCount: 0,
  });
  const [history, setHistory] = useState([]);
  const [forms, setForms] = useState(defaultFormState);
  const [loading, setLoading] = useState(false);
  const [adminDocuments, setAdminDocuments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [activeEducationDocument, setActiveEducationDocument] = useState('diploma');
  const fileInputsRef = useRef({});

  const authHeaders = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  const hydrateForms = (items) => {
    const nextForms = JSON.parse(JSON.stringify(defaultFormState));
    items.forEach((doc) => {
      nextForms[doc.documentType] = {
        ...nextForms[doc.documentType],
        ...doc,
        file: null,
        fileName: doc.fileName || '',
      };
    });
    setForms(nextForms);
  };

  const loadDocuments = useCallback(async () => {
    if (!userId || !token) return;

    setLoading(true);
    try {
      const documentsResponse = await axios.get(`${API_BASE}/${userId}`, authHeaders);
      const syncedStoreDocuments = syncApplicantDocumentsToAdminStore({
        user: parsedUser,
        documents: documentsResponse.data.documents,
      });
      const mergedDocuments = mergeApplicantDocumentsWithReviewStore({
        userId,
        documents: documentsResponse.data.documents,
        storedDocuments: syncedStoreDocuments,
      });

      setDocuments(mergedDocuments);
      setHistory(buildApplicantHistoryFromDocuments(mergedDocuments));
      setSummary(buildApplicantSummaryFromDocuments(mergedDocuments));
      hydrateForms(mergedDocuments);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, parsedUser, token, userId]);

  const loadAdminDocuments = useCallback(async () => {
    if (!isAdmin || !token) return;

    try {
      const suffix = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
      const response = await axios.get(`${API_BASE}/admin/list${suffix}`, authHeaders);
      setAdminDocuments(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [authHeaders, isAdmin, statusFilter, token]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    loadAdminDocuments();
  }, [loadAdminDocuments]);

  const getDocument = (type) =>
    documents.find((document) => document.documentType === type) || {
      documentType: type,
      verificationStatus: 'Not submitted',
      score: 0,
      verificationMessage: 'No file uploaded',
    };

  const updateFormField = (type, key, value) => {
    setForms((current) => ({
      ...current,
      [type]: {
        ...current[type],
        [key]: value,
      },
    }));
  };

  const uploadDocument = async (type) => {
    const form = forms[type];
    const data = new FormData();
    data.append('userId', userId);
    data.append('documentType', type);
    data.append('title', documentDefinitions.find((item) => item.type === type)?.name || type);

    Object.entries(form).forEach(([key, value]) => {
      if (key === 'file') {
        if (value) data.append('file', value);
        return;
      }
      if (value !== null && value !== undefined) {
        data.append(key, value);
      }
    });

    await axios.post(`${API_BASE}/upload`, data, {
      ...authHeaders,
      headers: {
        ...authHeaders.headers,
        'Content-Type': 'multipart/form-data',
      },
    });

    await loadDocuments();
    if (isAdmin) {
      await loadAdminDocuments();
    }
  };

  const verifyDocument = async (documentId, manualStatus, rejectionReason) => {
    await axios.post(
      `${API_BASE}/verify`,
      {
        documentId,
        manualStatus,
        rejectionReason,
      },
      authHeaders
    );

    await loadDocuments();
    if (isAdmin) {
      await loadAdminDocuments();
    }
  };

  const deleteDocument = async (documentId) => {
    await axios.delete(`${API_BASE}/${documentId}`, authHeaders);
    await loadDocuments();
    if (isAdmin) {
      await loadAdminDocuments();
    }
  };

  const renderField = (type, field) => (
    <label key={field.key} className="block">
      <span className={`mb-2 block text-sm font-semibold ${theme.text}`}>{field.label}</span>
      <input
        type={field.type || 'text'}
        value={forms[type][field.key] || ''}
        onChange={(e) => updateFormField(type, field.key, e.target.value)}
        className={`w-full rounded-2xl border px-4 py-3 ${theme.input}`}
      />
    </label>
  );

  const renderDocumentCard = (definition) => {
    const document = getDocument(definition.type);
    const form = forms[definition.type];
    const statusClass = statusStyles[document.verificationStatus] || statusStyles['Not submitted'];
    const uploadLabel =
      definition.type === 'diploma'
        ? 'Diplom fayl yuklash'
        : definition.type === 'certificate'
          ? 'Sertifikat fayl yuklash'
          : 'Upload';

    return (
      <div key={definition.type} className={`rounded-[28px] border p-6 ${theme.sectionPanel}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${theme.heading}`}>{definition.name}</h2>
            <p className={`mt-2 ${theme.muted}`}>Full score: {definition.score} points</p>
          </div>
          <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${statusClass}`}>
            {document.verificationStatus}
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {definition.fields.map((field) => renderField(definition.type, field))}
        </div>

        <div className={`mt-5 rounded-[20px] border p-4 ${theme.subtleSurface}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={`font-semibold ${theme.heading}`}>
                Score: <span className={theme.highlight}>{document.score || 0}</span>
              </p>
              <p className={`mt-1 text-sm ${theme.muted}`}>
                {document.verificationMessage || 'Document has not been verified yet.'}
              </p>
              <p className={`mt-2 text-sm ${theme.text}`}>
                Current file: {form.fileName || document.fileName || 'No file selected'}
              </p>
            </div>
            <input
              ref={(element) => {
                fileInputsRef.current[definition.type] = element;
              }}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                updateFormField(definition.type, 'file', file);
                updateFormField(definition.type, 'fileName', file?.name || document.fileName || '');
              }}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputsRef.current[definition.type]?.click()}
                className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
              >
                {uploadLabel}
              </button>
              <button
                type="button"
                onClick={() => uploadDocument(definition.type)}
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
              >
                {document.fileName ? 'Replace' : 'Save'}
              </button>
              <button
                type="button"
                disabled={!document.fileUrl}
                onClick={() => window.open(`http://localhost:5000${document.fileUrl}`, '_blank')}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${theme.secondaryButton} disabled:opacity-50`}
              >
                View
              </button>
              <button
                type="button"
                disabled={!document.id}
                onClick={() => deleteDocument(document.id)}
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const educationDocumentDefinitions = documentDefinitions.filter((item) =>
    ['diploma', 'certificate'].includes(item.type)
  );
  const standardDocumentDefinitions = documentDefinitions.filter(
    (item) => !['diploma', 'certificate'].includes(item.type)
  );
  const activeEducationDefinition =
    educationDocumentDefinitions.find((item) => item.type === activeEducationDocument) ||
    educationDocumentDefinitions[0];

  if (!token || !userId) {
    return (
      <div className={theme.page}>
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <div className={`rounded-[28px] border p-8 text-center ${theme.card}`}>
            <h1 className={`text-3xl font-bold ${theme.heading}`}>Document Verification Center</h1>
            <p className={`mt-4 ${theme.text}`}>
              Please log in first to upload and verify applicant documents.
            </p>
            <div className="mt-6">
              <Link to="/login" className="rounded-full bg-sky-500 px-6 py-3 font-semibold text-white">
                Go to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={theme.page}>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className={`rounded-[32px] border p-8 ${theme.card}`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-500">
                Transparency Module
              </p>
              <h1 className={`mt-2 text-4xl font-bold ${theme.heading}`}>
                Document Verification Center
              </h1>
              <p className={`mt-3 max-w-3xl ${theme.text}`}>
                Upload applicant documents, run mock verification, calculate transparent document
                scores, and review the verification trail.
              </p>
            </div>
            <div className={`rounded-[24px] border p-5 ${theme.softCard}`}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">Verification progress</p>
              <p className={`mt-2 text-3xl font-bold ${theme.heading}`}>{summary.progress || 0}%</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all"
                  style={{ width: `${summary.progress || 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total score"
              value={`${summary.totalScore || 0}/100`}
              hint="Document verification contributes 40% of the overall candidate score."
              tone="sky"
            />
            <SummaryCard
              title="Verified"
              value={summary.verifiedCount || 0}
              hint="Documents fully matched mock trusted records."
              tone="green"
            />
            <SummaryCard
              title="Pending"
              value={summary.pendingCount || 0}
              hint="These files need manual HR review."
              tone="amber"
            />
            <SummaryCard
              title="Risk flags"
              value={summary.blockedCount || 0}
              hint="Rejected or suspicious documents need attention."
              tone="rose"
            />
          </div>

          <div className={`mt-10 rounded-[28px] border p-6 ${theme.sectionPanel}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className={`text-2xl font-bold ${theme.heading}`}>Education Documents</h2>
                <p className={`mt-2 ${theme.text}`}>
                  Diplom yoki malaka oshirish sertifikati tugmasini bosing, tagida to'ldirish
                  oynalari ochiladi.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {educationDocumentDefinitions.map((definition) => (
                  <button
                    key={definition.type}
                    type="button"
                    onClick={() => setActiveEducationDocument(definition.type)}
                    className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                      activeEducationDocument === definition.type
                        ? 'bg-sky-600 text-white shadow-lg shadow-sky-200'
                        : darkMode
                          ? 'bg-slate-800 text-slate-100'
                          : 'bg-white text-slate-900'
                    }`}
                  >
                    {definition.type === 'diploma' ? 'Diploma' : 'Malaka oshirish sertifikati'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">{activeEducationDefinition && renderDocumentCard(activeEducationDefinition)}</div>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-2">
            {standardDocumentDefinitions.map((definition) => renderDocumentCard(definition))}
          </div>

          <div className="mt-10 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div className={`rounded-[28px] border p-6 ${theme.card}`}>
              <h2 className={`text-2xl font-bold ${theme.heading}`}>Verification History</h2>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className={theme.muted}>
                    <tr>
                      <th className="pb-3 pr-4">Document type</th>
                      <th className="pb-3 pr-4">Series number</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Score</th>
                      <th className="pb-3 pr-4">Verification date</th>
                      <th className="pb-3">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan="6" className={`py-6 ${theme.muted}`}>
                          No verification history yet.
                        </td>
                      </tr>
                    ) : (
                      history.map((item, index) => (
                        <tr key={`${item.documentType}-${index}`} className="border-t border-slate-200/60">
                          <td className={`py-4 pr-4 ${theme.text}`}>{item.documentType}</td>
                          <td className={`py-4 pr-4 ${theme.text}`}>{item.seriesNumber || '-'}</td>
                          <td className="py-4 pr-4">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                statusStyles[item.status] || statusStyles['Not submitted']
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className={`py-4 pr-4 ${theme.text}`}>{item.score}</td>
                          <td className={`py-4 pr-4 ${theme.text}`}>
                            {item.verificationDate ? new Date(item.verificationDate).toLocaleString() : '-'}
                          </td>
                          <td className={`py-4 ${theme.text}`}>{item.message}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`rounded-[28px] border p-6 ${theme.card}`}>
              <h2 className={`text-2xl font-bold ${theme.heading}`}>Scoring Model</h2>
              <div className="mt-5 space-y-3">
                <div className={`rounded-2xl border p-4 ${theme.softCard}`}>
                  <p className="font-semibold">Document score: 40%</p>
                </div>
                <div className={`rounded-2xl border p-4 ${theme.softCard}`}>
                  <p className="font-semibold">Professional test score: 30%</p>
                </div>
                <div className={`rounded-2xl border p-4 ${theme.softCard}`}>
                  <p className="font-semibold">Work experience: 20%</p>
                </div>
                <div className={`rounded-2xl border p-4 ${theme.softCard}`}>
                  <p className="font-semibold">Vacancy match: 10%</p>
                </div>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className={`mt-10 rounded-[28px] border p-6 ${theme.card}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className={`text-2xl font-bold ${theme.heading}`}>Admin / HR Review</h2>
                  <p className={`mt-2 ${theme.text}`}>
                    Review uploaded documents, filter by status, approve pending items, or reject suspicious records.
                  </p>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`rounded-2xl border px-4 py-3 ${theme.input}`}
                >
                  <option value="">All statuses</option>
                  <option value="Pending review">Pending review</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Suspicious">Suspicious</option>
                </select>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className={theme.muted}>
                    <tr>
                      <th className="pb-3 pr-4">Applicant</th>
                      <th className="pb-3 pr-4">Document</th>
                      <th className="pb-3 pr-4">Series</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Score</th>
                      <th className="pb-3 pr-4">Reason</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminDocuments.map((document) => (
                      <tr key={document.id} className="border-t border-slate-200/60">
                        <td className={`py-4 pr-4 ${theme.text}`}>
                          <div>{document.applicantName || `User ${document.userId}`}</div>
                          <div className={theme.muted}>{document.applicantEmail || ''}</div>
                        </td>
                        <td className={`py-4 pr-4 ${theme.text}`}>{document.title || document.documentType}</td>
                        <td className={`py-4 pr-4 ${theme.text}`}>{document.seriesNumber || '-'}</td>
                        <td className="py-4 pr-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              statusStyles[document.verificationStatus] || statusStyles['Not submitted']
                            }`}
                          >
                            {document.verificationStatus}
                          </span>
                        </td>
                        <td className={`py-4 pr-4 ${theme.text}`}>{document.score}</td>
                        <td className="py-4 pr-4">
                          <input
                            value={rejectionReasons[document.id] || ''}
                            onChange={(e) =>
                              setRejectionReasons((current) => ({
                                ...current,
                                [document.id]: e.target.value,
                              }))
                            }
                            placeholder="Rejection reason"
                            className={`w-full rounded-xl border px-3 py-2 ${theme.input}`}
                          />
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => verifyDocument(document.id, 'Verified')}
                              className="rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-white"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                verifyDocument(
                                  document.id,
                                  'Suspicious',
                                  rejectionReasons[document.id] || 'Marked suspicious by HR'
                                )
                              }
                              className="rounded-full bg-orange-500 px-3 py-2 text-xs font-semibold text-white"
                            >
                              Suspicious
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                verifyDocument(
                                  document.id,
                                  'Rejected',
                                  rejectionReasons[document.id] || 'Rejected by HR review'
                                )
                              }
                              className="rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {loading && <p className={`mt-6 ${theme.muted}`}>Loading document center...</p>}
        </div>
      </div>
    </div>
  );
};

export default DocumentVerificationCenter;
