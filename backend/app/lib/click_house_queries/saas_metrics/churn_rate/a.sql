SELECT
  grouped_by_date,
  num_churned_users / NULLIF(num_customers_30_days_ago, 0) AS churn_rate
FROM (
  SELECT
    DATE_TRUNC('day', e.occurred_at) AS grouped_by_date,
    CAST(COUNT() AS INT) AS num_churned_users,
    bds.num_customers_with_paid_subscriptions
  FROM events AS e
  JOIN (
    SELECT
      DATE_TRUNC('day', captured_at) AS captured_at,
      MAX(num_customers_with_paid_subscriptions) AS num_customers_with_paid_subscriptions
    FROM billing_data_snapshots
    GROUP BY captured_at
  ) AS bds ON DATE_TRUNC('day', bds.captured_at) - INTERVAL 30 DAY = DATE_TRUNC('day', e.occurred_at)
  WHERE e.name = 'stripe.supplemental.customer.churned'
  GROUP BY DATE_TRUNC('day', e.occurred_at), bds.num_customers_with_paid_subscriptions, bds.num_customers_with_paid_subscriptions
) AS churn_data
GROUP BY grouped_by_date
ORDER BY grouped_by_date ASC


SELECT
  DATE_TRUNC('day', e.occurred_at) AS grouped_by_date,
  CAST(COUNT() AS INT) AS num_churned_users,
  MAX(bds.num_customers_with_paid_subscriptions) AS num_customers_30_days_ago
FROM events AS e
JOIN (
  SELECT
    DATE_TRUNC('day', captured_at) AS captured_at,
    MAX(num_customers_with_paid_subscriptions) AS num_customers_with_paid_subscriptions
  FROM billing_data_snapshots
  GROUP BY captured_at
) AS bds ON bds.captured_at = DATE_TRUNC('day', e.occurred_at) - INTERVAL 30 DAY
WHERE e.name = 'stripe.supplemental.customer.churned'
GROUP BY grouped_by_date



SELECT
  bds.snapshot_date + INTERVAL 30 DAY AS churn_date,
  -- SUM(CASE WHEN e.uuid IS NULL OR e.uuid = '' THEN 0 ELSE 1 END) AS num_churned_users,
  -- MAX(bds.num_customers_with_paid_subscriptions),
  CASE 
    WHEN MAX(bds.num_customers_with_paid_subscriptions) > 0 THEN
      SUM(CASE WHEN e.uuid IS NULL OR e.uuid = '' THEN 0 ELSE 1 END) * 100.0 / MAX(bds.num_customers_with_paid_subscriptions)
    ELSE 0
  END AS churn_rate_percentage
FROM (
  SELECT
    DATE_TRUNC('day', captured_at) AS snapshot_date,
    MAX(num_customers_with_paid_subscriptions) AS num_customers_with_paid_subscriptions
  FROM billing_data_snapshots
  GROUP BY snapshot_date
) AS bds
LEFT JOIN events AS e ON bds.snapshot_date + INTERVAL 30 DAY = DATE_TRUNC('day', e.occurred_at)
  AND e.name = 'stripe.supplemental.customer.churned'
GROUP BY churn_date
ORDER BY churn_date ASC




SELECT
  DATE_TRUNC('day', captured_at) - INTERVAL 30 DAY AS thirty_days_ago,
  DATE_TRUNC('day', captured_at) AS captured_at
FROM billing_data_snapshots
ORDER BY captured_at DESC
LIMIT 100