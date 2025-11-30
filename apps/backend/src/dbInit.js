const { sequelize } = require('./models');

async function syncDatabase() {
  await sequelize.sync({ alter: true });
  console.log('Database synced');
}

module.exports = { syncDatabase };