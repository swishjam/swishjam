FactoryBot.define do
  factory :query_filter_group, class: QueryFilterGroup do
    sequence_index { 0 }
    previous_query_filter_group_relationship_operator { nil }
  end
  
  factory :user_segment_query_filter_group, parent: :query_filter_group do
    association :filterable, factory: :user_segment
  end
end