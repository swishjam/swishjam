import Base from "../base";

export class ExecutedAutomations extends Base {
  static async list(automationId, options = {}) {
    return await this._get(`/api/v1/automations/${automationId}/executed_automations`, options)
  }

  static async timeseries(automationId, options = {}) {
    return await this._get(`/api/v1/automations/${automationId}/executed_automations/timeseries`, options)
  }
}

Object.assign(ExecutedAutomations, Base);
export default ExecutedAutomations;