"use strict";
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Conversation, { foreignKey: 'userId' });
      User.hasMany(models.Message, { foreignKey: 'userId' });
    }
  }

  User.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    username: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    displayName: { type: DataTypes.STRING(128) }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users'
  });

  return User;
};