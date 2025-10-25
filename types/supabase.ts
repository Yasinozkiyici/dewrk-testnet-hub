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
      dewrk_testnets: {
        Row: {
          id: string
          slug: string
          name: string
          network: string | null
          status: string | null
          difficulty: string | null
          est_time_minutes: number | null
          reward_type: string | null
          reward_note: string | null
          kyc_required: boolean | null
          requires_wallet: boolean | null
          tags: string[] | null
          categories: string[] | null
          highlights: string[] | null
          prerequisites: string[] | null
          getting_started: Json | null
          discord_roles: Json | null
          website_url: string | null
          github_url: string | null
          twitter_url: string | null
          discord_url: string | null
          dashboard_url: string | null
          has_dashboard: boolean | null
          logo_url: string | null
          hero_image_url: string | null
          tasks_count: number | null
          total_raised_usd: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          network?: string | null
          status?: string | null
          difficulty?: string | null
          est_time_minutes?: number | null
          reward_type?: string | null
          reward_note?: string | null
          kyc_required?: boolean | null
          requires_wallet?: boolean | null
          tags?: string[] | null
          categories?: string[] | null
          highlights?: string[] | null
          prerequisites?: string[] | null
          getting_started?: Json | null
          discord_roles?: Json | null
          website_url?: string | null
          github_url?: string | null
          twitter_url?: string | null
          discord_url?: string | null
          dashboard_url?: string | null
          has_dashboard?: boolean | null
          logo_url?: string | null
          hero_image_url?: string | null
          tasks_count?: number | null
          total_raised_usd?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          network?: string | null
          status?: string | null
          difficulty?: string | null
          est_time_minutes?: number | null
          reward_type?: string | null
          reward_note?: string | null
          kyc_required?: boolean | null
          requires_wallet?: boolean | null
          tags?: string[] | null
          categories?: string[] | null
          highlights?: string[] | null
          prerequisites?: string[] | null
          getting_started?: Json | null
          discord_roles?: Json | null
          website_url?: string | null
          github_url?: string | null
          twitter_url?: string | null
          discord_url?: string | null
          dashboard_url?: string | null
          has_dashboard?: boolean | null
          logo_url?: string | null
          hero_image_url?: string | null
          tasks_count?: number | null
          total_raised_usd?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      dewrk_v_testnets_list: {
        Row: {
          slug: string
          name: string
          network: string | null
          status: string | null
          difficulty: string | null
          estTimeMinutes: number | null
          rewardType: string | null
          rewardNote: string | null
          kycRequired: boolean | null
          tags: string[] | null
          tasksCount: number | null
          updated: string | null
          totalRaisedUSD: number | null
          hasDashboard: boolean | null
          logoUrl: string | null
        }
      }
      dewrk_v_testnet_detail: {
        Row: {
          slug: string
          name: string
          network: string | null
          status: string | null
          difficulty: string | null
          estTimeMinutes: number | null
          rewardType: string | null
          rewardNote: string | null
          kycRequired: boolean | null
          requiresWallet: boolean | null
          tags: string[] | null
          categories: string[] | null
          highlights: string[] | null
          prerequisites: string[] | null
          gettingStarted: Json | null
          socials: Json | null
          dashboardUrl: string | null
          hasDashboard: boolean | null
          totalRaisedUSD: number | null
          discordRoles: Json | null
          logoUrl: string | null
          heroImageUrl: string | null
          tasksCount: number | null
          updated: string | null
          created: string | null
        }
      }
    }
    Functions: {
      now: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
  }
}

