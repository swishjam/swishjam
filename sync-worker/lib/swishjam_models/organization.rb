require_relative 'base'

module SwishjamModels
  class Organization
    self.data_sources_mapping = {
      posthog_organizations: {
        id: 'source_id'
      },
      stripe_customers: {
        id: 'source_id'
      }
    }
  end
end