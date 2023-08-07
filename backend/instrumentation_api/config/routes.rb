Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get '/capture', to: 'capture#process_data'
      post '/capture', to: 'capture#process_data'
    end
  end
end
