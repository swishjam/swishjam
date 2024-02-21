require 'spec_helper'

RSpec.describe ClickHouseQueries::Users::List do
  before do
    @workspace = FactoryBot.create(:workspace)
    @user = FactoryBot.create(:user)
  end

  describe '#get' do
    it 'returns a list of users when no `filter_groups` are provided' do
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

    it 'correctly applies the provided `filter_groups` filters to the query with one user property segment filter' do
      Analytics::SwishjamUserProfile.insert_all!([
        { workspace_id: @workspace.id, swishjam_user_id: 1, merged_into_swishjam_user_id: nil, email: 'user-1@gmail.com', metadata: { birthday: '11/01/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 2, merged_into_swishjam_user_id: nil, email: 'user-2@gmail.com', metadata: { birthday: '11/02/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 3, merged_into_swishjam_user_id: nil, email: 'user-3@gmail.com', metadata: { birthday: '11/03/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 4, merged_into_swishjam_user_id: nil, email: 'user-4@gmail.com', metadata: { birthday: '11/04/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 5, merged_into_swishjam_user_id: nil, email: 'user-5@gmail.com', metadata: { birthday: '11/05/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 6, merged_into_swishjam_user_id: 5, email: 'MERGED@gmail.com', metadata: { birthday: 'MERGED-11/06/1992' }.to_json, created_at: 1.day.ago },
      ])

      user_segment = FactoryBot.create(:user_segment, workspace: @workspace, created_by_user: @user, name: '11/01/1992 birthdays')
      query_filter_group = FactoryBot.create(:user_segment_query_filter_group, filterable: user_segment)
      query_filter = FactoryBot.create(:user_property_query_filter, query_filter_group: query_filter_group, sequence_index: 0, config: { property_name: 'birthday', operator: 'equals', property_value: '11/01/1992' })

      result = described_class.new(@workspace, filter_groups: [query_filter_group]).get

      expect(result[:users].length).to eq(1)
      user_1 = result[:users].find { |user| user['swishjam_user_id'] == '1' }
      expect(user_1['email']).to eq('user-1@gmail.com')
      expect(user_1['metadata']).to eq({ birthday: '11/01/1992' }.to_json)

      expect(result[:total_num_users]).to eq(1)
      expect(result[:total_num_pages]).to eq(1)
    end

    it 'correctly applies the provided `filter_groups` filters to the query with one event occurrences segment filter' do
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

      user_segment = FactoryBot.create(:user_segment, workspace: @workspace, created_by_user: @user, name: '11/01/1992 birthdays')
      query_filter_group = FactoryBot.create(:user_segment_query_filter_group, filterable: user_segment)
      query_filter = FactoryBot.create(:event_count_for_user_query_filter, query_filter_group: query_filter_group, sequence_index: 0, config: { event_name: 'active_user_event', num_lookback_days: 7, num_occurrences: 2 })

      result = described_class.new(@workspace, filter_groups: [query_filter_group]).get

      expect(result[:users].length).to eq(1)
      user_1 = result[:users].find { |user| user['swishjam_user_id'] == '5' }
      expect(user_1['email']).to eq('user-5@gmail.com')
      expect(user_1['metadata']).to eq({ birthday: '11/05/1992' }.to_json)

      expect(result[:total_num_users]).to eq(1)
      expect(result[:total_num_pages]).to eq(1)
    end

    it 'correctly applies the provided `filter_groups` filters to the query with multiple filters with AND operators' do
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
      query_filter_group = FactoryBot.create(:user_segment_query_filter_group, filterable: user_segment)
      FactoryBot.create(:user_property_query_filter, query_filter_group: query_filter_group, sequence_index: 0, config: { property_name: 'mrr', operator: 'greater_than_or_equal_to', property_value: 100 })
      FactoryBot.create(:event_count_for_user_query_filter, query_filter_group: query_filter_group, sequence_index: 1, previous_query_filter_relationship_operator: 'and', config: { event_name: 'active_user_event', num_lookback_days: 7, num_occurrences: 2 })

      result = described_class.new(@workspace, filter_groups: [query_filter_group]).get

      expect(result[:users].length).to eq(1)
      user_1 = result[:users].find { |user| user['swishjam_user_id'] == '5' }

      expect(user_1['email']).to eq('user-5@gmail.com')
      expect(user_1['metadata']).to eq({ birthday: '11/05/1992', mrr: 100 }.to_json)

      expect(result[:total_num_users]).to eq(1)
      expect(result[:total_num_pages]).to eq(1)
    end

    it 'correctly filters out users that have a property specified to exclude in the filter group' do
      Analytics::SwishjamUserProfile.insert_all!([
        { workspace_id: @workspace.id, swishjam_user_id: 1, merged_into_swishjam_user_id: nil, email: 'user-1@gmail.com', metadata: { is_internal: 'true', birthday: '11/01/1992', mrr: 99 }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 2, merged_into_swishjam_user_id: nil, email: 'user-2@gmail.com', metadata: { birthday: '11/02/1992', mrr: 101 }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 3, merged_into_swishjam_user_id: nil, email: 'user-3@gmail.com', metadata: { birthday: '11/03/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 4, merged_into_swishjam_user_id: nil, email: 'user-4@gmail.com', metadata: { birthday: '11/04/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 5, merged_into_swishjam_user_id: nil, email: 'user-5@gmail.com', metadata: { birthday: '11/05/1992', mrr: 100 }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 6, merged_into_swishjam_user_id: 5, email: 'MERGED@gmail.com', metadata: { birthday: 'MERGED-11/06/1992' }.to_json, created_at: 1.day.ago },
      ])

      insert_events_into_click_house!(swishjam_api_key: @workspace.api_keys.first.public_key) do
        [
          # user 1 shouldn't count because it has have internal_user = 'true'
          { name: 'active_user_event', user_profile_id: 1, occurred_at: 1.day.ago },
          { name: 'active_user_event', user_profile_id: 1, occurred_at: 2.day.ago },
          # user 2 shouldn't count because it doesnt have 2 occurrences of the event
          { name: 'active_user_event', user_profile_id: 2 },
          # user 3 shouldn't count because it doesnt have 2 occurrences of the event
          { name: 'active_user_event', user_profile_id: 3, occurred_at: 1.day.ago },
          { name: 'a_different_event', user_profile_id: 3, occurred_at: 1.day.ago },
          { name: 'active_user_event', user_profile_id: 3, occurred_at: Time.current - 7.days - 1.minute },
          # should return user 5 because user_profile_id 6 is merged and user 5 doesnt have internal_user = 'true'
          { name: 'active_user_event', user_profile_id: 5, occurred_at: 1.day.ago },
          { name: 'active_user_event', user_profile_id: 6, occurred_at: 1.day.ago },
        ]
      end

      user_segment = FactoryBot.create(:user_segment, workspace: @workspace, created_by_user: @user, name: 'Active Users')
      query_filter_group = FactoryBot.create(:user_segment_query_filter_group, filterable: user_segment)
      FactoryBot.create(:user_property_query_filter, query_filter_group: query_filter_group, sequence_index: 0, config: { property_name: 'is_internal', operator: 'does_not_equal', property_value: 'true' })
      FactoryBot.create(:event_count_for_user_query_filter, query_filter_group: query_filter_group, sequence_index: 1, previous_query_filter_relationship_operator: 'and', config: { event_name: 'active_user_event', num_lookback_days: 7, num_occurrences: 2 })

      result = described_class.new(@workspace, filter_groups: [query_filter_group]).get

      expect(result[:users].length).to eq(1)
      user_1 = result[:users].find { |user| user['swishjam_user_id'] == '5' }

      expect(user_1['email']).to eq('user-5@gmail.com')
      expect(user_1['metadata']).to eq({ birthday: '11/05/1992', mrr: 100 }.to_json)

      expect(result[:total_num_users]).to eq(1)
      expect(result[:total_num_pages]).to eq(1)
    end

    it 'correctly filters out generic email addresses when the the `QueryFilter` is a `QueryFilters::UserProperty` type with `is_not_generic` operator' do
      Analytics::SwishjamUserProfile.insert_all!([
        { workspace_id: @workspace.id, swishjam_user_id: 1, merged_into_swishjam_user_id: nil, email: 'user-1@gmail.com', metadata: { is_internal: 'true', birthday: '11/01/1992', mrr: 99 }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 2, merged_into_swishjam_user_id: nil, email: 'user-2@gmail.com', metadata: { birthday: '11/02/1992', mrr: 101 }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 3, merged_into_swishjam_user_id: nil, email: 'user-3@gmail.com', metadata: { birthday: '11/03/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 4, merged_into_swishjam_user_id: nil, email: 'user-4@gmail.com', metadata: { birthday: '11/04/1992' }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 5, merged_into_swishjam_user_id: nil, email: 'user-5@swishjam.com', metadata: { birthday: '11/05/1992', mrr: 100 }.to_json, created_at: 1.day.ago },
        { workspace_id: @workspace.id, swishjam_user_id: 6, merged_into_swishjam_user_id: 5, email: 'MERGED@gmail.com', metadata: { birthday: 'MERGED-11/06/1992' }.to_json, created_at: 1.day.ago },
      ])

      insert_events_into_click_house!(swishjam_api_key: @workspace.api_keys.first.public_key) do
        [
          # user 1 shouldn't count because it has a generic email
          { name: 'active_user_event', user_profile_id: 1, occurred_at: 1.day.ago },
          { name: 'active_user_event', user_profile_id: 1, occurred_at: 2.day.ago },
          # user 2 shouldn't count because it doesnt have 2 occurrences of the event
          { name: 'active_user_event', user_profile_id: 2 },
          # user 3 shouldn't count because it doesnt have 2 occurrences of the event
          { name: 'active_user_event', user_profile_id: 3, occurred_at: 1.day.ago },
          { name: 'a_different_event', user_profile_id: 3, occurred_at: 1.day.ago },
          { name: 'active_user_event', user_profile_id: 3, occurred_at: Time.current - 7.days - 1.minute },
          # should return user 5 because it doess not have a generic email and has 2 occurrences of the event
          { name: 'active_user_event', user_profile_id: 5, occurred_at: 1.day.ago },
          { name: 'active_user_event', user_profile_id: 6, occurred_at: 1.day.ago },
        ]
      end

      user_segment = FactoryBot.create(:user_segment, workspace: @workspace, created_by_user: @user, name: 'Active Users')
      query_filter_group = FactoryBot.create(:user_segment_query_filter_group, filterable: user_segment)
      FactoryBot.create(:user_property_query_filter, query_filter_group: query_filter_group, sequence_index: 0, config: { property_name: 'email', operator: 'is_not_generic' })
      FactoryBot.create(:event_count_for_user_query_filter, query_filter_group: query_filter_group, sequence_index: 1, previous_query_filter_relationship_operator: 'and', config: { event_name: 'active_user_event', num_lookback_days: 7, num_occurrences: 2 })

      result = described_class.new(@workspace, filter_groups: [query_filter_group]).get

      expect(result[:users].length).to eq(1)

      user_5 = result[:users].find { |user| user['swishjam_user_id'] == '5' }
      expect(user_5['email']).to eq('user-5@swishjam.com')
      expect(user_5['metadata']).to eq({ birthday: '11/05/1992', mrr: 100 }.to_json)

      expect(result[:total_num_users]).to eq(1)
      expect(result[:total_num_pages]).to eq(1)
    end
  end
end