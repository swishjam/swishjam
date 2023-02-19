'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mark_performance_entries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DECIMAL
      },
      page_load_identifier: {
        type: Sequelize.STRING
      },
      duration: {
        type: Sequelize.DECIMAL
      },
      entry_type: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      start_time: {
        type: Sequelize.BIGINT
      },
      detail: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('mark_performance_entries', ['page_load_identifier']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mark_performance_entries');
  }
};