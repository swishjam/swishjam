class DailyReportsBatchRunnerJob
  include Sidekiq::Job
  queue_as :default

  def perform
    Report.enabled.daily_cadence.each do |report|
      SendReportJob.perform_async(report.id)
    end
  end
end