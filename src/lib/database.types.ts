// Database types for HabitTrack Supabase tables
// These types are derived from the database schema

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
            hydration_logs: {
                Row: {
                    id: string
                    user_id: string
                    amount: number
                    label: string
                    logged_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    amount: number
                    label?: string
                    logged_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    amount?: number
                    label?: string
                    logged_at?: string
                    created_at?: string
                }
                Relationships: []
            }
            hydration_settings: {
                Row: {
                    id: string
                    user_id: string
                    daily_goal: number
                    presets: Json // Array of {amount: number, label?: string}
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    daily_goal?: number
                    presets?: Json
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    daily_goal?: number
                    presets?: Json
                    updated_at?: string
                }
                Relationships: []
            }
            sleep_logs: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    lights_out: string
                    wake_up: string
                    out_of_bed: string
                    latency: number
                    awakenings: number
                    awake_duration: number
                    subjective_quality: number
                    total_time_in_bed: number | null
                    total_sleep_time: number | null
                    sleep_efficiency: number | null
                    sleep_quality_score: number | null
                    sleep_debt: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    lights_out: string
                    wake_up: string
                    out_of_bed: string
                    latency?: number
                    awakenings?: number
                    awake_duration?: number
                    subjective_quality?: number
                    total_time_in_bed?: number | null
                    total_sleep_time?: number | null
                    sleep_efficiency?: number | null
                    sleep_quality_score?: number | null
                    sleep_debt?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    lights_out?: string
                    wake_up?: string
                    out_of_bed?: string
                    latency?: number
                    awakenings?: number
                    awake_duration?: number
                    subjective_quality?: number
                    total_time_in_bed?: number | null
                    total_sleep_time?: number | null
                    sleep_efficiency?: number | null
                    sleep_quality_score?: number | null
                    sleep_debt?: number | null
                    created_at?: string
                }
                Relationships: []
            }
            sleep_settings: {
                Row: {
                    id: string
                    user_id: string
                    target_hours: number
                    target_bedtime: string | null
                    target_wake_time: string | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    target_hours?: number
                    target_bedtime?: string | null
                    target_wake_time?: string | null
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    target_hours?: number
                    target_bedtime?: string | null
                    target_wake_time?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    id: string
                    display_name: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    display_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    display_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
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

// Convenience type aliases
export type HydrationLog = Database['public']['Tables']['hydration_logs']['Row']
export type HydrationLogInsert = Database['public']['Tables']['hydration_logs']['Insert']
export type HydrationSettings = Database['public']['Tables']['hydration_settings']['Row']
export type HydrationSettingsInsert = Database['public']['Tables']['hydration_settings']['Insert']
export type HydrationSettingsUpdate = Database['public']['Tables']['hydration_settings']['Update']
export type SleepLog = Database['public']['Tables']['sleep_logs']['Row']
export type SleepLogInsert = Database['public']['Tables']['sleep_logs']['Insert']
export type SleepSettings = Database['public']['Tables']['sleep_settings']['Row']
export type SleepSettingsInsert = Database['public']['Tables']['sleep_settings']['Insert']
export type SleepSettingsUpdate = Database['public']['Tables']['sleep_settings']['Update']
export type Profile = Database['public']['Tables']['profiles']['Row']
