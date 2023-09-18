module WebEventProcessors
  class AnalyticsFamilyDecider
    class UnrecognizedEventSourceError < StandardError; end

    def self.decide(workspace, event)
      return decide_for_web_event(workspace, event) if event.source == 'web'
      raise UnrecognizedEventSourceError, "Unrecognized event source: #{event.source}"  
    end

    private

    def self.decide_for_web_event(workspace, event)
      url = event.properties[Analytics::Event::ReservedPropertyNames.URL]
      analytics_family_configuration_url_regex_match = workspace.analytics_family_configurations.find{ |configuration| url =~ Regexp.new(configuration.url_regex) }
      Rails.logger.info "analytics_family_configuration_url_regex_match for #{url} is: #{analytics_family_configuration_url_regex_match.inspect}"
      return if analytics_family_configuration_url_regex_match.nil?
      analytics_family_configuration_url_regex_match.class.clickhouse_formatted_family_name
    end
  end
end