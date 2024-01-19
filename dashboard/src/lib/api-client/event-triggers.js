import Base from "./base";

export class EventTriggers extends Base {
  static async list() {
    return await this._get('/api/v1/event_triggers')
  }

  static async create({ eventName, steps, conditionalStatements }) {
    return await this._post('/api/v1/event_triggers', { event_name: eventName, event_trigger_steps: steps, conditional_statements: conditionalStatements });
  }

  static async update(id, { eventName, steps, conditionalStatements }) {
    return await this._patch(`/api/v1/event_triggers/${id}`, { event_name: eventName, event_trigger_steps: steps, conditional_statements: conditionalStatements });
  }

  static async delete(id) {
    return await this._delete(`/api/v1/event_triggers/${id}`);
  }

  static async retrieve(id) {
    return await this._get(`/api/v1/event_triggers/${id}`);
  }

  static async disable(id) {
    return await this._patch(`/api/v1/event_triggers/${id}/disable`);
  }

  static async enable(id) {
    return await this._patch(`/api/v1/event_triggers/${id}/enable`);
  }

  static async triggerTest({ eventPayload, eventName, conditionalStatements, steps }) {
    return await this._post('/api/v1/event_triggers/test_trigger', {
      event_payload: eventPayload,
      event_name: eventName,
      conditional_statements: conditionalStatements,
      event_trigger_steps: steps,
    });
  }
}

Object.assign(EventTriggers, Base);
export default EventTriggers;