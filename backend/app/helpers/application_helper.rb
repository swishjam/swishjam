module ApplicationHelper
  def log_user_in(user, organization)
    data_to_encode = {
      user: { id: user.id, email: user.email },
      current_organization: { id: organization.id, name: organization.name, api_key: organization.public_key },
      organizations: user.organizations.map{ |o| { id: o.id, name: o.name }},
      expires_at_epoch: (ENV['AUTH_LENGTH_IN_MINUTES'] || 24 * 60 * 7).to_i.minutes.from_now.to_i,
    }
    token = JWT.encode(data_to_encode, user.jwt_secret_key, 'HS256')
    Swishjam::Session.create!(user: user, jwt_value: token)
    token
  end

  def log_user_out
    Swishjam::Session.find_by!(jwt_value: jwt_token).destroy!
  end
end
