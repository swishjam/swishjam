module AnalyticsEventProcessors
  class Identify < Base
    def process!
      user = find_or_update_user!
      create_or_update_metadata!(user)
      update_devices_owner_if_necessary!(user)
    end

    private

    def find_or_update_user!
      unique_identifier = data['user_id'] || data['userId']
      existing_user = swishjam_organization.analytics_users.find_by(unique_identifier: unique_identifier)
      if existing_user
        existing_user.update!(email: data['email'], first_name: data['firstName'], last_name: data['lastName'])
        existing_user
      else
        user = swishjam_organization.analytics_users.create!(
          unique_identifier: unique_identifier, 
          email: data['email'], 
          first_name: data['firstName'], 
          last_name: data['lastName']
        )
        user
      end
    end

    def update_devices_owner_if_necessary!(user)
      device = find_or_create_device
      if device.user != user
        Rails.logger.warn "Device #{device.id} changed ownership from #{device.analytics_user_id} to #{user.id}" if device.analytics_user_id 
        device.update!(user: user)
      end
    end

    def create_or_update_metadata!(user)
      existing_metadata = user.metadata
      reserved_user_attributes = %w[user_id userId organizationId organization org orgId email firstName lastName]
      provided_metadata = data.except(reserved_user_attributes)
      provided_metadata.each do |key, value|
        new_or_exsting_metadata = user.metadata.find_or_initialize_by(key: key)
        new_or_exsting_metadata.value = value
        new_or_exsting_metadata.save!
      end
    end
  end
end