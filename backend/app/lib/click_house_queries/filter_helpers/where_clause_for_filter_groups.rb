module ClickHouseQueries
  module FilterHelpers
    class WhereClauseForFilterGroups
      class InvalidFilterGroupError < StandardError; end

      def self.where_clause_statements(filter_groups, users_table_alias: 'user_profiles')
        return "1 = 1" if filter_groups.empty?
        query = ""
        filter_groups.each_with_index do |filter_group, filter_group_index|
          query << " #{filter_group.previous_query_filter_group_relationship_operator} " if filter_group.previous_query_filter_group_relationship_operator.present? && filter_group_index > 0
          if filter_group_index == 0 && filter_group.previous_query_filter_group_relationship_operator.present?
            Sentry.capture_message("First filter group item should not have a `previous_query_filter_group_relationship_operator`, ignoring the operator in the query...", extra: { filter_group: filter_group })
          elsif filter_group_index > 0 && filter_group.previous_query_filter_group_relationship_operator.blank?
            raise InvalidFilterGroupError, "`QueryFilterGroup` #{filter_group.id} at index #{i} must have a `previous_query_filter_group_relationship_operator` if it is not the first group, cannot build query."
          end

          query << " ( "
          # using .sort here instead of the scope so that it can iterate over in memory objects that are not in the DB
          sorted_query_filters = filter_group.query_filters.sort{ |f| f.sequence_index }
          sorted_query_filters.each_with_index do |filter, filter_index|
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
        query
      end

      private

      def self.where_clause_statements_for_event_count_segment_filter(filter)
        "#{LeftJoinStatementsForEventCountByUserFilters.join_table_alias_for_segment_filter(filter)}.event_count_for_user_within_lookback_period >= #{filter.num_occurrences}"
      end

      def self.where_clause_statements_for_user_property_segment_filter(filter, users_table_alias: 'user_profiles')
        if ['email', 'user_unique_identifier'].include?(filter.property_name)
          user_column = users_table_alias.blank? ? filter.property_name : [users_table_alias, filter.property_name].join(".")
          case filter.operator
          when 'is_defined'
            "notEmpty(#{user_column}) AND isNotNull(#{user_column})"
          when 'is_not_defined'
            "empty(#{user_column}) OR isNull(#{user_column})"
          when 'contains'
            "LOWER(#{user_column}) LIKE '%#{filter.property_value.downcase}%'"
          when 'does_not_contain'
            "LOWER(#{user_column}) NOT LIKE '%#{filter.property_value.downcase}%'"
          when 'equals'
            "LOWER(#{user_column}) = '#{filter.property_value.downcase}'"
          when 'does_not_equal'
            "LOWER(#{user_column}) != '#{filter.property_value.downcase}'"
          when 'is_generic_email'
            raise InvalidFilterGroupError, "Cannot use `is_generic_email` on any other property than `email`, received: #{filter.property_name}" unless filter.property_name == 'email'
            <<~SQL
              (
                notEmpty(#{user_column}) AND 
                isNotNull(#{user_column}) AND 
                arrayElement( splitByChar('@', assumeNotNull(#{user_column})), length(splitByChar('@', assumeNotNull(#{user_column}))) ) IN [#{GenericEmailDetector::GENERIC_EMAIL_PROVIDERS.map{ |d| "'#{d}'" }.join(', ')}]
              )
            SQL
          when 'is_not_generic_email'
            raise InvalidFilterGroupError, "Cannot use `is_not_generic_email` on any other property than `email`, received: #{filter.property_name}" unless filter.property_name == 'email'
            <<~SQL
              (
                notEmpty(#{user_column}) AND 
                isNotNull(#{user_column}) AND 
                arrayElement( splitByChar('@', assumeNotNull(#{user_column})), length(splitByChar('@', assumeNotNull(#{user_column}))) ) NOT IN [#{GenericEmailDetector::GENERIC_EMAIL_PROVIDERS.map{ |d| "'#{d}'" }.join(', ')}]
              )
            SQL
          else
            raise InvalidFilterGroupError, "Unknown `user_property_operator` in `UserSegmentFilter`: #{filter.operator}"
          end
        else
          user_column = users_table_alias.blank? ? 'metadata' : "#{users_table_alias}.metadata"
          case filter.operator
          when 'is_defined'
            "JSONHas(#{user_column}, '#{filter.property_name}') = 1"
          when 'is_not_defined'
            "JSONHas(#{user_column}, '#{filter.property_name}') = 0"
          when 'contains'
            "LOWER(JSONExtractString(#{user_column}, '#{filter.property_name}')) LIKE '%#{filter.property_value.downcase}%'"
          when 'does_not_contain'
            "LOWER(JSONExtractString(#{user_column}, '#{filter.property_name}')) NOT LIKE '%#{filter.property_value.downcase}%'"
          when 'equals'
            "LOWER(JSONExtractString(#{user_column}, '#{filter.property_name}')) = '#{filter.property_value.downcase}'"
          when 'does_not_equal'
            "LOWER(JSONExtractString(#{user_column}, '#{filter.property_name}')) != '#{filter.property_value.downcase}'"
          when 'greater_than'
            "JSONExtractFloat(#{user_column}, '#{filter.property_name}') > #{filter.property_value.to_f}"
          when 'less_than'
            "JSONExtractFloat(#{user_column}, '#{filter.property_name}') < #{filter.property_value.to_f}"
          when 'greater_than_or_equal_to'
            "JSONExtractFloat(#{user_column}, '#{filter.property_name}') >= #{filter.property_value.to_f}"
          when 'less_than_or_equal_to'
            "JSONExtractFloat(#{user_column}, '#{filter.property_name}') <= #{filter.property_value.to_f}"
          else
            raise "Unknown `user_property_operator` in `UserSegmentFilter`: #{filter.operator}"
          end
        end
      end
    end
  end
end