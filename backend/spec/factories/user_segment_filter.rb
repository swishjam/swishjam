FactoryBot.define do
  factory :user_segment_filter do
    association :user_segment
    parent_filter_id { nil }
    sequence_index { 1 }
    parent_relationship_operator { nil }
    config {{ object_type: 'event', event_name: 'user_signed_up', num_lookback_days: 30, num_event_occurrences: 5 }}
  end
end