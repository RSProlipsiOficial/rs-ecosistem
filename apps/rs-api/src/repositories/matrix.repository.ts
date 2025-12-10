import { supabase } from "./supabase.client";
import { formatError } from "../utils/errors";

/**
 * Tabela: matriz_cycles
 * Campos:
 *  - id
 *  - user_id
 *  - matrix_level
 *  - active (boolean)
 *  - reentries (int)
 *  - created_at
 */
export const matrixRepo = {
  async listActive(userId: string) {
    const { data, error } = await supabase
      .from("matriz_cycles")
      .select("*")
      .eq("user_id", userId)
      .eq("active", true);
    if (error) throw formatError(error);
    return data;
  },

  async registerCycle(userId: string, level: number) {
    const { error } = await supabase.from("matriz_cycles").insert({
      user_id: userId,
      cycle_level: level,
      active: true,
      created_at: new Date().toISOString(),
    });
    if (error) throw formatError(error);
  },
};
