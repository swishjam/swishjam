class UserSegmentFilter < Transactional
  belongs_to :user_segment
  belongs_to :parent_filter, class_name: UserSegmentFilter.to_s, optional: true
  has_many :child_filters, class_name: UserSegmentFilter.to_s, foreign_key: :parent_filter_id, dependent: :destroy

  validate :has_valid_config

  private

  def has_valid_config
    if !['user', 'event'].include?(config['object_type'])
      errors.add(:config, 'object_type must be either "user" or "event"')
    elsif config['object_type'] == 'event'
      required_keys = %w[event_name num_lookback_days num_event_occurrences]
      required_keys.each do |key|
        errors.add(:config, "missing required key: #{key}") unless config[key].present?
      end
    elsif config['object_type'] == 'user'
      required_keys = %w[user_property_name user_property_operator user_property_value]
      required_keys.each do |key|
        errors.add(:config, "missing required key: #{key}") unless config[key].present?
      end
    end
  end
end


# UserSegment - name: "Active Users"
#               description: "Users who have visited 5 or more dashboards in the last 14 days, OR have recevied 4 or more reports in the last 30 days AND have invited 2 or more teammates in the last 28 days."
#
# UserSegmentFilters:
# |
# | - - id = 1
# |      parent_filter_id = NULL
# |      parent_relationship_connector = NULL
# |      object_type = 'event'
# |      object_attribute = 'url'
# |      operator = 'contains'
# |      value = '/dashboards
# |      num_days_lookback = 14
# |
# | - - - - id = 2
# |           parent_filter_id = 1 
# |           parent_relationship_connector = 'AND'
# |           object_type = 'event'
# |           object_attribute = 'url'
# |           operator = 'contains'
# |           value = '/dashboards
# |           num_days_lookback = NULL
# |
# | - - id = 3
# |      parent_filter_id = NULL
# |      parent_relationship_connector = NULL
# |      object_type = 'event'
# |      object_name = 'report_received'
# |      object_attribute = NULL
# |      operator = 'greater_than_or_equal_to'
# |      value = 4
# |      num_days_lookback = 14
# |
# | - - - - id = 4
# |           parent_filter_id = 3
# |           parent_relationship_connector = 'AND'
# |           object_type = 'event'
# |           object_name = 'teammate_invited'
# |           object_attribute = NULL
# |           operator = 'greater_than_or_equal_to'
# |           value = 2
# |           num_days_lookback = 28