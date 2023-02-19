'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class largest_contentful_paint_performance_entries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  largest_contentful_paint_performance_entries.init({
    page_load_identifier: DataTypes.STRING,
    duration: DataTypes.DECIMAL,
    entry_type: DataTypes.STRING,
    name: DataTypes.STRING,
    start_time: DataTypes.BIGINT,
    element_identifier: DataTypes.STRING,
    render_time: DataTypes.DECIMAL,
    load_time: DataTypes.DECIMAL,
    size: DataTypes.DECIMAL,
    element_id: DataTypes.STRING,
    url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'largest_contentful_paint_performance_entries',
    underscored: true,
  });
  return largest_contentful_paint_performance_entries;
};