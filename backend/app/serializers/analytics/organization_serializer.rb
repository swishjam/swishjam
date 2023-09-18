module Analytics
  class OrganizationSerializer < ActiveModel::Serializer
    attributes :id, :name, :created_at, :analytics_user_profiles, :current_mrr, :current_subscription_name

    def current_mrr
    end

    def current_subscription_name
    end
  end
end