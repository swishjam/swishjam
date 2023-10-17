class WorkspaceSetting < Transactional
  belongs_to :workspace

  alias_attribute :should_enrich_user_profile_data?, :should_enrich_user_profile_data

  def self.generate_default_for(workspace)
    return false if workspace.settings.present?
    create!(
      workspace: workspace,
      combine_marketing_and_product_data_sources: false,
    )
  end
end