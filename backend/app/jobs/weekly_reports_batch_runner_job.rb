class WeeklyReportsBatchRunnerJob
  include Sidekiq::Job
  queue_as :default

  def perform
    Report.enabled.weekly_cadence.each do |report|
      SendReportJob.perform_async(report.id)
    end
  end
end