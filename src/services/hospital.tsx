import { supabase } from "../lib/supabase";

export const getHospitals = async () => {
  return await supabase.from("hospitals").select("*");
};

export const createHospital = async (data: any) => {
  return await supabase.from("hospitals").insert(data);
};

export const updateHospital = async (id: string, data: any) => {
  return await supabase.from("hospitals").update(data).eq("id", id);
};

export const deleteHospital = async (id: string) => {
  return await supabase.from("hospitals").delete().eq("id", id);
  
};
