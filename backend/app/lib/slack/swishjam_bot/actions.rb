module Slack
  module SwishjamBot
    class Actions
      ACTION_IDS = %w[display_email_modal visit_user_profile]

      ACTION_IDS.each do |id|
        define_singleton_method(id.upcase){ id }
      end
    end
  end
end