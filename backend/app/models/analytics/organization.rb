module Analytics
  class Organization < ApplicationRecord
    self.table_name = :analytics_organizations
    belongs_to :swishjam_organization, class_name: Swishjam::Organization.to_s, foreign_key: :swishjam_organization_id
    has_many :organization_users, class_name: Analytics::OrganizationUser.to_s, foreign_key: :analytics_organization_id, dependent: :destroy
    has_many :users, through: :organization_users, class_name: Analytics::User.to_s, source: :user
    has_many :sessions, class_name: Analytics::Session.to_s, foreign_key: :analytics_organization_id, dependent: :destroy
    has_many :customer_billing_data_snapshots, class_name: Analytics::CustomerBillingDataSnapshot.to_s, as: :owner, dependent: :destroy
    has_many :customer_payments, class_name: Analytics::CustomerPayment.to_s, as: :owner, dependent: :destroy
    has_many :customer_subscriptions, class_name: Analytics::CustomerSubscription.to_s, as: :owner, dependent: :destroy
    has_many :metadata, as: :parent, class_name: Analytics::Metadata.to_s, dependent: :destroy
    accepts_nested_attributes_for :metadata
  end
end