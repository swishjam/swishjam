require 'spec_helper'

describe ClickHouseQueries::Events::List do
  before do
    @public_key = 'my_public_key'
  end

  describe '#get' do
    it 'returns a list of individual events when no event or property is specified' do
      events = [
        { uuid: '1', name: 'event_1', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.hour.ago, ingested_at: Time.current },
        { uuid: '2', name: 'event_1', properties: { 'property_2' => 'value_2' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: Time.current },
        { uuid: '3', name: 'event_2', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: Time.current },
        { uuid: '4', name: 'someone_elses_event', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: 'different!', occurred_at: 1.day.ago, ingested_at: Time.current },
        { uuid: '5', name: 'outside_timeframe', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 3.days.ago, ingested_at: Time.current },
      ]
      Analytics::Event.insert_all!([
        # does not use this one because its not unique and was ingested before the other
        { uuid: '3', name: 'event_2', properties: { 'not' => 'me!' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: 1.minute.ago },
      ])
      Analytics::Event.insert_all!(events)

      results = described_class.new(@public_key, start_time: 2.days.ago, end_time: Time.current).get
      expect(results.count).to eq(3)
      uuid_1 = results.find{ |event| event.name == 'event_1' && event.properties == { 'property_1' => 'value_1' }.to_json }
      uuid_2 = results.find{ |event| event.name == 'event_1' && event.properties == { 'property_2' => 'value_2' }.to_json }
      uuid_3 = results.find{ |event| event.name == 'event_2' && event.properties == { 'property_1' => 'value_1' }.to_json }
      expect(uuid_1).to_not be(nil)
      expect(uuid_2).to_not be(nil)
      expect(uuid_3).to_not be(nil)
    end

    it 'returns a list of a individual events and their counts by property when an event and property is specified' do
      events = [
        { uuid: '1', name: 'event_1', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.hour.ago, ingested_at: Time.current },
        { uuid: '2', name: 'event_1', properties: { 'property_1' => 'value_2' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: Time.current },
        { uuid: '3', name: 'event_1', properties: { 'property_1' => 'value_2' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: Time.current },
        { uuid: '4', name: 'someone_elses_event', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: 'different!', occurred_at: 1.day.ago, ingested_at: Time.current },
        { uuid: '5', name: 'event_1', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 3.days.ago, ingested_at: Time.current },
      ]
      Analytics::Event.insert_all!([
        # does not use this one because its not unique and was ingested before the other
        { uuid: '3', name: 'event_1', properties: { 'property_1' => 'idk!' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: 1.minute.ago },
      ])
      Analytics::Event.insert_all!(events)

      results = described_class.new(@public_key, start_time: 2.days.ago, end_time: Time.current, event: 'event_1', property: 'property_1').get
      expect(results.count).to eq(2)
      value_1_record = results.find{ |event| event.property_1 == 'value_1' }
      expect(value_1_record.count).to be(1)
      value_2_record = results.find{ |event| event.property_1 == 'value_2' }
      expect(value_2_record.count).to be(2)
    end

    it 'returns a list of individual events for a specic user when no event or property is specified but a user_profile_id is' do
      events = [
        { uuid: '1', user_profile_id: '1', name: 'event_1', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.hour.ago, ingested_at: Time.current },
        { uuid: '2', user_profile_id: '1', name: 'event_1', properties: { 'property_2' => 'value_2' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: Time.current },
        { uuid: '3', user_profile_id: '1', name: 'event_2', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: Time.current },
        { uuid: '4', user_profile_id: '2', name: 'someone_elses_event', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: Time.current },
        { uuid: '5', user_profile_id: '1', name: 'outside_timeframe', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 3.days.ago, ingested_at: Time.current },
      ]
      Analytics::Event.insert_all!([
        # does not use this one because its not unique and was ingested before the other
        { uuid: '3', user_profile_id: '1', name: 'event_2', properties: { 'not' => 'me!' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: 1.minute.ago },
      ])
      Analytics::Event.insert_all!(events)

      Analytics::SwishjamUserProfile.insert_all!([
        { workspace_id: 'xyz', swishjam_user_id: '1' },
        { workspace_id: 'xyz', swishjam_user_id: '2' },
        { workspace_id: 'abc', swishjam_user_id: '1' },
      ])

      results = described_class.new(@public_key, user_profile_id: '1', workspace_id: 'xyz', start_time: 2.days.ago, end_time: Time.current).get
      expect(results.count).to eq(3)
      uuid_1 = results.find{ |event| event.name == 'event_1' && event.properties == { 'property_1' => 'value_1' }.to_json }
      uuid_2 = results.find{ |event| event.name == 'event_1' && event.properties == { 'property_2' => 'value_2' }.to_json }
      uuid_3 = results.find{ |event| event.name == 'event_2' && event.properties == { 'property_1' => 'value_1' }.to_json }
      expect(uuid_1).to_not be(nil)
      expect(uuid_2).to_not be(nil)
      expect(uuid_3).to_not be(nil)
    end

    it 'returns a list of individual events for a specic user when no event or property is specified but a user_profile_id is and takes into account merged user profiles' do
      events = [
        { uuid: '1', user_profile_id: '1', name: 'event_1', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.hour.ago, ingested_at: Time.current },
        { uuid: '2', user_profile_id: '1', name: 'event_1', properties: { 'property_2' => 'value_2' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: Time.current },
        { uuid: '3', user_profile_id: '1', name: 'event_2', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: Time.current },
        { uuid: '4', user_profile_id: '2', name: 'someone_elses_event', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: Time.current },
        { uuid: '5', user_profile_id: '1', name: 'outside_timeframe', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 3.days.ago, ingested_at: Time.current },
        { uuid: '6', user_profile_id: '9', name: 'event_3', properties: { 'merged' => 'from_other_profile!' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: Time.current },
      ]
      Analytics::Event.insert_all!([
        # does not use this one because its not unique and was ingested before the other
        { uuid: '3', user_profile_id: '1', name: 'event_2', properties: { 'not' => 'me!' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: 1.minute.ago },
      ])
      Analytics::Event.insert_all!(events)

      Analytics::SwishjamUserProfile.insert_all!([
        { workspace_id: 'xyz', swishjam_user_id: '1', merged_into_swishjam_user_id: nil },
        { workspace_id: 'xyz', swishjam_user_id: '2', merged_into_swishjam_user_id: nil },
        { workspace_id: 'abc', swishjam_user_id: '1', merged_into_swishjam_user_id: nil },
        { workspace_id: 'xyz', swishjam_user_id: '9', merged_into_swishjam_user_id: '1' },
      ])

      results = described_class.new(@public_key, user_profile_id: '1', workspace_id: 'xyz', start_time: 2.days.ago, end_time: Time.current).get
      expect(results.count).to eq(4)
      uuid_1 = results.find{ |event| event.name == 'event_1' && event.properties == { 'property_1' => 'value_1' }.to_json }
      uuid_2 = results.find{ |event| event.name == 'event_1' && event.properties == { 'property_2' => 'value_2' }.to_json }
      uuid_3 = results.find{ |event| event.name == 'event_2' && event.properties == { 'property_1' => 'value_1' }.to_json }
      uuid_6 = results.find{ |event| event.name == 'event_3' && event.properties == { 'merged' => 'from_other_profile!' }.to_json }
      expect(uuid_1).to_not be(nil)
      expect(uuid_2).to_not be(nil)
      expect(uuid_3).to_not be(nil)
      expect(uuid_6).to_not be(nil)
    end

    it 'returns a list of a individual events and their counts by property for a specific user when an event, property, and user_id is specified' do
      events = [
        { uuid: '1', user_profile_id: '1', name: 'event_1', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.hour.ago, ingested_at: Time.current },
        { uuid: '2', user_profile_id: '1', name: 'event_1', properties: { 'property_1' => 'value_2' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: Time.current },
        { uuid: '3', user_profile_id: '1', name: 'event_1', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: Time.current },
        { uuid: '4', user_profile_id: '2', name: 'someone_elses_event', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: Time.current },
        { uuid: '5', user_profile_id: '1', name: 'outside_timeframe', properties: { 'property_1' => 'value_1' }.to_json, swishjam_api_key: @public_key, occurred_at: 3.days.ago, ingested_at: Time.current },
        { uuid: '6', user_profile_id: '9', name: 'event_1', properties: { 'property_1' => 'merged!' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: Time.current },
      ]
      Analytics::Event.insert_all!([
        # does not use this one because its not unique and was ingested before the other
        { uuid: '3', user_profile_id: '1', name: 'event_2', properties: { 'not' => 'me!' }.to_json, swishjam_api_key: @public_key, occurred_at: 1.day.ago, ingested_at: 1.minute.ago },
      ])
      Analytics::Event.insert_all!(events)

      Analytics::SwishjamUserProfile.insert_all!([
        { workspace_id: 'xyz', swishjam_user_id: '1', merged_into_swishjam_user_id: nil },
        { workspace_id: 'xyz', swishjam_user_id: '2', merged_into_swishjam_user_id: nil },
        { workspace_id: 'abc', swishjam_user_id: '1', merged_into_swishjam_user_id: nil },
        { workspace_id: 'xyz', swishjam_user_id: '9', merged_into_swishjam_user_id: '1' },
      ])

      results = described_class.new(@public_key, event: 'event_1', property: 'property_1', user_profile_id: '1', workspace_id: 'xyz', start_time: 2.days.ago, end_time: Time.current).get
      expect(results.count).to eq(3)
      value_1_record = results.find{ |event| event.property_1 == 'value_1' }
      expect(value_1_record.count).to be(2)
      value_2_record = results.find{ |event| event.property_1 == 'value_2' }
      expect(value_2_record.count).to be(1)
      merged_record = results.find{ |event| event.property_1 == 'merged!' }
      expect(merged_record.count).to be(1)
    end
  end
end