require 'spec_helper'

describe ProfileEnrichers::OrganizationEnrichers::Octolane do
  before do
    @workspace = FactoryBot.create(:workspace)
  end

  def stub_octolane_request(organization:, code: 200, message: 'Success!', response: { 'company_size' => '10-20' })
    body = {}
    body[:domain] = organization.domain if organization.domain.present?
    body[:company_name] = organization.name if organization.name.present?
    allow(HTTParty).to receive(:post).with(
      'https://enrich.octolane.com/v1/company',
      {
        body: body.to_json,
        headers: {
          'Content-Type' => 'application/json',
          'x-api-key' => ENV['OCTOLANE_API_KEY'],
        }
      }
    ).exactly(1).times.and_return({
      'statusCode' => code,
      'message' => message,
      'data' => response,
    })
  end

  describe '#try_to_enrich!' do
    it 'creates a failed enrichment attempt if the organization does not have a name or domain' do
      EnrichmentAttempt.delete_all
      EnrichedData.delete_all
      organization_profile = FactoryBot.create(:analytics_organization_profile, name: nil, workspace: @workspace)

      expect(described_class.new(organization_profile).try_to_enrich!).to be(false)
      expect(EnrichmentAttempt.last.successful).to eq(false)
      expect(EnrichmentAttempt.last.error_message).to eq("swishjam_no_params_provided: expected to AnalyticsOrganizationProfile #{organization_profile.id} to have domain, name attributes, but results were empty.")
      expect(organization_profile.enriched_data).to be(nil)
      expect(EnrichedData.count).to be(0)
    end

    it 'creates a successful enrichment attempt if the user has an email and the octolane API returns a 200 response' do
      EnrichmentAttempt.delete_all
      organization_profile = FactoryBot.create(:analytics_organization_profile, name: 'Swishjam', workspace: @workspace)
      stub_octolane_request(organization: organization_profile)

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
      stub_octolane_request(organization: organization_profile, code: 401, message: 'No enrichment data found.')

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
      @workspace.reload.settings.update!(should_enrich_organization_profile_data: true, enrichment_provider: 'octolane')

      frozen_time = Time.now
      allow(Time).to receive(:now).and_return(frozen_time)
      
      allow(HTTParty).to receive(:post).with(
        'https://enrich.octolane.com/v1/company',
        { 
          body: { company_name: 'Swishjam' }.to_json,
          headers: {
            'Content-Type' => 'application/json',
            'x-api-key' => ENV['OCTOLANE_API_KEY'],
          }
        }
      ).and_return({
        'statusCode' => 200,
        'message' => 'Success!',
        'data' => { 'company_size' => '10-20' },
      })

      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).with(
        Ingestion::QueueManager::Queues.CLICK_HOUSE_ORGANIZATION_PROFILES,
        hash_including(
          workspace_id: @workspace.id,
          organization_unique_identifier: 'xyz',
          name: 'Swishjam',
          domain: nil,
          metadata: {
            subscription_plan: 'free',
            enriched_company_size: '10-20',
          }.to_json,
          last_updated_from_transactional_db_at: frozen_time,
          created_at: frozen_time,
          updated_at: frozen_time,
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