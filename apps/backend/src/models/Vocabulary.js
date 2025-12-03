"use strict";

module.exports = (sequelize, DataTypes) => {
  const Vocabulary = sequelize.define(
    "Vocabulary",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      word: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      lang: {
        type: DataTypes.STRING(8),
        allowNull: false,
        defaultValue: 'en',
      },
        phonetics: {
          type: DataTypes.STRING(128),
          allowNull: true,
        },
      meaningVi: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      source: {
        type: DataTypes.STRING(32),
        allowNull: true,
      },
    },
    {
      tableName: 'vocabularies',
      indexes: [
        { unique: true, fields: ['userId', 'word', 'lang'] },
        { fields: ['userId', 'createdAt'] }
      ],
    }
  );

  Vocabulary.associate = (models) => {
    Vocabulary.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Vocabulary;
};
