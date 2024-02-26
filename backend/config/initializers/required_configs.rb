required_env_vars = %w[REDIS_URL REDIS_INGESTION_QUEUE_URL]

required_env_vars.each do |env_var|
  if !ENV[env_var]
    raise "Cannot boot application without the `#{env_var}` ENV set."
  end
end