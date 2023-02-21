'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class element_performance_entries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  element_performance_entries.init({
    page_load_identifier: DataTypes.STRING,
    duration: DataTypes.DECIMAL,
    entry_type: DataTypes.STRING,
    name: DataTypes.STRING,
    start_time: DataTypes.BIGINT,
    element_identifier: DataTypes.STRING,
    element_id: DataTypes.STRING,
    identifier: DataTypes.STRING,
    intersection_rect: DataTypes.STRING,
    load_time: DataTypes.DECIMAL,
    natural_height: DataTypes.DECIMAL,
    render_time: DataTypes.DECIMAL,
    url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'element_performance_entries',
    underscored: true,
  });
  return element_performance_entries;
};