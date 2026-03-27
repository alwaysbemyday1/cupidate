export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      cupids: {
        Row: {
          id: string;
          nickname: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nickname: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nickname?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      cupid_connections: {
        Row: {
          id: string;
          requester_cupid_id: string;
          addressee_cupid_id: string;
          status: "pending" | "accepted" | "rejected" | "blocked";
          responded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_cupid_id: string;
          addressee_cupid_id: string;
          status?: "pending" | "accepted" | "rejected" | "blocked";
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_cupid_id?: string;
          addressee_cupid_id?: string;
          status?: "pending" | "accepted" | "rejected" | "blocked";
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cupidates: {
        Row: {
          id: string;
          owner_cupid_id: string;
          display_name: string;
          birth_year: number | null;
          gender: string | null;
          bio: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_cupid_id: string;
          display_name: string;
          birth_year?: number | null;
          gender?: string | null;
          bio?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_cupid_id?: string;
          display_name?: string;
          birth_year?: number | null;
          gender?: string | null;
          bio?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      cupidate_preferences: {
        Row: {
          id: string;
          cupidate_id: string;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cupidate_id: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cupidate_id?: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      match_candidates: {
        Row: {
          id: string;
          source_cupidate_id: string;
          target_cupidate_id: string;
          match_score: number;
          match_status: "proposed" | "accepted" | "dismissed";
          reason: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_cupidate_id: string;
          target_cupidate_id: string;
          match_score: number;
          match_status?: "proposed" | "accepted" | "dismissed";
          reason?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_cupidate_id?: string;
          target_cupidate_id?: string;
          match_score?: number;
          match_status?: "proposed" | "accepted" | "dismissed";
          reason?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
