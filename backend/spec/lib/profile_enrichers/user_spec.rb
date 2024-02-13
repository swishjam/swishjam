require 'spec_helper'

describe ProfileEnrichers::User do
  before do
    @workspace = FactoryBot.create(:workspace)
    allow(HTTParty).to receive(:post).with(
      'https://enrich.octolane.com/v1/person-by-email',
      any_args
    ).and_return({ 
      'statusCode' => 200, 
      'message' => 'Success!', 
      'data' => { 'birthday' => '1990-01-01' } 
    })
  end
  
  describe '#try_to_enrich_profile_if_necessary!' do
    it 'returns false if the workspace settings should not enrich user profile data' do
      @workspace.reload.settings.update!(should_enrich_user_profile_data: false)
      user_profile = FactoryBot.create(:analytics_user_profile, workspace: @workspace)
      expect(described_class.new(user_profile).try_to_enrich_profile_if_necessary!).to be(false)
    end

    it 'returns false if the user profile has already been enriched' do
      @workspace.reload.settings.update!(should_enrich_user_profile_data: true)
      user_profile = FactoryBot.create(:analytics_user_profile, workspace: @workspace)
      EnrichedData.create!(workspace: @workspace, enrichable: user_profile, enrichment_service: 'octolane', data: { 'birthday' => '1990-01-01' })
      expect(described_class.new(user_profile).try_to_enrich_profile_if_necessary!).to be(false)
    end

    it 'returns false if the user profile has an email domain that should not be enriched' do
      @workspace.reload.settings.update!(should_enrich_user_profile_data: true)
      user_profile = FactoryBot.create(:analytics_user_profile, workspace: @workspace, email: 'dont-enrich-gmail@gmail.com')
      DoNotEnrichUserProfileRule.create!(workspace: @workspace, email_domain: 'gmail.com')
      expect(described_class.new(user_profile).try_to_enrich_profile_if_necessary!).to be(false)
    end

    it 'calls the Octolane enricher if the user profile should be enriched and the enricher arg = `octolane`' do
      @workspace.reload.settings.update!(should_enrich_user_profile_data: true)
      DoNotEnrichUserProfileRule.create!(workspace: @workspace, email_domain: 'gmail.com')
      expect_any_instance_of(AnalyticsUserProfile).to receive(:enrich_profile!).exactly(1).times.and_return(true)
      user_profile = FactoryBot.create(:analytics_user_profile, workspace: @workspace, email: 'jenny@swishjam.com')
      expect_any_instance_of(ProfileEnrichers::UserEnrichers::Octolane).to receive(:try_to_enrich!).exactly(1).times.and_return(true)
      expect(described_class.new(user_profile, enricher: 'octolane').try_to_enrich_profile_if_necessary!).to be(true)
    end
  end
end