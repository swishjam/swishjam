'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('performance_metrics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DECIMAL
      },
      page_load_identifier: {
        type: Sequelize.STRING
      },
      time_to_first_byte: {
        type: Sequelize.DECIMAL
      },
      first_contentful_paint: {
        type: Sequelize.DECIMAL
      },
      first_input_delay: {
        type: Sequelize.DECIMAL
      },
      largest_contentful_paint: {
        type: Sequelize.DECIMAL
      },
      interaction_to_next_paint: {
        type: Sequelize.DECIMAL
      },
      dom_interactive: {
        type: Sequelize.DECIMAL
      },
      dom_complete: {
        type: Sequelize.DECIMAL
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
    await queryInterface.addIndex('performance_metrics', ['page_load_identifier']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('performance_metrics');
  }
};