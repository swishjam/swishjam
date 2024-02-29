import Base from "../base";

export class AutomationSteps extends Base {
  static async list(automationId, options = {}) {
    return await this._get(`/api/v1/automations/${automationId}/automation_steps`, options)
  }
}

Object.assign(AutomationSteps, Base);
export default AutomationSteps;