'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('performance_metrics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      unique_identifier: { type: Sequelize.STRING, allowNull: false, unique: true },
      page_view_identifier: { type: Sequelize.STRING },
      site_id: { type: Sequelize.STRING, allowNull: false },
      metric_name: { type: Sequelize.STRING },
      metric_value: { type: Sequelize.DECIMAL },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addIndex('performance_metrics', ['page_view_identifier']);
    await queryInterface.addIndex('performance_metrics', ['page_view_identifier', 'metric_name'], { unique: true });
    await queryInterface.addIndex('performance_metrics', ['site_id', 'unique_identifier'], { unique: true });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('performance_metrics');
  }
};