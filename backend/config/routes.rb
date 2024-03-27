require 'sidekiq/web'
require 'sidekiq/api'

Rails.application.routes.draw do
  post '/auth/register' => 'users#create'
  post '/auth/login' => 'sessions#create'
  post '/auth/logout' => 'sessions#destroy'

  get '/oauth/stripe/callback' => 'oauth/stripe#callback'
  get '/oauth/slack/callback' => 'oauth/slack#callback'
  get '/oauth/google/callback' => 'oauth/google#callback'
  get '/oauth/intercom/callback' => 'oauth/intercom#callback'

  get :ping, to: 'application#ping'

  namespace :api do
    namespace :v1 do
      post :capture, to: 'capture#process_data'
      post :event, to: 'capture#process_data'

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
          get :count
          get :active
          get :timeseries
          get :unique_properties
          get :unique_property_values
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
          resources :url_parameters, only: [], controller: :'sessions/url_parameters' do
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
            get :sum
            get :average
            get :minimum
            get :maximum
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

      resources :user_segments do
        collection do
          patch :preview
        end
      end

      resources :billing_data_snapshots, only: [:index]

      resources :customer_subscriptions, only: [:index]

      resources :integrations, only: [:destroy, :index, :create] do
        member do
          patch :enable
          patch :disable
        end
      end

      resources :automations do
        collection do
          post :test_execution
        end
        member do
          patch :enable
          patch :disable
        end
        resources :automation_steps, only: [:index]
        resources :executed_automations, only: [:index] do
          collection do
            get :timeseries
          end
        end
      end
      resources :event_triggers do
        collection do
          post :test_trigger
        end
        member do
          # post :test_trigger
          patch :enable
          patch :disable
        end
        resources :triggered_event_triggers, only: [:index] do
          member do
            post :retry
            post :cancel
          end
        end
      end

      resources :slack_connections, only: [:index]
      resources :slack, only: [] do
        collection do
          get :channels
          post :'bot/action', to: 'slack_bot#action'
          post :'bot/slash_command', to: 'slack_bot#slash_command'
        end
      end

      resources :reports do
        member do
          patch :enable
          patch :disable
        end
      end

      resources :google_search_console, only: [] do
        collection do
          get :sites
          get :analytics
        end
      end

      resources :do_not_enrich_user_profile_rules, only: [:create, :destroy]
      namespace :saas_metrics, only: [] do
        resources :revenue, only: [] do
          collection do
            get :timeseries
            get :retention
            get :heatmap
            get :per_customer_timeseries
          end
        end
        resources :free_trials, only: [] do
          get :timeseries, on: :collection
        end
        resources :customers, only: [] do
          get :timeseries, on: :collection
        end
        resources :churn, only: [] do
          get :timeseries, on: :collection
        end
        resources :churn_rate, only: [] do
          get :timeseries, on: :collection
        end
        resources :mrr, only: [] do
          collection do
            get :timeseries
            get :heatmap
          end
        end
        resources :mrr_movement, only: [] do
          get :stacked_bar_chart, on: :collection
        end
      end
      
      ##################
      ## ADMIN ROUTES ##
      ##################
      get :'/admin/ingestion/queuing', to: 'admin/ingestion#queueing'
      get :'/admin/ingestion/queue_stats', to: 'admin/ingestion#queue_stats'
      get :'/admin/ingestion/event_counts', to: 'admin/ingestion#event_counts'
      get :'/admin/ingestion/ingestion_batches', to: 'admin/ingestion#ingestion_batches'
      get :'/admin/data_syncs', to: 'admin/data_syncs#index'
      get :'/admin/event_triggers/delay_time_timeseries', to: 'admin/event_triggers#delay_time_timeseries'
      get :'/admin/api_keys/workspace_for_api_key/:public_key', to: 'admin/api_keys#workspace_for_api_key'
      get :'/admin/ingestion_batches', to: 'admin/ingestion_batches#index'
      
      get :'/admin/queues/:name', to: 'admin/queues#show', param: :name
      post :'/admin/queues/:queue_name/records/retry', to: 'admin/queues#retry'
      delete :'/admin/queues/:queue_name/records/delete', to: 'admin/queues#destroy'

      namespace :webhooks do
        post :'cal_com/:workspace_id', to: 'cal_com#receive'
        post :'intercom', to: 'intercom#receive'
        post :'resend/:workspace_id', to: 'resend#receive'
        post :stripe, to: 'stripe#receive'
        post :github, to: 'github#receive'
      end
    end
  end

  ####################
  ## SIDEKIQ ROUTES ##
  ####################
  Sidekiq::Web.use Rack::Auth::Basic do |username, password|
    ActiveSupport::SecurityUtils.secure_compare(::Digest::SHA256.hexdigest(password), ::Digest::SHA256.hexdigest(ENV["SIDEKIQ_PASSWORD"]))
  end if Rails.env.production?
  mount Sidekiq::Web => '/sidekiq'
  match "queues/status" => proc {
    [
      200, 
      {"Content-Type" => "text/plain"}, 
      [
        Hash.new.tap do |h|
          Sidekiq::Queue.all.each do |q|
            h[q.name] = { size: q.size, latency: q.latency }
          end
        end.to_json
      ]
    ] 
  }, via: :get
end