class WorkspaceSettingsSerializer < ActiveModel::Serializer
  attributes :combine_marketing_and_product_data_sources, :should_enrich_user_profile_data, :enrichment_provider
end