class Transactional < ApplicationRecord
  self.abstract_class = true
  connects_to database: { writing: :transactional, reading: :transactional }
end