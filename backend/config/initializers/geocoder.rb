Geocoder.configure(cache: Geocoder::CacheStore::Generic.new(Rails.cache, {}))

# Geocoder.configure(
#   timeout: 2,

#   yandex: {
#     api_key: "...",
#     timeout: 5
#   },

#   baidu: {
#     api_key: "..."
#   },

#   maxmind: {
#     api_key: "...",
#     service: :omni
#   }
# )