export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agency_config: {
        Row: {
          agency_id: string
          allow_salerent_together: boolean | null
          created_at: string
          email: string | null
          has_zap_integration: boolean | null
          id: number
          location_address: string | null
          location_city: string | null
          location_country: string | null
          location_neighborhood: string | null
          location_postal_code: string | null
          location_state: string | null
          location_state_abbreviation: string | null
          logo_url: string | null
          name: string | null
          office_name: string | null
          quota_premiere1: number | null
          quota_premiere2: number | null
          quota_premium: number | null
          quota_super_premium: number | null
          quota_total: number | null
          quota_triple: number | null
          root_folder_id: string | null
          telephone: string | null
          watermark_url: string | null
          website: string | null
        }
        Insert: {
          agency_id: string
          allow_salerent_together?: boolean | null
          created_at?: string
          email?: string | null
          has_zap_integration?: boolean | null
          id?: number
          location_address?: string | null
          location_city?: string | null
          location_country?: string | null
          location_neighborhood?: string | null
          location_postal_code?: string | null
          location_state?: string | null
          location_state_abbreviation?: string | null
          logo_url?: string | null
          name?: string | null
          office_name?: string | null
          quota_premiere1?: number | null
          quota_premiere2?: number | null
          quota_premium?: number | null
          quota_super_premium?: number | null
          quota_total?: number | null
          quota_triple?: number | null
          root_folder_id?: string | null
          telephone?: string | null
          watermark_url?: string | null
          website?: string | null
        }
        Update: {
          agency_id?: string
          allow_salerent_together?: boolean | null
          created_at?: string
          email?: string | null
          has_zap_integration?: boolean | null
          id?: number
          location_address?: string | null
          location_city?: string | null
          location_country?: string | null
          location_neighborhood?: string | null
          location_postal_code?: string | null
          location_state?: string | null
          location_state_abbreviation?: string | null
          logo_url?: string | null
          name?: string | null
          office_name?: string | null
          quota_premiere1?: number | null
          quota_premiere2?: number | null
          quota_premium?: number | null
          quota_super_premium?: number | null
          quota_total?: number | null
          quota_triple?: number | null
          root_folder_id?: string | null
          telephone?: string | null
          watermark_url?: string | null
          website?: string | null
        }
        Relationships: []
      }
      city: {
        Row: {
          id: number
          name: string
          state_id: number
        }
        Insert: {
          id: number
          name: string
          state_id: number
        }
        Update: {
          id?: number
          name?: string
          state_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "city_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "state"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          agency_id: string
          created_at: string
          createdBy: string | null
          id: number
          name: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          createdBy?: string | null
          id?: number
          name: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          createdBy?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      condominium: {
        Row: {
          ad_type: Database["public"]["Enums"]["ad_type_enum"] | null
          agency_id: string | null
          available_units: number
          buildings_count: number
          created_at: string | null
          created_by: string | null
          createdBy: string | null
          cubl: number | null
          description: string | null
          floors_count: number
          id: string
          is_launch: boolean | null
          max_area: number | null
          max_bathroom_count: number
          max_garage_count: number | null
          max_price: number | null
          max_room_amount: number | null
          min_area: number | null
          min_bathroom_count: number
          min_garage_count: number | null
          min_price: number | null
          min_room_amount: number | null
          name: string | null
          occupied_units: number
          total_area: number
          total_units: number | null
          units_per_floor: number
          updated_at: string | null
          usage_type: string | null
          year_built: number | null
        }
        Insert: {
          ad_type?: Database["public"]["Enums"]["ad_type_enum"] | null
          agency_id?: string | null
          available_units?: number
          buildings_count?: number
          created_at?: string | null
          created_by?: string | null
          createdBy?: string | null
          cubl?: number | null
          description?: string | null
          floors_count?: number
          id?: string
          is_launch?: boolean | null
          max_area?: number | null
          max_bathroom_count?: number
          max_garage_count?: number | null
          max_price?: number | null
          max_room_amount?: number | null
          min_area?: number | null
          min_bathroom_count?: number
          min_garage_count?: number | null
          min_price?: number | null
          min_room_amount?: number | null
          name?: string | null
          occupied_units?: number
          total_area?: number
          total_units?: number | null
          units_per_floor?: number
          updated_at?: string | null
          usage_type?: string | null
          year_built?: number | null
        }
        Update: {
          ad_type?: Database["public"]["Enums"]["ad_type_enum"] | null
          agency_id?: string | null
          available_units?: number
          buildings_count?: number
          created_at?: string | null
          created_by?: string | null
          createdBy?: string | null
          cubl?: number | null
          description?: string | null
          floors_count?: number
          id?: string
          is_launch?: boolean | null
          max_area?: number | null
          max_bathroom_count?: number
          max_garage_count?: number | null
          max_price?: number | null
          max_room_amount?: number | null
          min_area?: number | null
          min_bathroom_count?: number
          min_garage_count?: number | null
          min_price?: number | null
          min_room_amount?: number | null
          name?: string | null
          occupied_units?: number
          total_area?: number
          total_units?: number | null
          units_per_floor?: number
          updated_at?: string | null
          usage_type?: string | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "condominium_createdby_fkey"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condominium_cubl_fkey"
            columns: ["cubl"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_features: {
        Row: {
          administration: boolean
          adult_pool: boolean
          alarm_system: boolean
          aluminium_window: boolean
          american_kitchen: boolean
          aquarium: boolean
          armored_security_cabin: boolean
          artesian_well: boolean
          background_house: boolean
          backyard: boolean
          balcony: boolean
          band_practice_room: boolean
          bar: boolean
          barbecue_area: boolean
          barbecue_balcony: boolean
          barbecue_grill: boolean
          barn: boolean
          basketball_court: boolean
          bathroom_cabinets: boolean
          bathtub: boolean
          bbq: boolean
          beauty_center: boolean
          beauty_room: boolean
          beauty_salon: boolean
          bedroom_wardrobe: boolean
          bicycles_place: boolean
          blindex_box: boolean
          builtin_wardrobe: boolean
          burn_cement: boolean
          cable_television: boolean
          caretaker: boolean
          caretaker_house: boolean
          carpet: boolean
          children_care: boolean
          children_pool: boolean
          childrens_pool: boolean
          climbing_wall: boolean
          close_to_hospitals: boolean
          close_to_main_roads: boolean
          close_to_public_transport: boolean
          close_to_schools: boolean
          close_to_shopping_centers: boolean
          closet: boolean
          closet_room: boolean
          club_id: number | null
          coffee_shop: boolean
          cold_floor: boolean
          concierge_24h: boolean
          condominium_id: string | null
          controlled_access: boolean
          convention_hall: boolean
          cooker: boolean
          cooling: boolean
          copa: boolean
          corner_property: boolean
          corral: boolean
          coverage: boolean
          covered_parking: boolean
          covered_pool: boolean
          coworking: boolean
          coworking_room: boolean
          created_by: string | null
          deck: boolean
          deck_area: boolean
          digital_locker: boolean
          dinner_room: boolean
          disabled_access: boolean
          dividers: boolean
          dog_kennel: boolean
          dress_room2: boolean
          drywall: boolean
          eco_condominium: boolean
          eco_garbage_collector: boolean
          edicule: boolean
          electric_charger: boolean
          electric_fence: boolean
          electronic_gate: boolean
          elevator: boolean
          employee_dependency: boolean
          entity_type: Database["public"]["Enums"]["entity_type_enum"]
          entrance_hall: boolean
          exterior_view: boolean
          fence: boolean
          fenced_yard: boolean
          fireplace: boolean
          fitness_room: boolean
          football_field: boolean
          freezer: boolean
          fruit_trees: boolean
          full_floor: boolean
          fully_wired: boolean
          furnished: boolean
          game_room: boolean
          game_room_kids: boolean
          game_room_teen: boolean
          garden: boolean
          garden_area: boolean
          gas_shower: boolean
          geminada: boolean
          generator: boolean
          glass_wall: boolean
          golf_course: boolean
          golf_field: boolean
          gourmet_area: boolean
          gourmet_balcony: boolean
          gourmet_kitchen: boolean
          gravel: boolean
          green_area: boolean
          green_space_park: boolean
          guest_parking: boolean
          gym: boolean
          half_floor: boolean
          hammock_garden: boolean
          headquarters: boolean
          heated_pool: boolean
          heating: boolean
          helipad: boolean
          high_ceiling_height: boolean
          home_office: boolean
          hot_tub: boolean
          id: string
          indoor_soccer: boolean
          integrated_environments: boolean
          intercom: boolean
          internet_connection: boolean
          jogging_track: boolean
          kids_area: boolean
          kitchen: boolean
          kitchen_cabinets: boolean
          lake: boolean
          lake_view: boolean
          laminated_floor: boolean
          land: boolean
          large_kitchen: boolean
          large_room: boolean
          large_window: boolean
          laundry: boolean
          laundry_room: boolean
          lavabo: boolean
          lawn: boolean
          library: boolean
          library_room: boolean
          listing_id: string | null
          lunch_room: boolean
          maids_quarters: boolean
          marina: boolean
          massage_room: boolean
          media_room: boolean
          meeting_room: boolean
          mezzanine: boolean
          mountain_view: boolean
          natural_ventilation: boolean
          near_shopping_center: boolean
          number_of_stories: boolean
          ocean_view: boolean
          orchid_garden: boolean
          orchid_garden_area: boolean
          orchid_place: boolean
          others: boolean
          others_label: string | null
          panoramic_view: boolean
          pantry: boolean
          parking_garage: boolean
          party_gourmet_area: boolean
          party_room: boolean
          pasture: boolean
          patrol: boolean
          paved_street: boolean
          pay_per_use_services: boolean
          pet_space: boolean
          pets_allowed: boolean
          pizza_oven: boolean
          planned_furniture: boolean
          platibanda: boolean
          playground: boolean
          playground_sand_pit: boolean
          pomar: boolean
          pool: boolean
          pool_bar: boolean
          porcelain: boolean
          private_pool: boolean
          raised_floor: boolean
          reception_room: boolean
          recreation_area: boolean
          redario: boolean
          reflective_pool: boolean
          restaurant: boolean
          restaurant_area: boolean
          reversible_room: boolean
          river: boolean
          sanca: boolean
          sand_pit: boolean
          sauna: boolean
          sauna_dry: boolean
          sauna_wet: boolean
          security_camera: boolean
          security_guard_on_duty: boolean
          security_guardhouse: boolean
          security_patrol: boolean
          semi_olympic_pool: boolean
          service_bathroom: boolean
          service_entrance: boolean
          service_room: boolean
          side_entrance: boolean
          skate_lane: boolean
          slab: boolean
          small_room: boolean
          smart_apartment: boolean
          smart_condominium: boolean
          solar_energy: boolean
          solarium: boolean
          soundproofing: boolean
          spa: boolean
          spa_area: boolean
          sports_court: boolean
          square: boolean
          square_plaza: boolean
          squash: boolean
          squash_court: boolean
          stair: boolean
          storage_warehouse: boolean
          stores: boolean
          stores_at_condo: boolean
          teen_space: boolean
          tennis_court: boolean
          tennis_wall: boolean
          thermal_insulation: boolean
          toys_place: boolean
          tree_climbing: boolean
          tv_security: boolean
          utilities: boolean
          utilities_room: boolean
          valet_parking: boolean
          vegetable_garden: boolean
          vinyl_floor: boolean
          wall_balcony: boolean
          walls_grids: boolean
          warehouse: boolean
          water_tank: boolean
          well: boolean
          whirlpool: boolean
          wood_floor: boolean
          zen_garden: boolean
          zen_space: boolean
        }
        Insert: {
          administration?: boolean
          adult_pool?: boolean
          alarm_system?: boolean
          aluminium_window?: boolean
          american_kitchen?: boolean
          aquarium?: boolean
          armored_security_cabin?: boolean
          artesian_well?: boolean
          background_house?: boolean
          backyard?: boolean
          balcony?: boolean
          band_practice_room?: boolean
          bar?: boolean
          barbecue_area?: boolean
          barbecue_balcony?: boolean
          barbecue_grill?: boolean
          barn?: boolean
          basketball_court?: boolean
          bathroom_cabinets?: boolean
          bathtub?: boolean
          bbq?: boolean
          beauty_center?: boolean
          beauty_room?: boolean
          beauty_salon?: boolean
          bedroom_wardrobe?: boolean
          bicycles_place?: boolean
          blindex_box?: boolean
          builtin_wardrobe?: boolean
          burn_cement?: boolean
          cable_television?: boolean
          caretaker?: boolean
          caretaker_house?: boolean
          carpet?: boolean
          children_care?: boolean
          children_pool?: boolean
          childrens_pool?: boolean
          climbing_wall?: boolean
          close_to_hospitals?: boolean
          close_to_main_roads?: boolean
          close_to_public_transport?: boolean
          close_to_schools?: boolean
          close_to_shopping_centers?: boolean
          closet?: boolean
          closet_room?: boolean
          club_id?: number | null
          coffee_shop?: boolean
          cold_floor?: boolean
          concierge_24h?: boolean
          condominium_id?: string | null
          controlled_access?: boolean
          convention_hall?: boolean
          cooker?: boolean
          cooling?: boolean
          copa?: boolean
          corner_property?: boolean
          corral?: boolean
          coverage?: boolean
          covered_parking?: boolean
          covered_pool?: boolean
          coworking?: boolean
          coworking_room?: boolean
          created_by?: string | null
          deck?: boolean
          deck_area?: boolean
          digital_locker?: boolean
          dinner_room?: boolean
          disabled_access?: boolean
          dividers?: boolean
          dog_kennel?: boolean
          dress_room2?: boolean
          drywall?: boolean
          eco_condominium?: boolean
          eco_garbage_collector?: boolean
          edicule?: boolean
          electric_charger?: boolean
          electric_fence?: boolean
          electronic_gate?: boolean
          elevator?: boolean
          employee_dependency?: boolean
          entity_type: Database["public"]["Enums"]["entity_type_enum"]
          entrance_hall?: boolean
          exterior_view?: boolean
          fence?: boolean
          fenced_yard?: boolean
          fireplace?: boolean
          fitness_room?: boolean
          football_field?: boolean
          freezer?: boolean
          fruit_trees?: boolean
          full_floor?: boolean
          fully_wired?: boolean
          furnished?: boolean
          game_room?: boolean
          game_room_kids?: boolean
          game_room_teen?: boolean
          garden?: boolean
          garden_area?: boolean
          gas_shower?: boolean
          geminada?: boolean
          generator?: boolean
          glass_wall?: boolean
          golf_course?: boolean
          golf_field?: boolean
          gourmet_area?: boolean
          gourmet_balcony?: boolean
          gourmet_kitchen?: boolean
          gravel?: boolean
          green_area?: boolean
          green_space_park?: boolean
          guest_parking?: boolean
          gym?: boolean
          half_floor?: boolean
          hammock_garden?: boolean
          headquarters?: boolean
          heated_pool?: boolean
          heating?: boolean
          helipad?: boolean
          high_ceiling_height?: boolean
          home_office?: boolean
          hot_tub?: boolean
          id?: string
          indoor_soccer?: boolean
          integrated_environments?: boolean
          intercom?: boolean
          internet_connection?: boolean
          jogging_track?: boolean
          kids_area?: boolean
          kitchen?: boolean
          kitchen_cabinets?: boolean
          lake?: boolean
          lake_view?: boolean
          laminated_floor?: boolean
          land?: boolean
          large_kitchen?: boolean
          large_room?: boolean
          large_window?: boolean
          laundry?: boolean
          laundry_room?: boolean
          lavabo?: boolean
          lawn?: boolean
          library?: boolean
          library_room?: boolean
          listing_id?: string | null
          lunch_room?: boolean
          maids_quarters?: boolean
          marina?: boolean
          massage_room?: boolean
          media_room?: boolean
          meeting_room?: boolean
          mezzanine?: boolean
          mountain_view?: boolean
          natural_ventilation?: boolean
          near_shopping_center?: boolean
          number_of_stories?: boolean
          ocean_view?: boolean
          orchid_garden?: boolean
          orchid_garden_area?: boolean
          orchid_place?: boolean
          others?: boolean
          others_label?: string | null
          panoramic_view?: boolean
          pantry?: boolean
          parking_garage?: boolean
          party_gourmet_area?: boolean
          party_room?: boolean
          pasture?: boolean
          patrol?: boolean
          paved_street?: boolean
          pay_per_use_services?: boolean
          pet_space?: boolean
          pets_allowed?: boolean
          pizza_oven?: boolean
          planned_furniture?: boolean
          platibanda?: boolean
          playground?: boolean
          playground_sand_pit?: boolean
          pomar?: boolean
          pool?: boolean
          pool_bar?: boolean
          porcelain?: boolean
          private_pool?: boolean
          raised_floor?: boolean
          reception_room?: boolean
          recreation_area?: boolean
          redario?: boolean
          reflective_pool?: boolean
          restaurant?: boolean
          restaurant_area?: boolean
          reversible_room?: boolean
          river?: boolean
          sanca?: boolean
          sand_pit?: boolean
          sauna?: boolean
          sauna_dry?: boolean
          sauna_wet?: boolean
          security_camera?: boolean
          security_guard_on_duty?: boolean
          security_guardhouse?: boolean
          security_patrol?: boolean
          semi_olympic_pool?: boolean
          service_bathroom?: boolean
          service_entrance?: boolean
          service_room?: boolean
          side_entrance?: boolean
          skate_lane?: boolean
          slab?: boolean
          small_room?: boolean
          smart_apartment?: boolean
          smart_condominium?: boolean
          solar_energy?: boolean
          solarium?: boolean
          soundproofing?: boolean
          spa?: boolean
          spa_area?: boolean
          sports_court?: boolean
          square?: boolean
          square_plaza?: boolean
          squash?: boolean
          squash_court?: boolean
          stair?: boolean
          storage_warehouse?: boolean
          stores?: boolean
          stores_at_condo?: boolean
          teen_space?: boolean
          tennis_court?: boolean
          tennis_wall?: boolean
          thermal_insulation?: boolean
          toys_place?: boolean
          tree_climbing?: boolean
          tv_security?: boolean
          utilities?: boolean
          utilities_room?: boolean
          valet_parking?: boolean
          vegetable_garden?: boolean
          vinyl_floor?: boolean
          wall_balcony?: boolean
          walls_grids?: boolean
          warehouse?: boolean
          water_tank?: boolean
          well?: boolean
          whirlpool?: boolean
          wood_floor?: boolean
          zen_garden?: boolean
          zen_space?: boolean
        }
        Update: {
          administration?: boolean
          adult_pool?: boolean
          alarm_system?: boolean
          aluminium_window?: boolean
          american_kitchen?: boolean
          aquarium?: boolean
          armored_security_cabin?: boolean
          artesian_well?: boolean
          background_house?: boolean
          backyard?: boolean
          balcony?: boolean
          band_practice_room?: boolean
          bar?: boolean
          barbecue_area?: boolean
          barbecue_balcony?: boolean
          barbecue_grill?: boolean
          barn?: boolean
          basketball_court?: boolean
          bathroom_cabinets?: boolean
          bathtub?: boolean
          bbq?: boolean
          beauty_center?: boolean
          beauty_room?: boolean
          beauty_salon?: boolean
          bedroom_wardrobe?: boolean
          bicycles_place?: boolean
          blindex_box?: boolean
          builtin_wardrobe?: boolean
          burn_cement?: boolean
          cable_television?: boolean
          caretaker?: boolean
          caretaker_house?: boolean
          carpet?: boolean
          children_care?: boolean
          children_pool?: boolean
          childrens_pool?: boolean
          climbing_wall?: boolean
          close_to_hospitals?: boolean
          close_to_main_roads?: boolean
          close_to_public_transport?: boolean
          close_to_schools?: boolean
          close_to_shopping_centers?: boolean
          closet?: boolean
          closet_room?: boolean
          club_id?: number | null
          coffee_shop?: boolean
          cold_floor?: boolean
          concierge_24h?: boolean
          condominium_id?: string | null
          controlled_access?: boolean
          convention_hall?: boolean
          cooker?: boolean
          cooling?: boolean
          copa?: boolean
          corner_property?: boolean
          corral?: boolean
          coverage?: boolean
          covered_parking?: boolean
          covered_pool?: boolean
          coworking?: boolean
          coworking_room?: boolean
          created_by?: string | null
          deck?: boolean
          deck_area?: boolean
          digital_locker?: boolean
          dinner_room?: boolean
          disabled_access?: boolean
          dividers?: boolean
          dog_kennel?: boolean
          dress_room2?: boolean
          drywall?: boolean
          eco_condominium?: boolean
          eco_garbage_collector?: boolean
          edicule?: boolean
          electric_charger?: boolean
          electric_fence?: boolean
          electronic_gate?: boolean
          elevator?: boolean
          employee_dependency?: boolean
          entity_type?: Database["public"]["Enums"]["entity_type_enum"]
          entrance_hall?: boolean
          exterior_view?: boolean
          fence?: boolean
          fenced_yard?: boolean
          fireplace?: boolean
          fitness_room?: boolean
          football_field?: boolean
          freezer?: boolean
          fruit_trees?: boolean
          full_floor?: boolean
          fully_wired?: boolean
          furnished?: boolean
          game_room?: boolean
          game_room_kids?: boolean
          game_room_teen?: boolean
          garden?: boolean
          garden_area?: boolean
          gas_shower?: boolean
          geminada?: boolean
          generator?: boolean
          glass_wall?: boolean
          golf_course?: boolean
          golf_field?: boolean
          gourmet_area?: boolean
          gourmet_balcony?: boolean
          gourmet_kitchen?: boolean
          gravel?: boolean
          green_area?: boolean
          green_space_park?: boolean
          guest_parking?: boolean
          gym?: boolean
          half_floor?: boolean
          hammock_garden?: boolean
          headquarters?: boolean
          heated_pool?: boolean
          heating?: boolean
          helipad?: boolean
          high_ceiling_height?: boolean
          home_office?: boolean
          hot_tub?: boolean
          id?: string
          indoor_soccer?: boolean
          integrated_environments?: boolean
          intercom?: boolean
          internet_connection?: boolean
          jogging_track?: boolean
          kids_area?: boolean
          kitchen?: boolean
          kitchen_cabinets?: boolean
          lake?: boolean
          lake_view?: boolean
          laminated_floor?: boolean
          land?: boolean
          large_kitchen?: boolean
          large_room?: boolean
          large_window?: boolean
          laundry?: boolean
          laundry_room?: boolean
          lavabo?: boolean
          lawn?: boolean
          library?: boolean
          library_room?: boolean
          listing_id?: string | null
          lunch_room?: boolean
          maids_quarters?: boolean
          marina?: boolean
          massage_room?: boolean
          media_room?: boolean
          meeting_room?: boolean
          mezzanine?: boolean
          mountain_view?: boolean
          natural_ventilation?: boolean
          near_shopping_center?: boolean
          number_of_stories?: boolean
          ocean_view?: boolean
          orchid_garden?: boolean
          orchid_garden_area?: boolean
          orchid_place?: boolean
          others?: boolean
          others_label?: string | null
          panoramic_view?: boolean
          pantry?: boolean
          parking_garage?: boolean
          party_gourmet_area?: boolean
          party_room?: boolean
          pasture?: boolean
          patrol?: boolean
          paved_street?: boolean
          pay_per_use_services?: boolean
          pet_space?: boolean
          pets_allowed?: boolean
          pizza_oven?: boolean
          planned_furniture?: boolean
          platibanda?: boolean
          playground?: boolean
          playground_sand_pit?: boolean
          pomar?: boolean
          pool?: boolean
          pool_bar?: boolean
          porcelain?: boolean
          private_pool?: boolean
          raised_floor?: boolean
          reception_room?: boolean
          recreation_area?: boolean
          redario?: boolean
          reflective_pool?: boolean
          restaurant?: boolean
          restaurant_area?: boolean
          reversible_room?: boolean
          river?: boolean
          sanca?: boolean
          sand_pit?: boolean
          sauna?: boolean
          sauna_dry?: boolean
          sauna_wet?: boolean
          security_camera?: boolean
          security_guard_on_duty?: boolean
          security_guardhouse?: boolean
          security_patrol?: boolean
          semi_olympic_pool?: boolean
          service_bathroom?: boolean
          service_entrance?: boolean
          service_room?: boolean
          side_entrance?: boolean
          skate_lane?: boolean
          slab?: boolean
          small_room?: boolean
          smart_apartment?: boolean
          smart_condominium?: boolean
          solar_energy?: boolean
          solarium?: boolean
          soundproofing?: boolean
          spa?: boolean
          spa_area?: boolean
          sports_court?: boolean
          square?: boolean
          square_plaza?: boolean
          squash?: boolean
          squash_court?: boolean
          stair?: boolean
          storage_warehouse?: boolean
          stores?: boolean
          stores_at_condo?: boolean
          teen_space?: boolean
          tennis_court?: boolean
          tennis_wall?: boolean
          thermal_insulation?: boolean
          toys_place?: boolean
          tree_climbing?: boolean
          tv_security?: boolean
          utilities?: boolean
          utilities_room?: boolean
          valet_parking?: boolean
          vegetable_garden?: boolean
          vinyl_floor?: boolean
          wall_balcony?: boolean
          walls_grids?: boolean
          warehouse?: boolean
          water_tank?: boolean
          well?: boolean
          whirlpool?: boolean
          wood_floor?: boolean
          zen_garden?: boolean
          zen_space?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "entity_features_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_features_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominium"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_features_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominium_search"
            referencedColumns: ["condominium_id"]
          },
          {
            foreignKeyName: "entity_features_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "launch_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_features_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "entity_features_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_full_export"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "entity_features_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_search"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "entity_features_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_view"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      entity_location: {
        Row: {
          address: string | null
          city_id: number | null
          club_id: number | null
          complement: string | null
          condominium_id: string | null
          country_code: string | null
          display_address: string | null
          entity_type: Database["public"]["Enums"]["entity_type_enum"]
          id: string
          latitude: number | null
          listing_id: string | null
          longitude: number | null
          neighborhood: string | null
          postal_code: string | null
          state_id: number | null
          street_number: string | null
          zone: string | null
        }
        Insert: {
          address?: string | null
          city_id?: number | null
          club_id?: number | null
          complement?: string | null
          condominium_id?: string | null
          country_code?: string | null
          display_address?: string | null
          entity_type: Database["public"]["Enums"]["entity_type_enum"]
          id?: string
          latitude?: number | null
          listing_id?: string | null
          longitude?: number | null
          neighborhood?: string | null
          postal_code?: string | null
          state_id?: number | null
          street_number?: string | null
          zone?: string | null
        }
        Update: {
          address?: string | null
          city_id?: number | null
          club_id?: number | null
          complement?: string | null
          condominium_id?: string | null
          country_code?: string | null
          display_address?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type_enum"]
          id?: string
          latitude?: number | null
          listing_id?: string | null
          longitude?: number | null
          neighborhood?: string | null
          postal_code?: string | null
          state_id?: number | null
          street_number?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_location_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_location_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_location_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominium"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_location_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominium_search"
            referencedColumns: ["condominium_id"]
          },
          {
            foreignKeyName: "entity_location_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "launch_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_location_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "entity_location_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_full_export"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "entity_location_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_search"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "entity_location_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_view"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      entity_participants: {
        Row: {
          commission_percentage: number | null
          condominium_id: string | null
          created_at: string
          created_by: string | null
          ghl_contact_id: string
          is_primary: boolean
          listing_id: string | null
          participant_id: string
          role: Database["public"]["Enums"]["participant_role_enum"]
          updated_at: string
        }
        Insert: {
          commission_percentage?: number | null
          condominium_id?: string | null
          created_at?: string
          created_by?: string | null
          ghl_contact_id: string
          is_primary?: boolean
          listing_id?: string | null
          participant_id?: string
          role: Database["public"]["Enums"]["participant_role_enum"]
          updated_at?: string
        }
        Update: {
          commission_percentage?: number | null
          condominium_id?: string | null
          created_at?: string
          created_by?: string | null
          ghl_contact_id?: string
          is_primary?: boolean
          listing_id?: string | null
          participant_id?: string
          role?: Database["public"]["Enums"]["participant_role_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_participants_condominium_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominium"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_participants_condominium_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominium_search"
            referencedColumns: ["condominium_id"]
          },
          {
            foreignKeyName: "entity_participants_condominium_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "launch_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_participants_listing_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "entity_participants_listing_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_full_export"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "entity_participants_listing_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_search"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "entity_participants_listing_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_view"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      listing: {
        Row: {
          ad_type: Database["public"]["Enums"]["ad_type_enum"]
          agency_id: string
          condominium_id: string | null
          construction_status:
            | Database["public"]["Enums"]["construction_status_enum"]
            | null
          created_at: string | null
          createdBy: string | null
          external_ref: string | null
          iptu_amount: number | null
          iptu_currency: string | null
          iptu_period: string | null
          key_location: Database["public"]["Enums"]["key_location_enum"] | null
          key_location_other: string | null
          list_price_amount: number | null
          list_price_currency: string | null
          listing_id: string
          occupation_status:
            | Database["public"]["Enums"]["occupation_status_enum"]
            | null
          property_administration_fee_amount: number | null
          property_administration_fee_currency: string | null
          property_administration_fee_period: string | null
          property_type:
            | Database["public"]["Enums"]["property_type_enum"]
            | null
          public_id: string | null
          rental_period: string | null
          rental_price_amount: number | null
          spu: string | null
          spu_period: string | null
          title: string | null
          tower: string | null
          transaction_status: Database["public"]["Enums"]["transaction_status_enum"]
          transaction_type:
            | Database["public"]["Enums"]["transaction_enum"]
            | null
          unity: string | null
          updated_at: string | null
          usage_type: string | null
          virtual_tour: string | null
        }
        Insert: {
          ad_type: Database["public"]["Enums"]["ad_type_enum"]
          agency_id: string
          condominium_id?: string | null
          construction_status?:
            | Database["public"]["Enums"]["construction_status_enum"]
            | null
          created_at?: string | null
          createdBy?: string | null
          external_ref?: string | null
          iptu_amount?: number | null
          iptu_currency?: string | null
          iptu_period?: string | null
          key_location?: Database["public"]["Enums"]["key_location_enum"] | null
          key_location_other?: string | null
          list_price_amount?: number | null
          list_price_currency?: string | null
          listing_id: string
          occupation_status?:
            | Database["public"]["Enums"]["occupation_status_enum"]
            | null
          property_administration_fee_amount?: number | null
          property_administration_fee_currency?: string | null
          property_administration_fee_period?: string | null
          property_type?:
            | Database["public"]["Enums"]["property_type_enum"]
            | null
          public_id?: string | null
          rental_period?: string | null
          rental_price_amount?: number | null
          spu?: string | null
          spu_period?: string | null
          title?: string | null
          tower?: string | null
          transaction_status?: Database["public"]["Enums"]["transaction_status_enum"]
          transaction_type?:
            | Database["public"]["Enums"]["transaction_enum"]
            | null
          unity?: string | null
          updated_at?: string | null
          usage_type?: string | null
          virtual_tour?: string | null
        }
        Update: {
          ad_type?: Database["public"]["Enums"]["ad_type_enum"]
          agency_id?: string
          condominium_id?: string | null
          construction_status?:
            | Database["public"]["Enums"]["construction_status_enum"]
            | null
          created_at?: string | null
          createdBy?: string | null
          external_ref?: string | null
          iptu_amount?: number | null
          iptu_currency?: string | null
          iptu_period?: string | null
          key_location?: Database["public"]["Enums"]["key_location_enum"] | null
          key_location_other?: string | null
          list_price_amount?: number | null
          list_price_currency?: string | null
          listing_id?: string
          occupation_status?:
            | Database["public"]["Enums"]["occupation_status_enum"]
            | null
          property_administration_fee_amount?: number | null
          property_administration_fee_currency?: string | null
          property_administration_fee_period?: string | null
          property_type?:
            | Database["public"]["Enums"]["property_type_enum"]
            | null
          public_id?: string | null
          rental_period?: string | null
          rental_price_amount?: number | null
          spu?: string | null
          spu_period?: string | null
          title?: string | null
          tower?: string | null
          transaction_status?: Database["public"]["Enums"]["transaction_status_enum"]
          transaction_type?:
            | Database["public"]["Enums"]["transaction_enum"]
            | null
          unity?: string | null
          updated_at?: string | null
          usage_type?: string | null
          virtual_tour?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominium"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominium_search"
            referencedColumns: ["condominium_id"]
          },
          {
            foreignKeyName: "listing_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "launch_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_createdby_fkey"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_details: {
        Row: {
          bathroom_count: number | null
          bedroom_count: number | null
          buildings_count: number | null
          built_area: number | null
          description: string | null
          floors_count: number | null
          garage_count: number | null
          land_area: number | null
          listing_display_address: string
          listing_id: string
          ocupation_regiment:
            | Database["public"]["Enums"]["ocupation_regiment_enum"]
            | null
          position: Database["public"]["Enums"]["position_enum"] | null
          private_area: number | null
          solar_position:
            | Database["public"]["Enums"]["solar_position_enum"]
            | null
          suite_count: number | null
          total_area: number | null
          unit_floor: number | null
          year_built: number | null
        }
        Insert: {
          bathroom_count?: number | null
          bedroom_count?: number | null
          buildings_count?: number | null
          built_area?: number | null
          description?: string | null
          floors_count?: number | null
          garage_count?: number | null
          land_area?: number | null
          listing_display_address: string
          listing_id: string
          ocupation_regiment?:
            | Database["public"]["Enums"]["ocupation_regiment_enum"]
            | null
          position?: Database["public"]["Enums"]["position_enum"] | null
          private_area?: number | null
          solar_position?:
            | Database["public"]["Enums"]["solar_position_enum"]
            | null
          suite_count?: number | null
          total_area?: number | null
          unit_floor?: number | null
          year_built?: number | null
        }
        Update: {
          bathroom_count?: number | null
          bedroom_count?: number | null
          buildings_count?: number | null
          built_area?: number | null
          description?: string | null
          floors_count?: number | null
          garage_count?: number | null
          land_area?: number | null
          listing_display_address?: string
          listing_id?: string
          ocupation_regiment?:
            | Database["public"]["Enums"]["ocupation_regiment_enum"]
            | null
          position?: Database["public"]["Enums"]["position_enum"] | null
          private_area?: number | null
          solar_position?:
            | Database["public"]["Enums"]["solar_position_enum"]
            | null
          suite_count?: number | null
          total_area?: number | null
          unit_floor?: number | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_details_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listing"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_details_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listing_full_export"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_details_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listing_search"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_details_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listing_view"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      listing_floor_finish: {
        Row: {
          created_by: string | null
          finish_type: Database["public"]["Enums"]["floor_finish_enum"]
          id: number
          listing_id: string
          location: string | null
          other_label: string | null
        }
        Insert: {
          created_by?: string | null
          finish_type: Database["public"]["Enums"]["floor_finish_enum"]
          id?: number
          listing_id: string
          location?: string | null
          other_label?: string | null
        }
        Update: {
          created_by?: string | null
          finish_type?: Database["public"]["Enums"]["floor_finish_enum"]
          id?: number
          listing_id?: string
          location?: string | null
          other_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_floor_finish_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_floor_finish_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_full_export"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_floor_finish_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_search"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_floor_finish_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_view"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      listing_note: {
        Row: {
          author_id: string | null
          created_at: string | null
          id: string
          listing_id: string | null
          note: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          note: string
        }
        Update: {
          author_id?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_note_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_note_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_note_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_full_export"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_note_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_search"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_note_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_view"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      listing_room: {
        Row: {
          created_by: string | null
          listing_id: string
          quantity: number | null
          room_type_id: number
        }
        Insert: {
          created_by?: string | null
          listing_id: string
          quantity?: number | null
          room_type_id: number
        }
        Update: {
          created_by?: string | null
          listing_id?: string
          quantity?: number | null
          room_type_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "listing_room_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_room_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_full_export"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_room_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_search"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_room_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_view"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_room_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_type"
            referencedColumns: ["id"]
          },
        ]
      }
      media_item: {
        Row: {
          caption: string | null
          condominium_id: string | null
          entity_type: Database["public"]["Enums"]["entity_type_enum"] | null
          id: string
          is_primary: boolean
          is_public: boolean | null
          listing_id: string | null
          medium: string
          order: number | null
          url: string
        }
        Insert: {
          caption?: string | null
          condominium_id?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type_enum"] | null
          id?: string
          is_primary?: boolean
          is_public?: boolean | null
          listing_id?: string | null
          medium: string
          order?: number | null
          url: string
        }
        Update: {
          caption?: string | null
          condominium_id?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type_enum"] | null
          id?: string
          is_primary?: boolean
          is_public?: boolean | null
          listing_id?: string | null
          medium?: string
          order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_media_condominium"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominium"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_media_condominium"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominium_search"
            referencedColumns: ["condominium_id"]
          },
          {
            foreignKeyName: "fk_media_condominium"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "launch_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_media_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "fk_media_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_full_export"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "fk_media_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_search"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "fk_media_listing"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_view"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      profiles: {
        Row: {
          agency_id: string
          email: string | null
          ghl_user_id: string | null
          id: string
          role: Database["public"]["Enums"]["profile_roles"] | null
        }
        Insert: {
          agency_id: string
          email?: string | null
          ghl_user_id?: string | null
          id: string
          role?: Database["public"]["Enums"]["profile_roles"] | null
        }
        Update: {
          agency_id?: string
          email?: string | null
          ghl_user_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["profile_roles"] | null
        }
        Relationships: []
      }
      public_id_sequences: {
        Row: {
          agency_id: string
          last_seq: number
          property_type: string
        }
        Insert: {
          agency_id: string
          last_seq: number
          property_type: string
        }
        Update: {
          agency_id?: string
          last_seq?: number
          property_type?: string
        }
        Relationships: []
      }
      room_type: {
        Row: {
          id: number
          label: string
          slug: string
        }
        Insert: {
          id?: number
          label: string
          slug: string
        }
        Update: {
          id?: number
          label?: string
          slug?: string
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      state: {
        Row: {
          abbreviation: string
          id: number
          name: string
        }
        Insert: {
          abbreviation: string
          id: number
          name: string
        }
        Update: {
          abbreviation?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      agency_config_quota_status: {
        Row: {
          agency_id: string | null
          allow_salerent_together: boolean | null
          available_premiere1: number | null
          available_premiere2: number | null
          available_premium: number | null
          available_super_premium: number | null
          available_total: number | null
          available_triple: number | null
          created_at: string | null
          email: string | null
          has_zap_integration: boolean | null
          id: number | null
          location_address: string | null
          location_city: string | null
          location_country: string | null
          location_neighborhood: string | null
          location_postal_code: string | null
          location_state: string | null
          location_state_abbreviation: string | null
          logo_url: string | null
          name: string | null
          office_name: string | null
          quota_premiere1: number | null
          quota_premiere2: number | null
          quota_premium: number | null
          quota_super_premium: number | null
          quota_total: number | null
          quota_triple: number | null
          root_folder_id: string | null
          telephone: string | null
          used_premiere1: number | null
          used_premiere2: number | null
          used_premium: number | null
          used_standard: number | null
          used_super_premium: number | null
          used_total: number | null
          used_triple: number | null
          watermark_url: string | null
          website: string | null
        }
        Relationships: []
      }
      condominium_search: {
        Row: {
          address: string | null
          agency_id: string | null
          city_id: number | null
          complement: string | null
          condominium_id: string | null
          country_code: string | null
          createdBy: string | null
          description: string | null
          display_address: string | null
          features: Json | null
          is_launch: boolean | null
          latitude: number | null
          location_id: string | null
          longitude: number | null
          max_area: number | null
          max_price: number | null
          min_area: number | null
          min_price: number | null
          name: string | null
          name_tsv: unknown
          neighborhood: string | null
          postal_code: string | null
          primary_media_url: string | null
          state_id: number | null
          street_number: string | null
          total_units: number | null
          usage_type: string | null
          year_built: number | null
          zone: string | null
        }
        Relationships: [
          {
            foreignKeyName: "condominium_createdby_fkey"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_location_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city"
            referencedColumns: ["id"]
          },
        ]
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      launch_search: {
        Row: {
          ad_type: Database["public"]["Enums"]["ad_type_enum"] | null
          agency_id: string | null
          available_units: number | null
          created_at: string | null
          created_by: string | null
          createdBy: string | null
          cubl: number | null
          description: string | null
          features: Json | null
          id: string | null
          is_launch: boolean | null
          location: Json | null
          max_area: number | null
          max_bathroom_count: number | null
          max_garage_count: number | null
          max_price: number | null
          max_room_amount: number | null
          media_count: number | null
          media_items: Json | null
          min_area: number | null
          min_bathroom_count: number | null
          min_garage_count: number | null
          min_price: number | null
          min_room_amount: number | null
          name: string | null
          updated_at: string | null
          usage_type: string | null
          year_built: number | null
        }
        Relationships: [
          {
            foreignKeyName: "condominium_createdby_fkey"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "condominium_cubl_fkey"
            columns: ["cubl"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_full_export: {
        Row: {
          ad_type: Database["public"]["Enums"]["ad_type_enum"] | null
          address: string | null
          agency_id: string | null
          bathroom_count: number | null
          bedroom_count: number | null
          buildings_count: number | null
          built_area: number | null
          city_name: string | null
          complement: string | null
          condominium_id: string | null
          country_code: string | null
          description: string | null
          display_address: string | null
          features_condominio: Json | null
          features_imovel: Json | null
          floors_count: number | null
          garage_count: number | null
          images: Json | null
          iptu_amount: number | null
          iptu_currency: string | null
          iptu_period: string | null
          land_area: number | null
          latitude: number | null
          list_price_amount: number | null
          list_price_currency: string | null
          listing_id: string | null
          longitude: number | null
          neighborhood: string | null
          postal_code: string | null
          private_area: number | null
          property_administration_fee_amount: number | null
          property_administration_fee_currency: string | null
          property_administration_fee_period: string | null
          property_type:
            | Database["public"]["Enums"]["property_type_enum"]
            | null
          public_id: string | null
          rental_period: string | null
          rental_price_amount: number | null
          state_abbrev: string | null
          state_name: string | null
          street_number: string | null
          suite_count: number | null
          title: string | null
          total_area: number | null
          transaction_type:
            | Database["public"]["Enums"]["transaction_enum"]
            | null
          unit_floor: number | null
          usage_type: string | null
          year_built: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominium"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominium_search"
            referencedColumns: ["condominium_id"]
          },
          {
            foreignKeyName: "listing_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "launch_search"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_search: {
        Row: {
          ad_type: Database["public"]["Enums"]["ad_type_enum"] | null
          agency_id: string | null
          barbecue_area: boolean | null
          bathroom_count: number | null
          bedroom_count: number | null
          built_area: number | null
          city_id: number | null
          condominium_location_id: string | null
          created_at: string | null
          createdBy: string | null
          description: string | null
          display_address: string | null
          features: Json | null
          garage_count: number | null
          gym: boolean | null
          iptu_amount: number | null
          iptu_period: string | null
          key_location: Database["public"]["Enums"]["key_location_enum"] | null
          key_location_other: string | null
          land_area: number | null
          latitude: number | null
          list_price_amount: number | null
          listing_id: string | null
          listing_location_id: string | null
          longitude: number | null
          neighborhood: string | null
          occupation_status:
            | Database["public"]["Enums"]["occupation_status_enum"]
            | null
          others: boolean | null
          others_label: string | null
          party_room: boolean | null
          pool: boolean | null
          primary_media_url: string | null
          private_area: number | null
          property_administration_fee_amount: number | null
          property_administration_fee_period: string | null
          property_type:
            | Database["public"]["Enums"]["property_type_enum"]
            | null
          public_id: string | null
          rental_period: string | null
          rental_price_amount: number | null
          spu: string | null
          spu_period: string | null
          state_id: number | null
          title: string | null
          total_area: number | null
          tower: string | null
          transaction_status:
            | Database["public"]["Enums"]["transaction_status_enum"]
            | null
          transaction_type:
            | Database["public"]["Enums"]["transaction_enum"]
            | null
          unity: string | null
          updated_at: string | null
          zone: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_location_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "city"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_condominium_id_fkey"
            columns: ["condominium_location_id"]
            isOneToOne: false
            referencedRelation: "condominium"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_condominium_id_fkey"
            columns: ["listing_location_id"]
            isOneToOne: false
            referencedRelation: "condominium"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_condominium_id_fkey"
            columns: ["condominium_location_id"]
            isOneToOne: false
            referencedRelation: "condominium_search"
            referencedColumns: ["condominium_id"]
          },
          {
            foreignKeyName: "listing_condominium_id_fkey"
            columns: ["listing_location_id"]
            isOneToOne: false
            referencedRelation: "condominium_search"
            referencedColumns: ["condominium_id"]
          },
          {
            foreignKeyName: "listing_condominium_id_fkey"
            columns: ["condominium_location_id"]
            isOneToOne: false
            referencedRelation: "launch_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_condominium_id_fkey"
            columns: ["listing_location_id"]
            isOneToOne: false
            referencedRelation: "launch_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_createdby_fkey"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_view: {
        Row: {
          ad_type: Database["public"]["Enums"]["ad_type_enum"] | null
          agency_id: string | null
          barbecue_area: boolean | null
          bathroom_count: number | null
          bedroom_count: number | null
          built_area: number | null
          city_id: number | null
          condominium_location_id: string | null
          created_at: string | null
          createdBy: string | null
          display_address: string | null
          features: Json | null
          garage_count: number | null
          gym: boolean | null
          iptu_amount: number | null
          key_location: Database["public"]["Enums"]["key_location_enum"] | null
          key_location_other: string | null
          land_area: number | null
          latitude: number | null
          list_price_amount: number | null
          listing_id: string | null
          listing_location_id: string | null
          longitude: number | null
          neighborhood: string | null
          occupation_status:
            | Database["public"]["Enums"]["occupation_status_enum"]
            | null
          others: boolean | null
          others_label: string | null
          party_room: boolean | null
          pool: boolean | null
          primary_media_url: string | null
          private_area: number | null
          property_administration_fee_amount: number | null
          property_type:
            | Database["public"]["Enums"]["property_type_enum"]
            | null
          public_id: string | null
          rental_price_amount: number | null
          state_id: number | null
          title: string | null
          total_area: number | null
          tower: string | null
          transaction_status:
            | Database["public"]["Enums"]["transaction_status_enum"]
            | null
          transaction_type:
            | Database["public"]["Enums"]["transaction_enum"]
            | null
          unity: string | null
          updated_at: string | null
          zone: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_createdby_fkey"
            columns: ["createdBy"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      debug__get_refresh_listing_search_definition: {
        Args: never
        Returns: string
      }
      delete_listing_with_search_update: {
        Args: { agency_id_param: string; listing_id_param: string }
        Returns: boolean
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_condominiums_optimized: {
        Args: {
          p_agency_id: string
          p_city_id: number
          p_limit?: number
          p_neighborhood?: string
          p_offset?: number
        }
        Returns: {
          address: string
          agency_id: string
          area_range_formatted: string
          condominium_id: string
          description: string
          display_address: string
          is_launch: boolean
          latitude: number
          longitude: number
          max_area: number
          max_price: number
          media_count: number
          min_area: number
          min_price: number
          name: string
          neighborhood: string
          postal_code: string
          price_range_formatted: string
          primary_image_url: string
          street_number: string
          total_units: number
          usage_type: string
          year_built: number
        }[]
      }
      get_listings_optimized: {
        Args: {
          p_agency_id: string
          p_city_id: number
          p_is_launch?: boolean
          p_limit?: number
          p_neighborhood?: string
          p_offset?: number
          p_property_type?: string
          p_transaction_type: string
        }
        Returns: {
          address: string
          agency_id: string
          area: number
          bathroom_count: number
          bedroom_count: number
          buildings_count: number
          built_area: number
          condominium_id: string
          construction_status: string
          description: string
          display_address: string
          external_ref: string
          floors_count: number
          for_rent: boolean
          garage_count: number
          iptu_amount: number
          iptu_currency: string
          iptu_formatted: string
          iptu_period: string
          is_public: boolean
          key_location: string
          key_location_other: string
          land_area: number
          latitude: number
          list_price_amount: number
          list_price_currency: string
          listing_id: string
          longitude: number
          media: Json
          media_count: number
          neighborhood: string
          occupation_status: string
          postal_code: string
          price_formatted: string
          primary_image_url: string
          private_area: number
          property_administration_fee_amount: number
          property_administration_fee_currency: string
          property_type: string
          public_id: string
          rental_period: string
          solar_position: string
          spu: string
          street_number: string
          suite_count: number
          title: string
          total_area: number
          transaction_status: string
          transaction_type: string
          unit_floor: number
          usage_type: string
          virtual_tour: string
          year_built: number
        }[]
      }
      get_locations_with_properties: {
        Args: { p_agency_id: string; p_query?: string }
        Returns: {
          city_id: number
          city_name: string
          id: number
          name: string
          type: string
        }[]
      }
      get_my_agency_id: { Args: never; Returns: string }
      gettransactionid: { Args: never; Returns: unknown }
      is_admin: { Args: never; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      refresh_condominium_search_only: { Args: never; Returns: undefined }
      refresh_launch_search_matview: { Args: never; Returns: undefined }
      refresh_listing_search: { Args: never; Returns: undefined }
      refresh_listing_search_only: { Args: never; Returns: undefined }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_askml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geom: unknown }; Returns: number }
        | { Args: { geog: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      touch_listing: { Args: { listing_uuid: string }; Returns: undefined }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      ad_type_enum:
        | "standard"
        | "premium"
        | "superPremium"
        | "premiere1"
        | "premiere2"
        | "triple"
        | "paused"
        | "inactive"
      construction_status_enum: "off_plan" | "under_construction" | "ready"
      entity_type_enum: "condominium" | "listing" | "club"
      floor_finish_enum:
        | "ceramic"
        | "porcelain"
        | "wood"
        | "granite"
        | "marble"
        | "slate"
        | "raised_floor"
        | "cold_floor"
        | "laminate"
        | "parquet"
        | "other"
      key_location_enum: "owner" | "company" | "lobby" | "other"
      occupation_status_enum: "occupied" | "vacant"
      ocupation_regiment_enum:
        | "freehold"
        | "federal_leasehold"
        | "federal_occupied"
      participant_role_enum: "captor" | "owner"
      position_enum: "front" | "back" | "side"
      profile_roles: "user" | "admin"
      property_type_enum:
        | "residential_apartment"
        | "residential_home"
        | "residential_condo"
        | "residential_village_house"
        | "residential_farm_ranch"
        | "residential_penthouse"
        | "residential_agricultural"
        | "residential_flat"
        | "residential_kitnet"
        | "residential_studio"
        | "residential_land_lot"
        | "residential_sobrado"
        | "commercial_consultorio"
        | "commercial_edificio_residencial"
        | "commercial_industrial"
        | "commercial_garage"
        | "commercial_hotel"
        | "commercial_building"
        | "commercial_corporate_floor"
        | "commercial_land_lot"
        | "commercial_business"
        | "commercial_studio"
        | "commercial_office"
        | "commercial_edificio_comercial"
        | "plant"
      solar_position_enum: "morning" | "afternoon" | "partial"
      taxes_period: "monthly" | "yearly"
      transaction_enum: "sale" | "rent" | "both"
      transaction_status_enum:
        | "success"
        | "reserved"
        | "pending"
        | "in_progress"
        | "inactive"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ad_type_enum: [
        "standard",
        "premium",
        "superPremium",
        "premiere1",
        "premiere2",
        "triple",
        "paused",
        "inactive",
      ],
      construction_status_enum: ["off_plan", "under_construction", "ready"],
      entity_type_enum: ["condominium", "listing", "club"],
      floor_finish_enum: [
        "ceramic",
        "porcelain",
        "wood",
        "granite",
        "marble",
        "slate",
        "raised_floor",
        "cold_floor",
        "laminate",
        "parquet",
        "other",
      ],
      key_location_enum: ["owner", "company", "lobby", "other"],
      occupation_status_enum: ["occupied", "vacant"],
      ocupation_regiment_enum: [
        "freehold",
        "federal_leasehold",
        "federal_occupied",
      ],
      participant_role_enum: ["captor", "owner"],
      position_enum: ["front", "back", "side"],
      profile_roles: ["user", "admin"],
      property_type_enum: [
        "residential_apartment",
        "residential_home",
        "residential_condo",
        "residential_village_house",
        "residential_farm_ranch",
        "residential_penthouse",
        "residential_agricultural",
        "residential_flat",
        "residential_kitnet",
        "residential_studio",
        "residential_land_lot",
        "residential_sobrado",
        "commercial_consultorio",
        "commercial_edificio_residencial",
        "commercial_industrial",
        "commercial_garage",
        "commercial_hotel",
        "commercial_building",
        "commercial_corporate_floor",
        "commercial_land_lot",
        "commercial_business",
        "commercial_studio",
        "commercial_office",
        "commercial_edificio_comercial",
        "plant",
      ],
      solar_position_enum: ["morning", "afternoon", "partial"],
      taxes_period: ["monthly", "yearly"],
      transaction_enum: ["sale", "rent", "both"],
      transaction_status_enum: [
        "success",
        "reserved",
        "pending",
        "in_progress",
        "inactive",
      ],
    },
  },
} as const
