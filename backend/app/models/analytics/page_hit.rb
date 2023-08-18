module Analytics
  class PageHit < ApplicationRecord
    self.table_name = :analytics_page_hits
    belongs_to :device, class_name: Analytics::Device.to_s, foreign_key: :analytics_device_id
    belongs_to :session, class_name: Analytics::Session.to_s, foreign_key: :analytics_session_id
    has_many :events, class_name: Analytics::Event.to_s, foreign_key: :analytics_page_hit_id, dependent: :destroy

    def self.first_of_sessions(swishjam_organization)
      subquery = select("analytics_session_id, MIN(start_time) AS min_start_time").group(:analytics_session_id)

      joins("INNER JOIN (#{subquery.to_sql}) AS min_times ON analytics_page_hits.analytics_session_id = min_times.analytics_session_id")
      .joins(session: :device)
        .where("analytics_page_hits.start_time = min_times.min_start_time")
        .where(device: { swishjam_organization_id: swishjam_organization.id })
    end

    def friendly_url
      url_host + url_path
    end

    def friendly_referrer_url
      (referrer_url_host || '') + (referrer_url_path || '')
    end
  end
end