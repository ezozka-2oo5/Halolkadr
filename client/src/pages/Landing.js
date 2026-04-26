import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../ThemeContext';
import { getThemeClasses } from '../themeStyles';
import medicalSearchIcon from '../assets/medical-search-icon.svg';

export const sections = [
  {
    id: 'clinical',
    titleKey: 'section_clinical_title',
    subtitleKey: 'section_clinical_subtitle',
    positions: [
      'position_therapist',
      'position_surgeon',
      'position_pediatrician',
      'position_dentist',
      'position_nurse',
      'position_feldsher',
      'position_lab_technician',
      'position_radiologist',
      'position_anesthesiology_assistant',
      'position_resuscitation_specialist',
    ],
  },
  {
    id: 'technical',
    titleKey: 'section_technical_title',
    subtitleKey: 'section_technical_subtitle',
    positions: [
      'position_biomedical_engineer',
      'position_medical_device_technician',
      'position_radiology_technician',
      'position_mri_ct_operator',
      'position_calibration_engineer',
      'position_it_support',
    ],
  },
  {
    id: 'administrative',
    titleKey: 'section_administrative_title',
    subtitleKey: 'section_administrative_subtitle',
    positions: [
      'position_registrar',
      'position_hr_specialist',
      'position_administrator',
      'position_call_center_operator',
      'position_accountant',
    ],
  },
  {
    id: 'auxiliary',
    titleKey: 'section_auxiliary_title',
    subtitleKey: 'section_auxiliary_subtitle',
    positions: [
      'position_cleaner',
      'position_sanitarka',
      'position_kitchen_staff',
      'position_security_guard',
      'position_maintenance_technician',
    ],
  },
  {
    id: 'special',
    titleKey: 'section_special_title',
    subtitleKey: 'section_special_subtitle',
    positions: [
      'position_ambulance_staff',
      'position_dispatcher',
      'position_pharmacist',
      'position_psychologist',
      'position_rehabilitation_specialist',
    ],
  },
  {
    id: 'internship',
    titleKey: 'section_internship_title',
    subtitleKey: 'section_internship_subtitle',
    positions: [
      'position_medical_student',
      'position_internship_trainee',
      'position_recent_graduate',
    ],
  },
];

const TopNavIcon = ({ type }) => {
  const commonProps = {
    className: 'h-4 w-4 text-sky-500',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    viewBox: '0 0 24 24',
  };

  if (type === 'about') {
    return (
      <svg {...commonProps}>
        <path d="M4 19.5h12.5a2.5 2.5 0 0 1 2.5 2.5V6.5A2.5 2.5 0 0 0 16.5 4H4z" />
        <path d="M4 4h12.5A2.5 2.5 0 0 1 19 6.5v.5H6.5A2.5 2.5 0 0 0 4 9.5z" />
        <path d="M8 11h6" />
        <path d="M8 15h4" />
      </svg>
    );
  }

  if (type === 'feedback') {
    return (
      <svg {...commonProps}>
        <path d="M4.5 6.5A2.5 2.5 0 0 1 7 4h10a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 17 15H11l-4.5 4v-4H7A2.5 2.5 0 0 1 4.5 12.5z" />
        <path d="M8 8.5h8" />
        <path d="M8 11.5h5" />
      </svg>
    );
  }

  if (type === 'search') {
    return (
      <svg {...commonProps}>
        <circle cx="11" cy="11" r="5.5" />
        <path d="M16 16l3.5 3.5" />
      </svg>
    );
  }

  if (type === 'language') {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="8" />
        <path d="M4 12h16" />
        <path d="M12 4c2.5 2.4 4 5.1 4 8s-1.5 5.6-4 8c-2.5-2.4-4-5.1-4-8s1.5-5.6 4-8z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M12 3.5v2.2" />
      <path d="M12 18.3v2.2" />
      <path d="M5.6 5.6l1.6 1.6" />
      <path d="M16.8 16.8l1.6 1.6" />
      <path d="M3.5 12h2.2" />
      <path d="M18.3 12h2.2" />
      <path d="M5.6 18.4l1.6-1.6" />
      <path d="M16.8 7.2l1.6-1.6" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
};

const Landing = () => {
  const { t, i18n } = useTranslation();
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const theme = getThemeClasses(darkMode);
  const storedUser = localStorage.getItem('user');
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = ['admin', 'hospital_admin', 'super_admin'].includes(parsedUser?.role);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setShowLanguageMenu(false);
  };

  const selectTheme = (mode) => {
    setDarkMode(mode === 'dark');
    setShowThemeMenu(false);
  };

  const allPositions = sections.flatMap((section) =>
    section.positions.map((position) => ({
      sectionId: section.id,
      sectionTitleKey: section.titleKey,
      positionKey: position,
    }))
  );

  const searchResults = searchQuery.trim()
    ? allPositions.filter((item) =>
        t(item.positionKey).toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : [];

  return (
    <div className={theme.page}>
      <div className={theme.shell}>
        <div className="sticky top-0 z-50 w-full border-b border-sky-300/60 bg-sky-500/95 py-4 shadow-lg shadow-sky-900/10 backdrop-blur">
          <div className="container mx-auto px-4">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3">
              <div className="flex flex-wrap justify-center gap-2">
                <Link
                  to="/about"
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${theme.navButton}`}
                >
                  <TopNavIcon type="about" />
                  {t('about')}
                </Link>
                <Link
                  to="/documents"
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${theme.navButton}`}
                >
                  <TopNavIcon type="search" />
                  Documents
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/documents"
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${theme.navButton}`}
                  >
                    <TopNavIcon type="feedback" />
                    Admin Review
                  </Link>
                )}
                <Link
                  to="/feedback"
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${theme.navButton}`}
                >
                  <TopNavIcon type="feedback" />
                  {t('feedback')}
                </Link>
                <button
                  onClick={() => {
                    setSearchOpen((open) => !open);
                    setSearchQuery('');
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${theme.navButton}`}
                >
                  <TopNavIcon type="search" />
                  {t('search')}
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowLanguageMenu((open) => !open);
                      setShowThemeMenu(false);
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${theme.navButton}`}
                  >
                    <TopNavIcon type="language" />
                    {t('language')}
                  </button>
                  {showLanguageMenu && (
                    <div className={`absolute right-0 z-[60] mt-2 w-32 rounded-2xl border p-2 ${theme.menu}`}>
                      <button
                        onClick={() => changeLanguage('en')}
                        className={`block w-full rounded-lg px-3 py-2 text-left ${theme.menuItem}`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => changeLanguage('uz')}
                        className={`block w-full rounded-lg px-3 py-2 text-left ${theme.menuItem}`}
                      >
                        UZ
                      </button>
                      <button
                        onClick={() => changeLanguage('ru')}
                        className={`block w-full rounded-lg px-3 py-2 text-left ${theme.menuItem}`}
                      >
                        RU
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      setShowThemeMenu((open) => !open);
                      setShowLanguageMenu(false);
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${theme.navButton}`}
                  >
                    <TopNavIcon type="theme" />
                    {t('theme')}
                  </button>
                  {showThemeMenu && (
                    <div className={`absolute right-0 z-[60] mt-2 w-36 rounded-2xl border p-2 ${theme.menu}`}>
                      <button
                        onClick={() => selectTheme('light')}
                        className={`block w-full rounded-lg px-3 py-2 text-left ${theme.menuItem} ${
                          !darkMode ? theme.menuItemActive : ''
                        }`}
                      >
                        {t('lightMode')}
                      </button>
                      <button
                        onClick={() => selectTheme('dark')}
                        className={`block w-full rounded-lg px-3 py-2 text-left ${theme.menuItem} ${
                          darkMode ? theme.menuItemActive : ''
                        }`}
                      >
                        {t('darkMode')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {!searchOpen && (
          <header className="container mx-auto px-4 pb-8">
            <div className={`mx-auto max-w-4xl rounded-[40px] border p-12 ${theme.card}`}>
              <div className="text-center">
                <span className="mb-4 inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-sky-700">
                  HalolKadr
                </span>
                <div className="mb-4 flex items-center justify-center gap-4">
                  <div className="hero-emblem-stage">
                    <img
                      src={medicalSearchIcon}
                      alt="Medical icon"
                      className="hero-emblem-image object-contain"
                    />
                  </div>
                  <h1 className={`text-4xl font-bold sm:text-5xl ${theme.heading}`}>HalolKadr</h1>
                </div>
                <p className={`mx-auto max-w-2xl text-lg ${theme.text}`}>{t('heroDescription')}</p>
              </div>
            </div>
          </header>
        )}

        {searchOpen && (
          <section className="container mx-auto px-4 pb-8">
            <div className={`mx-auto max-w-4xl rounded-[30px] border p-6 ${theme.card}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className={`text-2xl font-bold ${theme.heading}`}>{t('searchHeader')}</h2>
                  <p className={theme.muted}>{t('searchHint')}</p>
                </div>
                <div className="flex-1">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className={`w-full rounded-2xl border px-4 py-3 outline-none ${theme.input}`}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {searchQuery.trim() ? (
                  searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <div
                        key={`${result.sectionId}-${result.positionKey}`}
                        className={`rounded-[20px] border p-4 ${theme.softCard}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className={`text-sm font-semibold ${theme.highlight}`}>
                            {t(result.sectionTitleKey)}
                          </span>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.chip}`}
                          >
                            {t(result.positionKey)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`rounded-[20px] border p-4 ${theme.subtleSurface}`}>
                      {t('searchNoResults')}
                    </div>
                  )
                ) : (
                  <div className={`rounded-[20px] border p-4 ${theme.subtleSurface}`}>
                    {t('searchEmpty')} <span className="font-semibold">st</span> /{' '}
                    <span className="font-semibold">pe</span>.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <main className="container mx-auto px-4 pb-16">
          <div className={`mx-auto max-w-6xl rounded-[30px] border-2 p-6 ${theme.sectionPanel}`}>
            <div className="mb-6 text-center">
              <h2 className={`text-2xl font-bold ${theme.heading}`}>{t('sectionTitle')}</h2>
              <p className={theme.muted}>{t('sectionDescription')}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sections.map((section) => (
                <Link
                  key={section.id}
                  to={`/positions/${section.id}`}
                  className={`rounded-[22px] border-2 p-5 ${theme.interactiveCard}`}
                >
                  <div className="min-h-[120px]">
                    <h3 className={`text-lg font-semibold ${theme.heading}`}>{t(section.titleKey)}</h3>
                    <p className={`mt-2 text-sm ${theme.muted}`}>{t(section.subtitleKey)}</p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button className="inline-flex items-center justify-center rounded-full border border-sky-400 bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-500 hover:bg-sky-600">
                      {t('viewVacancies')}
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Landing;
