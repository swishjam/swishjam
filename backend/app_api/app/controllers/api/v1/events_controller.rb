module Api
  module V1
    class EventsController < BaseController
      def feed
        limit = params[:limit] || 50
        # TODO: do we need metadata here?
        events = Event.for_instance(instance)
                        .joins(device: :user)
                        .select('events.id, events.name, events.timestamp, users.email as user_email, users.first_name as user_first_name, users.last_name as user_last_name')
                        .order(timestamp: :desc)
                        .limit(limit)
        render json: { events: events }
      end
    end
  end
end