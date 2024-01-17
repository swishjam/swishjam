require 'spec_helper'

describe Ingestion::UserIdentifyHandler do
  describe '#handle_identify_and_return_new_event_json!' do
    it 'creates a new device and user profile if the device is new' do
      workspace = FactoryBot.create(:workspace)
      public_key = workspace.api_keys.for_data_source!('product').public_key
      event_json = {
        'uuid' => 'evt-123',
        'swishjam_api_key' => public_key,
        'name' => 'identify',
        'occurred_at' => Time.current.to_s,
        'properties' => {
          'device_fingerprint' => 'abc',
          'device_identifier' => '123',
          'uniqueIdentifier' => 'my-user-uniuqe-identifier',
          'email' => 'jenny@swishjam.com',
          'first_name' => 'Jenny',
          'last_name' => 'Rosen',
          'phone_number' => '1234567890',
          # I think technically this would also be in the payload, but we don't actually use any of it for the identify logic
          'user_attributes' => {
            'unique_identifier' => '123',
            'email' => 'jenny@swishjam.com',
            'first_name' => 'Jenny',
            'last_name' => 'Swishjam',
            'phone_number' => '1234567890',
          },
        },
      }
      handler = described_class.new(event_json)
      handler.handle_identify_and_return_new_event_json!
    end
  end
end