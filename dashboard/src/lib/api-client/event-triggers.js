import Base from "./base";

export class EventTriggers extends Base {
  static async list() {
    return await this._get('/api/v1/event_triggers')
  }

  static async create({ eventName, steps }) {
    return await this._post('/api/v1/event_triggers', { event_name: eventName, event_trigger_steps: steps });
  }
}

Object.assign(EventTriggers, Base);
export default EventTriggers;