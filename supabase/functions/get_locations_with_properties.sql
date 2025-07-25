DROP FUNCTION IF EXISTS get_locations_with_properties(TEXT, TEXT);

CREATE OR REPLACE FUNCTION get_locations_with_properties(
  p_agency_id TEXT,
  p_query TEXT DEFAULT NULL
)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  type TEXT,
  city_name TEXT,
  city_id INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  
  -- Cidades
  SELECT DISTINCT 
    c.id,
    c.name,
    'city'::TEXT as type,
    c.name as city_name,
    c.id as city_id
  FROM city c
  INNER JOIN listing_location ll ON c.id = ll.city_id
  INNER JOIN listing l ON ll.listing_id = l.listing_id
  WHERE l.agency_id = p_agency_id
    AND (p_query IS NULL OR c.name ILIKE p_query || '%')
  
  UNION ALL
  
  -- Bairros
  SELECT DISTINCT 
    (ROW_NUMBER() OVER (ORDER BY ll.neighborhood) + 10000)::INTEGER as id,
    ll.neighborhood as name,
    'neighborhood'::TEXT as type,
    c.name as city_name,
    c.id as city_id
  FROM listing_location ll
  INNER JOIN listing l ON ll.listing_id = l.listing_id
  INNER JOIN city c ON ll.city_id = c.id
  WHERE l.agency_id = p_agency_id
    AND ll.neighborhood IS NOT NULL
    AND ll.neighborhood != ''
    AND (p_query IS NULL OR ll.neighborhood ILIKE p_query || '%')
  
  ORDER BY type, name
  LIMIT 20;
END;
$$; 