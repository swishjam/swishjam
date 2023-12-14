class SendReportJob 
  include Sidekiq::Job
  queue_as :default


  def perform(report_id)
    report = Report.find(report_id)

    # Marketing data    
    marketing_key = report.workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.MARKETING).public_key
    yesterday_marketing_sessions = fetch_count(ClickHouseQueries::Sessions::Count, marketing_key, Time.current.yesterday)
    two_days_ago_marketing_sessions = fetch_count(ClickHouseQueries::Sessions::Count, marketing_key, 2.days.ago)
    yesterday_marketing_page_views = fetch_count(ClickHouseQueries::PageViews::Count, marketing_key, Time.current.yesterday)
    two_days_ago_marketing_page_views = fetch_count(ClickHouseQueries::PageViews::Count, marketing_key, 2.days.ago)
    two_days_ago_marketing_unique_users = fetch_count(ClickHouseQueries::Users::Active::Count, marketing_key, 2.days.ago)
    yesterday_marketing_unique_users = fetch_count(ClickHouseQueries::Users::Active::Count, marketing_key, Time.current.yesterday)
    # Product Data
    product_key = report.workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key
    two_days_ago_daily_active_users = fetch_count(ClickHouseQueries::Users::Active::Count, product_key, 2.days.ago)
    yesterday_daily_active_users = fetch_count(ClickHouseQueries::Users::Active::Count, product_key, Time.current.yesterday)
    yesterday_sessions = fetch_count(ClickHouseQueries::Sessions::Count, product_key, Time.current.yesterday)
    two_days_ago_sessions = fetch_count(ClickHouseQueries::Sessions::Count, product_key, 2.days.ago)
    yesterday_new_users = fetch_count(ClickHouseQueries::Users::New::Count, product_key, Time.current.yesterday)
    two_days_ago_new_users = fetch_count(ClickHouseQueries::Users::New::Count, product_key, 2.days.ago)

    access_token = report.workspace.slack_connection.access_token
    slack_client = ::Slack::Client.new(access_token)

    slack_client.post_message_to_channel(
      channel: report.slack_channel_id, 
      blocks: [
        slack_header(report.workspace.name, report.cadence),
        slack_dates(DateTime.now),
        slack_mkdwn(" "),
        slack_mkdwn(":mega: *Marketing Site:*"),
        slack_mkdwn(":chart_with_upwards_trend: *Sessions:* #{yesterday_marketing_sessions} (#{percent_diff(yesterday_marketing_sessions, two_days_ago_marketing_sessions)}% vs yesterday)"),
        slack_mkdwn(":chart_with_downwards_trend: *Unique Visitors:* #{yesterday_marketing_unique_users} (#{percent_diff(yesterday_marketing_unique_users, two_days_ago_marketing_unique_users)}% vs last week)"),
        slack_mkdwn(":left_right_arrow: *Page Views:* #{yesterday_marketing_page_views} (#{percent_diff(yesterday_marketing_page_views, two_days_ago_marketing_page_views)}% vs last week)"),
        slack_divider(), 
        slack_mkdwn(" "),
        slack_mkdwn(":technologist: *Product Usage:*"),
        slack_mkdwn(":chart_with_upwards_trend: *Daily Active Users:* #{yesterday_daily_active_users} (#{percent_diff(yesterday_daily_active_users, two_days_ago_daily_active_users)}% vs yesterday)"),
        slack_mkdwn(":chart_with_upwards_trend: *Sessions:* #{yesterday_sessions} (#{percent_diff(yesterday_sessions, two_days_ago_sessions)}% vs yesterday)"),
        slack_mkdwn(":chart_with_upwards_trend: *New Users:* #{yesterday_new_users} (#{percent_diff(yesterday_new_users, two_days_ago_new_users)}% vs yesterday)"),
        # slack_divider(),
        # slack_mkdwn(" "),
        # slack_mkdwn(":money_with_wings: *Financial Metrics:*"),
        # slack_mkdwn(":chart_with_upwards_trend: *Current MRR:* 6,700 (+56% vs last week)"),
        # slack_mkdwn(":chart_with_upwards_trend: *Total Revenue:* 6,700 (+56% vs last week)"),
        # slack_mkdwn(":chart_with_upwards_trend: *Active Subscribers:* 6,700 (+56% vs last week)"),
        view_in_swishjam('https://app.swishjam.com')
      ].to_json
    )
 
  # Save to triggered reports table that we executed this
  TriggeredReport.create!(
    report_id: report.id, 
    workspace: report.workspace, 
    payload: {
      slack_channel_id: report.slack_channel_id,
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

  rescue => e
    Sentry.capture_exception(e)
    Rails.logger.error "Failed to trigger the EventTrigger for Report ID: #{report_id},  #{e.message}"
  end

  private
    def fetch_count(query_class, key, time)
      query_class.new(
        key,
        start_time: time.beginning_of_day,
        end_time: time.end_of_day
      ).count
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
        slack_mkdwn(":calendar: #{start_date.strftime('%m/%d/%Y')} — #{end_date.strftime('%m/%d/%Y')}")
      else
        slack_mkdwn(":calendar: #{start_date.strftime('%m/%d/%Y')}")
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
  
    def percent_diff(num1, num2)
      if (num1.nil? || num2.nil? || num1.zero?)
        0
      else
        percent = ((num2 - num1) / num1.to_f) * 100
        if percent.negative?
          "-#{percent.abs}"
        else
          "+#{percent}"
        end
      end
    end
end