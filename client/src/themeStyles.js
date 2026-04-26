export const getThemeClasses = (darkMode) => ({
  appFrame: darkMode
    ? 'min-h-screen bg-slate-950 text-slate-100 transition-colors duration-300'
    : 'min-h-screen bg-sky-50 text-slate-900 transition-colors duration-300',
  page: darkMode
    ? 'min-h-screen bg-slate-950 text-slate-100 transition-colors duration-300'
    : 'min-h-screen bg-sky-50 text-slate-900 transition-colors duration-300',
  shell: darkMode
    ? 'min-h-screen bg-slate-950/80 transition-colors duration-300'
    : 'min-h-screen bg-white/95 transition-colors duration-300',
  card: darkMode
    ? 'border-slate-700 bg-slate-900 text-slate-100 shadow-lg shadow-black/20 transition-colors duration-300'
    : 'border-sky-200 bg-white text-slate-900 shadow-lg shadow-sky-100 transition-colors duration-300',
  softCard: darkMode
    ? 'border-slate-700 bg-slate-800/80 text-slate-100 transition-colors duration-300'
    : 'border-sky-200 bg-sky-50 text-slate-800 transition-colors duration-300',
  sectionPanel: darkMode
    ? 'border-slate-700 bg-slate-900/70 shadow-sm shadow-black/20 transition-colors duration-300'
    : 'border-sky-200 bg-sky-50 shadow-sm shadow-sky-100 transition-colors duration-300',
  interactiveCard: darkMode
    ? 'border-slate-700 bg-slate-900 text-slate-100 shadow-lg shadow-black/20 transition hover:border-sky-500 hover:shadow-slate-950/70'
    : 'border-sky-200 bg-white text-slate-900 shadow-lg shadow-sky-100 transition hover:border-sky-400 hover:shadow-sky-200',
  input: darkMode
    ? 'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-900/40 transition-colors duration-300'
    : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-colors duration-300',
  navButton: darkMode
    ? 'border-slate-600 bg-slate-900/90 text-slate-100 hover:bg-slate-800 transition-colors duration-300'
    : 'border-white bg-white text-slate-900 hover:bg-slate-100 transition-colors duration-300',
  menu: darkMode
    ? 'border-slate-700 bg-slate-900 text-slate-100 shadow-lg shadow-black/30 transition-colors duration-300'
    : 'border-sky-200 bg-white text-slate-900 shadow-lg shadow-sky-100 transition-colors duration-300',
  menuItem: darkMode
    ? 'text-slate-100 hover:bg-slate-800 transition-colors duration-300'
    : 'text-slate-900 hover:bg-sky-100 transition-colors duration-300',
  menuItemActive: darkMode
    ? 'bg-slate-800 text-sky-300'
    : 'bg-sky-100 text-sky-700',
  heading: darkMode ? 'text-white' : 'text-slate-900',
  text: darkMode ? 'text-slate-200' : 'text-slate-800',
  muted: darkMode ? 'text-slate-400' : 'text-slate-600',
  backLink: darkMode
    ? 'text-sky-300 hover:text-sky-200'
    : 'text-sky-600 hover:text-sky-700',
  chip: darkMode
    ? 'border-slate-600 bg-slate-800 text-slate-100 transition-colors duration-300'
    : 'border-slate-200 bg-white text-slate-900 transition-colors duration-300',
  highlight: darkMode ? 'text-sky-300' : 'text-sky-600',
  secondaryButton: darkMode
    ? 'bg-slate-700 text-slate-100 hover:bg-slate-600 transition-colors duration-300'
    : 'bg-slate-200 text-slate-900 hover:bg-slate-300 transition-colors duration-300',
  subtleSurface: darkMode
    ? 'border-slate-700 bg-slate-800/60 text-slate-300 transition-colors duration-300'
    : 'border-slate-200 bg-slate-50 text-slate-700 transition-colors duration-300',
  plainCard: darkMode
    ? 'bg-slate-900 text-slate-100 shadow transition-colors duration-300'
    : 'bg-white text-slate-900 shadow transition-colors duration-300',
});
