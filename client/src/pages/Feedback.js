import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import { getThemeClasses } from '../themeStyles';

const Feedback = () => {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const theme = getThemeClasses(darkMode);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={`${theme.page} py-12`}>
      <div className="container mx-auto px-4">
        <div className={`mx-auto max-w-3xl rounded-[30px] border p-10 ${theme.card}`}>
          <h1 className={`mb-4 text-4xl font-bold ${theme.heading}`}>{t('feedback')}</h1>
          <p className={`mb-8 ${theme.text}`}>{t('feedbackText')}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`mb-2 block text-sm font-semibold ${theme.text}`}>{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full rounded-2xl border px-4 py-3 outline-none ${theme.input}`}
                placeholder={t('emailPlaceholder')}
              />
            </div>

            <div>
              <label className={`mb-2 block text-sm font-semibold ${theme.text}`}>{t('phone')}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={`w-full rounded-2xl border px-4 py-3 outline-none ${theme.input}`}
                placeholder={t('phonePlaceholder')}
              />
            </div>

            <div>
              <label className={`mb-2 block text-sm font-semibold ${theme.text}`}>{t('yourFeedback')}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className={`w-full rounded-2xl border px-4 py-3 outline-none ${theme.input}`}
                placeholder={t('feedbackPlaceholder')}
              />
            </div>

            <button
              type="submit"
              className="inline-flex rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              {t('submit')}
            </button>
          </form>

          {submitted && (
            <div className={`mt-8 rounded-[20px] border p-5 ${theme.softCard}`}>
              <p className="font-semibold">{t('feedbackThanks')}</p>
              <p className="mt-2 text-sm">{t('messageSentTo')}</p>
              <p className={`mt-1 font-medium ${theme.highlight}`}>imanovalaura05@gmail.com</p>
            </div>
          )}

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

export default Feedback;
