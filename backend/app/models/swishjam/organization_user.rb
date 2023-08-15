module Swishjam
  class OrganizationUser < ApplicationRecord
    self.table_name = :swishjam_organization_users
    
    belongs_to :user, class_name: Swishjam::User.to_s, foreign_key: :swishjam_user_id
    belongs_to :organization, class_name: Swishjam::Organization.to_s, foreign_key: :swishjam_organization_id
    
    validates :swishjam_user_id, uniqueness: { scope: :swishjam_organization_id }
  end
end