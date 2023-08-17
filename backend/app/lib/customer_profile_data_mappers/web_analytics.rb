module CustomerProfileDataMappers
  class WebAnalytics < Base
    def find_organization(unique_identifier: nil, name: nil, url: nil)
      find_organization_by_unique_identifier(unique_identifier) ||
        find_organization_by_name(name) ||
        find_organization_by_domain(url)
    end

    def find_user(unique_identifier: nil, email: nil, full_name: nil)
      find_user_by_unique_identifier(unique_identifier) ||
        find_user_by_email(email) ||
        find_user_by_full_name(full_name)
    end

    private

    def find_organization_by_unique_identifier(unique_identifier)
      return if unique_identifier.blank?
      @swishjam_organization.analytics_organizations.find_by(unique_identifier: unique_identifier.downcase.strip)
    end

    def find_user_by_unique_identifier(unique_identifier)
      return if unique_identifier.blank?
      @swishjam_organization.analytics_users.find_by(unique_identifier: unique_identifier.downcase.strip)
    end
  end
end