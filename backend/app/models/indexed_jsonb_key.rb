class IndexedJsonbKey < Transactional
  belongs_to :parent, polymorphic: true
end