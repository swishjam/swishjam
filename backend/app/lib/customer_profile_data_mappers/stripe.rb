module CustomerProfileDataMappers
  class Stripe < Base
    def find_or_create_owner(stripe_customer)
      potential_organization = potential_organization_for_customer(stripe_customer)
      return potential_organization if potential_organization

      create_new_organization_and_user_from_stripe_customer(stripe_customer)
    end

    private

    def potential_organization_for_customer(stripe_customer)
      find_organization_by_metadata(['stripe_customer_id', 'stripe customer id', 'stripe_customer', 'stripe customer'], stripe_customer&.id) ||
        find_organization_by_domain(stripe_customer&.email&.split('@')&.dig(1)) ||
        find_organization_by_name(stripe_customer&.name)
    end

    def create_new_organization_and_user_from_stripe_customer(stripe_customer)
      inferred_url = stripe_customer&.email&.split('@')&.dig(1)
      new_organization = @swishjam_organization.analytics_organizations.create!(
        name: stripe_customer&.name,
        url: inferred_url == 'gmail.com' ? nil : inferred_url,
        metadata_attributes: [
          { key: 'stripe_customer_id', value: stripe_customer&.id },
          { key: 'created_by', value: 'stripe' }
        ]
      )
      new_organization.users.create!(
        swishjam_organization: @swishjam_organization,
        email: stripe_customer&.email,
        first_name: stripe_customer&.name&.split(' ')&.first,
        last_name: stripe_customer&.name&.split(' ')&.last,
        metadata_attributes: [{ key: 'created_by', value: 'stripe' }]
      )
      new_organization
    end
  end
end