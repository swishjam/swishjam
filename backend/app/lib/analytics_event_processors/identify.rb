module AnalyticsEventProcessors
  class Identify < Base
    def process!
      user = create_or_update_user!
      create_or_update_metadata!(user)
      update_devices_owner_if_necessary!(user)
    end

    private

    def create_or_update_user!
      unique_identifier = data['user_id'] || data['userId']
      email = data['email']
      first_name = data['firstName'] || data['first_name']
      last_name = data['lastName'] || data['last_name']
      existing_user = CustomerProfileDataMappers::WebAnalytics.new(swishjam_organization).find_user(unique_identifier: unique_identifier, email: email, full_name: "#{first_name} #{last_name}")
      if existing_user
        existing_user.unique_identifier = unique_identifier if existing_user.unique_identifier != unique_identifier
        existing_user.email = email if existing_user.email != email
        existing_user.first_name = first_name if existing_user.first_name != first_name
        existing_user.last_name = last_name if existing_user.last_name != last_name
        existing_user.save! if existing_user.changed?
        existing_user
      else
        swishjam_organization.analytics_users.create!(
          unique_identifier: unique_identifier, 
          email: email, 
          first_name: first_name, 
          last_name: last_name,
          metadata_attributes: [{ key: 'created_by', value: 'sdk' }]
        )
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
      reserved_user_attributes = %w[
        user_id 
        userId 
        organizationId 
        organization_id 
        organization 
        org 
        orgId 
        org_id 
        email 
        firstName 
        first_name 
        lastName 
        last_name
      ]
      provided_metadata = data.except(*reserved_user_attributes)
      provided_metadata.each do |key, value|
        new_or_exsting_metadata = user.metadata.find_or_initialize_by(key: key)
        new_or_exsting_metadata.value = value
        new_or_exsting_metadata.save!
      end
    end
  end
end