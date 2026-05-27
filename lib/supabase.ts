import { createClient } from '@supabase/supabase-js'
import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client (for client components)
export const createBrowserClient = () =>
  createSSRBrowserClient(supabaseUrl, supabaseAnonKey)

// Raw client (for use outside React context)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          university: string | null
          department: string | null
          year: number | null
          advisor_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          university?: string | null
          department?: string | null
          year?: number | null
          advisor_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          university?: string | null
          department?: string | null
          year?: number | null
          advisor_name?: string | null
          created_at?: string
        }
      }
      papers: {
        Row: {
          id: string
          user_id: string
          title: string
          venue: string | null
          status: 'idea' | 'writing' | 'submitted' | 'under_review' | 'published' | 'rejected'
          deadline: string | null
          co_authors: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          venue?: string | null
          status?: 'idea' | 'writing' | 'submitted' | 'under_review' | 'published' | 'rejected'
          deadline?: string | null
          co_authors?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          venue?: string | null
          status?: 'idea' | 'writing' | 'submitted' | 'under_review' | 'published' | 'rejected'
          deadline?: string | null
          co_authors?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      literature: {
        Row: {
          id: string
          user_id: string
          title: string
          authors: string | null
          doi_link: string | null
          status: 'to-read' | 'reading' | 'done'
          tags: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          authors?: string | null
          doi_link?: string | null
          status?: 'to-read' | 'reading' | 'done'
          tags?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          authors?: string | null
          doi_link?: string | null
          status?: 'to-read' | 'reading' | 'done'
          tags?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      experiments: {
        Row: {
          id: string
          user_id: string
          title: string
          hypothesis: string | null
          method: string | null
          status: 'planned' | 'running' | 'done' | 'failed'
          outcome: string | null
          date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          hypothesis?: string | null
          method?: string | null
          status?: 'planned' | 'running' | 'done' | 'failed'
          outcome?: string | null
          date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          hypothesis?: string | null
          method?: string | null
          status?: 'planned' | 'running' | 'done' | 'failed'
          outcome?: string | null
          date?: string | null
          created_at?: string
        }
      }
      deadlines: {
        Row: {
          id: string
          user_id: string
          title: string
          type: string | null
          deadline_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type?: string | null
          deadline_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: string | null
          deadline_date?: string
          notes?: string | null
          created_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          user_id: string
          date: string
          agenda: string | null
          action_items: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          agenda?: string | null
          action_items?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          agenda?: string | null
          action_items?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      focus_blocks: {
        Row: {
          id: string
          user_id: string
          day_of_week: number
          start_time: string
          end_time: string
          label: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          day_of_week: number
          start_time: string
          end_time: string
          label: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          label?: string
          created_at?: string
        }
      }
      wins: {
        Row: {
          id: string
          user_id: string
          title: string
          type: string
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type: string
          date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: string
          date?: string
          notes?: string | null
          created_at?: string
        }
      }
      rejections: {
        Row: {
          id: string
          user_id: string
          title: string
          type: string
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type: string
          date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: string
          date?: string
          notes?: string | null
          created_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          tags: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          tags?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          tags?: string | null
          created_at?: string
        }
      }
    }
  }
}
