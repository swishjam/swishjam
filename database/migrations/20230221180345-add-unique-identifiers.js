'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tables =  [
      'element_performance_entries',
      'event_performance_entries',
      'first_input_performance_entries',
      'largest_contentful_paint_performance_entries',
      'layout_shift_performance_entries',
      'longtask_performance_entries',
      'longtask_task_attribution_performance_entries',
      'mark_performance_entries',
      'measure_performance_entries',
      'navigation_performance_entries',
      'paint_performance_entries',
      'performance_metrics',
      'resource_performance_entries',
    ];

    for (const table of tables) {
      await queryInterface.addColumn(table, 'unique_identifier', { type: Sequelize.STRING, allowNull: false });
      await queryInterface.addColumn(table, 'site_id', { type: Sequelize.STRING, allowNull: false });
      await queryInterface.addIndex(table, ['site_id', 'unique_identifier'], { unique: true });
    }

    await queryInterface.addIndex('performance_metrics', ['metric_name']);
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
