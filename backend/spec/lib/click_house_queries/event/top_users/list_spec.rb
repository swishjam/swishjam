require 'spec_helper'

describe ClickHouseQueries::Event::TopUsers::List do
  describe '#get' do
    it 'returns the top users for a given event, taking into account merged users' do
      workspace = FactoryBot.create(:workspace)
      public_key = workspace.api_keys.first.public_key

      insert_events_into_click_house!({ event_name: 'page_view', swishjam_api_key: public_key }) do
        [
          { user_profile_id: 'user1', occurred_at: 1.day.ago },
          { user_profile_id: 'user2', occurred_at: 1.day.ago },
          { user_profile_id: 'user3', occurred_at: 1.day.ago },
        ]
      end

      Analytics::SwishjamUserProfile.insert_all!([
        { workspace_id: workspace.id, swishjam_user_id: 'user1', merged_into_swishjam_user_id: nil, user_unique_identifier: 'my-user-id!', email: 'my-identified-user@gmail.com', metadata: { 'birthday' => '11/07/1992' }.to_json },
        { workspace_id: workspace.id, swishjam_user_id: 'user2', merged_into_swishjam_user_id: 'user1', user_unique_identifier: nil, email: nil, metadata: {}.to_json },
        { workspace_id: workspace.id, swishjam_user_id: 'user3', merged_into_swishjam_user_id: nil, user_unique_identifier: 'my-other-user-id!', email: 'my-other-identified-user@gmail.com', metadata: { 'subscription_plan' => 'gold' }.to_json },
      ])

      list = ClickHouseQueries::Event::TopUsers::List.new(public_key, workspace_id: workspace.id, event_name: 'page_view').get
      expect(list).to eq([
        { 'user_profile_id' => 'user1', 'email' => 'my-identified-user@gmail.com', 'metadata' => { 'birthday' => '11/07/1992' }.to_json, 'count' => 2 },
        { 'user_profile_id' => 'user3', 'email' => 'my-other-identified-user@gmail.com', 'metadata' => { 'subscription_plan' => 'gold' }.to_json, 'count' => 1 }
      ])
    end
  end
end