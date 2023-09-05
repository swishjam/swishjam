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

    # this sucks, how come I cant use DatabaseCleaner or at least purge data
    ActiveRecord::Base.logger.silence do
      puts "Setting up Clickhouse DB...."
      system('rails db:drop:clickhouse')
      system('rails db:create:clickhouse')
      system('rails db:migrate:clickhouse')
    end
  end

  config.after(:each) do |example|
    DatabaseCleaner.clean

    # this sucks, how come I cant use DatabaseCleaner or at least purge data
    ActiveRecord::Base.logger.silence do
      puts "Breaking down Clickhouse DB...."
      system('rails db:drop:clickhouse')
      system('rails db:create:clickhouse')
      system('rails db:migrate:clickhouse')
    end
  end
end