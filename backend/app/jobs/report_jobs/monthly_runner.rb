module ReportJobs
  class MonthlyRunner
    include Sidekiq::Job
    queue_as :default

    def perform
      Report.enabled.monthly_cadence.each do |report|
        ReportJobs::SendReport.perform_async(report.id)
      end
    end
  end
end