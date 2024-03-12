module JsonbMethods
  extend ActiveSupport::Concern
  class MissingConfigValueError < StandardError; end

  class_methods do
    def define_jsonb_methods(jsonb_column, *methods)
      methods.flatten.each do |method|
        if method.is_a?(Hash)
          method.each do |json_key, method|
            self.define_jsonb_methods_for_key(jsonb_column, method, json_key)
          end
        else
          self.define_jsonb_methods_for_key(jsonb_column, method, method)
        end
      end
    end

    def required_jsonb_fields(jsonb_column, *fields)
      self.validate do
        fields.each do |field|
          self.errors.add(jsonb_column, "is missing required field: #{field}") unless self.send(jsonb_column).try(:[], field.to_s).present?
        end
      end
    end

    private

    def define_jsonb_methods_for_key(jsonb_column, method_to_define, jsonb_key)
      method_to_define = method_to_define.to_s.downcase.gsub(' ', '_').gsub('.', '_').to_sym
      jsonb_key = jsonb_key.to_s

      define_method(method_to_define) do
        self.send(jsonb_column).try(:[], jsonb_key)
      end
      alias_method :"#{jsonb_column}_#{method_to_define}", method_to_define
      
      define_method(:"#{method_to_define}=") do |value|
        self.send("#{jsonb_column}=", (self.send(jsonb_column) || {}).merge(jsonb_key => value))
      end
      alias_method :"#{jsonb_column}_#{method_to_define}=", :"#{method_to_define}="
      
      define_method(:"#{method_to_define}!") do
        val = self.send(method_to_define)
        return val if val.present?
        raise MissingConfigValueError, "Missing required #{jsonb_column} field: #{jsonb_key}"
      end
      alias_method :"#{jsonb_column}_#{method_to_define}!", :"#{method_to_define}!"

      define_method(:"#{method_to_define}_present?") do
        self.send(jsonb_column).try(:[], jsonb_key.to_s).present?
      end
      alias_method :"#{jsonb_column}_#{method_to_define}_present?", :"#{method_to_define}_present?"
    end
  end

  instance_methods do
    # nothing?
  end
end