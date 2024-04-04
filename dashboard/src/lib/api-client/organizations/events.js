const { default: Base } = require("../base")

export class Events extends Base {
  static async list(organizationId, { limit } = {}) {
    return await this._get(`/api/v1/organizations/${organizationId}/events`, { limit });
  }
}

Object.assign(Events, Base);
export default Events;