module Ingestion
  class QueueManager
    class Queues
      class << self
        %i[
          EVENTS EVENTS_DEAD_LETTER_QUEUE
          IDENTIFY IDENTIFY_DEAD_LETTER_QUEUE
          ORGANIZATION ORGANIZATION_DEAD_LETTER_QUEUE
          CLICKHOUSE_USER_PROFILES CLICKHOUSE_USER_PROFILE_DEAD_LETTER_QUEUE
          CLICKHOUSE_ORGANIZATION_PROFILES CLICKHOUSE_ORGANIZATION_PROFILE_DEAD_LETTER_QUEUE
        ].each do |method|
          define_method(method.to_s.upcase) { "#{method.to_s.downcase}_ingestion_queue" }
        end
      end
    end

    def self.read_all_records_from_queue(queue)
      redis do |conn|
        raw_records = conn.lrange(queue, 0, -1)
        raw_records.map{ |r| JSON.parse(r) }
      end
    end

    def self.pop_all_records_from_queue(queue)
      records = read_all_records_from_queue(queue)
      redis do |conn|
        conn.del(queue)
      end
      records
    end

    def self.push_records_into_queue(queue, records)
      records = records.is_a?(Array) ? records : [records]
      stringified_records = records.map{ |r| r.to_json }
      redis do |conn|
        conn.lpush(queue, stringified_records)
      end
    end

    def self.num_records_in_queue(queue)
      redis do |conn|
        conn.llen(queue)
      end
    end

    private

    def self.redis_pool
      @redis_pool ||= ConnectionPool.new(
        size: (ENV['REDIS_INGESTION_QUEUE_CONNECTION_POOL_SIZE'] || 5).to_i,
        timeout: (ENV['REDIS_INGESTION_QUEUE_CONNECTION_POOL_TIMEOUT'] || 3).to_i,
      ) do
        Redis.new(url: ENV['REDIS_INGESTION_QUEUE_URL'])
      end
    end

    def self.redis
      self.redis_pool.with do |conn|
        yield conn
      end
    end
  end
end