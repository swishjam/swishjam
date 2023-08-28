require 'spec_helper'

describe ClickHouseQueries::Events::ForUser do
  describe '#get' do
    it 'returns all the events for a user' do
      workspace = create(:workspace, public_key: 'public_key')
      user_profile = create(:analytics_user_profile, workspace: workspace)
      other_user_profile = create(:analytics_user_profile, workspace: workspace)
      
      old_login_from_different_user_on_same_device = create(:analytics_user_identify_event, 
        swishjam_api_key: 'public_key',
        swishjam_user_id: other_user_profile.id,
        device_identifier: 'device_1',
        occurred_at: 7.days.ago
      )
      somebody_else = create(:analytics_user_identify_event, 
        swishjam_api_key: 'public_key',
        swishjam_user_id: 'somebody_else_entirely',
        device_identifier: 'who_the_heck_is_this',
        occurred_at: 7.days.ago
      )
      new_login_from_this_user_on_same_device = create(:analytics_user_identify_event,
        swishjam_api_key: 'public_key',
        swishjam_user_id: user_profile.id,
        device_identifier: 'device_1',
        occurred_at: 1.day.ago
      )
      another_login_from_this_user_on_different_device = create(:analytics_user_identify_event,
        swishjam_api_key: 'public_key',
        swishjam_user_id: user_profile.id,
        device_identifier: 'device_2',
        occurred_at: 1.day.ago
      )
      create(:analytics_event, swishjam_api_key: 'public_key', name: 'event_1', properties: { device_identifier: 'device_1' })
      create(:analytics_event, swishjam_api_key: 'public_key', name: 'event_2', properties: { device_identifier: 'device_2' })
      create(:analytics_event, swishjam_api_key: 'public_key', name: 'another_for_safe_measure', properties: { device_identifier: 'device_2' })
      create(:analytics_event, swishjam_api_key: 'public_key', name: 'somebody_elses_event', properties: { device_identifier: 'device_3' })
      create(:analytics_event, swishjam_api_key: 'public_key', name: 'another_event_that_belongs_to_somebody_else', properties: { device_identifier: 'who_the_heck_is_this' })

      events = ClickHouseQueries::Events::ForUser.new('public_key', user_profile_id: user_profile.id).get
      expect(events.count).to be(3)
      expect(events.collect(&:name).sort).to eq(['another_for_safe_measure', 'event_1', 'event_2'])

      events_for_other_user = ClickHouseQueries::Events::ForUser.new('public_key', user_profile_id: other_user_profile.id).get
      expect(events_for_other_user.count).to be(0)
    end
  end
end