class DataVisualization < Transactional
  belongs_to :created_by_user, class_name: User.to_s
  belongs_to :workspace
  has_many :dashboard_data_visualizations
  has_and_belongs_to_many :dashboards, join_table: :dashboard_data_visualizations

  validates :visualization_type, presence: true, inclusion: { in: %w[BarChart AreaChart BarList ValueCard PieChart] }
end