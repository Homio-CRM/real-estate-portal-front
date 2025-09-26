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
  
  -- Primeiro, buscar cidades únicas com imóveis válidos
  WITH valid_cities AS (
    SELECT DISTINCT c.id, c.name
    FROM city c
    INNER JOIN entity_location el ON c.id = el.city_id
    INNER JOIN listing l ON el.listing_id = l.listing_id AND el.entity_type = 'listing'
    WHERE l.agency_id = p_agency_id
      AND l.ad_type IS NOT NULL
      AND l.ad_type != 'paused'
      AND (p_query IS NULL OR c.name ILIKE p_query || '%')
    
    UNION
    
    SELECT DISTINCT c.id, c.name
    FROM city c
    INNER JOIN entity_location el ON c.id = el.city_id
    INNER JOIN condominium co ON el.condominium_id = co.id AND el.entity_type = 'condominium'
    WHERE co.agency_id = p_agency_id
      AND (p_query IS NULL OR c.name ILIKE p_query || '%')
  ),
  valid_neighborhoods AS (
    SELECT DISTINCT 
      el.neighborhood,
      c.name as city_name,
      c.id as city_id
    FROM entity_location el
    INNER JOIN listing l ON el.listing_id = l.listing_id AND el.entity_type = 'listing'
    INNER JOIN city c ON el.city_id = c.id
    WHERE l.agency_id = p_agency_id
      AND l.ad_type IS NOT NULL
      AND l.ad_type != 'paused'
      AND el.neighborhood IS NOT NULL
      AND el.neighborhood != ''
      AND (p_query IS NULL OR el.neighborhood ILIKE p_query || '%')
    
    UNION
    
    SELECT DISTINCT 
      el.neighborhood,
      c.name as city_name,
      c.id as city_id
    FROM entity_location el
    INNER JOIN condominium co ON el.condominium_id = co.id AND el.entity_type = 'condominium'
    INNER JOIN city c ON el.city_id = c.id
    WHERE co.agency_id = p_agency_id
      AND el.neighborhood IS NOT NULL
      AND el.neighborhood != ''
      AND (p_query IS NULL OR el.neighborhood ILIKE p_query || '%')
  )
  
  -- Retornar cidades
  SELECT 
    vc.id,
    vc.name::TEXT,
    'city'::TEXT as type,
    vc.name::TEXT as city_name,
    vc.id as city_id
  FROM valid_cities vc
  
  UNION ALL
  
  -- Retornar bairros únicos
  SELECT 
    (ROW_NUMBER() OVER (ORDER BY vn.neighborhood, vn.city_name) + 10000)::INTEGER as id,
    TRIM(REPLACE(vn.neighborhood, ',', ''))::TEXT as name,
    'neighborhood'::TEXT as type,
    TRIM(vn.city_name)::TEXT as city_name,
    vn.city_id
  FROM valid_neighborhoods vn
  
  ORDER BY type, name
  LIMIT 20;
END;
$$;