require 'spec_helper'

describe ReportHandlers::Slack do
  describe '#send_report' do
    it 'calculates the correct timstamps for a `period_interval` of `day`' do
      workspace = FactoryBot.create(:workspace)
      report = FactoryBot.create(:report, workspace: workspace)
      two_days_handler = described_class.new(report, num_periods: 2, period_interval: 'day')
      expect(two_days_handler.current_period_start_date).to eq(Time.current.beginning_of_day - 2.days)
      expect(two_days_handler.current_period_end_date).to eq(Time.current.beginning_of_day)
      expect(two_days_handler.previous_period_start_date).to eq(Time.current.beginning_of_day - 4.days)
      expect(two_days_handler.previous_period_end_date).to eq(Time.current.beginning_of_day - 2.days)

      one_day_handler = described_class.new(report, num_periods: 1, period_interval: 'day')
      expect(one_day_handler.current_period_start_date).to eq(Time.current.beginning_of_day - 1.day)
      expect(one_day_handler.current_period_end_date).to eq(Time.current.beginning_of_day)
      expect(one_day_handler.previous_period_start_date).to eq(Time.current.beginning_of_day - 2.days)
      expect(one_day_handler.previous_period_end_date).to eq(Time.current.beginning_of_day - 1.day)
    end

    it 'calculates the correct timstamps for a `period_interval` of `week`' do
      workspace = FactoryBot.create(:workspace)
      report = FactoryBot.create(:report, workspace: workspace)
      two_weeks_handler = described_class.new(report, num_periods: 2, period_interval: 'week')
      expect(two_weeks_handler.current_period_start_date).to eq(Time.current.beginning_of_day - 2.weeks)
      expect(two_weeks_handler.current_period_end_date).to eq(Time.current.beginning_of_day)
      expect(two_weeks_handler.previous_period_start_date).to eq(Time.current.beginning_of_day - 4.weeks)
      expect(two_weeks_handler.previous_period_end_date).to eq(Time.current.beginning_of_day - 2.weeks)

      one_week_handler = described_class.new(report, num_periods: 1, period_interval: 'week')
      expect(one_week_handler.current_period_start_date).to eq(Time.current.beginning_of_day - 1.week)
      expect(one_week_handler.current_period_end_date).to eq(Time.current.beginning_of_day)
      expect(one_week_handler.previous_period_start_date).to eq(Time.current.beginning_of_day - 2.weeks)
      expect(one_week_handler.previous_period_end_date).to eq(Time.current.beginning_of_day - 1.week)
    end

    it 'calculates the correct timstamps for a `period_interval` of `month`' do
      workspace = FactoryBot.create(:workspace)
      report = FactoryBot.create(:report, workspace: workspace)
      two_months_handler = described_class.new(report, num_periods: 2, period_interval: 'month')
      expect(two_months_handler.current_period_start_date).to eq(Time.current.beginning_of_day - 2.months)
      expect(two_months_handler.current_period_end_date).to eq(Time.current.beginning_of_day)
      expect(two_months_handler.previous_period_start_date).to eq(Time.current.beginning_of_day - 4.months)
      expect(two_months_handler.previous_period_end_date).to eq(Time.current.beginning_of_day - 2.months)

      one_month_handler = described_class.new(report, num_periods: 1, period_interval: 'month')
      expect(one_month_handler.current_period_start_date).to eq(Time.current.beginning_of_day - 1.month)
      expect(one_month_handler.current_period_end_date).to eq(Time.current.beginning_of_day)
      expect(one_month_handler.previous_period_start_date).to eq(Time.current.beginning_of_day - 2.months)
      expect(one_month_handler.previous_period_end_date).to eq(Time.current.beginning_of_day - 1.month)
    end
  end
end