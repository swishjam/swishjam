module Api
  module V1
    class DoNotEnrichUserProfileRulesController < Api::V1::BaseController
      def create
        rule = current_workspace.do_not_enrich_user_profile_rules.new(email_domain: params[:email_domain])
        if rule.save
          render json: { rule: rule }, status: :ok
        else
          render json: { error: rule.error.full_messages.join(' ') }, status: :unprocessable_entity
        end
      end

      def destroy
        rule = current_workspace.do_not_enrich_user_profile_rules.find_by(id: params[:id])
        if rule
          if rule.destroy
            render json: { rule: rule, message: 'Rule deleted' }, status: :ok
          else
            render json: { error: rule.error.full_messages.join(' ') }, status: :unprocessable_entity
          end
        else
          render json: { message: 'Rule not found' }, status: :not_found
        end
      end
    end
  end
end