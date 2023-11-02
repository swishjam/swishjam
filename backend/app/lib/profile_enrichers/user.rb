module ProfileEnrichers
  class User
    def initialize(user_profile)
      @user_profile = user_profile
      @workspace = user_profile.workspace
    end

    def try_to_enrich_profile_if_necessary!
      return false if !@workspace&.settings&.should_enrich_user_profile_data?
      return false if @user_profile.enrichment_data.present?
      params = build_enrichment_params
      return false if params.empty?
      enrichment_attempt = UserProfileEnrichmentAttempt.new(
        workspace: @workspace,
        analytics_user_profile: @user_profile,
        attempted_payload: params
      )
      enrichment_results = fetch_enrichment_data(params)
      if enrichment_results['status'] == 200
        user_profile_enrichment_data = create_enrichment_data(enrichment_results)
        enrichment_attempt.user_profile_enrichment_data = user_profile_enrichment_data
        enrichment_attempt.successful = true
        enrichment_attempt.save!
        user_profile_enrichment_data
      else
        enrichment_attempt.successful = false
        enrichment_attempt.save!
        false
      end
    end

    private

    def build_enrichment_params
      params = {}
      params[:email] = @user_profile.email if !@user_profile.email.blank?
      params[:first_name] = @user_profile.first_name if !@user_profile.first_name.blank?
      params[:last_name] = @user_profile.last_name if !@user_profile.last_name.blank?
      params
    end

    def create_enrichment_data(enrichment_results)
      UserProfileEnrichmentData.create!(
        workspace: @workspace,
        analytics_user_profile: @user_profile,
        match_likelihood: enrichment_results['likelihood'],
        first_name: enrichment_results.dig('data', 'first_name'),
        last_name: enrichment_results.dig('data', 'last_name'),
        linkedin_url: enrichment_results.dig('data', 'linkedin_url'),
        twitter_url: enrichment_results.dig('data', 'twitter_url'),
        github_url: enrichment_results.dig('data', 'github_url'),
        work_email: enrichment_results.dig('data', 'work_email'),
        personal_email: enrichment_results.dig('data', 'recommended_personal_email'),
        industry: enrichment_results.dig('data', 'industry'),
        job_title: enrichment_results.dig('data', 'job_title'),
        company_name: enrichment_results.dig('data', 'job_company_name'),
        company_website: enrichment_results.dig('data', 'job_company_website'),
        company_size: enrichment_results.dig('data', 'job_company_size'),
        year_company_founded: enrichment_results.dig('data', 'job_company_founded'),
        company_industry: enrichment_results.dig('data', 'job_company_industry'),
        company_linkedin_url: enrichment_results.dig('data', 'job_company_linkedin_url'),
        company_twitter_url: enrichment_results.dig('data', 'job_company_twitter_url'),
        company_location_metro: enrichment_results.dig('data', 'job_company_location_metro'),
        company_location_geo_coordinates: enrichment_results.dig('data', 'job_company_location_geo'),
      )
    end

    def fetch_enrichment_data(params)
      Peopledatalabs::Enrichment.person(params: params)
    rescue => e
      Sentry.capture_exception(e)
      Rails.logger.error "`Peopledatalabs::Enrichment.person` failed: #{e.inspect}"
      { 'status' => 500 }
    end
  end
end