class WorkspaceSetting < Transactional
  belongs_to :workspace

  alias_attribute :should_enrich_user_profile_data?, :should_enrich_user_profile_data
  alias_attribute :should_enrich_organization_profile_data?, :should_enrich_organization_profile_data

  validates :enrichment_provider, inclusion: { in: %w[people_data_labs octolane] }, allow_nil: true

  def self.generate_default_for(workspace)
    return false if workspace.settings.present?
    create!(
      workspace: workspace,
      combine_marketing_and_product_data_sources: false,
      should_enrich_user_profile_data: ENV['ENRICH_USER_PROFILE_DATA_BY_DEFAULT'] == 'true',
      should_enrich_organization_profile_data: ENV['ENRICH_ORGANIZATION_PROFILE_DATA_BY_DEFAULT'] == 'true',
      enrichment_provider: ENV['DEFAULT_ENRICHMENT_PROVIDER'] || 'octolane',
    )
  end
end