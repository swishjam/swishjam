module Analytics
  class ClickHouseRecord < ApplicationRecord
    self.abstract_class = true
    connects_to database: { writing: :clickhouse, reading: :clickhouse }

    scope :by_public_key, -> (public_key) { where(swishjam_api_key: public_key) }
    scope :for_public_key, -> (public_key) { by_public_key(public_key) }
    scope :by_workspace, -> (workspace) { by_public_key(workspace.public_key) }
    scope :for_workspace, -> (workspace) { by_workspace(workspace) }
  end
end