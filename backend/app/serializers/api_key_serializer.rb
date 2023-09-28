class ApiKeySerializer < ActiveModel::Serializer
  attributes :id, :data_source, :public_key, :enabled, :created_at, :updated_at
end