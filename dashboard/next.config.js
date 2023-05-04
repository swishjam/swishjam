// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        // (https://www.webpagetest.org/getfile.php?test=230503_BiDcA8_8JT&file=1_screen.jpg)
        protocol: 'https',
        hostname: 'www.webpagetest.org',
        pathname: '/getfile.php',
      }
    ]
  },
  experimental: {
    appDir: true,
  },
  sentry: {
    hideSourcemaps: false
  }
};
module.exports = withSentryConfig(
  module.exports,
  { silent: true },
  { hideSourcemaps: false },
);
