'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mark_performance_entries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid: { type: Sequelize.STRING, allowNull: false, unique: true },
      page_view_uuid: { type: Sequelize.STRING, allowNull: false },
      project_key: { type: Sequelize.STRING, allowNull: false },
      duration: { type: Sequelize.DECIMAL },
      entry_type: { type: Sequelize.STRING },
      name: { type: Sequelize.STRING },
      start_time: { type: Sequelize.DECIMAL },
      detail: { type: Sequelize.STRING },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addIndex('mark_performance_entries', ['uuid']);
    await queryInterface.addIndex('mark_performance_entries', ['page_view_uuid']);
    await queryInterface.addIndex('mark_performance_entries', ['project_key']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mark_performance_entries');
  }
};