class AnalyticsFamilyConfiguration < Transactional
  belongs_to :workspace
  
  TYPES = [AnalyticsFamilyConfigurations::Product, AnalyticsFamilyConfigurations::Marketing, AnalyticsFamilyConfigurations::Docs, AnalyticsFamilyConfigurations::Blog, AnalyticsFamilyConfigurations::Other].freeze
  validates :type, presence: true, inclusion: { in: TYPES.map(&:to_s) }
  validates :url_regex, presence: true
  validates :priority, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validate :is_valid_regexp

  scope :by_type, -> (type) { where(type: type.to_s) }
  scope :marketing, -> { by_type(AnalyticsFamilyConfigurations::Marketing) }
  scope :product, -> { by_type(AnalyticsFamilyConfigurations::Product) }
  scope :docs, -> { by_type(AnalyticsFamilyConfigurations::Docs) }
  scope :blog, -> { by_type(AnalyticsFamilyConfigurations::Blog) }
  scope :other, -> { by_type(AnalyticsFamilyConfigurations::Other) }

  default_scope { order(priority: :ASC) }

  before_validation :set_default_priority, on: :create
  before_save :re_prioritize_workspaces_configurations, if: :priority_changed?
  before_save :format_regex, if: :url_regex_changed?
  after_destroy :ensure_priority_ordering_starts_at_zero_and_incrementally_increases
  
  def self.clickhouse_formatted_family_name
    name.to_s.split('::').last.downcase
  end

  def self.friendly_name
    clickhouse_formatted_family_name.capitalize
  end

  def self.generate_default_for_workspace(workspace)
    return false if workspace.analytics_family_configurations.any?
    insert_all([
      { workspace_id: workspace.id, type: AnalyticsFamilyConfigurations::Product.to_s, url_regex: 'app\.[^.]*\.[^.]*$', description: "Matches all URLs that have a subdomain of `app`.", priority: 0 , created_at: Time.current, updated_at: Time.current },
      { workspace_id: workspace.id, type: AnalyticsFamilyConfigurations::Product.to_s, url_regex: 'dashboard\.[^.]*\.[^.]*$', description: "Matches all URLs that have a subdomain of `dashboard`.", priority: 1 , created_at: Time.current, updated_at: Time.current },
      { workspace_id: workspace.id, type: AnalyticsFamilyConfigurations::Product.to_s, url_regex: '\/dashboard', description: "Matches all URLs that contain `/dashboard` in the URL path.", priority: 2 , created_at: Time.current, updated_at: Time.current },
      { workspace_id: workspace.id, type: AnalyticsFamilyConfigurations::Docs.to_s, url_regex: 'docs\.[^.]*\.[^.]*$', description: "Matches all URLs that have a subdomain of `docs`.", priority: 3 , created_at: Time.current, updated_at: Time.current },
      { workspace_id: workspace.id, type: AnalyticsFamilyConfigurations::Docs.to_s, url_regex: '\/docs', description: "Matches all URLs that contain `/docs` in the URL path.", priority: 4 , created_at: Time.current, updated_at: Time.current },
      { workspace_id: workspace.id, type: AnalyticsFamilyConfigurations::Blog.to_s, url_regex: 'blog\.[^.]*\.[^.]*$', description: "Matches all URLs that have a subdomain of `blog`.", priority: 5 , created_at: Time.current, updated_at: Time.current },
      { workspace_id: workspace.id, type: AnalyticsFamilyConfigurations::Blog.to_s, url_regex: '\/blog', description: "Matches all URLs that contain `/blog` in the URL path.", priority: 6 , created_at: Time.current, updated_at: Time.current },
      { workspace_id: workspace.id, type: AnalyticsFamilyConfigurations::Marketing.to_s, url_regex: 'www\.[^.]*\.[^.]*$', description: "Matches all URLs that have a subdomain of `www`.", priority: 7 , created_at: Time.current, updated_at: Time.current },
      { workspace_id: workspace.id, type: AnalyticsFamilyConfigurations::Marketing.to_s, url_regex: '^(https?://)([^.]+\.[^.]+)(/|$)', description: "Matches all URLs that are the root domain.", priority: 8, created_at: Time.current, updated_at: Time.current },
    ])
  end

  private

  def is_valid_regexp
    begin
      Regexp.new(url_regex)
    rescue RegexpError => e
      errors.add(:url_regex, "Invalid Regular Expression: #{e.message}")
    end
  end

  def format_regex
    self.url_regex = url_regex.strip
    self.url_regex = url_regex[1..-2] if url_regex[0] == '/' && url_regex[-1] == '/'
  end

  def re_prioritize_workspaces_configurations
    return unless priority_changed?
    # get all the configurations with an priority greater than or equal to this new priority and bump their priority up 1
    workspace.analytics_family_configurations.where('priority >= ? AND id != ?', self.priority, self.id).each do |configuration|
      configuration.update_column :priority, configuration.priority + 1
    end
  end

  def ensure_priority_ordering_starts_at_zero_and_incrementally_increases
    # make sure the ordering starts at 0 and proceeds from there
    workspace.analytics_family_configurations.order(priority: :ASC).each_with_index do |configuration, index|
      configuration.update_column :priority, index if configuration.priority != index
    end
  end

  def set_default_priority
    return unless self.priority.blank?
    max_priority = workspace.analytics_family_configurations.maximum(:priority)
    self.priority = max_priority.blank? ? 0 : max_priority + 1
  end
end