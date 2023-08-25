module Analytics
  class Event < ClickHouseRecord
    class ReservedNames
      def self.all
        [PAGE_VIEW]
      end

      def self.PAGE_VIEW
        'page_view'
      end
    end

    has_many :user_identify_events, foreign_key: :user_distinct_id, primary_key: :user_distinct_id

    attribute :properties, :json, default: {}
    attribute :ingested_at, :datetime, default: -> { Time.current }

    before_create { self.name = self.class.normalized_event_name(name) }

    scope :by_api_key, -> (api_key) { where(swishjam_api_key: api_key) }
    scope :by_name, -> (name) { where(name: normalized_event_name(name)) }

    def self.PAGEVIEWS
      by_name(ReservedNames.PAGE_VIEW)
    end
    
    def self.normalized_event_name(event_name)
      event_name.downcase.gsub(/[^a-z0-9]/, '_')
    end
  end
end