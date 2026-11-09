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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          category: string
          content_type: string
          created_at: string
          external_id: string
          fetched_at: string
          id: string
          image_url: string | null
          published_at: string | null
          source_id: string
          source_name: string
          summary: string | null
          title: string
          url: string
        }
        Insert: {
          category?: string
          content_type?: string
          created_at?: string
          external_id: string
          fetched_at?: string
          id?: string
          image_url?: string | null
          published_at?: string | null
          source_id: string
          source_name: string
          summary?: string | null
          title: string
          url: string
        }
        Update: {
          category?: string
          content_type?: string
          created_at?: string
          external_id?: string
          fetched_at?: string
          id?: string
          image_url?: string | null
          published_at?: string | null
          source_id?: string
          source_name?: string
          summary?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      cron_config: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      daily_subscribers: {
        Row: {
          created_at: string
          email: string | null
          email_enabled: boolean
          enabled: boolean
          last_sent_at: string | null
          phone: string | null
          sms_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          email_enabled?: boolean
          enabled?: boolean
          last_sent_at?: string | null
          phone?: string | null
          sms_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          email_enabled?: boolean
          enabled?: boolean
          last_sent_at?: string | null
          phone?: string | null
          sms_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      global_news_cache: {
        Row: {
          fetched_at: string | null
          id: string
          lease_until: string
          payload: Json
        }
        Insert: {
          fetched_at?: string | null
          id: string
          lease_until?: string
          payload?: Json
        }
        Update: {
          fetched_at?: string | null
          id?: string
          lease_until?: string
          payload?: Json
        }
        Relationships: []
      }
      media_topics: {
        Row: {
          id: string
          media_id: string
          topic: string
        }
        Insert: {
          id?: string
          media_id: string
          topic: string
        }
        Update: {
          id?: string
          media_id?: string
          topic?: string
        }
        Relationships: []
      }
      newsroom_articles: {
        Row: {
          author_id: string
          author_name: string | null
          body: string
          category: string
          created_at: string
          id: string
          image_url: string | null
          published_at: string
          status: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          author_name?: string | null
          body: string
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published_at?: string
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_name?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published_at?: string
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          enabled: boolean
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          enabled?: boolean
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          enabled?: boolean
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          media_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_interactions: {
        Row: {
          category: string | null
          city: string | null
          country: string | null
          created_at: string
          duration_seconds: number | null
          dwell_seconds: number | null
          id: string
          interaction_type: string
          media_id: string
          metadata: Json | null
          region: string | null
          session_id: string | null
          source_id: string | null
          source_name: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          duration_seconds?: number | null
          dwell_seconds?: number | null
          id?: string
          interaction_type?: string
          media_id: string
          metadata?: Json | null
          region?: string | null
          session_id?: string | null
          source_id?: string | null
          source_name?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          duration_seconds?: number | null
          dwell_seconds?: number | null
          id?: string
          interaction_type?: string
          media_id?: string
          metadata?: Json | null
          region?: string | null
          session_id?: string | null
          source_id?: string | null
          source_name?: string | null
          user_agent?: string | null
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
      user_topics: {
        Row: {
          created_at: string
          id: string
          topic: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          topic: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      media_consumption_daily: {
        Row: {
          category: string | null
          country: string | null
          day: string | null
          favorites: number | null
          plays: number | null
          shares: number | null
          source_id: string | null
          source_name: string | null
          total_seconds: number | null
          user_id: string | null
          views: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
