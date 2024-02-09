# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...


### How to run in local development
- Turn on the server, in /backend run `bundle exec rails s`
- Make sure Postgres turned on (We use macOS Postgres app that's always running)
- Turn on redis server, in /backend run `redis-server`
- Turn on the worker, in /backend run `bundle exec sidekiq`
- Turn on clickhouse, in /backend/clickhouse-server (or where you installed clickhouse) run `./clickhouse server`


##### Setting up Slack to test locally
`Integrations::Destinations::Slack.create!(workspace: Workspace.last, enabled: true, config: { access_token: "YOUR_SLACK_ACCESS_TOKEN" })`
