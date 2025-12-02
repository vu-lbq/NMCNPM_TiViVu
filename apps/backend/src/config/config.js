// Sequelize CLI configuration (JS version)
// This file exports an object keyed by environment names.
// The CLI will read this when running migrations/seeders.

module.exports = {
  development: {
    username: 'postgres',
    password: 'postgres',
    database: 'TiViVu',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres'
  },
  test: {
    username: 'postgres',
    password: 'postgres',
    database: 'TiViVu',
    host: 'localhost',
    dialect: 'postgres'
  },
  production: {
    username: 'rblhyqcf',
    password: 'haKazCS8aT2PDdTfDDVouEDUeo5x_Q9B',
    database: 'TiViVu',
    host: 'mahmud.db.elephantsql.com',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
