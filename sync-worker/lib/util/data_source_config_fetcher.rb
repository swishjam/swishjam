class DataSourceConfigFetcher
  def self.fetch_all_configs_for(interval:, source_type:)
    # This will eventually pull from our ConfigDB
    [
      { 
        organization: 'STUB?!',
        stripe_account_id: 'acct_1KsrpgLgOjszfy1j', 
        source_type: source_type, 
        attribute_mapping_rules: 'all', 
        attributes_to_capture: 'all',
        # destination_type: 'big_query',
        destination_type: 'log',
        destination_table_name: "swishjam_#{source_type}",
        destination_credentials: {
          host: 'localhost',
        }
      },
      { 
        organization: 'Collin\'s org!!!!',
        stripe_account_id: 'acct_1KsrpgLgOjszfy1j', 
        source_type: source_type, 
        attribute_mapping_rules: 'all', 
        attributes_to_capture: 'all',
        # destination_type: 'big_query',
        destination_type: 'log',
        destination_table_name: "swishjam_#{source_type}",
        destination_credentials: {
          host: 'localhost',
        }
      }
    ]
  end
end