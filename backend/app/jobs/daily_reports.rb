class DailyReports
  include Sidekiq::Job
  queue_as :default

  def perform
    reports = Report.where(enabled: true, cadence: 'daily')
    reports.each do |report|
      SendReportJob.perform_async(report.id)
    end
  end
end