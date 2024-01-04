module ProfileEnrichers
  module UserEnrichers
    class Octolane
      def try_to_enrich!
        HTTParty.post('https://enrich.octolane.com/v1/person-by-email', 
          headers: {
            'Content-Type' => 'application/json',
            'x-api-key' => ENV['OCTOLANE_API_KEY']
          },
          body: {
            email: @user_profile.email,
            name: @user_profile.full_name,
          }
        )
      end
    end
  end
end