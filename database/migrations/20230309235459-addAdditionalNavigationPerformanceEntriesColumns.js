'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn('navigation_performance_entries', 'connect_end', { type: Sequelize.DECIMAL });
    queryInterface.addColumn('navigation_performance_entries', 'connect_start', { type: Sequelize.DECIMAL });
    queryInterface.addColumn('navigation_performance_entries', 'decoded_body_size', { type: Sequelize.DECIMAL });
    queryInterface.addColumn('navigation_performance_entries', 'domain_lookup_end', { type: Sequelize.DECIMAL });
    queryInterface.addColumn('navigation_performance_entries', 'domain_lookup_start', { type: Sequelize.DECIMAL });
    queryInterface.addColumn('navigation_performance_entries', 'encoded_body_size', { type: Sequelize.DECIMAL });
    queryInterface.addColumn('navigation_performance_entries', 'fetch_start', { type: Sequelize.DECIMAL });
    queryInterface.addColumn('navigation_performance_entries', 'redirect_end', { type: Sequelize.DECIMAL });
    queryInterface.addColumn('navigation_performance_entries', 'redirect_start', { type: Sequelize.DECIMAL });
    queryInterface.addColumn('navigation_performance_entries', 'render_blocking_status', { type: Sequelize.STRING });
    queryInterface.addColumn('navigation_performance_entries', 'request_start', { type: Sequelize.DECIMAL });
    queryInterface.addColumn('navigation_performance_entries', 'response_end', { type: Sequelize.DECIMAL });
    queryInterface.addColumn('navigation_performance_entries', 'response_start', { type: Sequelize.DECIMAL });
    queryInterface.addColumn('navigation_performance_entries', 'response_status', { type: Sequelize.DECIMAL });
    queryInterface.addColumn('navigation_performance_entries', 'secure_connection_start', { type: Sequelize.DECIMAL });
    queryInterface.addColumn('navigation_performance_entries', 'transfer_size', { type: Sequelize.INTEGER });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeColumn('navigation_performance_entries', 'connect_end');
    queryInterface.removeColumn('navigation_performance_entries', 'connect_start');
    queryInterface.removeColumn('navigation_performance_entries', 'decoded_body_size');
    queryInterface.removeColumn('navigation_performance_entries', 'domain_lookup_end');
    queryInterface.removeColumn('navigation_performance_entries', 'domain_lookup_start');
    queryInterface.removeColumn('navigation_performance_entries', 'encoded_body_size');
    queryInterface.removeColumn('navigation_performance_entries', 'fetch_start');
    queryInterface.removeColumn('navigation_performance_entries', 'redirect_end');
    queryInterface.removeColumn('navigation_performance_entries', 'redirect_start');
    queryInterface.removeColumn('navigation_performance_entries', 'render_blocking_status');
    queryInterface.removeColumn('navigation_performance_entries', 'request_start');
    queryInterface.removeColumn('navigation_performance_entries', 'response_end');
    queryInterface.removeColumn('navigation_performance_entries', 'response_start');
    queryInterface.removeColumn('navigation_performance_entries', 'response_status');
    queryInterface.removeColumn('navigation_performance_entries', 'secure_connection_start');
    queryInterface.removeColumn('navigation_performance_entries', 'start_time');
    queryInterface.removeColumn('navigation_performance_entries', 'transfer_size');
  }
};
