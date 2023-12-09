class Integration < Transactional  
  belongs_to :workspace

  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }
  scope :by_type, -> (type) { where(type: type.to_s) }

  attribute :enabled, :boolean, default: -> { true }
  attribute :config, :jsonb, default: -> { {} }

  validates_uniqueness_of :type, scope: :workspace_id, message: "You already have a connection for this type." 

  after_create :create_api_key_for_data_source
  after_destroy :after_destroy_callback

  class << self
    attr_accessor :data_source
  end

  def self.TYPES
    # Integrations::GoogleSearchConsole - waiting until Google app approval process.
    # [Integrations::Stripe, Integrations::Resend, Integrations::CalCom, Integrations::GoogleSearchConsole]
    [Integrations::Stripe, Integrations::Resend, Integrations::CalCom, Integrations::Intercom]
  end

  def self.friendly_name
    self.to_s.split('::')[1]
  end

  def self.for_workspace(workspace)
    raise ArgumentError, "Cannot call Integration.for_workspace on the base class." if self == Integration
    find_by(workspace: workspace)
  end

  def enabled?
    enabled
  end

  def disabled?
    !enabled?
  end

  def enable!
    return self if enabled?
    update!(enabled: true)
    after_enable
    self
  end

  def disable!
    return self if disabled?
    update!(enabled: false)
    after_disable
    self
  end

  private

  def create_api_key_for_data_source
    ApiKey.create!(workspace: workspace, data_source: self.class.data_source)
  end

  # intended to be overrode
  def after_enable
  end

  def after_disable
  end

  def after_destroy_callback
  end
end