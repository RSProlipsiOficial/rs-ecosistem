
import { AIContext, AIActionContext, aiActionService } from './aiDataService';
import { User } from '../types';

export type RiskLevel = 'SAFE' | 'MODERATE' | 'HIGH' | 'BLOCKED';

export interface ExecutionResult {
    success: boolean;
    message: string;
    requiresConfirmation?: boolean;
    riskLevel?: RiskLevel;
}

export const AIExecutor = {
    // Safety Router: Evaluate Risk
    assessRisk: (toolName: string, args: any): RiskLevel => {
        // Block Destructive Actions
        if (toolName.startsWith('delete') || toolName.includes('remove')) return 'BLOCKED';
        
        // High Risk Actions (Financial/Stock Impact)
        if (toolName === 'update_product' && args.field === 'price') return 'HIGH'; 
        if (toolName === 'update_product' && args.field === 'stock') return 'HIGH';
        
        // Moderate Risk Actions (Status changes, Bulk comms)
        if (toolName === 'update_order_status') return 'MODERATE';
        if (toolName === 'send_recovery_message' && args.target.includes('bulk')) return 'MODERATE';
        
        return 'SAFE';
    },

    // Security: Validate Scope
    validateScope: (ctx: AIContext, toolName: string, args: any): boolean => {
        // Double check ownership before execution
        if (toolName === 'update_product') {
             const search = args.name_or_sku.toLowerCase();
             const product = ctx.products.find(p => p.id === args.name_or_sku || p.name.toLowerCase().includes(search) || p.sku?.toLowerCase().includes(search));
             
             // If product exists but doesn't belong to user (and user is not admin)
             if (product && product.userId !== ctx.userId && ctx.userRole !== 'Admin') {
                 return false;
             }
        }
        // Orders are checked inside aiActionService via enforceUserScope, but additional check here is good practice
        if (toolName === 'update_order_status') {
            const order = ctx.orders.find(o => o.id === args.order_id);
            if (order && order.userId !== ctx.userId && ctx.userRole !== 'Admin') return false;
        }
        
        return true;
    },

    execute: async (
        toolName: string,
        args: any,
        context: AIContext,
        actionContext: AIActionContext,
        user: User,
        confirmed: boolean = false,
        logAction: (action: string, details: string) => void
    ): Promise<ExecutionResult> => {
        // 1. Safety Router: Risk Assessment
        const risk = AIExecutor.assessRisk(toolName, args);

        if (risk === 'BLOCKED') {
            return { success: false, message: "⛔ Ação bloqueada pelo Safety Router. A IA não tem permissão para excluir dados ou realizar esta operação destrutiva." };
        }

        // 2. Security: Scope Validation
        if (!AIExecutor.validateScope(context, toolName, args)) {
            return { success: false, message: "🔒 Acesso Negado: Você não tem permissão para alterar este recurso." };
        }

        // 3. Confirmation Guard
        if ((risk === 'HIGH' || risk === 'MODERATE') && !confirmed) {
            return {
                success: false,
                message: `⚠️ Esta ação é considerada de risco ${risk === 'HIGH' ? 'ALTO' : 'MODERADO'}. Confirmação necessária.`,
                requiresConfirmation: true,
                riskLevel: risk
            };
        }

        // 4. Execution
        let result = { success: false, message: "Ferramenta desconhecida." };
        
        try {
            switch (toolName) {
                case 'update_product':
                    result = aiActionService.updateProduct(context, actionContext, args);
                    break;
                case 'update_order_status':
                    result = aiActionService.updateOrderStatus(context, actionContext, args);
                    break;
                case 'send_recovery_message':
                    result = aiActionService.sendRecoveryMessage(context, actionContext, args);
                    break;
                default:
                    // Read-only tools or unhandled
                    return { success: true, message: "Execução de leitura processada." };
            }

            // 5. Audit Logging (Immutable)
            if (result.success) {
                const logDetail = `[AI Action] Tool: ${toolName} | Args: ${JSON.stringify(args)} | User: ${user.name}`;
                logAction('UPDATE', logDetail); // Using generic UPDATE action type for now
            }

            return result;

        } catch (e) {
            console.error("AI Execution Error:", e);
            return { success: false, message: "Erro interno na execução da ação." };
        }
    }
};
