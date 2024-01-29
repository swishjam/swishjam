module EventTriggers
  class Evaluator
    def initialize
      # takes no args
    end

    def enqueue_event_trigger_jobs_that_match_event(prepared_event)
      matching_triggers_json = matching_triggers_for_prepared_event(prepared_event)
      matching_triggers_json.each do |trigger_json|
        Ingestion::TriggerEventTriggerJob.perform_async(trigger_json['trigger_id'], prepared_event.as_json)
      end
    end

    private

    def matching_triggers_for_prepared_event(prepared_event)
      all_event_triggers.select do |trigger|
        trigger['event_name'] == prepared_event.name && trigger['public_key'] == prepared_event.swishjam_api_key && !should_ignore_event?(prepared_event)
      end
    end

    def all_event_triggers
      @all_event_triggers ||= begin
        # if an event_name belongs to a workspace with 4 api_keys, it will return 4 separate rows
        # this is ok, because we will only match it once because we are checking against the public_key
        # we should probably associate the data source api_key with the event_trigger
        query = <<~SQL
          SELECT 
            event_triggers.event_name AS event_name,
            event_triggers.id AS trigger_id,
            api_keys.public_key AS public_key
          FROM event_triggers
          INNER JOIN workspaces ON workspaces.id = event_triggers.workspace_id
          INNER JOIN api_keys ON api_keys.workspace_id = workspaces.id
          WHERE event_triggers.enabled = true
        SQL
        ActiveRecord::Base.connection.execute(query)
      end
    end

    def should_ignore_event?(prepared_event)
      is_design_patterns = ['swishjam_prdct-c094a41f338335c4', 'swishjam_mrkt-9a3639e811447334'].include?(prepared_event.swishjam_api_key)
      is_presented_with_your_subscription_and_has_generic_email = prepared_event.name == 'presented_with_your_subscription' && 
                                                                  (prepared_event.properties['userEmail']&.ends_with?('gmail.com') || prepared_event.properties['userEmail']&.ends_with?('.ru') )
      is_custom_design_selected_and_is_missing_email = prepared_event.name == 'custom_design_system_selected' && prepared_event.properties['userEmail'].nil?
      is_design_patterns && (is_presented_with_your_subscription_and_has_generic_email || is_custom_design_selected_and_is_missing_email)
    end
  end
end