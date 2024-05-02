module ClickHouseQueries
  module Events
    class PieChart
      include ClickHouseQueries::Helpers

      def initialize(
        public_keys, 
        event:, 
        property:, 
        aggregation_method: 'count',
        start_time:, 
        end_time:, 
        query_groups: [],
        group_by:, 
        select_function_formatter: nil, 
        select_function_argument: nil,
        count_distinct_property: nil,
        property_alias: nil, 
        max_ranking_to_not_be_considered_other: 10,
        exclude_empty_values: true,
        empty_value_placeholder: 'EMPTY'
      )
        @public_keys = public_keys.is_a?(Array) ? public_keys : [public_keys]
        @event = event
        @property = property
        @aggregation_method = aggregation_method
        @query_groups = query_groups
        @start_time = start_time 
        @end_time = end_time
        @group_by = group_by
        @select_function_formatter = select_function_formatter
        @select_function_argument = select_function_argument
        @property_alias = property_alias || property.to_s.gsub(/user\./, '').gsub(/organization\./, '').gsub(/\s|\./, '_')
        @count_distinct_property = count_distinct_property || 'uuid'
        @max_ranking_to_not_be_considered_other = max_ranking_to_not_be_considered_other
        @exclude_empty_values = exclude_empty_values
        @empty_value_placeholder = empty_value_placeholder
      end

      def get
        Analytics::Event.find_by_sql(sql.squish!)
      end

      def sql
        <<~SQL
          WITH ranked_properties AS (
            SELECT
              #{select_clause_for_aggregation_method} AS #{@property_alias},
              CAST(COUNT(DISTINCT #{distinct_count_statement}) AS INT) AS count,
              DENSE_RANK() OVER (ORDER BY COUNT() DESC, #{@property_alias} ASC) AS rank,
              IF (rank <= #{@max_ranking_to_not_be_considered_other}, #{@property_alias}, 'OTHER') AS #{@property_alias}_or_other
            FROM (#{from_clause}) AS e
            WHERE
              #{ClickHouseQueries::FilterHelpers::DashboardComponentWhereClause.where_clause_statements(@query_groups)}
              #{@exclude_empty_values ?  " AND notEmpty(JSONExtractString(#{property_column}, '#{@property}'))" : ''}
            GROUP BY #{@property_alias}
          )
          SELECT
            IF(empty(rr.#{@property_alias}_or_other), '#{@empty_value_placeholder}', rr.#{@property_alias}_or_other) AS #{@property_alias},
            CAST(COUNT() AS INT) AS count
          FROM (#{from_clause}) AS e
          JOIN ranked_properties AS rr ON JSONExtractString(#{property_column}, '#{@property}') = rr.#{@property_alias}
          WHERE
            #{ClickHouseQueries::FilterHelpers::DashboardComponentWhereClause.where_clause_statements(@query_groups)}
            #{@exclude_empty_values ?  " AND notEmpty(#{@property_alias})" : ''}
          GROUP BY #{@property_alias}
          ORDER BY count DESC
        SQL
      end

      def from_clause
        columns = ['name']
        columns << 'properties' if requires_properties_column?
        columns << 'user_profile_id' if @user_profile_id || @distinct_count_property == 'users' || @aggregation_method == 'users'
        columns << 'user_properties' if requires_user_properties_column?
        columns << 'organization_profile_id' if @organization_profile_id || @distinct_count_property == 'organizations' || @aggregation_method == 'organizations'
        ClickHouseQueries::Common::DeDupedEventsQuery.sql(
          public_keys: @public_keys,
          start_time: @start_time,
          end_time: @end_time,
          event_name: @event,
          columns: columns,
        )
      end

      def requires_properties_column?
        return true if @property.present? && @property != 'name' && !@property.starts_with?('user.') && !@property.starts_with?('organization.')
        return true if @group_by.present? && @group_by != 'name' && !@group_by.starts_with?('user.') && !@group_by.starts_with?('organization.')
        return true if @query_groups.any? { |group| (group['queries'] || []).any? { |query| query['property'] && !query['property'].starts_with?('user.') && !@query['property'].starts_with?('organization.') }}
        false
      end

      def requires_user_properties_column?
        return true if @property.present? && @property.starts_with?('user.')
        return true if @group_by.present? && @group_by.starts_with?('user.')
        return true if @query_groups.any? { |group| (group['queries'] || []).any? { |query| query['property'] && query['property'].starts_with?('user.') }}
        false
      end

      def requires_organization_properties_column?
        return true if @property.present? && @property.starts_with?('organization.')
        return true if @group_by.present? && @group_by.starts_with?('organization.')
        return true if @query_groups.any? { |group| (group['queries'] || []).any? { |query| query['property'] && query['property'].starts_with?('organization.') }}
        false
      end

      def distinct_count_statement
        @count_distinct_property != 'uuid' ? "JSONExtractString(e.properties, '#{@count_distinct_property}')" : 'e.uuid'
      end

      def select_clause_for_aggregation_method
        case @aggregation_method
        when 'count'
          <<~SQL
            IF(
              empty(JSONExtractString(#{property_column}, '#{@property}')),
              '#{@empty_value_placeholder}',
              JSONExtractString(#{property_column}, '#{@property}')
            )
          SQL
        when 'average', 'avg'
          "CAST(AVG(JSONExtractFloat(#{property_column}, '#{@property}')) AS FLOAT)"
        when 'sum'
          "CAST(SUM(JSONExtractFloat(#{property_column}, '#{@property}')) AS FLOAT)"
        when 'minimum', 'min'
          "CAST(MIN(JSONExtractFloat(#{property_column}, '#{@property}')) AS FLOAT)"
        when 'maximum', 'max'
          "CAST(MAX(JSONExtractFloat(#{property_column}, '#{@property}')) AS FLOAT)"
        else
          raise ArgumentError, "Unsupported aggregation_method method: #{@aggregation_method}"
        end
      end

      def property_column
        @property.starts_with?('user.') ? 'e.user_properties' : @property.starts_with?('organization.') ? 'e.organization_properties' : 'e.properties'
      end

    end
  end
end