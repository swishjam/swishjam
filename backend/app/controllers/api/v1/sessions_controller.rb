module Api
  module V1
    class SessionsController < BaseController
      def count
        render json: {
          count: current_organization.analytics_sessions.starting_after(start_timestamp).starting_at_or_before(end_timestamp).count,
          comparison_count: current_organization.analytics_sessions.starting_after(comparison_start_timestamp).starting_at_or_before(comparison_end_timestamp).count,
          start_time: start_timestamp,
          end_time: end_timestamp,
          comparison_start_time: comparison_start_timestamp,
          comparison_end_time: comparison_end_timestamp,
        }, status: :ok
      end

      def timeseries
        group_by_method = case Time.current - start_timestamp
                          when 0..(7.days + 1.minute)
                            :group_by_hour
                          when (7.days + 1.minute)..(1.month + 1.day)
                            :group_by_day
                          when (1.month + 1.day)..3.months
                            :group_by_week
                          else
                            :group_by_month
                          end
        current_sessions = current_organization.analytics_sessions.starting_after(start_timestamp).starting_at_or_before(end_timestamp)
        comparison_sessions = current_organization.analytics_sessions.starting_after(comparison_start_timestamp).starting_at_or_before(comparison_end_timestamp)
        json = {
          timeseries: format_timeseries(current_sessions.send(group_by_method, :start_time).count),
          comparison_timeseries: format_timeseries(comparison_sessions.send(group_by_method, :start_time).count),
          start_time: start_timestamp,
          end_time: end_timestamp,
          comparison_start_time: comparison_start_timestamp,
          comparison_end_time: comparison_end_timestamp,
          grouped_by: group_by_method.to_s.split('_').last,
        }
        
        json[:count] = json[:timeseries].collect{ |h| h[:value] }.sum
        json[:comparison_count] = json[:comparison_timeseries].collect{ |h| h[:value] }.sum

        render json: json, status: :ok
      end

      def referrers
        render json: {
          referrers: Analytics::PageHit.first_of_sessions(current_organization).starting_after(start_timestamp).starting_at_or_before(end_timestamp).group(:referrer_url_host).count,
          start_time: start_timestamp,
          end_time: end_timestamp,
        }, status: :ok
      end

      def demographics
        limit = params[:limit] = 10
        sessions = current_organization.analytics_sessions.starting_after(start_timestamp).starting_at_or_before(end_timestamp).joins(:device)
        num_mobile_sessions = sessions.mobile.count
        num_desktop_sessions = sessions.not_mobile.count
        browser_breakdown = sessions.limit(limit).group('analytics_devices.browser').count
        cities = sessions.limit(limit).group(:city).select(:city, 'COUNT(city) AS count').order(count: :DESC).map{ |s| { city: s.city, count: s.count }}
        regions = sessions.limit(limit).group(:region).select(:region, 'COUNT(region) AS count').order(count: :DESC).map{ |s| { region: s.region, count: s.count }}
        countries = sessions.limit(limit).group(:country).select(:country, 'COUNT(country) AS count').order(count: :DESC).map{ |s| { country: s.country, count: s.count }}
        render json: {
          mobile_count: num_mobile_sessions,
          desktop_count: num_desktop_sessions,
          browsers:browser_breakdown,
          cities: cities,
          regions: regions,
          countries: countries,
          start_time: start_timestamp,
          end_time: end_timestamp,
        }, status: :ok
      end
    end
  end
end