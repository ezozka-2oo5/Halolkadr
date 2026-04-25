const express = require("express");
const cors = require("cors");
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vacancies', require('./routes/vacancies'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/complaints', require('./routes/complaints'));

app.get("/", (req, res) => {
  res.send("MedHire API ishlayapti 🚀");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} portda ishlayapti`);
});