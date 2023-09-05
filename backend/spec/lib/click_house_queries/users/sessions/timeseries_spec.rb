require 'spec_helper'

describe ClickHouseQueries::Users::Sessions::Timeseries do
  before do
  end

  describe '#timeseries' do
    it 'returns the correct count of sessions for the specified user and timeframe in a timeseries format' do
      workspace = FactoryBot.create(:workspace)
      user = FactoryBot.create(:analytics_user_profile, workspace: workspace)
      FactoryBot.create(:analytics_event, name: Analytics::Event::ReservedNames.NEW_SESSION, swishjam_user_id: user.id, occurred_at: 1.day.ago)
      FactoryBot.create(:analytics_event, name: Analytics::Event::ReservedNames.NEW_SESSION, swishjam_user_id: user.id, occurred_at: 1.day.ago)
      FactoryBot.create(:analytics_event, name: Analytics::Event::ReservedNames.NEW_SESSION, swishjam_user_id: user.id, occurred_at: 1.day.ago)
      FactoryBot.create(:analytics_event, name: Analytics::Event::ReservedNames.NEW_SESSION, swishjam_user_id: user.id, occurred_at: 2.days.ago)
      FactoryBot.create(:analytics_event, name: Analytics::Event::ReservedNames.NEW_SESSION, swishjam_user_id: user.id, occurred_at: 2.days.ago)
      FactoryBot.create(:analytics_event, name: Analytics::Event::ReservedNames.NEW_SESSION, swishjam_user_id: user.id, occurred_at: 3.days.ago)
      FactoryBot.create(:analytics_event, name: Analytics::Event::ReservedNames.NEW_SESSION, swishjam_user_id: user.id, occurred_at: 3.days.ago)
      FactoryBot.create(:analytics_event, name: Analytics::Event::ReservedNames.NEW_SESSION, swishjam_user_id: user.id, occurred_at: 3.days.ago)
      FactoryBot.create(:analytics_event, name: Analytics::Event::ReservedNames.NEW_SESSION, swishjam_user_id: user.id, occurred_at: 4.days.ago)
      FactoryBot.create(:analytics_event, name: Analytics::Event::ReservedNames.NEW_SESSION, swishjam_user_id: user.id, occurred_at: 4.days.ago)
      FactoryBot.create(:analytics_event, name: Analytics::Event::ReservedNames.NEW_SESSION, swishjam_user_id: user.id, occurred_at: 4.days.ago)
      FactoryBot.create(:analytics_event, name: Analytics::Event::ReservedNames.NEW_SESSION, swishjam_user_id: user.id, occurred_at: 5.days.ago
    end
  end
end