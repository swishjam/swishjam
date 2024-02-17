require 'spec_helper'

RSpec.describe ClickHouseQueries::Users::List do
  before do
    @workspace = FactoryBot.create(:workspace)
    @user = FactoryBot.create(:user)
  end

  describe '#get' do
    it 'returns a list of users when no `user_segments` are provided' do
      Analytics::SwishjamUserProfile.insert_all!([
        { workspace_id: @workspace.id, swishjam_user_id: 1, merged_into_swishjam_user_id: nil, email: 'user-1@gmail.com', metadata: { birthday: '11/01/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 2, merged_into_swishjam_user_id: nil, email: 'user-2@gmail.com', metadata: { birthday: '11/02/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 3, merged_into_swishjam_user_id: nil, email: 'user-3@gmail.com', metadata: { birthday: '11/03/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 4, merged_into_swishjam_user_id: nil, email: 'user-4@gmail.com', metadata: { birthday: '11/04/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 5, merged_into_swishjam_user_id: nil, email: 'user-5@gmail.com', metadata: { birthday: '11/05/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 6, merged_into_swishjam_user_id: 5, email: 'MERGED@gmail.com', metadata: { birthday: 'MERGED-11/06/1992' }.to_json, created_at: 1.day.ago },
      ])

      result = described_class.new(@workspace).get

      expect(result[:users].length).to eq(5)
      
      merged_user = result[:users].find { |user| user['swishjam_user_id'] == '6' }
      expect(merged_user).to be(nil)
      
      user_1 = result[:users].find { |user| user['swishjam_user_id'] == '1' }
      expect(user_1['email']).to eq('user-1@gmail.com')
      expect(user_1['metadata']).to eq({ birthday: '11/01/1992' }.to_json)

      expect(result[:total_num_users]).to eq(5)
      expect(result[:total_num_pages]).to eq(1)
    end

    it 'correctly applies the provided `user_segments` filters to the query with one user property segment filter' do
      Analytics::SwishjamUserProfile.insert_all!([
        { workspace_id: @workspace.id, swishjam_user_id: 1, merged_into_swishjam_user_id: nil, email: 'user-1@gmail.com', metadata: { birthday: '11/01/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 2, merged_into_swishjam_user_id: nil, email: 'user-2@gmail.com', metadata: { birthday: '11/02/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 3, merged_into_swishjam_user_id: nil, email: 'user-3@gmail.com', metadata: { birthday: '11/03/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 4, merged_into_swishjam_user_id: nil, email: 'user-4@gmail.com', metadata: { birthday: '11/04/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 5, merged_into_swishjam_user_id: nil, email: 'user-5@gmail.com', metadata: { birthday: '11/05/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 6, merged_into_swishjam_user_id: 5, email: 'MERGED@gmail.com', metadata: { birthday: 'MERGED-11/06/1992' }.to_json, created_at: 1.day.ago },
      ])

      user_segment = FactoryBot.create(:user_segment, workspace: @workspace, created_by_user: @user, name: '11/01/1992 birthdays')
      filter = FactoryBot.create(:user_segment_filter, user_segment: user_segment, sequence_position: 1, config: { object_type: 'user', user_property_name: 'birthday', user_property_operator: 'equals', user_property_value: '11/01/1992' })

      result = described_class.new(@workspace, user_segments: [user_segment]).get

      expect(result[:users].length).to eq(1)
      user_1 = result[:users].find { |user| user['swishjam_user_id'] == '1' }
      expect(user_1['email']).to eq('user-1@gmail.com')
      expect(user_1['metadata']).to eq({ birthday: '11/01/1992' }.to_json)

      expect(result[:total_num_users]).to eq(1)
      expect(result[:total_num_pages]).to eq(1)
    end

    it 'correctly applies the provided `user_segments` filters to the query with one event occurrences segment filter' do
      Analytics::SwishjamUserProfile.insert_all!([
        { workspace_id: @workspace.id, swishjam_user_id: 1, merged_into_swishjam_user_id: nil, email: 'user-1@gmail.com', metadata: { birthday: '11/01/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 2, merged_into_swishjam_user_id: nil, email: 'user-2@gmail.com', metadata: { birthday: '11/02/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 3, merged_into_swishjam_user_id: nil, email: 'user-3@gmail.com', metadata: { birthday: '11/03/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 4, merged_into_swishjam_user_id: nil, email: 'user-4@gmail.com', metadata: { birthday: '11/04/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 5, merged_into_swishjam_user_id: nil, email: 'user-5@gmail.com', metadata: { birthday: '11/05/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 6, merged_into_swishjam_user_id: 5, email: 'MERGED@gmail.com', metadata: { birthday: 'MERGED-11/06/1992' }.to_json, created_at: 1.day.ago },
      ])

      insert_events_into_click_house!(swishjam_api_key: @workspace.api_keys.first.public_key) do
        [
          # user 1 shouldnt count because its only happened once in the last 7 days
          { name: 'active_user_event', user_profile_id: 1, occurred_at: 1.day.ago },
          { name: 'active_user_event', user_profile_id: 1, occurred_at: Time.current - 7.days - 1.minute },
          { name: 'a_different_event', user_profile_id: 2 },
          { name: 'a_different_event', user_profile_id: 2 },
          { name: 'a_different_event', user_profile_id: 2 },
          # should return user 5 because user_profile_id 6 is merged
          { name: 'active_user_event', user_profile_id: 5, occurred_at: 1.day.ago },
          { name: 'active_user_event', user_profile_id: 6, occurred_at: 1.day.ago },
        ]
      end

      user_segment = FactoryBot.create(:user_segment, workspace: @workspace, created_by_user: @user, name: 'Active Users')
      filter = FactoryBot.create(:user_segment_filter, user_segment: user_segment, sequence_position: 1, config: { object_type: 'event', event_name: 'active_user_event', num_lookback_days: 7, num_event_occurrences: 2 })

      result = described_class.new(@workspace, user_segments: [user_segment]).get

      expect(result[:users].length).to eq(1)
      user_1 = result[:users].find { |user| user['swishjam_user_id'] == '5' }
      expect(user_1['email']).to eq('user-5@gmail.com')
      expect(user_1['metadata']).to eq({ birthday: '11/05/1992' }.to_json)

      expect(result[:total_num_users]).to eq(1)
      expect(result[:total_num_pages]).to eq(1)
    end

    it 'correctly applies the provided `user_segments` filters to the query with multiple filters with AND operators' do
      Analytics::SwishjamUserProfile.insert_all!([
        { workspace_id: @workspace.id, swishjam_user_id: 1, merged_into_swishjam_user_id: nil, email: 'user-1@gmail.com', metadata: { birthday: '11/01/1992', mrr: 99 }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 2, merged_into_swishjam_user_id: nil, email: 'user-2@gmail.com', metadata: { birthday: '11/02/1992', mrr: 101 }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 3, merged_into_swishjam_user_id: nil, email: 'user-3@gmail.com', metadata: { birthday: '11/03/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 4, merged_into_swishjam_user_id: nil, email: 'user-4@gmail.com', metadata: { birthday: '11/04/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 5, merged_into_swishjam_user_id: nil, email: 'user-5@gmail.com', metadata: { birthday: '11/05/1992', mrr: 100 }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 6, merged_into_swishjam_user_id: 5, email: 'MERGED@gmail.com', metadata: { birthday: 'MERGED-11/06/1992' }.to_json, created_at: 1.day.ago },
      ])

      insert_events_into_click_house!(swishjam_api_key: @workspace.api_keys.first.public_key) do
        [
          # user 1 shouldn't count because it doesnt have mrr >= 100
          { name: 'active_user_event', user_profile_id: 1, occurred_at: 1.day.ago },
          { name: 'active_user_event', user_profile_id: 1, occurred_at: 2.day.ago },
          # user 2 shouldn't count because it doesnt have 2 occurrences of the event, even though it has mrr >= 100
          { name: 'active_user_event', user_profile_id: 2 },
          # user 3 shouldn't count because it doesnt have 2 occurrences of the event
          { name: 'active_user_event', user_profile_id: 3, occurred_at: 1.day.ago },
          { name: 'a_different_event', user_profile_id: 3, occurred_at: 1.day.ago },
          { name: 'active_user_event', user_profile_id: 3, occurred_at: Time.current - 7.days - 1.minute },
          # should return user 5 because user_profile_id 6 is merged and user 5 has mrr >= 100
          { name: 'active_user_event', user_profile_id: 5, occurred_at: 1.day.ago },
          { name: 'active_user_event', user_profile_id: 6, occurred_at: 1.day.ago },
        ]
      end

      user_segment = FactoryBot.create(:user_segment, workspace: @workspace, created_by_user: @user, name: 'Active Users')
      FactoryBot.create(:user_segment_filter, user_segment: user_segment, sequence_position: 1, config: { object_type: 'event', event_name: 'active_user_event', num_lookback_days: 7, num_event_occurrences: 2 })
      FactoryBot.create(:user_segment_filter, user_segment: user_segment, sequence_position: 2, parent_relationship_operator: 'and', config: { object_type: 'user', user_property_name: 'mrr', user_property_operator: 'greater_than_or_equal_to', user_property_value: 100 })

      result = described_class.new(@workspace, user_segments: [user_segment]).get

      expect(result[:users].length).to eq(1)
      user_1 = result[:users].find { |user| user['swishjam_user_id'] == '5' }

      expect(user_1['email']).to eq('user-5@gmail.com')
      expect(user_1['metadata']).to eq({ birthday: '11/05/1992', mrr: 100 }.to_json)

      expect(result[:total_num_users]).to eq(1)
      expect(result[:total_num_pages]).to eq(1)
    end
  end
end