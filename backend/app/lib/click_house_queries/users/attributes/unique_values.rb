module ClickHouseQueries
  module Users
    module Attributes
      class UniqueValues
        include ClickHouseQueries::Helpers

        def initialize(workspace_id, column:)
          raise NotImplementedError, "Deprecated for now."
          @workspace_id = workspace_id.is_a?(Workspace) ? workspace_id.id : workspace_id
          @column = column
        end

        def get
          Analytics::ClickHouseRecord.execute_sql(sql.squish!)
        end

        def sql
          if @column == 'metadata'
            <<~SQL
              SELECT 
                property_name AS metadata_key, 
                JSONExtractString(metadata, property_name) AS metadata_value, 
                CAST(COUNT(*) AS INT) AS num_users
              FROM (
                SELECT 
                  swishjam_user_id,
                  argMax(metadata, updated_at) AS metadata
                FROM swishjam_user_profiles
                WHERE workspace_id = '#{@workspace_id}'
                GROUP BY swishjam_user_id
              )
              ARRAY JOIN JSONExtractKeys(metadata) AS property_name
              WHERE property_name NOT IN ('url', 'page_view_identifier', 'session_identifier', 'device_identifier', 'userIdentifier', 'user_identifier')
              GROUP BY metadata_key, metadata_value
              ORDER BY num_users DESC
            SQL
          else
            <<~SQL
              SELECT
                attr_value,
                CAST(COUNT(*) AS INT) AS num_users
              FROM (
                SELECT
                  swishjam_user_id,
                  argMax(#{@column}, updated_at) AS attr_value
                FROM swishjam_user_profiles
                WHERE workspace_id = '#{@workspace_id}'
                GROUP BY swishjam_user_id
              )
              GROUP BY attr_value
              ORDER BY num_users DESC
            SQL
          end
        end
      end
    end
  end
end