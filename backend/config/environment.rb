# Load the Rails application.
require_relative "application"

Rails.logger.info "Booting app in #{Rails.env} (has staging ENV flag? #{ENV['IS_STAGING']}) environment..."

# Initialize the Rails application.
Rails.application.initialize!
