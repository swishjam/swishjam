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
  get '/oauth/slack/callback' => 'oauth/slack#callback'

  get :ping, to: 'application#ping'

  namespace :api do
    namespace :v1 do

      get :capture, to: 'capture#process_data'
      post :capture, to: 'capture#process_data'

      resources :config, only: [:index]
      resources :search, only: [:index]

      resources :workspace_settings, only: [] do
        collection do
          patch :update
        end
      end

      resources :team, only: [] do
        collection do
          get :users
          get :workspace_members
        end
      end

      resources :workspace_invitations, only: [:create, :show, :destroy], param: :invite_token do
        member do
          post :accept
        end
      end

      resources :workspace_members, only: [:destroy]

      resources :workspace, only: [] do
        collection do
          patch '/update', to: 'workspaces#update'
          patch '/update_current_workspace/:workspace_id', to: 'workspaces#update_current_workspace'
        end
      end

      ################################
      ## BEGIN ORGANIZATIONS ROUTES ##
      ################################
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
      ##############################
      ## END ORGANIZATIONS ROUTES ##
      ##############################


      ########################
      ## BEGIN USERS ROUTES ##
      ########################
      resources :users, only: [:index, :show] do
        collection do
          get :active
          get :timeseries
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
      ######################
      ## END USERS ROUTES ##
      ######################

      resources :retention_cohorts, only: [:index]

      resources :sessions, only: [] do
        collection do
          get :count
          get :timeseries
          get :referrers
          get :demographics
          # /api/v1/sessions/referrers
          resources :referrers, only: [:index], controller: :'sessions/referrers' do
            collection do
              get :bar_chart
            end
          end
          # /api/v1/sessions/browsers
          resources :browsers, only: [], controller: :'sessions/browsers' do
            collection do
              get :bar_chart
            end
          end
          # /api/v1/sessions/device_types
          resources :device_types, only: [], controller: :'sessions/device_types' do
            collection do
              get :bar_chart
            end
          end
        end
      end

      resources :page_views, only: [:index] do
        collection do
          get :timeseries
          get :bar_chart
        end
      end

      # TODO: I don't think we need this route?
      # resources :events, only: [] do
      #   collection do
      #     get :timeseries
      #   end
      # end
      
      resources :events, only: [:show], param: :name, constraints: { name: /[^\/]+/ } do # all the :name parameter to contain any character besides a '/'
        collection do
          get :feed
          get :unique
        end
        member do
          get :count
          get :timeseries
        end
        resources :properties, only: [:index], param: :name, controller: :'events/properties' do
          member do
            get :counts, to: 'events/properties#counts'
            get :stacked_bar_chart, to: 'events/properties#stacked_bar_chart'
          end
        end
        resources :users, only: [:index], controller: :'events/users'
      end

      resources :dashboards, only: [:index, :show, :create, :update, :destroy]
      resources :dashboard_components, only: [:index, :create, :update, :destroy] do
        collection do
          patch :bulk_update
          post :bulk_create
        end
      end
      resources :dashboards_dashboard_components, only: [:destroy]

      resources :billing_data_snapshots, only: [:index]

      resources :customer_subscriptions, only: [:index]

      resources :integrations, only: [:destroy, :index, :create] do
        member do
          patch :enable
          patch :disable
        end
      end

      resources :event_triggers, only: [:destroy, :index, :create] do
        member do
          post :test_trigger
          patch :enable
          patch :disable
        end
      end

      resources :slack_connections, only: [:index]
      resources :slack, only: [] do
        collection do
          get :channels
        end
      end
      
      get :'/admin/ingestion/queuing', to: 'admin/ingestion#queueing'
      get :'/admin/ingestion/queue_stats', to: 'admin/ingestion#queue_stats'
      get :'/admin/ingestion/event_counts', to: 'admin/ingestion#event_counts'
      get :'/admin/ingestion/ingestion_batches', to: 'admin/ingestion#ingestion_batches'
      get :'/admin/data_syncs', to: 'admin/data_syncs#index'

      namespace :webhooks do
        post :stripe, to: 'stripe#receive'
        post :'resend/:workspace_id', to: 'resend#receive'
        post :'cal_com/:workspace_id', to: 'cal_com#receive'
      end
    end
  end
end