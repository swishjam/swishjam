module Api
  module V1
    module Admin
      class BaseController < Api::V1::BaseController
        before_action :verify_admin!

        def verify_admin!
          admin_emails = (ENV['SWISHJAM_ADMINS'] || '').split(',').map{ |e| e.strip } 
          if !admin_emails.include?(current_user.email)
            render json: {}, status: :unauthorized
            return
          end
        end
      end
    end
  end
end