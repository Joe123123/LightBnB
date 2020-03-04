SELECT
  r.*,
  p.*,
  AVG(rating) average_rating
FROM reservations r
JOIN properties p ON p.id = r.property_id
JOIN property_reviews pr ON p.id = pr.property_id
WHERE
  r.end_date < NOW() :: DATE
  AND r.guest_id = 99
GROUP BY
  p.id,
  r.id
ORDER BY
  r.start_date
LIMIT
  10