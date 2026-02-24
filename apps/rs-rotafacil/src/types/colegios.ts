export interface Colegio {
    id: string;
    user_id: string;
    nome: string;
    ativo: boolean;
    created_at: string;
    updated_at: string;
}

export interface VanColegio {
    id: string;
    van_id: string;
    colegio_id: string;
    created_at: string;
}

export interface ColegioFormData {
    nome: string;
    van_ids?: string[]; // IDs das vans que atendem este colégio
}

export interface ColegioWithVans extends Colegio {
    vans?: { id: string; nome: string }[];
}
