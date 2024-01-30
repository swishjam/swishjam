module ReportHandlers
  class Slack 
    attr_reader :current_period_start_date, :current_period_end_date, :previous_period_start_date, :previous_period_end_date

    def initialize(report, num_periods: 1, period_interval: :day)
      @report = report
      if %i[day week month].exclude?(period_interval.to_sym)
        raise ArgumentError, "Invalid period interval: #{period_interval}, must be one of: `day`, `week`, or `month`."
      end
      @current_period_start_date = Time.current.beginning_of_day - num_periods.send(period_interval)
      @current_period_end_date = Time.current.beginning_of_day
      @previous_period_start_date = current_period_start_date - num_periods.send(period_interval)
      @previous_period_end_date = current_period_start_date
    end

    def send_report
      slack_client = ::Slack::Client.new(@report.workspace.slack_connection.access_token)

      slack_client.post_message_to_channel(
        channel: @report.slack_channel_id, 
        blocks: slack_block_content
      )
  
      TriggeredReport.create!(
        report_id: @report.id, 
        workspace: @report.workspace, 
        payload: {
          slack_channel_id: @report.slack_channel_id,
          marketing_sessions_for_period: marketing_sessions_for_period,
          marketing_sessions_for_previous_period: marketing_sessions_for_previous_period,
          marketing_page_views_for_period: marketing_page_views_for_period,
          marketing_page_views_for_previous_period: marketing_page_views_for_previous_period,
          marketing_unique_users_for_period: marketing_unique_users_for_period,
          marketing_unique_users_for_previous_period: marketing_unique_users_for_previous_period,
          daily_active_users_for_period: daily_active_users_for_period,
          daily_active_users_for_previous_period: daily_active_users_for_previous_period,
          sessions_for_period: sessions_for_period,
          sessions_for_previous_period: sessions_for_previous_period,
          new_users_for_period: new_users_for_period,
          new_users_for_previous_period: new_users_for_previous_period,
        }
      )
    end

    private

    def slack_block_content
      slack_block_content = [
        slack_header(@report.workspace.name, @report.cadence),
        slack_dates(DateTime.yesterday),
        slack_mkdwn(" "),
      ]

      @report.config['sections'] ||= [{ 'type' => 'web' }, { 'type' => 'product' }, {'type' => 'revenue'}]
      @report.config['sections'].each_with_index do |section, i|
        slack_block_content << slack_mkdwn(" ")
        slack_block_content << block_kit_content_for_section(section['type'])
        slack_block_content << slack_divider unless i == @report.config['sections'].length - 1
      end

      slack_block_content << view_in_swishjam('https://app.swishjam.com')
      slack_block_content.flatten
    end

    def marketing_key
      @marketing_key ||= @report.workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.MARKETING).public_key
    end

    def marketing_sessions_for_period
      @marketing_sessions_for_period ||= count_for_this_period(ClickHouseQueries::Sessions::Count, marketing_key)
    end

    def marketing_sessions_for_previous_period
      @marketing_sessions_for_previous_period ||= count_for_previous_period(ClickHouseQueries::Sessions::Count, marketing_key)
    end

    def marketing_page_views_for_period
      @marketing_page_views_for_period ||= count_for_this_period(ClickHouseQueries::PageViews::Count, marketing_key)
    end

    def marketing_page_views_for_previous_period
      @marketing_page_views_for_previous_period ||= count_for_previous_period(ClickHouseQueries::PageViews::Count, marketing_key)
    end

    def marketing_unique_users_for_previous_period
      @marketing_unique_users_for_previous_period ||= count_for_previous_period(ClickHouseQueries::Users::Active::Count, marketing_key)
    end

    def marketing_unique_users_for_period
      @marketing_unique_users_for_period ||= count_for_this_period(ClickHouseQueries::Users::Active::Count, marketing_key)
    end

    def product_key
      @product_key ||= @report.workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key
    end

    def daily_active_users_for_period
      @daily_active_users_for_period ||= count_for_this_period(ClickHouseQueries::Users::Active::Count, product_key)
    end
    
    def daily_active_users_for_previous_period
      @daily_active_users_for_previous_period ||= count_for_previous_period(ClickHouseQueries::Users::Active::Count, product_key)
    end

    def sessions_for_period
      @sessions_for_period ||= count_for_this_period(ClickHouseQueries::Sessions::Count, product_key)
    end

    def sessions_for_previous_period
      @sessions_for_previous_period ||= count_for_previous_period(ClickHouseQueries::Sessions::Count, product_key)
    end

    def new_users_for_period
      @new_users_for_period ||= count_for_this_period(ClickHouseQueries::Users::New::Count, product_key)
    end

    def new_users_for_previous_period
      @new_users_for_previous_period ||= count_for_previous_period(ClickHouseQueries::Users::New::Count, product_key)
    end

    def count_for_this_period(query_class, key)
      query_class.new(key, start_time: current_period_start_date, end_time: current_period_end_date).count
    end

    def count_for_previous_period(query_class, key)
      query_class.new(key, start_time: previous_period_start_date, end_time: previous_period_end_date).count
    end

    def block_kit_content_for_section(section_type)
      comparison_day = 2.days.ago.strftime('%A')
      if section_type == 'web'
        [
          slack_mkdwn(":mega: *Marketing Site:*"),
          slack_mkdwn("#{emoji_for_comparison(marketing_sessions_for_period, marketing_sessions_for_previous_period)} *Sessions:* #{marketing_sessions_for_period} (#{formatted_percent_diff(marketing_sessions_for_period, marketing_sessions_for_previous_period)} vs #{comparison_day})"),
          slack_mkdwn("#{emoji_for_comparison(marketing_unique_users_for_period, marketing_unique_users_for_previous_period)} *Unique Visitors:* #{marketing_unique_users_for_period} (#{formatted_percent_diff(marketing_unique_users_for_period, marketing_unique_users_for_previous_period)} vs #{comparison_day})"),
          slack_mkdwn("#{emoji_for_comparison(marketing_page_views_for_period, marketing_page_views_for_previous_period)} *Page Views:* #{marketing_page_views_for_period} (#{formatted_percent_diff(marketing_page_views_for_period, marketing_page_views_for_previous_period)} vs #{comparison_day})"),
        ]
      elsif section_type == 'product'
        [
          slack_mkdwn(":technologist: *Product Usage:*"),
          slack_mkdwn("#{emoji_for_comparison(daily_active_users_for_period, daily_active_users_for_previous_period)} *Active Users:* #{daily_active_users_for_period} (#{formatted_percent_diff(daily_active_users_for_period, daily_active_users_for_previous_period)} vs #{comparison_day})"),
          slack_mkdwn("#{emoji_for_comparison(sessions_for_period, sessions_for_previous_period)} *Sessions:* #{sessions_for_period} (#{formatted_percent_diff(sessions_for_period, sessions_for_previous_period)} vs #{comparison_day})"),
          slack_mkdwn("#{emoji_for_comparison(new_users_for_period, new_users_for_previous_period)} *New Users:* #{new_users_for_period} (#{formatted_percent_diff(new_users_for_period, new_users_for_previous_period)} vs #{comparison_day})"),
        ]
      elsif section_type == 'revenue'
        [
          slack_mkdwn(":technologist: *Product Usage:*"),
          slack_mkdwn("#{emoji_for_comparison(daily_active_users_for_period, daily_active_users_for_previous_period)} *Active Users:* #{daily_active_users_for_period} (#{formatted_percent_diff(daily_active_users_for_period, daily_active_users_for_previous_period)} vs #{comparison_day})"),
          slack_mkdwn("#{emoji_for_comparison(sessions_for_period, sessions_for_previous_period)} *Sessions:* #{sessions_for_period} (#{formatted_percent_diff(sessions_for_period, sessions_for_previous_period)} vs #{comparison_day})"),
          slack_mkdwn("#{emoji_for_comparison(new_users_for_period, new_users_for_previous_period)} *New Users:* #{new_users_for_period} (#{formatted_percent_diff(new_users_for_period, new_users_for_previous_period)} vs #{comparison_day})"),
        ]
      end
    end

    def emoji_for_comparison(new_value, old_value)
      if new_value > old_value
        ':chart_with_upwards_trend:'
      elsif new_value < old_value
        ':chart_with_downwards_trend:'
      else
        ':left_right_arrow:'
      end
    end

    def slack_header(name, cadence)
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: "#{name} #{cadence.capitalize} Update",
          emoji: true
        }
      }
    end

    def slack_divider
      {
        "type": "divider"
      }
    end

    def slack_dates(start_date, end_date = nil)
      if end_date
        slack_mkdwn(":calendar: #{start_date.strftime('%A, %B %d')} — #{end_date.strftime('%A, %B %d')}")
      else
        slack_mkdwn(":calendar: #{start_date.strftime('%A, %B %d')}")
      end
    end

    def slack_mkdwn(content)
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "#{content}"
        }
      }
    end

    def view_in_swishjam(link)
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": " "
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "View in Swishjam :mag_right:",
            "emoji": true
          },
          "url": link,
        }
      }
    end

    def formatted_percent_diff(new_val, old_val)
      if new_val.zero? && old_val.zero?
        'No change'
      elsif (new_val.nil? || old_val.nil? || new_val.zero?)
        0
      else
        percent = ((new_val - old_val) / old_val.to_f) * 100
        return 'No change' if percent == 0
        formatted = nil
        if percent % 1 == 0
          formatted = "#{percent.to_i}%"
        else
          formatted = "#{sprintf('%.2f', percent)}%"
        end
        formatted = "+#{formatted}" if percent > 0
        formatted
      end
    end
  end
end