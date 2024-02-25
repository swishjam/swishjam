module Ingestion
  class QueueManager
    class Queues
      # EVENTS_TO_PREPARE and CAPTURE_ENDPOINT are only used for DLQs
      QUEUE_NAMES = %i[
        CAPTURE_ENDPOINT
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
            Ingestion::QueueManager.flush_queue!(queue)
          end
        end
      end
    end

    def self.stats
      Hash.new.tap do |h|
        Queues.all.map do |queue|
          h[queue] = num_records_in_queue(queue)
        end
      end
    end

    # -1 is the Redis convention for "all records"
    # we substrace 1 from num_records because Redis is 0-indexed
    def self.read_all_records_from_queue(queue, offset: 0, num_records: -1, as_json: true)
      redis do |conn|
        start_index = offset
        end_index = num_records < 0 ? -1 : start_index + num_records - 1
        raw_records = conn.lrange(queue, start_index, end_index)
        if as_json
          raw_records.map{ |r| JSON.parse(r) }
        else
          raw_records
        end
      end
    end

    def self.flush_queue!(queue)
      redis do |conn|
        conn.del(queue)
      end
    end

    def self.pop_all_records_from_queue(queue)
      records = read_all_records_from_queue(queue)
      flush_queue!(queue)
      records
    end

    def self.push_records_into_queue(queue, records)
      records = records.is_a?(Array) ? records : [records]
      return if records.empty?
      stringified_records = records.map{ |r| r.is_a?(String) ? r : r.to_json }
      redis do |conn|
        conn.lpush(queue, stringified_records)
      end
    end

    def self.num_records_in_queue(queue)
      redis do |conn|
        conn.llen(queue)
      end
    end

    def self.remove_record_from_queue(queue, record)
      stringified_record = record.is_a?(String) ? record : record.to_json
      starting_num_records_in_queue = num_records_in_queue(queue)
      new_queue_records_with_record_removed = read_all_records_from_queue(queue, as_json: false).reject { |r| r == stringified_record }
      potential_num_records_removed = starting_num_records_in_queue - new_queue_records_with_record_removed.count
      overwrite_queue!(queue, new_queue_records_with_record_removed) if potential_num_records_removed > 0
      potential_num_records_removed
    end

    private

    def self.overwrite_queue!(queue, records)
      redis do |conn|
        conn.del(queue)
        push_records_into_queue(queue, records)
      end
    end

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