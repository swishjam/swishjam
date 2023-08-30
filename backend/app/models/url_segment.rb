class UrlSegment < Transactional
  belongs_to :workspace

  validates :url_host, presence: true, uniqueness: { scope: :workspace_id, message: "A URL segment with this host already exists." }
end