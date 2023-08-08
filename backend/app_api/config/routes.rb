Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do

      resources :sessions, only: [] do
        collection do
          get :count
        end
      end
      
      resources :events, only: [] do
        collection do
          get :feed
        end
      end

      resources :users, only: [] do
      end

      resources :organizations, only: [] do
      end
    end
  end
end
