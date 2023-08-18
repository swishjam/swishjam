module Analytics
  class Session < ApplicationRecord
    self.table_name = :analytics_sessions
    belongs_to :device, class_name: Analytics::Device.to_s, foreign_key: :analytics_device_id
    belongs_to :organization, class_name: Analytics::Organization.to_s, foreign_key: :analytics_organization_id, optional: true
    has_many :page_hits, class_name: Analytics::PageHit.to_s, foreign_key: :analytics_session_id, dependent: :destroy
    has_many :events, class_name: Analytics::Event.to_s, foreign_key: :analytics_session_id, dependent: :destroy

    # scope :with_first_page_hit, -> do 
    #   joins("INNER JOIN (
    #       select session_id, MIN(start_time) AS min_start_time from page_hits group by session_id
    #     ) AS min_times ON sessions.id = min_times.session_id")
    #     .joins(:page_hits)
    #     .where("page_hits.start_time = min_times.min_start_time")
    # end
    scope :starting_before, -> (timestamp) { where('start_time < ?', timestamp.to_datetime) }
    scope :starting_at_or_before, -> (timestamp) { where('start_time <= ?', timestamp.to_datetime) }
    scope :starting_after, -> (timestamp) { where('start_time > ?', timestamp.to_datetime) }
    scope :starting_at_or_after, -> (timestamp) { where('start_time >= ?', timestamp.to_datetime) }
    scope :mobile, -> { joins(:device).where(analytics_devices: { is_mobile: true }) }
    scope :not_mobile, -> { joins(:device).where(analytics_devices: { is_mobile: false }) }

    def first_page_hit
      page_hits.order(start_time: :asc).limit(1).first
    end

    def friendly_referrer_url
      first_page_hit&.friendly_referrer_url
    end
  end
end