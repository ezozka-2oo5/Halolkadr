import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sections } from './Landing';
import { ThemeContext } from '../ThemeContext';
import { getThemeClasses } from '../themeStyles';

const PositionsList = () => {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const theme = getThemeClasses(darkMode);
  const { categoryId } = useParams();
  const section = sections.find((s) => s.id === categoryId);

  if (!section) {
    return (
      <div className={theme.page}>
        <div className="container mx-auto px-4 py-12">
          <p className={`text-center text-xl ${theme.muted}`}>{t('sectionNotFound')}</p>
          <div className="mt-6 text-center">
            <Link to="/" className={`font-semibold ${theme.backLink}`}>
              {t('backHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={theme.page}>
      <div className={theme.shell}>
        <header className="container mx-auto px-4 pb-6 pt-8">
          <Link
            to="/"
            className={`mb-4 inline-flex items-center gap-2 font-semibold ${theme.backLink}`}
          >
            <span aria-hidden="true">{'<-'}</span>
            {t('back')}
          </Link>
          <div className={`rounded-[32px] border p-8 ${theme.card}`}>
            <h1 className={`mb-2 text-4xl font-bold ${theme.heading}`}>{t(section.titleKey)}</h1>
            <p className={`text-lg ${theme.muted}`}>{t(section.subtitleKey)}</p>
          </div>
        </header>

        <main className="container mx-auto px-4 pb-16">
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.positions.map((positionKey) => (
              <Link
                key={positionKey}
                to={`/application/${categoryId}/${encodeURIComponent(positionKey)}`}
                className={`rounded-[28px] border p-6 ${theme.interactiveCard}`}
              >
                <h3 className={`mb-4 text-xl font-bold ${theme.heading}`}>{t(positionKey)}</h3>
                <button className="inline-flex items-center rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-sky-600">
                  {t('apply')}
                </button>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PositionsList;
