module ClickHouseQueries
  module Users
    class List
      include ClickHouseQueries::Helpers

      def initialize(workspace_id, where: {}, columns: ['swishjam_user_id', 'email', 'full_name', 'created_at'], page: 1, limit: 25)
        @workspace_id = workspace_id.is_a?(Workspace) ? workspace_id.id : workspace_id
        @where = where
        @columns = columns
        @page = page.to_i
        @limit = limit.to_i
      end

      def get
        users = Analytics::ClickHouseRecord.execute_sql(sql.squish!)
        total_num_users = Analytics::ClickHouseRecord.execute_sql(total_num_pages_sql.squish!).first['total_num_users']
        {
          users: users,
          total_num_users: total_num_users,
          total_num_pages: (total_num_users.to_f / @limit.to_f).ceil,
        }.with_indifferent_access
      end

      def total_num_pages_sql
        if @where.nil? || @where.empty?
          <<~SQL
            SELECT CAST(COUNT(*) AS INT) AS total_num_users
            FROM swishjam_user_profiles as user_profiles
            WHERE workspace_id = '#{@workspace_id}'
          SQL
        else
          <<~SQL
            SELECT CAST(COUNT(*) AS INT) AS total_num_users
            FROM swishjam_user_profiles as user_profiles
            WHERE 
              workspace_id = '#{@workspace_id}' AND
              #{@where.map do |key, value|
                if value.is_a?(Array) && value.empty?
                  "1 = 1"
                else
                  if key.start_with?('metadata')
                    if value.is_a?(Array)
                      "JSONExtractString(metadata, '#{key.split('.')[1..key.split('.').length - 1].join('.')}') IN #{formatted_in_clause(value)}"
                    else
                      "JSONExtractString(metadata, '#{key.split('.')[1..key.split('.').length - 1].join('.')}') = '#{value}'"
                    end
                  else
                    if value.is_a?(Array)
                      "#{key} IN #{formatted_in_clause(value)}"
                    else
                      "#{key} = '#{value}'"
                    end
                  end
                end
              end.join(' AND ')}
          SQL
        end
      end

      def sql
        if @where.nil? || @where.empty?
          <<~SQL
            SELECT #{@columns.map{ |column| "argMax(#{column}, updated_at) AS #{column}" }.join(', ')}
            FROM swishjam_user_profiles as user_profiles
            WHERE workspace_id = '#{@workspace_id}'
            GROUP BY user_profiles.workspace_id, user_profiles.swishjam_user_id
            ORDER BY created_at DESC
            LIMIT #{@limit} OFFSET #{(@page - 1) * @limit}
          SQL
        else
          <<~SQL
            SELECT #{@columns.map{ |column| "argMax(#{column}, updated_at) AS #{column}" }.join(', ')}
            FROM swishjam_user_profiles as user_profiles
            WHERE 
              workspace_id = '#{@workspace_id}' AND
              #{@where.map do |key, value|
                if value.is_a?(Array) && value.empty?
                  "1 = 1"
                else
                  if key.start_with?('metadata')
                    if value.is_a?(Array)
                      "JSONExtractString(metadata, '#{key.split('.')[1..key.split('.').length - 1].join('.')}') IN #{formatted_in_clause(value)}"
                    else
                      "JSONExtractString(metadata, '#{key.split('.')[1..key.split('.').length - 1].join('.')}') = '#{value}'"
                    end
                  else
                    if value.is_a?(Array)
                      "#{key} IN #{formatted_in_clause(value)}"
                    else
                      "#{key} = '#{value}'"
                    end
                  end
                end
              end.join(' AND ')}
            GROUP BY user_profiles.workspace_id, user_profiles.swishjam_user_id
            ORDER BY created_at DESC
            LIMIT #{@limit} OFFSET #{(@page - 1) * @limit}
          SQL
        end
      end
    end
  end
end