module ClickHouseQueries
  module Users
    module Organizations
      class ListIds
        include ClickHouseQueries::Helpers

        def initialize(public_keys, user_profile_id:, limit: 100)
          @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
          @user_profile_id = user_profile_id
          @limit = limit
        end

        def get_all_user_ids_associated_with_org
          Analytics::Event.find_by_sql(sql).map(&:swishjam_organization_id)
        end

        def sql
          <<~SQL
            SELECT 
              user_identifies.device_identifier AS user_device_identifier,
              argMax(user_identifies.swishjam_user_id, user_identifies.occurred_at) AS swishjam_user_id
            FROM user_identify_events AS user_identifies
            JOIN user_organization_device_identifiers AS join_table ON user_identifies.device_identifier = join_table.user_device_identifier
            JOIN (
              SELECT 
                organization_device_identifier,
                argMax(swishjam_organization_id, occurred_at) AS swishjam_organization_id
              FROM organization_identify_events
              GROUP BY organization_device_identifier
            ) AS organization_identifies ON join_table.organization_device_identifier = organization_identifies.organization_device_identifier
            WHERE 
              organization_identifies.swishjam_organization_id = '#{@user_profile_id}' AND
              user_identifies.swishjam_api_key in #{formatted_in_clause(@public_keys)}
            GROUP BY user_device_identifier
          SQL
        end
      end
    end
  end
end