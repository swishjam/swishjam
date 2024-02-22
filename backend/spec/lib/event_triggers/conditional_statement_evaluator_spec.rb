require 'spec_helper'

describe EventTriggers::ConditionalStatementsEvaluator do
  describe '#event_meets_all_conditions?' do
    before do
      @prepared_event = Ingestion::ParsedEventFromIngestion.new(
        uuid: '1234',
        swishjam_api_key: 'swish_7890',
        name: 'page_view',
        occurred_at: 5.minutes.ago,
        properties: {
          'email' => 'jenny@swishjam.com',
          'url' => 'https://swishjam.com',
          'the_number_10' => '10'
        },
        user_properties: {
          'email' => 'user-properties-email@swishjam.com'
        }
      )
    end

    it 'returns true if its a `contains` condition and the event property contains the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'contains',
          'property_value' => 'swishjam',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `contains` condition and the event property does not contain the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'contains',
          'property_value' => 'google.com',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'returns true if its a `does_not_contain` condition and the event property does not contain the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'does_not_contain',
          'property_value' => 'google.com',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `does_not_contain` condition and the event property contains the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'does_not_contain',
          'property_value' => 'swishjam',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'returns true if its a `equals` condition and the event property equals the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'equals',
          'property_value' => 'JENNY@SWishjam.com',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `equals` condition and the event property does not equal the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'equals',
          'property_value' => 'collin@swishjam.com'
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'returns true if its a `ends_with` condition and the event property ends with the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'ends_with',
          'property_value' => 'SWISHJAM.com  ', # caps and trailing whitespace
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `ends_with` condition and the event property does not end with the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'ends_with',
          'property_value' => 'google.com',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'returns true if its a `does_not_end_with` condition and the event property does not end with the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'does_not_end_with',
          'property_value' => 'google.com',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `does_not_end_with` condition and the event property ends with the specified value' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'does_not_end_with',
          'property_value' => 'swishjam.com',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'returns true if its a `is_defined` condition and the event property is defined' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'is_defined',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `is_defined` condition and the event property is not defined' do
      conditional_statements = [
        {
          'property' => 'non_existent_property',
          'condition' => 'is_defined',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'returns true if its a `is_not_defined` condition and the event property is not defined' do
      conditional_statements = [
        {
          'property' => 'non_existent_property',
          'condition' => 'is_not_defined',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `is_not_defined` condition and the event property is defined' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'is_not_defined',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'returns true if its a `greater_than` condition and the event property is greater than the specified value' do
      conditional_statements = [
        {
          'property' => 'the_number_10',
          'condition' => 'greater_than',
          'property_value' => '9',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `greater_than` condition and the event property is not greater than the specified value' do
      conditional_statements = [
        {
          'property' => 'the_number_10',
          'condition' => 'greater_than',
          'property_value' => '10',
        },
        {
          'property' => 'the_number_10',
          'condition' => 'greater_than',
          'property_value' => '9',
        },
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'returns true if its a `less_than` condition and the event property is less than the specified value' do
      conditional_statements = [
        {
          'property' => 'the_number_10',
          'condition' => 'less_than',
          'property_value' => '11',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `less_than` condition and the event property is not less than the specified value' do
      conditional_statements = [
        {
          'property' => 'the_number_10',
          'condition' => 'less_than',
          'property_value' => '10',
        },
        {
          'property' => 'the_number_10',
          'condition' => 'less_than',
          'property_value' => '9',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'returns true if its a `greater_than_or_equal_to` condition and the event property is greater than or equal to the specified value' do
      conditional_statements = [
        {
          'property' => 'the_number_10',
          'condition' => 'greater_than_or_equal_to',
          'property_value' => '10',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `greater_than_or_equal_to` condition and the event property is not greater than or equal to the specified value' do
      conditional_statements = [
        {
          'property' => 'the_number_10',
          'condition' => 'greater_than_or_equal_to',
          'property_value' => '11',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'returns true if its a `less_than_or_equal_to` condition and the event property is not less than or equal to the specified value' do
      conditional_statements = [
        {
          'property' => 'the_number_10',
          'condition' => 'less_than_or_equal_to',
          'property_value' => '10',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'returns false if its a `less_than_or_equal_to` condition and the event property is not less than or equal to the specified value' do
      conditional_statements = [
        {
          'property' => 'the_number_10',
          'condition' => 'less_than_or_equal_to',
          'property_value' => '9',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(false)
    end

    it 'raises an error if an invalid condition is provided' do
      conditional_statements = [
        {
          'property' => 'email',
          'condition' => 'invalid_condition',
          'property_value' => 'swishjam.com',
        }
      ]
      expect { described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements) }.to raise_error(EventTriggers::ConditionalStatementsEvaluator::InvalidConditionalStatement)
    end

    it 'correctly references the event\'s `user_properties` when the conditional statement\'s property value starts with `user.`' do
      conditional_statements = [
        {
          'property' => 'user.email',
          'condition' => 'equals',
          'property_value' => 'user-properties-email@swishjam.com'
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end

    it 'correctly references the event\'s `properties` when the conditional statement\'s property value starts with `event.`' do
      conditional_statements = [
        {
          'property' => 'event.email',
          'condition' => 'equals',
          'property_value' => 'jenny@swishjam.com',
        }
      ]
      expect(described_class.new(@prepared_event).event_meets_all_conditions?(conditional_statements)).to eq(true)
    end
  end
end