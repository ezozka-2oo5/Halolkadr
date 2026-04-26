import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../ThemeContext';
import { getThemeClasses } from '../themeStyles';
import {
  loadAdminReviewDocuments,
  saveAdminReviewDocuments,
} from '../utils/adminDocumentReviewStore';
import { getDocumentLabel } from '../utils/documentReviewConfig';
import testSlingA from '../assets/test-sling-a.svg';
import testSlingB from '../assets/test-sling-b.svg';
import testSlingC from '../assets/test-sling-c.svg';
import testSlingD from '../assets/test-sling-d.svg';

const regionsData = {
  andijan: {
    name: 'Andijon viloyati',
    aliases: ['andijan', 'andijon'],
    districts: [
      'Andijon shahri',
      'Xonobod shahri',
      'Andijon tumani',
      'Asaka',
      'Baliqchi',
      'Bo\'ston',
      'Buloqboshi',
      'Izboskan',
      'Jalaquduq',
      'Xo\'jaobod',
      'Qo\'rg\'ontepa',
      'Marhamat',
      'Oltinko\'l',
      'Paxtaobod',
      'Shahrixon',
      'Ulug\'nor',
    ],
  },
  bukhara: {
    name: 'Buxoro viloyati',
    aliases: ['bukhara', 'buxoro'],
    districts: [
      'Buxoro shahri',
      'Kogon shahri',
      'Olot',
      'Buxoro tumani',
      'G\'ijduvon',
      'Jondor',
      'Kogon tumani',
      'Qorako\'l',
      'Qorovulbozor',
      'Peshku',
      'Romitan',
      'Shofirkon',
      'Vobkent',
    ],
  },
  fergana: {
    name: 'Farg\'ona viloyati',
    aliases: ['fergana', 'fargona', 'farg\'ona'],
    districts: [
      'Farg\'ona shahri',
      'Qo\'qon shahri',
      'Marg\'ilon shahri',
      'Quvasoy shahri',
      'Oltiariq',
      'Bag\'dod',
      'Beshariq',
      'Buvayda',
      'Dang\'ara',
      'Farg\'ona tumani',
      'Furqat',
      'Qo\'shtepa',
      'Quva',
      'Rishton',
      'So\'x',
      'Toshloq',
      'Uchko\'prik',
      'O\'zbekiston',
      'Yozyovon',
    ],
  },
  jizzakh: {
    name: 'Jizzax viloyati',
    aliases: ['jizzakh', 'jizzax'],
    districts: [
      'Jizzax shahri',
      'Gagarin shahri',
      'Arnasoy',
      'Baxmal',
      'Do\'stlik',
      'Forish',
      'G\'allaorol',
      'Sharof Rashidov',
      'Mirzacho\'l',
      'Paxtakor',
      'Yangiobod',
      'Zafarobod',
      'Zarbdor',
      'Zomin',
    ],
  },
  karakalpakstan: {
    name: 'Qoraqalpog\'iston Respublikasi',
    aliases: ['karakalpakstan', 'qoraqalpogiston', 'qoraqalpog\'iston', 'karakalpogiston'],
    districts: [
      'Nukus shahri',
      'Amudaryo',
      'Beruniy',
      'Bo\'zatov',
      'Kegeyli',
      'Chimboy',
      'Qonliko\'l',
      'Mo\'ynoq',
      'Nukus tumani',
      'Taxiatosh',
      'Taxtako\'pir',
      'To\'rtko\'l',
      'Xo\'jayli',
      'Shumanay',
      'Qo\'ng\'irot',
      'Qorao\'zak',
      'Ellikqal\'a',
    ],
  },
  kashkadarya: {
    name: 'Qashqadaryo viloyati',
    aliases: ['kashkadarya', 'qashqadaryo'],
    districts: [
      'Qarshi shahri',
      'Shahrisabz shahri',
      'Chiroqchi',
      'Dehqonobod',
      'G\'uzor',
      'Kasbi',
      'Kitob',
      'Koson',
      'Ko\'kdala',
      'Mirishkor',
      'Muborak',
      'Nishon',
      'Qamashi',
      'Qarshi tumani',
      'Shahrisabz tumani',
      'Yakkabog\'',
    ],
  },
  khorezm: {
    name: 'Xorazm viloyati',
    aliases: ['khorezm', 'xorazm'],
    districts: [
      'Urganch shahri',
      'Xiva shahri',
      'Pitnak shahri',
      'Bog\'ot',
      'Gurlan',
      'Xonqa',
      'Hazorasp',
      'Xiva tumani',
      'Qo\'shko\'pir',
      'Shovot',
      'Urganch tumani',
      'Yangiariq',
      'Yangibozor',
      'Tuproqqal\'a',
    ],
  },
  namangan: {
    name: 'Namangan viloyati',
    aliases: ['namangan'],
    districts: [
      'Namangan shahri',
      'Chortoq',
      'Chust',
      'Davlatobod',
      'Kosonsoy',
      'Mingbuloq',
      'Namangan tumani',
      'Norin',
      'Pop',
      'To\'raqo\'rg\'on',
      'Uchqo\'rg\'on',
      'Uychi',
      'Yangiqo\'rg\'on',
    ],
  },
  tashkent_city: {
    name: 'Toshkent shahri',
    aliases: ['tashkent city', 'tashkent shahri', 'toshkent shahri'],
    districts: [
      'Bektemir',
      'Chilonzor',
      'Mirzo Ulug\'bek',
      'Mirobod',
      'Olmazor',
      'Sergeli',
      'Shayxontohur',
      'Uchtepa',
      'Yakkasaroy',
      'Yashnobod',
      'Yunusobod',
      'Yangihayot',
    ],
  },
  navoi: {
    name: 'Navoiy viloyati',
    aliases: ['navoi', 'navoiy'],
    districts: [
      'Navoiy shahri',
      'Zarafshon shahri',
      'G\'ozg\'on shahri',
      'Karmana',
      'Konimex',
      'Qiziltepa',
      'Xatirchi',
      'Navbahor',
      'Nurota',
      'Tomdi',
      'Uchquduq',
    ],
  },
  samarkand: {
    name: 'Samarqand viloyati',
    aliases: ['samarkand', 'samarqand'],
    districts: [
      'Samarqand shahri',
      'Kattaqo\'rg\'on shahri',
      'Bulung\'ur',
      'Ishtixon',
      'Jomboy',
      'Kattaqo\'rg\'on tumani',
      'Qo\'shrabot',
      'Narpay',
      'Nurobod',
      'Oqdaryo',
      'Paxtachi',
      'Payariq',
      'Pastdarg\'om',
      'Samarqand tumani',
      'Toyloq',
      'Urgut',
    ],
  },
  surkhandarya: {
    name: 'Surxondaryo viloyati',
    aliases: ['surkhandarya', 'surxondaryo'],
    districts: [
      'Termiz shahri',
      'Angor',
      'Bandixon',
      'Boysun',
      'Denov',
      'Jarqo\'rg\'on',
      'Muzrabot',
      'Oltinsoy',
      'Sariosiyo',
      'Sherobod',
      'Sho\'rchi',
      'Termiz tumani',
      'Uzun',
      'Qiziriq',
      'Qumqo\'rg\'on',
    ],
  },
  syrdarya: {
    name: 'Sirdaryo viloyati',
    aliases: ['syrdarya', 'sirdaryo'],
    districts: [
      'Guliston shahri',
      'Shirin shahri',
      'Yangiyer shahri',
      'Baxt shahri',
      'Boyovut',
      'Guliston tumani',
      'Xovos',
      'Mirzaobod',
      'Oqoltin',
      'Sardoba',
      'Sayxunobod',
      'Sirdaryo tumani',
    ],
  },
  tashkent_region: {
    name: 'Toshkent viloyati',
    aliases: ['tashkent region', 'tashkent', 'toshkent viloyati', 'toshkent'],
    districts: [
      'Nurafshon shahri',
      'Angren shahri',
      'Olmaliq shahri',
      'Bekobod shahri',
      'Chirchiq shahri',
      'Ohangaron shahri',
      'Yangiyo\'l shahri',
      'Bekobod tumani',
      'Bo\'ka',
      'Bo\'stonliq',
      'Zangiota',
      'Yuqori Chirchiq',
      'Quyi Chirchiq',
      'Oqqo\'rg\'on',
      'Ohangaron tumani',
      'Parkent',
      'Piskent',
      'Toshkent tumani',
      'Chinoz',
      'Qibray',
      'Yangiyo\'l tumani',
      'O\'rta Chirchiq',
    ],
  },
};

const institutionGroups = [
  {
    label: 'Tibbiyot OTMlari',
    options: [
      'Toshkent davlat tibbiyot universiteti',
      'Samarqand davlat tibbiyot universiteti',
      'Buxoro davlat tibbiyot instituti',
      'Andijon davlat tibbiyot instituti',
      'Farg\'ona jamoat salomatligi tibbiyot instituti',
      'Urganch davlat tibbiyot instituti',
      'Termiz davlat tibbiyot instituti',
    ],
  },
  {
    label: 'Tibbiyot texnikumlari',
    options: [
      'Qoraqalpog\'iston Respublikasi Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Andijon Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Buxoro Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Jizzax Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Qashqadaryo Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Navoiy Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Namangan Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Samarqand Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Surxondaryo Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Sirdaryo Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Farg\'ona Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Xorazm Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Toshkent viloyati Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Sergeli Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Qo\'qon Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Urgut Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Siyob Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
      'Pastdarg\'om Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi',
    ],
  },
  {
    label: 'Maktab va litseylar',
    options: [
      'Umumiy o\'rta ta\'lim maktabi',
      'Ixtisoslashtirilgan maktab',
      'Akademik litsey',
      'Kasb-hunar maktabi',
      'Professional ta\'lim kolleji',
      'Tibbiyot yo\'nalishidagi akademik litsey',
    ],
  },
];

const getRandomVacancyCount = () => Math.floor(Math.random() * 8) + 1;
const APPLICATION_APPLICANT_ID_KEY = 'halolkadr_application_applicant_id';
const APPLICATION_TEST_SCORE_KEY = 'halolkadr_application_test_score';
const APPLICATION_TEST_ANSWER_KEY = 'halolkadr_application_test_answer';

const skillTestOptions = [
  { id: 'A', label: 'A variant', image: testSlingA },
  { id: 'B', label: 'B variant', image: testSlingB },
  { id: 'C', label: 'C variant', image: testSlingC },
  { id: 'D', label: 'D variant', image: testSlingD },
];

const correctSkillTestAnswer = 'C';

const getApplicationApplicantId = () => {
  const storedId = localStorage.getItem(APPLICATION_APPLICANT_ID_KEY);
  if (storedId) return storedId;

  const nextId = `application-${Date.now()}`;
  localStorage.setItem(APPLICATION_APPLICANT_ID_KEY, nextId);
  return nextId;
};

const ApplicationForm = () => {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const theme = getThemeClasses(darkMode);
  const { categoryId, position } = useParams();
  const decodedPosition = position ? decodeURIComponent(position) : '';

  const [locationFilter, setLocationFilter] = useState('nationwide');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [vacancyCount, setVacancyCount] = useState(0);
  const [activeDocumentForm, setActiveDocumentForm] = useState('diploma');
  const [applicantId] = useState(getApplicationApplicantId);
  const [documentReviewRecords, setDocumentReviewRecords] = useState([]);
  const [selectedTestAnswer, setSelectedTestAnswer] = useState(
    localStorage.getItem(APPLICATION_TEST_ANSWER_KEY) || ''
  );
  const [testScore, setTestScore] = useState(
    Number(localStorage.getItem(APPLICATION_TEST_SCORE_KEY) || 0)
  );
  const [diplomaDocument, setDiplomaDocument] = useState({
    seriesNumber: '',
    specialty: '',
    graduationYear: '',
    file: null,
    fileName: '',
  });
  const [certificateDocument, setCertificateDocument] = useState({
    seriesNumber: '',
    courseName: '',
    issueDate: '',
    expiryDate: '',
    file: null,
    fileName: '',
  });

  const currentDistricts = selectedRegion ? regionsData[selectedRegion]?.districts || [] : [];
  const backLink = categoryId ? `/positions/${categoryId}` : '/';
  const approvedDocumentScore = documentReviewRecords.reduce(
    (sum, document) => sum + Number(document.score || 0),
    0
  );
  const maxApplicationRating = 57;
  const applicantRating = Math.min(maxApplicationRating, approvedDocumentScore + testScore);
  const applicantRatingPercent = Math.round((applicantRating / maxApplicationRating) * 100);

  useEffect(() => {
    if (locationFilter === 'region' && selectedRegion) {
      setVacancyCount(getRandomVacancyCount());
      return;
    }

    setVacancyCount(0);
  }, [locationFilter, selectedDistrict, selectedRegion]);

  useEffect(() => {
    const refreshReviewRecords = () => {
      const records = loadAdminReviewDocuments().filter(
        (document) => String(document.applicantId) === String(applicantId)
      );
      setDocumentReviewRecords(records);
    };

    refreshReviewRecords();
    window.addEventListener('focus', refreshReviewRecords);
    return () => window.removeEventListener('focus', refreshReviewRecords);
  }, [applicantId]);

  const getReviewRecord = (documentType) =>
    documentReviewRecords.find((document) => document.documentType === documentType);

  const persistApplicationDocument = (documentType, values) => {
    const fullName = `${firstName} ${lastName}`.trim();
    const currentDocuments = loadAdminReviewDocuments();
    const existing = currentDocuments.find(
      (document) =>
        String(document.applicantId) === String(applicantId) && document.documentType === documentType
    );
    const documentChanged =
      existing &&
      (existing.seriesNumber !== values.seriesNumber || existing.uploadedFileName !== values.fileName);
    const keepManualReview = existing?.reviewedManually && !documentChanged;

    const details =
      documentType === 'diploma'
        ? {
            educationalInstitution: selectedInstitution,
            specialty: values.specialty,
            graduationYear: values.graduationYear,
          }
        : {
            courseName: values.courseName,
            issueDate: values.issueDate,
            expiryDate: values.expiryDate,
          };

    return {
      id: `${applicantId}-${documentType}`,
      applicantId,
      applicantName: fullName,
      documentType,
      documentName: getDocumentLabel(documentType),
      seriesNumber: values.seriesNumber,
      uploadedFileName: values.fileName,
      fileUrl: '',
      uploadDate: existing?.uploadDate || new Date().toISOString(),
      status: keepManualReview ? existing.status : 'Pending review',
      score: keepManualReview ? existing.score : 0,
      verificationMessage: keepManualReview
        ? existing.verificationMessage
        : 'Tekshirish jarayonida',
      reviewNote: keepManualReview ? existing.reviewNote || '' : '',
      reviewedManually: keepManualReview,
      details,
      ...details,
    };
  };

  const sendDocumentsToReview = () => {
    const currentDocuments = loadAdminReviewDocuments();
    const applicantDocumentTypes = ['diploma', 'certificate'];
    const otherDocuments = currentDocuments.filter(
      (document) =>
        String(document.applicantId) !== String(applicantId) ||
        !applicantDocumentTypes.includes(document.documentType)
    );

    const nextDocuments = [
      persistApplicationDocument('diploma', diplomaDocument),
    ];

    const hasCertificateData =
      certificateDocument.seriesNumber ||
      certificateDocument.courseName ||
      certificateDocument.issueDate ||
      certificateDocument.expiryDate ||
      certificateDocument.fileName;

    if (hasCertificateData) {
      nextDocuments.push(persistApplicationDocument('certificate', certificateDocument));
    }

    const mergedDocuments = [...otherDocuments, ...nextDocuments];
    saveAdminReviewDocuments(mergedDocuments);
    setDocumentReviewRecords(nextDocuments);
  };

  const handleSubmit = () => {
    if (
      !firstName ||
      !lastName ||
      !selectedInstitution ||
      !diplomaDocument.seriesNumber ||
      !diplomaDocument.specialty ||
      !diplomaDocument.graduationYear ||
      !diplomaDocument.fileName
    ) {
      alert(t('fillAllFields'));
      return;
    }

    const certificateStarted =
      certificateDocument.seriesNumber ||
      certificateDocument.courseName ||
      certificateDocument.issueDate ||
      certificateDocument.expiryDate ||
      certificateDocument.fileName;

    if (
      certificateStarted &&
      (!certificateDocument.seriesNumber ||
        !certificateDocument.courseName ||
        !certificateDocument.issueDate ||
        !certificateDocument.expiryDate ||
        !certificateDocument.fileName)
    ) {
      alert('Malaka oshirish sertifikati ma\'lumotlarini to\'liq kiriting.');
      return;
    }

    sendDocumentsToReview();
    alert(t('applicationSent'));
  };

  const handleTestAnswer = (answer) => {
    const nextScore = answer === correctSkillTestAnswer ? 12 : 0;
    setSelectedTestAnswer(answer);
    setTestScore(nextScore);
    localStorage.setItem(APPLICATION_TEST_ANSWER_KEY, answer);
    localStorage.setItem(APPLICATION_TEST_SCORE_KEY, String(nextScore));
  };

  const renderReviewStatus = (documentType) => {
    const record = getReviewRecord(documentType);
    if (!record) return null;

    const statusTone =
      record.status === 'Verified'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : record.status === 'Rejected'
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : record.status === 'Suspicious'
            ? 'border-orange-200 bg-orange-50 text-orange-700'
            : 'border-amber-200 bg-amber-50 text-amber-700';

    return (
      <div className={`mt-4 rounded-[20px] border p-4 ${statusTone}`}>
        <p className="font-semibold">{record.status}</p>
        <p className="mt-1 text-sm">{record.verificationMessage}</p>
        <p className="mt-2 text-sm font-semibold">Ball: {record.score || 0}</p>
      </div>
    );
  };

  return (
    <div className={theme.page}>
      <div className={theme.shell}>
        <header className="container mx-auto px-4 pb-6 pt-8">
          <Link
            to={backLink}
            className={`mb-4 inline-flex items-center gap-2 font-semibold ${theme.backLink}`}
          >
            <span aria-hidden="true">{'<-'}</span>
            {t('back')}
          </Link>
          <div className={`rounded-[32px] border p-8 ${theme.card}`}>
            <h1 className={`mb-2 text-3xl font-bold ${theme.heading}`}>{t('applicationForm')}</h1>
            <p className={`text-lg ${theme.muted}`}>
              {t('positionLabel')} {decodedPosition ? t(decodedPosition) : '-'}
            </p>
          </div>
        </header>

        <main className="container mx-auto max-w-3xl px-4 pb-16">
          <div className={`space-y-8 rounded-[32px] border p-8 ${theme.card}`}>
            <section className={`rounded-[24px] border p-5 ${theme.sectionPanel}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${theme.highlight}`}>
                    Arizachi reytingi
                  </p>
                  <h2 className={`mt-1 text-2xl font-bold ${theme.heading}`}>
                    {applicantRating}/{maxApplicationRating} ball
                  </h2>
                </div>
                <p className={`text-sm font-semibold ${theme.text}`}>{applicantRatingPercent}%</p>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${applicantRatingPercent}%` }}
                />
              </div>
              <p className={`mt-3 text-sm ${theme.muted}`}>
                Hujjatlar balli va malaka testi natijasi asosida hisoblanadi.
              </p>
            </section>

            <section>
              <h2 className={`mb-6 text-2xl font-bold ${theme.heading}`}>{t('personalInfo')}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('firstName')}
                  className={`rounded-[20px] border px-4 py-3 ${theme.input}`}
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t('lastName')}
                  className={`rounded-[20px] border px-4 py-3 ${theme.input}`}
                />
              </div>
            </section>

            <section>
              <h2 className={`mb-6 text-2xl font-bold ${theme.heading}`}>{t('workLocation')}</h2>
              <div className="space-y-4">
                <select
                  value={locationFilter === 'nationwide' ? 'nationwide' : selectedRegion}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'nationwide') {
                      setLocationFilter('nationwide');
                      setSelectedRegion('');
                      setSelectedDistrict('');
                      return;
                    }

                    setLocationFilter('region');
                    setSelectedRegion(value);
                    setSelectedDistrict('');
                  }}
                  className={`w-full rounded-[20px] border px-4 py-3 ${theme.input}`}
                >
                  <option value="">{t('selectWorkLocation')}</option>
                  <option value="nationwide">{t('nationwide')}</option>
                  {Object.entries(regionsData).map(([key, region]) => (
                    <option key={key} value={key}>
                      {region.name}
                    </option>
                    ))}
                  </select>

                  {locationFilter === 'region' && selectedRegion && currentDistricts.length > 0 && (
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className={`w-full rounded-[20px] border px-4 py-3 ${theme.input}`}
                    >
                      <option value="">{t('selectDistrict')}</option>
                      <option value="all">{t('allDistricts')}</option>
                      {currentDistricts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  )}
              </div>

              {locationFilter === 'region' && selectedRegion && (
                <div className={`mt-6 rounded-[20px] border p-4 ${theme.softCard}`}>
                  <p className={`font-semibold ${theme.heading}`}>
                    {t('availableVacancies')}:{' '}
                    <span className={`text-xl ${theme.highlight}`}>{vacancyCount}</span>
                  </p>
                </div>
              )}
            </section>

            <section>
              <h2 className={`mb-6 text-2xl font-bold ${theme.heading}`}>{t('education')}</h2>
              <select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className={`w-full rounded-[20px] border px-4 py-3 ${theme.input}`}
              >
                <option value="">{t('selectInstitution')}</option>
                {institutionGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </section>

            <section>
              <h2 className={`mb-6 text-2xl font-bold ${theme.heading}`}>{t('documents')}</h2>
              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setActiveDocumentForm('diploma')}
                  className={`rounded-[20px] border px-5 py-4 text-left font-semibold transition ${
                    activeDocumentForm === 'diploma'
                      ? 'border-sky-400 bg-sky-500 text-white shadow-lg shadow-sky-100'
                      : `${theme.softCard}`
                  }`}
                >
                  Diploma
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocumentForm('certificate')}
                  className={`rounded-[20px] border px-5 py-4 text-left font-semibold transition ${
                    activeDocumentForm === 'certificate'
                      ? 'border-sky-400 bg-sky-500 text-white shadow-lg shadow-sky-100'
                      : `${theme.softCard}`
                  }`}
                >
                  Malaka oshirish sertifikati
                </button>
              </div>

              {activeDocumentForm === 'diploma' && (
                <div className={`space-y-4 rounded-[24px] border p-5 ${theme.sectionPanel}`}>
                  <input
                    type="text"
                    value={diplomaDocument.seriesNumber}
                    onChange={(e) =>
                      setDiplomaDocument((current) => ({
                        ...current,
                        seriesNumber: e.target.value,
                      }))
                    }
                    placeholder="Diplom seriya raqami"
                    className={`w-full rounded-[20px] border px-4 py-3 ${theme.input}`}
                  />
                  <input
                    type="text"
                    value={diplomaDocument.specialty}
                    onChange={(e) =>
                      setDiplomaDocument((current) => ({
                        ...current,
                        specialty: e.target.value,
                      }))
                    }
                    placeholder="Tugatgan yo'nalishi"
                    className={`w-full rounded-[20px] border px-4 py-3 ${theme.input}`}
                  />
                  <input
                    type="number"
                    value={diplomaDocument.graduationYear}
                    onChange={(e) =>
                      setDiplomaDocument((current) => ({
                        ...current,
                        graduationYear: e.target.value,
                      }))
                    }
                    placeholder="Tugatgan yili"
                    className={`w-full rounded-[20px] border px-4 py-3 ${theme.input}`}
                  />
                  <label className={`block rounded-[20px] border px-4 py-3 ${theme.input}`}>
                    <span className="mb-2 block font-semibold">Diplom fayl yuklash</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setDiplomaDocument((current) => ({
                          ...current,
                          file,
                          fileName: file?.name || '',
                        }));
                      }}
                    />
                  </label>
                  {diplomaDocument.fileName && (
                    <p className={`text-sm font-medium ${theme.highlight}`}>
                      {t('selectedFile')}: {diplomaDocument.fileName}
                    </p>
                  )}
                  {renderReviewStatus('diploma')}
                </div>
              )}

              {activeDocumentForm === 'certificate' && (
                <div className={`space-y-4 rounded-[24px] border p-5 ${theme.sectionPanel}`}>
                  <input
                    type="text"
                    value={certificateDocument.seriesNumber}
                    onChange={(e) =>
                      setCertificateDocument((current) => ({
                        ...current,
                        seriesNumber: e.target.value,
                      }))
                    }
                    placeholder="Sertifikat raqami"
                    className={`w-full rounded-[20px] border px-4 py-3 ${theme.input}`}
                  />
                  <input
                    type="text"
                    value={certificateDocument.courseName}
                    onChange={(e) =>
                      setCertificateDocument((current) => ({
                        ...current,
                        courseName: e.target.value,
                      }))
                    }
                    placeholder="Kurs nomi"
                    className={`w-full rounded-[20px] border px-4 py-3 ${theme.input}`}
                  />
                  <input
                    type="date"
                    value={certificateDocument.issueDate}
                    onChange={(e) =>
                      setCertificateDocument((current) => ({
                        ...current,
                        issueDate: e.target.value,
                      }))
                    }
                    className={`w-full rounded-[20px] border px-4 py-3 ${theme.input}`}
                  />
                  <input
                    type="date"
                    value={certificateDocument.expiryDate}
                    onChange={(e) =>
                      setCertificateDocument((current) => ({
                        ...current,
                        expiryDate: e.target.value,
                      }))
                    }
                    className={`w-full rounded-[20px] border px-4 py-3 ${theme.input}`}
                  />
                  <label className={`block rounded-[20px] border px-4 py-3 ${theme.input}`}>
                    <span className="mb-2 block font-semibold">Sertifikat fayl yuklash</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setCertificateDocument((current) => ({
                          ...current,
                          file,
                          fileName: file?.name || '',
                        }));
                      }}
                    />
                  </label>
                  {certificateDocument.fileName && (
                    <p className={`text-sm font-medium ${theme.highlight}`}>
                      {t('selectedFile')}: {certificateDocument.fileName}
                    </p>
                  )}
                  {renderReviewStatus('certificate')}
                </div>
              )}
            </section>

            <section>
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className={`text-2xl font-bold ${theme.heading}`}>Test</h2>
                  <p className={`mt-2 ${theme.muted}`}>Arizachining amaliy malakasini baholash.</p>
                </div>
                <div className={`rounded-[18px] border px-4 py-3 ${theme.softCard}`}>
                  <p className={`text-sm font-semibold ${theme.text}`}>Test balli: {testScore}/12</p>
                </div>
              </div>

              <div className={`rounded-[24px] border p-5 ${theme.sectionPanel}`}>
                <p className={`mb-5 font-semibold ${theme.heading}`}>
                  Qo'l shikastlanganda bog'lamni to'g'ri qo'yish usulini tanlang.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {skillTestOptions.map((option) => {
                    const selected = selectedTestAnswer === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleTestAnswer(option.id)}
                        className={`overflow-hidden rounded-[20px] border text-left transition ${
                          selected
                            ? 'border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-100'
                            : `${theme.softCard}`
                        }`}
                      >
                        <img src={option.image} alt={option.label} className="h-44 w-full object-cover" />
                        <div className="flex items-center justify-between px-4 py-3">
                          <span className={`font-semibold ${selected ? 'text-emerald-700' : theme.text}`}>
                            {option.label}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-bold ${
                              selected ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {option.id}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedTestAnswer && (
                  <div
                    className={`mt-5 rounded-[20px] border p-4 ${
                      testScore === 12
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    <p className="font-semibold">
                      {testScore === 12 ? 'To\'g\'ri javob. 12 ball berildi.' : 'Javob qabul qilindi. Ball: 0/12.'}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-full bg-sky-500 px-8 py-3 text-lg font-semibold text-white transition hover:bg-sky-600"
              >
                {t('submit')}
              </button>
              <Link
                to={backLink}
                className={`flex-1 rounded-full px-8 py-3 text-center text-lg font-semibold ${theme.secondaryButton}`}
              >
                {t('cancel')}
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplicationForm;
