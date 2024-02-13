require 'spec_helper'

describe ProfileEnrichers::UserEnrichers::PeopleDataLabs do
  before do
    @workspace = FactoryBot.create(:workspace)
  end

  def stub_pdl_request(user:, code: 200, error_type: nil, error_message: nil, response: { 'birthday' => '1990-01-01' })
    body = {}
    body[:email] = user.email if user.email.present?
    body[:first_name] = user.first_name if user.first_name.present?
    body[:last_name] = user.last_name if user.last_name.present?
    allow(Peopledatalabs::Enrichment).to receive(:person).with(
      params: body
    ).exactly(1).times.and_return({
      'status' => code,
      'data' => response,
      'error' => { 'type' => error_type, 'message' => error_message },
      'likelihood' => 0.9,
    })
  end

  describe '#try_to_enrich!' do
    it 'creates a failed enrichment attempt if the user does not have an email, first_name, or last_name' do
      EnrichmentAttempt.delete_all
      EnrichedData.delete_all
      user_profile = FactoryBot.create(:analytics_user_profile, email: nil, workspace: @workspace)

      expect(described_class.new(user_profile).try_to_enrich!).to be(false)
      expect(EnrichmentAttempt.last.successful).to eq(false)
      expect(EnrichmentAttempt.last.error_message).to eq("swishjam_no_params_provided: expected to AnalyticsUserProfile #{user_profile.id} to have email, first_name, last_name attributes, but results were empty.")
      expect(user_profile.enriched_data).to be(nil)
      expect(EnrichedData.count).to be(0)
    end

    it 'creates a successful enrichment attempt if the user has an email and the octolane API returns a 200 response' do
      EnrichmentAttempt.delete_all
      user_profile = FactoryBot.create(:analytics_user_profile, email: 'jenny@swishjam.com', workspace: @workspace)
      stub_pdl_request(user: user_profile)

      enrichment_result = described_class.new(user_profile).try_to_enrich!
      user_profile.reload

      expect(enrichment_result).to be_a(EnrichedData)
      expect(EnrichmentAttempt.count).to be(1)
      expect(EnrichmentAttempt.last.successful).to eq(true)
      expect(EnrichmentAttempt.last.error_message).to be(nil)
      expect(EnrichedData.count).to be(1)
      expect(user_profile.enriched_data.birthday).to eq('1990-01-01')
    end

    it 'creates a failed enrichment attempt if the octolane API returns a non-200 response' do
      EnrichmentAttempt.delete_all
      EnrichedData.delete_all
      user_profile = FactoryBot.create(:analytics_user_profile, email: 'jenny@swishjam.com', workspace: @workspace)
      stub_pdl_request(user: user_profile, code: 401, error_type: 'an_error_type', error_message: 'No enrichment data found.')

      response = described_class.new(user_profile).try_to_enrich!
      user_profile.reload
      expect(response).to be(false)
      expect(EnrichmentAttempt.last.successful).to eq(false)
      expect(EnrichmentAttempt.last.error_message).to eq('an_error_type: No enrichment data found.')
      expect(user_profile.enriched_data).to be(nil)
      expect(EnrichedData.count).to be(0)
    end

    it 'enqueues replication into ClickHouse with the enriched data' do
      EnrichmentAttempt.delete_all
      EnrichedData.delete_all
      @workspace.reload.settings.update!(should_enrich_user_profile_data: true, enrichment_provider: 'people_data_labs')

      frozen_time = Time.now
      allow(Time).to receive(:now).and_return(frozen_time)
      
      expect(Peopledatalabs::Enrichment).to receive(:person).with(
        params: { email: 'jenny@swishjam.com' }
      ).exactly(1).times.and_return({
        'status' => 200,
        'data' => { 'birthday' => '1990-01-01' },
        'likelihood' => 0.9,
      })

      expect(Ingestion::QueueManager).to receive(:push_records_into_queue).with(
        Ingestion::QueueManager::Queues.CLICK_HOUSE_USER_PROFILES,
        hash_including(
          workspace_id: @workspace.id,
          swishjam_user_id: kind_of(String),
          user_unique_identifier: 'xyz',
          email: 'jenny@swishjam.com',
          merged_into_swishjam_user_id: nil,
          created_by_data_source: nil,
          metadata: {
            subscription_plan: 'free',
            enriched_birthday: '1990-01-01',
            enriched_match_likelihood: 0.9,
          }.to_json,
          first_seen_at_in_web_app: nil,
          last_seen_at_in_web_app: nil,
          created_at: frozen_time,
          updated_at: frozen_time,
          last_updated_from_transactional_db_at: frozen_time,
        )
      ).exactly(1).times
      user_profile = FactoryBot.create(:analytics_user_profile, 
        workspace: @workspace, 
        email: 'jenny@swishjam.com', 
        user_unique_identifier: 'xyz',
        metadata: { 'subscription_plan' => 'free' }
      )
    end
  end
end