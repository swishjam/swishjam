class SendReportJob 
  include Sidekiq::Job
  queue_as :default

  def perform(report_id)
    report = Report.find(report_id)
    ReportHandlers::Slack.new(report).send_report
  end
end