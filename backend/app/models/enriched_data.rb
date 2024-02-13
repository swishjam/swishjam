class EnrichedData < Transactional
  self.table_name = :enriched_data
  belongs_to :workspace
  belongs_to :enrichable, polymorphic: true

  attribute :data, :jsonb, default: {}

  validates :enrichable_type, presence: true, inclusion: { in: [AnalyticsUserProfile.to_s, AnalyticsOrganizationProfile.to_s] }

  # makes it so that you can do `enriched_data.first_name` instead of `enriched_data.data['first_name']`
  def method_missing(method_name, *args, &block)
    if data.key?(method_name.to_s)
      data[method_name.to_s]
    else
      super
    end
  end

  def respond_to_missing?(method_name, include_private = false)
    data.key?(method_name.to_s) || super
  end
end