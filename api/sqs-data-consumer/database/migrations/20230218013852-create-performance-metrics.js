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
      page_load_identifier: {
        type: Sequelize.STRING
      },
      time_to_first_byte: {
        type: Sequelize.INTEGER
      },
      first_contentful_paint: {
        type: Sequelize.INTEGER
      },
      first_input_delay: {
        type: Sequelize.INTEGER
      },
      largest_contentful_paint: {
        type: Sequelize.INTEGER
      },
      interaction_to_next_paint: {
        type: Sequelize.INTEGER
      },
      dom_interactive: {
        type: Sequelize.INTEGER
      },
      dom_complete: {
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
    await queryInterface.addIndex('performance_metrics', ['page_load_identifier']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('performance_metrics');
  }
};