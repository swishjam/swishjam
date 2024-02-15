ENV['RAILS_ENV'] ||= 'test'

require 'simplecov'
SimpleCov.start 'rails' do
  # add_filter '/spec/'
end

require_relative "../config/environment"
require 'factory_bot_rails'
require 'database_cleaner'
require 'helpers/utils'
require 'helpers/stripe_mocks'
require 'sidekiq/testing'

RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods
  Sidekiq::Testing.fake!

  def _flush_clickhouse_data!
    ActiveRecord::Base.logger.silence do
      Analytics::ClickHouseRecord.connection.tables.excluding('schema_migrations', 'ar_internal_metadata').each do |table|
        if ['revenue_monthly_retention_periods', 'swishjam_user_profiles', 'swishjam_organization_profiles', 'swishjam_organization_members'].include?(table)
          Analytics::ClickHouseRecord.execute_sql("DELETE FROM #{table} WHERE workspace_id IS NOT NULL", format: nil)
        else
          Analytics::ClickHouseRecord.execute_sql("DELETE FROM #{table} WHERE swishjam_api_key IS NOT NULL", format: nil)
        end
        Analytics::ClickHouseRecord.execute_sql("OPTIMIZE TABLE #{table} FINAL", format: nil)
      end
    end
  end

  config.before(:suite) do
    # DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.strategy = :truncation
    DatabaseCleaner.clean_with(:truncation)
  end

  config.before(:each) do |example|
    DatabaseCleaner.start
    _flush_clickhouse_data!
  rescue => e
    DatabaseCleaner.start
    raise e
  end

  config.after(:each) do |example|
    DatabaseCleaner.clean
    _flush_clickhouse_data!
  rescue => e
    DatabaseCleaner.start
    raise e
  end
end