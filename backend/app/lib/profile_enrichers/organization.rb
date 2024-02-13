module ProfileEnrichers
  class Organization
    ENRICHER_DICT = {
      'octolane' => ProfileEnrichers::OrganizationEnrichers::Octolane,
      'people_data_labs' => ProfileEnrichers::OrganizationEnrichers::PeopleDataLabs,
    }

    def initialize(organization_profile, enricher: 'octolane')
      @organization_profile = organization_profile
      @workspace = organization_profile.workspace
      raise ArgumentError, "Invalid enricher provided: #{enricher}, must be one of #{ENRICHER_DICT.keys.join(', ')}." if !ENRICHER_DICT.keys.include?(enricher)
      @enricher = enricher
    end

    def try_to_enrich_profile_if_necessary!
      return false if !@workspace.settings.should_enrich_organization_profile_data?
      return false if @organization_profile.enriched_data.present?
      
      enricher_klass = ENRICHER_DICT[@enricher]
      enricher_klass.new(@organization_profile).try_to_enrich! 
    end
  end
end