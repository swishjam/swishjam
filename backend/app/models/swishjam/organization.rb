module Swishjam
  class Organization < ApplicationRecord
    self.table_name = :swishjam_organizations
    
    has_many :organization_users, class_name: Swishjam::OrganizationUser.to_s, foreign_key: :swishjam_organization_id, dependent: :destroy
    has_many :users, class_name: Swishjam::User.to_s, foreign_key: :swishjam_organization_id, through: :organization_users
    has_many :integrations, class_name: Swishjam::Integration.to_s, foreign_key: :swishjam_organization_id, dependent: :destroy

    has_many :analytics_organizations, 
              class_name: Analytics::Organization.to_s, 
              foreign_key: :swishjam_organization_id, 
              dependent: :destroy
    has_many :analytics_users, 
              class_name: Analytics::User.to_s, 
              foreign_key: :swishjam_organization_id, 
              dependent: :destroy
    has_many :analytics_devices, 
              class_name: Analytics::Device.to_s, 
              foreign_key: :swishjam_organization_id, 
              dependent: :destroy
    has_many :analytics_sessions, 
              through: :analytics_devices, 
              class_name: Analytics::Session.to_s, 
              source: :sessions, 
              dependent: :destroy
    has_many :analytics_billing_data_snapshots, 
              class_name: Analytics::BillingDataSnapshot.to_s, 
              foreign_key: :swishjam_organization_id, 
              dependent: :destroy
    has_many :analytics_customer_billing_data_snapshots, 
              class_name: Analytics::CustomerBillingDataSnapshot.to_s, 
              foreign_key: :swishjam_organization_id, 
              dependent: :destroy
    has_many :analytics_customer_payments, 
              class_name: Analytics::CustomerPayment.to_s, 
              foreign_key: :swishjam_organization_id, 
              dependent: :destroy
    has_many :analytics_customer_subscriptions, 
              class_name: Analytics::CustomerSubscription.to_s, 
              foreign_key: :swishjam_organization_id, 
              dependent: :destroy

    validates :public_key, presence: true, uniqueness: true

    before_validation :generate_public_key, on: :create

    private

    def generate_public_key
      key = ['swishjam', SecureRandom.hex(4), SecureRandom.hex(4)].join('-')
      if Swishjam::Organization.exists?(public_key: key)
        generate_public_key
      else
        self.public_key = key
      end
    end
  end
end