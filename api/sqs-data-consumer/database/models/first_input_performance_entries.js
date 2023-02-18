'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class first_input_performance_entries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  first_input_performance_entries.init({
    page_load_identifier: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    entry_type: DataTypes.STRING,
    name: DataTypes.STRING,
    start_time: DataTypes.BIGINT,
    interaction_id: DataTypes.STRING,
    processing_start: DataTypes.INTEGER,
    processing_end: DataTypes.INTEGER,
    target: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'first_input_performance_entries',
    underscored: true,
  });
  return first_input_performance_entries;
};