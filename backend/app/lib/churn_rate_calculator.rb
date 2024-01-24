class ChurnRateCalculator
  include TimeseriesHelper
  attr_accessor :group_by, :churn_period_start_time, :churn_period_end_time

  def initialize(swishjam_stripe_public_key, start_time: 30.days.ago, end_time: Time.current, num_days_in_churn_period: 30)
    @swishjam_stripe_public_key = swishjam_stripe_public_key
    @group_by = derived_group_by(start_ts: start_time, end_ts: end_time)
    @snapshot_start_time, @snapshot_end_time = rounded_timestamps(
      start_ts: start_time - num_days_in_churn_period.days, 
      end_ts: end_time - num_days_in_churn_period.days, 
      group_by: @group_by
    )
    @churn_period_start_time = @snapshot_start_time + num_days_in_churn_period.days
    @churn_period_end_time = @snapshot_end_time + num_days_in_churn_period.days
    @num_days_in_churn_period = num_days_in_churn_period
  end

  def timeseries
    current_time = @churn_period_start_time
    timeseries = []
    while current_time < @churn_period_end_time
      all_snapshots_taken_within_last_30_days = billing_data_snapshots_for_time_period.find_all do |snapshot| 
        snapshot['captured_at'].to_date.send(:"beginning_of_#{@group_by}") == (current_time - @num_days_in_churn_period.days).to_date.send(:"beginning_of_#{@group_by}")
      end
      last_snapshot_taken_30_days_ago = all_snapshots_taken_within_last_30_days.max_by{ |snapshot| snapshot['captured_at'] }
      num_active_subscriptions_within_last_30_days = (last_snapshot_taken_30_days_ago || { 'num_active_subscriptions' => 0 })['num_active_subscriptions']
      num_new_subscriptions_since_within_last_30_days = all_new_subscription_events_for_period.count do |event| 
        event['occurred_at'].to_time  >= (current_time - @num_days_in_churn_period.days) && event['occurred_at'].to_time <= current_time
      end
      churned_subscriptions_within_last_30_days = all_churn_events_for_period.find_all do |event|
        event['occurred_at'].to_time >= (current_time - @num_days_in_churn_period.days) && event['occurred_at'].to_time <= current_time
      end

      churn_rate = (num_active_subscriptions_within_last_30_days + num_new_subscriptions_since_within_last_30_days).zero? ? 0.0 : churned_subscriptions_within_last_30_days.count.to_f / (num_active_subscriptions_within_last_30_days + num_new_subscriptions_since_within_last_30_days)
      timeseries << {
        date: current_time,
        snapshot_date: current_time - @num_days_in_churn_period.days,
        churn_period_end_date: current_time + @num_days_in_churn_period.days,
        num_active_subscriptions_at_snapshot_date: num_active_subscriptions_within_last_30_days,
        num_new_subscriptions_in_period: num_new_subscriptions_since_within_last_30_days,
        num_churned_subscriptions_in_period: churned_subscriptions_within_last_30_days.count,
        churn_rate: churn_rate * 100,
        churned_subscriptions: churned_subscriptions_within_last_30_days.map{ |event| JSON.parse(event['properties'])['stripe_subscription_id'] },
      }
      current_time += 1.send(@group_by)
    end
    timeseries
  end

  private

  def billing_data_snapshots_for_time_period
    @billing_data_snapshots_for_time_period ||= begin
      ClickHouseQueries::BillingDataSnapshots::List.new(
        @swishjam_stripe_public_key,
        start_time: @snapshot_start_time,
        end_time: @snapshot_end_time,
        columns: %i[num_active_subscriptions],
      ).get
    end
  end

  def all_churn_events_for_period
    @all_churn_events_for_period ||= churn_and_new_subscription_events_for_period.select{ |event| event['name'] == StripeHelpers::SupplementalEvents::SubscriptionChurned.EVENT_NAME }
  end

  def all_new_subscription_events_for_period
    @all_new_subscription_events_for_period ||= churn_and_new_subscription_events_for_period.select{ |event| event['name'] == StripeHelpers::SupplementalEvents::NewActiveSubscription.EVENT_NAME }
  end

  def churn_and_new_subscription_events_for_period
    @churn_and_new_subscription_events_for_period ||= begin 
      ClickHouseQueries::Events::List.new(
        @swishjam_stripe_public_key,
        start_time: @snapshot_start_time,
        end_time: @churn_period_end_time,
        event_names: [
          StripeHelpers::SupplementalEvents::SubscriptionChurned.EVENT_NAME,
          StripeHelpers::SupplementalEvents::NewActiveSubscription.EVENT_NAME,
        ],
      ).get
    end
  end
end