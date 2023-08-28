FactoryBot.define do
  factory :workspace do
    public_key { 'public_key' }
    name { 'Some workspace name!' }
    company_url { 'www.example.com' }
  end
end