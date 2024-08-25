export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      review: {
        Row: {
          body: string
          courseId: string
          created: number
          difficulty: number
          downvotes: number
          id: number
          isGTVerifiedReviewer: boolean
          isLegacy: boolean
          modified: number | null
          overall: number
          reviewerId: string | null
          reviewId: string
          semesterId: string
          upvotes: number
          workload: number
          year: number
        }
        Insert: {
          body?: string
          courseId: string
          created: number
          difficulty: number
          downvotes?: number
          id?: number
          isGTVerifiedReviewer?: boolean
          isLegacy?: boolean
          modified?: number | null
          overall: number
          reviewerId?: string | null
          reviewId: string
          semesterId: string
          upvotes?: number
          workload: number
          year: number
        }
        Update: {
          body?: string
          courseId?: string
          created?: number
          difficulty?: number
          downvotes?: number
          id?: number
          isGTVerifiedReviewer?: boolean
          isLegacy?: boolean
          modified?: number | null
          overall?: number
          reviewerId?: string | null
          reviewId?: string
          semesterId?: string
          upvotes?: number
          workload?: number
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      getAllReviews: {
        Args: {
          limit_count?: number
        }
        Returns: {
          reviewId: string
          courseId: string
          year: number
          semesterId: string
          isLegacy: boolean
          reviewerId: string
          isGTVerifiedReviewer: boolean
          created: number
          modified: number
          workload: number
          difficulty: number
          overall: number
          upvotes: number
          downvotes: number
          body: string
        }[]
      }
      getReviewByReviewId: {
        Args: {
          review_id: string
        }
        Returns: {
          reviewId: string
          courseId: string
          year: number
          semesterId: string
          isLegacy: boolean
          reviewerId: string
          isGTVerifiedReviewer: boolean
          created: number
          modified: number
          workload: number
          difficulty: number
          overall: number
          upvotes: number
          downvotes: number
          body: string
        }[]
      }
      getReviewsByCourseId: {
        Args: {
          course_id?: string
        }
        Returns: {
          reviewId: string
          courseId: string
          year: number
          semesterId: string
          isLegacy: boolean
          reviewerId: string
          isGTVerifiedReviewer: boolean
          created: number
          modified: number
          workload: number
          difficulty: number
          overall: number
          upvotes: number
          downvotes: number
          body: string
        }[]
      }
      getReviewsByUserId: {
        Args: {
          user_id: string
        }
        Returns: {
          reviewId: string
          courseId: string
          year: number
          semesterId: string
          isLegacy: boolean
          reviewerId: string
          isGTVerifiedReviewer: boolean
          created: number
          modified: number
          workload: number
          difficulty: number
          overall: number
          upvotes: number
          downvotes: number
          body: string
        }[]
      }
      getStatsByCourseId: {
        Args: {
          course_id?: string
        }
        Returns: {
          courseId: string
          numReviews: number
          avgWorkload: number
          avgDifficulty: number
          avgOverall: number
        }[]
      }
      getStatsByCourseYearSemester: {
        Args: {
          course_id?: string
          year_?: number
          semester_id?: string
        }
        Returns: {
          courseId: string
          year: number
          semesterId: string
          numReviews: number
          avgWorkload: number
          avgDifficulty: number
          avgOverall: number
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
