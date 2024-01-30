module ReportJobs
  class DailyRunner
    include Sidekiq::Job
    queue_as :default

    def perform
      Report.enabled.daily_cadence.each do |report|
        ReportJobs::SendReport.perform_async(report.id)
      end
    end
  end
end