class AnalyticsFamilyConfigurationSerializer < ActiveModel::Serializer
  attributes :id, :type, :friendly_name, :description, :url_regex, :priority, :created_at

  def friendly_name
    object.class.friendly_name
  end
end