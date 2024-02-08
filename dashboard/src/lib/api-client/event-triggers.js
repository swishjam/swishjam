import Base from "./base";
import TriggeredEventTriggers from "./event-triggers/triggered-event-triggers";

export class EventTriggers extends Base {
  static TriggeredEventTriggers = TriggeredEventTriggers;

  static async list() {
    return await this._get('/api/v1/event_triggers')
  }

  static async create({ event_name, steps, conditional_statements }) {
    return await this._post('/api/v1/event_triggers', { event_name: event_name, event_trigger_steps: steps, conditional_statements: conditional_statements });
  }

  static async update(id, { event_name, steps, conditional_statements }) {
    console.log('update', id, event_name, steps, conditional_statements)
    return await this._patch(`/api/v1/event_triggers/${id}`, { event_name: event_name, event_trigger_steps: steps, conditional_statements: conditional_statements });
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