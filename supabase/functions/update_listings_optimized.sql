-- Script para atualizar a função get_listings_optimized com suporte a filtros de lançamento
-- Execute este script no SQL Editor do Supabase

-- Função otimizada para buscar listings com todos os dados relacionados
-- Baseada na estrutura real das tabelas do Supabase
DROP FUNCTION IF EXISTS get_listings_optimized(INTEGER, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_listings_optimized(INTEGER, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, BOOLEAN);

CREATE OR REPLACE FUNCTION get_listings_optimized(
  p_city_id INTEGER,
  p_transaction_type TEXT,
  p_agency_id TEXT,
  p_neighborhood TEXT DEFAULT NULL,
  p_property_type TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 30,
  p_offset INTEGER DEFAULT 0,
  p_is_launch BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  listing_id UUID,
  title TEXT,
  transaction_type TEXT,
  virtual_tour TEXT,
  agency_id TEXT,
  transaction_status TEXT,
  construction_status TEXT,
  occupation_status TEXT,
  is_public BOOLEAN,
  property_type TEXT,
  usage_type TEXT,
  external_ref TEXT,
  list_price_amount INTEGER,
  list_price_currency TEXT,
  rental_period TEXT,
  iptu_amount INTEGER,
  iptu_currency TEXT,
  iptu_period TEXT,
  property_administration_fee_amount INTEGER,
  property_administration_fee_currency TEXT,
  public_id TEXT,
  condominium_id UUID,
  key_location TEXT,
  key_location_other TEXT,
  spu TEXT,
  
  -- Detalhes da propriedade
  description TEXT,
  area NUMERIC,
  bathroom_count INTEGER,
  bedroom_count INTEGER,
  garage_count INTEGER,
  floors_count INTEGER,
  unit_floor INTEGER,
  buildings_count INTEGER,
  suite_count INTEGER,
  year_built INTEGER,
  total_area NUMERIC,
  private_area NUMERIC,
  land_area NUMERIC,
  built_area NUMERIC,
  solar_position TEXT,
  
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
  media JSONB,
  
  -- Campos calculados
  price_formatted TEXT,
  iptu_formatted TEXT,
  for_rent BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.listing_id,
    l.title::TEXT,
    l.transaction_type::TEXT,
    l.virtual_tour,
    l.agency_id::TEXT,
    l.transaction_status::TEXT,
    l.construction_status::TEXT,
    l.occupation_status::TEXT,
    l.is_public,
    l.property_type::TEXT,
    l.usage_type::TEXT,
    l.external_ref,
    l.list_price_amount,
    l.list_price_currency::TEXT,
    l.rental_period::TEXT,
    l.iptu_amount,
    l.iptu_currency::TEXT,
    l.iptu_period::TEXT,
    l.property_administration_fee_amount,
    l.property_administration_fee_currency::TEXT,
    l.public_id::TEXT,
    l.condominium_id,
    l.key_location::TEXT,
    l.key_location_other,
    l.spu,
    
    -- Detalhes da propriedade
    ld.description,
    ld.area,
    ld.bathroom_count,
    ld.bedroom_count,
    ld.garage_count,
    ld.floors_count,
    ld.unit_floor,
    ld.buildings_count,
    ld.suite_count,
    ld.year_built,
    ld.total_area,
    ld.private_area,
    ld.land_area,
    ld.built_area,
    ld.solar_position::TEXT,
    
    -- Localização
    el.display_address::TEXT,
    el.neighborhood,
    el.address,
    el.street_number::TEXT,
    el.postal_code::TEXT,
    el.latitude,
    el.longitude,
    
    -- Mídia
    mi.url as primary_image_url,
    (
      SELECT COUNT(*)::INTEGER
      FROM media_item m2
      WHERE m2.listing_id = l.listing_id
        AND m2.entity_type = 'listing'
    ) AS media_count,
    (
      SELECT json_agg(
        json_build_object(
          'id', m3.id,
          'url', m3.url,
          'caption', m3.caption,
          'is_primary', m3.is_primary,
          'order', m3.order
        )
      )::jsonb
      FROM media_item m3
      WHERE m3.listing_id = l.listing_id
        AND m3.entity_type = 'listing'
    ) AS media,
    
    -- Campos calculados
    CASE 
      WHEN l.list_price_amount IS NOT NULL 
      THEN 'R$ ' || l.list_price_amount::TEXT
      ELSE 'Preço sob consulta'
    END as price_formatted,
    
    CASE 
      WHEN l.iptu_amount IS NOT NULL 
      THEN 'R$ ' || l.iptu_amount::TEXT
      ELSE NULL
    END as iptu_formatted,
    
    l.transaction_type = 'rent' as for_rent
    
  FROM listing l
  INNER JOIN entity_location el ON l.listing_id = el.listing_id
  LEFT JOIN listing_details ld ON l.listing_id = ld.listing_id
  LEFT JOIN media_item mi ON l.listing_id = mi.listing_id 
    AND mi.is_primary = true 
    AND mi.entity_type = 'listing'
  LEFT JOIN condominium c ON l.condominium_id = c.id
  
  WHERE el.city_id = p_city_id
    AND el.entity_type = 'listing'
    AND l.transaction_type::text = p_transaction_type
    AND l.agency_id = p_agency_id
    AND l.is_public = true
    AND (p_neighborhood IS NULL OR el.neighborhood = p_neighborhood)
    AND (p_property_type IS NULL OR l.property_type::TEXT = p_property_type)
    AND (p_is_launch IS NULL OR c.is_launch = p_is_launch)
  
  ORDER BY l.listing_id
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
