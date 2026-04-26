import { useEffect, useMemo, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import { getThemeClasses } from '../themeStyles';
import {
  appendAdminAuditLog,
  calculateAdminDashboardStats,
  calculateApplicantProgress,
  createManualReviewUpdate,
  loadAdminAuditLog,
  loadAdminReviewDocuments,
  saveAdminReviewDocuments,
  scoreRangeMatches,
} from '../utils/adminDocumentReviewStore';
import { getDocumentLabel, statusStyles } from '../utils/documentReviewConfig';

const decodeTokenPayload = (token) => {
  try {
    const base64 = token.split('.')[1];
    return JSON.parse(atob(base64));
  } catch (error) {
    return null;
  }
};

const SummaryCard = ({ title, value, subtitle, tone }) => {
  const tones = {
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  };

  return (
    <div className={`rounded-[24px] border p-5 ${tones[tone] || tones.sky}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.18em]">{title}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm">{subtitle}</p>
    </div>
  );
};

const renderSubmittedDetails = (document, theme) => {
  const source = document.details || document;
  const details = [];

  if (source.educationalInstitution) details.push(`OTM/Texnikum: ${source.educationalInstitution}`);
  if (source.specialty) details.push(`Tugatgan yo'nalishi: ${source.specialty}`);
  if (source.graduationYear) details.push(`Tugatgan yili: ${source.graduationYear}`);
  if (source.pinfl) details.push(`PINFL: ${source.pinfl}`);
  if (source.dateOfBirth) details.push(`Tug'ilgan sana: ${source.dateOfBirth}`);
  if (source.courseName) details.push(`Kurs nomi: ${source.courseName}`);
  if (source.issueDate) details.push(`Berilgan sana: ${source.issueDate}`);
  if (source.expiryDate) details.push(`Amal qilish muddati: ${source.expiryDate}`);
  if (source.issuingOrganization) details.push(`Tashkilot: ${source.issuingOrganization}`);
  if (source.organizationName) details.push(`Ish joyi: ${source.organizationName}`);
  if (source.position) details.push(`Lavozim: ${source.position}`);
  if (source.totalYearsOfExperience) details.push(`Tajriba: ${source.totalYearsOfExperience} yil`);
  if (source.issuingAuthority) details.push(`Beruvchi organ: ${source.issuingAuthority}`);
  if (source.recommenderName) details.push(`Tavsiyanoma bergan: ${source.recommenderName}`);

  if (details.length === 0) {
    return <span className={theme.muted}>No extra details</span>;
  }

  return (
    <div className={`space-y-1 text-xs ${theme.text}`}>
      {details.map((item) => (
        <div key={item}>{item}</div>
      ))}
    </div>
  );
};

const AdminDocumentReview = () => {
  const { darkMode } = useContext(ThemeContext);
  const theme = getThemeClasses(darkMode);
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const parsedUser = storedUser ? JSON.parse(storedUser) : decodeTokenPayload(token || '');
  const userRole = parsedUser?.role || 'applicant';
  const isAdmin = ['admin', 'hospital_admin', 'super_admin'].includes(userRole);
  const adminName = parsedUser?.fullName || parsedUser?.name || parsedUser?.email || 'Demo Admin';

  const [documents, setDocuments] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [filters, setFilters] = useState({
    applicantName: '',
    documentType: '',
    status: '',
    scoreRange: '',
  });
  const [rowNotes, setRowNotes] = useState({});

  useEffect(() => {
    setDocuments(loadAdminReviewDocuments());
    setAuditLog(loadAdminAuditLog());
  }, []);

  const dashboardStats = useMemo(() => calculateAdminDashboardStats(documents), [documents]);
  const applicantProgress = useMemo(() => calculateApplicantProgress(documents), [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const applicantMatches = document.applicantName
        .toLowerCase()
        .includes(filters.applicantName.trim().toLowerCase());
      const typeMatches = filters.documentType ? document.documentType === filters.documentType : true;
      const statusMatches = filters.status ? document.status === filters.status : true;
      const scoreMatches = scoreRangeMatches(document.score, filters.scoreRange);

      return applicantMatches && typeMatches && statusMatches && scoreMatches;
    });
  }, [documents, filters]);

  const persistDocuments = (nextDocuments) => {
    setDocuments(nextDocuments);
    saveAdminReviewDocuments(nextDocuments);
  };

  const recordAudit = (document, action, previousStatus, newStatus, previousScore, nextScore, note) => {
    const nextLog = appendAdminAuditLog({
      action,
      adminName,
      applicantName: document.applicantName,
      documentType: getDocumentLabel(document.documentType),
      previousStatus,
      newStatus,
      scoreChange: `${previousScore} -> ${nextScore}`,
      reviewNote: note,
      timestamp: new Date().toISOString(),
    });
    setAuditLog(nextLog);
  };

  const handleStatusChange = (document, nextStatus) => {
    const note = rowNotes[document.id] || '';
    if (nextStatus !== 'Verified' && !note.trim()) {
      window.alert('Please add a review note or reason first.');
      return;
    }

    const updatedDocument = createManualReviewUpdate(document, nextStatus, note);
    const nextDocuments = documents.map((item) => (item.id === document.id ? updatedDocument : item));

    persistDocuments(nextDocuments);
    recordAudit(
      document,
      nextStatus === 'Verified'
        ? 'Document verified manually'
        : nextStatus === 'Rejected'
          ? 'Document rejected manually'
          : 'Document marked suspicious',
      document.status,
      updatedDocument.status,
      document.score,
      updatedDocument.score,
      note
    );
  };

  const handleAddNote = (document) => {
    const note = rowNotes[document.id] || '';
    if (!note.trim()) {
      window.alert('Please write a review note first.');
      return;
    }

    const nextDocuments = documents.map((item) =>
      item.id === document.id
        ? {
            ...item,
            reviewNote: note.trim(),
            verificationMessage: item.verificationMessage || 'Review note added by admin',
          }
        : item
    );

    persistDocuments(nextDocuments);
    recordAudit(
      document,
      'Review note added',
      document.status,
      document.status,
      document.score,
      document.score,
      note.trim()
    );
  };

  if (!token || !parsedUser) {
    return (
      <div className={theme.page}>
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <div className={`rounded-[28px] border p-8 text-center ${theme.card}`}>
            <h1 className={`text-3xl font-bold ${theme.heading}`}>Admin Document Review</h1>
            <p className={`mt-4 ${theme.text}`}>Please log in as an admin to review uploaded documents.</p>
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

  if (!isAdmin) {
    return (
      <div className={theme.page}>
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <div className={`rounded-[28px] border p-8 text-center ${theme.card}`}>
            <h1 className={`text-3xl font-bold ${theme.heading}`}>Admin Document Review</h1>
            <p className={`mt-4 ${theme.text}`}>
              This page is only available for admin, HR, or super admin demo accounts.
            </p>
            <div className="mt-6">
              <Link to="/dashboard" className="rounded-full bg-sky-500 px-6 py-3 font-semibold text-white">
                Back to dashboard
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-500">
                Manual Verification Dashboard
              </p>
              <h1 className={`mt-2 text-4xl font-bold ${theme.heading}`}>Admin Document Review</h1>
              <p className={`mt-3 max-w-3xl ${theme.text}`}>
                Review every uploaded document transparently, flag suspicious records, and make
                hiring decisions based on visible verification evidence.
              </p>
            </div>
            <Link to="/documents" className="rounded-full bg-sky-600 px-5 py-3 font-semibold text-white">
              Open applicant document center
            </Link>
          </div>

          <div className="mt-6 rounded-[24px] border border-sky-200 bg-sky-50 p-5 text-sky-900">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Demo note</p>
            <p className="mt-2 text-sm leading-6">
              Because this is a hackathon prototype and not connected to government databases yet,
              documents are reviewed manually by an admin. In the real version, this verification will
              be integrated with official government and educational databases.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              title="Total uploaded"
              value={dashboardStats.totalUploaded}
              subtitle="Every uploaded record is visible to the admin."
              tone="sky"
            />
            <SummaryCard
              title="Pending"
              value={dashboardStats.pendingDocuments}
              subtitle="Documents waiting for manual review."
              tone="amber"
            />
            <SummaryCard
              title="Verified"
              value={dashboardStats.verifiedDocuments}
              subtitle="Documents approved by transparent review."
              tone="green"
            />
            <SummaryCard
              title="Rejected"
              value={dashboardStats.rejectedDocuments}
              subtitle="Documents blocked with a recorded reason."
              tone="rose"
            />
            <SummaryCard
              title="Suspicious"
              value={dashboardStats.suspiciousDocuments}
              subtitle="Potentially risky records flagged for integrity."
              tone="orange"
            />
            <SummaryCard
              title="Average score"
              value={`${dashboardStats.averageDocumentScore}/100`}
              subtitle="Average score across uploaded document records."
              tone="slate"
            />
          </div>

          <div className={`mt-10 rounded-[28px] border p-6 ${theme.sectionPanel}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className={`text-2xl font-bold ${theme.heading}`}>Filters</h2>
                <p className={`mt-2 ${theme.text}`}>
                  Search applicants, focus on specific document types, and isolate risky score bands.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    applicantName: '',
                    documentType: '',
                    status: '',
                    scoreRange: '',
                  })
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold ${theme.secondaryButton}`}
              >
                Reset filters
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${theme.text}`}>Applicant name</span>
                <input
                  value={filters.applicantName}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, applicantName: event.target.value }))
                  }
                  placeholder="Search applicant"
                  className={`w-full rounded-2xl border px-4 py-3 ${theme.input}`}
                />
              </label>
              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${theme.text}`}>Document type</span>
                <select
                  value={filters.documentType}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, documentType: event.target.value }))
                  }
                  className={`w-full rounded-2xl border px-4 py-3 ${theme.input}`}
                >
                  <option value="">All document types</option>
                  <option value="passport">Passport / ID Card</option>
                  <option value="diploma">Diploma</option>
                  <option value="certificate">Qualification certificate</option>
                  <option value="work_experience">Work experience</option>
                  <option value="license">Medical license / permission</option>
                  <option value="recommendation">Recommendation letter</option>
                </select>
              </label>
              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${theme.text}`}>Status</span>
                <select
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, status: event.target.value }))
                  }
                  className={`w-full rounded-2xl border px-4 py-3 ${theme.input}`}
                >
                  <option value="">All statuses</option>
                  <option value="Pending review">Pending review</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Suspicious">Suspicious</option>
                </select>
              </label>
              <label className="block">
                <span className={`mb-2 block text-sm font-semibold ${theme.text}`}>Score range</span>
                <select
                  value={filters.scoreRange}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, scoreRange: event.target.value }))
                  }
                  className={`w-full rounded-2xl border px-4 py-3 ${theme.input}`}
                >
                  <option value="">All scores</option>
                  <option value="0">0 only</option>
                  <option value="1-10">1 - 10</option>
                  <option value="11-20">11 - 20</option>
                  <option value="21+">21+</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-10 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div className={`rounded-[28px] border p-6 ${theme.card}`}>
              <h2 className={`text-2xl font-bold ${theme.heading}`}>Uploaded Documents</h2>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className={theme.muted}>
                    <tr>
                      <th className="pb-3 pr-4">Applicant</th>
                      <th className="pb-3 pr-4">Applicant ID</th>
                      <th className="pb-3 pr-4">Document type</th>
                      <th className="pb-3 pr-4">Series number</th>
                      <th className="pb-3 pr-4">File</th>
                      <th className="pb-3 pr-4">Submitted details</th>
                      <th className="pb-3 pr-4">Upload date</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Score</th>
                      <th className="pb-3 pr-4">Message</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.length === 0 ? (
                      <tr>
                        <td colSpan="10" className={`py-6 ${theme.muted}`}>
                          No documents match the current filter set.
                        </td>
                      </tr>
                    ) : (
                      filteredDocuments.map((document) => (
                        <tr key={document.id} className="border-t border-slate-200/60 align-top">
                          <td className={`py-4 pr-4 ${theme.text}`}>{document.applicantName}</td>
                          <td className={`py-4 pr-4 ${theme.text}`}>{document.applicantId}</td>
                          <td className={`py-4 pr-4 ${theme.text}`}>{document.documentName}</td>
                          <td className={`py-4 pr-4 ${theme.text}`}>{document.seriesNumber || '-'}</td>
                          <td className={`py-4 pr-4 ${theme.text}`}>{document.uploadedFileName || '-'}</td>
                          <td className="py-4 pr-4">{renderSubmittedDetails(document, theme)}</td>
                          <td className={`py-4 pr-4 ${theme.text}`}>
                            {document.uploadDate ? new Date(document.uploadDate).toLocaleString() : '-'}
                          </td>
                          <td className="py-4 pr-4">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                statusStyles[document.status] || statusStyles['Not submitted']
                              }`}
                            >
                              {document.status}
                            </span>
                          </td>
                          <td className={`py-4 pr-4 font-semibold ${theme.text}`}>{document.score}</td>
                          <td className={`py-4 pr-4 ${theme.text}`}>{document.verificationMessage}</td>
                          <td className="py-4">
                            <div className="min-w-[240px] space-y-3">
                              <textarea
                                rows="3"
                                value={rowNotes[document.id] || ''}
                                onChange={(event) =>
                                  setRowNotes((current) => ({
                                    ...current,
                                    [document.id]: event.target.value,
                                  }))
                                }
                                placeholder="Add review note or rejection reason"
                                className={`w-full rounded-2xl border px-3 py-2 text-sm ${theme.input}`}
                              />
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  disabled={!document.fileUrl}
                                  onClick={() => window.open(`http://localhost:5000${document.fileUrl}`, '_blank')}
                                  className={`rounded-full px-3 py-2 text-xs font-semibold ${theme.secondaryButton} disabled:opacity-50`}
                                >
                                  View document
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(document, 'Verified')}
                                  className="rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-white"
                                >
                                  Verify
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(document, 'Rejected')}
                                  className="rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white"
                                >
                                  Reject
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(document, 'Suspicious')}
                                  className="rounded-full bg-orange-500 px-3 py-2 text-xs font-semibold text-white"
                                >
                                  Mark suspicious
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddNote(document)}
                                  className="rounded-full bg-sky-600 px-3 py-2 text-xs font-semibold text-white"
                                >
                                  Add review note
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-8">
              <div className={`rounded-[28px] border p-6 ${theme.card}`}>
                <h2 className={`text-2xl font-bold ${theme.heading}`}>Applicant Progress View</h2>
                <div className="mt-5 space-y-4">
                  {applicantProgress.length === 0 ? (
                    <p className={theme.muted}>No applicant document data available yet.</p>
                  ) : (
                    applicantProgress.map((entry) => (
                      <div key={entry.applicantId} className={`rounded-[22px] border p-4 ${theme.softCard}`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className={`text-lg font-bold ${theme.heading}`}>{entry.applicantName}</p>
                            <p className={`mt-1 text-sm ${theme.text}`}>
                              Total score: {entry.totalScore}/100
                            </p>
                          </div>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              entry.overallStatus === 'Ready for review'
                                ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                                : entry.overallStatus === 'Not eligible'
                                  ? 'border-rose-200 bg-rose-100 text-rose-700'
                                  : 'border-amber-200 bg-amber-100 text-amber-700'
                            }`}
                          >
                            {entry.overallStatus}
                          </span>
                        </div>
                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-sky-500 transition-all"
                            style={{ width: `${entry.progress}%` }}
                          />
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <p className={`text-sm ${theme.text}`}>Verification progress: {entry.progress}%</p>
                          <p className={`text-sm ${theme.text}`}>Verified: {entry.verifiedCount}</p>
                          <p className={`text-sm ${theme.text}`}>Pending: {entry.pendingCount}</p>
                          <p className={`text-sm ${theme.text}`}>Rejected: {entry.rejectedCount}</p>
                          <p className={`text-sm ${theme.text}`}>Suspicious: {entry.suspiciousCount}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={`rounded-[28px] border p-6 ${theme.card}`}>
                <h2 className={`text-2xl font-bold ${theme.heading}`}>Audit Log</h2>
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className={theme.muted}>
                      <tr>
                        <th className="pb-3 pr-4">Time</th>
                        <th className="pb-3 pr-4">Admin</th>
                        <th className="pb-3 pr-4">Applicant</th>
                        <th className="pb-3 pr-4">Document</th>
                        <th className="pb-3 pr-4">Action</th>
                        <th className="pb-3 pr-4">Status change</th>
                        <th className="pb-3 pr-4">Score change</th>
                        <th className="pb-3">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLog.length === 0 ? (
                        <tr>
                          <td colSpan="8" className={`py-6 ${theme.muted}`}>
                            No audit log entries yet.
                          </td>
                        </tr>
                      ) : (
                        auditLog.map((entry, index) => (
                          <tr key={`${entry.timestamp}-${index}`} className="border-t border-slate-200/60">
                            <td className={`py-4 pr-4 ${theme.text}`}>
                              {new Date(entry.timestamp).toLocaleString()}
                            </td>
                            <td className={`py-4 pr-4 ${theme.text}`}>{entry.adminName}</td>
                            <td className={`py-4 pr-4 ${theme.text}`}>{entry.applicantName}</td>
                            <td className={`py-4 pr-4 ${theme.text}`}>{entry.documentType}</td>
                            <td className={`py-4 pr-4 ${theme.text}`}>{entry.action}</td>
                            <td className={`py-4 pr-4 ${theme.text}`}>
                              {entry.previousStatus} -> {entry.newStatus}
                            </td>
                            <td className={`py-4 pr-4 ${theme.text}`}>{entry.scoreChange}</td>
                            <td className={`py-4 ${theme.text}`}>{entry.reviewNote || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDocumentReview;
