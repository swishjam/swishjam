require "google/cloud/bigquery"
require_relative 'base'

module Loaders
  class BigQuery < Base
    def self.load!(destination_credentials:, table_name:, source_data_collection:)
      bq_client = Loaders::BigQuery.connect('ya29.a0AbVbY6M1WLtUjRIhb-DuHvJfUnQnrPxAjJkBUMHCZhHZrGqAf24n-ZZVrCy69uju2HQCtm2rW7oTq9tl5X5xNKPxLqzXN5iA9V9YBZuzz-x9uA27EAcqK_leCCT8FB8F-uULFB2MoaocwAQC0jBxBZxBK7ERaCgYKAZMSARASFQFWKvPliWowCPuJ4fVcYw24ETT4zA0163')

      swishjam_dataset = bq_client.dataset('swishjam_data')
      stripe_charges_table = swishjam_dataset.table(table_name)

      results = stripe_charges_table.insert(source_data_collection.as_sql_json)
      puts "results: #{results}"
    end

    def self.connect(refresh_token)
      google_auth_credentials = Google::Auth::UserRefreshCredentials.new(
        client_id: ENV['GOOGLE_OAUTH_CLIENT_ID'],
        client_secret: ENV['GOOGLE_OAUTH_CLIENT_SECRET'],
        scope: 'https://www.googleapis.com/auth/bigquery',
        refresh_token: refresh_token
      )
      Google::Cloud::Bigquery.new(project_id: ENV['GOOGLE_BIGQUERY_PROJECT_ID'], credentials: google_auth_credentials)
    end
  end
end