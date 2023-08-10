class Integration < ApplicationRecord  
  belongs_to :instance

  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }
  scope :by_type, -> (type) { where(type: type) }

  validates_uniqueness_of :type, scope: :instance_id

  def self.TYPES
    [Integrations::Stripe]
  end

  def self.friendly_name
    self.to_s.split('::')[1]
  end

  def self.for_instance(instance)
    raise ArgumentError, "Cannot call Integration.for_instance on the base class." if self == Integration
    find_by(instance: instance)
  end

  def enabled?
    enabled
  end

  def disabled?
    !enabled?
  end

  def enable!
    return self if enabled?
    update(enabled: true)
  end

  def disable!
    return self if disabled?
    update(enabled: false)
  end
end