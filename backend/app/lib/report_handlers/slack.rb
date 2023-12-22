module ReportHandlers
  class Slack 
    def initialize(report)
      @report = report
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
          yesterday_marketing_sessions: yesterday_marketing_sessions,
          two_days_ago_marketing_sessions: two_days_ago_marketing_sessions,
          yesterday_marketing_page_views: yesterday_marketing_page_views,
          two_days_ago_marketing_page_views: two_days_ago_marketing_page_views,
          two_days_ago_marketing_unique_users: two_days_ago_marketing_unique_users,
          yesterday_marketing_unique_users: yesterday_marketing_unique_users,
          two_days_ago_daily_active_users: two_days_ago_daily_active_users,
          yesterday_daily_active_users: yesterday_daily_active_users,
          yesterday_sessions: yesterday_sessions,
          two_days_ago_sessions: two_days_ago_sessions,
          yesterday_new_users: yesterday_new_users,
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

      @report.config['sections'] ||= [{ 'type' => 'web' }, { 'type' => 'product' }]
      @report.config['sections'].each_with_index do |section, i|
        slack_block_content << slack_mkdwn(" ")
        slack_block_content << block_kit_content_for_section(section['type'])
        slack_block_content << slack_divider unless i == @report.config['sections'].length - 1
      end

      slack_block_content << view_in_swishjam('https://app.swishjam.com')
      slack_block_content.flatten
    end

    def marketing_key
      @marketing_key||= @report.workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.MARKETING).public_key
    end

    def yesterday_marketing_sessions
      @yesterday_marketing_sessions||= fetch_count(ClickHouseQueries::Sessions::Count, marketing_key, Time.current.yesterday)
    end

    def two_days_ago_marketing_sessions
      @two_days_ago_marketing_sessions||= fetch_count(ClickHouseQueries::Sessions::Count, marketing_key, 2.days.ago)
    end

    def yesterday_marketing_page_views
      @yesterday_marketing_page_views||= fetch_count(ClickHouseQueries::PageViews::Count, marketing_key, Time.current.yesterday)
    end

    def two_days_ago_marketing_page_views
      @two_days_ago_marketing_page_views||= fetch_count(ClickHouseQueries::PageViews::Count, marketing_key, 2.days.ago)
    end

    def two_days_ago_marketing_unique_users
      @two_days_ago_marketing_unique_users||= fetch_count(ClickHouseQueries::Users::Active::Count, marketing_key, 2.days.ago)
    end

    def yesterday_marketing_unique_users
      @yesterday_marketing_unique_users||= fetch_count(ClickHouseQueries::Users::Active::Count, marketing_key, Time.current.yesterday)
    end

    def product_key
      @product_key||= @report.workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key
    end

    def yesterday_daily_active_users
      @yesterday_daily_active_users||= fetch_count(ClickHouseQueries::Users::Active::Count, product_key, Time.current.yesterday)
    end
    
    def two_days_ago_daily_active_users
      @two_days_ago_daily_active_users||= fetch_count(ClickHouseQueries::Users::Active::Count, product_key, 2.days.ago)
    end

    def yesterday_sessions
      @yesterday_sessions||= fetch_count(ClickHouseQueries::Sessions::Count, product_key, Time.current.yesterday)
    end

    def two_days_ago_sessions
      @two_days_ago_sessions||= fetch_count(ClickHouseQueries::Sessions::Count, product_key, 2.days.ago)
    end

    def yesterday_new_users
      @yesterday_new_users||= fetch_count(ClickHouseQueries::Users::New::Count, product_key, Time.current.yesterday)
    end

    def two_days_ago_new_users
      @two_days_ago_new_users||= fetch_count(ClickHouseQueries::Users::New::Count, product_key, 2.days.ago)
    end

    def fetch_count(query_class, key, time)
      query_class.new(
        key,
        start_time: time.beginning_of_day,
        end_time: time.end_of_day
      ).count
    end

    def block_kit_content_for_section(section_type)
      comparison_day = 2.days.ago.strftime('%A')
      if section_type == 'web'
        [
          slack_mkdwn(":mega: *Marketing Site:*"),
          slack_mkdwn("#{emoji_for_comparison(yesterday_marketing_sessions, two_days_ago_marketing_sessions)} *Sessions:* #{yesterday_marketing_sessions} (#{formatted_percent_diff(yesterday_marketing_sessions, two_days_ago_marketing_sessions)} vs #{comparison_day})"),
          slack_mkdwn("#{emoji_for_comparison(yesterday_marketing_unique_users, two_days_ago_marketing_unique_users)} *Unique Visitors:* #{yesterday_marketing_unique_users} (#{formatted_percent_diff(yesterday_marketing_unique_users, two_days_ago_marketing_unique_users)} vs #{comparison_day})"),
          slack_mkdwn("#{emoji_for_comparison(yesterday_marketing_page_views, two_days_ago_marketing_page_views)} *Page Views:* #{yesterday_marketing_page_views} (#{formatted_percent_diff(yesterday_marketing_page_views, two_days_ago_marketing_page_views)} vs #{comparison_day})"),
        ]
      elsif section_type == 'product'
        [
          slack_mkdwn(":technologist: *Product Usage:*"),
          slack_mkdwn("#{emoji_for_comparison(yesterday_daily_active_users, two_days_ago_daily_active_users)} *Active Users:* #{yesterday_daily_active_users} (#{formatted_percent_diff(yesterday_daily_active_users, two_days_ago_daily_active_users)} vs #{comparison_day})"),
          slack_mkdwn("#{emoji_for_comparison(yesterday_sessions, two_days_ago_sessions)} *Sessions:* #{yesterday_sessions} (#{formatted_percent_diff(yesterday_sessions, two_days_ago_sessions)} vs #{comparison_day})"),
          slack_mkdwn("#{emoji_for_comparison(yesterday_new_users, two_days_ago_new_users)} *New Users:* #{yesterday_new_users} (#{formatted_percent_diff(yesterday_new_users, two_days_ago_new_users)} vs #{comparison_day})"),
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