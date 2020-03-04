SELECT
  p.*,
  AVG(pr.rating) average_rating
FROM properties p
JOIN property_reviews pr ON p.id = pr.property_id
WHERE
  city LIKE '%ancouv%'
GROUP BY
  p.id
HAVING
  AVG(pr.rating) >= 4
ORDER BY
  cost_per_night
LIMIT
  10