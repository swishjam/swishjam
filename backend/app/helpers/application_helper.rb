module ApplicationHelper
  def requested_instance
    return @requested_instance if defined?(@requested_instance)
    @api_key = request.headers['X-Swishjam-Instance-Api-Key'] || request.headers['X-Swishjam-Api-Key'] || params[:api_key]
    return if @api_key.blank?
    @requested_instance ||= Instance.find_by(public_key: @api_key)
  end
  alias instance requested_instance

  def current_user
    @current_user ||= User.find_by(id: decoded_jwt_token['user_id'])
  end

  def jwt_token
    @jwt_token ||= request.headers['Authorization'].split(' ')[1]
  end

  def decoded_jwt_token
    @decoded_jwt_token ||= JWT.decode(jwt_token, nil, false)[0]
  end

  def log_user_in(user, organization)
    token = JWT.encode(
      { user_id: user.id, user_email: user.email, organization_name: organization.name, organization_id: organization.id }, 
      user.jwt_secret_key, 
      'HS256'
    )
    Session.create!(user: user, jwt_id: token)
    token
  end

  def log_user_out
    Session.find_by(jwt_id: jwt_token).destroy!
  end
end
