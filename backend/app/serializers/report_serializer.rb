class ReportSerializer < ActiveModel::Serializer
  attributes :id, :name, :enabled, :cadence, :created_at, :updated_at, :sending_mechanism
end