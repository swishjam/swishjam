module ApplicationHelper
  def requested_instance
    return @requested_instance if defined?(@requested_instance)
    @api_key = request.headers['X-Swishjam-Instance-Api-Key'] || request.headers['X-Swishjam-Api-Key'] || params[:api_key]
    return if @api_key.blank?
    @requested_instance ||= Instance.find_by(public_key: @api_key)
  end
  alias instance requested_instance
end
