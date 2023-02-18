'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('page_loads', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      identifier: {
        type: Sequelize.STRING
      },
      site_id: {
        type: Sequelize.STRING
      },
      page_load_ts: {
        type: Sequelize.BIGINT
      },
      full_url: {
        type: Sequelize.STRING
      },
      url_host: {
        type: Sequelize.STRING
      },
      url_path: {
        type: Sequelize.STRING
      },
      url_query: {
        type: Sequelize.STRING
      },
      user_agent: {
        type: Sequelize.STRING
      },
      device_type: {
        type: Sequelize.STRING
      },
      screen_width: {
        type: Sequelize.INTEGER
      },
      screen_height: {
        type: Sequelize.INTEGER
      },
      connection_effective_type: {
        type: Sequelize.STRING
      },
      connection_downlink: {
        type: Sequelize.INTEGER
      },
      connection_rtt: {
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
    await queryInterface.addIndex('page_loads', ['identifier']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('page_loads');
  }
};