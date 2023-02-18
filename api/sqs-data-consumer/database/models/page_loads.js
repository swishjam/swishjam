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
    indentifier: DataTypes.STRING,
    site_id: DataTypes.STRING,
    page_load_ts: DataTypes.BIGINT,
    full_url: DataTypes.STRING,
    url_host: DataTypes.STRING,
    url_path: DataTypes.STRING,
    url_query: DataTypes.STRING,
    user_agent: DataTypes.STRING,
    device_type: DataTypes.STRING,
    screen_width: DataTypes.INTEGER,
    screen_height: DataTypes.INTEGER,
    connection_effective_type: DataTypes.STRING,
    connection_downlink: DataTypes.INTEGER,
    connection_rtt: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'page_loads',
  });
  return page_loads;
};