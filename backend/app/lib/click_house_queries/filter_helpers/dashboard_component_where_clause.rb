module ClickHouseQueries
  module FilterHelpers
    class DashboardComponentWhereClause
      class InvalidFilterGroupError < StandardError; end

      def self.where_clause_statements(query_groups)
        return '1=1' if query_groups.nil? || query_groups.empty?
        sql = ''
        query_groups.sort_by{ |group| group['sequence_index']}.map do |group|
          sql << '('
          if !group['queries'] || group['queries'].empty?
            sql << '1=1 )'
            next
          end
          if group['sequence_index'] > 0 
            if group['previous_group_operator'].nil?
              raise InvalidFilterGroupError, "Group #{group['sequence_index']} is missing a previous_group_operator and is not the first query group in the set."
            else
              sql << " #{group['previous_group_operator']} "
            end
          end
          group['queries'].sort_by{ |query| query['sequence_index']}.map do |query|
            if !query['property'] || !query['operator'] || (!query['value'] && !['is_defined', 'is_not_defined'].include?(query['operator']))
              sql << '1=1'
              next
            end
            if query['sequence_index'] > 0 
              if query['previous_query_operator'].nil?
                raise InvalidFilterGroupError, "Query #{query['sequence_index']} is missing a previous_query_operator and is not the first query in the set."
              else
                sql << " #{query['previous_query_operator']} "
              end
            end
            if query['property'].starts_with?('user.')
              sql << query_statement(
                column: 'user_properties', 
                property: query['property'].gsub('user.', ''), 
                operator: query['operator'], 
                value: query['value'],
              )
            else
              sql << query_statement(
                column: 'properties', 
                property: query['property'].gsub('event.', ''), 
                operator: query['operator'], 
                value: query['value'],
              )
            end
          end
          sql << ')'
        end
        sql
      end

      def self.query_statement(column:, property:, operator:, value:)
        case operator
        when 'equals'
          "LOWER(JSONExtractString(e.#{column}, '#{property}')) = '#{value.downcase}'"
        when 'does_not_equal'
          "LOWER(JSONExtractString(e.#{column}, '#{property}')) != '#{value.downcase}'"
        when 'contains'
          "LOWER(JSONExtractString(e.#{column}, '#{property}')) LIKE '%#{value.downcase}%'"
        when 'does_not_contain'
          "LOWER(JSONExtractString(e.#{column}, '#{property}')) NOT LIKE '%#{value.downcase}%'"
        when 'greater_than'
          "JSONExtractFloat(e.#{column}, '#{property}') > #{value.downcase}"
        when 'greater_than_or_equal_to'
          "JSONExtractFloat(e.#{column}, '#{property}') >= #{value.downcase}"
        when 'less_than'
          "JSONExtractFloat(e.#{column}, '#{property}') < #{value.downcase}"
        when 'less_than_or_equal_to'
          "JSONExtractFloat(e.#{column}, '#{property}') <= #{value.downcase}"
        when 'is_defined'
          "notEmpty(JSONExtractString(e.#{column}, '#{property}')) AND isNotNull(JSONExtractString(e.#{column}, '#{property}'))"
        when 'is_not_defined'
          "empty(JSONExtractString(e.#{column}, '#{property}')) OR isNull(JSONExtractString(e.#{column}, '#{property}'))"
        else
          raise InvalidFilterGroupError, "Invalid operator: #{operator}"
        end
      end

    end
  end
end