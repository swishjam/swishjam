module Ingestion
  class ProfileMerger
    class InvalidMergeError < StandardError; end;
    attr_accessor :previous_profile, :new_profile

    METADATA_THAT_PERSISTS_FROM_PREVIOUS_PROFILE = [
      AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_LANDING_PAGE_URL,
      AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_REFERRER_URL,
      AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_CAMPAIGN,
      AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_CONTENT,
      AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_MEDIUM,
      AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_SOURCE,
      AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_UTM_TERM,
      AnalyticsUserProfile::ReservedMetadataProperties.INITIAL_GCLID,
    ]

    def initialize(previous_profile:, new_profile:)
      @previous_profile = previous_profile
      @new_profile = new_profile
    end

    def merge!
      return false if new_profile == previous_profile
      return false if new_profile.user_unique_identifier == previous_profile.user_unique_identifier
      return InvalidMergeError, "ATTEMPTED TO MERGE A USER PROFILE TO A USER PROFILE THAT BELONGS TO A DIFFERENT WORKSPACE!?!?? NEW PROFILE: #{new_profile.id}, PROFILE TO BE MERGED: #{previous_profile.id}" if new_profile.workspace_id != previous_profile.workspace_id
      first_profile = [previous_profile, new_profile].min_by(&:created_at)
      # Extract the metadata that should persist from whichever profile was created first
      properties_to_carry_over_from_first_profile = first_profile.metadata.slice(*METADATA_THAT_PERSISTS_FROM_PREVIOUS_PROFILE)
      # Merge the new profile's metadata into the old profile's metadata
      merged_metadata = previous_profile.metadata.merge(new_profile.metadata)
      # Merge the persistent metadata into the merged metadata
      new_metadata = merged_metadata.merge(properties_to_carry_over_from_first_profile)
      new_profile.update!(
        metadata: new_metadata,
        last_seen_at_in_web_app: [previous_profile.last_seen_at_in_web_app, new_profile.last_seen_at_in_web_app].compact.max,
        first_seen_at_in_web_app: [previous_profile.first_seen_at_in_web_app, new_profile.first_seen_at_in_web_app].compact.min,
      )
      previous_profile.update!(merged_into_analytics_user_profile_id: new_profile.id)
      new_profile
    end
  end
end