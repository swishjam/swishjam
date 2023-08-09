module AnalyticsEventProcessors
  class Custom < Base
    def process!
      formatted_metadata = data.map{ |k, v| { key: k, value: v }}
      event = Event.create!(
        device: find_or_create_device,
        session: find_or_create_session,
        page_hit: find_or_create_page_hit,
        name: event_type,
        timestamp: timestamp,
        metadata_attributes: formatted_metadata
      )
    end

    def find_or_create_page_hit
      session = find_or_create_session
      session.page_hits.find_or_create_by!(unique_identifier: page_view_id) do |page_hit|
        page_hit.start_time = timestamp
        page_hit.full_url = full_url
        page_hit.url_host = url_host
        page_hit.url_path = url_path
        page_hit.url_query = parsed_url.query

        parsed_referrer = URI.parse(data['previousUrl'])
        page_hit.referrer_full_url = data['previousUrl']
        page_hit.referrer_url_host = parsed_referrer.host
        page_hit.referrer_url_path = parsed_referrer.path
        page_hit.referrer_url_query = parsed_referrer.query
      end
    end
  end
end