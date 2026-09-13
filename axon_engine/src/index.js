require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Headless Engine Express running on http://localhost:${PORT}`);
});

module.exports = app;
