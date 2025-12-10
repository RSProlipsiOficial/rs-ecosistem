export function formatError(err: any) {
  return {
    status: 500,
    code: err?.code || "database_error",
    message: err?.message || "Erro interno do Supabase",
  };
}
