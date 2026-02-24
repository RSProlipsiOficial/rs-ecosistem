export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            comunicados: {
                Row: {
                    id: string
                    owner_id: string
                    titulo: string
                    conteudo: string
                    tipo: string
                    data_publicacao: string
                    van_id: string | null
                    ativo: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    owner_id: string
                    titulo: string
                    conteudo: string
                    tipo: string
                    data_publicacao: string
                    van_id?: string | null
                    ativo?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    owner_id?: string
                    titulo?: string
                    conteudo?: string
                    tipo?: string
                    data_publicacao?: string
                    van_id?: string | null
                    ativo?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "comunicados_owner_id_fkey"
                        columns: ["owner_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comunicados_van_id_fkey"
                        columns: ["van_id"]
                        isOneToOne: false
                        referencedRelation: "vans"
                        referencedColumns: ["id"]
                    }
                ]
            }
            comunicados_lidos: {
                Row: {
                    id: string
                    comunicado_id: string
                    user_id: string
                    lido_em: string | null
                }
                Insert: {
                    id?: string
                    comunicado_id: string
                    user_id: string
                    lido_em?: string | null
                }
                Update: {
                    id?: string
                    comunicado_id?: string
                    user_id?: string
                    lido_em?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "comunicados_lidos_comunicado_id_fkey"
                        columns: ["comunicado_id"]
                        isOneToOne: false
                        referencedRelation: "comunicados"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comunicados_lidos_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
    }
}
