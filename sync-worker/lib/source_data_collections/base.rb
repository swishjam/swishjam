module SourceDataCollections
  class Base
    include Enumerable
    
    class << self
      attr_accessor :attributes
    end
  end
end