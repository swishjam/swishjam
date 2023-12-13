class TriggeredReport < Transactional
  belongs_to :workspace
  belongs_to :report

  attribute :payload, :jsonb, default: {}
end