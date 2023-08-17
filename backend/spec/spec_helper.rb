ENV['RAILS_ENV'] ||= 'test'
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
  end

  config.after(:each) do |example|
    DatabaseCleaner.clean
  end
end