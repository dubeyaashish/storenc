// server/app.js
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '.env')
});

const express    = require('express');
const bodyParser = require('body-parser');
const cors       = require('cors');
const authRoutes     = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth',      authRoutes);
app.use('/api/documents', documentRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
