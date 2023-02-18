'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('first_input_performance_entries', {
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
      interaction_id: {
        type: Sequelize.STRING
      },
      processing_start: {
        type: Sequelize.INTEGER
      },
      processing_end: {
        type: Sequelize.INTEGER
      },
      target: {
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('first_input_performance_entries');
  }
};