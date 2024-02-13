require 'spec_helper'

describe ProfileEnrichers::Organization do
  before do
    @workspace = FactoryBot.create(:workspace)
    allow(HTTParty).to receive(:post).with(
      'https://enrich.octolane.com/v1/company',
      any_args
    ).and_return({ 
      'statusCode' => 200, 
      'message' => 'Success!', 
      'data' => { 'birthday' => '1990-01-01' } 
    })
  end
  
  describe '#try_to_enrich_profile_if_necessary!' do
    it 'returns false if the workspace settings should not enrich organization profile data' do
      @workspace.reload.settings.update!(should_enrich_organization_profile_data: false)
      organization_profile = FactoryBot.create(:analytics_organization_profile, workspace: @workspace)
      expect(described_class.new(organization_profile).try_to_enrich_profile_if_necessary!).to be(false)
    end

    it 'returns false if the user profile has already been enriched' do
      @workspace.reload.settings.update!(should_enrich_organization_profile_data: true)
      organization_profile = FactoryBot.create(:analytics_organization_profile, workspace: @workspace)
      EnrichedData.create!(workspace: @workspace, enrichable: organization_profile, enrichment_service: 'octolane', data: { 'company_size' => '10-20' })
      expect(described_class.new(organization_profile).try_to_enrich_profile_if_necessary!).to be(false)
    end

    it 'calls the Octolane enricher if the organization profile should be enriched and the enricher arg = `octolane`' do
      @workspace.reload.settings.update!(should_enrich_organization_profile_data: true)
      expect_any_instance_of(AnalyticsOrganizationProfile).to receive(:enrich_profile!).exactly(1).times.and_return(true)
      organization_profile = FactoryBot.create(:analytics_organization_profile, workspace: @workspace, name: 'Swishjam')
      expect_any_instance_of(ProfileEnrichers::OrganizationEnrichers::Octolane).to receive(:try_to_enrich!).exactly(1).times.and_return('stubbed!')
      expect(described_class.new(organization_profile, enricher: 'octolane').try_to_enrich_profile_if_necessary!).to eq('stubbed!')
    end
  end
end