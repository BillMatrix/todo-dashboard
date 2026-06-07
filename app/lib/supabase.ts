import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Subject = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  status: "not_started" | "in_progress" | "done";
  created_at: string;
  updated_at: string;
};

export type TaskWithSubject = Task & { subject?: Subject };
