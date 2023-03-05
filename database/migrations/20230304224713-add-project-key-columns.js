'use strict';

const tables = [
  'page_views',
  'element_performance_entries',
  'event_performance_entries',
  'first_input_performance_entries',
  'largest_contentful_paint_performance_entries',
  'longtask_performance_entries',
  'longtask_task_attribution_performance_entries',
  'mark_performance_entries',
  'measure_performance_entries',
  'navigation_performance_entries',
  'performance_metrics',
  'layout_shift_performance_entries',
  'resource_performance_entries',
  'paint_performance_entries'
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    for (const table of tables) {
      await queryInterface.addColumn(table, 'project_key', { type: Sequelize.STRING });
      await queryInterface.addIndex(table, ['project_key']);
    }  
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
