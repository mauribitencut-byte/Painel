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
      condominium_amenities: {
        Row: {
          condominium_id: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          condominium_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          condominium_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "condominium_amenities_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
      condominiums: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          name: string
          neighborhood: string | null
          notes: string | null
          real_estate_id: string
          state: string | null
          total_floors: number | null
          total_units: number | null
          updated_at: string
          year_built: number | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name: string
          neighborhood?: string | null
          notes?: string | null
          real_estate_id: string
          state?: string | null
          total_floors?: number | null
          total_units?: number | null
          updated_at?: string
          year_built?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          neighborhood?: string | null
          notes?: string | null
          real_estate_id?: string
          state?: string | null
          total_floors?: number | null
          total_units?: number | null
          updated_at?: string
          year_built?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "condominiums_real_estate_id_fkey"
            columns: ["real_estate_id"]
            isOneToOne: false
            referencedRelation: "real_estates"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_services: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          lead_id: string | null
          priority: string | null
          real_estate_id: string
          rental_id: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          priority?: string | null
          real_estate_id: string
          rental_id?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          priority?: string | null
          real_estate_id?: string
          rental_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_services_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_services_real_estate_id_fkey"
            columns: ["real_estate_id"]
            isOneToOne: false
            referencedRelation: "real_estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_services_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          email: string | null
          id: string
          interest_type: Database["public"]["Enums"]["property_purpose"] | null
          name: string
          notes: string | null
          phone: string | null
          preferred_neighborhoods: string | null
          property_type_id: string | null
          real_estate_id: string
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email?: string | null
          id?: string
          interest_type?: Database["public"]["Enums"]["property_purpose"] | null
          name: string
          notes?: string | null
          phone?: string | null
          preferred_neighborhoods?: string | null
          property_type_id?: string | null
          real_estate_id: string
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email?: string | null
          id?: string
          interest_type?: Database["public"]["Enums"]["property_purpose"] | null
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_neighborhoods?: string | null
          property_type_id?: string | null
          real_estate_id?: string
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_property_type_id_fkey"
            columns: ["property_type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_real_estate_id_fkey"
            columns: ["real_estate_id"]
            isOneToOne: false
            referencedRelation: "real_estates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string
          department: Database["public"]["Enums"]["department"] | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          real_estate_id: string | null
          unit_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          real_estate_id?: string | null
          unit_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          real_estate_id?: string | null
          unit_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_real_estate_id_fkey"
            columns: ["real_estate_id"]
            isOneToOne: false
            referencedRelation: "real_estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          area_total: number | null
          area_util: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          code: string | null
          complement: string | null
          condominium_fee: number | null
          condominium_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          featured: boolean | null
          id: string
          iptu: number | null
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          number: string | null
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          parking_spaces: number | null
          property_type_id: string | null
          published: boolean | null
          purpose: Database["public"]["Enums"]["property_purpose"]
          real_estate_id: string
          rent_price: number | null
          sale_price: number | null
          state: string | null
          status: Database["public"]["Enums"]["property_status"]
          suites: number | null
          title: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          area_total?: number | null
          area_util?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          code?: string | null
          complement?: string | null
          condominium_fee?: number | null
          condominium_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          iptu?: number | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          number?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          parking_spaces?: number | null
          property_type_id?: string | null
          published?: boolean | null
          purpose?: Database["public"]["Enums"]["property_purpose"]
          real_estate_id: string
          rent_price?: number | null
          sale_price?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          suites?: number | null
          title: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          area_total?: number | null
          area_util?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          code?: string | null
          complement?: string | null
          condominium_fee?: number | null
          condominium_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          iptu?: number | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          number?: string | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          parking_spaces?: number | null
          property_type_id?: string | null
          published?: boolean | null
          purpose?: Database["public"]["Enums"]["property_purpose"]
          real_estate_id?: string
          rent_price?: number | null
          sale_price?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          suites?: number | null
          title?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_property_condominium"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_property_type_id_fkey"
            columns: ["property_type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_real_estate_id_fkey"
            columns: ["real_estate_id"]
            isOneToOne: false
            referencedRelation: "real_estates"
            referencedColumns: ["id"]
          },
        ]
      }
      property_documents: {
        Row: {
          created_at: string
          id: string
          name: string
          property_id: string
          type: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          property_id: string
          type?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          property_id?: string
          type?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_photos: {
        Row: {
          created_at: string
          id: string
          is_cover: boolean | null
          order_index: number | null
          property_id: string
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_cover?: boolean | null
          order_index?: number | null
          property_id: string
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_cover?: boolean | null
          order_index?: number | null
          property_id?: string
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_photos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          counter_value: number | null
          created_at: string
          created_by: string | null
          id: string
          lead_id: string | null
          notes: string | null
          property_id: string | null
          proposed_value: number
          real_estate_id: string
          status: string
          updated_at: string
        }
        Insert: {
          counter_value?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          property_id?: string | null
          proposed_value: number
          real_estate_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          counter_value?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          property_id?: string | null
          proposed_value?: number
          real_estate_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_real_estate_id_fkey"
            columns: ["real_estate_id"]
            isOneToOne: false
            referencedRelation: "real_estates"
            referencedColumns: ["id"]
          },
        ]
      }
      real_estates: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      rental_installments: {
        Row: {
          condominium_fee: number | null
          created_at: string
          discount: number | null
          due_date: string
          id: string
          iptu: number | null
          late_fee: number | null
          notes: string | null
          other_charges: number | null
          paid_value: number | null
          payment_date: string | null
          reference_month: string
          rent_value: number
          rental_id: string
          status: Database["public"]["Enums"]["installment_status"]
          total_value: number
          updated_at: string
        }
        Insert: {
          condominium_fee?: number | null
          created_at?: string
          discount?: number | null
          due_date: string
          id?: string
          iptu?: number | null
          late_fee?: number | null
          notes?: string | null
          other_charges?: number | null
          paid_value?: number | null
          payment_date?: string | null
          reference_month: string
          rent_value: number
          rental_id: string
          status?: Database["public"]["Enums"]["installment_status"]
          total_value: number
          updated_at?: string
        }
        Update: {
          condominium_fee?: number | null
          created_at?: string
          discount?: number | null
          due_date?: string
          id?: string
          iptu?: number | null
          late_fee?: number | null
          notes?: string | null
          other_charges?: number | null
          paid_value?: number | null
          payment_date?: string | null
          reference_month?: string
          rent_value?: number
          rental_id?: string
          status?: Database["public"]["Enums"]["installment_status"]
          total_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_installments_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_parties: {
        Row: {
          address: string | null
          city: string | null
          cpf_cnpj: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          party_type: Database["public"]["Enums"]["party_type"]
          phone: string | null
          rental_id: string
          rg: string | null
          state: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          party_type: Database["public"]["Enums"]["party_type"]
          phone?: string | null
          rental_id: string
          rg?: string | null
          state?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          party_type?: Database["public"]["Enums"]["party_type"]
          phone?: string | null
          rental_id?: string
          rg?: string | null
          state?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_parties_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          adjustment_index: string | null
          adjustment_month: number | null
          code: string | null
          condominium_fee: number | null
          created_at: string
          created_by: string | null
          end_date: string
          guarantee_description: string | null
          guarantee_type: Database["public"]["Enums"]["guarantee_type"] | null
          guarantee_value: number | null
          id: string
          iptu: number | null
          notes: string | null
          property_id: string | null
          real_estate_id: string
          rent_value: number
          start_date: string
          status: Database["public"]["Enums"]["rental_status"]
          updated_at: string
        }
        Insert: {
          adjustment_index?: string | null
          adjustment_month?: number | null
          code?: string | null
          condominium_fee?: number | null
          created_at?: string
          created_by?: string | null
          end_date: string
          guarantee_description?: string | null
          guarantee_type?: Database["public"]["Enums"]["guarantee_type"] | null
          guarantee_value?: number | null
          id?: string
          iptu?: number | null
          notes?: string | null
          property_id?: string | null
          real_estate_id: string
          rent_value: number
          start_date: string
          status?: Database["public"]["Enums"]["rental_status"]
          updated_at?: string
        }
        Update: {
          adjustment_index?: string | null
          adjustment_month?: number | null
          code?: string | null
          condominium_fee?: number | null
          created_at?: string
          created_by?: string | null
          end_date?: string
          guarantee_description?: string | null
          guarantee_type?: Database["public"]["Enums"]["guarantee_type"] | null
          guarantee_value?: number | null
          id?: string
          iptu?: number | null
          notes?: string | null
          property_id?: string | null
          real_estate_id?: string
          rent_value?: number
          start_date?: string
          status?: Database["public"]["Enums"]["rental_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rentals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_real_estate_id_fkey"
            columns: ["real_estate_id"]
            isOneToOne: false
            referencedRelation: "real_estates"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          is_main: boolean | null
          name: string
          phone: string | null
          real_estate_id: string
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_main?: boolean | null
          name: string
          phone?: string | null
          real_estate_id: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_main?: boolean | null
          name?: string
          phone?: string | null
          real_estate_id?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_real_estate_id_fkey"
            columns: ["real_estate_id"]
            isOneToOne: false
            referencedRelation: "real_estates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      get_user_real_estate_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "master" | "gerente" | "corretor" | "call_center" | "estagiario"
      department: "vendas" | "locacao" | "ambos"
      guarantee_type:
        | "caucao"
        | "fiador"
        | "seguro_fianca"
        | "titulo_capitalizacao"
      installment_status: "pendente" | "pago" | "atrasado" | "cancelado"
      lead_status:
        | "novo"
        | "em_atendimento"
        | "qualificado"
        | "proposta"
        | "fechado"
        | "perdido"
      party_type: "locador" | "locatario" | "fiador"
      property_purpose: "venda" | "locacao" | "ambos"
      property_status:
        | "disponivel"
        | "vendido"
        | "locado"
        | "reservado"
        | "inativo"
      rental_status: "ativo" | "encerrado" | "rescindido" | "renovado"
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
      app_role: ["master", "gerente", "corretor", "call_center", "estagiario"],
      department: ["vendas", "locacao", "ambos"],
      guarantee_type: [
        "caucao",
        "fiador",
        "seguro_fianca",
        "titulo_capitalizacao",
      ],
      installment_status: ["pendente", "pago", "atrasado", "cancelado"],
      lead_status: [
        "novo",
        "em_atendimento",
        "qualificado",
        "proposta",
        "fechado",
        "perdido",
      ],
      party_type: ["locador", "locatario", "fiador"],
      property_purpose: ["venda", "locacao", "ambos"],
      property_status: [
        "disponivel",
        "vendido",
        "locado",
        "reservado",
        "inativo",
      ],
      rental_status: ["ativo", "encerrado", "rescindido", "renovado"],
    },
  },
} as const
