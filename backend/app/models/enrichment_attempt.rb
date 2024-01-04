class EnrichmentAttempt < Transactional
  belongs_to :workspace
  belongs_to :enrichable, polymorphic: true
  belongs_to :enriched_data, optional: true
end