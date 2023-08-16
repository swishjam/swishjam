FactoryBot.define do
  factory :swishjam_organization, class: Swishjam::Organization do
    name { 'Waffle Shop' }
    url { 'http://www.waffleshop.com' }
  end
end