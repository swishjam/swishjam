require 'spec_helper'

describe ProfileTags::CohortApplier do
  before do
    @workspace = FactoryBot.create(:workspace)
    @swishjam_api_key = @workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key
    @user_segment = FactoryBot.create(:user_segment, name: 'Active Users', workspace: @workspace)
    @query_filter_group = FactoryBot.create(:user_segment_query_filter_group, filterable: @user_segment)
    @query_filter = FactoryBot.create(:event_count_for_user_query_filter, query_filter_group: @query_filter_group, config: { event_name: 'dashboard_viewed', num_occurrences: 5, num_lookback_days: 30 })
    @user_profile_1 = FactoryBot.create(:analytics_user_profile, workspace: @workspace)
    @user_profile_2 = FactoryBot.create(:analytics_user_profile, workspace: @workspace)
    @user_profile_3 = FactoryBot.create(:analytics_user_profile, workspace: @workspace)
    insert_analytics_user_profiles_into_clickhouse!([@user_profile_1, @user_profile_2, @user_profile_3])
  end

  describe "#update_cohort_profile_tags!" do
    it 'applies the "Active User" profile tag to users in the segment who dont already have the tag associated with their profile' do
      insert_events_into_click_house!(swishjam_api_key: @swishjam_api_key) do
        [
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 1.day.ago },
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 2.days.ago },
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 3.days.ago },
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 4.days.ago },
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: Time.current - 30.days + 5.minutes },
        ]
      end

      expect(ProfileTag.count).to be(0)
      expect(IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter).to receive(:perform_async).with([
        hash_including(
          swishjam_api_key: @swishjam_api_key,
          name: 'swishjam_bot.added_to_segment',
          properties: hash_including(
            profile_type: 'user',
            profile_id: @user_profile_1.id,
            profile_name: @user_profile_1.full_name,
            profile_email: @user_profile_1.email,
            tag_name: 'Active User',
          ),
        ),
      ]).exactly(1).times
      
      results = described_class.new(@user_segment).update_cohort_profile_tags!
      
      expect(ProfileTag.count).to be(1)
      expect(results[:user_ids_added]).to match_array([@user_profile_1.id])
      expect(results[:num_users_added]).to be(1)
      expect(results[:user_ids_removed]).to match_array([])
      expect(results[:num_users_removed]).to be(0)
      expect(@user_profile_1.profile_tags.first.name).to eq('Active User')
      expect(@user_profile_1.profile_tags.first.active?).to be(true)
      expect(@user_profile_1.profile_tags.first.user_segment).to eq(@user_segment)

      # if we call it again, it should not add the tag again because user_1 already has it
      results_2 = described_class.new(@user_segment).update_cohort_profile_tags!

      expect(ProfileTag.count).to be(1)
      expect(results_2[:user_ids_added]).to match_array([])
      expect(results_2[:num_users_added]).to be(0)
      expect(results_2[:user_ids_removed]).to match_array([])
      expect(results_2[:num_users_removed]).to be(0)
    end

    it 'removes the "Active User" profile tag from users in the segment who no longer meet the segment criteria' do
      insert_events_into_click_house!(swishjam_api_key: @swishjam_api_key) do
        [
          # removes user 1
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 1.day.ago },
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 2.days.ago },
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 3.days.ago },
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 4.days.ago },

          # adds user 2
          { user_profile_id: @user_profile_2.id, name: 'dashboard_viewed', occurred_at: 1.day.ago },
          { user_profile_id: @user_profile_2.id, name: 'dashboard_viewed', occurred_at: 2.days.ago },
          { user_profile_id: @user_profile_2.id, name: 'dashboard_viewed', occurred_at: 3.days.ago },
          { user_profile_id: @user_profile_2.id, name: 'dashboard_viewed', occurred_at: 4.days.ago },
          { user_profile_id: @user_profile_2.id, name: 'dashboard_viewed', occurred_at: Time.current - 30.days + 5.minutes },
        ]
      end

      @user_profile_1.profile_tags.create!(workspace: @workspace, name: 'Active User', user_segment: @user_segment)

      expect(ProfileTag.count).to be(1)
      expect(ProfileTag.active.count).to be(1)
      expect(ProfileTag.removed.count).to be(0)

      expect(IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter).to receive(:perform_async).with(
        [
          hash_including(
            swishjam_api_key: @swishjam_api_key,
            name: 'swishjam_bot.added_to_segment',
            properties: hash_including(
              profile_type: 'user',
              profile_id: @user_profile_2.id,
              profile_name: @user_profile_2.full_name,
              profile_email: @user_profile_2.email,
              tag_name: 'Active User',
            ),
          ),
          hash_including(
            swishjam_api_key: @swishjam_api_key,
            name: 'swishjam_bot.removed_from_segment',
            properties: hash_including(
              profile_type: 'user',
              profile_id: @user_profile_1.id,
              profile_name: @user_profile_1.full_name,
              profile_email: @user_profile_1.email,
              tag_name: 'Active User',
            ),
          ),
        ]
      ).exactly(1).times
      
      results = described_class.new(@user_segment).update_cohort_profile_tags!
      
      expect(ProfileTag.count).to be(2)
      expect(ProfileTag.active.count).to be(1)
      expect(ProfileTag.removed.count).to be(1)

      expect(results[:user_ids_added]).to match_array([@user_profile_2.id])
      expect(results[:num_users_added]).to be(1)
      expect(results[:user_ids_removed]).to match_array([@user_profile_1.id])
      expect(results[:num_users_removed]).to be(1)
      
      expect(@user_profile_1.profile_tags.first.name).to eq('Active User')
      expect(@user_profile_1.profile_tags.first.active?).to be(false)
      expect(@user_profile_1.profile_tags.first.user_segment).to eq(@user_segment)

      expect(@user_profile_2.profile_tags.first.name).to eq('Active User')
      expect(@user_profile_2.profile_tags.first.active?).to be(true)
      expect(@user_profile_2.profile_tags.first.user_segment).to eq(@user_segment)

      # if we call it again, it should not try to remove the tag again because its already been removed
      results_2 = described_class.new(@user_segment).update_cohort_profile_tags!

      expect(ProfileTag.count).to be(2)
      expect(ProfileTag.active.count).to be(1)
      expect(ProfileTag.removed.count).to be(1)
      expect(results_2[:user_ids_added]).to match_array([])
      expect(results_2[:num_users_added]).to be(0)
      expect(results_2[:user_ids_removed]).to match_array([])
      expect(results_2[:num_users_removed]).to be(0)
    end

    it 'does not emit events if @emit_events is false' do
      insert_events_into_click_house!(swishjam_api_key: @swishjam_api_key) do
        [
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 1.day.ago },
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 2.days.ago },
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 3.days.ago },
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 4.days.ago },
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: Time.current - 30.days + 5.minutes },
        ]
      end

      expect(ProfileTag.count).to be(0)
      expect(IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter).to_not receive(:perform_async)
      
      results = described_class.new(@user_segment, emit_events: false).update_cohort_profile_tags!
      
      expect(ProfileTag.count).to be(1)
      expect(results[:user_ids_added]).to match_array([@user_profile_1.id])
      expect(results[:num_users_added]).to be(1)
      expect(results[:user_ids_removed]).to match_array([])
      expect(results[:num_users_removed]).to be(0)
      expect(@user_profile_1.profile_tags.first.name).to eq('Active User')
      expect(@user_profile_1.profile_tags.first.active?).to be(true)
      expect(@user_profile_1.profile_tags.first.user_segment).to eq(@user_segment)

      # if we call it again, it should not add the tag again because user_1 already has it
      results_2 = described_class.new(@user_segment).update_cohort_profile_tags!

      expect(ProfileTag.count).to be(1)
      expect(results_2[:user_ids_added]).to match_array([])
      expect(results_2[:num_users_added]).to be(0)
      expect(results_2[:user_ids_removed]).to match_array([])
      expect(results_2[:num_users_removed]).to be(0)
    end
  end
end