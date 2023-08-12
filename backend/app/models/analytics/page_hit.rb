module Analytics
  class PageHit < ApplicationRecord
    self.table_name = :analytics_page_hits
    belongs_to :device, class_name: Analytics::Device.to_s, foreign_key: :analytics_device_id
    belongs_to :session, class_name: Analytics::Session.to_s, foreign_key: :analytics_session_id
    has_many :events, class_name: Analytics::Event.to_s, dependent: :destroy

    def self.first_of_sessions(instance)
      subquery = select("session_id, MIN(start_time) AS min_start_time").group(:session_id)

      joins("INNER JOIN (#{subquery.to_sql}) AS min_times ON page_hits.session_id = min_times.session_id")
      .joins(session: :device)
        .where("page_hits.start_time = min_times.min_start_time")
        .where(device: { instance_id: instance.id })
    end

    def friendly_url
      url_host + url_path
    end

    def friendly_referrer_url
      (referrer_url_host || '') + (referrer_url_path || '')
    end
  end
end