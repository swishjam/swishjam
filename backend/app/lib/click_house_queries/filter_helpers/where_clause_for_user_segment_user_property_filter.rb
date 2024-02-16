module ClickHouseQueries
  module FilterHelpers
    class WhereClauseForUserSegmentUserPropertyFilter
      def self.where_clause_statements(filter_config, users_table_alias: '')
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