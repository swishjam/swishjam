const DB = require('../src/db');

const prepareDb = async () => {
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = 5432;
  process.env.DB_NAME = 'swishjam_test';
  await purgeAllData();
}

const purgeAllData = async () => {
  console.log(`Purging all data from ${process.env.DB_NAME}...`);
  const db = DB.connect();
  const promises = [
    'page_views', 
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
    'resource_performance_entries',
    'performance_metrics'
  ].map(table => db.client`DELETE FROM ${db.client(table)}`);
  await Promise.all(promises);
  await db.killConnection();
}

module.exports = { prepareDb };