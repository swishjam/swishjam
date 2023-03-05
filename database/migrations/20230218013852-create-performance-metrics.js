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
      uuid: { type: Sequelize.STRING, allowNull: false, unique: true },
      page_view_uuid: { type: Sequelize.STRING, allowNull: false },
      project_key: { type: Sequelize.STRING, allowNull: false },
      metric_name: { type: Sequelize.STRING },
      metric_value: { type: Sequelize.DECIMAL },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addIndex('performance_metrics', ['uuid']);
    await queryInterface.addIndex('performance_metrics', ['page_view_uuid']);
    await queryInterface.addIndex('performance_metrics', ['project_key']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('performance_metrics');
  }
};