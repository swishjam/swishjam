namespace :data_migrations do
  task add_integrations_reference_to_api_keys: :environment do
    ActiveRecord::Base.logger.silence do
      DATA_SOURCE_INTEGRATION_TYPE_DICT = {
        ApiKey::ReservedDataSources.RESEND => Integrations::Resend.to_s,
        ApiKey::ReservedDataSources.CAL_COM => Integrations::CalCom.to_s,
        ApiKey::ReservedDataSources.INTERCOM => Integrations::Intercom.to_s,
        ApiKey::ReservedDataSources.GITHUB => Integrations::Github.to_s,
        ApiKey::ReservedDataSources.STRIPE => Integrations::Stripe.to_s,
        ApiKey::ReservedDataSources.SEGMENT => Integrations::Segment.to_s,
      }
      api_keys = ApiKey.where(integration_id: nil).where.not(data_source: [ApiKey::ReservedDataSources.PRODUCT, ApiKey::ReservedDataSources.MARKETING])
      if api_keys.count.zero?
        puts "No api keys found without an integration, exiting...".colorize(:green)
        return
      end

      puts "Going to try to add integrations reference to #{api_keys.count} api keys...".colorize(:grey)
      api_keys.each do |api_key|
        integration_type = DATA_SOURCE_INTEGRATION_TYPE_DICT[api_key.data_source]
        if integration_type.nil?
          puts "No integration type defined for data source: #{api_key.data_source}".colorize(:red)
          next
        end
        
        integrations_for_api_key = api_key.workspace.integrations.where(type: integration_type)
        if integrations_for_api_key.count > 1
          puts "More than one Integration found for api key: #{api_key.id}, skipping... (workspace: #{api_key.workspace.name})".colorize(:red)
          next
        end

        integration_for_api_key = integrations_for_api_key.first
        if integration_for_api_key.nil?
          puts "No Integration found for #{api_key.workspace.name}'s #{api_key.data_source} api key, skipping...".colorize(:red)
          next
        end

        if integration_for_api_key.api_key.present?
          puts "Integration has an api key already, skipping... (workspace: #{api_key.workspace.name})".colorize(:red)
          next
        end

        api_key.update!(integration: integration_for_api_key)
        puts "Added Integration record to #{api_key.workspace.name}'s #{api_key.data_source} api key\n".colorize(:green)
      end
      puts "Done adding Integrations reference to api keys!".colorize(:green)
    end
  end
end