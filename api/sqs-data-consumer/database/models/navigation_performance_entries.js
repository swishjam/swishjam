'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class navigation_performance_entries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  navigation_performance_entries.init({
    page_load_identifier: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    entry_type: DataTypes.STRING,
    name: DataTypes.STRING,
    start_time: DataTypes.BIGINT,
    initiator_type: DataTypes.STRING,
    dom_complete: DataTypes.STRING,
    dom_complete: DataTypes.INTEGER,
    dom_content_loaded_event_end: DataTypes.INTEGER,
    dom_content_loaded_event_start: DataTypes.INTEGER,
    dom_interactive: DataTypes.INTEGER,
    load_event_end: DataTypes.INTEGER,
    load_event_start: DataTypes.INTEGER,
    redirect_count: DataTypes.INTEGER,
    type: DataTypes.STRING,
    unload_event_end: DataTypes.INTEGER,
    unload_event_start: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'navigation_performance_entries',
    underscored: true,
  });
  return navigation_performance_entries;
};