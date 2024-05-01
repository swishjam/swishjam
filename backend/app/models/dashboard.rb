class Dashboard < Transactional
  belongs_to :workspace
  belongs_to :created_by_user, class_name: User.to_s
  has_many :dashboard_data_visualizations
  has_and_belongs_to_many :data_visualization, join_table: :dashboard_data_visualizations
end