WITH ranked_properties AS (
    SELECT 
        JSONExtractString(e.properties, 'accusantium') AS accusantium, 
        CAST(COUNT(DISTINCT e.uuid) AS INT) AS count, 
        DENSE_RANK() OVER (ORDER BY COUNT() DESC, accusantium ASC) AS rank, 
        IF (rank <= 10, accusantium, 'OTHER') AS accusantium_or_other 
    FROM (
        SELECT 
            e.uuid AS uuid, 
            argMax(e.name, e.occurred_at) AS name, 
            argMax(e.properties, e.occurred_at) AS properties 
        FROM events AS e 
        WHERE e.swishjam_api_key IN ('public--swishjam_prdct-31002150c52026ec', 'public--swishjam_web-b106b6df43b8fec8', 'swishjam_stripe-4b539ce2c55be090', 'swishjam_resend-bf4c8c70bf046101', 'swishjam_interc-4494216641e2e6ec') 
            AND e.occurred_at BETWEEN '2024-04-25 00:00:00' AND '2024-05-02 20:14:45' 
            AND e.name = 'Added Seat' 
        GROUP BY uuid 
    ) AS e 
    WHERE (1=1) 
    GROUP BY accusantium 
) 
SELECT 
    IF(empty(rr.accusantium_or_other), 'EMPTY', rr.accusantium_or_other) AS accusantium, 
    CAST(COUNT(DISTINCT e.uuid) AS INT) AS distinct_count,
    COUNT() AS count
FROM (
    SELECT 
        e.uuid AS uuid, 
        argMax(e.name, e.occurred_at) AS name, 
        argMax(e.properties, e.occurred_at) AS properties 
    FROM events AS e 
    WHERE e.swishjam_api_key IN ('public--swishjam_prdct-31002150c52026ec', 'public--swishjam_web-b106b6df43b8fec8', 'swishjam_stripe-4b539ce2c55be090', 'swishjam_resend-bf4c8c70bf046101', 'swishjam_interc-4494216641e2e6ec') 
        AND e.occurred_at BETWEEN '2024-04-25 00:00:00' AND '2024-05-02 20:14:45' 
        AND e.name = 'Added Seat' 
    GROUP BY uuid 
) AS e 
JOIN ranked_properties AS rr ON JSONExtractString(e.properties, 'accusantium') = rr.accusantium 
WHERE (1=1) 
GROUP BY accusantium 
ORDER BY count DESC
    -- AND notEmpty(accusantium) 
