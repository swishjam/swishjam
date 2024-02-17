require 'spec_helper'

describe ClickHouseQueries::Users::Timeseries do
  before do
    @frozen_time = Time.current
    @workspace = FactoryBot.create(:workspace)
    @start_time = @frozen_time - 30.days
    @end_time = @frozen_time
  end

  describe '#get' do
    it 'works' do
      segment = FactoryBot.create(:user_segment, workspace_id: @workspace.id)
      FactoryBot.create(:user_segment_filter, user_segment: segment, sequence_position: 1, config: { 'object_type' => 'event', 'event_name' => 'test', 'num_lookback_days' => 30, 'num_event_occurrences' => 2 })
      FactoryBot.create(:user_segment_filter, user_segment: segment, sequence_position: 2, parent_relationship_operator: 'or', config: { 'object_type' => 'user', 'user_property_name' => 'college_attended', 'user_property_operator' => 'equals', 'user_property_value' => 'Springfield' })

      result = ClickHouseQueries::Users::Timeseries.new(@workspace.id, start_time: @start_time, end_time: @end_time, user_segments: [segment]).get
      byebug
    end
  end
end