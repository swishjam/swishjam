class Util
  class << self
    def deep_to_ostruct(obj)
      return obj unless obj.is_a?(Hash)
      OpenStruct.new(obj.map { |k, v| [k, deep_to_ostruct(v)] }.to_h)
    end
  end
end

# TODO: for future use, if/when we want to implement a strict OpenStruct
# class StrictOpenStruct < OpenStruct
#   def method_missing(mid, *args) # :nodoc:
#     mname = mid.id2name
#     len = args.length
#     if mname.chomp!('=')
#       if len != 1
#         raise ArgumentError, "wrong number of arguments (#{len} for 1)", caller(1)
#       end
#       modifiable[new_ostruct_member(mname)] = args[0]
#     elsif len == 0
#       raise NoMethodError, "undefined method `#{mname}' for #{self}", caller(1) unless @table.key?(mname)
#       @table[mname]
#     else
#       raise NoMethodError, "undefined method `#{mname}' for #{self}", caller(1)
#     end
#   end
# end