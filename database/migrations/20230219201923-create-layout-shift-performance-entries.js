'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('layout_shift_performance_entries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      unique_identifier: { type: Sequelize.STRING, allowNull: false, unique: true },
      page_view_identifier: { type: Sequelize.STRING, allowNull: false },
      site_id: { type: Sequelize.STRING, allowNull: false },
      entry_type: { type: Sequelize.STRING },
      name: { type: Sequelize.STRING },
      start_time: { type: Sequelize.DECIMAL },
      duration: { type: Sequelize.DECIMAL },
      value: { type: Sequelize.DECIMAL },
      last_input_time: { type: Sequelize.DECIMAL },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addIndex('layout_shift_performance_entries', ['page_view_identifier']);
    await queryInterface.addIndex('layout_shift_performance_entries', ['site_id', 'unique_identifier'], { unique: true });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('layout_shift_performance_entries');
  }
};