require 'spec_helper'

describe ClickHouseQueries::Organizations::Users::Active::Daily do
  describe '#timeseries' do
    it 'returns a timeseries of active users for the organization' do
      workspace = FactoryBot.create(:workspace)
      org_profile = FactoryBot.create(:analytics_organization_profile, workspace: workspace)
      different_org_profile = FactoryBot.create(:analytics_organization_profile, workspace: workspace)
      user_profile_1 = FactoryBot.create(:analytics_user_profile, workspace: workspace, user_unique_identifier: 'user_1')
      user_profile_2 = FactoryBot.create(:analytics_user_profile, workspace: workspace, user_unique_identifier: 'user_2')
      
      user_profile_1.analytics_organization_profiles << org_profile
      user_profile_2.analytics_organization_profiles << org_profile
      user_profile_2.analytics_organization_profiles << different_org_profile

      user_profile_1_session_1 = FactoryBot.create(:analytics_event, 
        swishjam_api_key: workspace.public_key,
        name: Analytics::Event::ReservedNames.NEW_SESSION,
        analytics_family: 'product',
        properties: { session_identifier: 'user_profile_1_session_1', device_identifier: 'device_1', analytics_family: 'product' }
      )
      # ensuring events with the same session identifier are not double counted
      user_profile_1_session_1_page_view = FactoryBot.create(:analytics_event, 
        swishjam_api_key: workspace.public_key,
        name: Analytics::Event::ReservedNames.PAGE_VIEW,
        analytics_family: 'product',
        properties: { session_identifier: 'user_profile_1_session_1', device_identifier: 'device_1', analytics_family: 'product' }
      )
      user_profile_1_session_2 = FactoryBot.create(:analytics_event, 
        swishjam_api_key: workspace.public_key,
        name: Analytics::Event::ReservedNames.NEW_SESSION,
        analytics_family: 'product',
        occurred_at: 1.day.ago,
        properties: { session_identifier: 'user_profile_1_session_2', device_identifier: 'device_1', analytics_family: 'product' }
      )
      user_profile_2_session_1 = FactoryBot.create(:analytics_event,
        swishjam_api_key: workspace.public_key,
        name: Analytics::Event::ReservedNames.NEW_SESSION,
        analytics_family: 'product',
        properties: { session_identifier: 'user_profile_2_session_1', device_identifier: 'device_2', analytics_family: 'product' }
      )
      user_profile_2_session_2 = FactoryBot.create(:analytics_event,
        swishjam_api_key: workspace.public_key,
        name: Analytics::Event::ReservedNames.NEW_SESSION,
        analytics_family: 'product',
        properties: { session_identifier: 'user_profile_2_session_2', device_identifier: 'device_2', analytics_family: 'product' }
      )
      # marketing session does not count
      user_profile_2_session_3 = FactoryBot.create(:analytics_event,
        swishjam_api_key: workspace.public_key,
        name: Analytics::Event::ReservedNames.NEW_SESSION,
        analytics_family: 'product',
        properties: { session_identifier: 'user_profile_2_session_2', device_identifier: 'device_2', analytics_family: 'marketing' }
      )

      user_profile_1_identify = FactoryBot.create(:analytics_user_identify_event,
        swishjam_api_key: workspace.public_key,
        device_identifier: user_profile_1_session_1.properties['device_identifier'],
        swishjam_user_id: user_profile_1.id,
        occurred_at: 1.minute.ago,
      )
      user_profile_2_identify = FactoryBot.create(:analytics_user_identify_event,
        swishjam_api_key: workspace.public_key,
        device_identifier: user_profile_2_session_1.properties['device_identifier'],
        swishjam_user_id: user_profile_2.id,
        occurred_at: 1.minute.ago,
      )

      user_profile_1_session_1_organization_identify = FactoryBot.create(:analytics_organization_identify_event,
        swishjam_api_key: workspace.public_key,
        device_identifier: user_profile_1_session_1.properties['device_identifier'],
        session_identifier: user_profile_1_session_1.properties['session_identifier'],
        swishjam_organization_id: org_profile.id,
        occurred_at: 1.minute.ago,
      )
      user_profile_1_session_2_organization_identify = FactoryBot.create(:analytics_organization_identify_event,
        swishjam_api_key: workspace.public_key,
        device_identifier: user_profile_1_session_2.properties['device_identifier'],
        session_identifier: user_profile_1_session_2.properties['session_identifier'],
        swishjam_organization_id: org_profile.id,
        occurred_at: 1.day.ago,
      )
      user_profile_2_session_1_organization_identify = FactoryBot.create(:analytics_organization_identify_event,
        swishjam_api_key: workspace.public_key,
        device_identifier: user_profile_2_session_1.properties['device_identifier'],
        session_identifier: user_profile_2_session_1.properties['session_identifier'],
        swishjam_organization_id: org_profile.id,
        occurred_at: 1.minute.ago,
      )
      # ensures user_profile_2_session_2 is not counted because it is for a different organization
      user_profile_2_session_2_organization_identify = FactoryBot.create(:analytics_organization_identify_event,
        swishjam_api_key: workspace.public_key,
        device_identifier: user_profile_2_session_2.properties['device_identifier'],
        session_identifier: user_profile_2_session_2.properties['session_identifier'],
        swishjam_organization_id: different_org_profile.id,
        occurred_at: 1.minute.ago,
      )
      user_profile_2_session_3_organization_identify = FactoryBot.create(:analytics_organization_identify_event,
        swishjam_api_key: workspace.public_key,
        device_identifier: user_profile_2_session_3.properties['device_identifier'],
        session_identifier: user_profile_2_session_3.properties['session_identifier'],
        swishjam_organization_id: org_profile.id,
        occurred_at: 1.minute.ago,
      )

      timeseries = ClickHouseQueries::Organizations::Users::Active::Daily.new(
        workspace.public_key,
        organization_profile_id: org_profile.id,
        analytics_family: 'product',
      ).timeseries

      active_users_for_today = timeseries.formatted_data.find { |data| data[:date] == user_profile_1_session_1.occurred_at.beginning_of_day }
      active_users_for_yesterday = timeseries.formatted_data.find { |data| data[:date] == user_profile_1_session_2.occurred_at.beginning_of_day }
      expect(active_users_for_today[:value]).to be(2)
      expect(active_users_for_yesterday[:value]).to be(1)
      expect(timeseries.formatted_data.collect{ |data| data[:value] }.sum).to eq(3)
    end
  end
end