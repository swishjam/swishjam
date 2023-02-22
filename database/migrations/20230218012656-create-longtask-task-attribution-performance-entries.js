'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('longtask_task_attribution_performance_entries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      long_task_performance_entry_id: {
        type: Sequelize.DECIMAL
      },
      page_view_identifier: {
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
        type: Sequelize.DECIMAL
      },
      container_type: {
        type: Sequelize.STRING
      },
      container_src: {
        type: Sequelize.STRING
      },
      container_id: {
        type: Sequelize.STRING
      },
      container_name: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });
    await queryInterface.addIndex('longtask_task_attribution_performance_entries', ['page_view_identifier']);
    await queryInterface.addIndex('longtask_task_attribution_performance_entries', ['long_task_performance_entry_id']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('longtask_task_attribution_performance_entries');
  }
};