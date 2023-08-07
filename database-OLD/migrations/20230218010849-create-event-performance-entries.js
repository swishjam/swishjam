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
      uuid: { type: Sequelize.STRING, unique: true, allowNull: false },
      project_key: { type: Sequelize.STRING, allowNull: false },
      page_view_uuid: { type: Sequelize.STRING, allowNull: false },
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
    await queryInterface.addIndex('event_performance_entries', ['uuid']);
    await queryInterface.addIndex('event_performance_entries', ['project_key']);
    await queryInterface.addIndex('event_performance_entries', ['page_view_uuid']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_performance_entries');
  }
};