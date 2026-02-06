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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      arc_applications: {
        Row: {
          awareness: string | null
          challenges: string[] | null
          created_at: string
          desired_shift: string | null
          email: string
          final_checkin: string | null
          final_comment: string | null
          full_name: string
          id: string
          internal_experience: string | null
          needs: string[] | null
          notes: string | null
          statements: string[] | null
          status: string | null
          tried_note: string | null
          tried_options: string[] | null
          updated_at: string
          where_are_you: string | null
        }
        Insert: {
          awareness?: string | null
          challenges?: string[] | null
          created_at?: string
          desired_shift?: string | null
          email: string
          final_checkin?: string | null
          final_comment?: string | null
          full_name: string
          id?: string
          internal_experience?: string | null
          needs?: string[] | null
          notes?: string | null
          statements?: string[] | null
          status?: string | null
          tried_note?: string | null
          tried_options?: string[] | null
          updated_at?: string
          where_are_you?: string | null
        }
        Update: {
          awareness?: string | null
          challenges?: string[] | null
          created_at?: string
          desired_shift?: string | null
          email?: string
          final_checkin?: string | null
          final_comment?: string | null
          full_name?: string
          id?: string
          internal_experience?: string | null
          needs?: string[] | null
          notes?: string | null
          statements?: string[] | null
          status?: string | null
          tried_note?: string | null
          tried_options?: string[] | null
          updated_at?: string
          where_are_you?: string | null
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          audio_url: string
          category_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          focus_tags: Json | null
          goal_fit: Json | null
          id: string
          image_url: string | null
          is_published: boolean | null
          order_index: number | null
          program_id: string | null
          recommended_for_time: string | null
          requires_subscription: boolean | null
          safety_note: string | null
          short_description: string | null
          show_safety_reminder: boolean | null
          teacher_name: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          audio_url: string
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          focus_tags?: Json | null
          goal_fit?: Json | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          order_index?: number | null
          program_id?: string | null
          recommended_for_time?: string | null
          requires_subscription?: boolean | null
          safety_note?: string | null
          short_description?: string | null
          show_safety_reminder?: boolean | null
          teacher_name?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          audio_url?: string
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          focus_tags?: Json | null
          goal_fit?: Json | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          order_index?: number | null
          program_id?: string | null
          recommended_for_time?: string | null
          requires_subscription?: boolean | null
          safety_note?: string | null
          short_description?: string | null
          show_safety_reminder?: boolean | null
          teacher_name?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      client_weekly_notes: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          notes: string | null
          updated_at: string | null
          week_number: number
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          week_number: number
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          week_number?: number
        }
        Relationships: []
      }
      content_pages: {
        Row: {
          content: string
          id: string
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          id?: string
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          id?: string
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          content_type: string
          course_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          media_url: string
          order_index: number
          title: string
          updated_at: string | null
        }
        Insert: {
          content_type?: string
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          media_url: string
          order_index?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          content_type?: string
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          media_url?: string
          order_index?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          currency: string
          description: string | null
          duration_days: number
          id: string
          image_url: string | null
          is_published: boolean | null
          order_index: number | null
          price_cents: number
          short_description: string | null
          slug: string
          stripe_price_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          description?: string | null
          duration_days?: number
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          order_index?: number | null
          price_cents?: number
          short_description?: string | null
          slug: string
          stripe_price_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          description?: string | null
          duration_days?: number
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          order_index?: number | null
          price_cents?: number
          short_description?: string | null
          slug?: string
          stripe_price_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_tracking: {
        Row: {
          completed: boolean | null
          created_at: string | null
          email: string
          email_type: string
          id: string
          last_sent_at: string | null
          metadata: Json | null
          next_send_at: string | null
          sequence_step: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          email: string
          email_type: string
          id?: string
          last_sent_at?: string | null
          metadata?: Json | null
          next_send_at?: string | null
          sequence_step?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          email?: string
          email_type?: string
          id?: string
          last_sent_at?: string | null
          metadata?: Json | null
          next_send_at?: string | null
          sequence_step?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      event_bookings: {
        Row: {
          attendee_email: string
          attendee_name: string
          created_at: string
          event_date: string | null
          event_id: string
          event_type: string | null
          has_accepted_safety: boolean
          id: string
          payment_status: string
          quantity: number
          reminder_sent_at: string | null
          signature_data: string
          stripe_payment_intent_id: string | null
          total_amount: number
          user_id: string
        }
        Insert: {
          attendee_email: string
          attendee_name: string
          created_at?: string
          event_date?: string | null
          event_id: string
          event_type?: string | null
          has_accepted_safety?: boolean
          id?: string
          payment_status?: string
          quantity?: number
          reminder_sent_at?: string | null
          signature_data: string
          stripe_payment_intent_id?: string | null
          total_amount: number
          user_id: string
        }
        Update: {
          attendee_email?: string
          attendee_name?: string
          created_at?: string
          event_date?: string | null
          event_id?: string
          event_type?: string | null
          has_accepted_safety?: boolean
          id?: string
          payment_status?: string
          quantity?: number
          reminder_sent_at?: string | null
          signature_data?: string
          stripe_payment_intent_id?: string | null
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string
          created_at: string
          description: string | null
          event_date: string
          event_time: string
          id: string
          image_url: string | null
          is_published: boolean
          price: number
          teacher_name: string
          tickets_sold: number
          title: string
          total_tickets: number
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          description?: string | null
          event_date: string
          event_time: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          price: number
          teacher_name: string
          tickets_sold?: number
          title: string
          total_tickets: number
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          price?: number
          teacher_name?: string
          tickets_sold?: number
          title?: string
          total_tickets?: number
          updated_at?: string
        }
        Relationships: []
      }
      featured_class: {
        Row: {
          category: string
          class_id: string
          created_at: string
          description: string
          duration: number
          id: string
          image_url: string
          is_active: boolean | null
          teacher_name: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          class_id: string
          created_at?: string
          description: string
          duration: number
          id?: string
          image_url: string
          is_active?: boolean | null
          teacher_name: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          class_id?: string
          created_at?: string
          description?: string
          duration?: number
          id?: string
          image_url?: string
          is_active?: boolean | null
          teacher_name?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          actioned: boolean | null
          actioned_at: string | null
          actioned_by: string | null
          created_at: string | null
          id: string
          message: string
          user_id: string
        }
        Insert: {
          actioned?: boolean | null
          actioned_at?: string | null
          actioned_by?: string | null
          created_at?: string | null
          id?: string
          message: string
          user_id: string
        }
        Update: {
          actioned?: boolean | null
          actioned_at?: string | null
          actioned_by?: string | null
          created_at?: string | null
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      guest_teachers: {
        Row: {
          created_at: string
          guest_join_url: string | null
          id: string
          is_active: boolean
          linked_session_id: string | null
          name: string
          photo_url: string | null
          session_date: string
          session_title: string
          short_description: string | null
          title: string
          updated_at: string
          what_to_expect: string[] | null
        }
        Insert: {
          created_at?: string
          guest_join_url?: string | null
          id?: string
          is_active?: boolean
          linked_session_id?: string | null
          name: string
          photo_url?: string | null
          session_date: string
          session_title: string
          short_description?: string | null
          title: string
          updated_at?: string
          what_to_expect?: string[] | null
        }
        Update: {
          created_at?: string
          guest_join_url?: string | null
          id?: string
          is_active?: boolean
          linked_session_id?: string | null
          name?: string
          photo_url?: string | null
          session_date?: string
          session_title?: string
          short_description?: string | null
          title?: string
          updated_at?: string
          what_to_expect?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_teachers_linked_session_id_fkey"
            columns: ["linked_session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_session_attendance: {
        Row: {
          id: string
          joined_at: string
          left_at: string | null
          role: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string
          left_at?: string | null
          role?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      live_sessions: {
        Row: {
          access_level: string
          attendee_count: number | null
          created_at: string
          created_by: string | null
          daily_room_name: string | null
          daily_room_url: string | null
          description: string | null
          end_time: string | null
          guest_link_expires_at: string | null
          guest_token: string | null
          host_token: string | null
          id: string
          notes: string | null
          recording_enabled: boolean | null
          recording_url: string | null
          start_time: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          access_level?: string
          attendee_count?: number | null
          created_at?: string
          created_by?: string | null
          daily_room_name?: string | null
          daily_room_url?: string | null
          description?: string | null
          end_time?: string | null
          guest_link_expires_at?: string | null
          guest_token?: string | null
          host_token?: string | null
          id?: string
          notes?: string | null
          recording_enabled?: boolean | null
          recording_url?: string | null
          start_time: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          access_level?: string
          attendee_count?: number | null
          created_at?: string
          created_by?: string | null
          daily_room_name?: string | null
          daily_room_url?: string | null
          description?: string | null
          end_time?: string | null
          guest_link_expires_at?: string | null
          guest_token?: string | null
          host_token?: string | null
          id?: string
          notes?: string | null
          recording_enabled?: boolean | null
          recording_url?: string | null
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      march_messages: {
        Row: {
          created_at: string | null
          id: string
          is_from_march: boolean | null
          message_text: string
          step: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_from_march?: boolean | null
          message_text: string
          step?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_from_march?: boolean | null
          message_text?: string
          step?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "march_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_calls: {
        Row: {
          calendar_event_id: string | null
          calendar_invite_sent: boolean | null
          created_at: string | null
          id: string
          notes: string | null
          recording_url: string | null
          scheduled_date: string
          status: string | null
          updated_at: string | null
          user_id: string
          zoom_link: string | null
        }
        Insert: {
          calendar_event_id?: string | null
          calendar_invite_sent?: boolean | null
          created_at?: string | null
          id?: string
          notes?: string | null
          recording_url?: string | null
          scheduled_date: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          zoom_link?: string | null
        }
        Update: {
          calendar_event_id?: string | null
          calendar_invite_sent?: boolean | null
          created_at?: string | null
          id?: string
          notes?: string | null
          recording_url?: string | null
          scheduled_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          zoom_link?: string | null
        }
        Relationships: []
      }
      mentorship_invitations: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          invite_token: string
          program_type: string
          used: boolean
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          expires_at?: string
          id?: string
          invite_token?: string
          program_type: string
          used?: boolean
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          invite_token?: string
          program_type?: string
          used?: boolean
          used_at?: string | null
        }
        Relationships: []
      }
      mentorship_lessons: {
        Row: {
          content_type: string | null
          created_at: string | null
          description: string | null
          document_url: string | null
          duration_minutes: number | null
          files_json: Json | null
          id: string
          is_published: boolean | null
          module_id: string
          order_index: number
          requires_completion_of: string | null
          resources_json: Json | null
          submodule_id: string | null
          title: string
          updated_at: string | null
          video_url: string
          week_number: number | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          document_url?: string | null
          duration_minutes?: number | null
          files_json?: Json | null
          id?: string
          is_published?: boolean | null
          module_id: string
          order_index?: number
          requires_completion_of?: string | null
          resources_json?: Json | null
          submodule_id?: string | null
          title: string
          updated_at?: string | null
          video_url: string
          week_number?: number | null
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          document_url?: string | null
          duration_minutes?: number | null
          files_json?: Json | null
          id?: string
          is_published?: boolean | null
          module_id?: string
          order_index?: number
          requires_completion_of?: string | null
          resources_json?: Json | null
          submodule_id?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "mentorship_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_lessons_requires_completion_of_fkey"
            columns: ["requires_completion_of"]
            isOneToOne: false
            referencedRelation: "mentorship_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_lessons_submodule_id_fkey"
            columns: ["submodule_id"]
            isOneToOne: false
            referencedRelation: "mentorship_submodules"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_modules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_bonus: boolean | null
          is_published: boolean | null
          order_index: number
          program_type: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_bonus?: boolean | null
          is_published?: boolean | null
          order_index?: number
          program_type?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_bonus?: boolean | null
          is_published?: boolean | null
          order_index?: number
          program_type?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mentorship_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          last_position_seconds: number | null
          lesson_id: string
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_position_seconds?: number | null
          lesson_id: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_position_seconds?: number | null
          lesson_id?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "mentorship_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_submodules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          module_id: string
          order_index: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          module_id: string
          order_index?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          module_id?: string
          order_index?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_submodules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "mentorship_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          active: boolean
          email: string
          id: string
          name: string | null
          subscribed_at: string
        }
        Insert: {
          active?: boolean
          email: string
          id?: string
          name?: string | null
          subscribed_at?: string
        }
        Update: {
          active?: boolean
          email?: string
          id?: string
          name?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          status: string
          stripe_payment_intent_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          status: string
          stripe_payment_intent_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          status?: string
          stripe_payment_intent_id?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          email: string
          id: string
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          stripe_session_id: string | null
          stripe_subscription_id: string
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email: string
          id?: string
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          stripe_session_id?: string | null
          stripe_subscription_id: string
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          email?: string
          id?: string
          status?: string
          stripe_customer_id?: string
          stripe_price_id?: string
          stripe_session_id?: string | null
          stripe_subscription_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          full_name: string | null
          has_accepted_march_data_consent: boolean | null
          has_accepted_safety_disclosure: boolean | null
          has_completed_onboarding: boolean | null
          id: string
          last_name: string | null
          march_data_consent_date: string | null
          marketing_consent: boolean | null
          meeting_link: string | null
          mentorship_notes: string | null
          mentorship_started_at: string | null
          phone_number: string | null
          quick_note: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          full_name?: string | null
          has_accepted_march_data_consent?: boolean | null
          has_accepted_safety_disclosure?: boolean | null
          has_completed_onboarding?: boolean | null
          id: string
          last_name?: string | null
          march_data_consent_date?: string | null
          marketing_consent?: boolean | null
          meeting_link?: string | null
          mentorship_notes?: string | null
          mentorship_started_at?: string | null
          phone_number?: string | null
          quick_note?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          full_name?: string | null
          has_accepted_march_data_consent?: boolean | null
          has_accepted_safety_disclosure?: boolean | null
          has_completed_onboarding?: boolean | null
          id?: string
          last_name?: string | null
          march_data_consent_date?: string | null
          marketing_consent?: boolean | null
          meeting_link?: string | null
          mentorship_notes?: string | null
          mentorship_started_at?: string | null
          phone_number?: string | null
          quick_note?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          lesson_count: number | null
          requires_subscription: boolean | null
          short_description: string | null
          teacher_name: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          lesson_count?: number | null
          requires_subscription?: boolean | null
          short_description?: string | null
          teacher_name?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          lesson_count?: number | null
          requires_subscription?: boolean | null
          short_description?: string | null
          teacher_name?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "programs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_history: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          interaction_at: string
          interaction_type: string
          recommended_at: string
          session_id: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          interaction_at?: string
          interaction_type: string
          recommended_at?: string
          session_id: string
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          interaction_at?: string
          interaction_type?: string
          recommended_at?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      session_feedback: {
        Row: {
          class_id: string
          created_at: string | null
          feedback_text: string | null
          helped_with_goal: boolean | null
          id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          feedback_text?: string | null
          helped_with_goal?: boolean | null
          id?: string
          rating?: number | null
          user_id: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          feedback_text?: string | null
          helped_with_goal?: boolean | null
          id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_course_purchases: {
        Row: {
          course_id: string
          id: string
          purchased_at: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          id?: string
          purchased_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          id?: string
          purchased_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favourites: {
        Row: {
          created_at: string
          id: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          last_position_seconds: number | null
          lesson_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_position_seconds?: number | null
          lesson_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_position_seconds?: number | null
          lesson_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_module_unlocks: {
        Row: {
          created_at: string | null
          id: string
          module_id: string
          unlocked_at: string
          unlocked_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          module_id: string
          unlocked_at?: string
          unlocked_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          module_id?: string
          unlocked_at?: string
          unlocked_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_unlocks_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "mentorship_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mood_logs: {
        Row: {
          id: string
          logged_at: string | null
          mood_score: number
          user_id: string
        }
        Insert: {
          id?: string
          logged_at?: string | null
          mood_score: number
          user_id: string
        }
        Update: {
          id?: string
          logged_at?: string | null
          mood_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mood_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding: {
        Row: {
          accountability_enabled: boolean | null
          created_at: string | null
          goals: string[] | null
          id: string
          onboarding_completed: boolean | null
          plan_type: string | null
          time_availability: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accountability_enabled?: boolean | null
          created_at?: string | null
          goals?: string[] | null
          id?: string
          onboarding_completed?: boolean | null
          plan_type?: string | null
          time_availability?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accountability_enabled?: boolean | null
          created_at?: string | null
          goals?: string[] | null
          id?: string
          onboarding_completed?: boolean | null
          plan_type?: string | null
          time_availability?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          avoided_focus_tags: Json | null
          created_at: string
          engagement_patterns: Json | null
          id: string
          last_updated: string
          preferred_durations: Json | null
          preferred_focus_tags: Json | null
          preferred_goals: Json | null
          preferred_session_times: Json | null
          user_id: string
        }
        Insert: {
          avoided_focus_tags?: Json | null
          created_at?: string
          engagement_patterns?: Json | null
          id?: string
          last_updated?: string
          preferred_durations?: Json | null
          preferred_focus_tags?: Json | null
          preferred_goals?: Json | null
          preferred_session_times?: Json | null
          user_id: string
        }
        Update: {
          avoided_focus_tags?: Json | null
          created_at?: string
          engagement_patterns?: Json | null
          id?: string
          last_updated?: string
          preferred_durations?: Json | null
          preferred_focus_tags?: Json | null
          preferred_goals?: Json | null
          preferred_session_times?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          class_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          last_position_seconds: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          class_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_position_seconds?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          class_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_position_seconds?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          active: boolean | null
          created_at: string | null
          deactivated_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          deactivated_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          deactivated_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
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
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "mentorship_diy"
        | "mentorship_guided"
        | "test_user"
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
        "user",
        "mentorship_diy",
        "mentorship_guided",
        "test_user",
      ],
    },
  },
} as const
