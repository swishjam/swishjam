module Integrations
  class CalCom < Integration
    self.data_source = ApiKey::ReservedDataSources.CAL_COM

    def self.friendly_name
      'Cal.com'
    end
  end
end