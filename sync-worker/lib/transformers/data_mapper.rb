require_relative './base'
require 'byebug'

module Transformers
  class DataMapper < Base
    def self.format!(record, attributes_to_capture)
      record
      # return record if attributes_to_capture.is_a?(String) && ['all', nil].include?(attributes_to_capture)
      # raise "NOT IMPLEMENTED YET"
    end
  end
end