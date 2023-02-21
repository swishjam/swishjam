'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class longtask_task_attribution_performance_entries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  longtask_task_attribution_performance_entries.init({
    page_load_identifier: DataTypes.STRING,
    duration: DataTypes.DECIMAL,
    entry_type: DataTypes.STRING,
    name: DataTypes.STRING,
    start_time: DataTypes.BIGINT,
    container_type: DataTypes.STRING,
    container_src: DataTypes.STRING,
    container_id: DataTypes.STRING,
    container_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'longtask_task_attribution_performance_entries',
    underscored: true,
  });
  return longtask_task_attribution_performance_entries;
};