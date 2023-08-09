module Analytics
  class Session < ApplicationRecord
    self.table_name = :analytics_sessions
    belongs_to :device
    belongs_to :organization, optional: true
    has_many :page_hits, dependent: :destroy
    has_many :events, dependent: :destroy

    scope :with_first_page_hit, -> do 
      joins("INNER JOIN (
          select session_id, MIN(start_time) AS min_start_time from page_hits group by session_id
        ) AS min_times ON sessions.id = min_times.session_id")
        .joins(:page_hits)
        .where("page_hits.start_time = min_times.min_start_time")
    end

    def first_page_hit
      page_hits.order(start_time: :asc).limit(1).first
    end

    def friendly_referrer_url
      first_page_hit&.friendly_referrer_url
    end
  end
end