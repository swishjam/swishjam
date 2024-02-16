require 'spec_helper'

RSpec.describe "CaptureController", type: :request do
  describe 'POST /api/v1/capture' do
    let(:api_key) { 'your-api-key' }
    let(:headers) { { 'X-Swishjam-Api-Key' => api_key, 'CONTENT_TYPE' => 'application/json' } }
    let(:payload) { [{ 'uuid' => 'test-uuid', 'event' => 'test-event', 'timestamp' => Time.current.to_f, 'properties' => { 'event_key' => 'my_event_value!' } }] }

    before(:each) do
      allow(ApiKey).to receive_message_chain(:enabled, :where, :exists?).and_return(true)
    end

    def expect_ingestion_job_not_to_be_enqueued
      expect(IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter).not_to receive(:perform_async)
    end

    def expect_ingestion_job_to_be_enqueued
      expected_payload = (payload.is_a?(Array) ? payload : [payload]).map do |e|
        Ingestion::EventsPreparer.format_for_events_to_prepare_queue(
          uuid: e['uuid'],
          swishjam_api_key: api_key,
          name: e['event'],
          occurred_at: e['timestamp'],
          properties: e['properties'],
        )
      end
      expect(IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter).to receive(:perform_async).with(expected_payload)
    end

    context 'when api key is missing' do
      let(:api_key) { '' }

      it 'returns bad request status' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(response).to have_http_status(:bad_request)
      end

      it 'returns error message' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(JSON.parse(response.body)['error']).to eq('Swishjam API Key not present, please provide it in the X-Swishjam-Api-Key header.')
      end

      it 'does not enqueue events to the IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter' do
        expect_ingestion_job_not_to_be_enqueued
        post '/api/v1/capture', params: payload.to_json, headers: headers
      end
    end

    context 'when api key is invalid' do
      before do
        allow(ApiKey).to receive_message_chain(:enabled, :where, :exists?).and_return(false)
      end

      it 'returns unauthorized status' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(response).to have_http_status(:unauthorized)
      end

      it 'returns error message' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(JSON.parse(response.body)['error']).to include('Invalid Swishjam API Key provided to capture endpoint:')
      end

      it 'does not enqueue events to the IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter' do
        expect_ingestion_job_not_to_be_enqueued
        post '/api/v1/capture', params: payload.to_json, headers: headers
      end
    end

    context 'when payload has an event without a name' do
      let(:payload) {[
        { 'event' => 'test-event', 'properties' => { 'foo' => 'bar' }}, 
        { 'event' => '', 'properties' => { 'foo' => 'bar' }}
      ]}
      
      it 'returns unauthorized status' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(response).to have_http_status(:bad_request)
      end

      it 'returns error message' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(JSON.parse(response.body)['error']).to eq('Invalid payload format. Event name is required for each event.')
      end

      it 'does not enqueue events to the IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter' do
        expect_ingestion_job_not_to_be_enqueued
        post '/api/v1/capture', params: payload.to_json, headers: headers
      end
    end

    context 'when payload is an Array' do
      it 'returns ok status' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(response).to have_http_status(:ok)
      end

      it 'returns ok message' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(JSON.parse(response.body)['message']).to eq('ok')
      end

      it 'enqueues events to the IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter' do
        expect_ingestion_job_to_be_enqueued
        post '/api/v1/capture', params: payload.to_json, headers: headers
      end
    end

    context 'when payload is a Hash' do
      let(:payload) {{ 'uuid' => 'test-uuid', 'event' => 'test-event', 'timestamp' => Time.current.to_f, 'properties' => { 'event_key' => 'my_event_value!' }}}

      it 'returns ok status' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(response).to have_http_status(:ok)
      end

      it 'returns ok message' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(JSON.parse(response.body)['message']).to eq('ok')
      end

      it 'enqueues events to the IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter' do
        expect_ingestion_job_to_be_enqueued
        post '/api/v1/capture', params: payload.to_json, headers: headers
      end
    end
  end

  # routes.rb points this endpoint to the same exact controller method, just making sure though
  describe 'POST /api/v1/event' do
    let(:api_key) { 'your-api-key' }
    let(:headers) { { 'X-Swishjam-Api-Key' => api_key, 'CONTENT_TYPE' => 'application/json' } }
    let(:payload) { [{ 'uuid' => 'test-uuid', 'event' => 'test-event', 'timestamp' => Time.current.to_f, 'properties' => { 'event_key' => 'my_event_value!' } }] }

    before(:each) do
      allow(ApiKey).to receive_message_chain(:enabled, :where, :exists?).and_return(true)
    end

    def expect_ingestion_job_not_to_be_enqueued
      expect(IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter).not_to receive(:perform_async)
    end

    def expect_ingestion_job_to_be_enqueued
      expected_payload = (payload.is_a?(Array) ? payload : [payload]).map do |e|
        Ingestion::EventsPreparer.format_for_events_to_prepare_queue(
          uuid: e['uuid'],
          swishjam_api_key: api_key,
          name: e['event'],
          occurred_at: e['timestamp'],
          properties: e['properties'],
        )
      end
      expect(IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter).to receive(:perform_async).with(expected_payload)
    end

    context 'when api key is missing' do
      let(:api_key) { '' }

      it 'returns bad request status' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(response).to have_http_status(:bad_request)
      end

      it 'returns error message' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(JSON.parse(response.body)['error']).to eq('Swishjam API Key not present, please provide it in the X-Swishjam-Api-Key header.')
      end

      it 'does not enqueue events to the IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter' do
        expect_ingestion_job_not_to_be_enqueued
        post '/api/v1/capture', params: payload.to_json, headers: headers
      end
    end

    context 'when api key is invalid' do
      before do
        allow(ApiKey).to receive_message_chain(:enabled, :where, :exists?).and_return(false)
      end

      it 'returns unauthorized status' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(response).to have_http_status(:unauthorized)
      end

      it 'returns error message' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(JSON.parse(response.body)['error']).to include('Invalid Swishjam API Key provided to capture endpoint:')
      end

      it 'does not enqueue events to the IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter' do
        expect_ingestion_job_not_to_be_enqueued
        post '/api/v1/capture', params: payload.to_json, headers: headers
      end
    end

    context 'when payload has an event without a name' do
      let(:payload) {[
        { 'event' => 'test-event', 'properties' => { 'foo' => 'bar' }}, 
        { 'event' => '', 'properties' => { 'foo' => 'bar' }}
      ]}
      
      it 'returns unauthorized status' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(response).to have_http_status(:bad_request)
      end

      it 'returns error message' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(JSON.parse(response.body)['error']).to eq('Invalid payload format. Event name is required for each event.')
      end

      it 'does not enqueue events to the IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter' do
        expect_ingestion_job_not_to_be_enqueued
        post '/api/v1/capture', params: payload.to_json, headers: headers
      end
    end

    context 'when payload is an Array' do
      it 'returns ok status' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(response).to have_http_status(:ok)
      end

      it 'returns ok message' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(JSON.parse(response.body)['message']).to eq('ok')
      end

      it 'enqueues events to the IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter' do
        expect_ingestion_job_to_be_enqueued
        post '/api/v1/capture', params: payload.to_json, headers: headers
      end
    end

    context 'when payload is a Hash' do
      let(:payload) {{ 'uuid' => 'test-uuid', 'event' => 'test-event', 'timestamp' => Time.current.to_f, 'properties' => { 'event_key' => 'my_event_value!' }}}

      it 'returns ok status' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(response).to have_http_status(:ok)
      end

      it 'returns ok message' do
        post '/api/v1/capture', params: payload.to_json, headers: headers
        expect(JSON.parse(response.body)['message']).to eq('ok')
      end

      it 'enqueues events to the IngestionJobs::PrepareEventsAndEnqueueIntoClickHouseWriter' do
        expect_ingestion_job_to_be_enqueued
        post '/api/v1/capture', params: payload.to_json, headers: headers
      end
    end
  end
end