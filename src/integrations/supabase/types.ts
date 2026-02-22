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
      accounting_accounts: {
        Row: {
          account_type: string
          active: boolean | null
          code: string
          created_at: string
          id: string
          name: string
          nature: string
          parent_code: string | null
        }
        Insert: {
          account_type: string
          active?: boolean | null
          code: string
          created_at?: string
          id?: string
          name: string
          nature?: string
          parent_code?: string | null
        }
        Update: {
          account_type?: string
          active?: boolean | null
          code?: string
          created_at?: string
          id?: string
          name?: string
          nature?: string
          parent_code?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          accounting_account_code: string | null
          active: boolean | null
          balance: number | null
          bank_name: string | null
          created_at: string
          iban: string | null
          id: string
          name: string
        }
        Insert: {
          accounting_account_code?: string | null
          active?: boolean | null
          balance?: number | null
          bank_name?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          name: string
        }
        Update: {
          accounting_account_code?: string | null
          active?: boolean | null
          balance?: number | null
          bank_name?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      bank_movements: {
        Row: {
          amount: number
          bank_account_id: string
          created_at: string
          description: string | null
          id: string
          reconciled: boolean | null
          reconciliation_ref: string | null
          value_date: string | null
        }
        Insert: {
          amount: number
          bank_account_id: string
          created_at?: string
          description?: string | null
          id?: string
          reconciled?: boolean | null
          reconciliation_ref?: string | null
          value_date?: string | null
        }
        Update: {
          amount?: number
          bank_account_id?: string
          created_at?: string
          description?: string | null
          id?: string
          reconciled?: boolean | null
          reconciliation_ref?: string | null
          value_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_movements_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      cash_movements: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          move_type: Database["public"]["Enums"]["cash_move_type"]
          reference_id: string | null
          reference_type: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          move_type: Database["public"]["Enums"]["cash_move_type"]
          reference_id?: string | null
          reference_type?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          move_type?: Database["public"]["Enums"]["cash_move_type"]
          reference_id?: string | null
          reference_type?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_movements_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_sessions: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          counted_amount: number | null
          difference: number | null
          difference_notes: string | null
          expected_amount: number | null
          id: string
          opened_at: string
          opened_by: string
          opening_amount: number
          status: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          counted_amount?: number | null
          difference?: number | null
          difference_notes?: string | null
          expected_amount?: number | null
          id?: string
          opened_at?: string
          opened_by: string
          opening_amount?: number
          status?: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          counted_amount?: number | null
          difference?: number | null
          difference_notes?: string | null
          expected_amount?: number | null
          id?: string
          opened_at?: string
          opened_by?: string
          opening_amount?: number
          status?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          accounting_account_code: string | null
          active: boolean | null
          created_at: string
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          accounting_account_code?: string | null
          active?: boolean | null
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          accounting_account_code?: string | null
          active?: boolean | null
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          nif: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string
          valuation_method: Database["public"]["Enums"]["valuation_method"]
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          nif?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          valuation_method?: Database["public"]["Enums"]["valuation_method"]
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          nif?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          valuation_method?: Database["public"]["Enums"]["valuation_method"]
        }
        Relationships: []
      }
      customers: {
        Row: {
          active: boolean | null
          address: string | null
          city: string | null
          created_at: string
          credit_allowed: boolean | null
          email: string | null
          id: string
          is_business: boolean | null
          name: string
          nif: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          created_at?: string
          credit_allowed?: boolean | null
          email?: string | null
          id?: string
          is_business?: boolean | null
          name: string
          nif?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          created_at?: string
          credit_allowed?: boolean | null
          email?: string | null
          id?: string
          is_business?: boolean | null
          name?: string
          nif?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ecommerce_sync_events: {
        Row: {
          created_at: string
          direction: string
          error_message: string | null
          event_type: Database["public"]["Enums"]["sync_event_type"]
          id: string
          payload: Json | null
          processed_at: string | null
          retries: number | null
          status: string
        }
        Insert: {
          created_at?: string
          direction?: string
          error_message?: string | null
          event_type: Database["public"]["Enums"]["sync_event_type"]
          id?: string
          payload?: Json | null
          processed_at?: string | null
          retries?: number | null
          status?: string
        }
        Update: {
          created_at?: string
          direction?: string
          error_message?: string | null
          event_type?: Database["public"]["Enums"]["sync_event_type"]
          id?: string
          payload?: Json | null
          processed_at?: string | null
          retries?: number | null
          status?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          accounting_account_code: string | null
          amount: number
          attachment_url: string | null
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          supplier_id: string | null
          tax_amount: number | null
          tax_rate: number | null
          total: number
          user_id: string | null
        }
        Insert: {
          accounting_account_code?: string | null
          amount: number
          attachment_url?: string | null
          category: string
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          supplier_id?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          total: number
          user_id?: string | null
        }
        Update: {
          accounting_account_code?: string | null
          amount?: number
          attachment_url?: string | null
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          supplier_id?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_lots: {
        Row: {
          cost_price: number | null
          created_at: string
          expiry_date: string | null
          id: string
          lot_number: string
          product_id: string
          quantity: number
        }
        Insert: {
          cost_price?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          lot_number: string
          product_id: string
          quantity?: number
        }
        Update: {
          cost_price?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          lot_number?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_lots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          id: string
          lot_id: string | null
          move_type: Database["public"]["Enums"]["inventory_move_type"]
          notes: string | null
          product_id: string
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          unit_cost: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lot_id?: string | null
          move_type: Database["public"]["Enums"]["inventory_move_type"]
          notes?: string | null
          product_id: string
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          unit_cost?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lot_id?: string | null
          move_type?: Database["public"]["Enums"]["inventory_move_type"]
          notes?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          unit_cost?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "inventory_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_lines: {
        Row: {
          description: string
          id: string
          invoice_id: string
          product_id: string | null
          quantity: number
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          unit_price: number
        }
        Insert: {
          description: string
          id?: string
          invoice_id: string
          product_id?: string | null
          quantity: number
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          unit_price: number
        }
        Update: {
          description?: string
          id?: string
          invoice_id?: string
          product_id?: string | null
          quantity?: number
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices_issued"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_series: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          invoice_type: Database["public"]["Enums"]["invoice_type"]
          name: string
          next_number: number
          prefix: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          name: string
          next_number?: number
          prefix: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          name?: string
          next_number?: number
          prefix?: string
        }
        Relationships: []
      }
      invoices_issued: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          invoice_number: string
          invoice_type: Database["public"]["Enums"]["invoice_type"]
          issued_at: string
          notes: string | null
          original_invoice_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          refund_id: string | null
          sale_id: string | null
          series_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_breakdown: Json | null
          tax_total: number
          total: number
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_number: string
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          issued_at?: string
          notes?: string | null
          original_invoice_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          refund_id?: string | null
          sale_id?: string | null
          series_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_breakdown?: Json | null
          tax_total?: number
          total?: number
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_number?: string
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          issued_at?: string
          notes?: string | null
          original_invoice_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          refund_id?: string | null
          sale_id?: string | null
          series_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_breakdown?: Json | null
          tax_total?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_issued_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_issued_original_invoice_id_fkey"
            columns: ["original_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices_issued"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_issued_refund_id_fkey"
            columns: ["refund_id"]
            isOneToOne: false
            referencedRelation: "refunds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_issued_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_issued_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "invoice_series"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          confirmed_by: string | null
          created_at: string
          created_by: string | null
          description: string
          entry_date: string
          entry_number: number
          id: string
          reference_id: string | null
          reference_type: string | null
          status: Database["public"]["Enums"]["journal_entry_status"]
        }
        Insert: {
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          entry_date?: string
          entry_number?: number
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["journal_entry_status"]
        }
        Update: {
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          entry_date?: string
          entry_number?: number
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["journal_entry_status"]
        }
        Relationships: []
      }
      journal_entry_lines: {
        Row: {
          account_code: string
          created_at: string
          credit: number
          debit: number
          description: string | null
          entry_id: string
          id: string
        }
        Insert: {
          account_code: string
          created_at?: string
          credit?: number
          debit?: number
          description?: string | null
          entry_id: string
          id?: string
        }
        Update: {
          account_code?: string
          created_at?: string
          credit?: number
          debit?: number
          description?: string | null
          entry_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_account_code_fkey"
            columns: ["account_code"]
            isOneToOne: false
            referencedRelation: "accounting_accounts"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "journal_entry_lines_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      product_price_history: {
        Row: {
          changed_by: string | null
          created_at: string
          field_changed: string
          id: string
          new_value: string | null
          old_value: string | null
          product_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          field_changed: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          product_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          field_changed?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          avg_cost: number | null
          brand_id: string | null
          category_id: string | null
          cost_price: number
          created_at: string
          description: string | null
          ean: string | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          reorder_point: number | null
          sale_price: number
          sku: string | null
          stock_max: number | null
          stock_min: number | null
          stock_on_hand: number
          supplier_id: string | null
          tags: string[] | null
          tax_rate_id: string | null
          track_lots: boolean | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          avg_cost?: number | null
          brand_id?: string | null
          category_id?: string | null
          cost_price?: number
          created_at?: string
          description?: string | null
          ean?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          reorder_point?: number | null
          sale_price?: number
          sku?: string | null
          stock_max?: number | null
          stock_min?: number | null
          stock_on_hand?: number
          supplier_id?: string | null
          tags?: string[] | null
          tax_rate_id?: string | null
          track_lots?: boolean | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          avg_cost?: number | null
          brand_id?: string | null
          category_id?: string | null
          cost_price?: number
          created_at?: string
          description?: string | null
          ean?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          reorder_point?: number | null
          sale_price?: number
          sku?: string | null
          stock_max?: number | null
          stock_min?: number | null
          stock_on_hand?: number
          supplier_id?: string | null
          tags?: string[] | null
          tax_rate_id?: string | null
          track_lots?: boolean | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tax_rate_id_fkey"
            columns: ["tax_rate_id"]
            isOneToOne: false
            referencedRelation: "tax_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_order_lines: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity_ordered: number
          quantity_received: number | null
          subtotal: number | null
          tax_rate: number | null
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity_ordered: number
          quantity_received?: number | null
          subtotal?: number | null
          tax_rate?: number | null
          unit_cost: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity_ordered?: number
          quantity_received?: number | null
          subtotal?: number | null
          tax_rate?: number | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_lines_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          expected_date: string | null
          id: string
          notes: string | null
          order_number: number
          received_date: string | null
          status: Database["public"]["Enums"]["purchase_order_status"]
          subtotal: number | null
          supplier_id: string
          tax_total: number | null
          total: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_number?: number
          received_date?: string | null
          status?: Database["public"]["Enums"]["purchase_order_status"]
          subtotal?: number | null
          supplier_id: string
          tax_total?: number | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_number?: number
          received_date?: string | null
          status?: Database["public"]["Enums"]["purchase_order_status"]
          subtotal?: number | null
          supplier_id?: string
          tax_total?: number | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          created_at: string
          id: string
          is_partial: boolean | null
          reason: string
          sale_id: string
          status: string
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_partial?: boolean | null
          reason: string
          sale_id: string
          status?: string
          total?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_partial?: boolean | null
          reason?: string
          sale_id?: string
          status?: string
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_lines: {
        Row: {
          cost_price: number | null
          created_at: string
          discount_percent: number | null
          id: string
          lot_id: string | null
          product_id: string
          quantity: number
          sale_id: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          unit_price: number
        }
        Insert: {
          cost_price?: number | null
          created_at?: string
          discount_percent?: number | null
          id?: string
          lot_id?: string | null
          product_id: string
          quantity: number
          sale_id: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          unit_price: number
        }
        Update: {
          cost_price?: number | null
          created_at?: string
          discount_percent?: number | null
          id?: string
          lot_id?: string | null
          product_id?: string
          quantity?: number
          sale_id?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_lines_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "inventory_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_lines_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          cash_session_id: string | null
          created_at: string
          customer_id: string | null
          discount_total: number
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          sale_number: number
          status: string
          subtotal: number
          tax_total: number
          total: number
          user_id: string
        }
        Insert: {
          cash_session_id?: string | null
          created_at?: string
          customer_id?: string | null
          discount_total?: number
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          sale_number?: number
          status?: string
          subtotal?: number
          tax_total?: number
          total?: number
          user_id: string
        }
        Update: {
          cash_session_id?: string | null
          created_at?: string
          customer_id?: string | null
          discount_total?: number
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          sale_number?: number
          status?: string
          subtotal?: number
          tax_total?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_count_lines: {
        Row: {
          counted_qty: number | null
          created_at: string
          difference: number | null
          expected_qty: number | null
          id: string
          notes: string | null
          product_id: string
          session_id: string
        }
        Insert: {
          counted_qty?: number | null
          created_at?: string
          difference?: number | null
          expected_qty?: number | null
          id?: string
          notes?: string | null
          product_id: string
          session_id: string
        }
        Update: {
          counted_qty?: number | null
          created_at?: string
          difference?: number | null
          expected_qty?: number | null
          id?: string
          notes?: string | null
          product_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_count_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_count_lines_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "stock_count_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_count_sessions: {
        Row: {
          approved_by: string | null
          completed_at: string | null
          id: string
          name: string | null
          notes: string | null
          started_at: string
          started_by: string | null
          status: string
        }
        Insert: {
          approved_by?: string | null
          completed_at?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          started_at?: string
          started_by?: string | null
          status?: string
        }
        Update: {
          approved_by?: string | null
          completed_at?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          started_at?: string
          started_by?: string | null
          status?: string
        }
        Relationships: []
      }
      supplier_invoices: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          paid: boolean | null
          paid_at: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          purchase_order_id: string | null
          subtotal: number
          supplier_id: string
          tax_breakdown: Json | null
          tax_total: number
          total: number
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid?: boolean | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          purchase_order_id?: string | null
          subtotal?: number
          supplier_id: string
          tax_breakdown?: Json | null
          tax_total?: number
          total?: number
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          paid?: boolean | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          purchase_order_id?: string | null
          subtotal?: number
          supplier_id?: string
          tax_breakdown?: Json | null
          tax_total?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "supplier_invoices_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          active: boolean | null
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          iban: string | null
          id: string
          moq: string | null
          name: string
          nif: string | null
          notes: string | null
          payment_days: number | null
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          shipping_conditions: string | null
          supplier_type: Database["public"]["Enums"]["supplier_type"]
          updated_at: string
          website: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          iban?: string | null
          id?: string
          moq?: string | null
          name: string
          nif?: string | null
          notes?: string | null
          payment_days?: number | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          shipping_conditions?: string | null
          supplier_type?: Database["public"]["Enums"]["supplier_type"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          iban?: string | null
          id?: string
          moq?: string | null
          name?: string
          nif?: string | null
          notes?: string | null
          payment_days?: number | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          shipping_conditions?: string | null
          supplier_type?: Database["public"]["Enums"]["supplier_type"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      tax_rates: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          rate: number
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          rate: number
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          rate?: number
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "cajero"
        | "inventario"
        | "contable"
        | "auditor"
      cash_move_type:
        | "apertura"
        | "venta"
        | "retiro"
        | "gasto"
        | "cierre"
        | "ajuste"
      inventory_move_type:
        | "compra"
        | "venta"
        | "devolucion"
        | "ajuste"
        | "recuento"
        | "ecommerce"
      invoice_status: "borrador" | "confirmada" | "anulada"
      invoice_type: "simplificada" | "completa" | "rectificativa"
      journal_entry_status: "borrador" | "confirmado" | "bloqueado"
      payment_method:
        | "efectivo"
        | "tarjeta"
        | "bizum"
        | "transferencia"
        | "mixto"
      purchase_order_status:
        | "borrador"
        | "enviado"
        | "en_camino"
        | "recibido"
        | "facturado"
        | "cancelado"
      supplier_type: "manual" | "auto_email"
      sync_event_type:
        | "order_created"
        | "order_updated"
        | "stock_updated"
        | "product_updated"
      valuation_method: "pmp" | "fifo"
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
      app_role: [
        "admin",
        "manager",
        "cajero",
        "inventario",
        "contable",
        "auditor",
      ],
      cash_move_type: [
        "apertura",
        "venta",
        "retiro",
        "gasto",
        "cierre",
        "ajuste",
      ],
      inventory_move_type: [
        "compra",
        "venta",
        "devolucion",
        "ajuste",
        "recuento",
        "ecommerce",
      ],
      invoice_status: ["borrador", "confirmada", "anulada"],
      invoice_type: ["simplificada", "completa", "rectificativa"],
      journal_entry_status: ["borrador", "confirmado", "bloqueado"],
      payment_method: [
        "efectivo",
        "tarjeta",
        "bizum",
        "transferencia",
        "mixto",
      ],
      purchase_order_status: [
        "borrador",
        "enviado",
        "en_camino",
        "recibido",
        "facturado",
        "cancelado",
      ],
      supplier_type: ["manual", "auto_email"],
      sync_event_type: [
        "order_created",
        "order_updated",
        "stock_updated",
        "product_updated",
      ],
      valuation_method: ["pmp", "fifo"],
    },
  },
} as const
