// Sequelize CLI configuration (JS version)
// This file exports an object keyed by environment names.
// The CLI will read this when running migrations/seeders.

module.exports = {
  development: {
    username: 'postgres',
    password: 'postgres',
    database: 'TiViVu', // change to 'tivivu_dev' if desired
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
};{
  "development": {
    "username": "root",
    "password": null,
    "database": "database_development",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
