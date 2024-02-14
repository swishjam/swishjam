module Ingestion
  class QueueManager
    class Queues
      # EVENTS_TO_PREPARE is only used for its DLQ when we fail to prepare any or all events during Ingestion::EventsPreparer#prepare_events!
      QUEUE_NAMES = %i[
        EVENTS_TO_PREPARE
        PREPARED_EVENTS 
        CLICK_HOUSE_USER_PROFILES
        CLICK_HOUSE_ORGANIZATION_PROFILES
        CLICK_HOUSE_ORGANIZATION_MEMBERS
      ]
      
      class << self
        def all
          QUEUE_NAMES.map{ |q| [send(q), send("#{q}_DLQ")] }.flatten
        end

        QUEUE_NAMES.each do |method|
          define_method(method.to_s.upcase) { "#{method.to_s.downcase}_ingestion_queue" }
          define_method("#{method.to_s.upcase}_DLQ") { "#{method.to_s.downcase}_ingestion_dead_letter_queue" }
        end

        def _flush_all_queues!
          all.each do |queue|
            puts "Flushing queue: #{queue}".colorize(:red)
            Ingestion::QueueManager.pop_all_records_from_queue(queue)
          end
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
      return if records.empty?
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