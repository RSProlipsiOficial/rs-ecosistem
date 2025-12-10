import { supabase } from "./supabase.client";
import { formatError } from "../utils/errors";

/**
 * Tabela: bonuses
 * Campos:
 *  - id
 *  - user_id
 *  - bonus_type ('cycle' | 'depth' | 'fidelity' | 'topSigma')
 *  - amount
 *  - created_at
 */
export const bonusRepo = {
  async insert(userId: string, type: string, amount: number) {
    const { error } = await supabase.from("bonuses").insert({
      user_id: userId,
      bonus_type: type,
      amount,
      created_at: new Date().toISOString(),
    });
    if (error) throw formatError(error);
  },

  async listByUser(userId: string) {
    const { data, error } = await supabase.from("bonuses").select("*").eq("user_id", userId);
    if (error) throw formatError(error);
    return data;
  },
};
