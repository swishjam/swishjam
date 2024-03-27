module Integrations
  module Destinations
    class Slack < Integration
      before_create :set_team_id

      def self.find_by_team_id(team_id)
        find_by_config_attribute('team_id', team_id)
      end

      def api_client
        @client ||= ::Slack::Client.new(access_token)
      end

      def access_token
        config['access_token']
      end
      
      def team_id
        config['team_id']
      end

      private

      def set_team_id
        config['team_id'] = api_client.list_teams[0]['id']
      end
    end
  end
end