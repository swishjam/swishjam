require 'spec_helper'

describe ProfileEnrichers::OrganizationEnrichers::PeopleDataLabs do
  before do
    @workspace = FactoryBot.create(:workspace)
  end

  def stub_pdl_request(organization:, code: 200, error_message: nil, response: { 'company_size' => '10-20' })
    body = {}
    body[:name] = organization.name if organization.name.present?
    body[:website] = organization.domain if organization.domain.present?
    allow(Peopledatalabs::Enrichment).to receive(:company).with(
      params: body
    ).exactly(1).times.and_return(
      { 'status' => code, 'message' => error_message, 'likelihood' => 0.9 }.merge(response)
    )
  end

  describe '#try_to_enrich!' do
    it 'creates a failed enrichment attempt if the user does not have an email, first_name, or last_name' do
      EnrichmentAttempt.delete_all
      EnrichedData.delete_all
      organization_profile = FactoryBot.create(:analytics_organization_profile, name: nil, workspace: @workspace)

      expect(described_class.new(organization_profile).try_to_enrich!).to be(false)
      expect(EnrichmentAttempt.last.successful).to eq(false)
      expect(EnrichmentAttempt.last.error_message).to eq("swishjam_no_params_provided: expected to AnalyticsOrganizationProfile #{organization_profile.id} to have name, domain attributes, but results were empty.")
      expect(organization_profile.enriched_data).to be(nil)
      expect(EnrichedData.count).to be(0)
    end

    it 'creates a successful enrichment attempt if the user has an email and the octolane API returns a 200 response' do
      EnrichmentAttempt.delete_all
      organization_profile = FactoryBot.create(:analytics_organization_profile, name: 'Swishjam', workspace: @workspace)
      stub_pdl_request(organization: organization_profile)

      enrichment_result = described_class.new(organization_profile).try_to_enrich!
      organization_profile.reload

      expect(enrichment_result).to be_a(EnrichedData)
      expect(EnrichmentAttempt.count).to be(1)
      expect(EnrichmentAttempt.last.successful).to eq(true)
      expect(EnrichmentAttempt.last.error_message).to be(nil)
      expect(EnrichedData.count).to be(1)
      expect(organization_profile.enriched_data.company_size).to eq('10-20')
    end

    it 'creates a failed enrichment attempt if the octolane API returns a non-200 response' do
      EnrichmentAttempt.delete_all
      EnrichedData.delete_all
      organization_profile = FactoryBot.create(:analytics_organization_profile, name: 'Swishjam', workspace: @workspace)
      stub_pdl_request(organization: organization_profile, code: 401, error_message: 'No enrichment data found.')

      response = described_class.new(organization_profile).try_to_enrich!
      organization_profile.reload
      expect(response).to be(false)
      expect(EnrichmentAttempt.last.successful).to eq(false)
      expect(EnrichmentAttempt.last.error_message).to eq('No enrichment data found.')
      expect(organization_profile.enriched_data).to be(nil)
      expect(EnrichedData.count).to be(0)
    end

    it 'enqueues replication into ClickHouse with the enriched data' do
      EnrichmentAttempt.delete_all
      EnrichedData.delete_all
      @workspace.reload.settings.update!(should_enrich_organization_profile_data: true, enrichment_provider: 'people_data_labs')

      frozen_time = Time.now
      allow(Time).to receive(:now).and_return(frozen_time)
      
      expect(Peopledatalabs::Enrichment).to receive(:company).with(
        params: { name: 'Swishjam' }
      ).exactly(1).times.and_return({
        'status' => 200,
        'company_size' => '10-20',
        'likelihood' => 0.9,
      })

      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).with(
        Ingestion::QueueManager::Queues.CLICK_HOUSE_ORGANIZATION_PROFILES,
        hash_including(
          workspace_id: @workspace.id,
          organization_unique_identifier: 'xyz',
          name: 'Swishjam',
          metadata: {
            subscription_plan: 'free',
            enriched_company_size: '10-20',
            enriched_match_likelihood: 0.9,
          }.to_json,
          created_at: frozen_time,
          updated_at: frozen_time,
          last_updated_from_transactional_db_at: frozen_time,
        )
      ).exactly(1).times
      FactoryBot.create(:analytics_organization_profile, 
        workspace: @workspace, 
        name: 'Swishjam', 
        organization_unique_identifier: 'xyz',
        metadata: { 'subscription_plan' => 'free' }
      )
    end
  end
end