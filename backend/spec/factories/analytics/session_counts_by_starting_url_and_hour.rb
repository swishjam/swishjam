FactoryBot.define do
  factory :analytics_session_counts_by_analytics_family_and_hour, class: Analytics::SessionCountByAnalyticsFamilyAndHour do
    swishjam_api_key { 'my_api_key' }
    analytics_family { 'marketing' }
    occurred_at { Time.current }
    count { 1 }
  end
end