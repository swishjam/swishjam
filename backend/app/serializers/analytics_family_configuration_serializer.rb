class AnalyticsFamilyConfigurationSerializer < ActiveModel::Serializer
  attributes :id, :friendly_name, :description, :url_regex, :created_at

  def friendly_name
    object.class.friendly_name
  end
end