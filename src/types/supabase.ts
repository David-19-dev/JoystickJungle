export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          role: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          type: string
          start_date: string
          end_date: string
          remaining_minutes: number
          status: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          start_date: string
          end_date: string
          remaining_minutes: number
          status: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          start_date?: string
          end_date?: string
          remaining_minutes?: number
          status?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      gaming_sessions: {
        Row: {
          id: string
          user_id: string
          platform: string
          start_time: string
          end_time: string
          duration_minutes: number
          status: string
          players_count: number
          extras: string[] | null
          total_price: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          start_time: string
          end_time: string
          duration_minutes: number
          status: string
          players_count: number
          extras?: string[] | null
          total_price: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          start_time?: string
          end_time?: string
          duration_minutes?: number
          status?: string
          players_count?: number
          extras?: string[] | null
          total_price?: number
          created_at?: string
          updated_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          payment_method: string
          status: string
          reference: string
          session_id: string | null
          subscription_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency: string
          payment_method: string
          status: string
          reference: string
          session_id?: string | null
          subscription_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          payment_method?: string
          status?: string
          reference?: string
          session_id?: string | null
          subscription_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category: string
          stock: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category: string
          stock?: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category?: string
          stock?: number
          created_at?: string
          updated_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: string
          total_amount: number
          payment_method: string
          payment_reference: string | null
          shipping_address: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          total_amount: number
          payment_method: string
          payment_reference?: string | null
          shipping_address?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          total_amount?: number
          payment_method?: string
          payment_reference?: string | null
          shipping_address?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}