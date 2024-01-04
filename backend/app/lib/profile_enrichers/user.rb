module ProfileEnrichers
  class User
    ENRICHER_DICT = {
      'octolane' => ProfileEnrichers::UserEnrichers::Octolane,
      'people_data_labs' => ProfileEnrichers::UserEnrichers::PeopleDataLabs,
    }

    def initialize(user_profile, enricher: 'octolane')
      @user_profile = user_profile
      @workspace = user_profile.workspace
      raise ArgumentError, "Invalid enricher provided: #{enricher}, must be one of #{ENRICHER_DICT.keys.join(', ')}." if !ENRICHER_DICT.keys.include?(enricher)
      @enricher = enricher
    end

    def try_to_enrich_profile_if_necessary!
      return false if !@workspace.settings.should_enrich_user_profile_data?
      return false if @user_profile.enriched_data.present?
      return false if @workspace.do_not_enrich_user_profile_rules.where(email_domain: @user_profile.email_domain).exists?
      
      enricher_klass = ENRICHER_DICT[@enricher]
      enricher_klass.new(@user_profile).try_to_enrich! 
    end
  end
end