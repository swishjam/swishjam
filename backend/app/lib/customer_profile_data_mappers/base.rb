module CustomerProfileDataMappers
  class Base
    def initialize(swishjam_organization)
      @swishjam_organization = swishjam_organization
    end

    private

    def find_organization_by_metadata(keys_or_key, values_or_value)
      return if keys_or_key.blank? || values_or_value.blank?
      keys = keys_or_key.is_a?(Array) ? keys_or_key.map(&:downcase) : [keys_or_key.downcase]
      values = values_or_value.is_a?(Array) ? values_or_value.map(&:downcase) : [values_or_value.downcase]
      organizations = @swishjam_organization
                        .analytics_organizations
                        .joins(:metadata)
                        .where("LOWER(analytics_metadata.key) in (?) AND LOWER(analytics_metadata.value) in (?)", keys, values)
      return organizations.first if organizations.count == 1
      Rails.logger.warn "Multiple organizations found with metadata keys: #{keys} and values: #{values} for Swishjam organization #{@swishjam_organization.id}, cannot associate it to an organization." if organizations.count > 1
    end

    def find_organization_by_domain(domain)
      return if domain.blank? || domain == 'gmail.com'
      organizations = @swishjam_organization
                        .analytics_organizations
                        .where(
                          'LOWER(url) LIKE ? OR LOWER(url) LIKE ? OR LOWER(url) LIKE ?', 
                          "%#{domain.downcase}%", "#{domain.downcase}%", "%#{domain.downcase}"
                        )
      return organizations.first if organizations.count == 1
      Rails.logger.warn "Multiple organizations found with URL like: #{domain} for Swishjam organization #{@swishjam_organization}, cannot associate it to an organization." if organizations.count > 1
    end

    def find_organization_by_name(name)
      return if name.blank?
      organizations = @swishjam_organization.analytics_organizations.where('LOWER(name) = ?', name.downcase)
      return organizations.first if organizations.count == 1
      Rails.logger.warn "Multiple organizations found with name: #{name} for Swishjam organization #{@swishjam_organization}, cannot associate it to an organization." if organizations.count > 1
    end
  end
end