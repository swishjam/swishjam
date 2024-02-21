FactoryBot.define do
  factory :query_filter do
    association :query_filter_group
    type { QueryFilters::UserProperty.to_s }
    sequence_index { 0 }
    previous_query_filter_relationship_operator { nil }
    config {{ property_name: 'email', operator: 'equals', property_value: 'jenny@swishjam.com' }}
  end

  factory :user_property_query_filter, parent: :query_filter, class: QueryFilters::UserProperty do
  end

  factory :event_count_for_user_query_filter, parent: :query_filter, class: QueryFilters::EventCountForUserOverTimePeriod do
    type { QueryFilters::EventCountForUserOverTimePeriod.to_s }
    config {{ event_name: 'user_created', num_occurrences: 5, num_lookback_days: 30 }}
  end
end