import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User, MasterApiState, RobotInstance, TradingParameters } from '../App';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      const errorMessage = 'Supabase URL or Anon Key is missing. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file and restart your development server.';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

// Type definitions for Supabase data structures
export interface SupabaseUser {
  id: string; // Corresponds to User.id
  email: string;
  name: string;
  doc: string;
  plan: User['plan'];
  subscription_end_date: string; // ISO string
  is_admin: boolean;
  binance_api_key?: string;
  binance_api_secret?: string;
  binance_api_validated: boolean;
  profile_photo_url?: string;
  created_at: string;
}

export interface SupabaseRobotInstance {
  id: string; // Corresponds to RobotInstance.id
  user_id: string;
  type: 'kagi' | 'ai';
  symbol: string;
  timeframe: string;
  max_capital: number;
  is_running: boolean;
  pnl: number;
  trades: number;
  win_rate: number;
  params: TradingParameters; // JSONB in Supabase
  created_at: string;
}


/**
 * Registers a new user in Supabase.
 * @param userData User registration data.
 * @param masterApiState Binance API state.
 * @returns The created user object.
 */
export async function supabaseCreateUser(
  userData: { name: string; email: string; doc: string; plan: User['plan']; subscriptionEndDate: string; isAdmin: boolean },
  masterApiState: MasterApiState,
): Promise<SupabaseUser | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('users').insert({
    email: userData.email,
    name: userData.name,
    doc: userData.doc,
    plan: userData.plan,
    subscription_end_date: userData.subscriptionEndDate,
    is_admin: userData.isAdmin,
    binance_api_key: masterApiState.apiKey,
    binance_api_secret: masterApiState.apiSecret,
    binance_api_validated: masterApiState.isValidated,
    profile_photo_url: null, // No profile photo on registration
  }).select().single();

  if (error) {
    console.error('Supabase createUser error:', error.message);
    throw new Error(`Falha ao registrar usuário: ${error.message}`);
  }
  return data;
}

/**
 * Retrieves a user's profile by email.
 * @param email The user's email.
 * @returns The user object or null if not found.
 */
export async function supabaseGetUserByEmail(email: string): Promise<SupabaseUser | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('users').select('*').eq('email', email).single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
    console.error('Supabase getUserByEmail error:', error.message);
    throw new Error(`Falha ao buscar usuário: ${error.message}`);
  }
  return data;
}

/**
 * Updates a user's profile.
 * @param userId The ID of the user to update.
 * @param updates The partial user object with fields to update.
 * @returns The updated user object.
 */
export async function supabaseUpdateUser(userId: string, updates: Partial<SupabaseUser>): Promise<SupabaseUser | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('users').update(updates).eq('id', userId).select().single();

  if (error) {
    console.error('Supabase updateUser error:', error.message);
    throw new Error(`Falha ao atualizar usuário: ${error.message}`);
  }
  return data;
}

/**
 * Saves or updates a user's Binance API state.
 * @param userId The ID of the user.
 * @param apiState The MasterApiState to save.
 * @returns The updated user object.
 */
export async function supabaseSaveMasterApiState(userId: string, apiState: MasterApiState): Promise<SupabaseUser | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('users').update({
    binance_api_key: apiState.apiKey,
    binance_api_secret: apiState.apiSecret,
    binance_api_validated: apiState.isValidated,
  }).eq('id', userId).select().single();

  if (error) {
    console.error('Supabase saveMasterApiState error:', error.message);
    throw new Error(`Falha ao salvar chaves API: ${error.message}`);
  }
  return data;
}

/**
 * Fetches the MasterApiState for a user.
 * @param userId The ID of the user.
 * @returns The MasterApiState or default if not found.
 */
export async function supabaseGetMasterApiState(userId: string): Promise<MasterApiState> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('users').select('binance_api_key, binance_api_secret, binance_api_validated').eq('id', userId).single();

  if (error && error.code !== 'PGRST116') {
    console.error('Supabase getMasterApiState error:', error.message);
    throw new Error(`Falha ao buscar chaves API: ${error.message}`);
  }

  return {
    apiKey: data?.binance_api_key || '',
    apiSecret: data?.binance_api_secret || '',
    isValidated: data?.binance_api_validated || false,
  };
}


/**
 * Saves or updates a robot instance.
 * @param robot The robot instance to save/update. Must include `user_id`.
 * @returns The saved/updated robot instance.
 */
export async function supabaseSaveRobotInstance(robot: RobotInstance & { user_id: string }): Promise<SupabaseRobotInstance | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('robot_instances').upsert({
    id: robot.id,
    user_id: robot.user_id, 
    type: robot.type,
    symbol: robot.symbol,
    timeframe: robot.timeframe,
    max_capital: robot.maxCapital,
    is_running: robot.isRunning,
    pnl: robot.pnl,
    trades: robot.trades,
    win_rate: robot.winRate,
    params: robot.params, // Stored as JSONB
  }).select().single();

  if (error) {
    console.error('Supabase saveRobotInstance error:', error.message);
    throw new Error(`Falha ao salvar robô: ${error.message}`);
  }
  return data;
}

/**
 * Fetches all robot instances for a given user.
 * @param userId The ID of the user.
 * @returns An array of robot instances.
 */
export async function supabaseGetRobotInstances(userId: string): Promise<RobotInstance[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('robot_instances').select('*').eq('user_id', userId);

  if (error) {
    console.error('Supabase getRobotInstances error:', error.message);
    throw new Error(`Falha ao buscar robôs: ${error.message}`);
  }

  // Map Supabase type back to App.tsx RobotInstance type
  return data.map(r => ({
    id: r.id,
    type: r.type,
    symbol: r.symbol,
    timeframe: r.timeframe,
    maxCapital: r.max_capital,
    isRunning: r.is_running,
    pnl: r.pnl,
    trades: r.trades,
    winRate: r.win_rate,
    params: r.params,
  }));
}

/**
 * Deletes a robot instance by its ID.
 * @param robotId The ID of the robot instance to delete.
 */
export async function supabaseDeleteRobotInstance(robotId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('robot_instances').delete().eq('id', robotId);

  if (error) {
    console.error('Supabase deleteRobotInstance error:', error.message);
    throw new Error(`Falha ao deletar robô: ${error.message}`);
  }
}