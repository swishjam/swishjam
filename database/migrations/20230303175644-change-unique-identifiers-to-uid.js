'use strict';

/** @type {import('sequelize-cli').Migration} */

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

module.exports = {
  async up (queryInterface, Sequelize) {
    for (const table of tables) {
      await queryInterface.addColumn(table, 'uuid', { type: Sequelize.STRING });
      await queryInterface.addIndex(table, ['site_id', 'uuid'], { unique: true });
      if (table !== 'page_views') {
        await queryInterface.addColumn(table, 'page_view_uuid', { type: Sequelize.STRING });
        await queryInterface.addIndex(table, ['page_view_uuid']);
      }
    }
    await queryInterface.addColumn('longtask_task_attribution_performance_entries', 'longtask_uuid', { type: Sequelize.STRING });
    await queryInterface.addIndex('longtask_task_attribution_performance_entries', ['longtask_uuid']);
  },

  async down (queryInterface, Sequelize) {
    for (const table of tables) {
      await queryInterface.removeColumn(table, 'uuid');
      await queryInterface.removeIndex(table, ['site_id', 'uuid']);
      if (table !== 'page_views') {
        await queryInterface.removeColumn(table, 'page_view_uuid');
        await queryInterface.removeIndex(table, ['page_view_uuid']);
      }
    }
    await queryInterface.removeColumn('longtask_task_attribution_performance_entries', 'longtask_uuid');
    await queryInterface.removeIndex('longtask_task_attribution_performance_entries', ['longtask_uuid']);
  }
};