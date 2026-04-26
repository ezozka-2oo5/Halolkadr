import { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import { getThemeClasses } from '../themeStyles';

const Login = () => {
  const [form, setForm] = useState({});
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);
  const theme = getThemeClasses(darkMode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className={theme.page}>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className={`rounded-[28px] border p-8 ${theme.card}`}>
          <h2 className={`mb-4 text-2xl font-bold ${theme.heading}`}>Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full rounded-2xl border px-4 py-3 ${theme.input}`}
              required
            />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full rounded-2xl border px-4 py-3 ${theme.input}`}
              required
            />
            <button type="submit" className="rounded-full bg-blue-600 px-5 py-2.5 text-white">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
