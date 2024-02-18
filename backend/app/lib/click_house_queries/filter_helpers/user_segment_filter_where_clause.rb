module ClickHouseQueries
  module FilterHelpers
    class UserSegmentFilterWhereClause
      def self.where_clause_statements(user_segments, users_table_alias: '')
        return "1 = 1" if user_segments.empty?
        query = ""
        user_segments.each_with_index do |user_segment, i|
          query << " AND " if i > 0
          query << " ( "
          user_segment.user_segment_filters.order(sequence_index: :ASC).each do |filter|
            query << " #{filter.parent_relationship_operator} " if filter.parent_relationship_operator.present?
            case filter.config['object_type']
            when 'user'
              query << where_clause_statements_for_user_property_segment_filter(filter.config, users_table_alias: users_table_alias)
            when 'event'
              query << where_clause_statements_for_event_count_segment_filter(filter.config)
            else
              raise "Unknown `object_type` in `UserSegmentFilter`: #{filter.config['object_type']}"
            end
          end
          query << " ) "
        end
        query
      end

      private

      def self.where_clause_statements_for_event_count_segment_filter(filter_config)
        "#{LeftJoinStatementsForUserSegmentsEventFilters.join_table_alias_for_segment_filter(filter_config)}.event_count_for_user_within_lookback_period >= #{filter_config['num_event_occurrences']}"
      end

      def self.where_clause_statements_for_user_property_segment_filter(filter_config, users_table_alias: '')
        metadata_column = users_table_alias.blank? ? 'metadata' : "#{users_table_alias}.metadata"
        case filter_config['user_property_operator']
        when 'is_defined'
          "JSONHas(#{metadata_column}, '#{filter_config['user_property_name']}') = 1"
        when 'is_not_defined'
          "JSONHas(#{metadata_column}, '#{filter_config['user_property_name']}') = 0"
        when 'contains'
          "JSONExtractString(#{metadata_column}, '#{filter_config['user_property_name']}') LIKE '%#{filter_config['user_property_value']}%'"
        when 'does_not_contain'
          "JSONExtractString(#{metadata_column}, '#{filter_config['user_property_name']}') NOT LIKE '%#{filter_config['user_property_value']}%'"
        when 'equals'
          "JSONExtractString(#{metadata_column}, '#{filter_config['user_property_name']}') = '#{filter_config['user_property_value']}'"
        when 'does_not_equal'
          "JSONExtractString(#{metadata_column}, '#{filter_config['user_property_name']}') != '#{filter_config['user_property_value']}'"
        when 'greater_than'
          "JSONExtractFloat(#{metadata_column}, '#{filter_config['user_property_name']}') > #{filter_config['user_property_value']}"
        when 'less_than'
          "JSONExtractFloat(#{metadata_column}, '#{filter_config['user_property_name']}') < #{filter_config['user_property_value']}"
        when 'greater_than_or_equal_to'
          "JSONExtractFloat(#{metadata_column}, '#{filter_config['user_property_name']}') >= #{filter_config['user_property_value']}"
        when 'less_than_or_equal_to'
          "JSONExtractFloat(#{metadata_column}, '#{filter_config['user_property_name']}') <= #{filter_config['user_property_value']}"
        else
          raise "Unknown `user_property_operator` in `UserSegmentFilter`: #{filter_config['user_property_operator']}"
        end
      end
    end
  end
end