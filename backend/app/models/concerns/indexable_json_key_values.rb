module IndexableJsonKeyValues
  extend ActiveSupport::Concern

  class_methods do
    def find_all_by_indexed_key_value(jsonb_column, key, value)
      self.joins(:indexed_jsonb_keys).where(indexed_jsonb_keys: { column: jsonb_column, key: key, value: value })
    end

    def index_key_values!(jsonb_column, *keys)
      has_many :indexed_jsonb_keys, as: :parent, dependent: :destroy

      after_create do
        keys.each do |key|
          self.indexed_jsonb_keys.create!(column: jsonb_column, key: key, value: self.send(jsonb_column).try(:[], key))
        end
      end

      after_update do
        return unless self.saved_change_to_attribute?(jsonb_column)
        keys.each do |key|
          next unless self.saved_changes[jsonb_column].try(:[], 0).try(:[], key) || self.saved_changes[jsonb_column].try(:[], 1).try(:[], key)
          self.find_all_by_indexed_key_value(column: jsonb_column, key: key).update_all(value: self.send(jsonb_column).try(:[], key))
        end
      end

      keys.each do |key|
        define_singleton_method(:"find_all_where_#{key}_equals") do |value, column = nil|
          self.find_all_by_indexed_key_value(column || jsonb_column, key, value)
        end
        define_singleton_method(:"find_all_where_#{jsonb_column}_#{key}_equals") do |value|
          self.send(:"find_all_where_#{key}_equals", value, jsonb_column)
        end

        define_singleton_method(:"find_all_where_#{key}_is_present") do |column = nil|
          self.joins(:indexed_jsonb_keys).where(indexed_jsonb_keys: { column: column || jsonb_column, key: key })
        end
        define_singleton_method(:"find_all_where_#{jsonb_column}_#{key}_is_present") do
          self.send(:"find_all_where_#{key}_is_present", jsonb_column)
        end
      end
    end

  end
end