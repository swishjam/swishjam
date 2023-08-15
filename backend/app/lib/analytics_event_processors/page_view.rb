module AnalyticsEventProcessors
  class PageView < Base
    def process!
      Analytics::PageHit.create!(
        device: find_or_create_device,
        session: find_or_create_session,
        unique_identifier: page_view_id,
        full_url: full_url,
        url_host: url_host,
        url_path: url_path,
        url_query: url_query,
        referrer_full_url: referrer_url,
        referrer_url_host: referrer_url_host,
        referrer_url_path: referrer_url_path,
        referrer_url_query: referrer_url_query,
        start_time: timestamp,
      )
    end

    private

    def referrer_url
      data['previousUrl'] || data['referrerUrl'] || data['referrer'] || data['previous_url'] || data['referrer_url']
    end

    def parsed_referrer
      URI.parse(referrer_url)
    rescue => e
    end

    def referrer_url_host
      parsed_referrer&.host
    end

    def referrer_url_path
      parsed_referrer&.path
    end

    def referrer_url_query
      parsed_referrer&.query
    end
  end
end