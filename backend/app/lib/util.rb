class Util
  class << self
    def deep_to_ostruct(obj)
      return obj unless obj.is_a?(Hash)
      OpenStruct.new(obj.map { |k, v| [k, deep_to_ostruct(v)] }.to_h)
    end
  end
end