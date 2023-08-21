module TimestampHelper
  def start_timestamp
    params[:timeframe] ||= :thirty_days
    case params[:timeframe].to_sym
    when :hour
      Time.zone.now.beginning_of_hour - 1.hour
    when :today
      Time.zone.now.beginning_of_day
    when :'24_hours'
      Time.zone.now.beginning_of_hour - 24.hours
    when :this_week
      Time.zone.now.beginning_of_week
    when :seven_days, :'7_days'
      Time.zone.now.beginning_of_day - 7.days
    when :this_month
      Time.zone.now.beginning_of_month
    when :thirty_days, :'30_days'
      Time.zone.now.beginning_of_day - 30.days
    when :sixty_days, :'60_days'
      Time.zone.now.beginning_of_day - 60.days
    when :two_months, :'2_months'
      Time.zone.now.beginning_of_day - 2.months
    when :ninety_days, :'90_days'
      Time.zone.now.beginning_of_day - 90.days
    when :three_months, :'3_months'
      Time.zone.now.beginning_of_day - 3.months
    when :six_months, :'6_months'
      Time.zone.now.beginning_of_day - 6.months
    when :this_year
      Time.zone.now.beginning_of_year
    when :one_year, :'1_year'
      Time.zone.now.beginning_of_day - 1.year
    else
      raise "Invalid timeframe #{params[:timeframe]}, supported values are: 'hour', 'today', '24_hours', 'this_week', 'seven_days', 'this_month', 'thirty_days', 'sixty_days', 'two_months', 'ninety_days', 'three_months', 'six_months', 'this_year', or 'one_year'."
    end
  end

  def end_timestamp
    Time.zone.now
  end

  def comparison_start_timestamp
    start_timestamp - (end_timestamp - start_timestamp)
  end

  def comparison_end_timestamp
    start_timestamp
  end
end