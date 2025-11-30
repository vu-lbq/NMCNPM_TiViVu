"use strict";
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.Conversation, { foreignKey: 'conversationId' });
      Message.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  Message.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    role: { type: DataTypes.ENUM('user','assistant'), allowNull: false },
    content: { type: DataTypes.TEXT('long'), allowNull: false },
    conversationId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false }
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    indexes: [{ fields: ['conversationId','createdAt'] }]
  });

  return Message;
};