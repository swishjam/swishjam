class ApiKey < Transactional
  class ReservedDataSources
    SOURCES = %i[product marketing integrations blog docs].freeze
    
    class << self
      SOURCES.each do |source|
        define_method("#{source.to_s.upcase}") do
          source.downcase.to_s
        end
      end

      def all
        SOURCES.collect{ |source| self.send(source.to_s.upcase) }
      end
    end
  end

  belongs_to :workspace
  
  validates :data_source, presence: true
  validates :public_key, presence: true, uniqueness: true
  validates :private_key, presence: true, uniqueness: true
  validates :enabled, presence: true
  validate :one_enabled_key_per_data_source, on: [:create, :update]
  
  before_validation { self.enabled = true if self.enabled.nil? }
  before_validation { self.data_source = self.data_source&.downcase }
  before_validation :generate_keys, on: :create

  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }

  def self.generate_default_keys_for(workspace)
    workspace.api_keys.create!([ 
      { data_source: ReservedDataSources.PRODUCT }, 
      { data_source: ReservedDataSources.MARKETING },
      { data_source: ReservedDataSources.INTEGRATIONS },
    ])
  end

  def self.for_data_source(data_source)
    enabled.find_by(data_source: data_source)
  end

  def self.for_data_source!(data_source)
    enabled.find_by!(data_source: data_source)
  rescue ActiveRecord::RecordNotFound => e
    raise ActiveRecord::RecordNotFound, "No enabled API key found for data source: #{data_source}"
  end

  def enabled?
    enabled
  end
  
  private

  def generate_keys
    prefix = {
      'product' => 'swishjam_prdct',
      'marketing' => 'swishjam_mrkt',
      'blog' => 'swishjam_blg',
      'docs' => 'swishjam_dcs',
    }[self.data_source] || "swishjam_#{data_source[0..5]}"
    self.public_key = generate_key(prefix, :public_key)
    self.private_key = generate_key(prefix, :private_key)
  end

  def generate_key(prefix, type)
    key = [prefix, SecureRandom.hex(8)].join('-')
    return key unless ApiKey.exists?("#{type}": key)
    generate_key(prefix)
  end

  def one_enabled_key_per_data_source
    return unless enabled
    return unless ApiKey.exists?(data_source: data_source, enabled: true)
    errors.add(:base, "Only one key per data source is allowed (#{data_source})")
  end
end