require 'oauth2'
require "google/cloud/bigquery"
require 'dotenv/load'

require 'byebug'

client = OAuth2::Client.new(
  ENV['GOOGLE_OAUTH_CLIENT_ID'], 
  ENV['GOOGLE_OAUTH_CLIENT_SECRET'], 
  authorize_url: 'https://accounts.google.com/o/oauth2/auth', 
  token_url: 'https://accounts.google.com/o/oauth2/token'
)

# Generate the authorization URL
auth_url = client.auth_code.authorize_url(redirect_uri: 'https://redirectmeto.com/http://localhost:3000/oauth/callback', scope: 'https://www.googleapis.com/auth/bigquery')

# Open the authorization URL in a browser
puts "Open the following URL in the browser and grant access:"
puts auth_url


# Get the authorization code from the user
print "Enter the authorization code: "
auth_code = gets.chomp

# http://localhost:3000/oauth/callback?code=4%2F0AZEOvhXFcjjgKbts26r4NkSQIvyjQbgWQVGtekn5azmfZXLVd9evUIrmkfSuBOXCfamIiQ&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fbigquery
# Exchange the authorization code for an access token
token = client.auth_code.get_token(auth_code, redirect_uri: 'https://redirectmeto.com/http://localhost:3000/oauth/callback')

# puts "Client??? #{token.client}"
puts "Token is: #{token.token}"

# ya29.a0AbVbY6PNtnNHbcdw2HelM5H4s3wko0QR00tyc0Ly8FlmpMIP7uOMO2_V03PFIf5SuCdEOxPxja0hajND3Du6i0VQs1GRK6CZiK5xxjq_MLOxYdFsJw5gHbdgMA4xdBq0MP11EaSa1xwppWdv0Rn0IBDufz29aCgYKAX0SARASFQFWKvPlJ6yCbmDAseZ7m2Njumf0cA0163

# google_auth_credentials = Google::Auth::UserRefreshCredentials.new(
#   client_id: ENV['GOOGLE_OAUTH_CLIENT_ID'],
#   client_secret: ENV['GOOGLE_OAUTH_CLIENT_SECRET'],
#   scope: 'https://www.googleapis.com/auth/bigquery',
#   refresh_token: token.token
# )

# bq = Google::Cloud::Bigquery.new(project_id: ENV['GOOGLE_BIGQUERY_PROJECT_ID'], credentials: google_auth_credentials)

# swishjam_dataset = bq.dataset('swishjam_data')
# stripe_charges_table = swishjam_dataset.table('swishjam_stripe_charges')
# # table_ref = bq.dataset('swishjam_data').table('swishjam_stripe_charges')
# # table = bq.table(table_ref)
# puts "inserting into table #{stripe_charges_table}"

# # sql = <<~SQL
# #   INSERT INTO 
# #     `swishjam_data.swishjam_stripe_charges` (
# #       id, object, amount, amount_captured, amount_refunded, application_fee, application_fee_amount
# #     )
# #   VALUES 
# #     ('1234', 'charge', 1000, 1000, 0, 0, 0),
# #     ('5678', 'charge', 2000, 2000, 0, 0, 0)
# # SQL

# # Write an update statement
# sql = <<~SQL
#   UPDATE
#     `swishjam_data.swishjam_stripe_charges`
#   SET
#     amount = 10
#   WHERE
#     id = '1234'
# SQL

# # sql = <<~SQL
# #   UPDATE
# #     `swishjam_data.swishjam_stripe_charges` (
# #       id, object, amount, amount_captured, amount_refunded, application_fee, application_fee_amount
# #     )
# #   VALUES 
# #     ('1234', 'charge', 1000, 1000, 0, 0, 0),
# #     ('5678', 'charge', 2000, 2000, 0, 0, 0)
# # SQL

# results = bq.query(sql)

# # results = table.load([
# #   { id: '1234', object: 'charge', amount: 1_000, amount_captured: 1_000, amount_refunded: 0, application_fee: 0, application_fee_amount: 0 },
# #   { id: '5678', object: 'charge', amount: 2_000, amount_captured: 2_000, amount_refunded: 0, application_fee: 0, application_fee_amount: 0 }
# # ])

# puts "results: #{results}"