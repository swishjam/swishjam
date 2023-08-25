class AuthSession < Transactional
  belongs_to :user
end