import Base from "./base"

export class Events extends Base {
  static async retrieve(name) {
    return await this._get(`/api/v1/events/${name}`)
  }

  static async unique({ limit } = {}) {
    return await this._get('/api/v1/events/unique', { limit })
  }
}

Object.assign(Events, Base);
export default Events;