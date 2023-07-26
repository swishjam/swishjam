require_relative 'extractors/stripe/charges'
require_relative 'extractors/stripe/payment_intents'
require_relative 'extractors/posthog/customers'
require_relative 'transformers/data_mapper'
require_relative 'loaders/log'
require_relative 'loaders/postgres'
require_relative 'loaders/big_query'
require_relative 'source_data_collections/stripe/charges'
require_relative 'source_data_collections/stripe/payment_intents'

require 'byebug'

SOURCE_TYPE_EXTRACTION_KLASS_DICT = {
  stripe_charges: Extractors::Stripe::Charges,
  stripe_payment_intents: Extractors::Stripe::PaymentIntents,
  posthog_customers: Extractors::Posthog::Customers,
}

LOADER_KLASS_DICT = {
  log: Loaders::Log,
  postgres: Loaders::Postgres,
  big_query: Loaders::BigQuery
}

SOURCE_DATA_COLLECTIONS_DICT = {
  stripe_charges: SourceDataCollections::Stripe::Charges,
  stripe_payment_intents: SourceDataCollections::Stripe::PaymentIntents,
}

class ETL
  class UnknownSourceType < StandardError; end;
  class UnknownDestinationType < StandardError; end;

  def self.run!(data_source_config)
    start = Time.now
    puts "Beginning to ETL #{data_source_config[:source_type]} for organization #{data_source_config[:organization]}."

    # get the extraction and load class based on the data_source_config's `source_type`
    extract_klass = SOURCE_TYPE_EXTRACTION_KLASS_DICT[data_source_config[:source_type].to_sym] || invalid!(UnknownSourceType, "Unknown `source_type` provided in `data_source_config`: #{data_source_config[:source_type]}. Supported options are #{SOURCE_TYPE_EXTRACTION_KLASS_DICT.keys.join(', ')}.")
    load_klass = LOADER_KLASS_DICT[data_source_config[:destination_type].to_sym] || invalid!(UnknownDestinationType, "Unknown `destination_type` provided in `data_source_config`: #{data_source_config[:destination_type]}. Supported options are #{LOADER_KLASS_DICT.keys.join(', ')}.")
    source_collection_klass = SOURCE_DATA_COLLECTIONS_DICT[data_source_config[:source_type].to_sym] || invalid!(UnknownSourceType, "Unknown `source_type` provided in `data_source_config`: #{data_source_config[:source_type]}. Supported options are #{SOURCE_DATA_COLLECTIONS_DICT.keys.join(', ')}.")
    
    # extract all of the data from the source
    raw_records = extract_klass.extract!(data_source_config)
    
    # format the data based on the mapping rules in the data_source_config
    # formatted_records = raw_records.map{ |record| Transformers::DataMapper.format!(record, data_source_config[:attributes_to_capture]) }
    formatted_records = source_collection_klass.new(raw_records)
    
    # load each formatted record into the destination specified in the data_source_config
    load_klass.load!(
      source_data_collection: formatted_records,
      destination_credentials: data_source_config[:destination_credentials],
      table_name: data_source_config[:destination_table_name]
    )
    
    # write success to DB success table
    puts "ETL'ed #{formatted_records.count} #{data_source_config[:source_type]} for organization #{data_source_config[:organization]} in #{Time.now - start} seconds."
  rescue => e
    puts "ERROR: #{data_source_config[:source_type]} ETL failed for organization #{data_source_config[:organization]}: #{e.inspect}"
    # write failure to DB error table
  end

  private
  
  def self.invalid!(error_klass, msg)
    raise error_klass, msg
  end
end