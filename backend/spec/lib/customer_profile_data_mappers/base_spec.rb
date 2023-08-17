require 'spec_helper'

describe CustomerProfileDataMappers::Base do
  before do
    setup_test_data
    @different_swishjam_organization = FactoryBot.create(:swishjam_organization, name: 'Different Swishjam Organization')
    @mapper = CustomerProfileDataMappers::Base.new(@swishjam_organization)
  end

  describe '#find_organization_by_metadata' do
    it 'returns nil if keys_or_key is blank' do
      expect(@mapper.send(:find_organization_by_metadata, nil, 'value')).to be(nil)
    end

    it 'returns nil if values_or_value is blank' do
      expect(@mapper.send(:find_organization_by_metadata, 'key', nil)).to be(nil)
    end

    it 'returns nil if no organization is found' do
      expect(@mapper.send(:find_organization_by_metadata, 'key', 'value')).to be(nil)
    end

    it 'returns nil if multiple organizations are found' do
      org_1 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization)
      org_2 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization)
      FactoryBot.create(:organization_metadata, parent: org_1, key: 'some_kind_of_key', value: 'some_kind_of_value')
      FactoryBot.create(:organization_metadata, parent: org_2, key: 'some_kind_of_key', value: 'some_kind_of_value')
      expect(@mapper.send(:find_organization_by_metadata, 'some_kind_of_key', 'some_kind_of_value')).to be(nil)
    end

    it 'returns the organization if one is found passing a single key and value' do
      org_1 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, name: 'Some Name')
      org_2 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, name: 'Different Name')
      FactoryBot.create(:organization_metadata, parent: org_1, key: 'some_kind_of_key', value: 'some_kind_of_value')
      FactoryBot.create(:organization_metadata, parent: org_2, key: 'some_kind_of_key', value: 'a_different_value')
      expect(@mapper.send(:find_organization_by_metadata, 'some_kind_of_key', 'some_kind_of_value')).to eq(org_1)
    end

    it 'returns the organization if one is found passing multiple keys and values' do
      org_1 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, name: 'Some Name')
      org_2 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, name: 'Different Name')
      FactoryBot.create(:organization_metadata, parent: org_1, key: 'some_kind_of_key', value: 'some_kind_of_value')
      FactoryBot.create(:organization_metadata, parent: org_2, key: 'some_kind_of_key', value: 'a_different_value')
      expect(@mapper.send(:find_organization_by_metadata, ['some_kind_of_key', 'a_different_key', 'another_key'], ['some_kind_of_value', 'a_very_different_value', 'a_last_value'])).to eq(org_1)
    end

    it 'finds the matching organization\'s metadata without case sensitivity' do
      org_1 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, name: 'Some Name')
      org_2 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, name: 'Different Name')
      FactoryBot.create(:organization_metadata, parent: org_1, key: 'SOME_KIND_OF_KEY', value: 'SOME_kind_OF_vAlUe')
      FactoryBot.create(:organization_metadata, parent: org_2, key: 'some_kind_of_key', value: 'a_different_value')
      expect(@mapper.send(:find_organization_by_metadata, ['SOME_kind_OF_KeY', 'a_different_key', 'another_key'], ['sOmE_kInD_oF_vAlUe', 'a_very_different_value', 'a_last_value'])).to eq(org_1)
    end
  end

  describe '#find_organization_by_domain' do
    it 'returns nil if domain is blank' do
      expect(@mapper.send(:find_organization_by_domain, nil)).to be(nil)
    end

    it 'returns nil if domain is gmail.com' do
      expect(@mapper.send(:find_organization_by_domain, 'gmail.com')).to be(nil)
    end

    it 'returns nil if no organization is found' do
      expect(@mapper.send(:find_organization_by_domain, 'fake_domain.com')).to be(nil)
    end

    it 'returns nil if multiple organizations are found' do
      org_1 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, url: 'multiple-matches.com')
      org_2 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, url: 'multiple-matches.com')
      expect(@mapper.send(:find_organization_by_domain, 'multiple-matches.com')).to be(nil)
    end

    it 'returns the organization if one is found with a matching URL' do
      org_1 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, url: 'a-match.com')
      org_2 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, url: 'different-matches.com')
      expect(@mapper.send(:find_organization_by_domain, 'a-match.com')).to eq(org_1)
    end

    it 'returns the organization if one is found that contains the URL' do
      org_1 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, url: 'a-match.com')
      org_2 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, url: 'different-matches.com')
      expect(@mapper.send(:find_organization_by_domain, 'match.com')).to eq(org_1)
    end
  end

  describe '#find_organization_by_name' do
    it 'returns nil if name is blank' do
      expect(@mapper.send(:find_organization_by_name, nil)).to be(nil)
    end

    it 'returns nil if no organization is found' do
      expect(@mapper.send(:find_organization_by_name, 'fake name')).to be(nil)
    end

    it 'returns nil if multiple organizations are found' do
      org_1 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, name: 'Some Name')
      org_2 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, name: 'Some Name')
      expect(@mapper.send(:find_organization_by_name, 'Some Name')).to be(nil)
    end

    it 'returns the organization if one is found with a matching name' do
      org_1 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, name: 'Some Name')
      org_2 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, name: 'Different Name')
      expect(@mapper.send(:find_organization_by_name, 'Some Name')).to eq(org_1)
    end

    it 'returns the organization if one is found with a matching name without case sensitivity' do
      org_1 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, name: 'Some Name')
      org_2 = FactoryBot.create(:analytics_organization, swishjam_organization: @swishjam_organization, name: 'Different Name')
      expect(@mapper.send(:find_organization_by_name, 'sOmE nAmE')).to eq(org_1)
    end
  end
end