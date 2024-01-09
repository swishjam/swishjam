def run_command_with_success(cmd)
  if !system cmd
    raise "Command failed, stopping execution."
  end
end

namespace :db do
  desc "Drops, creates, migrates, and seeds your local database."
  task wipe_all_data: [:environment] do
    raise "You are not allowed to run this task in production!!!" unless Rails.env.development? || Rails.env.test?
    db_configs = YAML.load_file(Rails.root.join('config', 'database.yml'),  aliases: true)[Rails.env]
    if !db_configs['transactional']['database'].ends_with?('dev')
      raise "In order to hard_reset the database, the database name must end in `dev`. transactional DB name is: #{db_configs['transactional']['database']}"
    end
    if !db_configs['clickhouse']['database'].ends_with?('dev')
      raise "In order to hard_reset the database, the database name must end in `dev`. clickhouse DB name is: #{db_configs['clickhouse']['database']}"
    end

    puts "Wiping all data...".colorize(:yellow)
    Workspace.destroy_all
    User.destroy_all
    DataSync.destroy_all
    IngestionBatch.destroy_all
    AuthSession.destroy_all

    Analytics::ClickHouseRecord.execute_sql('DELETE FROM swishjam_user_profiles WHERE workspace_id IS NOT NULL', format: nil)
    Analytics::ClickHouseRecord.execute_sql('DELETE FROM events WHERE swishjam_api_key IS NOT NULL', format: nil)
    Analytics::ClickHouseRecord.execute_sql('DELETE FROM swishjam_organization_profiles WHERE swishjam_api_key IS NOT NULL', format: nil)
    Analytics::ClickHouseRecord.execute_sql('DELETE FROM user_identify_events WHERE swishjam_api_key IS NOT NULL', format: nil)
    Analytics::ClickHouseRecord.execute_sql('DELETE FROM billing_data_snapshots WHERE swishjam_api_key IS NOT NULL', format: nil)
  end
end