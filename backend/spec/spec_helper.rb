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

RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods

  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  config.before(:each) do |example|
    DatabaseCleaner.start

    ActiveRecord::Base.logger.silence do
      Analytics::ClickHouseRecord.connection.tables.excluding('schema_migrations', 'ar_internal_metadata').each do |table|
        Analytics::ClickHouseRecord.execute_sql("DELETE FROM #{table} WHERE swishjam_api_key IS NOT NULL", format: nil)
        Analytics::ClickHouseRecord.execute_sql("OPTIMIZE TABLE #{table} FINAL", format: nil)
      end
    end
  end

  config.after(:each) do |example|
    DatabaseCleaner.clean

    ActiveRecord::Base.logger.silence do
      Analytics::ClickHouseRecord.connection.tables.excluding('schema_migrations', 'ar_internal_metadata').each do |table|
        Analytics::ClickHouseRecord.execute_sql("DELETE FROM #{table} WHERE swishjam_api_key IS NOT NULL", format: nil)
        Analytics::ClickHouseRecord.execute_sql("OPTIMIZE TABLE #{table} FINAL", format: nil)
      end
    end
  end
end