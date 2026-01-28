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
          id: string
          page_icon: string | null
          page_key: string
          page_name: string
          premium_visible: boolean | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          basic_visible?: boolean | null
          created_at?: string | null
          id?: string
          page_icon?: string | null
          page_key: string
          page_name: string
          premium_visible?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          basic_visible?: boolean | null
          created_at?: string | null
          id?: string
          page_icon?: string | null
          page_key?: string
          page_name?: string
          premium_visible?: boolean | null
          sort_order?: number | null
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
