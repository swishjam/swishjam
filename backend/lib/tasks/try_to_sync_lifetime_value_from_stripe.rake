def sync_integrations_workspace(integration)
  raise "No Stripe integration found for workspace #{workspace.name} (#{workspace.id})" if integration.nil?
  raise "Stripe integration for workspace #{workspace.name} (#{workspace.id}) is not enabled" if integration.disabled?

  workspace = integration.workspace
  stripe_account_id = integration.account_id
  puts "Attempting to import lifetime value for workspace #{workspace.name} (#{workspace.id})...".colorize(:grey)
  StripeHelpers::DataFetchers.get_all_customers(stripe_account_id).each do |stripe_customer|
    user_profile = workspace.analytics_user_profiles.find_by(email: stripe_customer.email)
    if user_profile
      charges_for_customer = StripeHelpers::DataFetchers.get_all_charges(stripe_account_id, customer: stripe_customer.id)
      lifetime_value = calculate_lifetime_value_from_charges(charges_for_customer)
      user_profile.update!(lifetime_value_in_cents: lifetime_value)
      puts "Successfully imported lifetime value for customer #{user_profile.email} ($#{lifetime_value / 100.0}) in workspace #{workspace.name} (#{workspace.id})".colorize(:green)
    else
      puts "Could not find a matching user profile for stripe customer with email #{stripe_customer.email} in workspace #{workspace.name} (#{workspace.id})".colorize(:red)
    end
  end
end

def sync_user(user_profile)
  integration = Integrations::Stripe.for_workspace(user_profile.workspace)
  raise "No Stripe integration found for #{user_profile.email}'s workspace #{user_profile.workspace.name} (#{user_profile.workspace.id})" if integration.nil?
  raise "Stripe integration for #{user_profile.email}'s workspace #{user_profile.workspace.name} (#{user_profile.workspace.id}) is not enabled" if integration.disabled?

  matching_customers = Stripe::Customer.list({ email: user_profile.email }, stripe_account: integration.account_id)
  if matching_customers.count == 0
    puts "Could not find a matching customer with email #{user_profile.email} in Stripe, cannot sync lifetime value for user #{user_profile.email} (#{user_profile.id}) in workspace #{user_profile.workspace.name} (#{user_profile.workspace.id})".colorize(:red)
  elsif matching_customers.count > 1
    puts "Found multiple matching customers with email #{user_profile.email} in Stripe for workspace #{user_profile.workspace.name} (#{user_profile.workspace.id}), not sure which to use so skipping...".colorize(:red)
  else
    charges_for_customer = StripeHelpers::DataFetchers.get_all_charges(integration.account_id, customer: matching_customers.first.id)
    lifetime_value = calculate_lifetime_value_from_charges(charges_for_customer)
    user_profile.update!(lifetime_value_in_cents: lifetime_value)
    puts "Successfully imported lifetime value for customer #{user_profile.email} ($#{lifetime_value / 100.0}) in workspace #{user_profile.workspace.name} (#{user_profile.workspace.id})".colorize(:green)
  end
end

def calculate_lifetime_value_from_charges(charges)
  charges.to_a.map do |charge| 
    return 0 if charge.status != 'succeeded'
    charge.amount - charge.amount_refunded
  end.reduce(:+)
end

namespace :data do
  task try_to_sync_lifetime_value_from_stripe: [:environment] do
    ActiveRecord::Base.logger.silence do
      prompter = TTY::Prompt.new

      scope = prompter.select("Define the scope for the lifetime value sync:", ['everything', 'workspace', 'user']){ |q| q.default 'everything' }
      if scope == 'workspace'
        workspace_id = prompter.ask('Enter the workspace ID:')
        workspace = Workspace.find(workspace_id)
        integration = Integrations::Stripe.for_workspace(workspace)
        sync_integrations_workspace(integration)
      elsif scope == 'user'
        user_id = prompter.ask('Enter the user ID:')
        user_profile = AnalyticsUserProfile.find(user_id)
        sync_user(user_profile)
      else
        Integrations::Stripe.includes(:workspace).enabled.each do |integration|
          sync_integrations_workspace(integration)
        end
      end
    end
  end
end