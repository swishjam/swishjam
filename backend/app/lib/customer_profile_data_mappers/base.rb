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
      return_organization_if_found_one(organizations)
    end

    def find_organization_by_domain(domain)
      return if domain.blank? || domain == 'gmail.com'
      organizations = @swishjam_organization
                        .analytics_organizations
                        .where(
                          'LOWER(url) LIKE ? OR LOWER(url) LIKE ? OR LOWER(url) LIKE ? OR LOWER(url) = ?', 
                          "%#{domain.strip.downcase}%", "#{domain.strip.downcase}%", "%#{domain.strip.downcase}", domain.strip.downcase
                        )
      return_organization_if_found_one(organizations)
    end

    def find_organization_by_name(name)
      return if name.blank?
      organizations = @swishjam_organization.analytics_organizations.where('LOWER(name) = ?', name.strip.downcase)
      return_organization_if_found_one(organizations)
    end

    def find_user_by_email(email)
      return if email.blank?
      users = @swishjam_organization.analytics_users.where('LOWER(email) = ?', email.strip.downcase)
      return_user_if_found_one(users)
    end

    def find_user_by_full_name(full_name)
      return if full_name.blank?
      first_name, last_name = full_name.split(' ')
      users = @swishjam_organization.analytics_users.where('LOWER(first_name) = ? AND LOWER(last_name) = ?', first_name.strip.downcase, last_name.strip.downcase)
      return_user_if_found_one(users)
    end

    def return_organization_if_found_one(organizations)
      return organizations.first if organizations.count == 1
      Rails.logger.warn "Multiple organizations matched in #{self.class.to_s} for Swishjam organization #{@swishjam_organization}, cannot associate it to an organization. Found orgs: #{organizations.collect(&:id).join(', ')}" if organizations.count > 1
      nil
    end

    def return_user_if_found_one(users)
      return users.first if users.count == 1
      Rails.logger.warn "Multiple users matched in #{self.class.to_s} for Swishjam organization #{@swishjam_organization}, cannot associate it to a user. Found users: #{users.collect(&:id).join(', ')}" if users.count > 1
      nil
    end
  end
end