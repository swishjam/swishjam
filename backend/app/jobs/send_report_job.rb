class SendReportJob 
  include Sidekiq::Job
  queue_as :default

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

  def perform(report_id)
    report = Report.find(report_id)
    Rails.logger.info "Report: #{report.inspect}"

    ### Actually DO the shit

    # Get the data for the report / Query Clickhouse
    product_key = report.workspace.api_keys.for_data_source(ApiKey::ReservedDataSources.PRODUCT).public_key
    #daily_active_users = ClickHouseQueries::Users::Active::Timeseries::Daily.new(product_key).timeseries
    two_days_ago_daily_active_users = ClickHouseQueries::Users::Active::Count.new(
      product_key,
      start_time: 2.days.ago.beginning_of_day,
      end_time: 2.days.ago.end_of_day
    ).count
    yesterday_daily_active_users = ClickHouseQueries::Users::Active::Count.new(
      product_key,
      start_time:Time.current.yesterday.beginning_of_day,
      end_time:Time.current.yesterday.end_of_day
    ).count
    #sessions_timeseries_data = ClickHouseQueries::Sessions::Timeseries.new(public_keys: ['current_workspace', 'marketing']).perform

=begin
    querier = ClickHouseQueries::Organizations::Sessions::Timeseries.new(
      # current_workspace.public_key, 
      @organization.id, 
      url_hosts: url_hosts, 
      # start_time: start_timestamp, 
      start_time: 3.months.ago,
      end_time: end_timestamp
    )
    render json: { timeseries: querier.timeseries }, status: :ok
=end
    # Format the report 

    # send to slack / email / sms / etc
    access_token = report.workspace.slack_connection.access_token
    slack_client = ::Slack::Client.new(access_token)

      #parsed_message_body = message_body.gsub(/\{([^}]+)\}/) do |match|
        #JSON.parse(event['properties'] || '{}')[$1] || match
      #end

      slack_client.post_message_to_channel(
        channel: 'C0681689WE8', #report.config.channel_id, 
        blocks: [
          slack_header(report.workspace.name, report.cadence),
          slack_dates(DateTime.now),
          slack_mkdwn(" "),
          slack_mkdwn(":mega: *Marketing Site:*"),
          slack_mkdwn(":chart_with_upwards_trend: *Visitor Sessions:* 6,700 (+56% vs last week)"),
          slack_mkdwn(":chart_with_downwards_trend: *Unique Visitors:* 6,700 (+56% vs last week)"),
          slack_mkdwn(":left_right_arrow: *Page Views:* 6,700 (+56% vs last week)"),
          slack_divider(), 
          slack_mkdwn(" "),
          slack_mkdwn(":technologist: *Product Usage:*"),
          slack_mkdwn(":chart_with_upwards_trend: *Daily Active Users:* #{yesterday_daily_active_users} (#{percent_diff(yesterday_daily_active_users, two_days_ago_daily_active_users)}% vs yesterday)"),
          slack_mkdwn(":chart_with_upwards_trend: *Sessions:* 6,700 (+56% vs last week)"),
          slack_mkdwn(":chart_with_upwards_trend: *New Users:* 6,700 (+56% vs last week)"),
          # slack_divider(),
          # slack_mkdwn(" "),
          # slack_mkdwn(":money_with_wings: *Financial Metrics:*"),
          # slack_mkdwn(":chart_with_upwards_trend: *Current MRR:* 6,700 (+56% vs last week)"),
          # slack_mkdwn(":chart_with_upwards_trend: *Total Revenue:* 6,700 (+56% vs last week)"),
          # slack_mkdwn(":chart_with_upwards_trend: *Active Subscribers:* 6,700 (+56% vs last week)"),
          view_in_swishjam('https://app.swishjam.com/')
        ].to_json
      )

    # Save to triggered reports table that we executed this
    # TODO
  end

end