module Api
  module V1
    module Organizations
      class PageHitsController < BaseController
        def index
          page_hit_counts = Analytics::PageHit.joins(:session)
                                          .where(analytics_sessions: { analytics_organization_id: @organization.id })
                                          .group('analytics_page_hits.url_host, analytics_page_hits.url_path')
                                          .limit(params[:limit] || 10)
                                          .select('analytics_page_hits.url_host, analytics_page_hits.url_path, COUNT(*) as view_count')
                                          .order('view_count DESC')
          render json: page_hit_counts
        end
      end
    end
  end
end