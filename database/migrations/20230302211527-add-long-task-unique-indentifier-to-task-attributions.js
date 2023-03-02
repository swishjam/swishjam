'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn('longtask_task_attribution_performance_entries', 'longtask_unique_identifier', {
      type: Sequelize.STRING
    })
    queryInterface.addIndex('longtask_task_attribution_performance_entries', ['longtask_unique_identifier']);
    queryInterface.addIndex(
      'longtask_task_attribution_performance_entries', 
      ['unique_identifier', 'longtask_unique_identifier'], 
      { unique: true }
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
