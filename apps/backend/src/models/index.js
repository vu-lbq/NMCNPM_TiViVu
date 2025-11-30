"use strict";
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const models = {};

models.User = require('./User')(sequelize, DataTypes);
models.Conversation = require('./Conversation')(sequelize, DataTypes);
models.Message = require('./Message')(sequelize, DataTypes);

// Run associate methods defined on each model
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};