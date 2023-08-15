module Analytics
  class OrganizationUser < ApplicationRecord
    self.table_name = :analytics_organization_users

    belongs_to :organization, class_name: Analytics::Organization.to_s, foreign_key: :analytics_organization_id
    belongs_to :user, class_name: Analytics::User.to_s, foreign_key: :analytics_user_id
  end
end