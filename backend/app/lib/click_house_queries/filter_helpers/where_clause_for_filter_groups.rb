module ClickHouseQueries
  module FilterHelpers
    class WhereClauseForFilterGroups
      class InvalidFilterGroupError < StandardError; end

      def self.where_clause_statements(filter_groups, users_table_alias: 'user_profiles')
        return "1 = 1" if filter_groups.empty?
        query = "( "
        filter_groups.each_with_index do |filter_group, filter_group_index|
          query << " #{filter_group.previous_query_filter_group_relationship_operator} " if filter_group.previous_query_filter_group_relationship_operator.present? && filter_group_index > 0
          if filter_group_index == 0 && filter_group.previous_query_filter_group_relationship_operator.present?
            Sentry.capture_message("First filter group item should not have a `previous_query_filter_group_relationship_operator`, ignoring the operator in the query...", extra: { filter_group: filter_group })
          elsif filter_group_index > 0 && filter_group.previous_query_filter_group_relationship_operator.blank?
            raise InvalidFilterGroupError, "`QueryFilterGroup` #{filter_group.id} at index #{i} must have a `previous_query_filter_group_relationship_operator` if it is not the first group, cannot build query."
          end

          query << " ( "
          filter_group.query_filters.in_sequence_order.each_with_index do |filter, filter_index|
            query << " #{filter.previous_query_filter_relationship_operator} " if filter.previous_query_filter_relationship_operator.present? && filter_index > 0
            if filter_index == 0 && filter.previous_query_filter_relationship_operator.present?
              Sentry.capture_message("First filter item should not have a `previous_query_filter_relationship_operator`, ignoring the operator in the query...", extra: { filter: filter })
            elsif filter_index > 0 && filter.previous_query_filter_relationship_operator.blank?
              raise InvalidFilterGroupError, "`QueryFilter`  #{filter.id} at index #{i} must have a `previous_query_filter_relationship_operator` if it is not the first item in the group, cannot build query."
            end

            if filter.is_a?(QueryFilters::UserProperty)
              query << where_clause_statements_for_user_property_segment_filter(filter, users_table_alias: users_table_alias)
            elsif filter.is_a?(QueryFilters::EventCountForUserOverTimePeriod)
              query << where_clause_statements_for_event_count_segment_filter(filter)
            else
              raise "Unknown `QueryFilter` type in `WhereClauseForFilterGroups`: #{filter.class}"
            end
          end
          query << " ) "
        end
        query << " ) "
        query
      end

      private

      def self.where_clause_statements_for_event_count_segment_filter(filter)
        "#{LeftJoinStatementsForEventCountByUserFilters.join_table_alias_for_segment_filter(filter)}.event_count_for_user_within_lookback_period >= #{filter.num_occurrences}"
      end

      def self.where_clause_statements_for_user_property_segment_filter(filter, users_table_alias: 'user_profiles')
        metadata_column = users_table_alias.blank? ? 'metadata' : "#{users_table_alias}.metadata"
        case filter.operator
        when 'is_defined'
          "JSONHas(#{metadata_column}, '#{filter.property_name}') = 1"
        when 'is_not_defined'
          "JSONHas(#{metadata_column}, '#{filter.property_name}') = 0"
        when 'contains'
          "LOWER(JSONExtractString(#{metadata_column}, '#{filter.property_name}')) LIKE '%#{filter.property_value.downcase}%'"
        when 'does_not_contain'
          "LOWER(JSONExtractString(#{metadata_column}, '#{filter.property_name}')) NOT LIKE '%#{filter.property_value.downcase}%'"
        when 'equals'
          "LOWER(JSONExtractString(#{metadata_column}, '#{filter.property_name}')) = '#{filter.property_value.downcase}'"
        when 'does_not_equal'
          "LOWER(JSONExtractString(#{metadata_column}, '#{filter.property_name}')) != '#{filter.property_value.downcase}'"
        when 'greater_than'
          "JSONExtractFloat(#{metadata_column}, '#{filter.property_name}') > #{filter.property_value.to_f}"
        when 'less_than'
          "JSONExtractFloat(#{metadata_column}, '#{filter.property_name}') < #{filter.property_value.to_f}"
        when 'greater_than_or_equal_to'
          "JSONExtractFloat(#{metadata_column}, '#{filter.property_name}') >= #{filter.property_value.to_f}"
        when 'less_than_or_equal_to'
          "JSONExtractFloat(#{metadata_column}, '#{filter.property_name}') <= #{filter.property_value.to_f}"
        else
          raise "Unknown `user_property_operator` in `UserSegmentFilter`: #{filter.operator}"
        end
      end
    end
  end
end