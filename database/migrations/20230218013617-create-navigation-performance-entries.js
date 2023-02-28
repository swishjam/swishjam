'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('navigation_performance_entries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      unique_identifier: { type: Sequelize.STRING, allowNull: false, unique: true },
      page_view_identifier: { type: Sequelize.STRING },
      site_id: { type: Sequelize.STRING, allowNull: false },
      duration: { type: Sequelize.DECIMAL },
      entry_type: { type: Sequelize.STRING },
      name: { type: Sequelize.STRING },
      start_time: { type: Sequelize.DECIMAL },
      initiator_type: { type: Sequelize.STRING },
      dom_complete: { type: Sequelize.STRING },
      dom_complete: { type: Sequelize.DECIMAL },
      dom_content_loaded_event_end: { type: Sequelize.DECIMAL },
      dom_content_loaded_event_start: { type: Sequelize.DECIMAL },
      dom_interactive: { type: Sequelize.DECIMAL },
      load_event_end: { type: Sequelize.DECIMAL },
      load_event_start: { type: Sequelize.DECIMAL },
      redirect_count: { type: Sequelize.DECIMAL },
      type: { type: Sequelize.STRING },
      unload_event_end: { type: Sequelize.DECIMAL },
      unload_event_start: { type: Sequelize.DECIMAL },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addIndex('navigation_performance_entries', ['page_view_identifier']);
    await queryInterface.addIndex('navigation_performance_entries', ['site_id', 'unique_identifier'], { unique: true });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('navigation_performance_entries');
  }
};