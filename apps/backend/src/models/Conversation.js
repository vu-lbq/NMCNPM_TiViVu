"use strict";
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      Conversation.belongsTo(models.User, { foreignKey: 'userId' });
      Conversation.hasMany(models.Message, { foreignKey: 'conversationId' });
    }
  }

  Conversation.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING(200) },
    status: { type: DataTypes.ENUM('active','archived'), defaultValue: 'active' },
    userId: { type: DataTypes.UUID, allowNull: false }
  }, {
    sequelize,
    modelName: 'Conversation',
    tableName: 'conversations'
  });

  return Conversation;
};