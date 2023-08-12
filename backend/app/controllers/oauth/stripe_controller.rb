module Oauth
  class StripeController < ApplicationController
    def callback
      if params[:error] || !params[:code] || !params[:state]
        redirect_to "#{ENV['FRONTEND_URL'] || 'http://localhost:3000'}/connections?success=false&message=#{params[:error_description]}"
        return
      end
      organization = validate_token_and_return_organization
      configuration = get_oauth_response_data
      create_or_update_swishjam_integration(organization, configuration)
      redirect_to "#{ENV['FRONTEND_URL'] || 'http://localhost:3000'}/connections?success=true"
    end

    private

    def validate_token_and_return_organization
      # make sure a session exists for the token
      token = JSON.parse(params[:state])['authToken']
      Swishjam::Session.find_by!(jwt_id: token) 

      # make sure the token is valid
      decoded_token = JWT.decode(token, nil, false)[0]
      raise "Session has expired." if decoded_token['expires_at_epoch'] < Time.now.to_i
      user = Swishjam::User.find(decoded_token['user']['id'])
      JWT.decode(token, user.jwt_secret_key, true, { algorithm: 'HS256' }) 

      Swishjam::Organization.find(decoded_token['current_organization']['id'])
    # rescue => e
    #   raise "Session has expired."
    end

    def get_oauth_response_data
      oauth_response = Stripe::OAuth.token(grant_type: 'authorization_code', code: params[:code])
      {
        account_id: oauth_response['stripe_user_id'],
        stripe_publishable_key: oauth_response['stripe_publishable_key'],
        access_token: oauth_response['access_token'],
        refresh_token: oauth_response['refresh_token'],
        scope: oauth_response['scope'],
        livemode: oauth_response['livemode'],
        token_type: oauth_response['token_type'],
      }
    end

    def create_or_update_swishjam_integration(organization, config)
      pre_existing_integration = Swishjam::Integrations::Stripe.for_organization(organization)
      if pre_existing_integration.present?
        pre_existing_integration.update!(config: config)
      else
        organization.integrations.create!(type: Swishjam::Integrations::Stripe.to_s, config: config, enabled: true)
      end
    end
  end
end