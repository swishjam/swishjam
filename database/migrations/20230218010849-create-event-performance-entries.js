'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_performance_entries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      unique_identifier: { type: Sequelize.STRING, allowNull: false, unique: true },
      page_view_identifier: { type: Sequelize.STRING },
      site_id: { type: Sequelize.STRING, allowNull: false, },
      duration: { type: Sequelize.DECIMAL },
      entry_type: { type: Sequelize.STRING },
      name: { type: Sequelize.STRING },
      start_time: { type: Sequelize.DECIMAL },
      interaction_id: { type: Sequelize.STRING },
      processing_start: { type: Sequelize.DECIMAL },
      processing_end: { type: Sequelize.DECIMAL },
      target: { type: Sequelize.STRING },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addIndex('event_performance_entries', ['page_view_identifier']);
    await queryInterface.addIndex('event_performance_entries', ['site_id', 'unique_identifier'], { unique: true });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_performance_entries');
  }
};