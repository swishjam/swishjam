module Integrations
  class Github < Integration
    self.data_source = ApiKey::ReservedDataSources.GITHUB

    validate :has_valid_installation_id

    def installation_id
      config['installation_id']
    end

    private

    def has_valid_installation_id
      if installation_id.blank?
        errors.add(:base, 'Cannot create a Github integration without an `installation_id`.')
      elsif self.class.where("config->>'installation_id' = ?", installation_id).where.not(id: id).exists?
        errors.add(:base, 'A Github integration already exists with this `installation_id`.')
      end
    end
  end
end