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
      interaction_id: {
        type: Sequelize.STRING
      },
      processing_start: {
        type: Sequelize.DECIMAL
      },
      processing_end: {
        type: Sequelize.DECIMAL
      },
      target: {
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
    await queryInterface.addIndex('first_input_performance_entries', ['page_view_identifier']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('first_input_performance_entries');
  }
};