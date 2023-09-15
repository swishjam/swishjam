require 'sidekiq/web'

Rails.application.routes.draw do
  Sidekiq::Web.use Rack::Auth::Basic do |username, password|
    # Protect against timing attacks:
    # - See https://codahale.com/a-lesson-in-timing-attacks/
    # - See https://thisdata.com/blog/timing-attacks-against-string-comparison/
    # - Use & (do not use &&) so that it doesn't short circuit.
    # - Use digests to stop length information leaking (see also ActiveSupport::SecurityUtils.variable_size_secure_compare)
    ActiveSupport::SecurityUtils.secure_compare(::Digest::SHA256.hexdigest(username), ::Digest::SHA256.hexdigest(ENV["SIDEKIQ_USERNAME"])) &
      ActiveSupport::SecurityUtils.secure_compare(::Digest::SHA256.hexdigest(password), ::Digest::SHA256.hexdigest(ENV["SIDEKIQ_PASSWORD"]))
  end if Rails.env.production?
  mount Sidekiq::Web => '/sidekiq'

  post '/auth/register' => 'users#create'
  post '/auth/login' => 'sessions#create'
  post '/auth/logout' => 'sessions#destroy'

  get '/oauth/stripe/callback' => 'oauth/stripe#callback'

  get :ping, to: 'application#ping'

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
        # collection do
        #   get :count
        #   get :timeseries
        # end
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
        resources :page_views, only: [:index], controller: :'organizations/page_views'
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

      resources :page_views, only: [:index]
      
      resources :events, only: [], param: :name do
        collection do
          get :feed
          get :unique
        end
        member do
          get :timeseries
          get :unique_properties
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

      resources :analytics_family_configurations, only: [:index, :create, :destroy]
    end
  end
end
