Rails.application.routes.draw do
  post '/auth/register' => 'users#create'
  post '/auth/login' => 'sessions#create'
  post '/auth/logout' => 'sessions#destroy'

  get '/oauth/stripe/callback' => 'oauth/stripe#callback'

  namespace :api do
    namespace :v1 do

      get :capture, to: 'capture#process_data'
      post :capture, to: 'capture#process_data'

      resources :workspace, only: [] do
        collection do
          patch '/update', to: 'workspaces#update'
        end
      end

      resources :organizations, only: [:index, :show] do
        member do
          get :events
          get :users
        end
        collection do
          # get :count
          # get :timeseries
        end
        resources :users, only: [:index], controller: :'organizations/users' do
          collection do
            get :top
            get :active
          end
        end
        resources :sessions, only: [:index], controller: :'organizations/sessions' do
          collection do
            get :timeseries
          end
        end
        resources :page_hits, only: [:index], controller: :'organizations/page_hits'
        resources :billing, only: [:index], controller: :'organizations/billing'
      end

      resources :users, only: [:index, :show] do
        collection do
          get :count
          get :timeseries
          get :active
        end
        resources :events, only: [:index], controller: :'users/events'
        resources :organizations, only: [:index], controller: :'users/organizations'
        resources :page_views, only: [:index], controller: :'users/page_views'
        resources :sessions, only: [:index], controller: :'users/sessions' do
          collection do
            get :timeseries
          end
        end
      end

      resources :sessions, only: [] do
        collection do
          get :count
          get :timeseries
          get :referrers
          get :demographics
        end
      end

      resources :page_hits, only: [:index]
      
      resources :events, only: [] do
        collection do
          get :feed
        end
      end

      resources :billing_data_snapshots, only: [:index]

      resources :customer_subscriptions, only: [:index]

      resources :integrations, only: [:destroy, :index] do
        member do
          patch :enable
          patch :disable
        end
      end

      resources :url_segments, only: [:index, :create, :destroy]
    end
  end
end
