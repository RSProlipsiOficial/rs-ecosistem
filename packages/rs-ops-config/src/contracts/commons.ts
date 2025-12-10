/**
 * RS Prólipsi - Common Contracts
 */

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        timestamp: string;
    };
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'consultor' | 'customer' | 'logistics';
    permissions: string[];
}

export interface PaginationParams {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
}
