Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do

      resources :sessions, only: [] do
        collection do
          get :count
        end
      end
      
    end
  end
end
