FactoryBot.define do
  factory :analytics_page_hit, class: Analytics::PageHit do
    association :device, factory: :analytics_device
    association :session, factory: :analytics_session
    unique_identifier { SecureRandom.uuid }
    full_url { 'http://www.waffleshop.com/hello-world' }
    url_host { 'www.waffleshop.com' }
    url_path { '/hello-world' }
    url_query { nil }
    referrer_full_url { 'http://www.waffleshop.com/previous-page' }
    referrer_url_host { 'www.waffleshop.com' }
    referrer_url_path { '/previous-page' }
    referrer_url_query { nil }
    start_time { Time.now }
  end
end