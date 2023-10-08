class SwishjamJob
  def perform
    begin
      super()
    rescue => e
      Sentry.capture_exception(e)
      raise e
    end
  end
end