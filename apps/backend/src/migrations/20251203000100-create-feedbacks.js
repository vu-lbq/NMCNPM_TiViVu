'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('feedbacks', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('uuid_generate_v4()') },
      userId: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      email: { type: Sequelize.STRING(128), allowNull: true },
      message: { type: Sequelize.TEXT, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    try {
      await queryInterface.addIndex('feedbacks', ['userId']);
      await queryInterface.addIndex('feedbacks', ['createdAt']);
    } catch(_) {}
  },

  async down(queryInterface) {
    await queryInterface.dropTable('feedbacks');
  }
};
