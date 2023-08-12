# class Instance < ApplicationRecord
#   has_many :organizations, class_name: Analytics::Organization.to_s, dependent: :destroy
#   has_many :users, class_name: Analytics::User.to_s, dependent: :destroy
#   has_many :devices, class_name: Analytics::Device.to_s, dependent: :destroy
#   has_many :sessions, through: :devices, class_name: Analytics::Session.to_s, dependent: :destroy
#   has_many :billing_data_snapshots, class_name: Analytics::BillingDataSnapshot.to_s, dependent: :destroy
#   has_many :customer_billing_data_snapshots, class_name: Analytics::CustomerBillingDataSnapshot.to_s, dependent: :destroy
#   has_many :payments, class_name: Analytics::Payment.to_s, dependent: :destroy
#   has_many :integrations, dependent: :destroy

#   def page_hits
#     Analytics::PageHit.joins(session: { device: :instance }).where(instances: { id: id })
#   end
# end