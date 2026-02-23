import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncService } from './syncService';
import { supabase as localSupabase } from '../lib/supabaseClient';

// Mock do supabase local
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

// Mock do módulo @supabase/supabase-js para interceptar o cliente central
const mockCentralFrom = vi.fn();
const mockCentralSelect = vi.fn();
const mockCentralEq = vi.fn();
const mockCentralMaybeSingle = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        from: mockCentralFrom,
    })),
}));

describe('syncService', () => {
    // Helper para configurar mocks encadeados
    const setupSupabaseMock = (mockFn: any, returns: any) => {
        const chain = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue(returns.maybeSingle || { data: null, error: null }),
            upsert: vi.fn().mockResolvedValue(returns.upsert || { error: null }),
            update: vi.fn().mockResolvedValue(returns.update || { error: null }),
        };
        mockFn.mockReturnValue(chain);
        return chain;
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Configurar chain do Central Supabase
        mockCentralFrom.mockReturnValue({
            select: mockCentralSelect,
        });
        mockCentralSelect.mockReturnValue({
            eq: mockCentralEq,
        });
        mockCentralEq.mockReturnValue({
            maybeSingle: mockCentralMaybeSingle,
        });
    });

    it('syncProfile: deve falhar se consultor local não for encontrado', async () => {
        // Mock Local retornando null
        setupSupabaseMock(localSupabase.from, { maybeSingle: { data: null, error: null } });

        const result = await syncService.syncProfile('user-id-inexistente');

        expect(result.success).toBe(false);
        expect(result.message).toContain('Consultor local não encontrado');
    });

    it('syncProfile: deve falhar se consultor não existir na central', async () => {
        // Mock Local retornando sucesso
        setupSupabaseMock(localSupabase.from, { maybeSingle: { data: { username: 'user123' }, error: null } });

        // Mock Central retornando null
        mockCentralMaybeSingle.mockResolvedValue({ data: null, error: null });

        const result = await syncService.syncProfile('user-id-valido');

        expect(result.success).toBe(false);
        expect(result.message).toContain('Dados não encontrados na plataforma central');
    });

    it('syncProfile: deve sincronizar dados com sucesso', async () => {
        // Mock Local
        const localChain = setupSupabaseMock(localSupabase.from, {
            maybeSingle: { data: { username: 'user123' }, error: null },
            upsert: { error: null },
            update: { error: null }
        });

        // Mock Central retornando dados
        mockCentralMaybeSingle.mockResolvedValue({
            data: { nome: 'Nome Atualizado', telefone: '5511999999999', cpf: '12345678900' },
            error: null
        });

        const result = await syncService.syncProfile('user-id-valido');

        expect(result.success).toBe(true);
        expect(result.message).toContain('sincronizados com sucesso');

        // Verificar se upsert foi chamado com os dados corretos no user_profiles
        expect(localSupabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('pullFromPlatform: deve retornar dados quando encontrado por email', async () => {
        const mockData = { nome: 'Teste', email: 'teste@email.com', telefone: '1199999999', cpf: '11122233344', username: 'testuser' };
        mockCentralMaybeSingle.mockResolvedValue({ data: mockData, error: null });

        const result = await syncService.pullFromPlatform('teste@email.com');

        expect(result.success).toBe(true);
        expect(result.data).toEqual(expect.objectContaining({
            email: 'teste@email.com',
            fullName: 'Teste'
        }));
    });
});
