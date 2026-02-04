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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          abandoned_at: string | null
          cart_items: Json
          cart_type: string
          created_at: string
          id: string
          last_activity_at: string
          last_recovery_email_at: string | null
          metadata: Json | null
          recovered_at: string | null
          recovery_attempts: number
          recovery_coupon_code: string | null
          status: string
          total_value_cents: number
          user_id: string
        }
        Insert: {
          abandoned_at?: string | null
          cart_items?: Json
          cart_type: string
          created_at?: string
          id?: string
          last_activity_at?: string
          last_recovery_email_at?: string | null
          metadata?: Json | null
          recovered_at?: string | null
          recovery_attempts?: number
          recovery_coupon_code?: string | null
          status?: string
          total_value_cents?: number
          user_id: string
        }
        Update: {
          abandoned_at?: string | null
          cart_items?: Json
          cart_type?: string
          created_at?: string
          id?: string
          last_activity_at?: string
          last_recovery_email_at?: string | null
          metadata?: Json | null
          recovered_at?: string | null
          recovery_attempts?: number
          recovery_coupon_code?: string | null
          status?: string
          total_value_cents?: number
          user_id?: string
        }
        Relationships: []
      }
      activities: {
        Row: {
          address: string | null
          best_time: string | null
          category: string | null
          color: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          distance_from_parks: string | null
          duration: number | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          reservation_required: boolean | null
          slug: string
          tips: string | null
          type: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          best_time?: string | null
          category?: string | null
          color?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          distance_from_parks?: string | null
          duration?: number | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          reservation_required?: boolean | null
          slug: string
          tips?: string | null
          type?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          best_time?: string | null
          category?: string | null
          color?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          distance_from_parks?: string | null
          duration?: number | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          reservation_required?: boolean | null
          slug?: string
          tips?: string | null
          type?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      attraction_preferences: {
        Row: {
          attraction_name: string
          created_at: string
          id: string
          notes: string | null
          park_name: string
          priority: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attraction_name: string
          created_at?: string
          id?: string
          notes?: string | null
          park_name: string
          priority?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attraction_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          park_name?: string
          priority?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attractions: {
        Row: {
          area: string | null
          average_wait_time: number | null
          best_time_to_visit: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          height_requirement: number | null
          icon: string | null
          id: string
          image_url: string | null
          latitude: number | null
          lightning_lane: boolean | null
          longitude: number | null
          name: string
          park_id: string | null
          popularity_score: number | null
          slug: string
          thrill_level: string | null
          tips: string | null
          type: string | null
        }
        Insert: {
          area?: string | null
          average_wait_time?: number | null
          best_time_to_visit?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          height_requirement?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          lightning_lane?: boolean | null
          longitude?: number | null
          name: string
          park_id?: string | null
          popularity_score?: number | null
          slug: string
          thrill_level?: string | null
          tips?: string | null
          type?: string | null
        }
        Update: {
          area?: string | null
          average_wait_time?: number | null
          best_time_to_visit?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          height_requirement?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          lightning_lane?: boolean | null
          longitude?: number | null
          name?: string
          park_id?: string | null
          popularity_score?: number | null
          slug?: string
          thrill_level?: string | null
          tips?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attractions_park_id_fkey"
            columns: ["park_id"]
            isOneToOne: false
            referencedRelation: "parks"
            referencedColumns: ["id"]
          },
        ]
      }
      content_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      content_items: {
        Row: {
          attraction_description: string | null
          attraction_name: string | null
          category_id: string | null
          color: string | null
          created_at: string | null
          created_by: string | null
          cuisine_type: string | null
          description: string | null
          file_url: string | null
          has_warning: boolean | null
          icon: string | null
          id: string
          is_published: boolean | null
          latitude: number | null
          longitude: number | null
          menu_url: string | null
          min_height: string | null
          pass_type: string | null
          requires_reservation: boolean | null
          schedule: string | null
          sort_order: number | null
          thrill_level: number | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
          warning_text: string | null
        }
        Insert: {
          attraction_description?: string | null
          attraction_name?: string | null
          category_id?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          cuisine_type?: string | null
          description?: string | null
          file_url?: string | null
          has_warning?: boolean | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          latitude?: number | null
          longitude?: number | null
          menu_url?: string | null
          min_height?: string | null
          pass_type?: string | null
          requires_reservation?: boolean | null
          schedule?: string | null
          sort_order?: number | null
          thrill_level?: number | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
          warning_text?: string | null
        }
        Update: {
          attraction_description?: string | null
          attraction_name?: string | null
          category_id?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          cuisine_type?: string | null
          description?: string | null
          file_url?: string | null
          has_warning?: boolean | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          latitude?: number | null
          longitude?: number | null
          menu_url?: string | null
          min_height?: string | null
          pass_type?: string | null
          requires_reservation?: boolean | null
          schedule?: string | null
          sort_order?: number | null
          thrill_level?: number | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          warning_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          created_at: string | null
          end_date: string | null
          external_contract_id: string | null
          guide_name: string | null
          id: string
          parks: Json
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          external_contract_id?: string | null
          guide_name?: string | null
          id?: string
          parks?: Json
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          external_contract_id?: string | null
          guide_name?: string | null
          id?: string
          parks?: Json
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_analytics: {
        Row: {
          attraction_name: string
          avg_wait_time: number | null
          best_time: string | null
          best_wait_time: number | null
          closing_time: string | null
          confidence_score: number | null
          created_at: string
          data_completeness_percent: number | null
          data_points_collected: number | null
          date: string
          day_of_week: number
          id: string
          is_holiday: boolean | null
          max_wait_time: number | null
          median_wait_time: number | null
          min_wait_time: number | null
          opening_time: string | null
          park_name: string
          peak_time: string | null
          peak_wait_time: number | null
          special_event: string | null
          std_deviation: number | null
          total_operating_minutes: number | null
          updated_at: string
          weather_summary: string | null
        }
        Insert: {
          attraction_name: string
          avg_wait_time?: number | null
          best_time?: string | null
          best_wait_time?: number | null
          closing_time?: string | null
          confidence_score?: number | null
          created_at?: string
          data_completeness_percent?: number | null
          data_points_collected?: number | null
          date: string
          day_of_week: number
          id?: string
          is_holiday?: boolean | null
          max_wait_time?: number | null
          median_wait_time?: number | null
          min_wait_time?: number | null
          opening_time?: string | null
          park_name: string
          peak_time?: string | null
          peak_wait_time?: number | null
          special_event?: string | null
          std_deviation?: number | null
          total_operating_minutes?: number | null
          updated_at?: string
          weather_summary?: string | null
        }
        Update: {
          attraction_name?: string
          avg_wait_time?: number | null
          best_time?: string | null
          best_wait_time?: number | null
          closing_time?: string | null
          confidence_score?: number | null
          created_at?: string
          data_completeness_percent?: number | null
          data_points_collected?: number | null
          date?: string
          day_of_week?: number
          id?: string
          is_holiday?: boolean | null
          max_wait_time?: number | null
          median_wait_time?: number | null
          min_wait_time?: number | null
          opening_time?: string | null
          park_name?: string
          peak_time?: string | null
          peak_wait_time?: number | null
          special_event?: string | null
          std_deviation?: number | null
          total_operating_minutes?: number | null
          updated_at?: string
          weather_summary?: string | null
        }
        Relationships: []
      }
      discount_coupons: {
        Row: {
          applicable_plans: string[] | null
          code: string
          created_at: string
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_amount_cents: number | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_plans?: string[] | null
          code: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_amount_cents?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_plans?: string[] | null
          code?: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_amount_cents?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      editable_content: {
        Row: {
          accent_color: string | null
          badge_text: string | null
          bg_color: string | null
          border_color: string | null
          button_text: string | null
          button_url: string | null
          content_type: string
          created_at: string
          custom_classes: string | null
          description: string | null
          font_size: string | null
          font_weight: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          metadata: Json | null
          page_key: string
          section_key: string
          styles: Json | null
          subtitle: string | null
          text_color: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          badge_text?: string | null
          bg_color?: string | null
          border_color?: string | null
          button_text?: string | null
          button_url?: string | null
          content_type?: string
          created_at?: string
          custom_classes?: string | null
          description?: string | null
          font_size?: string | null
          font_weight?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          page_key: string
          section_key: string
          styles?: Json | null
          subtitle?: string | null
          text_color?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          badge_text?: string | null
          bg_color?: string | null
          border_color?: string | null
          button_text?: string | null
          button_url?: string | null
          content_type?: string
          created_at?: string
          custom_classes?: string | null
          description?: string | null
          font_size?: string | null
          font_weight?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          page_key?: string
          section_key?: string
          styles?: Json | null
          subtitle?: string | null
          text_color?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      itineraries: {
        Row: {
          created_at: string
          destination: string | null
          end_date: string
          estimated_budget: number | null
          generated_itinerary: Json | null
          id: string
          is_favorite: boolean | null
          questionnaire_answers: Json | null
          start_date: string
          title: string | null
          total_days: number | null
          travelers: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination?: string | null
          end_date: string
          estimated_budget?: number | null
          generated_itinerary?: Json | null
          id?: string
          is_favorite?: boolean | null
          questionnaire_answers?: Json | null
          start_date: string
          title?: string | null
          total_days?: number | null
          travelers?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string | null
          end_date?: string
          estimated_budget?: number | null
          generated_itinerary?: Json | null
          id?: string
          is_favorite?: boolean | null
          questionnaire_answers?: Json | null
          start_date?: string
          title?: string | null
          total_days?: number | null
          travelers?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marker_icon_config: {
        Row: {
          created_at: string
          fallback_emoji: string
          icon_url: string | null
          id: string
          marker_color: string
          poi_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fallback_emoji?: string
          icon_url?: string | null
          id?: string
          marker_color?: string
          poi_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fallback_emoji?: string
          icon_url?: string | null
          id?: string
          marker_color?: string
          poi_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      multipass_status: {
        Row: {
          confirmed_by: string | null
          created_at: string
          first_disney_park_date: string | null
          id: string
          is_purchased: boolean
          last_notification_at: string | null
          last_notification_sent: string | null
          notification_start_date: string | null
          purchased_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confirmed_by?: string | null
          created_at?: string
          first_disney_park_date?: string | null
          id?: string
          is_purchased?: boolean
          last_notification_at?: string | null
          last_notification_sent?: string | null
          notification_start_date?: string | null
          purchased_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confirmed_by?: string | null
          created_at?: string
          first_disney_park_date?: string | null
          id?: string
          is_purchased?: boolean
          last_notification_at?: string | null
          last_notification_sent?: string | null
          notification_start_date?: string | null
          purchased_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      optimal_windows: {
        Row: {
          attraction_name: string
          avg_wait_time: number
          confidence_score: number | null
          created_at: string
          day_of_week: number
          id: string
          is_recommended: boolean | null
          last_updated: string
          max_wait_time: number | null
          min_wait_time: number | null
          notes: string | null
          park_name: string
          ranking: number | null
          sample_size: number
          std_deviation: number | null
          time_window_end: string
          time_window_start: string
        }
        Insert: {
          attraction_name: string
          avg_wait_time: number
          confidence_score?: number | null
          created_at?: string
          day_of_week: number
          id?: string
          is_recommended?: boolean | null
          last_updated?: string
          max_wait_time?: number | null
          min_wait_time?: number | null
          notes?: string | null
          park_name: string
          ranking?: number | null
          sample_size?: number
          std_deviation?: number | null
          time_window_end: string
          time_window_start: string
        }
        Update: {
          attraction_name?: string
          avg_wait_time?: number
          confidence_score?: number | null
          created_at?: string
          day_of_week?: number
          id?: string
          is_recommended?: boolean | null
          last_updated?: string
          max_wait_time?: number | null
          min_wait_time?: number | null
          notes?: string | null
          park_name?: string
          ranking?: number | null
          sample_size?: number
          std_deviation?: number | null
          time_window_end?: string
          time_window_start?: string
        }
        Relationships: []
      }
      parks: {
        Row: {
          address: string | null
          average_cost: number | null
          category: string
          color: string
          created_at: string | null
          description: string | null
          early_entry: boolean | null
          extended_hours: boolean | null
          id: string
          logo_url: string | null
          name: string
          official_website: string | null
          operating_hours: Json | null
          slug: string
          typical_visit_duration: number | null
        }
        Insert: {
          address?: string | null
          average_cost?: number | null
          category: string
          color: string
          created_at?: string | null
          description?: string | null
          early_entry?: boolean | null
          extended_hours?: boolean | null
          id?: string
          logo_url?: string | null
          name: string
          official_website?: string | null
          operating_hours?: Json | null
          slug: string
          typical_visit_duration?: number | null
        }
        Update: {
          address?: string | null
          average_cost?: number | null
          category?: string
          color?: string
          created_at?: string | null
          description?: string | null
          early_entry?: boolean | null
          extended_hours?: boolean | null
          id?: string
          logo_url?: string | null
          name?: string
          official_website?: string | null
          operating_hours?: Json | null
          slug?: string
          typical_visit_duration?: number | null
        }
        Relationships: []
      }
      plan_page_access: {
        Row: {
          basic_visible: boolean | null
          created_at: string | null
          desktop_sort_order: number | null
          id: string
          mobile_sort_order: number | null
          page_icon: string | null
          page_key: string
          page_name: string
          premium_visible: boolean | null
          show_in_bottom_nav: boolean | null
          sort_order: number | null
          travel_mode_sort_order: number | null
          travel_mode_visible: boolean | null
          updated_at: string | null
        }
        Insert: {
          basic_visible?: boolean | null
          created_at?: string | null
          desktop_sort_order?: number | null
          id?: string
          mobile_sort_order?: number | null
          page_icon?: string | null
          page_key: string
          page_name: string
          premium_visible?: boolean | null
          show_in_bottom_nav?: boolean | null
          sort_order?: number | null
          travel_mode_sort_order?: number | null
          travel_mode_visible?: boolean | null
          updated_at?: string | null
        }
        Update: {
          basic_visible?: boolean | null
          created_at?: string | null
          desktop_sort_order?: number | null
          id?: string
          mobile_sort_order?: number | null
          page_icon?: string | null
          page_key?: string
          page_name?: string
          premium_visible?: boolean | null
          show_in_bottom_nav?: boolean | null
          sort_order?: number | null
          travel_mode_sort_order?: number | null
          travel_mode_visible?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      plan_pricing: {
        Row: {
          created_at: string
          features: Json | null
          id: string
          is_active: boolean | null
          plan_key: string
          plan_name: string
          price_cents: number
          sort_order: number | null
          subtitle: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          plan_key: string
          plan_name: string
          price_cents?: number
          sort_order?: number | null
          subtitle?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          plan_key?: string
          plan_name?: string
          price_cents?: number
          sort_order?: number | null
          subtitle?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      planner_items: {
        Row: {
          category: string
          color: string
          completed: boolean | null
          created_at: string | null
          date: string
          duration: number | null
          end_time: string | null
          icon: string | null
          id: string
          item_id: string | null
          item_name: string
          item_type: string
          notes: string | null
          order_index: number | null
          planner_id: string
          reservation_confirmed: boolean | null
          reservation_time: string | null
          start_time: string | null
          time_slot: string | null
        }
        Insert: {
          category: string
          color: string
          completed?: boolean | null
          created_at?: string | null
          date: string
          duration?: number | null
          end_time?: string | null
          icon?: string | null
          id?: string
          item_id?: string | null
          item_name: string
          item_type: string
          notes?: string | null
          order_index?: number | null
          planner_id: string
          reservation_confirmed?: boolean | null
          reservation_time?: string | null
          start_time?: string | null
          time_slot?: string | null
        }
        Update: {
          category?: string
          color?: string
          completed?: boolean | null
          created_at?: string | null
          date?: string
          duration?: number | null
          end_time?: string | null
          icon?: string | null
          id?: string
          item_id?: string | null
          item_name?: string
          item_type?: string
          notes?: string | null
          order_index?: number | null
          planner_id?: string
          reservation_confirmed?: boolean | null
          reservation_time?: string | null
          start_time?: string | null
          time_slot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planner_items_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "user_planners"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          arrival_date: string | null
          authorize_guide_access: boolean | null
          celebration_type: string | null
          checklist_items: Json | null
          completion_percentage: number | null
          concerns: string | null
          created_at: string | null
          departure_date: string | null
          disney_email: string | null
          disney_password: string | null
          email: string | null
          expectations: string | null
          food_allergies: string | null
          group_size: number | null
          group_style: string | null
          guide_name: string | null
          has_celebration: boolean | null
          has_my_disney_experience: boolean | null
          has_transport: boolean | null
          hotel: string | null
          hotel_address: string | null
          hotel_type: string | null
          id: string
          is_access_enabled: boolean | null
          is_locked: boolean | null
          last_visit: string | null
          park_dates: Json | null
          parks: string[] | null
          physical_restrictions: string | null
          plan_tier: string
          preferred_language: string | null
          priority: string[] | null
          responsible_name: string | null
          special_requests: string | null
          travelers: Json | null
          updated_at: string | null
          user_id: string
          uses_stroller_or_wheelchair: string | null
          visited_before: boolean | null
          whatsapp: string | null
        }
        Insert: {
          arrival_date?: string | null
          authorize_guide_access?: boolean | null
          celebration_type?: string | null
          checklist_items?: Json | null
          completion_percentage?: number | null
          concerns?: string | null
          created_at?: string | null
          departure_date?: string | null
          disney_email?: string | null
          disney_password?: string | null
          email?: string | null
          expectations?: string | null
          food_allergies?: string | null
          group_size?: number | null
          group_style?: string | null
          guide_name?: string | null
          has_celebration?: boolean | null
          has_my_disney_experience?: boolean | null
          has_transport?: boolean | null
          hotel?: string | null
          hotel_address?: string | null
          hotel_type?: string | null
          id?: string
          is_access_enabled?: boolean | null
          is_locked?: boolean | null
          last_visit?: string | null
          park_dates?: Json | null
          parks?: string[] | null
          physical_restrictions?: string | null
          plan_tier?: string
          preferred_language?: string | null
          priority?: string[] | null
          responsible_name?: string | null
          special_requests?: string | null
          travelers?: Json | null
          updated_at?: string | null
          user_id: string
          uses_stroller_or_wheelchair?: string | null
          visited_before?: boolean | null
          whatsapp?: string | null
        }
        Update: {
          arrival_date?: string | null
          authorize_guide_access?: boolean | null
          celebration_type?: string | null
          checklist_items?: Json | null
          completion_percentage?: number | null
          concerns?: string | null
          created_at?: string | null
          departure_date?: string | null
          disney_email?: string | null
          disney_password?: string | null
          email?: string | null
          expectations?: string | null
          food_allergies?: string | null
          group_size?: number | null
          group_style?: string | null
          guide_name?: string | null
          has_celebration?: boolean | null
          has_my_disney_experience?: boolean | null
          has_transport?: boolean | null
          hotel?: string | null
          hotel_address?: string | null
          hotel_type?: string | null
          id?: string
          is_access_enabled?: boolean | null
          is_locked?: boolean | null
          last_visit?: string | null
          park_dates?: Json | null
          parks?: string[] | null
          physical_restrictions?: string | null
          plan_tier?: string
          preferred_language?: string | null
          priority?: string[] | null
          responsible_name?: string | null
          special_requests?: string | null
          travelers?: Json | null
          updated_at?: string | null
          user_id?: string
          uses_stroller_or_wheelchair?: string | null
          visited_before?: boolean | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restaurant_favorites: {
        Row: {
          created_at: string
          id: string
          restaurant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          restaurant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          restaurant_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          restaurant_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_images_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_menu_items: {
        Row: {
          category: string
          created_at: string | null
          id: string
          item_name: string
          restaurant_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          item_name: string
          restaurant_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          item_name?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          restaurant_id: string
          updated_at: string
          user_id: string
          visit_date: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          restaurant_id: string
          updated_at?: string
          user_id: string
          visit_date?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          restaurant_id?: string
          updated_at?: string
          user_id?: string
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          area: string | null
          average_cost_per_person: number | null
          category: string | null
          character_dining: boolean | null
          color: string | null
          created_at: string | null
          cuisine: string | null
          description: string | null
          featured: boolean | null
          highlights: string[] | null
          id: string
          image_url: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          menu_url: string | null
          michelin: boolean | null
          must_try: string | null
          name: string
          operating_hours: Json | null
          park_id: string | null
          phone: string | null
          price_range: string | null
          reservation_required: boolean | null
          slug: string
          subcategory: string | null
          tips: string | null
          type: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          area?: string | null
          average_cost_per_person?: number | null
          category?: string | null
          character_dining?: boolean | null
          color?: string | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          featured?: boolean | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          menu_url?: string | null
          michelin?: boolean | null
          must_try?: string | null
          name: string
          operating_hours?: Json | null
          park_id?: string | null
          phone?: string | null
          price_range?: string | null
          reservation_required?: boolean | null
          slug: string
          subcategory?: string | null
          tips?: string | null
          type?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          area?: string | null
          average_cost_per_person?: number | null
          category?: string | null
          character_dining?: boolean | null
          color?: string | null
          created_at?: string | null
          cuisine?: string | null
          description?: string | null
          featured?: boolean | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          menu_url?: string | null
          michelin?: boolean | null
          must_try?: string | null
          name?: string
          operating_hours?: Json | null
          park_id?: string | null
          phone?: string | null
          price_range?: string | null
          reservation_required?: boolean | null
          slug?: string
          subcategory?: string | null
          tips?: string | null
          type?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_park_id_fkey"
            columns: ["park_id"]
            isOneToOne: false
            referencedRelation: "parks"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping: {
        Row: {
          address: string | null
          average_visit_duration: number | null
          brands: string[] | null
          category: string | null
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          operating_hours: Json | null
          slug: string
          tips: string | null
          type: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          average_visit_duration?: number | null
          brands?: string[] | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          operating_hours?: Json | null
          slug: string
          tips?: string | null
          type?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          average_visit_duration?: number | null
          brands?: string[] | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          operating_hours?: Json | null
          slug?: string
          tips?: string | null
          type?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      system_health_logs: {
        Row: {
          attractions_updated: number | null
          component: string
          created_at: string
          error_details: Json | null
          execution_time_ms: number | null
          id: string
          message: string | null
          parks_processed: number | null
          records_created: number | null
          status: string
        }
        Insert: {
          attractions_updated?: number | null
          component: string
          created_at?: string
          error_details?: Json | null
          execution_time_ms?: number | null
          id?: string
          message?: string | null
          parks_processed?: number | null
          records_created?: number | null
          status: string
        }
        Update: {
          attractions_updated?: number | null
          component?: string
          created_at?: string
          error_details?: Json | null
          execution_time_ms?: number | null
          id?: string
          message?: string | null
          parks_processed?: number | null
          records_created?: number | null
          status?: string
        }
        Relationships: []
      }
      terms_acceptances: {
        Row: {
          accepted_at: string
          created_at: string
          document_version: string
          id: string
          ip_address: string | null
          transaction_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          document_version?: string
          id?: string
          ip_address?: string | null
          transaction_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          created_at?: string
          document_version?: string
          id?: string
          ip_address?: string | null
          transaction_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "terms_acceptances_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_config: {
        Row: {
          config_key: string
          config_value: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_cents: number
          asaas_boleto_url: string | null
          asaas_customer_id: string | null
          asaas_invoice_url: string | null
          asaas_payment_id: string | null
          asaas_pix_payload: string | null
          asaas_pix_qr_code: string | null
          coupon_code: string | null
          created_at: string
          customer_name: string
          discount_amount_cents: number | null
          email: string
          id: string
          metadata: Json | null
          payment_method: string
          plan_key: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          asaas_boleto_url?: string | null
          asaas_customer_id?: string | null
          asaas_invoice_url?: string | null
          asaas_payment_id?: string | null
          asaas_pix_payload?: string | null
          asaas_pix_qr_code?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_name: string
          discount_amount_cents?: number | null
          email: string
          id?: string
          metadata?: Json | null
          payment_method: string
          plan_key: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          asaas_boleto_url?: string | null
          asaas_customer_id?: string | null
          asaas_invoice_url?: string | null
          asaas_payment_id?: string | null
          asaas_pix_payload?: string | null
          asaas_pix_qr_code?: string | null
          coupon_code?: string | null
          created_at?: string
          customer_name?: string
          discount_amount_cents?: number | null
          email?: string
          id?: string
          metadata?: Json | null
          payment_method?: string
          plan_key?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          file_size: number | null
          file_url: string
          id: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          file_size?: number | null
          file_url: string
          id?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          file_size?: number | null
          file_url?: string
          id?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_planners: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_favorite: boolean | null
          notes: string | null
          start_date: string
          title: string
          total_days: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_favorite?: boolean | null
          notes?: string | null
          start_date: string
          title: string
          total_days: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_favorite?: boolean | null
          notes?: string | null
          start_date?: string
          title?: string
          total_days?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wait_time_records: {
        Row: {
          attraction_id: string | null
          attraction_name: string
          created_at: string
          crowd_level: number | null
          data_source: string | null
          date: string
          day_of_week: number
          id: number
          is_holiday: boolean | null
          is_raining: boolean | null
          park_name: string
          status: string | null
          temperature_f: number | null
          time: string
          timestamp: string
          wait_time_minutes: number | null
          weather_condition: string | null
        }
        Insert: {
          attraction_id?: string | null
          attraction_name: string
          created_at?: string
          crowd_level?: number | null
          data_source?: string | null
          date?: string
          day_of_week?: number
          id?: number
          is_holiday?: boolean | null
          is_raining?: boolean | null
          park_name: string
          status?: string | null
          temperature_f?: number | null
          time?: string
          timestamp?: string
          wait_time_minutes?: number | null
          weather_condition?: string | null
        }
        Update: {
          attraction_id?: string | null
          attraction_name?: string
          created_at?: string
          crowd_level?: number | null
          data_source?: string | null
          date?: string
          day_of_week?: number
          id?: number
          is_holiday?: boolean | null
          is_raining?: boolean | null
          park_name?: string
          status?: string | null
          temperature_f?: number | null
          time?: string
          timestamp?: string
          wait_time_minutes?: number | null
          weather_condition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wait_time_records_attraction_id_fkey"
            columns: ["attraction_id"]
            isOneToOne: false
            referencedRelation: "attractions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_guide_view: {
        Row: {
          arrival_date: string | null
          celebration_type: string | null
          completion_percentage: number | null
          created_at: string | null
          departure_date: string | null
          email: string | null
          group_size: number | null
          group_style: string | null
          guide_name: string | null
          has_celebration: boolean | null
          has_transport: boolean | null
          hotel: string | null
          hotel_type: string | null
          id: string | null
          is_access_enabled: boolean | null
          last_visit: string | null
          park_dates: Json | null
          parks: string[] | null
          plan_tier: string | null
          priority: string[] | null
          responsible_name: string | null
          travelers: Json | null
          updated_at: string | null
          user_id: string | null
          visited_before: boolean | null
          whatsapp: string | null
        }
        Insert: {
          arrival_date?: string | null
          celebration_type?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          departure_date?: string | null
          email?: string | null
          group_size?: number | null
          group_style?: string | null
          guide_name?: string | null
          has_celebration?: boolean | null
          has_transport?: boolean | null
          hotel?: string | null
          hotel_type?: string | null
          id?: string | null
          is_access_enabled?: boolean | null
          last_visit?: string | null
          park_dates?: Json | null
          parks?: string[] | null
          plan_tier?: string | null
          priority?: string[] | null
          responsible_name?: string | null
          travelers?: Json | null
          updated_at?: string | null
          user_id?: string | null
          visited_before?: boolean | null
          whatsapp?: string | null
        }
        Update: {
          arrival_date?: string | null
          celebration_type?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          departure_date?: string | null
          email?: string | null
          group_size?: number | null
          group_style?: string | null
          guide_name?: string | null
          has_celebration?: boolean | null
          has_transport?: boolean | null
          hotel?: string | null
          hotel_type?: string | null
          id?: string | null
          is_access_enabled?: boolean | null
          last_visit?: string | null
          park_dates?: Json | null
          parks?: string[] | null
          plan_tier?: string | null
          priority?: string[] | null
          responsible_name?: string | null
          travelers?: Json | null
          updated_at?: string | null
          user_id?: string | null
          visited_before?: boolean | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      push_subscriptions_guide_view: {
        Row: {
          created_at: string | null
          id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_guide_or_admin: { Args: { _user_id: string }; Returns: boolean }
      mark_abandoned_carts: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "guide" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
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
      app_role: ["admin", "guide", "client"],
    },
  },
} as const
