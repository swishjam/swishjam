class DailyReports
  include Sidekiq::Job
  queue_as :default

  def perform
    reports = Report.where(enabled: true, cadence: 'daily')
    Rails.logger.info "Reports: #{reports.inspect}"
    reports.each do |report|
      # for prod use async 
      # SendReportJob.perform_async(report.id)
      
      # For Testing
      SendReportJob.perform_sync(report.id)
    end
  end
end