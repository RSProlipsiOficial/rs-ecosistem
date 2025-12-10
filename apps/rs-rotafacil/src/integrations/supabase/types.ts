export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      afiliado_links: {
        Row: {
          afiliado_id: string
          ativo: boolean
          criado_em: string
          destino_url: string
          id: string
          obs: string | null
          ref_code: string
        }
        Insert: {
          afiliado_id: string
          ativo?: boolean
          criado_em?: string
          destino_url: string
          id?: string
          obs?: string | null
          ref_code: string
        }
        Update: {
          afiliado_id?: string
          ativo?: boolean
          criado_em?: string
          destino_url?: string
          id?: string
          obs?: string | null
          ref_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "afiliado_links_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "afiliado_links_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "afiliado_links_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "afiliado_links_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
        ]
      }
      afiliado_pixels: {
        Row: {
          afiliado_id: string
          ativo: boolean
          criado_em: string
          id: string
          pixel_id: string
          plataforma: string
        }
        Insert: {
          afiliado_id: string
          ativo?: boolean
          criado_em?: string
          id?: string
          pixel_id: string
          plataforma: string
        }
        Update: {
          afiliado_id?: string
          ativo?: boolean
          criado_em?: string
          id?: string
          pixel_id?: string
          plataforma?: string
        }
        Relationships: [
          {
            foreignKeyName: "afiliado_pixels_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "afiliado_pixels_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "afiliado_pixels_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "afiliado_pixels_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
        ]
      }
      afiliado_volume_mensal: {
        Row: {
          afiliado_id: string
          ano: number
          atualizado_em: string
          id: string
          mes: number
          unidades: number
        }
        Insert: {
          afiliado_id: string
          ano: number
          atualizado_em?: string
          id?: string
          mes: number
          unidades?: number
        }
        Update: {
          afiliado_id?: string
          ano?: number
          atualizado_em?: string
          id?: string
          mes?: number
          unidades?: number
        }
        Relationships: [
          {
            foreignKeyName: "afiliado_volume_mensal_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "afiliado_volume_mensal_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "afiliado_volume_mensal_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "afiliado_volume_mensal_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
        ]
      }
      afiliados: {
        Row: {
          ativo: boolean
          banco_pix_key: string | null
          criado_em: string
          documento: string | null
          email: string | null
          id: string
          nome: string | null
          patrocinador_id: string | null
          ref_code: string
          status: string
          usuario_id: string
        }
        Insert: {
          ativo?: boolean
          banco_pix_key?: string | null
          criado_em?: string
          documento?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          patrocinador_id?: string | null
          ref_code: string
          status?: string
          usuario_id: string
        }
        Update: {
          ativo?: boolean
          banco_pix_key?: string | null
          criado_em?: string
          documento?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          patrocinador_id?: string | null
          ref_code?: string
          status?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "afiliados_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_afiliados_patroc"
            columns: ["patrocinador_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_afiliados_patroc"
            columns: ["patrocinador_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_afiliados_patroc"
            columns: ["patrocinador_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "fk_afiliados_patroc"
            columns: ["patrocinador_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
        ]
      }
      ai_managed_tables: {
        Row: {
          allowed_ops: string[]
          require_review: boolean | null
          schema_name: string
          table_name: string
        }
        Insert: {
          allowed_ops?: string[]
          require_review?: boolean | null
          schema_name?: string
          table_name: string
        }
        Update: {
          allowed_ops?: string[]
          require_review?: boolean | null
          schema_name?: string
          table_name?: string
        }
        Relationships: []
      }
      ai_models: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          max_tokens: number | null
          model_id: string
          pricing_input: number | null
          pricing_output: number | null
          provider: string
          supports_streaming: boolean | null
          supports_vision: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          max_tokens?: number | null
          model_id: string
          pricing_input?: number | null
          pricing_output?: number | null
          provider: string
          supports_streaming?: boolean | null
          supports_vision?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          max_tokens?: number | null
          model_id?: string
          pricing_input?: number | null
          pricing_output?: number | null
          provider?: string
          supports_streaming?: boolean | null
          supports_vision?: boolean | null
        }
        Relationships: []
      }
      alunos: {
        Row: {
          ativo: boolean
          created_at: string
          endereco_bairro: string
          endereco_cep: string
          endereco_cidade: string
          endereco_estado: string
          endereco_numero: string
          endereco_rua: string
          id: string
          nome_colegio: string
          nome_completo: string
          nome_responsavel: string
          serie: string
          tipo_residencia: string
          turno: string
          updated_at: string
          user_id: string | null
          valor_letalidade: number | null
          valor_mensalidade: number
          van_id: string
          whatsapp_responsavel: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          endereco_bairro: string
          endereco_cep: string
          endereco_cidade: string
          endereco_estado: string
          endereco_numero: string
          endereco_rua: string
          id?: string
          nome_colegio?: string
          nome_completo: string
          nome_responsavel: string
          serie: string
          tipo_residencia?: string
          turno: string
          updated_at?: string
          user_id?: string | null
          valor_letalidade?: number | null
          valor_mensalidade?: number
          van_id: string
          whatsapp_responsavel: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          endereco_bairro?: string
          endereco_cep?: string
          endereco_cidade?: string
          endereco_estado?: string
          endereco_numero?: string
          endereco_rua?: string
          id?: string
          nome_colegio?: string
          nome_completo?: string
          nome_responsavel?: string
          serie?: string
          tipo_residencia?: string
          turno?: string
          updated_at?: string
          user_id?: string | null
          valor_letalidade?: number | null
          valor_mensalidade?: number
          van_id?: string
          whatsapp_responsavel?: string
        }
        Relationships: [
          {
            foreignKeyName: "alunos_van_id_fkey"
            columns: ["van_id"]
            isOneToOne: false
            referencedRelation: "vans"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      apps_vendidos: {
        Row: {
          created_at: string
          data_criacao: string
          email_cliente: string
          id: string
          nome_cliente: string
          observacoes: string | null
          status: string
          updated_at: string
          valor_pago: number | null
        }
        Insert: {
          created_at?: string
          data_criacao?: string
          email_cliente: string
          id?: string
          nome_cliente: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor_pago?: number | null
        }
        Update: {
          created_at?: string
          data_criacao?: string
          email_cliente?: string
          id?: string
          nome_cliente?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor_pago?: number | null
        }
        Relationships: []
      }
      assistants: {
        Row: {
          created_at: string | null
          id: string
          model: string | null
          name: string
          system: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          model?: string | null
          name: string
          system?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          model?: string | null
          name?: string
          system?: string | null
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          acao: string | null
          actor_email: string | null
          created_at: string | null
          diff: Json | null
          id: number
          registro_id: string | null
          source: string | null
          tabela: string | null
        }
        Insert: {
          acao?: string | null
          actor_email?: string | null
          created_at?: string | null
          diff?: Json | null
          id?: number
          registro_id?: string | null
          source?: string | null
          tabela?: string | null
        }
        Update: {
          acao?: string | null
          actor_email?: string | null
          created_at?: string | null
          diff?: Json | null
          id?: number
          registro_id?: string | null
          source?: string | null
          tabela?: string | null
        }
        Relationships: []
      }
      carreira_pagamentos: {
        Row: {
          afiliado_id: string
          ano: number
          criado_em: string
          id: string
          mes: number
          pago: boolean
          pin_id: number
          valor: number
        }
        Insert: {
          afiliado_id: string
          ano: number
          criado_em?: string
          id?: string
          mes: number
          pago?: boolean
          pin_id: number
          valor: number
        }
        Update: {
          afiliado_id?: string
          ano?: number
          criado_em?: string
          id?: string
          mes?: number
          pago?: boolean
          pin_id?: number
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "carreira_pagamentos_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carreira_pagamentos_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carreira_pagamentos_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "carreira_pagamentos_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "carreira_pagamentos_pin_id_fkey"
            columns: ["pin_id"]
            isOneToOne: false
            referencedRelation: "carreira_pins"
            referencedColumns: ["id"]
          },
        ]
      }
      carreira_pins: {
        Row: {
          bonus: number
          ciclos: number
          id: number
          nome: string
        }
        Insert: {
          bonus: number
          ciclos: number
          id?: number
          nome: string
        }
        Update: {
          bonus?: number
          ciclos?: number
          id?: number
          nome?: string
        }
        Relationships: []
      }
      carreira_premios: {
        Row: {
          premio: number
          unidades: number
        }
        Insert: {
          premio: number
          unidades: number
        }
        Update: {
          premio?: number
          unidades?: number
        }
        Relationships: []
      }
      carreira_premios_volume: {
        Row: {
          afiliado_id: string
          ano: number
          criado_em: string
          id: string
          mes: number
          pago: boolean
          unidades: number
          valor: number
        }
        Insert: {
          afiliado_id: string
          ano: number
          criado_em?: string
          id?: string
          mes: number
          pago?: boolean
          unidades: number
          valor: number
        }
        Update: {
          afiliado_id?: string
          ano?: number
          criado_em?: string
          id?: string
          mes?: number
          pago?: boolean
          unidades?: number
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "carreira_premios_volume_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carreira_premios_volume_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carreira_premios_volume_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "carreira_premios_volume_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
        ]
      }
      carreira_progresso: {
        Row: {
          afiliado_id: string
          ano: number
          atualizado_em: string
          id: string
          l0: number
          l1: number
          l2: number
          l3: number
          mes: number
          total: number
        }
        Insert: {
          afiliado_id: string
          ano: number
          atualizado_em?: string
          id?: string
          l0?: number
          l1?: number
          l2?: number
          l3?: number
          mes: number
          total?: number
        }
        Update: {
          afiliado_id?: string
          ano?: number
          atualizado_em?: string
          id?: string
          l0?: number
          l1?: number
          l2?: number
          l3?: number
          mes?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "carreira_progresso_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carreira_progresso_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carreira_progresso_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "carreira_progresso_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          session_id: string | null
          tokens: number | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          session_id?: string | null
          tokens?: number | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          session_id?: string | null
          tokens?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      checklist_items_personalizados: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          obrigatorio: boolean
          ordem: number
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          obrigatorio?: boolean
          ordem?: number
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          obrigatorio?: boolean
          ordem?: number
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      checklists_motorista: {
        Row: {
          agua_radiador: boolean
          cinto_seguranca: boolean
          combustivel: number | null
          created_at: string
          data: string
          estepe: boolean
          fora_horario: boolean
          freios: boolean
          horario_preenchimento: string
          id: string
          itens_soltos: boolean
          limpador_parabrisa: boolean
          luzes_externas: boolean
          observacoes: string | null
          oleo_motor: boolean
          pneus: boolean
          portas_trancas: boolean
          quilometragem: number
          status: string
          updated_at: string
          user_id: string
          van_id: string
          vidros_retrovisores: boolean
        }
        Insert: {
          agua_radiador?: boolean
          cinto_seguranca?: boolean
          combustivel?: number | null
          created_at?: string
          data: string
          estepe?: boolean
          fora_horario?: boolean
          freios?: boolean
          horario_preenchimento?: string
          id?: string
          itens_soltos?: boolean
          limpador_parabrisa?: boolean
          luzes_externas?: boolean
          observacoes?: string | null
          oleo_motor?: boolean
          pneus?: boolean
          portas_trancas?: boolean
          quilometragem?: number
          status?: string
          updated_at?: string
          user_id?: string
          van_id: string
          vidros_retrovisores?: boolean
        }
        Update: {
          agua_radiador?: boolean
          cinto_seguranca?: boolean
          combustivel?: number | null
          created_at?: string
          data?: string
          estepe?: boolean
          fora_horario?: boolean
          freios?: boolean
          horario_preenchimento?: string
          id?: string
          itens_soltos?: boolean
          limpador_parabrisa?: boolean
          luzes_externas?: boolean
          observacoes?: string | null
          oleo_motor?: boolean
          pneus?: boolean
          portas_trancas?: boolean
          quilometragem?: number
          status?: string
          updated_at?: string
          user_id?: string
          van_id?: string
          vidros_retrovisores?: boolean
        }
        Relationships: []
      }
      cms_media: {
        Row: {
          alt: string | null
          created_at: string | null
          id: string
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string | null
          id?: string
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string | null
          id?: string
          url?: string
        }
        Relationships: []
      }
      cms_posts: {
        Row: {
          conteudo: string | null
          cover_id: string | null
          criado_em: string
          id: string
          meta: Json
          publicado_em: string | null
          slug: string
          status: string
          titulo: string
        }
        Insert: {
          conteudo?: string | null
          cover_id?: string | null
          criado_em?: string
          id?: string
          meta?: Json
          publicado_em?: string | null
          slug: string
          status?: string
          titulo: string
        }
        Update: {
          conteudo?: string | null
          cover_id?: string | null
          criado_em?: string
          id?: string
          meta?: Json
          publicado_em?: string | null
          slug?: string
          status?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_posts_cover_id_fkey"
            columns: ["cover_id"]
            isOneToOne: false
            referencedRelation: "cms_media"
            referencedColumns: ["id"]
          },
        ]
      }
      comissao_faixas: {
        Row: {
          id: number
          max_unidades: number | null
          min_unidades: number
          percentual: number
        }
        Insert: {
          id?: number
          max_unidades?: number | null
          min_unidades: number
          percentual: number
        }
        Update: {
          id?: number
          max_unidades?: number | null
          min_unidades?: number
          percentual?: number
        }
        Relationships: []
      }
      comissoes: {
        Row: {
          afiliado_id: string
          base: number
          criado_em: string
          id: string
          pedido_id: string
          percentual: number
          status: string
          valor: number
        }
        Insert: {
          afiliado_id: string
          base: number
          criado_em?: string
          id?: string
          pedido_id: string
          percentual: number
          status?: string
          valor: number
        }
        Update: {
          afiliado_id?: string
          base?: number
          criado_em?: string
          id?: string
          pedido_id?: string
          percentual?: number
          status?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "comissoes_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "comissoes_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      consultores: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cleaned_at: string | null
          created_at: string | null
          email: string
          id_num: number | null
          logradouro: string | null
          nome: string
          normalized: Json | null
          numero: string | null
          patrocinador_uid: string | null
          patrocinador_whatsapp: string | null
          uf: string | null
          uid: string
          updated_at: string | null
          username: string | null
          whatsapp: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cleaned_at?: string | null
          created_at?: string | null
          email: string
          id_num?: number | null
          logradouro?: string | null
          nome: string
          normalized?: Json | null
          numero?: string | null
          patrocinador_uid?: string | null
          patrocinador_whatsapp?: string | null
          uf?: string | null
          uid: string
          updated_at?: string | null
          username?: string | null
          whatsapp?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cleaned_at?: string | null
          created_at?: string | null
          email?: string
          id_num?: number | null
          logradouro?: string | null
          nome?: string
          normalized?: Json | null
          numero?: string | null
          patrocinador_uid?: string | null
          patrocinador_whatsapp?: string | null
          uf?: string | null
          uid?: string
          updated_at?: string | null
          username?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          assistant_id: string | null
          created_at: string | null
          id: string
          title: string | null
        }
        Insert: {
          assistant_id?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
        }
        Update: {
          assistant_id?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
        ]
      }
      drop_progress: {
        Row: {
          comissao_atual: number | null
          pontos_acumulados: number | null
          tier: Database["public"]["Enums"]["drop_tier"]
          unidades_vendidas: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comissao_atual?: number | null
          pontos_acumulados?: number | null
          tier?: Database["public"]["Enums"]["drop_tier"]
          unidades_vendidas?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comissao_atual?: number | null
          pontos_acumulados?: number | null
          tier?: Database["public"]["Enums"]["drop_tier"]
          unidades_vendidas?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ec_categorias: {
        Row: {
          id: string
          nome: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          id?: string
          nome: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          id?: string
          nome?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "ec_categorias_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ec_categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      ec_clientes: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          meta: Json | null
          nome: string
          telefone: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          meta?: Json | null
          nome: string
          telefone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          meta?: Json | null
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      ec_enderecos: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cliente_id: string | null
          complemento: string | null
          estado: string | null
          id: string
          logradouro: string | null
          numero: string | null
          pais: string | null
          tipo: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cliente_id?: string | null
          complemento?: string | null
          estado?: string | null
          id?: string
          logradouro?: string | null
          numero?: string | null
          pais?: string | null
          tipo?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cliente_id?: string | null
          complemento?: string | null
          estado?: string | null
          id?: string
          logradouro?: string | null
          numero?: string | null
          pais?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ec_enderecos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "ec_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      ec_envios: {
        Row: {
          codigo_rastreio: string | null
          created_at: string | null
          id: string
          meta: Json | null
          pedido_id: string | null
          status: string | null
          transportadora: string | null
        }
        Insert: {
          codigo_rastreio?: string | null
          created_at?: string | null
          id?: string
          meta?: Json | null
          pedido_id?: string | null
          status?: string | null
          transportadora?: string | null
        }
        Update: {
          codigo_rastreio?: string | null
          created_at?: string | null
          id?: string
          meta?: Json | null
          pedido_id?: string | null
          status?: string | null
          transportadora?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ec_envios_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "ec_pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      ec_estoque: {
        Row: {
          localizacao: string | null
          produto_id: string
          quantidade: number
        }
        Insert: {
          localizacao?: string | null
          produto_id: string
          quantidade?: number
        }
        Update: {
          localizacao?: string | null
          produto_id?: string
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "ec_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: true
            referencedRelation: "ec_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      ec_pagamentos: {
        Row: {
          created_at: string | null
          id: string
          meta: Json | null
          moeda: string | null
          pedido_id: string | null
          provedor: string | null
          status: string | null
          txid: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meta?: Json | null
          moeda?: string | null
          pedido_id?: string | null
          provedor?: string | null
          status?: string | null
          txid?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meta?: Json | null
          moeda?: string | null
          pedido_id?: string | null
          provedor?: string | null
          status?: string | null
          txid?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ec_pagamentos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "ec_pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      ec_pedido_itens: {
        Row: {
          id: string
          nome: string
          pedido_id: string | null
          preco: number
          produto_id: string | null
          quantidade: number
        }
        Insert: {
          id?: string
          nome: string
          pedido_id?: string | null
          preco?: number
          produto_id?: string | null
          quantidade?: number
        }
        Update: {
          id?: string
          nome?: string
          pedido_id?: string | null
          preco?: number
          produto_id?: string | null
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "ec_pedido_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "ec_pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ec_pedido_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "ec_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      ec_pedidos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          id: string
          meta: Json | null
          moeda: string | null
          status: string
          total: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          id?: string
          meta?: Json | null
          moeda?: string | null
          status?: string
          total?: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          id?: string
          meta?: Json | null
          moeda?: string | null
          status?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "ec_pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "ec_clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      ec_produto_categorias: {
        Row: {
          categoria_id: string
          produto_id: string
        }
        Insert: {
          categoria_id: string
          produto_id: string
        }
        Update: {
          categoria_id?: string
          produto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ec_produto_categorias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "ec_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ec_produto_categorias_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "ec_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      ec_produtos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          meta: Json | null
          moeda: string | null
          nome: string
          preco: number
          sku: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          meta?: Json | null
          moeda?: string | null
          nome: string
          preco?: number
          sku?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          meta?: Json | null
          moeda?: string | null
          nome?: string
          preco?: number
          sku?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          enabled: boolean
          key: string
          meta: Json | null
          updated_at: string | null
        }
        Insert: {
          enabled?: boolean
          key: string
          meta?: Json | null
          updated_at?: string | null
        }
        Update: {
          enabled?: boolean
          key?: string
          meta?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ganhos_extras: {
        Row: {
          created_at: string
          data_ganho: string
          descricao: string
          id: string
          observacoes: string | null
          tipo: string
          updated_at: string
          user_id: string | null
          valor: number
        }
        Insert: {
          created_at?: string
          data_ganho: string
          descricao: string
          id?: string
          observacoes?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string | null
          valor: number
        }
        Update: {
          created_at?: string
          data_ganho?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string | null
          valor?: number
        }
        Relationships: []
      }
      gastos: {
        Row: {
          ano: number
          created_at: string
          data_pagamento: string | null
          data_vencimento: string | null
          descricao: string
          id: string
          mes: number
          observacoes: string | null
          status: string
          tipo: string
          updated_at: string
          user_id: string | null
          valor: number
        }
        Insert: {
          ano: number
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao: string
          id?: string
          mes: number
          observacoes?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          user_id?: string | null
          valor: number
        }
        Update: {
          ano?: number
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string
          id?: string
          mes?: number
          observacoes?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          user_id?: string | null
          valor?: number
        }
        Relationships: []
      }
      landing_banners: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          link_url: string | null
          order_index: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          link_url?: string | null
          order_index?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          link_url?: string | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      landing_content: {
        Row: {
          content_key: string
          content_type: string
          content_value: string | null
          created_at: string
          id: string
          image_url: string | null
          section: string
          updated_at: string
        }
        Insert: {
          content_key: string
          content_type?: string
          content_value?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          section: string
          updated_at?: string
        }
        Update: {
          content_key?: string
          content_type?: string
          content_value?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      manutencoes_van: {
        Row: {
          created_at: string
          custo_reparo: number | null
          data_relato: string
          data_solucao: string | null
          descricao_problema: string
          id: string
          observacoes_solucao: string | null
          prioridade: string
          status: string
          tipo_problema: string
          updated_at: string
          user_id: string
          van_id: string
        }
        Insert: {
          created_at?: string
          custo_reparo?: number | null
          data_relato?: string
          data_solucao?: string | null
          descricao_problema: string
          id?: string
          observacoes_solucao?: string | null
          prioridade?: string
          status?: string
          tipo_problema?: string
          updated_at?: string
          user_id?: string
          van_id: string
        }
        Update: {
          created_at?: string
          custo_reparo?: number | null
          data_relato?: string
          data_solucao?: string | null
          descricao_problema?: string
          id?: string
          observacoes_solucao?: string | null
          prioridade?: string
          status?: string
          tipo_problema?: string
          updated_at?: string
          user_id?: string
          van_id?: string
        }
        Relationships: []
      }
      mensalidades_config: {
        Row: {
          chave_pix: string | null
          created_at: string
          dias_antes_vencimento: number | null
          dias_apos_vencimento: number | null
          envio_automatico_ativo: boolean | null
          id: string
          mensagem_antes_vencimento: string | null
          mensagem_apos_vencimento: string | null
          mensagem_no_vencimento: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chave_pix?: string | null
          created_at?: string
          dias_antes_vencimento?: number | null
          dias_apos_vencimento?: number | null
          envio_automatico_ativo?: boolean | null
          id?: string
          mensagem_antes_vencimento?: string | null
          mensagem_apos_vencimento?: string | null
          mensagem_no_vencimento?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chave_pix?: string | null
          created_at?: string
          dias_antes_vencimento?: number | null
          dias_apos_vencimento?: number | null
          envio_automatico_ativo?: boolean | null
          id?: string
          mensagem_antes_vencimento?: string | null
          mensagem_apos_vencimento?: string | null
          mensagem_no_vencimento?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mensalidades_mensagens: {
        Row: {
          conteudo: string
          created_at: string
          enviada_em: string
          id: string
          pagamento_id: string
          status: string
          tipo_mensagem: string
          user_id: string | null
          whatsapp_responsavel: string | null
        }
        Insert: {
          conteudo: string
          created_at?: string
          enviada_em?: string
          id?: string
          pagamento_id: string
          status?: string
          tipo_mensagem?: string
          user_id?: string | null
          whatsapp_responsavel?: string | null
        }
        Update: {
          conteudo?: string
          created_at?: string
          enviada_em?: string
          id?: string
          pagamento_id?: string
          status?: string
          tipo_mensagem?: string
          user_id?: string | null
          whatsapp_responsavel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensalidades_mensagens_pagamento_id_fkey"
            columns: ["pagamento_id"]
            isOneToOne: false
            referencedRelation: "pagamentos_mensais"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string | null
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          pontos_unit: number | null
          preco_unit: number
          product_id: string
          qtd: number
        }
        Insert: {
          id?: string
          order_id: string
          pontos_unit?: number | null
          preco_unit: number
          product_id: string
          qtd: number
        }
        Update: {
          id?: string
          order_id?: string
          pontos_unit?: number | null
          preco_unit?: number
          product_id?: string
          qtd?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          frete: number
          id: string
          status: string
          subtotal: number
          total: number | null
          total_itens: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          frete?: number
          id?: string
          status?: string
          subtotal: number
          total?: number | null
          total_itens: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          frete?: number
          id?: string
          status?: string
          subtotal?: number
          total?: number | null
          total_itens?: number
          user_id?: string
        }
        Relationships: []
      }
      pagamentos_afiliados: {
        Row: {
          afiliado_id: string
          criado_em: string
          id: string
          pago_em: string | null
          referencia: string | null
          valor: number
        }
        Insert: {
          afiliado_id: string
          criado_em?: string
          id?: string
          pago_em?: string | null
          referencia?: string | null
          valor: number
        }
        Update: {
          afiliado_id?: string
          criado_em?: string
          id?: string
          pago_em?: string | null
          referencia?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_afiliados_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_afiliados_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_afiliados_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "pagamentos_afiliados_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
        ]
      }
      pagamentos_mensais: {
        Row: {
          aluno_id: string
          ano: number
          created_at: string
          data_pagamento: string | null
          data_vencimento: string | null
          id: string
          mes: number
          observacoes: string | null
          status: string
          updated_at: string
          user_id: string | null
          valor: number
        }
        Insert: {
          aluno_id: string
          ano: number
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          id?: string
          mes: number
          observacoes?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          valor: number
        }
        Update: {
          aluno_id?: string
          ano?: number
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          id?: string
          mes?: number
          observacoes?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_mensais_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_itens: {
        Row: {
          id: string
          nome: string
          pedido_id: string
          preco_unit: number
          quantidade: number
          sku: string
        }
        Insert: {
          id?: string
          nome: string
          pedido_id: string
          preco_unit: number
          quantidade: number
          sku: string
        }
        Update: {
          id?: string
          nome?: string
          pedido_id?: string
          preco_unit?: number
          quantidade?: number
          sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedido_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          afiliado_id: string | null
          cliente_id: string | null
          created_at: string
          finalized_at: string
          id: string
          origem: string
          pago: boolean
          ref_code: string | null
          status: string
          total: number
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          afiliado_id?: string | null
          cliente_id?: string | null
          created_at?: string
          finalized_at?: string
          id?: string
          origem?: string
          pago?: boolean
          ref_code?: string | null
          status?: string
          total: number
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          afiliado_id?: string | null
          cliente_id?: string | null
          created_at?: string
          finalized_at?: string
          id?: string
          origem?: string
          pago?: boolean
          ref_code?: string | null
          status?: string
          total?: number
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "pedidos_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
        ]
      }
      permissions: {
        Row: {
          acao: string
          id: number
          recurso: string
        }
        Insert: {
          acao: string
          id?: number
          recurso: string
        }
        Update: {
          acao?: string
          id?: number
          recurso?: string
        }
        Relationships: []
      }
      pixel_events: {
        Row: {
          afiliado_id: string | null
          amount: number | null
          created_at: string | null
          currency: string | null
          event_name: string | null
          id: string
          ip: unknown | null
          pedido_id: string | null
          plataforma: string | null
          ref_code: string | null
          user_agent: string | null
        }
        Insert: {
          afiliado_id?: string | null
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          event_name?: string | null
          id?: string
          ip?: unknown | null
          pedido_id?: string | null
          plataforma?: string | null
          ref_code?: string | null
          user_agent?: string | null
        }
        Update: {
          afiliado_id?: string | null
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          event_name?: string | null
          id?: string
          ip?: unknown | null
          pedido_id?: string | null
          plataforma?: string | null
          ref_code?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pixel_events_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pixel_events_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pixel_events_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "pixel_events_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "pixel_events_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pixels: {
        Row: {
          facebook_id: string | null
          google_gad: string | null
          id: string
          tiktok_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          facebook_id?: string | null
          google_gad?: string | null
          id?: string
          tiktok_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          facebook_id?: string | null
          google_gad?: string | null
          id?: string
          tiktok_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      planejamentos_financeiros: {
        Row: {
          created_at: string
          educacao: number
          gastos_casa: number
          id: string
          investimentos: number
          lazer: number
          renda_mensal: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          educacao?: number
          gastos_casa?: number
          id?: string
          investimentos?: number
          lazer?: number
          renda_mensal?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          educacao?: number
          gastos_casa?: number
          id?: string
          investimentos?: number
          lazer?: number
          renda_mensal?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      presencas_diarias: {
        Row: {
          aluno_id: string
          created_at: string
          data: string
          horario_marcacao: string
          id: string
          marcado_por: string | null
          observacoes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data?: string
          horario_marcacao?: string
          id?: string
          marcado_por?: string | null
          observacoes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data?: string
          horario_marcacao?: string
          id?: string
          marcado_por?: string | null
          observacoes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presencas_diarias_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          imagens: Json | null
          nome: string
          pontos: number | null
          preco: number
          sku: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          imagens?: Json | null
          nome: string
          pontos?: number | null
          preco: number
          sku: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          imagens?: Json | null
          nome?: string
          pontos?: number | null
          preco?: number
          sku?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string | null
          custom_id: string | null
          empresa: string | null
          endereco: Json | null
          foto_url: string | null
          nascimento: string | null
          nome: string
          pix_chave: string | null
          pix_cpf: string | null
          pix_tipo: Database["public"]["Enums"]["pix_type"] | null
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string | null
          custom_id?: string | null
          empresa?: string | null
          endereco?: Json | null
          foto_url?: string | null
          nascimento?: string | null
          nome: string
          pix_chave?: string | null
          pix_cpf?: string | null
          pix_tipo?: Database["public"]["Enums"]["pix_type"] | null
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cpf?: string | null
          created_at?: string | null
          custom_id?: string | null
          empresa?: string | null
          endereco?: Json | null
          foto_url?: string | null
          nascimento?: string | null
          nome?: string
          pix_chave?: string | null
          pix_cpf?: string | null
          pix_tipo?: Database["public"]["Enums"]["pix_type"] | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          member_id: string
          sponsor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id: string
          sponsor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string
          sponsor_id?: string
        }
        Relationships: []
      }
      revisions: {
        Row: {
          created_at: string | null
          id: number
          registro_id: string
          snapshot: Json
          tabela: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          registro_id: string
          snapshot: Json
          tabela: string
        }
        Update: {
          created_at?: string | null
          id?: number
          registro_id?: string
          snapshot?: Json
          tabela?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission_id: number
          role_id: number
        }
        Insert: {
          permission_id: number
          role_id: number
        }
        Update: {
          permission_id?: number
          role_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: number
          nome: string
          slug: string
        }
        Insert: {
          id?: number
          nome: string
          slug: string
        }
        Update: {
          id?: number
          nome?: string
          slug?: string
        }
        Relationships: []
      }
      rsia_pages: {
        Row: {
          created_at: string | null
          html: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          html?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          html?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      short_links: {
        Row: {
          ativo: boolean | null
          clicks: number | null
          created_at: string | null
          id: string
          slug: string
          target_url: string
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          clicks?: number | null
          created_at?: string | null
          id?: string
          slug: string
          target_url: string
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          clicks?: number | null
          created_at?: string | null
          id?: string
          slug?: string
          target_url?: string
          user_id?: string
        }
        Relationships: []
      }
      sigme_ativacoes: {
        Row: {
          afiliado_id: string
          ano: number
          id: string
          mes: number
          pago_em: string
          valor: number
        }
        Insert: {
          afiliado_id: string
          ano: number
          id?: string
          mes: number
          pago_em?: string
          valor: number
        }
        Update: {
          afiliado_id?: string
          ano?: number
          id?: string
          mes?: number
          pago_em?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "sigme_ativacoes_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_ativacoes_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_ativacoes_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "sigme_ativacoes_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
        ]
      }
      sigme_blocos: {
        Row: {
          aberto: boolean
          criado_em: string | null
          fechado_em: string | null
          id: number
          topo_afiliado_id: string
        }
        Insert: {
          aberto?: boolean
          criado_em?: string | null
          fechado_em?: string | null
          id?: number
          topo_afiliado_id: string
        }
        Update: {
          aberto?: boolean
          criado_em?: string | null
          fechado_em?: string | null
          id?: number
          topo_afiliado_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sigme_blocos_topo_afiliado_id_fkey"
            columns: ["topo_afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_blocos_topo_afiliado_id_fkey"
            columns: ["topo_afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_blocos_topo_afiliado_id_fkey"
            columns: ["topo_afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "sigme_blocos_topo_afiliado_id_fkey"
            columns: ["topo_afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
        ]
      }
      sigme_ciclos: {
        Row: {
          afiliado_id: string
          criado_em: string
          data_ciclo: string
          id: string
          valor_l1: number
          valor_l2: number
          valor_l3: number
          valor_self: number
        }
        Insert: {
          afiliado_id: string
          criado_em?: string
          data_ciclo?: string
          id?: string
          valor_l1: number
          valor_l2: number
          valor_l3: number
          valor_self: number
        }
        Update: {
          afiliado_id?: string
          criado_em?: string
          data_ciclo?: string
          id?: string
          valor_l1?: number
          valor_l2?: number
          valor_l3?: number
          valor_self?: number
        }
        Relationships: [
          {
            foreignKeyName: "sigme_ciclos_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_ciclos_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_ciclos_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "sigme_ciclos_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
        ]
      }
      sigme_config: {
        Row: {
          ativacao_min: number
          base_ciclo: number
          drop_pct_max: number
          drop_pct_min: number
          id: boolean
          pct_l1: number
          pct_l2: number
          pct_l3: number
          pct_self: number
          pool_top: number
        }
        Insert: {
          ativacao_min?: number
          base_ciclo?: number
          drop_pct_max?: number
          drop_pct_min?: number
          id?: boolean
          pct_l1?: number
          pct_l2?: number
          pct_l3?: number
          pct_self?: number
          pool_top?: number
        }
        Update: {
          ativacao_min?: number
          base_ciclo?: number
          drop_pct_max?: number
          drop_pct_min?: number
          id?: boolean
          pct_l1?: number
          pct_l2?: number
          pct_l3?: number
          pct_self?: number
          pool_top?: number
        }
        Relationships: []
      }
      sigme_fila: {
        Row: {
          afiliado_id: string
          created_at: string | null
          id: number
        }
        Insert: {
          afiliado_id: string
          created_at?: string | null
          id?: number
        }
        Update: {
          afiliado_id?: string
          created_at?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "sigme_fila_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_fila_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_fila_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "sigme_fila_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
        ]
      }
      sigme_matriz: {
        Row: {
          data: Json
          key: string
          updated_at: string
        }
        Insert: {
          data: Json
          key: string
          updated_at?: string
        }
        Update: {
          data?: Json
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      sigme_matriz_links: {
        Row: {
          direto: string | null
          nivel: number
          sponsor: string | null
        }
        Insert: {
          direto?: string | null
          nivel: number
          sponsor?: string | null
        }
        Update: {
          direto?: string | null
          nivel?: number
          sponsor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sigme_matriz_links_direto_fkey"
            columns: ["direto"]
            isOneToOne: false
            referencedRelation: "sigme_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sigme_matriz_links_sponsor_fkey"
            columns: ["sponsor"]
            isOneToOne: false
            referencedRelation: "sigme_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sigme_pagamentos: {
        Row: {
          beneficiario_id: string
          bloco_id: number
          criado_em: string | null
          id: number
          pago: boolean | null
          tipo: string
          valor: number
        }
        Insert: {
          beneficiario_id: string
          bloco_id: number
          criado_em?: string | null
          id?: number
          pago?: boolean | null
          tipo: string
          valor: number
        }
        Update: {
          beneficiario_id?: string
          bloco_id?: number
          criado_em?: string | null
          id?: number
          pago?: boolean | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "sigme_pagamentos_beneficiario_id_fkey"
            columns: ["beneficiario_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_pagamentos_beneficiario_id_fkey"
            columns: ["beneficiario_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_pagamentos_beneficiario_id_fkey"
            columns: ["beneficiario_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "sigme_pagamentos_beneficiario_id_fkey"
            columns: ["beneficiario_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "sigme_pagamentos_bloco_id_fkey"
            columns: ["bloco_id"]
            isOneToOne: false
            referencedRelation: "sigme_blocos"
            referencedColumns: ["id"]
          },
        ]
      }
      sigme_ranks: {
        Row: {
          ciclos: number
          id: number
          mes_ano: string
          pin: number
          user_id: string | null
        }
        Insert: {
          ciclos?: number
          id?: number
          mes_ano: string
          pin: number
          user_id?: string | null
        }
        Update: {
          ciclos?: number
          id?: number
          mes_ano?: string
          pin?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sigme_ranks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "sigme_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sigme_slots: {
        Row: {
          afiliado_id: string
          bloco_id: number
          id: number
          pos: number
        }
        Insert: {
          afiliado_id: string
          bloco_id: number
          id?: number
          pos: number
        }
        Update: {
          afiliado_id?: string
          bloco_id?: number
          id?: number
          pos?: number
        }
        Relationships: [
          {
            foreignKeyName: "sigme_slots_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_slots_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_slots_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "sigme_slots_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "sigme_slots_bloco_id_fkey"
            columns: ["bloco_id"]
            isOneToOne: false
            referencedRelation: "sigme_blocos"
            referencedColumns: ["id"]
          },
        ]
      }
      sigme_top_fundos_mes: {
        Row: {
          atualizado_em: string
          periodo_id: number
          valor_total: number
        }
        Insert: {
          atualizado_em?: string
          periodo_id: number
          valor_total?: number
        }
        Update: {
          atualizado_em?: string
          periodo_id?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "sigme_top_fundos_mes_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: true
            referencedRelation: "sigme_top_periodos"
            referencedColumns: ["id"]
          },
        ]
      }
      sigme_top_periodos: {
        Row: {
          ano: number
          fim: string
          id: number
          inicio: string
          mes: number
          pool_pct: number
        }
        Insert: {
          ano: number
          fim: string
          id?: number
          inicio: string
          mes: number
          pool_pct?: number
        }
        Update: {
          ano?: number
          fim?: string
          id?: number
          inicio?: string
          mes?: number
          pool_pct?: number
        }
        Relationships: []
      }
      sigme_top_pool: {
        Row: {
          pct: number
          pos: number
        }
        Insert: {
          pct: number
          pos: number
        }
        Update: {
          pct?: number
          pos?: number
        }
        Relationships: []
      }
      sigme_top_rank: {
        Row: {
          afiliado_id: string | null
          ano: number | null
          ciclos: number
          id: number
          mes: number | null
          pos: number
          premio: number
        }
        Insert: {
          afiliado_id?: string | null
          ano?: number | null
          ciclos: number
          id?: number
          mes?: number | null
          pos: number
          premio: number
        }
        Update: {
          afiliado_id?: string | null
          ano?: number | null
          ciclos?: number
          id?: number
          mes?: number | null
          pos?: number
          premio?: number
        }
        Relationships: [
          {
            foreignKeyName: "sigme_top_rank_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_top_rank_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_top_rank_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "sigme_top_rank_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
        ]
      }
      sigme_top_ranking: {
        Row: {
          afiliado_id: string
          ciclos_l0: number
          ciclos_l1: number
          ciclos_l2: number
          ciclos_l3: number
          id: number
          periodo_id: number
          posicao: number | null
          premio_valor: number | null
          total: number
        }
        Insert: {
          afiliado_id: string
          ciclos_l0?: number
          ciclos_l1?: number
          ciclos_l2?: number
          ciclos_l3?: number
          id?: number
          periodo_id: number
          posicao?: number | null
          premio_valor?: number | null
          total?: number
        }
        Update: {
          afiliado_id?: string
          ciclos_l0?: number
          ciclos_l1?: number
          ciclos_l2?: number
          ciclos_l3?: number
          id?: number
          periodo_id?: number
          posicao?: number | null
          premio_valor?: number | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "sigme_top_ranking_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_top_ranking_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sigme_top_ranking_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "sigme_top_ranking_afiliado_id_fkey"
            columns: ["afiliado_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "sigme_top_ranking_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "sigme_top_periodos"
            referencedColumns: ["id"]
          },
        ]
      }
      sigme_users: {
        Row: {
          created_at: string | null
          matricula: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          matricula?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          matricula?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sigme_vendas: {
        Row: {
          created_at: string | null
          id: number
          pontos: number | null
          produto: string | null
          user_id: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          pontos?: number | null
          produto?: string | null
          user_id?: string | null
          valor: number
        }
        Update: {
          created_at?: string | null
          id?: number
          pontos?: number | null
          produto?: string | null
          user_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "sigme_vendas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "sigme_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      site_config: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          site_url: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          site_url: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          site_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          features: Json
          id: string
          limitations: Json
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          limitations?: Json
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          price?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          limitations?: Json
          name?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      suporte_config: {
        Row: {
          ativo: boolean
          created_at: string
          email_suporte: string | null
          horario_atendimento: string | null
          id: string
          link_video_principal: string | null
          mensagem_suporte: string
          updated_at: string
          whatsapp_suporte: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email_suporte?: string | null
          horario_atendimento?: string | null
          id?: string
          link_video_principal?: string | null
          mensagem_suporte: string
          updated_at?: string
          whatsapp_suporte?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email_suporte?: string | null
          horario_atendimento?: string | null
          id?: string
          link_video_principal?: string | null
          mensagem_suporte?: string
          updated_at?: string
          whatsapp_suporte?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          created_at: string | null
          id: string
          model: string | null
          name: string
          purpose: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          model?: string | null
          name: string
          purpose?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          model?: string | null
          name?: string
          purpose?: string | null
        }
        Relationships: []
      }
      tutoriais: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          link_tutorial: string
          ordem: number | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          link_tutorial: string
          ordem?: number | null
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          link_tutorial?: string
          ordem?: number | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      ui_component_props: {
        Row: {
          component_id: string | null
          id: string
          prop: string
          value: Json
        }
        Insert: {
          component_id?: string | null
          id?: string
          prop: string
          value: Json
        }
        Update: {
          component_id?: string | null
          id?: string
          prop?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ui_component_props_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "ui_components"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_components: {
        Row: {
          area: string | null
          binding: Json | null
          id: string
          meta: Json | null
          ordem: number | null
          page_id: string | null
          tipo: string
        }
        Insert: {
          area?: string | null
          binding?: Json | null
          id?: string
          meta?: Json | null
          ordem?: number | null
          page_id?: string | null
          tipo: string
        }
        Update: {
          area?: string | null
          binding?: Json | null
          id?: string
          meta?: Json | null
          ordem?: number | null
          page_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "ui_components_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "ui_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_dictionary: {
        Row: {
          chave: string
          updated_at: string | null
          valor: string
        }
        Insert: {
          chave: string
          updated_at?: string | null
          valor: string
        }
        Update: {
          chave?: string
          updated_at?: string | null
          valor?: string
        }
        Relationships: []
      }
      ui_menu_items: {
        Row: {
          icon: string | null
          id: string
          label: string
          menu_id: string | null
          meta: Json | null
          ordem: number | null
          parent_id: string | null
          rota: string | null
          visible: boolean | null
        }
        Insert: {
          icon?: string | null
          id?: string
          label: string
          menu_id?: string | null
          meta?: Json | null
          ordem?: number | null
          parent_id?: string | null
          rota?: string | null
          visible?: boolean | null
        }
        Update: {
          icon?: string | null
          id?: string
          label?: string
          menu_id?: string | null
          meta?: Json | null
          ordem?: number | null
          parent_id?: string | null
          rota?: string | null
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ui_menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "ui_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ui_menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ui_menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_menus: {
        Row: {
          created_at: string | null
          id: string
          meta: Json | null
          ordem: number | null
          slug: string
          titulo: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          meta?: Json | null
          ordem?: number | null
          slug: string
          titulo: string
        }
        Update: {
          created_at?: string | null
          id?: string
          meta?: Json | null
          ordem?: number | null
          slug?: string
          titulo?: string
        }
        Relationships: []
      }
      ui_pages: {
        Row: {
          created_at: string | null
          id: string
          layout: string | null
          meta: Json | null
          slug: string
          titulo: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          layout?: string | null
          meta?: Json | null
          slug: string
          titulo?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          layout?: string | null
          meta?: Json | null
          slug?: string
          titulo?: string | null
        }
        Relationships: []
      }
      user_ai_credits: {
        Row: {
          ano: number
          created_at: string
          creditos_usados: number
          id: string
          limite_mensal: number
          mes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ano: number
          created_at?: string
          creditos_usados?: number
          id?: string
          limite_mensal?: number
          mes: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: number
          created_at?: string
          creditos_usados?: number
          id?: string
          limite_mensal?: number
          mes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          endereco_bairro: string | null
          endereco_cep: string | null
          endereco_cidade: string | null
          endereco_estado: string | null
          endereco_numero: string | null
          endereco_rua: string | null
          id: string
          nome_completo: string | null
          perfil_completo: boolean
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_estado?: string | null
          endereco_numero?: string | null
          endereco_rua?: string | null
          id?: string
          nome_completo?: string | null
          perfil_completo?: boolean
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_estado?: string | null
          endereco_numero?: string | null
          endereco_rua?: string | null
          id?: string
          nome_completo?: string | null
          perfil_completo?: boolean
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario_roles: {
        Row: {
          role_id: number
          usuario_id: string
        }
        Insert: {
          role_id: number
          usuario_id: string
        }
        Update: {
          role_id?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_roles_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          criado_em: string | null
          email: string
          id: string
          nome: string
          patrocinador_id: string | null
          telefone: string | null
        }
        Insert: {
          criado_em?: string | null
          email: string
          id?: string
          nome: string
          patrocinador_id?: string | null
          telefone?: string | null
        }
        Update: {
          criado_em?: string | null
          email?: string
          id?: string
          nome?: string
          patrocinador_id?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_patrocinador_id_fkey"
            columns: ["patrocinador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      vans: {
        Row: {
          ativo: boolean
          capacidade_maxima: number
          created_at: string
          id: string
          nome: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          capacidade_maxima?: number
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          capacidade_maxima?: number
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      videos_educacao: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          link_video: string
          ordem: number | null
          thumbnail_url: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          link_video: string
          ordem?: number | null
          thumbnail_url?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          link_video?: string
          ordem?: number | null
          thumbnail_url?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      videos_educativos: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          descricao: string | null
          duracao: string | null
          id: string
          thumbnail: string | null
          titulo: string
          updated_at: string
          youtube_url: string
        }
        Insert: {
          ativo?: boolean
          categoria: string
          created_at?: string
          descricao?: string | null
          duracao?: string | null
          id?: string
          thumbnail?: string | null
          titulo: string
          updated_at?: string
          youtube_url: string
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao?: string | null
          duracao?: string | null
          id?: string
          thumbnail?: string | null
          titulo?: string
          updated_at?: string
          youtube_url?: string
        }
        Relationships: []
      }
      wallet_tx: {
        Row: {
          created_at: string | null
          id: string
          motivo: Database["public"]["Enums"]["tx_reason"]
          ref: Json | null
          tipo: Database["public"]["Enums"]["tx_type"]
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          motivo: Database["public"]["Enums"]["tx_reason"]
          ref?: Json | null
          tipo: Database["public"]["Enums"]["tx_type"]
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string | null
          id?: string
          motivo?: Database["public"]["Enums"]["tx_reason"]
          ref?: Json | null
          tipo?: Database["public"]["Enums"]["tx_type"]
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      wallets: {
        Row: {
          atualizado_em: string | null
          saldo: number
          user_id: string
        }
        Insert: {
          atualizado_em?: string | null
          saldo?: number
          user_id: string
        }
        Update: {
          atualizado_em?: string | null
          saldo?: number
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_instances: {
        Row: {
          created_at: string
          id: string
          instance_name: string
          phone_number: string | null
          qr_code: string | null
          status: string
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          instance_name: string
          phone_number?: string | null
          qr_code?: string | null
          status?: string
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          instance_name?: string
          phone_number?: string | null
          qr_code?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          ai_generated: boolean
          context: Json | null
          created_at: string
          external_id: string | null
          id: string
          instance_id: string
          message_content: string
          message_type: string
          status: string
          to_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean
          context?: Json | null
          created_at?: string
          external_id?: string | null
          id?: string
          instance_id: string
          message_content: string
          message_type?: string
          status?: string
          to_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean
          context?: Json | null
          created_at?: string
          external_id?: string | null
          id?: string
          instance_id?: string
          message_content?: string
          message_type?: string
          status?: string
          to_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          error: string | null
          finished_at: string | null
          id: string
          input: Json | null
          output: Json | null
          started_at: string | null
          status: string
          workflow_id: string | null
        }
        Insert: {
          error?: string | null
          finished_at?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          started_at?: string | null
          status?: string
          workflow_id?: string | null
        }
        Update: {
          error?: string | null
          finished_at?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          started_at?: string | null
          status?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          id: string
          ordem: number
          spec: Json
          stop_on_error: boolean | null
          tipo: string
          workflow_id: string | null
        }
        Insert: {
          id?: string
          ordem: number
          spec: Json
          stop_on_error?: boolean | null
          tipo: string
          workflow_id?: string | null
        }
        Update: {
          id?: string
          ordem?: number
          spec?: Json
          stop_on_error?: boolean | null
          tipo?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_triggers: {
        Row: {
          id: string
          spec: Json
          tipo: string
          workflow_id: string | null
        }
        Insert: {
          id?: string
          spec: Json
          tipo: string
          workflow_id?: string | null
        }
        Update: {
          id?: string
          spec?: Json
          tipo?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_triggers_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string | null
          descricao: string | null
          enabled: boolean | null
          id: string
          nome: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          enabled?: boolean | null
          id?: string
          nome: string
          slug: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          enabled?: boolean | null
          id?: string
          nome?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      affiliates: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          ref_code: string | null
          sponsor_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          ref_code?: string | null
          sponsor_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          ref_code?: string | null
          sponsor_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "afiliados_usuario_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_afiliados_patroc"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_afiliados_patroc"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "afiliados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_afiliados_patroc"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "vw_comissoes_saldo"
            referencedColumns: ["afiliado_id"]
          },
          {
            foreignKeyName: "fk_afiliados_patroc"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "vw_volume_mensal"
            referencedColumns: ["afiliado_id"]
          },
        ]
      }
      drop_meta: {
        Row: {
          pct_sugerido: number | null
          unidades_vendidas: number | null
          user_id: string | null
        }
        Insert: {
          pct_sugerido?: never
          unidades_vendidas?: number | null
          user_id?: string | null
        }
        Update: {
          pct_sugerido?: never
          unidades_vendidas?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      network_l123: {
        Row: {
          l1: string | null
          l2: string | null
          l3: string | null
          u: string | null
        }
        Relationships: []
      }
      vw_comissoes_saldo: {
        Row: {
          afiliado_id: string | null
          liberado: number | null
          nome: string | null
          pago: number | null
          pendente: number | null
        }
        Relationships: []
      }
      vw_volume_mensal: {
        Row: {
          afiliado_id: string | null
          ano: number | null
          mes: number | null
          nome: string | null
          perc_sugerido: number | null
          unidades: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      citext: {
        Args: { "": boolean } | { "": string } | { "": unknown }
        Returns: string
      }
      citext_hash: {
        Args: { "": string }
        Returns: number
      }
      citextin: {
        Args: { "": unknown }
        Returns: string
      }
      citextout: {
        Args: { "": string }
        Returns: unknown
      }
      citextrecv: {
        Args: { "": unknown }
        Returns: string
      }
      citextsend: {
        Args: { "": string }
        Returns: string
      }
      consume_ai_credit: {
        Args: { p_credits?: number; p_user_id: string }
        Returns: boolean
      }
      credit_wallet: {
        Args: { p_ref?: Json; p_user_id: string; p_value: number }
        Returns: undefined
      }
      current_affiliate_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      ensure_admin_affiliate: {
        Args: { p_email: string; p_nome: string; p_ref?: string }
        Returns: string
      }
      ensure_wallet: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      exec_sql_safe: {
        Args: { p_sql: string }
        Returns: string
      }
      fecha_top_pool: {
        Args: { p_periodo_id: number }
        Returns: undefined
      }
      fn_comissao_percentual: {
        Args: { unidades: number }
        Returns: number
      }
      fn_touch_volume: {
        Args: { afiliado: string; dt: string }
        Returns: {
          ano: number
          mes: number
          unidades: number
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      recalcula_top_ranking: {
        Args: { p_periodo_id: number }
        Returns: undefined
      }
      registra_ciclo: {
        Args: { p_afiliado: string; p_data?: string }
        Returns: undefined
      }
      rs_project_context: {
        Args: { p_id: string; p_limit?: number }
        Returns: Json
      }
      rsia_describe_schema: {
        Args: { schema_names: string[] }
        Returns: Json
      }
      rsia_sample_table: {
        Args: { limit_rows?: number; schema_name: string; table_name: string }
        Returns: Json
      }
      sigme_distribuido_mes: {
        Args: { p_ref: string }
        Returns: number
      }
      sigme_enfileirar: {
        Args: { p_af: string }
        Returns: undefined
      }
      sigme_fechar_top: {
        Args: { p_ref: string }
        Returns: undefined
      }
      sigme_pagar_ciclo: {
        Args: { p_bloco: number }
        Returns: undefined
      }
      tem_direto_ativado60: {
        Args: { p_afiliado: string }
        Returns: boolean
      }
      wallet_apply_tx: {
        Args: {
          _motivo: Database["public"]["Enums"]["tx_reason"]
          _ref?: Json
          _tipo: Database["public"]["Enums"]["tx_type"]
          _user: string
          _valor: number
        }
        Returns: string
      }
    }
    Enums: {
      drop_tier:
        | "iniciante"
        | "basico"
        | "bronze"
        | "prata"
        | "ouro"
        | "platina"
        | "diamante"
      pix_type: "cpf" | "cnpj" | "email" | "telefone" | "chave_aleatoria"
      subscription_plan_type:
        | "free"
        | "premium"
        | "basic"
        | "professional"
        | "unlimited"
      subscription_status: "active" | "expired" | "cancelled" | "trial"
      tx_reason: "venda" | "saque" | "transferencia" | "ajuste"
      tx_type: "credito" | "debito"
      user_role: "admin" | "consultor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      drop_tier: [
        "iniciante",
        "basico",
        "bronze",
        "prata",
        "ouro",
        "platina",
        "diamante",
      ],
      pix_type: ["cpf", "cnpj", "email", "telefone", "chave_aleatoria"],
      subscription_plan_type: [
        "free",
        "premium",
        "basic",
        "professional",
        "unlimited",
      ],
      subscription_status: ["active", "expired", "cancelled", "trial"],
      tx_reason: ["venda", "saque", "transferencia", "ajuste"],
      tx_type: ["credito", "debito"],
      user_role: ["admin", "consultor"],
    },
  },
} as const
