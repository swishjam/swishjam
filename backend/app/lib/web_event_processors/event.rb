module WebEventProcessors
  class Event < Base
    def capture!
      Analytics::Event.create!(
        uuid: uuid,
        swishjam_api_key: @workspace.public_key,
        name: event_name,
        session_identifier: unique_session_identifier,
        device_identifier: fingerprint_value,
        swishjam_organization_id: nil, 
        url: full_url, 
        url_host: parsed_url.host, 
        url_path: parsed_url.path, 
        url_query: parsed_url.query, 
        referrer_url: referrer_url, 
        referrer_url_host: parsed_referrer_url.host, 
        referrer_url_path: parsed_referrer_url.path, 
        referrer_url_query: parsed_referrer_url.query,
        utm_source: URI.decode_www_form(parsed_url.query || '').to_h['utm_source'], 
        utm_medium: URI.decode_www_form(parsed_url.query || '').to_h['utm_medium'], 
        utm_campaign: URI.decode_www_form(parsed_url.query || '').to_h['utm_campaign'], 
        utm_term: URI.decode_www_form(parsed_url.query || '').to_h['utm_term'], 
        is_mobile: device_data['isMobile'], 
        device_type: nil, 
        browser: device_data['browser'], 
        browser_version: device_data['browserVersion'], 
        os: device_data['os'], 
        os_version: device_data['osVersion'], 
        user_agent: device_data['userAgent'], 
        occurred_at: timestamp,
        properties: user_provided_data,
      )
    end
  end
end