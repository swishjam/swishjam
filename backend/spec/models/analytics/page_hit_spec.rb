require 'spec_helper'

describe Analytics::PageHit do
  before do
    setup_test_data
  end

  describe '#self.first_of_sessions' do
    it 'returns the first page hit of each session for the provided `swishjam_organization`' do
      device_1 = FactoryBot.create(:analytics_device, swishjam_organization: @swishjam_organization)
      
      session_1 = FactoryBot.create(:analytics_session, device: device_1)
      page_hit_1 = FactoryBot.create(:analytics_page_hit, session: session_1)
      page_hit_2 = FactoryBot.create(:analytics_page_hit, session: session_1, start_time: page_hit_1.start_time + 1.second)
      
      session_2 = FactoryBot.create(:analytics_session, device: device_1)
      page_hit_3 = FactoryBot.create(:analytics_page_hit, session: session_2)
      page_hit_4 = FactoryBot.create(:analytics_page_hit, session: session_2, start_time: page_hit_3.start_time - 1.second)
      
      swishjam_organization_2 = FactoryBot.create(:swishjam_organization)
      device_2 = FactoryBot.create(:analytics_device, swishjam_organization: swishjam_organization_2)
      session_3 = FactoryBot.create(:analytics_session, device: device_2)
      page_hit_5 = FactoryBot.create(:analytics_page_hit, session: session_3)
      page_hit_6 = FactoryBot.create(:analytics_page_hit, session: session_3, start_time: page_hit_5.start_time + 1.second)

      expect(Analytics::PageHit.first_of_sessions(@swishjam_organization).count).to eq(2)
      expect(Analytics::PageHit.first_of_sessions(@swishjam_organization)).to include(page_hit_1)
      expect(Analytics::PageHit.first_of_sessions(@swishjam_organization)).to include(page_hit_4)
    end
  end
end