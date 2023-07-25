require_relative 'base'

module SwishjamModels
  class Subscription < Base
    self.data_sources_mapping = {
      stripe_subscriptions: {
        id: 'source_id',
        name: 'tier'
      }
    }
  end
end