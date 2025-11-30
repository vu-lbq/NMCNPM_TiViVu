const { Sequelize } = require('sequelize');
const path = require('path');
const config = require('./config.json');

const env = process.env.NODE_ENV || 'development';
const cfg = config[env];

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: cfg && cfg.dialectOptions ? cfg.dialectOptions : undefined
  });
} else {
  sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, {
    host: cfg.host,
    port: cfg.port || 5432,
    dialect: cfg.dialect,
    logging: false,
    dialectOptions: cfg.dialectOptions
  });
}

module.exports = { sequelize };