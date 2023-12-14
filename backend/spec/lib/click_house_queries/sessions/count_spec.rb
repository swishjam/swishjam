require 'spec_helper'

RSpec.describe ClickHouseQueries::Sessions::Count do
  describe '#count' do
    it 'counts the unique number of sessions for the time period' do
      my_api_key = 'xyz'
      # session 1
      FactoryBot.create(:analytics_event, swishjam_api_key: my_api_key, name: Analytics::Event::ReservedNames.PAGE_VIEW, occurred_at: 1.hour.ago, properties: {'session_identifier' => 'session_1' }.to_json)
      FactoryBot.create(:analytics_event, swishjam_api_key: my_api_key, name: Analytics::Event::ReservedNames.PAGE_VIEW, occurred_at: 2.hours.ago, properties: {'session_identifier' => 'session_1' }.to_json)
      # session 2
      FactoryBot.create(:analytics_event, swishjam_api_key: my_api_key, name: Analytics::Event::ReservedNames.PAGE_VIEW, occurred_at: 12.hours.ago, properties: {'session_identifier' => 'session_2' }.to_json)
      # session 3
      FactoryBot.create(:analytics_event, swishjam_api_key: my_api_key, name: Analytics::Event::ReservedNames.PAGE_VIEW, occurred_at: 24.hours.ago - 2.minutes, properties: {'session_identifier' => 'session_3' }.to_json)
      FactoryBot.create(:analytics_event, swishjam_api_key: my_api_key, name: Analytics::Event::ReservedNames.PAGE_VIEW, occurred_at: 24.hours.ago + 2.minutes, properties: {'session_identifier' => 'session_3' }.to_json)
      # session 4
      FactoryBot.create(:analytics_event, swishjam_api_key: my_api_key, name: Analytics::Event::ReservedNames.PAGE_VIEW, occurred_at: 10.hours.ago, properties: {'session_identifier' => 'session_4' }.to_json)

      # outside of time range
      FactoryBot.create(:analytics_event, swishjam_api_key: my_api_key, name: Analytics::Event::ReservedNames.PAGE_VIEW, occurred_at: 25.hours.ago, properties: {'session_identifier' => 'session_5' }.to_json)

      # someone else
      FactoryBot.create(:analytics_event, swishjam_api_key: 'someone_else', name: Analytics::Event::ReservedNames.PAGE_VIEW, occurred_at: 10.hours.ago, properties: { 'session_identifier' => 'session_6' }.to_json)

      expect(described_class.new(my_api_key, start_time: 24.hours.ago, end_time: Time.current).count).to eq(4)
    end
  end
end