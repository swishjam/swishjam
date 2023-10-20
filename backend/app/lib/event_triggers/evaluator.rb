module EventTriggers
  class Evaluator
    def initialize(public_key, raw_events_array)
      @public_key = public_key
      @raw_events_array = raw_events_array
    end

    def evaluate_triggers!
      workspace.event_trigger_definitions.each do |trigger|
        matching_events = @raw_events_array.find_all{ |e| e['name'] == trigger.event_name }
        matching_events.each{ |e| trigger.execute!(e) }
      end
    end

    private

    def workspace
      @workspace ||= ApiKey.enabled.includes(workspace: :event_trigger_definitions).find_by!(public_key: @public_key).workspace
    end
  end
end