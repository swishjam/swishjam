require 'spec_helper'

describe DataMigrators::MoveOldEventsDataIntoEventsTableWithNewFields do
  describe '#run!' do
    it 'fills in the new events table with the old events data and new user_properties, user_profile_id, organization_properties, and organization_profile_id fields' do
      sql = <<~SQL
        INSERT INTO old_events 
          (uuid, swishjam_api_key, name, properties, occurred_at, ingested_at) 
        VALUES 
          ('1', 'xyz', 'my_event', '{ "device_identifier": "123" }', now(), now()),
          ('2', 'xyz', 'my_event', '{ "device_identifier": "124" }', now(), now()),
          ('3', 'xyz', 'my_event', '{ "device_identifier": "125" }', now(), now()),
          ('4', 'xyz', 'my_event', '{ "device_identifier": "126" }', now(), now()),
          ('5', 'xyz', 'my_event', '{ "device_identifier": "127" }', now(), now()),
          ('6', 'abc', 'my_event2', '{ "device_identifier": "128" }', now(), now()),
          ('7', 'abc', 'my_event2', '{ "device_identifier": "129" }', now(), now()),
          ('8', 'abc', 'my_event2', '{ "device_identifier": "130" }', now(), now()),
          ('9', 'abc', 'my_event2', '{ "device_identifier": "131" }', now(), now()),
          ('10', 'abc', 'my_event2', '{ "device_identifier": "132" }', now(), now())
      SQL
      Analytics::ClickHouseRecord.execute_sql(sql)
      Analytics::UserIdentifyEvent.insert_all([
        # should not be included because it's not the most recent event for the device_identifier
        { device_identifier: '123', swishjam_api_key: 'xyz', swishjam_user_id: '1', occurred_at: 1.day.ago, ingested_at: 1.day.ago },
      ])
      Analytics::UserIdentifyEvent.insert_all([
        { device_identifier: '123', swishjam_api_key: 'xyz', swishjam_user_id: '1', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: '124', swishjam_api_key: 'xyz', swishjam_user_id: '2', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: '125', swishjam_api_key: 'xyz', swishjam_user_id: '3', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: '126', swishjam_api_key: 'xyz', swishjam_user_id: '4', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: '127', swishjam_api_key: 'xyz', swishjam_user_id: '5', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: '128', swishjam_api_key: 'abc', swishjam_user_id: '6', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: '129', swishjam_api_key: 'abc', swishjam_user_id: '7', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: '130', swishjam_api_key: 'abc', swishjam_user_id: '8', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: '131', swishjam_api_key: 'abc', swishjam_user_id: '9', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: '132', swishjam_api_key: 'abc', swishjam_user_id: '10', occurred_at: Time.current, ingested_at: Time.current },
      ])
    end
  end
end