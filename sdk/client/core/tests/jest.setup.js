const { JSDOM } = require('jsdom');

const dom = new JSDOM('', { url: 'https://swishjam.com' });
global.window = dom.window;
global.document = window.document;
global.sessionStorage = window.sessionStorage;
global.localStorage = window.localStorage;
global.navigator = {
  userAgent: 'node.js',
};

// mock the fetch API
global.fetch = () => Promise.resolve({ ok: true });

afterEach(() => {
  jest.clearAllMocks();
});