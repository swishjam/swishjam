class UserProfileSerializer < ActiveModel::Serializer
  attributes :id, :user_unique_identifier, :email, :initials, :full_name, :first_name, :last_name, :metadata, :immutable_metadata, :created_at, :organizations, :enrichment_data

  def organizations
    object.analytics_organization_profiles
  end

  def enrichment_data
    object.enrichment_data || {}
  end

  def metadata
    # short term bandaid for inadvertently capturing unintentional metadata
    (object.metadata || {}).except('userIdentifier', 'url', 'device_identifier', 'session_identifier', 'page_view_identifier')
  rescue => e
    Sentry.capture_exception(e)
    Rails.logger.error "Unable to serializer #{object.email} (#{object.id}) user's metadata for workspace #{object.workspace.name} (#{object.workspace.name}): #{e.inspect}"
    {}
  end
end