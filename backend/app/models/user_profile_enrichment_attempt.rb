class UserProfileEnrichmentAttempt < Transactional
  # DEPRECATED IN FAVOR OF `EnrichmentAttempt`
  belongs_to :workspace
  belongs_to :analytics_user_profile
  belongs_to :user_profile_enrichment_data, class_name: UserProfileEnrichmentData.to_s, optional: true

  attribute :attempted_payload, :jsonb, default: {}
  attribute :attempted_at, :datetime, default: -> { Time.current }

  scope :successful, -> { where(successful: true) }
end