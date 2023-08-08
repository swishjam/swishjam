module Api
  module V1
    class EventsController < BaseController
      def feed
        limit = params[:limit] || 50
        events = Event.for_instance(instance)
                        .joins(:metadata, device: :user)
                        .select('events.id, events.name, events.timestamp, metadata.key, metadata.value, users.email, users.first_name, users.last_name')
                        .order(timestamp: :desc)
                        .limit(limit)
        # .select(:id, :name, :timestamp)
                        # .includes(:metadata, device: :user)
                        # .select(:id, :name, :timestamp, metadata: [:key, :value], user: [:email, :first_name, :last_name])
        render json: { events: events }
      end
    end
  end
end