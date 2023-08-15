FactoryBot.define do
  factory :analytics_device, class: Analytics::Device do
    association :swishjam_organization, factory: :swishjam_organization
    association :user, factory: :analytics_user
    fingerprint { 'unique-device-fingerprint' }
    user_agent { 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)' }
    browser { 'Chrome' }
    browser_version { '1.0' }
    os { 'Mac OS X' }
    os_version { '10.15.7' }
  end
end