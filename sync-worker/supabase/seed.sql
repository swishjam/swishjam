INSERT INTO destination_options 
  (name, slug, type) 
  VALUES
    ('Big Query', 'big-query', 'database'),
    ('Postgres DB', 'postgres', 'database');

  INSERT INTO source_options
    (name, slug, type)
    VALUES
      ('Stripe', 'stripe', 'api'),
      ('Posthog', 'posthog', 'api')