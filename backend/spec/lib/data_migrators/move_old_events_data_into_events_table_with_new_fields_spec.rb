require 'spec_helper'

describe DataMigrators::MoveOldEventsDataIntoEventsTableWithNewFields do
  describe '#run!' do
    it 'fills in the new events table with the old events data and new user_properties, user_profile_id, organization_properties, and organization_profile_id fields' do
      old_events_sql = <<~SQL
        INSERT INTO old_events 
          (uuid, swishjam_api_key, name, properties, occurred_at, ingested_at) 
        VALUES 
          ('1', 'swish-xyz', 'my_event', '{ "device_identifier": "device-123", "organization_attributes": { "organization_identifier": "org-1" }}', '2024-02-03 20:22:56', now()),
          ('2', 'swish-xyz', 'my_event', '{ "device_identifier": "device-124" }', now(), now()),
          ('3', 'swish-xyz', 'my_event', '{ "device_identifier": "device-125" }', now(), now()),
          ('4', 'swish-xyz', 'my_event', '{ "device_identifier": "device-126" }', now(), now()),
          ('5', 'swish-xyz', 'my_event', '{ "device_identifier": "device-127" }', now(), now()),
          ('6', 'swish-abc', 'my_event2', '{ "device_identifier": "device-128" }', now(), now()),
          ('7', 'swish-abc', 'my_event2', '{ "device_identifier": "device-129" }', now(), now()),
          ('8', 'swish-abc', 'my_event2', '{ "device_identifier": "device-130" }', now(), now()),
          ('9', 'swish-abc', 'my_event2', '{ "device_identifier": "device-131" }', now(), now()),
          ('10', 'swish-abc', 'my_event2', '{ "device_identifier": "device-132" }', now(), now())
      SQL
      Analytics::ClickHouseRecord.execute_sql(old_events_sql, format: nil)
      Analytics::UserIdentifyEvent.insert_all([
        # should not be included because it's not the most recent event for the device_identifier
        { device_identifier: 'device-123', swishjam_api_key: 'swish-xyz', swishjam_user_id: 'user-never!', occurred_at: 1.day.ago, ingested_at: 1.day.ago },
      ])
      Analytics::UserIdentifyEvent.insert_all([
        { device_identifier: 'device-123', swishjam_api_key: 'swish-xyz', swishjam_user_id: 'user-1', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: 'device-124', swishjam_api_key: 'swish-xyz', swishjam_user_id: 'user-2', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: 'device-125', swishjam_api_key: 'swish-xyz', swishjam_user_id: 'user-3', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: 'device-126', swishjam_api_key: 'swish-xyz', swishjam_user_id: 'user-4', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: 'device-127', swishjam_api_key: 'swish-xyz', swishjam_user_id: 'user-5', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: 'device-128', swishjam_api_key: 'swish-abc', swishjam_user_id: 'user-6', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: 'device-129', swishjam_api_key: 'swish-abc', swishjam_user_id: 'user-7', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: 'device-130', swishjam_api_key: 'swish-abc', swishjam_user_id: 'user-8', occurred_at: Time.current, ingested_at: Time.current },
        { device_identifier: 'device-131', swishjam_api_key: 'swish-abc', swishjam_user_id: 'user-9', occurred_at: Time.current, ingested_at: Time.current },
        # event uuid 10 doesnt have a user profile id
        # { device_identifier: 'device-132', swishjam_api_key: 'swish-abc', swishjam_user_id: 'user-10', occurred_at: Time.current, ingested_at: Time.current },
      ])

      old_users_query = <<~SQL
        INSERT INTO old_swishjam_user_profiles (
          swishjam_api_key, 
          workspace_id, 
          swishjam_user_id, 
          user_unique_identifier, 
          email, 
          first_name, 
          last_name, 
          initial_landing_page_url,
          initial_referrer_url,
          metadata,
          created_at,
          updated_at
        ) VALUES 
          ('swish-xyz', 'workspace-1', 'user-1', 'unique-user-123', 'jenny@swishjam.com', 'Jenny', 'Rosen', 'https://www.example.com', 'https://www.google.com', '{"birthday": "11/07/1992"}', now(), now()),
          ('swish-xyz', 'workspace-1', 'user-2', 'unique-user-124', 'user-2@gmail.com', 'User', 'Two', NULL, NULL, '{}', now(), now()),
          ('swish-xyz', 'workspace-1', 'user-3', 'unique-user-125', 'user-3@gmail.com', 'User', 'Three', 'https://user-2-landing-page.com', NULL, '{ "favorite_color": "blue" }', now(), now()),
          ('swish-xyz', 'workspace-1', 'user-4', 'unique-user-126', 'user-4@gmail.com', 'User', 'Four', NULL, NULL, '{}', now(), now()),
      SQL

      old_orgs_query = <<~SQL
        INSERT INTO old_swishjam_organization_profiles (
          swishjam_api_key,
          workspace_id,
          swishjam_organization_id,
          organization_unique_identifier,
          name,
          metadata
        ) VALUES
          ('swish-xyz', 'workspace-1', 'org-1', 'unique-org-123', 'Org 123', '{"industry": "tech"}')
      SQL
      Analytics::ClickHouseRecord.execute_sql(old_orgs_query, format: nil)
      Analytics::ClickHouseRecord.execute_sql(old_users_query, format: nil)

      described_class.run!

      all_events = Analytics::ClickHouseRecord.execute_sql('SELECT * FROM events')
      expect(all_events.count).to eq(10)
      event_1 = all_events.find{ |e| e['uuid'] == '1' }
      expect(event_1['swishjam_api_key']).to eq('swish-xyz')
      expect(event_1['name']).to eq('my_event')
      expect(event_1['occurred_at']).to eq('2024-02-03 20:22:56.000')
      expect(event_1['user_profile_id']).to eq('user-1')
      expect(event_1['organization_profile_id']).to eq('org-1')
      expect(JSON.parse(event_1['properties'])['device_identifier']).to eq('device-123')
      # this would get stripped during ingestion, but don't believe we can remove JSON keys during the migration query
      expect(JSON.parse(event_1['properties'])['organization_attributes']['organization_identifier']).to eq('org-1')
      expect(JSON.parse(event_1['user_properties'])['unique_identifier']).to eq('unique-user-123')
      expect(JSON.parse(event_1['user_properties'])['email']).to eq('jenny@swishjam.com')
      expect(JSON.parse(event_1['user_properties'])['first_name']).to eq('Jenny')
      expect(JSON.parse(event_1['user_properties'])['last_name']).to eq('Rosen')
      expect(JSON.parse(event_1['user_properties'])['birthday']).to eq('11/07/1992')
      expect(JSON.parse(event_1['user_properties'])['initial_landing_page_url']).to eq('https://www.example.com')
      expect(JSON.parse(event_1['user_properties'])['initial_referrer_url']).to eq('https://www.google.com')
    end
  end
end