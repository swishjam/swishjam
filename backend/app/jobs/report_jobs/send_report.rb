module ReportJobs
  class SendReport
    include Sidekiq::Job
    queue_as :default

    def perform(report_id)
      report = Report.find(report_id)
      interval = {
        'daily' => 'day',
        'weekly' => 'week',
        'monthly' => 'month'
      }[report.cadence]
      ReportHandlers::Slack.new(report, period_interval: interval).send_report
    end
  end
end