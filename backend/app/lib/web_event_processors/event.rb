module WebEventProcessors
  class Event < Base
    def capture!
      properties = {
        url: full_url,
        url_host: parsed_url.host,
        url_path: parsed_url.path,
        url_query: parsed_url.query,
        user_agent: device_data['userAgent'],
        browser: device_data['browser'],
        browser_version: device_data['browserVersion'],
        os: device_data['os'],
        os_version: device_data['osVersion'],
        device: device_data['device'],
        device_type: device_data['deviceType'],
        is_mobile: device_data['isMobile'],
      }
      properties[Analytics::Event::ReservedPropertyNames.SESSION_IDENTIFIER.to_sym] = unique_session_identifier
      properties[Analytics::Event::ReservedPropertyNames.DEVICE_IDENTIFIER.to_sym] = fingerprint_value
      if user_provided_data['previousUrl']
        parsed_referrer_url = URI.parse(user_provided_data['previousUrl'] || '')
        user_provided_data['referrer_url'] = user_provided_data['previousUrl']
        user_provided_data['referrer_url_host'] = parsed_referrer_url.host
        user_provided_data['referrer_url_path'] = parsed_referrer_url.path
        user_provided_data['referrer_url_query'] = parsed_referrer_url.query
      end
      Analytics::Event.create!(
        swishjam_api_key: @workspace.public_key,
        name: event_name,
        occurred_at: timestamp,
        properties: properties.merge(user_provided_data.except('previousUrl')),
      )
    end
  end
end