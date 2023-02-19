'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class layout_shift_performance_entries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  layout_shift_performance_entries.init({
    entry_type: DataTypes.STRING,
    start_time: DataTypes.DECIMAL,
    duration: DataTypes.DECIMAL,
    value: DataTypes.DECIMAL,
    last_input_time: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'layout_shift_performance_entries',
    underscored: true,
  });
  return layout_shift_performance_entries;
};