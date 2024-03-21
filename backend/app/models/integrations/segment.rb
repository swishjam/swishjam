module Integrations
  class Segment < Integration
    self.data_source = ApiKey::ReservedDataSources.SEGMENT
    self.define_jsonb_methods :config, :for_data_source
    self.required_jsonb_fields :config, :for_data_source

    validate :has_valid_for_data_source

    private

    def has_valid_for_data_source
      if for_data_source.present? && ![ApiKey::ReservedDataSources.PRODUCT, ApiKey::ReservedDataSources.MARKETING].include?(for_data_source)
        errors.add(:for_data_source, "must be one of: #{ApiKey::ReservedDataSources.PRODUCT}, #{ApiKey::ReservedDataSources.MARKETING}")
      end
    end
  end
end