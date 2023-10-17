class UserProfileEnrichmentData < Transactional
  self.table_name = :user_profile_enrichment_data
  belongs_to :workspace
  belongs_to :analytics_user_profile
end