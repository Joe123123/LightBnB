SELECT
  p.city,
  COUNT(*) total_reservations
FROM reservations r
JOIN properties p ON r.property_id = p.id
GROUP BY
  p.city
ORDER BY
  total_reservations DESC