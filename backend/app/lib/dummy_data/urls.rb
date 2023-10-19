module DummyData
  class Urls
    class << self
      def prompt_user_for_urls_to_generate
        prompter = TTY::Prompt.new
        should_use_specific_urls = prompter.select("Would you like to specify the URLs of the generated data?", ['Yes', 'No, generate random values']){ |q| q.default 'Yes' }
        if should_use_specific_urls == 'Yes'
          provided_url = prompter.ask('Enter the host URL for the generated data:'){ |q| q.required true }
          provided_url = provided_url.starts_with?('http') ? provided_url : "https://#{provided_url}"
          host_url = URI.parse(provided_url).host

          should_use_specific_url_paths = prompter.select("Would you like to specify the URL paths for #{host_url}'s generated data?", ['Yes', 'No, generate random values']){ |q| q.default 'Yes' }
          if should_use_specific_url_paths == 'Yes'
            provided_paths = prompter.ask('Enter the URL paths you would like to be used for the seeded data. Separate each path with a comma.'){ |q| q.required true }
            url_paths = provided_paths.split(',').map{ |path| path.strip }
            return [host_url, url_paths]
          else
            url_paths = 10.times.map{ URI.parse(Faker::Internet.url).path }
            return [host_url, url_paths]
          end
        else
          host_url = Faker::Internet.domain_name
          url_paths = 10.times.map{ URI.parse(Faker::Internet.url).path }
          return [host_url, url_paths]
        end
      end
    end
  end
end