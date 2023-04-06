# Swishjam Dashboard

The Swishjam Dashboard is a web application that allows you to view your web performance metrics, as well as manage your Swishjam account.

## Development

Under the hood, the Swishjam Dashboard is a NextJS application. NodeJS 18+ is required. To get started, run the following commands:

First, install packages:

```
npm install
```

Then, create a `.env.local` file with the following contents from `.example.env`.

```
touch .env.local
```

Then run the app, if everything is successful you should see a login page at `localhost:3000`

```bash
npm run dev
```