const path = require('path');

module.exports = {
  transform: {
    '^.+\\.m?js$': 'babel-jest',
  },
  setupFilesAfterEnv: [
    path.resolve(__dirname, 'tests', 'jest.setup.js'),
  ],
};