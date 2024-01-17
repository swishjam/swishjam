require 'spec_helper'

describe EventTriggers::ConditionalStatementsEvaluator do
  describe '#event_meets_all_conditions?' do
    before do
      @event_json = {
      'uuid' => '1234',
      'swishjam_api_key' => 'swish_7890',
      'name' => 'page_view',
      'occurred_at' => 5.minutes.ago,
      'properties' => {
        'email' => 'jenny@swishjam.com',
        'url' => 'https://swishjam.com',
      }
    }
    end

    it 'returns true if its a `contains` condition and the event property contains the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'contains',
          'property_value' => 'swishjam',
        }
      ]
      expect(described_class.new(@event_json).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `contains` condition and the event property does not contain the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'contains',
          'property_value' => 'google.com',
        }
      ]
      expect(described_class.new(@event_json).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'returns true if its a `does_not_contain` condition and the event property does not contain the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'does_not_contain',
          'property_value' => 'google.com',
        }
      ]
      expect(described_class.new(@event_json).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `does_not_contain` condition and the event property contains the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'does_not_contain',
          'property_value' => 'swishjam',
        }
      ]
      expect(described_class.new(@event_json).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'returns true if its a `equals` condition and the event property equals the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'equals',
          'property_value' => 'JENNY@SWishjam.com',
        }
      ]
      expect(described_class.new(@event_json).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `equals` condition and the event property does not equal the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'equals',
          'property_value' => 'collin@swishjam.com'
        }
      ]
      expect(described_class.new(@event_json).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'returns true if its a `ends_with` condition and the event property ends with the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'ends_with',
          'property_value' => 'SWISHJAM.com  ', # caps and trailing whitespace
        }
      ]
      expect(described_class.new(@event_json).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `ends_with` condition and the event property does not end with the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'ends_with',
          'property_value' => 'google.com',
        }
      ]
      expect(described_class.new(@event_json).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'returns true if its a `does_not_end_with` condition and the event property does not end with the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'does_not_end_with',
          'property_value' => 'google.com',
        }
      ]
      expect(described_class.new(@event_json).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `does_not_end_with` condition and the event property ends with the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'does_not_end_with',
          'property_value' => 'swishjam.com',
        }
      ]
      expect(described_class.new(@event_json).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'raises an error if an invalid condition is provided' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'invalid_condition',
          'property_value' => 'swishjam.com',
        }
      ]
      expect { described_class.new(@event_json).event_meets_all_conditions?(conditional_statements) }.to raise_error(EventTriggers::ConditionalStatementsEvaluator::InvalidConditionalStatement)
    end
  end
end