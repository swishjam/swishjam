'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('layout_shift_performance_entries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      page_view_identifier: {
        type: Sequelize.STRING,
        allowNull: false
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
      duration: {
        type: Sequelize.DECIMAL
      },
      value: {
        type: Sequelize.DECIMAL
      },
      last_input_time: {
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('layout_shift_performance_entries');
  }
};