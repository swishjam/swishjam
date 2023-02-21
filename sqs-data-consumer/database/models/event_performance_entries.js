'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class event_performance_entries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  event_performance_entries.init({
    page_load_identifier: DataTypes.STRING,
    duration: DataTypes.DECIMAL,
    entry_type: DataTypes.STRING,
    name: DataTypes.STRING,
    start_time: DataTypes.BIGINT,
    interaction_id: DataTypes.STRING,
    processing_start: DataTypes.DECIMAL,
    processing_end: DataTypes.DECIMAL,
    target: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'event_performance_entries',
    underscored: true,
  });
  return event_performance_entries;
};