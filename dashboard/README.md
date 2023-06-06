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



## How to do migrations and update Supabase db structure
- `npx supabase link --project-ref <project-id>` link to the development project. useful for when you want to push this live.
- `npx supabase start` spin up the local dev supabase server
- make changes in the edit table ui in local server
- `npx supabase db diff` -- see the changes
- `npx supabase db diff -f migration_name` - dumbs changes to migration
  - `npx supabase new migration_name` - creates a new blank migration if you need it. Not required id you use the diff to dump to the db.
- add and commit the new file 

## How to deploy the migrations
