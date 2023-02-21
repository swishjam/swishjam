'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class resource_performance_entries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  resource_performance_entries.init({
    entry_type: DataTypes.STRING,
    start_time: DataTypes.DECIMAL,
    duration: DataTypes.DECIMAL,
    initiator_type: DataTypes.STRING,
    render_blocking_status: DataTypes.STRING,
    worker_start: DataTypes.DECIMAL,
    redirect_start: DataTypes.DECIMAL,
    redirect_end: DataTypes.DECIMAL,
    fetch_start: DataTypes.DECIMAL,
    domain_lookup_start: DataTypes.DECIMAL,
    domain_lookup_end: DataTypes.DECIMAL,
    connect_start: DataTypes.DECIMAL,
    connect_end: DataTypes.DECIMAL,
    secure_connection_start: DataTypes.DECIMAL,
    request_start: DataTypes.DECIMAL,
    response_start: DataTypes.DECIMAL,
    response_end: DataTypes.DECIMAL,
    transfer_size: DataTypes.DECIMAL,
    encoded_body_size: DataTypes.DECIMAL,
    decoded_body_size: DataTypes.DECIMAL,
    repsonse_status: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'resource_performance_entries',
    underscored: true,
  });
  return resource_performance_entries;
};