module EventTriggers
  class Evaluator
    def self.evaluate_ingested_events(formatted_json_events)
      all_event_triggers = get_all_event_triggers
      trigger_jsons = find_matching_triggers_for_events(formatted_json_events, all_event_triggers)
      TriggerEventTriggersInBatchesJob.perform_async(trigger_jsons) if trigger_jsons.any?
    end

    private

    def self.get_all_event_triggers
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

    def self.find_matching_triggers_for_events(formatted_json_events, triggers)
      formatted_json_events.map do |event|
        matching_triggers_for_this_event = triggers.map do |trigger| 
          if trigger['event_name'] == event['name'] && 
              trigger['public_key'] == event['swishjam_api_key'] &&
              should_ignore_event?(event) == false
            {
              event: event,
              trigger_id: trigger['trigger_id']
            }
          end
        end.compact
      end.flatten
    end

    def self.should_ignore_event?(event)
      parsed_event = Analytics::Event.parsed_from_ingestion_queue(event)
      is_design_patterns = ['swishjam_prdct-c094a41f338335c4', 'swishjam_mrkt-9a3639e811447334'].include?(parsed_event.swishjam_api_key)
      is_design_patterns &&
        parsed_event.name == 'presented_with_your_subscription' &&
        (parsed_event.properties['userEmail']&.ends_with?('gmail.com') || parsed_event.properties['userEmail']&.ends_with?('.ru') )
    end
  end
end