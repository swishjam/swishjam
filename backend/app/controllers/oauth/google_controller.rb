module Oauth
  class GoogleController < ApplicationController
    def redirect
      client_id = Google::Auth::ClientId.from_file(Rails.root.join('app', 'lib', 'google_apis', 'auth', 'client_secret.json'))
      authorizer = Google::Auth::WebUserAuthorizer.new(client_id, Google::Apis::SearchconsoleV1::AUTH_WEBMASTERS_READONLY, nil)
      auth_url = authorizer.get_authorization_url(login_hint: 'collin@swishjam.com', request: request, redirect_uri: 'https://capture.swishjam.com/oauth/google/callback')
      redirect_to auth_url
    end

    def callback
      byebug
    end
  end
end