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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      apps: {
        Row: {
          allow_pdf_download: boolean | null
          bonus1_label: string | null
          bonus1_url: string | null
          bonus2_label: string | null
          bonus2_url: string | null
          bonus3_label: string | null
          bonus3_url: string | null
          bonus4_label: string | null
          bonus4_url: string | null
          bonus5_label: string | null
          bonus5_url: string | null
          bonus6_label: string | null
          bonus6_url: string | null
          bonus7_label: string | null
          bonus7_url: string | null
          bonus8_label: string | null
          bonus8_url: string | null
          bonus9_label: string | null
          bonus9_url: string | null
          bonuses_label: string | null
          capa_url: string | null
          cor: string | null
          created_at: string
          descricao: string | null
          downloads: number
          icone_url: string | null
          id: string
          link_personalizado: string | null
          main_product_description: string | null
          main_product_label: string | null
          nome: string
          produto_principal_url: string | null
          slug: string
          status: string
          template: string | null
          theme_config: Json | null
          updated_at: string
          user_id: string
          views: number
        }
        Insert: {
          allow_pdf_download?: boolean | null
          bonus1_label?: string | null
          bonus1_url?: string | null
          bonus2_label?: string | null
          bonus2_url?: string | null
          bonus3_label?: string | null
          bonus3_url?: string | null
          bonus4_label?: string | null
          bonus4_url?: string | null
          bonus5_label?: string | null
          bonus5_url?: string | null
          bonus6_label?: string | null
          bonus6_url?: string | null
          bonus7_label?: string | null
          bonus7_url?: string | null
          bonus8_label?: string | null
          bonus8_url?: string | null
          bonus9_label?: string | null
          bonus9_url?: string | null
          bonuses_label?: string | null
          capa_url?: string | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          downloads?: number
          icone_url?: string | null
          id?: string
          link_personalizado?: string | null
          main_product_description?: string | null
          main_product_label?: string | null
          nome: string
          produto_principal_url?: string | null
          slug: string
          status?: string
          template?: string | null
          theme_config?: Json | null
          updated_at?: string
          user_id: string
          views?: number
        }
        Update: {
          allow_pdf_download?: boolean | null
          bonus1_label?: string | null
          bonus1_url?: string | null
          bonus2_label?: string | null
          bonus2_url?: string | null
          bonus3_label?: string | null
          bonus3_url?: string | null
          bonus4_label?: string | null
          bonus4_url?: string | null
          bonus5_label?: string | null
          bonus5_url?: string | null
          bonus6_label?: string | null
          bonus6_url?: string | null
          bonus7_label?: string | null
          bonus7_url?: string | null
          bonus8_label?: string | null
          bonus8_url?: string | null
          bonus9_label?: string | null
          bonus9_url?: string | null
          bonuses_label?: string | null
          capa_url?: string | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          downloads?: number
          icone_url?: string | null
          id?: string
          link_personalizado?: string | null
          main_product_description?: string | null
          main_product_label?: string | null
          nome?: string
          produto_principal_url?: string | null
          slug?: string
          status?: string
          template?: string | null
          theme_config?: Json | null
          updated_at?: string
          user_id?: string
          views?: number
        }
        Relationships: []
      }
      plans: {
        Row: {
          app_limit: number
          created_at: string
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          app_limit?: number
          created_at?: string
          id?: string
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          app_limit?: number
          created_at?: string
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          config: Json
          created_at: string
          id: string
          integration_type: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          config: Json
          created_at?: string
          id?: string
          integration_type: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          integration_type?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_status: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          plan_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          plan_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          plan_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_status_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      apps_public: {
        Row: {
          allow_pdf_download: boolean | null
          bonus1_label: string | null
          bonus1_url: string | null
          bonus2_label: string | null
          bonus2_url: string | null
          bonus3_label: string | null
          bonus3_url: string | null
          bonus4_label: string | null
          bonus4_url: string | null
          bonus5_label: string | null
          bonus5_url: string | null
          bonus6_label: string | null
          bonus6_url: string | null
          bonus7_label: string | null
          bonus7_url: string | null
          bonus8_label: string | null
          bonus8_url: string | null
          bonus9_label: string | null
          bonus9_url: string | null
          bonuses_label: string | null
          capa_url: string | null
          cor: string | null
          created_at: string | null
          descricao: string | null
          downloads: number | null
          icone_url: string | null
          id: string | null
          link_personalizado: string | null
          main_product_description: string | null
          main_product_label: string | null
          nome: string | null
          produto_principal_url: string | null
          slug: string | null
          template: string | null
          theme_config: Json | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          allow_pdf_download?: boolean | null
          bonus1_label?: string | null
          bonus1_url?: string | null
          bonus2_label?: string | null
          bonus2_url?: string | null
          bonus3_label?: string | null
          bonus3_url?: string | null
          bonus4_label?: string | null
          bonus4_url?: string | null
          bonus5_label?: string | null
          bonus5_url?: string | null
          bonus6_label?: string | null
          bonus6_url?: string | null
          bonus7_label?: string | null
          bonus7_url?: string | null
          bonus8_label?: string | null
          bonus8_url?: string | null
          bonus9_label?: string | null
          bonus9_url?: string | null
          bonuses_label?: string | null
          capa_url?: string | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          downloads?: number | null
          icone_url?: string | null
          id?: string | null
          link_personalizado?: string | null
          main_product_description?: string | null
          main_product_label?: string | null
          nome?: string | null
          produto_principal_url?: string | null
          slug?: string | null
          template?: string | null
          theme_config?: Json | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          allow_pdf_download?: boolean | null
          bonus1_label?: string | null
          bonus1_url?: string | null
          bonus2_label?: string | null
          bonus2_url?: string | null
          bonus3_label?: string | null
          bonus3_url?: string | null
          bonus4_label?: string | null
          bonus4_url?: string | null
          bonus5_label?: string | null
          bonus5_url?: string | null
          bonus6_label?: string | null
          bonus6_url?: string | null
          bonus7_label?: string | null
          bonus7_url?: string | null
          bonus8_label?: string | null
          bonus8_url?: string | null
          bonus9_label?: string | null
          bonus9_url?: string | null
          bonuses_label?: string | null
          capa_url?: string | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          downloads?: number | null
          icone_url?: string | null
          id?: string | null
          link_personalizado?: string | null
          main_product_description?: string | null
          main_product_label?: string | null
          nome?: string | null
          produto_principal_url?: string | null
          slug?: string | null
          template?: string | null
          theme_config?: Json | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      user_integrations_secure: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string | null
          integration_type: string | null
          is_active: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          config?: never
          created_at?: string | null
          id?: string | null
          integration_type?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          config?: never
          created_at?: string | null
          id?: string | null
          integration_type?: string | null
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_assign_role: {
        Args: { role_name: string; target_user_id: string }
        Returns: boolean
      }
      admin_delete_app: {
        Args: { app_id: string }
        Returns: boolean
      }
      admin_delete_user_complete: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      delete_own_account: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      delete_user_integration: {
        Args: { p_integration_type: string }
        Returns: boolean
      }
      fetch_public_app: {
        Args: { app_slug: string }
        Returns: {
          allow_pdf_download: boolean
          bonus1_label: string
          bonus1_url: string
          bonus2_label: string
          bonus2_url: string
          bonus3_label: string
          bonus3_url: string
          bonus4_label: string
          bonus4_url: string
          bonus5_label: string
          bonus5_url: string
          bonus6_label: string
          bonus6_url: string
          bonus7_label: string
          bonus7_url: string
          bonus8_label: string
          bonus8_url: string
          bonus9_label: string
          bonus9_url: string
          bonuses_label: string
          capa_url: string
          cor: string
          created_at: string
          descricao: string
          downloads: number
          icone_url: string
          id: string
          link_personalizado: string
          main_product_description: string
          main_product_label: string
          nome: string
          produto_principal_url: string
          slug: string
          template: string
          theme_config: Json
          updated_at: string
          views: number
        }[]
      }
      generate_unique_slug: {
        Args: { base_name: string }
        Returns: string
      }
      get_integration_config: {
        Args: { p_integration_type: string }
        Returns: Json
      }
      get_published_app: {
        Args: { app_slug: string }
        Returns: {
          allow_pdf_download: boolean
          bonus1_label: string
          bonus1_url: string
          bonus2_label: string
          bonus2_url: string
          bonus3_label: string
          bonus3_url: string
          bonus4_label: string
          bonus4_url: string
          bonus5_label: string
          bonus5_url: string
          bonus6_label: string
          bonus6_url: string
          bonus7_label: string
          bonus7_url: string
          bonus8_label: string
          bonus8_url: string
          bonus9_label: string
          bonus9_url: string
          bonuses_label: string
          capa_url: string
          cor: string
          created_at: string
          descricao: string
          downloads: number
          icone_url: string
          id: string
          link_personalizado: string
          main_product_description: string
          main_product_label: string
          nome: string
          produto_principal_url: string
          slug: string
          template: string
          theme_config: Json
          updated_at: string
          views: number
        }[]
      }
      get_users_with_metadata: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          display_name: string
          email: string
          id: string
          phone: string
          updated_at: string
        }[]
      }
      has_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action_details?: Json
          action_type: string
          target_user: string
        }
        Returns: undefined
      }
      save_user_integration: {
        Args: { p_config: Json; p_integration_type: string }
        Returns: {
          created_at: string
          id: string
          integration_type: string
          is_active: boolean
          updated_at: string
        }[]
      }
      setup_admin_user: {
        Args: { user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
