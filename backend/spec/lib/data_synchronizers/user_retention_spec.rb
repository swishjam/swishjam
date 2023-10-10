require 'spec_helper'

describe DataSynchronizers::UserRetention do
  before do
    @workspace = FactoryBot.create(:workspace)
  end
  
  def stub_retention_query(results)
    expect_any_instance_of(ClickHouseQueries::Users::Retention::Weekly).to receive(:get).and_return(results)
  end

  it 'creates a new cohort with it\'s activity data if one does not yet exist for this time period' do
    stub_retention_query({
      Time.current.beginning_of_week.to_date.to_s => {
        cohort_size: 10,
        activity_periods: {
          Time.current.beginning_of_week.to_date.to_s => {
            num_active_users: 5,
            num_periods_after_cohort: 0
          }
        }
      }
    })
    expect(@workspace.retention_cohorts.count).to be(0)
    DataSynchronizers::UserRetention.new(@workspace).sync_workspaces_retention_cohort_data!
    expect(@workspace.retention_cohorts.count).to be(1)
    expect(@workspace.retention_cohorts.first.num_users_in_cohort).to be(10)
    expect(@workspace.retention_cohorts.first.time_period).to eq(Time.current.beginning_of_week.to_date)
    expect(@workspace.retention_cohorts.first.retention_cohort_activity_periods.count).to be(1)
    expect(@workspace.retention_cohorts.first.retention_cohort_activity_periods.first.time_period).to eq(Time.current.beginning_of_week.to_date)
    expect(@workspace.retention_cohorts.first.retention_cohort_activity_periods.first.num_active_users).to be(5)
    expect(@workspace.retention_cohorts.first.retention_cohort_activity_periods.first.num_periods_after_cohort).to be(0)
  end

  it 'updates the cohort\'s activity data if one already exists for this time period' do
    existing_cohort = FactoryBot.create(:retention_cohort, workspace: @workspace)
    activity_period = FactoryBot.create(:retention_cohort_activity_period, workspace: @workspace, retention_cohort: existing_cohort)
    stub_retention_query({
      existing_cohort.time_period.to_s => {
        cohort_size: existing_cohort.num_users_in_cohort,
        activity_periods: {
          activity_period.time_period.to_s => {
            num_active_users: activity_period.num_active_users,
            num_periods_after_cohort: activity_period.num_periods_after_cohort
          }
        }
      }
    })
    expect(@workspace.retention_cohorts.count).to be(1)
    expect(@workspace.retention_cohorts.first.retention_cohort_activity_periods.count).to be(1)
    DataSynchronizers::UserRetention.new(@workspace).sync_workspaces_retention_cohort_data!
    expect(@workspace.retention_cohorts.count).to be(1)
    expect(@workspace.retention_cohorts.first.num_users_in_cohort).to be(existing_cohort.num_users_in_cohort)
    expect(@workspace.retention_cohorts.first.time_period).to eq(existing_cohort.time_period)
    expect(@workspace.retention_cohorts.first.retention_cohort_activity_periods.count).to be(1)
    expect(@workspace.retention_cohorts.first.retention_cohort_activity_periods.first.time_period).to eq(activity_period.time_period)
    expect(@workspace.retention_cohorts.first.retention_cohort_activity_periods.first.num_active_users).to be(activity_period.num_active_users)
    expect(@workspace.retention_cohorts.first.retention_cohort_activity_periods.first.num_periods_after_cohort).to be(activity_period.num_periods_after_cohort)
  end

  it 'updates the cohort\'s activity data and creates new activity periods when new ones are present' do
    existing_cohort = FactoryBot.create(:retention_cohort, workspace: @workspace)
    activity_period = FactoryBot.create(:retention_cohort_activity_period, workspace: @workspace, retention_cohort: existing_cohort)
    stub_retention_query({
      existing_cohort.time_period.to_s => {
        cohort_size: existing_cohort.num_users_in_cohort,
        activity_periods: {
          activity_period.time_period.to_s => {
            num_active_users: activity_period.num_active_users,
            num_periods_after_cohort: activity_period.num_periods_after_cohort
          },
          2.weeks.ago.to_date.to_s => {
            num_active_users: 1,
            num_periods_after_cohort: 2
          }
        }
      }
    })
    expect(@workspace.retention_cohorts.count).to be(1)
    expect(@workspace.retention_cohorts.first.retention_cohort_activity_periods.count).to be(1)
    DataSynchronizers::UserRetention.new(@workspace).sync_workspaces_retention_cohort_data!
    expect(@workspace.retention_cohorts.count).to be(1)
    expect(@workspace.retention_cohorts.first.num_users_in_cohort).to be(existing_cohort.num_users_in_cohort)
    expect(@workspace.retention_cohorts.first.time_period).to eq(existing_cohort.time_period)
    expect(@workspace.retention_cohorts.first.retention_cohort_activity_periods.count).to be(2)

    existing_activity_period = @workspace.retention_cohorts.first.retention_cohort_activity_periods.find(activity_period.id)
    expect(existing_activity_period.time_period).to eq(activity_period.time_period)
    expect(existing_activity_period.num_active_users).to be(activity_period.num_active_users)
    expect(existing_activity_period.num_periods_after_cohort).to be(activity_period.num_periods_after_cohort)
    
    new_activity_period = @workspace.retention_cohorts.first.retention_cohort_activity_periods.where.not(id: activity_period.id).first
    expect(new_activity_period.time_period).to eq(2.weeks.ago.to_date)
    expect(new_activity_period.num_active_users).to be(1)
    expect(new_activity_period.num_periods_after_cohort).to be(2)
  end
end