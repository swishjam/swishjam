module Slack
  module SwishjamBot
    class ActionCallbacks
      CALLBACKS = %w[send_email]

      CALLBACKS.each do |callback|
        define_singleton_method(callback.upcase){ callback }
      end
    end
  end
end