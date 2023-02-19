'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class performance_metrics extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  performance_metrics.init({
    page_load_identifier: DataTypes.STRING,
    time_to_first_byte: DataTypes.DECIMAL,
    first_contentful_paint: DataTypes.DECIMAL,
    first_input_delay: DataTypes.DECIMAL,
    largest_contentful_paint: DataTypes.DECIMAL,
    interaction_to_next_paint: DataTypes.DECIMAL,
    dom_interactive: DataTypes.DECIMAL,
    dom_complete: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'performance_metrics',
    underscored: true,
  });
  return performance_metrics;
};