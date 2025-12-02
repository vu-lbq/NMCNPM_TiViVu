require('dotenv').config();

const app = require('./src/app');
const PORT = process.env.PORT || 3000;
const { syncDatabase } = require('./src/dbInit');

(async () => {
  try {
    await syncDatabase();
  } catch (err) {
    console.error('DB sync failed:', err.message);
  }
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();

