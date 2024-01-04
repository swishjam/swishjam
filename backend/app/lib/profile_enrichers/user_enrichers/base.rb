module ProfileEnrichers
  module UserEnrichers
    class Base
      def initialize(user_profile)
        @user_profile = user_profile
      end

      def try_to_enrich!
        raise NotImplementedError, "Subclass #{self.class} must implement `#try_to_enrich!` method."
      end
    end
  end
end