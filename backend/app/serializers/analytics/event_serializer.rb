module Analytics
  class EventSerializer < ActiveModel::Serializer
    attributes :uuid, :name, :properties, :occurred_at, :ingested_at
  end
end