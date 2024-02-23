import Base from "../base";

export class TriggeredEventTriggers extends Base {
  static async list(eventTriggerId, opts = {}) {
    return await this._get(`/api/v1/event_triggers/${eventTriggerId}/triggered_event_triggers`, opts);
  }

  static async retry(eventTriggerId, triggeredEventTriggerId) {
    return await this._post(`/api/v1/event_triggers/${eventTriggerId}/triggered_event_triggers/${triggeredEventTriggerId}/retry`);
  }

  static async cancel(eventTriggerId, triggeredEventTriggerId) {
    return await this._post(`/api/v1/event_triggers/${eventTriggerId}/triggered_event_triggers/${triggeredEventTriggerId}/cancel`);
  }
}

Object.assign(TriggeredEventTriggers, Base);
export default TriggeredEventTriggers;