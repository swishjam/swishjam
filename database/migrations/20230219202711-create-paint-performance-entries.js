'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('paint_performance_entries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid: { type: Sequelize.STRING, allowNull: false, unique: true },
      page_view_uuid: { type: Sequelize.STRING, allowNull: false },
      project_key: { type: Sequelize.STRING, allowNull: false },
      name: { type: Sequelize.STRING },
      entry_type: { type: Sequelize.STRING },
      start_time: { type: Sequelize.DECIMAL },
      duration: { type: Sequelize.DECIMAL },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addIndex('paint_performance_entries', ['uuid']);
    await queryInterface.addIndex('paint_performance_entries', ['page_view_uuid']);
    await queryInterface.addIndex('paint_performance_entries', ['project_key']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('paint_performance_entries');
  }
};