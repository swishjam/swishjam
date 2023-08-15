require 'spec_helper'

describe CaptureAnalyticDataJob do
  describe '#perform' do
    it 'loops through the event payload and calls the associated processor class' do
      swishjam_organization = FactoryBot.create(:swishjam_organization)
      event_payload = [
        { 'type' => 'page' },
        { 'type' => 'identify' },
        { 'type' => 'organization' },
        { 'type' => 'custom' },
      ]
      expect(AnalyticsEventProcessors::PageView).to(
        receive(:new)
          .with(swishjam_organization.public_key, { 'type' => 'page' })
          .exactly(1)
          .times.and_call_original
      )
      expect(AnalyticsEventProcessors::Identify).to(
        receive(:new)
          .with(swishjam_organization.public_key, { 'type' => 'identify' })
          .exactly(1)
          .times.and_call_original
      )
      expect(AnalyticsEventProcessors::Organization).to(
        receive(:new)
          .with(swishjam_organization.public_key, { 'type' => 'organization' })
          .exactly(1)
          .times.and_call_original
      )
      expect(AnalyticsEventProcessors::Custom).to(
        receive(:new)
          .with(swishjam_organization.public_key, { 'type' => 'custom' })
          .exactly(1)
          .times.and_call_original
      )
      expect_any_instance_of(AnalyticsEventProcessors::PageView).to receive(:process!).and_return(true)
      expect_any_instance_of(AnalyticsEventProcessors::Identify).to receive(:process!).and_return(true)
      expect_any_instance_of(AnalyticsEventProcessors::Organization).to receive(:process!).and_return(true)
      expect_any_instance_of(AnalyticsEventProcessors::Custom).to receive(:process!).and_return(true)

      CaptureAnalyticDataJob.perform_sync(swishjam_organization.public_key, event_payload)
    end

    it 'raises an error if the api key is invalid' do
      expect { CaptureAnalyticDataJob.perform_sync('invalid', []) }.to raise_error(CaptureAnalyticDataJob::InvalidApiKeyError)
    end
  end
end