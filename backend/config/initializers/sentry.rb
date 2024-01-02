# return unless (Rails.env.production? || ENV['SENTRY_ENABLED']) && ENV['SENTRY_DSN']
SWISHJAM_VERSION = File.read(Rails.root.join('.swishjam-version')).strip

Sentry.init do |config|
  config.dsn = ENV['SENTRY_DSN']
  config.breadcrumbs_logger = [:active_support_logger, :sentry_logger, :http_logger]

  config.before_send = lambda do |event, hint|
    if !Rails.env.production? && !ENV['SENTRY_ENABLED']
      raise hint[:exception].class, hint[:exception].message
    end
  end

  # Set traces_sample_rate to 1.0 to capture 100%
  # of transactions for performance monitoring.
  # We recommend adjusting this value in production.
  config.traces_sample_rate = (ENV['SENTRY_TRACE_SAMPLE_RATE'] || 0.2).to_f
  config.profiles_sample_rate = (ENV['SENTRY_PROFILE_SAMPLE_RATE'] || 0.2).to_f

  config.release = SWISHJAM_VERSION
end