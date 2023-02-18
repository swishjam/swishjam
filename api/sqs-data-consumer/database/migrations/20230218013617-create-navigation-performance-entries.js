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
      initiator_type: {
        type: Sequelize.STRING
      },
      dom_complete: {
        type: Sequelize.STRING
      },
      dom_complete: {
        type: Sequelize.INTEGER
      },
      dom_content_loaded_event_end: {
        type: Sequelize.INTEGER
      },
      dom_content_loaded_event_start: {
        type: Sequelize.INTEGER
      },
      dom_interactive: {
        type: Sequelize.INTEGER
      },
      load_event_end: {
        type: Sequelize.INTEGER
      },
      load_event_start: {
        type: Sequelize.INTEGER
      },
      redirect_count: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING
      },
      unload_event_end: {
        type: Sequelize.INTEGER
      },
      unload_event_start: {
        type: Sequelize.INTEGER
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
    await queryInterface.addIndex('navigation_performance_entries', ['page_load_identifier']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('navigation_performance_entries');
  }
};