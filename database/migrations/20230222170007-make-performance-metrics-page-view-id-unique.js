'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('page_views', 'identifier', {
      type: Sequelize.STRING,
      unique: true
    });
    await queryInterface.changeColumn('performance_metrics', 'page_view_identifier', {
      type: Sequelize.STRING,
      unique: false
    });

    await queryInterface.addIndex('performance_metrics', ['page_view_identifier', 'metric_name'], { unique: true });
  },

  async down (queryInterface, Sequelize) {
    
  }
};
