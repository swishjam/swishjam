module Ingestion
  module EventPreparers
    module Helpers
      class EventPropertiesAugmentor < Ingestion::EventPreparers::Base
        URL_PROPERTIES_TO_NORMALIZE = [
          Analytics::Event::ReservedPropertyNames.URL,
          Analytics::Event::ReservedPropertyNames.PAGE_REFERRER,
          Analytics::Event::ReservedPropertyNames.SESSION_LANDING_PAGE_URL,
          Analytics::Event::ReservedPropertyNames.SESSION_REFERRER_URL,
          Analytics::Event::ReservedPropertyNames.REFERRER, # deprecated, but including to account for older SDKs that dont use PAGE_REFERRER
        ]

        def augment_properties!
          URL_PROPERTIES_TO_NORMALIZE.each do |url_property_name|
            Ingestion::EventPreparers::Helpers::PropertyAugmentors::UrlNormalizer.add_normalized_url_properties!(parsed_event, url_property_name)
          end
        end
      end
    end
  end
end