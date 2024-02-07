import Base from "../base";

export class TriggeredEventTriggers extends Base {
  static async list(eventTriggerId) {
    return await this._get(`/api/v1/event_triggers/${eventTriggerId}/triggered_event_triggers`);
  }
}

Object.assign(TriggeredEventTriggers, Base);
export default TriggeredEventTriggers;