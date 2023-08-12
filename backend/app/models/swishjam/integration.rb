module Swishjam
  class Integration < ApplicationRecord  
    self.table_name = :swishjam_integrations
    belongs_to :organization, class_name: Swishjam::Organization.to_s, foreign_key: :swishjam_organization_id

    scope :enabled, -> { where(enabled: true) }
    scope :disabled, -> { where(enabled: false) }
    scope :by_type, -> (type) { where(type: type) }

    validates_uniqueness_of :type, scope: :swishjam_organization_id

    def self.TYPES
      [Integrations::Stripe]
    end

    def self.friendly_name
      self.to_s.split('::')[2]
    end

    def self.for_organization(organization)
      raise ArgumentError, "Cannot call Integration.for_organization on the base class." if self == Integration
      find_by(organization: organization)
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
end