import Base from "./base";

export class DashboardDataVizualizations extends Base {
  static async list(dashboardId) {
    return await this._get(`/api/v1/dashboards/${dashboardId}/dashboard_data_visualizations`)
  }

  static async create(dashboardId, data_visualization_id, position_config) {
    return await this._post(`/api/v1/dashboards/${dashboardId}/dashboard_data_visualizations`, { data_visualization_id, position_config })
  }

  static async delete(dashboardId, dashboardDataVisualizationId) {
    return await this._delete(`/api/v1/dashboards/${dashboardId}/dashboard_data_visualizations/${dashboardDataVisualizationId}`)
  }

  static async bulkUpdate(dashboardId, dashboard_data_visualizations) {
    return await this._patch(`/api/v1/dashboards/${dashboardId}/dashboard_data_visualizations/bulk_update`, { dashboard_data_visualizations })
  }
}

Object.assign(DashboardDataVizualizations, Base);
export default DashboardDataVizualizations;