-- Função específica para buscar condomínios em destaque (lançamentos)
CREATE OR REPLACE FUNCTION get_featured_condominiums(
  p_city_id INTEGER,
  p_agency_id TEXT,
  p_limit INTEGER DEFAULT 6,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  condominium_id UUID,
  name TEXT,
  agency_id TEXT,
  
  -- Detalhes do condomínio
  is_launch BOOLEAN,
  min_price INTEGER,
  max_price INTEGER,
  min_area NUMERIC,
  max_area NUMERIC,
  year_built INTEGER,
  total_units INTEGER,
  description TEXT,
  usage_type TEXT,
  
  -- Localização
  display_address TEXT,
  neighborhood TEXT,
  address TEXT,
  street_number TEXT,
  postal_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Mídia
  primary_image_url TEXT,
  media_count INTEGER,
  
  -- Campos calculados
  price_range_formatted TEXT,
  area_range_formatted TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as condominium_id,
    c.name,
    c.agency_id,
    
    -- Detalhes do condomínio
    c.is_launch,
    c.min_price,
    c.max_price,
    c.min_area,
    c.max_area,
    c.year_built,
    c.total_units,
    c.description,
    c.usage_type,
    
    -- Localização
    COALESCE(el.display_address, el.address) as display_address,
    el.neighborhood,
    el.address,
    el.street_number,
    el.postal_code,
    el.latitude,
    el.longitude,
    
    -- Mídia
    COALESCE(mi.url, '/placeholder-property.jpg') as primary_image_url,
    COALESCE(COUNT(m.id), 0)::INTEGER as media_count,
    
    -- Campos calculados
    CASE 
      WHEN c.min_price IS NOT NULL AND c.max_price IS NOT NULL AND c.min_price != c.max_price
      THEN 'R$ ' || TO_CHAR(c.min_price, 'FM999G999G999') || ' - R$ ' || TO_CHAR(c.max_price, 'FM999G999G999')
      WHEN c.min_price IS NOT NULL
      THEN 'A partir de R$ ' || TO_CHAR(c.min_price, 'FM999G999G999')
      ELSE 'Preço sob consulta'
    END as price_range_formatted,
    
    CASE 
      WHEN c.min_area IS NOT NULL AND c.max_area IS NOT NULL AND c.min_area != c.max_area
      THEN c.min_area::TEXT || ' - ' || c.max_area::TEXT || ' m²'
      WHEN c.min_area IS NOT NULL
      THEN 'A partir de ' || c.min_area::TEXT || ' m²'
      ELSE 'Área sob consulta'
    END as area_range_formatted
    
  FROM condominium c
  LEFT JOIN entity_location el ON c.id = el.condominium_id AND el.entity_type = 'condominium'
  LEFT JOIN media_item mi ON c.id = mi.condominium_id 
    AND mi.is_primary = true 
    AND mi.entity_type = 'condominium'
  LEFT JOIN media_item m ON c.id = m.condominium_id 
    AND m.entity_type = 'condominium'
  
  WHERE c.agency_id = p_agency_id
    AND c.is_launch = true
    AND (p_city_id IS NULL OR el.city_id = p_city_id)
  
  GROUP BY 
    c.id, c.name, c.agency_id,
    c.is_launch, c.min_price, c.max_price, c.min_area, c.max_area,
    c.year_built, c.total_units, c.description, c.usage_type,
    el.display_address, el.neighborhood, el.address, el.street_number,
    el.postal_code, el.latitude, el.longitude, mi.url
  
  ORDER BY c.name
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
