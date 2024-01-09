class ApiKey < Transactional
  class ReservedDataSources
    SOURCES = %i[product marketing stripe resend cal_com google_search_console intercom github].freeze
    
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
  # validate :one_enabled_key_per_data_source, on: [:create, :update]
  before_validation { self.enabled = true if self.enabled.nil? }
  before_validation { self.data_source = self.data_source&.downcase }
  # I don't think this is ever called because of the insert_all in generate_default_keys_for
  before_validation :generate_keys, on: :create 

  scope :enabled, -> { where(enabled: true) }
  scope :disabled, -> { where(enabled: false) }

  def self.generate_default_keys_for(workspace)
    return false if workspace.api_keys.any?
    workspace.api_keys.insert_all([
      { data_source: ReservedDataSources.PRODUCT , public_key: generate_key("public--swishjam_prdct", :public_key), private_key: generate_key("private--swishjam_prdct", :private_key), enabled: true, created_at: Time.current, updated_at: Time.current }, 
      { data_source: ReservedDataSources.MARKETING, public_key: generate_key("public--swishjam_web", :public_key), private_key: generate_key("private--swishjam_web", :private_key), enabled: true, created_at: Time.current, updated_at: Time.current },
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

  def self.generate_key(prefix, type)
    key = [prefix, SecureRandom.hex(8)].join('-')
    return key unless ApiKey.exists?("#{type}": key)
    generate_key(prefix)
  end

  def enabled?
    enabled
  end
  
  private

  def generate_keys
    prefix = {
      ReservedDataSources.PRODUCT => 'swishjam_prdct',
      ReservedDataSources.MARKETING => 'swishjam_web',
    }[self.data_source] || "swishjam_#{data_source[0..5]}"
    self.public_key = self.class.generate_key(prefix, :public_key)
    self.private_key = self.class.generate_key(prefix, :private_key)
  end

  def one_enabled_key_per_data_source
    if enabled && ApiKey.where(data_source: data_source, enabled: true).where.not(id: id).exists?
      errors.add(:base, "Another enabled API key exists for this data source: #{data_source}")
    end
  end
end