const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = require('./User')(sequelize, DataTypes);
const Conversation = require('./Conversation')(sequelize, DataTypes);
const Message = require('./Message')(sequelize, DataTypes);

// Associations (minimal)
User.hasMany(Conversation, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Conversation.belongsTo(User);

Conversation.hasMany(Message, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Message.belongsTo(Conversation);

User.hasMany(Message, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Message.belongsTo(User);

module.exports = {
  sequelize,
  User,
  Conversation,
  Message
};