import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Vacancies = () => {
  const [vacancies, setVacancies] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/vacancies').then(res => setVacancies(res.data));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Vacancies</h2>
      <div className="grid gap-4">
        {vacancies.map(v => (
          <div key={v.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{v.position_title}</h3>
            <p>{v.hospital_name}</p>
            <Link to={`/apply/${v.id}`} className="bg-blue-600 text-white px-4 py-2 rounded mt-2 inline-block">Apply</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vacancies;