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
        type: Sequelize.INTEGER
      },
      page_load_identifier: {
        type: Sequelize.STRING
      },
      duration: {
        type: Sequelize.INTEGER
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
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('longtask_task_attribution_performance_entries', ['page_load_identifier']);
    await queryInterface.addIndex('longtask_task_attribution_performance_entries', ['long_task_performance_entry_id']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('longtask_task_attribution_performance_entries');
  }
};