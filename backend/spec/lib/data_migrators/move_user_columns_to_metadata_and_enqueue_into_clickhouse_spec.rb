require 'spec_helper'

describe DataMigrators::MoveUserColumnsToMetadataAndEnqueueIntoClickhouse do
  describe '#run!' do
    it 'updates the metadata of all users in Postgres with their first_name, last_name, initial_landing_page_url, and initial_referrer_url and enqueues them into ClickHouse' do
      workspace = FactoryBot.create(:workspace)
      workspace_2 = FactoryBot.create(:workspace)

      john_doe = FactoryBot.create(:analytics_user_profile, workspace: workspace, first_name: 'John', last_name: 'Doe', initial_landing_page_url: 'https://www.example.com', initial_referrer_url: 'https://www.google.com', metadata: { pre_existing: 'value' })
      jane_doe = FactoryBot.create(:analytics_user_profile, workspace: workspace, first_name: 'Jane', last_name: 'Doe', initial_landing_page_url: 'https://www.example.com', initial_referrer_url: 'https://www.google.com', metadata: { pre_existing: 'value' })
      john_smith = FactoryBot.create(:analytics_user_profile, workspace: workspace_2, first_name: 'John', last_name: 'Smith', initial_landing_page_url: 'https://www.example.com', initial_referrer_url: 'https://www.google.com', metadata: { pre_existing: 'value' })

      expect(Ingestion::QueueManager).to receive(:pop_all_records_from_queue).with(Ingestion::QueueManager::Queues.CLICK_HOUSE_USER_PROFILES)

      described_class.run!

      john_doe.reload
      expect(john_doe.metadata['first_name']).to eq('John')
      expect(john_doe.metadata['last_name']).to eq('Doe')
      expect(john_doe.metadata['initial_landing_page_url']).to eq('https://www.example.com')
      expect(john_doe.metadata['initial_referrer_url']).to eq('https://www.google.com')
      expect(john_doe.metadata['pre_existing']).to eq('value')
      expect(john_doe.read_attribute(:first_name)).to be_nil
      expect(john_doe.read_attribute(:last_name)).to be_nil
      expect(john_doe.initial_landing_page_url).to be_nil
      expect(john_doe.initial_referrer_url).to be_nil

      jane_doe.reload
      expect(jane_doe.metadata['first_name']).to eq('Jane')
      expect(jane_doe.metadata['last_name']).to eq('Doe')
      expect(jane_doe.metadata['initial_landing_page_url']).to eq('https://www.example.com')
      expect(jane_doe.metadata['initial_referrer_url']).to eq('https://www.google.com')
      expect(jane_doe.metadata['pre_existing']).to eq('value')
      expect(jane_doe.read_attribute(:first_name)).to be_nil
      expect(jane_doe.read_attribute(:last_name)).to be_nil
      expect(jane_doe.initial_landing_page_url).to be_nil
      expect(jane_doe.initial_referrer_url).to be_nil

      john_smith.reload
      expect(john_smith.metadata['first_name']).to eq('John')
      expect(john_smith.metadata['last_name']).to eq('Smith')
      expect(john_smith.metadata['initial_landing_page_url']).to eq('https://www.example.com')
      expect(john_smith.metadata['initial_referrer_url']).to eq('https://www.google.com')
      expect(john_smith.metadata['pre_existing']).to eq('value')
      expect(john_smith.read_attribute(:first_name)).to be_nil
      expect(john_smith.read_attribute(:last_name)).to be_nil
      expect(john_smith.initial_landing_page_url).to be_nil
      expect(john_smith.initial_referrer_url).to be_nil
    end
  end
end