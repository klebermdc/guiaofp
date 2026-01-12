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
          description: string | null
          file_url: string | null
          icon: string | null
          id: string
          is_published: boolean | null
          latitude: number | null
          longitude: number | null
          min_height: string | null
          pass_type: string | null
          sort_order: number | null
          thrill_level: number | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          attraction_description?: string | null
          attraction_name?: string | null
          category_id?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          latitude?: number | null
          longitude?: number | null
          min_height?: string | null
          pass_type?: string | null
          sort_order?: number | null
          thrill_level?: number | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          attraction_description?: string | null
          attraction_name?: string | null
          category_id?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          latitude?: number | null
          longitude?: number | null
          min_height?: string | null
          pass_type?: string | null
          sort_order?: number | null
          thrill_level?: number | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
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
          id?: string
          parks?: Json
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          arrival_date: string | null
          authorize_guide_access: boolean | null
          celebration_type: string | null
          completion_percentage: number | null
          concerns: string | null
          created_at: string | null
          departure_date: string | null
          email: string | null
          expectations: string | null
          food_allergies: string | null
          group_size: number | null
          group_style: string | null
          has_celebration: boolean | null
          has_my_disney_experience: boolean | null
          has_transport: boolean | null
          hotel: string | null
          hotel_type: string | null
          id: string
          is_locked: boolean | null
          last_visit: string | null
          my_disney_email: string | null
          my_disney_password: string | null
          park_dates: Json | null
          parks: string[] | null
          physical_restrictions: string | null
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
          completion_percentage?: number | null
          concerns?: string | null
          created_at?: string | null
          departure_date?: string | null
          email?: string | null
          expectations?: string | null
          food_allergies?: string | null
          group_size?: number | null
          group_style?: string | null
          has_celebration?: boolean | null
          has_my_disney_experience?: boolean | null
          has_transport?: boolean | null
          hotel?: string | null
          hotel_type?: string | null
          id?: string
          is_locked?: boolean | null
          last_visit?: string | null
          my_disney_email?: string | null
          my_disney_password?: string | null
          park_dates?: Json | null
          parks?: string[] | null
          physical_restrictions?: string | null
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
          completion_percentage?: number | null
          concerns?: string | null
          created_at?: string | null
          departure_date?: string | null
          email?: string | null
          expectations?: string | null
          food_allergies?: string | null
          group_size?: number | null
          group_style?: string | null
          has_celebration?: boolean | null
          has_my_disney_experience?: boolean | null
          has_transport?: boolean | null
          hotel?: string | null
          hotel_type?: string | null
          id?: string
          is_locked?: boolean | null
          last_visit?: string | null
          my_disney_email?: string | null
          my_disney_password?: string | null
          park_dates?: Json | null
          parks?: string[] | null
          physical_restrictions?: string | null
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
      [_ in never]: never
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
