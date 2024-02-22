namespace :data_migrations do
  desc 'Update conditional triggers event names to include prefix'
  task update_conditional_triggers_event_names_to_include_prefix: :environment do
    ActiveRecord::Base.logger.silence do

      triggers = EventTrigger.where('conditional_statements != ?', '[]')
      puts "Updating #{triggers.count} triggers' conditional statements.".colorize(:green)
      EventTrigger.where('conditional_statements != ?', '[]').each do |event_trigger|
        puts ".".colorize(:yellow)
        event_trigger.conditional_statements = event_trigger.conditional_statements.map do |statement|
          if !statement['property'].start_with?('event.') && !statement['property'].start_with?('user.')
            statement['property'] = "event.#{statement['property']}"
          end
          statement
        end
        event_trigger.save!
      end
      puts "Completed.".colorize(:green)

    end
  end
end