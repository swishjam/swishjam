module Api
  module V1
    module Organizations
      class PageViewsController < BaseController
        def index
          url_hosts = current_workspace.url_segments.pluck(:url_host)
          querier = ClickHouseQueries::Organizations::PageViews::Counts.new(
            current_workspace.public_key,
            organization_profile_id: @organization.id,
            url_hosts: url_hosts,
            start_time: start_timestamp,
            end_time: end_timestamp
          )
          render json: querier.get
        end
      end
    end
  end
end