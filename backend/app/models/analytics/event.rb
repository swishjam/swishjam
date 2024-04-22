module Analytics
  class Event < ClickHouseRecord
    class ReservedNames
      class << self
        METHOD_NAMES = %i[PAGE_VIEW PAGE_LEFT NEW_SESSION MRR_MOVEMENT NEW_SUBSCRIBER CHURNED_SUBSCRIBER REACTIVATED_SUBCRIBER]
        
        METHOD_NAMES.each do |property_name|
          define_method(property_name) do
            property_name.to_s.downcase
          end
        end

        def all
          METHOD_NAMES.collect{ |method_name| self.send(method_name) }
        end

      end
    end
    
    class ReservedPropertyNames
      class << self
        # some of these might be deprecated, but including to account for any legacy data
        PROPERTIES = %i[
          BROWSER_MAJOR_VERSION
          BROWSER_NAME
          BROWSER_VERSION
          DEVICE
          DEVICE_FINGERPRINT
          DEVICE_IDENTIFIER
          DEVICE_VENDOR
          IS_MOBILE
          LANGUAGE
          ORGANIZATION
          ORGANIZATION_ATTRIBUTES
          ORGANIZATION_DEVICE_IDENTIFIER
          OS
          OS_VERSION
          PAGE_REFERRER
          PAGE_REFERRER_URL_PATH
          PAGE_REFERRER_URL_HOST
          PAGE_REFERRER_URL_QUERY_PARAMS
          PAGE_REFERRER_BASE_URL
          PAGE_VIEW_IDENTIFIER
          REFERRER
          REFERRER_URL_PATH
          REFERRER_URL_HOST
          REFERRER_URL_QUERY_PARAMS
          REFERRER_BASE_URL
          SDK_VERSION
          SESSION_GCLID
          SESSION_IDENTIFIER
          SESSION_LANDING_PAGE_URL
          SESSION_LANDING_PAGE_URL_HOST
          SESSION_LANDING_PAGE_URL_PATH
          SESSION_LANDING_PAGE_URL_QUERY_PARAMS
          SESSION_LANDING_PAGE_BASE_URL
          SESSION_REFERRER_URL
          SESSION_REFERRER_URL_HOST
          SESSION_REFERRER_URL_PATH
          SESSION_REFERRER_URL_QUERY_PARAMS
          SESSION_REFERRER_BASE_URL
          SESSION_UTM_CAMPAIGN
          SESSION_UTM_CONTENT
          SESSION_UTM_MEDIUM
          SESSION_UTM_SOURCE
          SESSION_UTM_TERM
          SWISHJAM_ORGANIZATION_ID
          SYSTEM_LANGUAGE
          TIMEZONE
          URL
          URL_HOST
          URL_PATH
          URL_QUERY_PARAMS
          BASE_URL
          USER_AGENT
          USER_ATTRIBUTES
          USER_DEVICE_IDENTIFIER
          USER_PROFILE_ID
        ]
        
        PROPERTIES.each do |property_name|
          define_method(property_name) do
            property_name.to_s.downcase
          end
        end
        
        def all
          PROPERTIES.collect{ |method_name| self.send(method_name) }
        end
      end
    end

    class InvalidEventFormat < StandardError; end;

    def self.formatted_for_preparation(uuid:, swishjam_api_key:, name:, properties: {}, occurred_at:)
      required_keys = { uuid: uuid, swishjam_api_key: swishjam_api_key, name: name, properties: properties, occurred_at: occurred_at }
      missing_keys = required_keys.select{ |key, value| value.blank? }
      if missing_keys.any?
        raise InvalidEventFormat, "Missing required keys: #{missing_keys.keys.join(', ')}"
      end
      {
        uuid: uuid,
        swishjam_api_key: swishjam_api_key,
        name: name,
        properties: properties.to_json,
        occurred_at: occurred_at.to_f,
      }
    end

    # THIS BREAKS TOO MUCH STUFF - GOING TO CONTINUE USING ACTIVE RECORD UNTIL WE CAN UPGRADE THE CLICKHOUSE ACTIVERECORD GEM
    # overwritting this method in order to correctly include milliseconds in timestamps :/
    # this should realistically only be called from the ClickHouseWriter classes, so all the data should already be formatted correctly here
    # def self.insert_all!(events_arr)
    #   events_arr = [events_arr] if !events_arr.is_a?(Array)
    #   columns = "uuid, swishjam_api_key, name, user_profile_id, organization_profile_id, properties, user_properties, organization_properties, occurred_at, ingested_at"
    #   values = events_arr.map do |event|
    #     "('#{event['uuid']}', '#{event['swishjam_api_key']}', '#{event['name']}', #{event['user_profile_id'].nil? ? 'NULL' : "'#{event['user_profile_id']}'"}, #{event['organization_profile_id'].nil? ? 'NULL' : "'#{event['organization_profile_id']}'"}, '#{event['properties']}', '#{event['user_properties']}', '#{event['organization_properties']}', '#{event['occurred_at'].to_datetime.utc.strftime('%Y-%m-%d %H:%M:%S.%3N')}', '#{DateTime.now.utc.strftime('%Y-%m-%d %H:%M:%S.%3N')}')"
    #   end.join(", ")
    #   insert_statement = <<~SQL
    #     INSERT INTO events (#{columns}) VALUES #{values}
    #   SQL
    #   execute_sql(insert_statement, format: nil)
    # end
  end
end