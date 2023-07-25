require 'httparty'

class HttpRequester
  class RequestError < StandardError; end

  def self.get(url, query: {}, headers: {}, attempt_number: 1, num_retries: 3)
    response = HTTParty.get(url, query: query, headers: headers)
    if response.code == 200
      response
    elsif attempt_number <= num_retries
      puts "Failed to get #{url} on attempt #{attempt_number} (response code: #{response.code}). Retrying in #{2**attempt_number} seconds..."
      sleep(2**attempt_number)
      get(url, query: query, headers: headers, attempt_number: attempt_number + 1, num_retries: num_retries)
    else
      raise RequestError, "Failed to get #{url} after #{num_retries} attempts. Response code: #{response.code}. Response body: #{response.body}"
    end
  end
end