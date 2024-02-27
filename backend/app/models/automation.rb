class Automation < Transactional
  belongs_to :workspace
  belongs_to :created_by_user, class_name: User.to_s
  has_many :automation_steps, -> { order(:sequence_index) }, dependent: :destroy
  accepts_nested_attributes_for :automation_steps, allow_destroy: true
end

