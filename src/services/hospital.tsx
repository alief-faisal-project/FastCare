import { supabase } from "@/lib/supabase";
import { Hospital } from "@/types";

export const fetchHospitals = async () => {
  return await supabase
    .from("hospitals")
    .select("*")
    .order("created_at", { ascending: false });
};

export const createHospital = async (data: Partial<Hospital>) => {
  const { data: result, error } = await supabase
    .from("hospitals")
    .insert([data])
    .select();
  return { data: result?.[0], error };
};

export const editHospital = async (id: string, data: Partial<Hospital>) => {
  const { data: result, error } = await supabase
    .from("hospitals")
    .update(data)
    .eq("id", id)
    .select();
  return { data: result?.[0], error };
};

export const removeHospital = async (id: string) => {
  return await supabase.from("hospitals").delete().eq("id", id);
};
