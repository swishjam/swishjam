'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('resource_performance_entries', 'waiting_duration', { type: Sequelize.DECIMAL });
    await queryInterface.addColumn('resource_performance_entries', 'redirect_duration', { type: Sequelize.DECIMAL });
    await queryInterface.addColumn('resource_performance_entries', 'service_worker_duration', { type: Sequelize.DECIMAL });
    await queryInterface.addColumn('resource_performance_entries', 'dns_lookup_duration', { type: Sequelize.DECIMAL });
    await queryInterface.addColumn('resource_performance_entries', 'tcp_duration', { type: Sequelize.DECIMAL });
    await queryInterface.addColumn('resource_performance_entries', 'ssl_duration', { type: Sequelize.DECIMAL });
    await queryInterface.addColumn('resource_performance_entries', 'request_duration', { type: Sequelize.DECIMAL });
    await queryInterface.addColumn('resource_performance_entries', 'response_duration', { type: Sequelize.DECIMAL }); 

    await queryInterface.addColumn('resource_performance_entries', 'next_hop_protocol', { type: Sequelize.STRING }); 
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('resource_performance_entries', 'waiting_duration');
    await queryInterface.removeColumn('resource_performance_entries', 'redirect_duration');
    await queryInterface.removeColumn('resource_performance_entries', 'service_worker_duration');
    await queryInterface.removeColumn('resource_performance_entries', 'dns_lookup_duration');
    await queryInterface.removeColumn('resource_performance_entries', 'tcp_duration');
    await queryInterface.removeColumn('resource_performance_entries', 'ssl_duration');
    await queryInterface.removeColumn('resource_performance_entries', 'request_duration');
    await queryInterface.removeColumn('resource_performance_entries', 'response_duration'); 

    await queryInterface.removeColumn('resource_performance_entries', 'next_hop_protocol');
  }
};
