require "tty-prompt"
PROMPT = TTY::Prompt.new


def run_command_with_success(cmd)
  if !system cmd
    raise "Command failed, stopping execution."
  end
end

namespace :db do
  desc "Drops, creates, migrates, and seeds your local database."
  task hard_reset: [:environment] do
    raise "You are not allowed to run this task in production!!!" unless Rails.env.development? || Rails.env.test?
    db_configs = YAML.load_file(Rails.root.join('config', 'database.yml'),  aliases: true)[Rails.env]
    if !db_configs['transactional']['database'].ends_with?('dev')
      raise "In order to hard_reset the database, the database name must end in `dev`. transactional DB name is: #{db_configs['transactional']['database']}"
    end
    if !db_configs['clickhouse']['database'].ends_with?('dev')
      raise "In order to hard_reset the database, the database name must end in `dev`. clickhouse DB name is: #{db_configs['clickhouse']['database']}"
    end

    puts "Dropping Postgres and Clickhouse DBs...".colorize(:yellow)
    run_command_with_success('bundle exec rake db:drop')

    puts "\n\nCreating Postgres and Clickhouse DBs...".colorize(:yellow)
    run_command_with_success('bundle exec rake db:create')

    puts "\n\nMigrating Postgres and Clickhouse DBs...".colorize(:yellow)
    run_command_with_success('bundle exec rake db:migrate')


    puts "\n\nSeeding database with dummy data...".colorize(:yellow)
    run_command_with_success('bundle exec rake seed:dummy_data')
    
    puts "\n\nDatabase has been reset!".colorize(:green)
  end
end