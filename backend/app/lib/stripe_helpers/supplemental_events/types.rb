module StripeHelpers
  module SupplementalEvents
    class Types
      class << self
        %i[new_free_trial subscription_churned charge_succeeded].each do |event_name|
          define_method(event_name.upcase) do
            "stripe.supplemental.#{event_name}".to_s.downcase
          end
        end
      end
    end
  end
end