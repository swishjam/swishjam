const { Sequelize } = require('sequelize');
const pageLoadModel = require('./database/models/page_loads');
const elementPerformanceEntryModel = require('./database/models/element_performance_entries');
const eventPerformanceEntryModel = require('./database/models/event_performance_entries');
const firstInputPerformanceEntryModel = require('./database/models/first_input_performance_entries');
const largestContentfulPaintPerformanceEntryModel = require('./database/models/largest_contentful_paint_performance_entries');
const longtaskPerformanceEntryModel = require('./database/models/longtask_performance_entries');
const longtaskAttributionPerformanceEntryModel = require('./database/models/longtask_task_attribution_performance_entries');
const markPerformanceEntryModel = require('./database/models/mark_performance_entries');
const measurePerformanceEntryModel = require('./database/models/measure_performance_entries');
const navigationPerformanceEntryModel = require('./database/models/navigation_performance_entries');
const performanceMetricModel = require('./database/models/performance_metrics');

const Database = () => {
  const { dbHost, dbDatabase, dbUsername, dbPassword, dbDialect  } = process.env;
  const sq = new Sequelize(dbDatabase, dbUsername, dbPassword, {
    host: dbHost,
    port: 5432,
    logging: msg => {console.log('-------------');console.log(`DB LOG: ${msg}`);console.log('-------------')},
    dialect: dbDialect,
    pool: { maxConnections: 5, maxIdleTime: 30 },
    language: 'en'
  })
  return sq;
}

const Models = (db) => {
  const pageLoads = pageLoadModel(db, Sequelize.DataTypes);
  const elementPerformanceEntries = elementPerformanceEntryModel(db, Sequelize.DataTypes);
  const eventPerformanceEntries = eventPerformanceEntryModel(db, Sequelize.DataTypes);
  const firstInputPerformanceEntries = firstInputPerformanceEntryModel(db, Sequelize.DataTypes);
  const largestContentfulPaintPerformanceEntries = largestContentfulPaintPerformanceEntryModel(db, Sequelize.DataTypes);
  const longtaskPerformanceEntries = longtaskPerformanceEntryModel(db, Sequelize.DataTypes);
  const longtaskAttributionPerformanceEntries = longtaskAttributionPerformanceEntryModel(db, Sequelize.DataTypes);
  const markPerformanceEntries = markPerformanceEntryModel(db, Sequelize.DataTypes);
  const measurePerformanceEntries = measurePerformanceEntryModel(db, Sequelize.DataTypes);
  const navigationPerformanceEntries = navigationPerformanceEntryModel(db, Sequelize.DataTypes);
  const performanceMetrics = performanceMetricModel(db, Sequelize.DataTypes);
  return {
    pageLoads,
    elementPerformanceEntries,
    eventPerformanceEntries,
    firstInputPerformanceEntries,
    largestContentfulPaintPerformanceEntries,
    longtaskPerformanceEntries,
    longtaskAttributionPerformanceEntries,
    markPerformanceEntries,
    measurePerformanceEntries,
    navigationPerformanceEntries,
    performanceMetrics,
  }
}

module.exports = { Database, Models }