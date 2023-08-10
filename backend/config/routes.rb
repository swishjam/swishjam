Rails.application.routes.draw do
  post '/auth/register' => 'users#create'
  post '/auth/login' => 'sessions#create'

  get '/oauth/stripe/callback' => 'oauth/stripe#callback'

  namespace :api do
    namespace :v1 do

      get :capture, to: 'capture#process_data'
      post :capture, to: 'capture#process_data'

      resources :organizations, only: [] do
      end

      resources :users, only: [] do
        collection do
          get :count
          get :timeseries
        end
      end

      resources :sessions, only: [] do
        collection do
          get :count
          get :timeseries
          get :referrers
        end
      end

      resources :page_hits, only: [] do
        collection do
          get :top_pages
        end
      end
      
      resources :events, only: [] do
        collection do
          get :feed
        end
      end

      resources :billing_data_snapshots, only: [:index]

      resources :integrations, only: [:destroy, :index] do
        member do
          patch :enable
          patch :disable
        end
      end
      
    end
  end
end
