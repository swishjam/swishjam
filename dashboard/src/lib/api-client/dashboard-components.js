import Base from "./base";

class DashboardComponents extends Base {
  static async list(dashboardId) {
    return await this._get('/api/v1/dashboard_components', { dashboard_id: dashboardId })
  }

  static async bulkUpdate(dashboardComponents) {
    return await this._patch('/api/v1/dashboard_components/bulk_update', { dashboard_components: dashboardComponents });
  }

  // static async create(dashboardId, dashboardComponentConfiguration) {
  //   return await this._post('/api/v1/dashboard_components', {
  //     dashboard_id: dashboardId,
  //     dashboard_component: {
  //       configuration: dashboardComponentConfiguration
  //     }
  //   })
  // }

  static async create({ title, subtitle, configuration, dashboardId }) {
    return await this._post('/api/v1/dashboard_components', { title, subtitle, configuration, dashboard_id: dashboardId });
  }

  static async delete(id) {
    return await this._delete(`/api/v1/dashboard_components/${id}`);
  }
}

Object.assign(DashboardComponents, Base);
export default DashboardComponents;