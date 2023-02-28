'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('resource_performance_entries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      unique_identifier: { type: Sequelize.STRING, allowNull: false, unique: true },
      page_view_identifier: { type: Sequelize.STRING, allowNull: false },
      site_id: { type: Sequelize.STRING, allowNull: false, },
      entry_type: { type: Sequelize.STRING },
      start_time: { type: Sequelize.DECIMAL },
      duration: { type: Sequelize.DECIMAL },
      name: { type: Sequelize.STRING },
      initiator_type: { type: Sequelize.STRING },
      render_blocking_status: { type: Sequelize.STRING },
      worker_start: { type: Sequelize.DECIMAL },
      redirect_start: { type: Sequelize.DECIMAL },
      redirect_end: { type: Sequelize.DECIMAL },
      fetch_start: { type: Sequelize.DECIMAL },
      domain_lookup_start: { type: Sequelize.DECIMAL },
      domain_lookup_end: { type: Sequelize.DECIMAL },
      connect_start: { type: Sequelize.DECIMAL },
      connect_end: { type: Sequelize.DECIMAL },
      secure_connection_start: { type: Sequelize.DECIMAL },
      request_start: { type: Sequelize.DECIMAL },
      response_start: { type: Sequelize.DECIMAL },
      response_end: { type: Sequelize.DECIMAL },
      transfer_size: { type: Sequelize.DECIMAL },
      encoded_body_size: { type: Sequelize.DECIMAL },
      decoded_body_size: { type: Sequelize.DECIMAL },
      repsonse_status: { type: Sequelize.DECIMAL },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addIndex('resource_performance_entries', ['page_view_identifier']);
    await queryInterface.addIndex('resource_performance_entries', ['site_id', 'unique_identifier'], { unique: true });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('resource_performance_entries');
  }
};