export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      reviews: {
        Row: {
          id: string;
          course_id: string;
          reviewer_id: string | null;
          year: number;
          semester: string;
          body: string | null;
          workload: number | null;
          difficulty: number | null;
          overall: number | null;
          staff_support: number | null;
          is_legacy: boolean;
          is_gt_verified: boolean;
          upvotes: number;
          downvotes: number;
          is_recommended: boolean | null;
          is_good_first_course: boolean | null;
          is_pairable: boolean | null;
          has_group_projects: boolean | null;
          has_writing_assignments: boolean | null;
          has_exams_quizzes: boolean | null;
          has_mandatory_readings: boolean | null;
          has_programming_assignments: boolean | null;
          has_provided_dev_env: boolean | null;
          programming_languages: string[];
          preparation: number | null;
          oms_courses_taken: number | null;
          has_relevant_work_experience: boolean | null;
          experience_level: string | null;
          grade: string | null;
          created_at: string;
          modified_at: string | null;
        };
        Insert: {
          id: string;
          course_id: string;
          reviewer_id?: string | null;
          year: number;
          semester: string;
          body?: string | null;
          workload?: number | null;
          difficulty?: number | null;
          overall?: number | null;
          staff_support?: number | null;
          is_legacy?: boolean;
          is_gt_verified?: boolean;
          upvotes?: number;
          downvotes?: number;
          is_recommended?: boolean | null;
          is_good_first_course?: boolean | null;
          is_pairable?: boolean | null;
          has_group_projects?: boolean | null;
          has_writing_assignments?: boolean | null;
          has_exams_quizzes?: boolean | null;
          has_mandatory_readings?: boolean | null;
          has_programming_assignments?: boolean | null;
          has_provided_dev_env?: boolean | null;
          programming_languages?: string[];
          preparation?: number | null;
          oms_courses_taken?: number | null;
          has_relevant_work_experience?: boolean | null;
          experience_level?: string | null;
          grade?: string | null;
          created_at?: string;
          modified_at?: string | null;
        };
        Update: {
          id?: string;
          course_id?: string;
          reviewer_id?: string | null;
          year?: number;
          semester?: string;
          body?: string | null;
          workload?: number | null;
          difficulty?: number | null;
          overall?: number | null;
          staff_support?: number | null;
          is_legacy?: boolean;
          is_gt_verified?: boolean;
          upvotes?: number;
          downvotes?: number;
          is_recommended?: boolean | null;
          is_good_first_course?: boolean | null;
          is_pairable?: boolean | null;
          has_group_projects?: boolean | null;
          has_writing_assignments?: boolean | null;
          has_exams_quizzes?: boolean | null;
          has_mandatory_readings?: boolean | null;
          has_programming_assignments?: boolean | null;
          has_provided_dev_env?: boolean | null;
          programming_languages?: string[];
          preparation?: number | null;
          oms_courses_taken?: number | null;
          has_relevant_work_experience?: boolean | null;
          experience_level?: string | null;
          grade?: string | null;
          created_at?: string;
          modified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          id: string;
          has_gt_email: boolean;
          education_level: string | null;
          subject_area: string | null;
          work_years: number | null;
          specialization: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          has_gt_email?: boolean;
          education_level?: string | null;
          subject_area?: string | null;
          work_years?: number | null;
          specialization?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          has_gt_email?: boolean;
          education_level?: string | null;
          subject_area?: string | null;
          work_years?: number | null;
          specialization?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_id_mapping: {
        Row: {
          firebase_uid: string;
          supabase_uid: string;
          migrated_at: string;
        };
        Insert: {
          firebase_uid: string;
          supabase_uid: string;
          migrated_at?: string;
        };
        Update: {
          firebase_uid?: string;
          supabase_uid?: string;
          migrated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;
