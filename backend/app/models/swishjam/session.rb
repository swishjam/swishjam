module Swishjam
  class Session < ApplicationRecord
    self.table_name = :swishjam_sessions
    
    belongs_to :user, class_name: Swishjam::User.to_s, foreign_key: :swishjam_user_id
  end
end