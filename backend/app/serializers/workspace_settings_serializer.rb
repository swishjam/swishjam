class WorkspaceSettingsSerializer < ActiveModel::Serializer
  attributes :combine_marketing_and_product_data_sources, :revenue_analytics_enabled, :should_enrich_user_profile_data, :should_enrich_organization_profile_data, :enrichment_provider, :do_not_enrich_user_profile_rules

  def do_not_enrich_user_profile_rules
    object.workspace.do_not_enrich_user_profile_rules.map do |rule|
      {
        id: rule.id,
        email_domain: rule.email_domain,
      }
    end
  end
end