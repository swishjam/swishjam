module Oauth
  class StripeController < ApplicationController
    def callback
      if params[:error]
        redirect_to "#{ENV['FRONTEND_URL'] || 'http://localhost:3000'}/connections?success=false&message=#{params[:error_description]}"
        return
      end
      code = params[:code]
      api_key = JSON.parse(params[:state])['instance']
      instance = Instance.find_by!(public_key: api_key)
      response = Stripe::OAuth.token(grant_type: 'authorization_code', code: code)
      config = {
        account_id: response['stripe_user_id'],
        stripe_publishable_key: response['stripe_publishable_key'],
        access_token: response['access_token'],
        refresh_token: response['refresh_token'],
        scope: response['scope'],
        livemode: response['livemode'],
        token_type: response['token_type'],
      }
      pre_existing_integration = Integrations::Stripe.for_instance(instance)
      if pre_existing_integration.present?
        pre_existing_integration.update!(config: config)
      else
        instance.integrations.create!(type: Integrations::Stripe.to_s, config: config, enabled: true)
      end
      redirect_to "#{ENV['FRONTEND_URL'] || 'http://localhost:3000'}/connections?success=true"
    end
  end
end