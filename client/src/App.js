import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AboutUs from './pages/AboutUs';
import Feedback from './pages/Feedback';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vacancies from './pages/Vacancies';
import PositionsList from './pages/PositionsList';
import ApplicationForm from './pages/ApplicationForm';
import DocumentVerificationCenter from './pages/DocumentVerificationCenter';
import AdminDocumentReview from './pages/AdminDocumentReview';
import { ThemeContext } from './ThemeContext';
import { getThemeClasses } from './themeStyles';
import './App.css';

function App() {
  const { darkMode } = useContext(ThemeContext);
  const theme = getThemeClasses(darkMode);

  return (
    <Router>
      <div className={theme.appFrame}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vacancies" element={<Vacancies />} />
          <Route path="/documents" element={<DocumentVerificationCenter />} />
          <Route path="/admin/documents" element={<AdminDocumentReview />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/positions/:categoryId" element={<PositionsList />} />
          <Route path="/application/:categoryId/:position" element={<ApplicationForm />} />
          <Route path="/apply/:id" element={<ApplicationForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
