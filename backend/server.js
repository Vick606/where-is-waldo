const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api', apiRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});