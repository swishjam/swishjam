import Base from "../base";

export class ExecutedAutomations extends Base {
  static async retrieve(automationId, executedAutomationId) {
    return await this._get(`/api/v1/automations/${automationId}/executed_automations/${executedAutomationId}`)
  }

  static async list(automationId, { page, limit, automationStepIds } = {}) {
    return await this._get(`/api/v1/automations/${automationId}/executed_automations`, { page, limit, automation_step_ids: automationStepIds })
  }

  static async timeseries(automationId, options = {}) {
    return await this._get(`/api/v1/automations/${automationId}/executed_automations/timeseries`, options)
  }
}

Object.assign(ExecutedAutomations, Base);
export default ExecutedAutomations;