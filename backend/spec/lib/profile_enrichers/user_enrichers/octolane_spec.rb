require 'spec_helper'

describe ProfileEnrichers::UserEnrichers::Octolane do
  before do
    @workspace = FactoryBot.create(:workspace)
  end

  def stub_octolane_request(user:, code: 200, message: 'Success!', response: { 'birthday' => '1990-01-01' })
    body = {}
    body[:email] = user.email if user.email.present?
    body[:name] = user.full_name if user.full_name.present?
    allow(HTTParty).to receive(:post).with(
      'https://enrich.octolane.com/v1/person-by-email',
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
    it 'creates a failed enrichment attempt if the user does not have an email' do
      EnrichmentAttempt.delete_all
      EnrichedData.delete_all
      user_profile = FactoryBot.create(:analytics_user_profile, email: nil, workspace: @workspace)

      expect(described_class.new(user_profile).try_to_enrich!).to be(false)
      expect(EnrichmentAttempt.last.successful).to eq(false)
      expect(EnrichmentAttempt.last.error_message).to eq("swishjam_no_params_provided: expected to AnalyticsUserProfile #{user_profile.id} to have email, full_name attributes, but results were empty.")
      expect(user_profile.enriched_data).to be(nil)
      expect(EnrichedData.count).to be(0)
    end

    it 'creates a successful enrichment attempt if the user has an email and the octolane API returns a 200 response' do
      EnrichmentAttempt.delete_all
      user_profile = FactoryBot.create(:analytics_user_profile, email: 'jenny@swishjam.com', workspace: @workspace)
      stub_octolane_request(user: user_profile)

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
      stub_octolane_request(user: user_profile, code: 401, message: 'No enrichment data found.')

      response = described_class.new(user_profile).try_to_enrich!
      user_profile.reload
      expect(response).to be(false)
      expect(EnrichmentAttempt.last.successful).to eq(false)
      expect(EnrichmentAttempt.last.error_message).to eq('No enrichment data found.')
      expect(user_profile.enriched_data).to be(nil)
      expect(EnrichedData.count).to be(0)
    end

    it 'enqueues replication into ClickHouse with the enriched data' do
      EnrichmentAttempt.delete_all
      EnrichedData.delete_all
      @workspace.reload.settings.update!(should_enrich_user_profile_data: true)

      frozen_time = Time.now
      allow(Time).to receive(:now).and_return(frozen_time)
      
      allow(HTTParty).to receive(:post).with(
        'https://enrich.octolane.com/v1/person-by-email',
        { 
          body: { email: 'jenny@swishjam.com'}.to_json,
          headers: {
            'Content-Type' => 'application/json',
            'x-api-key' => ENV['OCTOLANE_API_KEY'],
          }
        }
      ).and_return({
        'statusCode' => 200,
        'message' => 'Success!',
        'data' => { 'birthday' => '1990-01-01' },
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