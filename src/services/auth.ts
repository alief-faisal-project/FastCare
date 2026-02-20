import { supabase } from "../lib/supabase";

export const register = async (
  email: string,
  password: string,
  name: string,
) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });
};

export const login = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const logout = async () => {
  return await supabase.auth.signOut();
};
