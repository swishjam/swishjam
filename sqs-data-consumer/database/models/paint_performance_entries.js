'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class paint_performance_entries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  paint_performance_entries.init({
    name: DataTypes.STRING,
    entry_type: DataTypes.STRING,
    start_time: DataTypes.DECIMAL,
    duration: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'paint_performance_entries',
    underscored: true,
  });
  return paint_performance_entries;
};