require 'spec_helper'

describe ProfileTags::UserSegmentApplier do
  before do
    @workspace = FactoryBot.create(:workspace)
    @swishjam_api_key = @workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key
    @user_segment = FactoryBot.create(:user_segment, name: 'Active Users', workspace: @workspace)
    @user_segment_filter = FactoryBot.create(:user_segment_filter, user_segment: @user_segment, config: { object_type: 'event', event_name: 'dashboard_viewed', num_lookback_days: 30, num_event_occurrences: 5 })
    @user_profile_1 = FactoryBot.create(:analytics_user_profile, workspace: @workspace)
    @user_profile_2 = FactoryBot.create(:analytics_user_profile, workspace: @workspace)
    @user_profile_3 = FactoryBot.create(:analytics_user_profile, workspace: @workspace)
    insert_analytics_user_profiles_into_clickhouse!([@user_profile_1, @user_profile_2, @user_profile_3])
  end

  describe "#update_user_segment_profile_tags!" do
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
          name: 'swishjam_bot.segment_profile_tag_applied',
          properties: hash_including(
            profile_type: 'user',
            profile_id: @user_profile_1.id,
            profile_name: @user_profile_1.full_name,
            profile_email: @user_profile_1.email,
            tag_name: 'Active User',
            tag_id: anything,
          ),
        ),
      ])
      
      results = described_class.new(@user_segment).update_user_segment_profile_tags!
      
      expect(ProfileTag.count).to be(1)
      expect(results[:user_ids_added]).to match_array([@user_profile_1.id])
      expect(results[:num_users_added]).to be(1)
      expect(results[:user_ids_removed]).to match_array([])
      expect(results[:num_users_removed]).to be(0)
      expect(@user_profile_1.profile_tags.first.name).to eq('Active User')
      expect(@user_profile_1.profile_tags.first.active?).to be(true)
      expect(@user_profile_1.profile_tags.first.user_segment).to eq(@user_segment)

      # if we call it again, it should not add the tag again because user_1 already has it
      results_2 = described_class.new(@user_segment).update_user_segment_profile_tags!

      expect(ProfileTag.count).to be(1)
      expect(results_2[:user_ids_added]).to match_array([])
      expect(results_2[:num_users_added]).to be(0)
      expect(results_2[:user_ids_removed]).to match_array([])
      expect(results_2[:num_users_removed]).to be(0)
    end

    it 'removes the "Active User" profile tag from users in the segment who no longer meet the segment criteria' do
      insert_events_into_click_house!(swishjam_api_key: @swishjam_api_key) do
        [
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 1.day.ago },
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 2.days.ago },
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 3.days.ago },
          { user_profile_id: @user_profile_1.id, name: 'dashboard_viewed', occurred_at: 4.days.ago },
        ]
      end

      @user_profile_1.profile_tags.create!(workspace: @workspace, name: 'Active User', user_segment: @user_segment)

      expect(ProfileTag.count).to be(1)
      expect(ProfileTag.active.count).to be(1)
      expect(ProfileTag.removed.count).to be(0)

      expect(IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter).to receive(:perform_async).with([
        hash_including(
          swishjam_api_key: @swishjam_api_key,
          name: 'swishjam_bot.segment_profile_tag_removed',
          properties: hash_including(
            profile_type: 'user',
            profile_id: @user_profile_1.id,
            profile_name: @user_profile_1.full_name,
            profile_email: @user_profile_1.email,
            tag_name: 'Active User',
            tag_id: anything,
          ),
        ),
      ])
      
      results = described_class.new(@user_segment).update_user_segment_profile_tags!
      
      expect(ProfileTag.count).to be(1)
      expect(ProfileTag.active.count).to be(0)
      expect(ProfileTag.removed.count).to be(1)
      expect(results[:user_ids_added]).to match_array([])
      expect(results[:num_users_added]).to be(0)
      expect(results[:user_ids_removed]).to match_array([@user_profile_1.id])
      expect(results[:num_users_removed]).to be(1)
      expect(@user_profile_1.profile_tags.first.name).to eq('Active User')
      expect(@user_profile_1.profile_tags.first.active?).to be(false)
      expect(@user_profile_1.profile_tags.first.user_segment).to eq(@user_segment)

      # if we call it again, it should not try to remove the tag again because its already been removed
      results_2 = described_class.new(@user_segment).update_user_segment_profile_tags!

      expect(ProfileTag.count).to be(1)
      expect(ProfileTag.active.count).to be(0)
      expect(ProfileTag.removed.count).to be(1)
      expect(results_2[:user_ids_added]).to match_array([])
      expect(results_2[:num_users_added]).to be(0)
      expect(results_2[:user_ids_removed]).to match_array([])
      expect(results_2[:num_users_removed]).to be(0)
    end
  end
end