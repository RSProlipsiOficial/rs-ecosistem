import { supabase } from "./supabase.client";
import { formatError } from "../utils/errors";

/**
 * Tabela: users
 * Campos esperados:
 *  - id (uuid)
 *  - name
 *  - email
 *  - pin
 *  - wallet_balance
 *  - status
 */
export const usersRepo = {
  async listAll() {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw formatError(error);
    return data;
  },

  async findById(id: string) {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
    if (error) throw formatError(error);
    return data;
  },

  async updateWallet(id: string, value: number) {
    const { error } = await supabase
      .from("users")
      .update({ wallet_balance: value })
      .eq("id", id);
    if (error) throw formatError(error);
  },
};
