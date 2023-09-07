Sentry.init do |config|
  config.dsn = 'https://1d35705985f7d55655e8d860381328d0@o4505092626710528.ingest.sentry.io/4505836618448897'
  config.breadcrumbs_logger = [:active_support_logger, :http_logger]

  # Set traces_sample_rate to 1.0 to capture 100%
  # of transactions for performance monitoring.
  # We recommend adjusting this value in production.
  config.traces_sample_rate = (ENV['SENTRY_TRACE_SAMPLE_RATE'] || 1.0).to_f
end