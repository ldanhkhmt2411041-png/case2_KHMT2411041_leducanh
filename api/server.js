const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./src/routes/authRoutes'));

app.get('/', (req, res) => {
  res.send('API TaskManager dang hoat dong!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server dang chay tai cong ${PORT}`);
});
