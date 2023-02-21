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
      page_view_identifier: {
        type: Sequelize.STRING,
        unique: true
      },
      time_to_first_byte: {
        type: Sequelize.DECIMAL
      },
      first_contentful_paint: {
        type: Sequelize.DECIMAL
      },
      cumulative_layout_shift: {
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
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });
    await queryInterface.addIndex('performance_metrics', ['page_view_identifier']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('performance_metrics');
  }
};