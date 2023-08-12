module ApplicationHelper
  def current_organization
    @current_organization ||= Swishjam::Organization.find_by(id: decoded_jwt_token['current_organization']['id'])
  end
  
  def current_user
    @current_user ||= Swishjam::User.find_by(id: decoded_jwt_token['user_id'])
  end

  def jwt_token
    @jwt_token ||= request.headers['X-Swishjam-Token']
  end

  def decoded_jwt_token
    @decoded_jwt_token ||= JWT.decode(jwt_token, nil, false)[0]
  end

  def log_user_in(user, organization)
    data_to_encode = {
      user: { id: user.id, email: user.email },
      current_organization: { id: organization.id, name: organization.name, api_key: organization.public_key },
      organizations: user.organizations.map{ |o| { id: o.id, name: o.name }},
      expires_at_epoch: (ENV['AUTH_LENGTH_IN_MINUTES'] || 24 * 60 * 7).to_i.minutes.from_now.to_i,
    }
    token = JWT.encode(data_to_encode, user.jwt_secret_key, 'HS256')
    Swishjam::Session.create!(user: user, jwt_id: token)
    token
  end

  def log_user_out
    Swishjam::Session.find_by!(jwt_id: jwt_token).destroy!
  end

  def is_valid_session?
    return false if jwt_token.blank?
    Swishjam::Session.exists?(jwt_id: jwt_token)
  end
end
