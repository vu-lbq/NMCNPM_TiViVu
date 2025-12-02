const { sequelize } = require('./models');

async function syncDatabase() {
  await sequelize.sync({ alter: true });
  console.log('Database synced');
}

if (require.main === module) {
  (async () => {
    try {
      await syncDatabase();
      process.exit(0);
    } catch (err) {
      console.error('Database sync failed:', err);
      process.exit(1);
    }
  })();
}

module.exports = { syncDatabase };