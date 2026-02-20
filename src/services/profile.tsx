import { supabase } from "../lib/supabase";

export const getProfile = async (userId: string) => {
  return await supabase.from("profiles").select("*").eq("id", userId).single();
};
