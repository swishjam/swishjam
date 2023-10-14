class ChangeSettingsToCombineMarketingAndProductDataSources < ActiveRecord::Migration[6.1]
  def up
    add_column :workspace_settings, :combine_marketing_and_product_data_sources, :boolean
    remove_column :workspace_settings, :use_product_data_source_in_lieu_of_marketing
    remove_column :workspace_settings, :use_marketing_data_source_in_lieu_of_product
  end
end
