module Api
  module V1
    class BaseController < ApplicationController
      include TimestampHelper
      include AuthenticationHelper
      before_action :authenticate_request!
    end
  end
end