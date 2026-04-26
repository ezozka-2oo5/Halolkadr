import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import { getThemeClasses } from '../themeStyles';

const AboutUs = () => {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const theme = getThemeClasses(darkMode);

  return (
    <div className={`${theme.page} py-12`}>
      <div className="container mx-auto px-4">
        <div className={`mx-auto max-w-3xl rounded-[30px] border p-10 ${theme.card}`}>
          <h1 className={`mb-6 text-4xl font-bold ${theme.heading}`}>{t('about')}</h1>
          <p className={`mb-6 ${theme.text}`}>{t('aboutText')}</p>
          <ul className={`space-y-4 text-lg ${theme.text}`}>
            <li className={`rounded-2xl border px-5 py-4 ${theme.softCard}`}>Imanova Laura</li>
            <li className={`rounded-2xl border px-5 py-4 ${theme.softCard}`}>Yoqubboyeva E'zoza</li>
            <li className={`rounded-2xl border px-5 py-4 ${theme.softCard}`}>Orifqulova Malika</li>
          </ul>
          <div className="mt-8 text-center">
            <Link to="/" className="inline-flex rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600">
              {t('backHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
