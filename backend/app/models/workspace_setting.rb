class WorkspaceSetting < Transactional
  belongs_to :workspace

  def self.generate_default_for(workspace)
    return false if workspace.settings.present?
    create!(
      workspace: workspace,
      use_product_data_source_in_lieu_of_marketing: false,
      use_marketing_data_source_in_lieu_of_product: false,
    )
  end
end