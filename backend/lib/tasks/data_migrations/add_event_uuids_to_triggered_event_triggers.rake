namespace :data_migrations do
  task add_event_uuids_to_triggered_event_triggers: :environment do
    ActiveRecord::Base.logger.silence do
      triggered_event_triggers = TriggeredEventTrigger.where(event_uuid: nil)
      puts "Adding `event_uuid` to #{triggered_event_triggers.count} EventTriggers...".colorize(:yellow)
      triggered_event_triggers.each_with_index do |triggered_event_trigger, i|
        triggered_event_trigger.update!(event_uuid: triggered_event_trigger.event_json['uuid'])
        puts "#{i + 1}/#{triggered_event_triggers.count}".colorize(:grey)
      end
      puts "Done adding `event_uuid` to #{triggered_event_triggers.count} EventTriggers.".colorize(:green)
    end
  end
end