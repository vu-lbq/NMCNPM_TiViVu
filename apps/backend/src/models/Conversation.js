module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING(200) },
    status: { type: DataTypes.ENUM('active','archived'), defaultValue: 'active' }
  }, { tableName: 'conversations' });
  return Conversation;
};