import Base from "./base";
import Properties from "./events/properties";

export class Events extends Base {
  static Properties = Properties;

  static async listUnique() {
    return await this._get('/api/v1/events/unique')
  }
}

Object.assign(Events, Base);
export default Events;