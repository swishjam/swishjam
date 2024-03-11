module Automations
  class Triggerer
    def self.enqueue_automation_execution_jobs_that_match_event(prepared_event)
      workspace = Workspace.for_public_key!(prepared_event.swishjam_api_key)
      matching_entry_point_automation_steps = workspace.entry_point_automation_steps.find_all_where_event_name_equals(prepared_event.name)
      matching_entry_point_automation_steps.uniq(&:automation_id).each do |entry_point_automation_step|
        AutomationJobs::ExecuteAutomation.perform_async(entry_point_automation_step.automation_id, prepared_event.as_json)
      end
    end
  end
end