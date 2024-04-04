module ClickHouseQueries
  module FilterHelpers
    class WhereClauseForFilterGroups
      class InvalidFilterGroupError < StandardError; end

      def self.where_clause_statements(filter_groups, users_table_alias: 'user_profiles', organizations_table_alias: 'organization_profiles')
        return "1 = 1" if filter_groups.empty?
        query = ""
        filter_groups.each_with_index do |filter_group, filter_group_index|
          query << " #{filter_group.previous_query_filter_group_relationship_operator.upcase} " if filter_group.previous_query_filter_group_relationship_operator.present? && filter_group_index > 0
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

            if filter.is_a?(QueryFilters::UserProperty) || filter.is_a?(QueryFilters::ProfileProperty)
              if filter.profile_type == 'user'
                query << where_clause_statements_for_profile_property_filter(filter, profile_table_alias: users_table_alias)
              elsif filter.profile_type == 'organization'
                query << where_clause_statements_for_profile_property_filter(filter, profile_table_alias: organizations_table_alias)
              else
                raise InvalidFilterGroupError, "Invalid `profile_type` config in provided `QueryFilter` (#{filter.id}): #{filter.profile_type || 'UNDEFINED'}"
              end
            elsif filter.is_a?(QueryFilters::EventCountForUserOverTimePeriod) || filter.is_a?(QueryFilters::EventCountForProfileOverTimePeriod)
              query << where_clause_statements_for_event_count_for_profile_filter(filter)
            else
              raise "Unknown `QueryFilter` type in `WhereClauseForFilterGroups`: #{filter.class}"
            end
          end
          query << " ) "
        end
        query
      end

      private

      def self.where_clause_statements_for_event_count_for_profile_filter(filter)
        "#{LeftJoinStatementsForEventCountByProfileFilters.join_table_alias_for_event_count_for_profile_filter(filter)}.event_count_for_profile_within_lookback_period #{filter.sql_event_count_operator} #{filter.num_occurrences}"
      end

      def self.where_clause_statements_for_profile_property_filter(filter, profile_table_alias: nil)
        if ['email', 'user_unique_identifier'].include?(filter.property_name) && filter.profile_type == 'user'
          column_name = profile_table_alias.nil? ? filter.property_name : [profile_table_alias, filter.property_name].join(".")
          case filter.operator
          when 'is_defined'
            "notEmpty(#{column_name}) AND isNotNull(#{column_name})"
          when 'is_not_defined'
            "empty(#{column_name}) OR isNull(#{column_name})"
          when 'contains'
            "LOWER(#{column_name}) LIKE '%#{filter.property_value.downcase}%'"
          when 'does_not_contain'
            "LOWER(#{column_name}) NOT LIKE '%#{filter.property_value.downcase}%'"
          when 'equals'
            "LOWER(#{column_name}) = '#{filter.property_value.downcase}'"
          when 'does_not_equal'
            "LOWER(#{column_name}) != '#{filter.property_value.downcase}'"
          when 'is_generic_email'
            raise InvalidFilterGroupError, "Cannot use `is_generic_email` on any other property than `email`, received: #{filter.property_name}" unless filter.property_name == 'email'
            <<~SQL
              (
                notEmpty(#{column_name}) AND 
                isNotNull(#{column_name}) AND 
                arrayElement( splitByChar('@', assumeNotNull(#{column_name})), length(splitByChar('@', assumeNotNull(#{column_name}))) ) IN [#{GenericEmailDetector::GENERIC_EMAIL_PROVIDERS.map{ |d| "'#{d}'" }.join(', ')}]
              )
            SQL
          when 'is_not_generic_email'
            raise InvalidFilterGroupError, "Cannot use `is_not_generic_email` on any other property than `email`, received: #{filter.property_name}" unless filter.property_name == 'email'
            <<~SQL
              (
                notEmpty(#{column_name}) AND 
                isNotNull(#{column_name}) AND 
                arrayElement( splitByChar('@', assumeNotNull(#{column_name})), length(splitByChar('@', assumeNotNull(#{column_name}))) ) NOT IN [#{GenericEmailDetector::GENERIC_EMAIL_PROVIDERS.map{ |d| "'#{d}'" }.join(', ')}]
              )
            SQL
          else
            raise InvalidFilterGroupError, "Unknown `user_property_operator` in `UserSegmentFilter`: #{filter.operator}"
          end
        else
          column_name = profile_table_alias.nil? ? 'metadata' : "#{profile_table_alias}.metadata"
          case filter.operator
          when 'is_defined'
            "JSONHas(#{column_name}, '#{filter.property_name}') = 1"
          when 'is_not_defined'
            "JSONHas(#{column_name}, '#{filter.property_name}') = 0"
          when 'contains'
            "(JSONHas(#{column_name}, '#{filter.property_name}') = 1 AND LOWER(JSONExtractString(#{column_name}, '#{filter.property_name}')) LIKE '%#{filter.property_value.downcase}%')"
          when 'does_not_contain'
            "(JSONHas(#{column_name}, '#{filter.property_name}') = 0 OR LOWER(JSONExtractString(#{column_name}, '#{filter.property_name}')) NOT LIKE '%#{filter.property_value.downcase}%')"
          when 'equals'
            "(JSONHas(#{column_name}, '#{filter.property_name}') = 1 AND LOWER(JSONExtractString(#{column_name}, '#{filter.property_name}')) = '#{filter.property_value.downcase}')"
          when 'does_not_equal'
            "(JSONHas(#{column_name}, '#{filter.property_name}') = 0 OR LOWER(JSONExtractString(#{column_name}, '#{filter.property_name}')) != '#{filter.property_value.downcase}')"
          when 'greater_than'
            "(JSONHas(#{column_name}, '#{filter.property_name}') AND JSONExtractFloat(#{column_name}, '#{filter.property_name}') > #{filter.property_value.to_f})"
          when 'less_than'
            "(JSONHas(#{column_name}, '#{filter.property_name}') AND JSONExtractFloat(#{column_name}, '#{filter.property_name}') < #{filter.property_value.to_f})"
          when 'greater_than_or_equal_to'
            "(JSONHas(#{column_name}, '#{filter.property_name}') AND JSONExtractFloat(#{column_name}, '#{filter.property_name}') >= #{filter.property_value.to_f})"
          when 'less_than_or_equal_to'
            "(JSONHas(#{column_name}, '#{filter.property_name}') AND JSONExtractFloat(#{column_name}, '#{filter.property_name}') <= #{filter.property_value.to_f})"
          else
            raise "Unknown `operator` value in cohort's `QueryFilter` (#{filter.id}): #{filter.operator}"
          end
        end
      end
    end
  end
end