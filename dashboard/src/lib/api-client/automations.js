import AutomationSteps from "./automations/automation-steps";
import ExecutedAutomations from "./automations/executed-automations";
import Base from "./base";

export class Automations extends Base {
  static AutomationSteps = AutomationSteps;
  static ExecutedAutomations = ExecutedAutomations;

  static async create({ name, entry_point_event_name, automation_steps, next_automation_step_conditions }) {
    return await this._post('/api/v1/automations', {
      name,
      entry_point_event_name,
      automation_steps,
      next_automation_step_conditions,
    });
  }

  static async list({ page, limit } = {}) {
    return await this._get('/api/v1/automations', { page, limit });
  }

  static async retrieve(id, { includeExecutionHistory = false, includeAutomationStepExecutionHistory = false, groupConditionsWithSteps = false } = {}) {
    return await this._get(`/api/v1/automations/${id}`, {
      include_execution_history: includeExecutionHistory,
      include_automation_step_execution_history: includeAutomationStepExecutionHistory,
      group_conditions_with_steps: groupConditionsWithSteps,
    });
  }

  static async testExecution({ id, configuration, eventName, eventProperties, userProperties }) {
    return await this._post(`/api/v1/automations/test_execution`, {
      id,
      configuration,
      test_event_name: eventName,
      test_event_properties: eventProperties,
      test_user_properties: userProperties,
    });
  }
}

Object.assign(Automations, Base);
export default Automations;