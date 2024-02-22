require 'spec_helper'

describe EventVariableResolver do
  describe '#self.interpolated_text' do
    it "should return the text with the variables replaced with the event property values" do
      un_resolved_test = "Hello {name}!"
      prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '1', 
        swishjam_api_key: 'xyz', 
        name: 'page_view', 
        properties: { name: "John" },
        occurred_at: Time.current, 
      )
      resolved_test = EventVariableResolver.interpolated_text(un_resolved_test, prepared_event)
      expect(resolved_test).to eq("Hello John!")
    end

    it "should return the text with the variables replaced with the event's user property values when the variable starts with `event.`" do
      un_resolved_test = "Hello {event.name}!"
      prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '1', 
        swishjam_api_key: 'xyz', 
        name: 'page_view', 
        properties: { name: "John" },
        occurred_at: Time.current, 
      )
      resolved_test = EventVariableResolver.interpolated_text(un_resolved_test, prepared_event)
      expect(resolved_test).to eq("Hello John!")
    end

    it "should return the text with the variables replaced with the event's user property values when the variable starts with `user.`" do
      un_resolved_test = "Hello {user.name}!"
      prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '1', 
        swishjam_api_key: 'xyz', 
        name: 'page_view', 
        properties: { name: "no" },
        user_properties: { name: "John" },
        occurred_at: Time.current, 
      )
      resolved_test = EventVariableResolver.interpolated_text(un_resolved_test, prepared_event)
      expect(resolved_test).to eq("Hello John!")
    end

    it "should return the first matching resolved variable value when there are multiple variables in the text" do
      un_resolved_test = "Hello {event.username || user.email || 'there'}!"
      prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '1',
        swishjam_api_key: 'xyz',
        name: 'page_view',
        properties: { email: 'not-this-one!' },
        user_properties: { email: 'this-one@gmail.com' },
        occurred_at: Time.current,
      )
      resolved_test = EventVariableResolver.interpolated_text(un_resolved_test, prepared_event)
      expect(resolved_test).to eq("Hello this-one@gmail.com!")
    end

    it "should return the string variable value when the variable is wrapped in single or double quotes" do
      un_resolved_test = "Hello {event.nilProperty || user.nope || 'there'}!"
      prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '1',
        swishjam_api_key: 'xyz',
        name: 'page_view',
        properties: { nilProperty: nil },
        occurred_at: Time.current,
      )
      resolved_test = EventVariableResolver.interpolated_text(un_resolved_test, prepared_event)
      expect(resolved_test).to eq("Hello there!")
    end

    it 'should support both single and double brackets' do
      un_resolved_test = "Hello {{event.nilProperty || user.nope || 'there'}}, { event.singleBracketVariable }"
      prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '1',
        swishjam_api_key: 'xyz',
        name: 'page_view',
        properties: { nilProperty: nil,singleBracketVariable: 'resolved!' },
        occurred_at: Time.current,
      )
      resolved_test = EventVariableResolver.interpolated_text(un_resolved_test, prepared_event)
      expect(resolved_test).to eq("Hello there, resolved!")
    end
  end
end