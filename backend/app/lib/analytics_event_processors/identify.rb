module AnalyticsEventProcessors
  class Identify < Base
    def process!
      user = find_or_create_user!
      create_or_update_metadata!(user)
      update_devices_owner_if_necessary!(user)
    end

    private

    def find_or_create_user!
      unique_identifier = data['user_id'] || data['userId']
      user = instance.users.find_or_create_by!(unique_identifier: unique_identifier) do |new_user|
        new_user.email = data['email']
        new_user.first_name = data['firstName']
        new_user.last_name = data['lastName']
      end
    end

    def update_devices_owner_if_necessary!(user)
      device = find_or_create_device
      if device.user != user
        Rails.logger.warn "Device #{device.id} changed ownership from #{device.user_id} to #{user.id}" if device.user_id 
        device.update!(user: user)
      end
    end

    def create_or_update_metadata!(user)
      existing_metadata = user.metadata
      provided_metadata = data.except('user_id', 'userId', 'organizationId', 'organization', 'org', 'orgId', 'email', 'firstName', 'lastName')
      provided_metadata.each do |key, value|
        new_or_exsting_metadata = user.metadata.find_or_initialize_by(key: key)
        new_or_exsting_metadata.value = value
        new_or_exsting_metadata.save!
      end
    end
  end
end