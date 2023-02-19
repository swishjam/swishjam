'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class page_loads extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  page_loads.init({
    identifier: DataTypes.STRING,
    site_id: DataTypes.STRING,
    page_load_ts: DataTypes.BIGINT,
    full_url: DataTypes.STRING,
    url_host: DataTypes.STRING,
    url_path: DataTypes.STRING,
    url_query: DataTypes.STRING,
    user_agent: DataTypes.STRING,
    device_type: DataTypes.STRING,
    device_brand: DataTypes.STRING,
    device_model: DataTypes.STRING,
    device_bot: DataTypes.STRING,
    device_client_type: DataTypes.STRING,
    device_client_name: DataTypes.STRING,
    device_client_version: DataTypes.STRING,
    device_client_engine: DataTypes.STRING,
    device_client_engine_version: DataTypes.STRING,
    device_os_name: DataTypes.STRING,
    device_os_version: DataTypes.STRING,
    device_os_platform: DataTypes.STRING,
    screen_width: DataTypes.DECIMAL,
    screen_height: DataTypes.DECIMAL,
    connection_effective_type: DataTypes.STRING,
    connection_downlink: DataTypes.DECIMAL,
    connection_rtt: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'page_loads',
    underscored: true,
  });
  return page_loads;
};