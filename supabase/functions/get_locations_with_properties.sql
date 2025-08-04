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
  INNER JOIN entity_location el ON c.id = el.city_id
  INNER JOIN listing l ON el.entity_id = l.listing_id AND el.entity_type = 'listing'
  WHERE l.agency_id = p_agency_id
    AND (p_query IS NULL OR c.name ILIKE p_query || '%')
  
  UNION ALL
  
  SELECT DISTINCT 
    c.id,
    c.name,
    'city'::TEXT as type,
    c.name as city_name,
    c.id as city_id
  FROM city c
  INNER JOIN entity_location el ON c.id = el.city_id
  INNER JOIN condominium co ON el.entity_id = co.id AND el.entity_type = 'condominium'
  WHERE co.agency_id = p_agency_id
    AND (p_query IS NULL OR c.name ILIKE p_query || '%')
  
  UNION ALL
  
  -- Bairros de listings
  SELECT DISTINCT 
    (ROW_NUMBER() OVER (ORDER BY el.neighborhood) + 10000)::INTEGER as id,
    el.neighborhood as name,
    'neighborhood'::TEXT as type,
    c.name as city_name,
    c.id as city_id
  FROM entity_location el
  INNER JOIN listing l ON el.entity_id = l.listing_id AND el.entity_type = 'listing'
  INNER JOIN city c ON el.city_id = c.id
  WHERE l.agency_id = p_agency_id
    AND el.neighborhood IS NOT NULL
    AND el.neighborhood != ''
    AND (p_query IS NULL OR el.neighborhood ILIKE p_query || '%')
  
  UNION ALL
  
  -- Bairros de condomínios
  SELECT DISTINCT 
    (ROW_NUMBER() OVER (ORDER BY el.neighborhood) + 20000)::INTEGER as id,
    el.neighborhood as name,
    'neighborhood'::TEXT as type,
    c.name as city_name,
    c.id as city_id
  FROM entity_location el
  INNER JOIN condominium co ON el.entity_id = co.id AND el.entity_type = 'condominium'
  INNER JOIN city c ON el.city_id = c.id
  WHERE co.agency_id = p_agency_id
    AND el.neighborhood IS NOT NULL
    AND el.neighborhood != ''
    AND (p_query IS NULL OR el.neighborhood ILIKE p_query || '%')
  
  ORDER BY type, name
  LIMIT 20;
END;
$$; 