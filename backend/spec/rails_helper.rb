ENV['RAILS_ENV'] ||= 'test'
require_relative "../config/environment"
require 'factory_bot_rails'
require 'database_cleaner'
require 'helper_utils'

RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods

  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  config.before(:each) do |example|
    DatabaseCleaner.start
  end
end