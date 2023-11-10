namespace :tasks do
  desc "Pulls the events, user_identify, and organization_identify events from the ingestion queue and process them"
  task get_event_queue_stats: [:environment] do
    start = Time.current
    
    puts "Event Queue: #{Ingestion::QueueManager.read_all_records_from_queue(Ingestion::QueueManager::Queues.EVENTS).count}".colorize(:green)
    puts "User Identify Queue: #{Ingestion::QueueManager.read_all_records_from_queue(Ingestion::QueueManager::Queues.IDENTIFY).count}".colorize(:green)
    puts "Organization Identify Queue: #{Ingestion::QueueManager.read_all_records_from_queue(Ingestion::QueueManager::Queues.ORGANIZATION).count}".colorize(:green)
    
    puts "\n(Read in #{Time.current - start} seconds.)".colorize(:grey)
  end
end