'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('largest_contentful_paint_performance_entries', {
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
      element_identifier: { type: Sequelize.STRING },
      render_time: { type: Sequelize.DECIMAL },
      load_time: { type: Sequelize.DECIMAL },
      size: { type: Sequelize.DECIMAL },
      element_id: { type: Sequelize.STRING },
      url: { type: Sequelize.STRING },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addIndex('largest_contentful_paint_performance_entries', ['uuid']);
    await queryInterface.addIndex('largest_contentful_paint_performance_entries', ['page_view_uuid']);
    await queryInterface.addIndex('largest_contentful_paint_performance_entries', ['project_key']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('largest_contentful_paint_performance_entries');
  }
};