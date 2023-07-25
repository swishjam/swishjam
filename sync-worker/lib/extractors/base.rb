module Extractors
  class Extraction
    class InvalidExtraction < StandardError; end;
    class << self
      attr_accessor :swishjam_model
    end
  end
end