require_relative 'data_sync_worker'

DataSyncWorker.perform_sync(interval: 'daily')