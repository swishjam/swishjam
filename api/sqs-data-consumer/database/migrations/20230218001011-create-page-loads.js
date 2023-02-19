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
      device_brand: {
        type: Sequelize.STRING
      },
      device_model: {
        type: Sequelize.STRING
      },
      device_bot: {
        type: Sequelize.STRING
      },
      device_client_type: {
        type: Sequelize.STRING
      },
      device_client_name: {
        type: Sequelize.STRING
      },
      device_client_version: {
        type: Sequelize.STRING
      },
      device_client_engine: {
        type: Sequelize.STRING
      },
      device_client_engine_version: {
        type: Sequelize.STRING
      },
      device_os_name: {
        type: Sequelize.STRING
      },
      device_os_version: {
        type: Sequelize.STRING
      },
      device_os_platform: {
        type: Sequelize.STRING
      },
      screen_width: {
        type: Sequelize.DECIMAL
      },
      screen_height: {
        type: Sequelize.DECIMAL
      },
      connection_effective_type: {
        type: Sequelize.STRING
      },
      connection_downlink: {
        type: Sequelize.DECIMAL
      },
      connection_rtt: {
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
    await queryInterface.addIndex('page_loads', ['identifier']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('page_loads');
  }
};