require 'spec_helper'

describe ClickHouseQueries::Users::Events::All do
  before do
  end

  describe '#get' do
    it 'gets all events for the specified user' do
      workspace = FactoryBot.create(:workspace)
      user = FactoryBot.create(:analytics_user_profile, workspace: workspace, user_unique_identifier: 'my-user')
      
      someone_elses_workspace = FactoryBot.create(:workspace, public_key: 'different')
      a_different_user_for_the_same_workspace = FactoryBot.create(:analytics_user_profile, workspace: workspace, user_unique_identifier: 'a-different-user')
      a_user_for_a_different_workspace = FactoryBot.create(:analytics_user_profile, workspace: someone_elses_workspace, user_unique_identifier: 'someone-elses-unique-identifier')

      recent_identify_for_this_user = FactoryBot.create(:analytics_user_identify_event,
        swishjam_api_key: workspace.public_key,
        swishjam_user_id: user.id,
        device_identifier: 'my_device',
        occurred_at: 1.day.ago
      )
      identify_for_other_user_on_same_device_in_the_past = FactoryBot.create(:analytics_user_identify_event, 
        swishjam_api_key: workspace.public_key, 
        swishjam_user_id: a_different_user_for_the_same_workspace.id,
        device_identifier: 'my_device',
        occurred_at: 7.days.ago
      )
      identify_for_different_workspace = FactoryBot.create(:analytics_user_identify_event,
        swishjam_api_key: someone_elses_workspace.public_key,
        swishjam_user_id: a_user_for_a_different_workspace.id,
        device_identifier: 'my_device',
        occurred_at: Time.current
      )

      FactoryBot.create(:analytics_event, 
        swishjam_api_key: workspace.public_key, 
        device_identifier: 'my_device', 
        name: 'event_1', 
        properties: { event_1_attr: 'foo' }
      )
      FactoryBot.create(:analytics_event, 
        swishjam_api_key: workspace.public_key, 
        device_identifier: 'my_device', 
        name: 'event_2', 
        properties: { event_2_attr: 'bar' }
      )
      FactoryBot.create(:analytics_event, 
        swishjam_api_key: workspace.public_key, 
        device_identifier: 'my_device', 
        name: 'event_3', 
        properties: { event_3_attr: 'baz' }
      )
      FactoryBot.create(:analytics_event, 
        swishjam_api_key: someone_elses_workspace.public_key,
        device_identifier: 'my_device', 
        name: 'somebody_elses_workspace_event', 
        properties: { not: 'mine' }
      )

      my_user_events = ClickHouseQueries::Users::Events::All.new(workspace.public_key, user_profile_id: user.id).get
      different_user_for_same_workspace_events = ClickHouseQueries::Users::Events::All.new(workspace.public_key, user_profile_id: a_different_user_for_the_same_workspace.id).get
      different_workspace_user_events = ClickHouseQueries::Users::Events::All.new(someone_elses_workspace.public_key, user_profile_id: a_user_for_a_different_workspace.id).get
      expect(my_user_events.count).to be(3)
      expect(different_user_for_same_workspace_events.count).to be(0)
      expect(different_workspace_user_events.count).to be(1)
    end
  end
end