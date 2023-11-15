require 'spec_helper'

RSpec.describe ClickHouseQueries::UserOrganizationDeviceIdentifierJoiner do
  describe '#get_all_user_ids_associated_with_org' do
    it 'returns all the swishjam user IDs for the specified organization' do
      def register_user_identify_event(user_device_identifier:, org_device_identifier:, swishjam_user_id:, swishjam_api_key: 'my_public_key', occurred_at: Time.current)
        Analytics::UserIdentifyEvent.create!(
          device_identifier: user_device_identifier,
          swishjam_user_id: swishjam_user_id,
          swishjam_api_key: swishjam_api_key,
          occurred_at: occurred_at
        )
        Analytics::UserOrganizationDeviceIdentifier.create!(
          organization_device_identifier: org_device_identifier,
          user_device_identifier: user_device_identifier,
          swishjam_api_key: swishjam_api_key,
          created_at: occurred_at
        )
      end

      def register_org_identify_event(org_device_identifier:, user_device_identifier:, swishjam_org_id:, swishjam_api_key: 'my_public_key', occurred_at: Time.current)
        Analytics::OrganizationIdentifyEvent.create!(
          organization_device_identifier: org_device_identifier,
          swishjam_organization_id: swishjam_org_id,
          swishjam_api_key: swishjam_api_key,
          occurred_at: occurred_at
        )
        Analytics::UserOrganizationDeviceIdentifier.create!(
          organization_device_identifier: org_device_identifier,
          user_device_identifier: user_device_identifier,
          swishjam_api_key: swishjam_api_key,
          created_at: occurred_at
        )
      end

      user_identify_events = [
        { 'swishjam_api_key' => 'my_public_key', 'user_device_identifier' => 'user_device_identifier_1', 'organization_device_identifier' => 'org_device_identifier_1', 'swishjam_user_id' => '1', 'occurred_at' => Time.current },
        { 'swishjam_api_key' => 'my_public_key', 'user_device_identifier' => 'user_device_identifier_2', 'organization_device_identifier' => 'org_device_identifier_2', 'swishjam_user_id' => '2', 'occurred_at' => Time.current },
        { 'swishjam_api_key' => 'my_public_key', 'user_device_identifier' => 'user_device_identifier_3', 'organization_device_identifier' => 'org_device_identifier_3', 'swishjam_user_id' => '3', 'occurred_at' => Time.current },
        { 'swishjam_api_key' => 'my_public_key', 'user_device_identifier' => 'user_device_identifier_3', 'organization_device_identifier' => 'org_device_identifier_3', 'swishjam_user_id' => 'An overwritten identify call that should not be returned!', 'occurred_at' => 7.days.ago },
        { 'swishjam_api_key' => 'someone_elses_public_key', 'user_device_identifier' => 'user_device_identifier_1', 'organization_device_identifier' => 'org_device_identifier_1', 'swishjam_user_id' => 'should not be returned!', 'occurred_at' => Time.current },
      ]

      org_identify_events = [
        { 'swishjam_api_key' => 'my_public_key', 'user_device_identifier' => 'user_device_identifier_1', 'organization_device_identifier' => 'org_device_identifier_1', 'swishjam_organization_id' => '1', 'occurred_at' => Time.current },
        { 'swishjam_api_key' => 'my_public_key', 'user_device_identifier' => 'user_device_identifier_2', 'organization_device_identifier' => 'org_device_identifier_2', 'swishjam_organization_id' => '1', 'occurred_at' => Time.current },
        { 'swishjam_api_key' => 'my_public_key', 'user_device_identifier' => 'user_device_identifier_3', 'organization_device_identifier' => 'org_device_identifier_3', 'swishjam_organization_id' => '1', 'occurred_at' => Time.current },
        { 'swishjam_api_key' => 'my_public_key', 'user_device_identifier' => 'user_device_identifier_3', 'organization_device_identifier' => 'org_device_identifier_3', 'swishjam_organization_id' => '1', 'occurred_at' => 10.minutes.ago },
        
        { 'swishjam_api_key' => 'my_public_key', 'user_device_identifier' => 'user_device_identifier_3', 'organization_device_identifier' => 'org_device_identifier_4', 'swishjam_organization_id' => '2', 'occurred_at' => Time.current },
        { 'swishjam_api_key' => 'my_public_key', 'user_device_identifier' => 'user_device_identifier_3', 'organization_device_identifier' => 'org_device_identifier_5', 'swishjam_organization_id' => '2', 'occurred_at' => Time.current },
        { 'swishjam_api_key' => 'my_public_key', 'user_device_identifier' => 'user_device_identifier_3', 'organization_device_identifier' => 'org_device_identifier_6', 'swishjam_organization_id' => '2', 'occurred_at' => Time.current },

        { 'swishjam_api_key' => 'my_public_key', 'user_device_identifier' => 'a user without an identify event yet?', 'organization_device_identifier' => 'org_device_identifier_1', 'swishjam_organization_id' => '1', 'occurred_at' => Time.current },
        { 'swishjam_api_key' => 'someone_elses_public_key', 'user_device_identifier' => 'user_device_identifier_1', 'organization_device_identifier' => 'org_device_identifier_1', 'swishjam_organization_id' => '1', 'occurred_at' => Time.current },
      ]

      user_identify_events.each do |data|
        register_user_identify_event(
          user_device_identifier: data['user_device_identifier'],
          org_device_identifier: data['organization_device_identifier'],
          swishjam_user_id: data['swishjam_user_id'],
          swishjam_api_key: data['swishjam_api_key'],
          occurred_at: data['occurred_at']
        )
      end

      org_identify_events.each do |data|
        register_org_identify_event(
          org_device_identifier: data['organization_device_identifier'],
          user_device_identifier: data['user_device_identifier'],
          swishjam_org_id: data['swishjam_organization_id'],
          swishjam_api_key: data['swishjam_api_key'],
          occurred_at: data['occurred_at']
        )
      end

      joiner = described_class.new('my_public_key', org_profile_id: '1')
      user_ids = joiner.get_all_user_ids_associated_with_org
      byebug
      expect(user_ids.count).to be(3)
      expect(user_ids).to include('1')
      expect(user_ids).to include('2')
      expect(user_ids).to include('3')
    end
  end
end