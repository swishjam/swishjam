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

    yesterday_daily_active_users = fetch_count(ClickHouseQueries::Users::Active::Count, product_key, Time.current.yesterday)
    two_days_ago_daily_active_users = fetch_count(ClickHouseQueries::Users::Active::Count, product_key, 2.days.ago)
    yesterday_sessions = fetch_count(ClickHouseQueries::Sessions::Count, product_key, Time.current.yesterday)
    two_days_ago_sessions = fetch_count(ClickHouseQueries::Sessions::Count, product_key, 2.days.ago)
    yesterday_new_users = fetch_count(ClickHouseQueries::Users::New::Count, product_key, Time.current.yesterday)
    two_days_ago_new_users = fetch_count(ClickHouseQueries::Users::New::Count, product_key, 2.days.ago)

    access_token = report.workspace.slack_connection.access_token
    slack_client = ::Slack::Client.new(access_token)

    comparison_day = 2.days.ago.strftime('%A')

    slack_client.post_message_to_channel(
      channel: report.slack_channel_id, 
      blocks: [
        slack_header(report.workspace.name, report.cadence),
        slack_dates(DateTime.yesterday),
        slack_mkdwn(" "),
        slack_mkdwn(":mega: *Marketing Site:*"),
        slack_mkdwn("#{emoji_for_comparison(yesterday_marketing_sessions, two_days_ago_marketing_sessions)} *Sessions:* #{yesterday_marketing_sessions} (#{formatted_percent_diff(yesterday_marketing_sessions, two_days_ago_marketing_sessions)}% vs #{comparison_day})"),
        slack_mkdwn("#{emoji_for_comparison(yesterday_marketing_unique_users, two_days_ago_marketing_unique_users)} *Unique Visitors:* #{yesterday_marketing_unique_users} (#{formatted_percent_diff(yesterday_marketing_unique_users, two_days_ago_marketing_unique_users)}% vs #{comparison_day})"),
        slack_mkdwn("#{emoji_for_comparison(yesterday_marketing_page_views, two_days_ago_marketing_page_views)} *Page Views:* #{yesterday_marketing_page_views} (#{formatted_percent_diff(yesterday_marketing_page_views, two_days_ago_marketing_page_views)}% vs #{comparison_day})"),
        slack_divider(), 
        slack_mkdwn(" "),
        slack_mkdwn(":technologist: *Product Usage:*"),
        slack_mkdwn("#{emoji_for_comparison(yesterday_daily_active_users, two_days_ago_daily_active_users)} *Active Users:* #{yesterday_daily_active_users} (#{formatted_percent_diff(yesterday_daily_active_users, two_days_ago_daily_active_users)}% vs #{comparison_day})"),
        slack_mkdwn("#{emoji_for_comparison(yesterday_sessions, two_days_ago_sessions)} *Sessions:* #{yesterday_sessions} (#{formatted_percent_diff(yesterday_sessions, two_days_ago_sessions)}% vs #{comparison_day})"),
        slack_mkdwn("#{emoji_for_comparison(yesterday_new_users, two_days_ago_new_users)} *New Users:* #{yesterday_new_users} (#{formatted_percent_diff(yesterday_new_users, two_days_ago_new_users)}% vs #{comparison_day})"),
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
    if (new_val.nil? || old_val.nil? || new_val.zero?)
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