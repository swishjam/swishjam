'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('resource_performance_entries', 'name_to_url_host', { type: Sequelize.STRING });
    await queryInterface.addColumn('resource_performance_entries', 'name_to_url_path', { type: Sequelize.STRING });
    await queryInterface.addColumn('resource_performance_entries', 'name_to_url_query', { type: Sequelize.STRING });
    await queryInterface.addIndex('resource_performance_entries', ['name_to_url_host']);
    await queryInterface.addIndex('resource_performance_entries', ['name_to_url_path']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('resource_performance_entries', 'name_to_url_host');
    await queryInterface.removeColumn('resource_performance_entries', 'name_to_url_path');
  }
};
