class ApplicationController < ActionController::API
  include ApplicationHelper

  def ping
    render plain: 'pong'
  end
end
