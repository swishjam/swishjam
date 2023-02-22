'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('element_performance_entries', {
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
      element_identifier: {
        type: Sequelize.STRING
      },
      element_id: {
        type: Sequelize.STRING
      },
      identifier: {
        type: Sequelize.STRING
      },
      intersection_rect: {
        type: Sequelize.STRING
      },
      load_time: {
        type: Sequelize.DECIMAL
      },
      natural_height: {
        type: Sequelize.DECIMAL
      },
      render_time: {
        type: Sequelize.DECIMAL
      },
      url: {
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
    await queryInterface.addIndex('element_performance_entries', ['page_view_identifier']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('element_performance_entries');
  }
};