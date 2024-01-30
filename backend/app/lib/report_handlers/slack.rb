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
      slack_client.post_message_to_channel(channel: @report.slack_channel_id, blocks: slack_block_content)

      triggered_report_payload = {}
      if @report.config['sections'].map { |section| section['type'] }.include?('web')
        triggered_report_payload.merge!({ web_analytics: web_analytics_calculator.as_json })
      end
      if @report.config['sections'].map { |section| section['type'] }.include?('product')
        triggered_report_payload.merge!({ product_analytics: product_analytics_calculator.as_json })
      end
      if @report.config['sections'].map { |section| section['type'] }.include?('revenue')
        triggered_report_payload.merge!({ revenue_analytics: revenue_analytics_calculator.as_json })
      end
  
      TriggeredReport.create!(report_id: @report.id, workspace: @report.workspace, payload: triggered_report_payload)
    end

    private

    def web_analytics_calculator
      @web_analytics_calculator ||= ReportHandlers::MetricsCalculators::WebAnalytics.new(
        @report.workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.MARKETING).public_key,
        current_period_start_date: current_period_start_date,
        current_period_end_date: current_period_end_date,
        previous_period_start_date: previous_period_start_date,
        previous_period_end_date: previous_period_end_date
      )
    end

    def product_analytics_calculator
      @product_analytics_calculator ||= ReportHandlers::MetricsCalculators::ProductAnalytics.new(
        @report.workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.PRODUCT).public_key,
        current_period_start_date: current_period_start_date,
        current_period_end_date: current_period_end_date,
        previous_period_start_date: previous_period_start_date,
        previous_period_end_date: previous_period_end_date
      )
    end

    def revenue_analytics_calculator
      @revenue_analytics_calculator ||= ReportHandlers::MetricsCalculators::RevenueAnalytics.new(
        @report.workspace.api_keys.for_data_source!(ApiKey::ReservedDataSources.STRIPE).public_key,
        current_period_start_date: current_period_start_date,
        current_period_end_date: current_period_end_date,
        previous_period_start_date: previous_period_start_date,
        previous_period_end_date: previous_period_end_date
      )
    end

    def slack_block_content
      date_header = nil
      case @report.cadence
      when 'daily'
        date_header = slack_mkdwn(":calendar: #{current_period_start_date.strftime('%A, %B %d')}")
      when 'weekly'
        date_header = slack_mkdwn(":calendar: Week of #{current_period_start_date.strftime('%B %d')}")
      when 'monthly'
        date_header = slack_mkdwn(":calendar: #{current_period_start_date.strftime('%B')}")
      end
      slack_block_content = [
        slack_header(@report.workspace.name, @report.cadence),
        date_header,
        slack_mkdwn(" "),
      ]

      @report.config['sections'] ||= [{ 'type' => 'web' }, { 'type' => 'product' }, {'type' => 'revenue'}]
      @report.config['sections'].each_with_index do |section, i|
        slack_block_content << slack_mkdwn(" ")
        slack_block_content << block_kit_content_for_section(section['type'])
        slack_block_content << { "type": "divider" } unless i == @report.config['sections'].length - 1
      end

      slack_block_content << view_in_swishjam('https://app.swishjam.com')
      slack_block_content.flatten
    end

    def block_kit_content_for_section(section_type)
      if section_type == 'web'
        [
          slack_mkdwn(":mega: *Marketing Site:*"),
          results_section("Sessions", web_analytics_calculator.num_sessions_for_period, web_analytics_calculator.num_sessions_for_previous_period),
          results_section("Unique Visitors", web_analytics_calculator.num_unique_users_for_period, web_analytics_calculator.num_unique_users_for_previous_period),
          results_section("Page Views", web_analytics_calculator.num_page_views_for_period, web_analytics_calculator.num_page_views_for_previous_period),
        ]
      elsif section_type == 'product'
        [
          slack_mkdwn(":technologist: *Product Usage:*"),
          results_section("Active Users", product_analytics_calculator.num_unique_active_users_for_period, product_analytics_calculator.num_unique_active_users_for_previous_period),
          results_section("Sessions", product_analytics_calculator.num_sessions_for_period, product_analytics_calculator.num_sessions_for_previous_period),
          results_section("New Users", product_analytics_calculator.num_new_users_for_period, product_analytics_calculator.num_new_users_for_previous_period),
        ]
      elsif section_type == 'revenue'
        [
          slack_mkdwn(":bank: *Revenue Analytics:*"),
          results_section("New Subscriptions", revenue_analytics_calculator.num_new_subscriptions_for_period, revenue_analytics_calculator.num_new_subscriptions_for_previous_period),
          results_section("New MRR", revenue_analytics_calculator.new_mrr_for_period, revenue_analytics_calculator.new_mrr_for_previous_period, formatter: -> (mrr) { ActionController::Base.helpers.number_to_currency(mrr / 100) }),
          results_section("Churned MRR", revenue_analytics_calculator.churned_mrr_for_period, revenue_analytics_calculator.churned_mrr_for_previous_period, formatter: -> (mrr) { ActionController::Base.helpers.number_to_currency(mrr / 100) }),
        ]
      end
    end

    def comparison_display_date
      case @report.cadence
      when 'daily'
        previous_period_start_date.strftime('%A')
      when 'weekly'
        "Week of #{previous_period_start_date.strftime('%B %d')}"
      when 'monthly'
        previous_period_start_date.strftime('%B')
      end
    end

    def results_section(title, current_period_result, previous_period_result, formatter: -> (val) { val })
      slack_mkdwn("#{emoji_for_comparison(current_period_result, previous_period_result)} *#{title}:* #{formatter.call(current_period_result)} (#{formatted_percent_diff(current_period_result, previous_period_result)} vs #{comparison_display_date})")
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