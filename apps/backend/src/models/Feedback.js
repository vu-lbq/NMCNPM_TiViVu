'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    static associate(models) {
      if (models.User) {
        Feedback.belongsTo(models.User, { foreignKey: 'userId' });
      }
    }
  }

  Feedback.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: true },
    email: { type: DataTypes.STRING(128), allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: false },
  }, {
    sequelize,
    modelName: 'Feedback',
    tableName: 'feedbacks'
  });

  return Feedback;
};
