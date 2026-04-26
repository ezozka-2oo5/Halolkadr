import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import { getThemeClasses } from '../themeStyles';

const Dashboard = () => {
  const { darkMode } = useContext(ThemeContext);
  const theme = getThemeClasses(darkMode);
  const storedUser = localStorage.getItem('user');
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = ['admin', 'hospital_admin', 'super_admin'].includes(parsedUser?.role);

  return (
    <div className={theme.page}>
      <div className="container mx-auto px-4 py-8">
        <div className={`rounded-[28px] border p-8 ${theme.card}`}>
          <h2 className={`mb-4 text-2xl font-bold ${theme.heading}`}>Dashboard</h2>
          <div className={`grid grid-cols-1 gap-4 ${isAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            <Link to="/vacancies" className="rounded-2xl bg-blue-500 p-4 text-white">
              View Vacancies
            </Link>
            <Link to="/documents" className="rounded-2xl bg-sky-600 p-4 text-white">
              Document Verification
            </Link>
            {isAdmin && (
              <Link to="/admin/documents" className="rounded-2xl bg-emerald-600 p-4 text-white">
                Admin Document Review
              </Link>
            )}
            <div className="rounded-2xl bg-green-500 p-4 text-white">My Applications</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
