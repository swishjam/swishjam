import Base from "../base";

export class EventTriggers extends Base {
  static async delayTimeTimeseries() {
    return await this._get('/api/v1/admin/event_triggers/delay_time_timeseries');
  }
}

Object.assign(EventTriggers, Base);
export default EventTriggers;