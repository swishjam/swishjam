'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class largest_contentful_paint_entries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  largest_contentful_paint_entries.init({
    page_load_identifier: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    entry_type: DataTypes.STRING,
    name: DataTypes.STRING,
    start_time: DataTypes.BIGINT,
    element_identifier: DataTypes.STRING,
    render_time: DataTypes.INTEGER,
    load_time: DataTypes.INTEGER,
    size: DataTypes.INTEGER,
    element_id: DataTypes.STRING,
    url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'largest_contentful_paint_entries',
    underscored: true,
  });
  return largest_contentful_paint_entries;
};