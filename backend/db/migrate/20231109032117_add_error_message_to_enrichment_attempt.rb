class AddErrorMessageToEnrichmentAttempt < ActiveRecord::Migration[6.1]
  def change
    add_column :user_profile_enrichment_attempts, :error_message, :text
  end
end
