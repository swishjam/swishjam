class UserProfileEnrichmentData < Transactional
  # DEPRECATED IN FAVOR OF `EnrichedData`
  self.table_name = :user_profile_enrichment_data
  belongs_to :workspace
  belongs_to :analytics_user_profile
end