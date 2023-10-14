class WorkspaceSetting < Transactional
  belongs_to :workspace

  def self.generate_default_for(workspace)
    return false if workspace.settings.present?
    create!(
      workspace: workspace,
      combine_marketing_and_product_data_sources: false,
    )
  end
end