module Ingestion
  module EventPreparers
    module Helpers
      module PropertyAugmentors
        class UrlNormalizer
          def self.add_normalized_url_properties!(parsed_event, property_name)
            return if !parsed_event.properties[property_name].present?
            return if parsed_event.properties[property_name] == 'direct'
            parsed_url = URI.parse(parsed_event.properties[property_name])
            parsed_event.set_property(new_property_name(property_name, 'url_path'), parsed_url.path.blank? ? '/' : parsed_url.path)
            parsed_event.set_property(new_property_name(property_name, 'url_host'), parsed_url.host)
            parsed_event.set_property(new_property_name(property_name, 'url_query_params'), parsed_url.query)
            parsed_event.set_property(new_property_name(property_name, 'base_url'), "#{parsed_url.host}#{parsed_url.path == '/' ? '' : parsed_url.path}")
            parsed_event
          rescue URI::InvalidURIError => e
            Sentry.capture_exception(e, extra: { attempted_url: parsed_event.properties[property_name] })
            parsed_event
          end

          def self.new_property_name(old_property_name, augmented_proprety_name)
            if old_property_name.include?('url')
              # session_landing_page_url -> session_landing_page_url_path
              old_property_name.gsub('url', augmented_proprety_name)
            else
              # referrer -> referrer_url_path
              [old_property_name, augmented_proprety_name].join('_')
            end
          end
          
        end
      end
    end
  end
end