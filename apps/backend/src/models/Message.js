module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    role: { type: DataTypes.ENUM('user','assistant'), allowNull: false },
    content: { type: DataTypes.TEXT('long'), allowNull: false }
  }, { tableName: 'messages', indexes: [{ fields: ['conversationId','createdAt'] }] });
  return Message;
};