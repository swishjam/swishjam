import { Client } from '../src/client.mjs';

describe('Client', () => {
  describe('init', () => {
    it('should set the default config', () => {
      const client = new Client({ apiKey: 'foo' });
      expect(client.config.apiKey).toEqual('foo');
      expect(client.config.apiEndpoint).toEqual('https://capture.swishjam.com/api/v1/capture');
      expect(client.config.maxEventsInMemory).toEqual(20);
      expect(client.config.reportingHeartbeatMs).toEqual(10_000);
      expect(client.config.disabledUrls).toEqual(['http://localhost']);
      expect(client.config.disabled).toEqual(false);
    })

    it('should set the config from options', () => {
      const client = new Client({
        apiKey: 'foo',
        apiEndpoint: 'https://capture.swishjam.com/api/v1/capture/newz!',
        maxEventsInMemory: 10,
        reportingHeartbeatMs: 5_000,
        disabledUrls: ['http://localhost', 'http://localhost:3000'],
        disabled: true,
      });

      expect(client.config.apiKey).toEqual('foo');
      expect(client.config.apiEndpoint).toEqual('https://capture.swishjam.com/api/v1/capture/newz!');
      expect(client.config.maxEventsInMemory).toEqual(10);
      expect(client.config.reportingHeartbeatMs).toEqual(5_000);
      expect(client.config.disabledUrls).toEqual(['http://localhost', 'http://localhost:3000']);
      expect(client.config.disabled).toEqual(true);
    })
  });

  describe('record', () => {
    it('enqueue the new event', () => {
      const client = new Client({ apiKey: 'testApiKey' });

      // the new_session event is automatically enqueued on init
      expect(client.eventQueueManager.queue.length).toEqual(1)

      client.record('myEvent', { someKey: 'someValue' });

      expect(client.eventQueueManager.queue.length).toEqual(2)
      console.log('client.eventQueueManager.queue', JSON.stringify(client.eventQueueManager.queue))
      expect(client.eventQueueManager.queue[1].event).toEqual('myEvent')
      // expect(client.eventQueueManager.queue[0].attributes).toEqual(properties)
    });
  });

});