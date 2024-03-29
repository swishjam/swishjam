module AuthenticationHelper
  def log_user_in(user, workspace)
    data_to_encode = {
      user: { id: user.id, email: user.email },
      current_workspace: { 
        id: workspace.id, 
        name: workspace.name, 
        api_keys: Hash.new.tap{ |h| workspace.api_keys.enabled.each{ |k| h[k.data_source] = k.public_key }},
      },
      workspaces: user.workspaces.map{ |w| { id: w.id, name: w.name }},
      expires_at_epoch: (ENV['AUTH_LENGTH_IN_DAYS'] || 30).to_i.days.from_now.to_i,
    }
    token = JWT.encode(data_to_encode, user.jwt_secret_key, 'HS256')
    AuthSession.create!(user: user, jwt_value: token)
    token
  end

  def log_user_out
    AuthSession.find_by!(jwt_value: jwt_token).destroy!
    user = @current_user
    @current_user = nil
    user
  end

  def authenticate_request!
    if !is_valid_session?
      render json: { error: 'Not Authorized', logged_out: true }, status: :unauthorized
      return
    end
  end

  def current_workspace
    @current_workspace ||= current_user.workspaces.find_by(id: decoded_jwt_token['current_workspace']['id'])
  end
  
  # current_user is called by Rails serializers for some reason, so we need to make sure it doesn't throw an error
  def current_user
    @current_user ||= User.find_by(id: decoded_jwt_token.dig('user', 'id'))
  rescue => e
  end

  def jwt_token
    @jwt_token ||= request.headers['X-Swishjam-Token']
  end

  def decoded_jwt_token
    @decoded_jwt_token ||= JWT.decode(jwt_token, nil, false)[0]
  end

  def is_valid_session?
    return false if jwt_token.blank?
    return false if !AuthSession.exists?(jwt_value: jwt_token)
    return false if !current_user.present?
    return false if !current_workspace.present?
    true
  end
end