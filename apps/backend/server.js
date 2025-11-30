require('dotenv').config();

const app = require('./src/app');
const PORT = process.env.PORT || 3000;
const { syncDatabase } = require('./src/dbInit');

syncDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to sync database:', err);
  process.exit(1);
});

