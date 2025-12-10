/**
 * RS Prólipsi - Logger Helper
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    context: string;
    message: string;
    meta?: any;
}

export class Logger {
    private context: string;

    constructor(context: string) {
        this.context = context;
    }

    private log(level: LogLevel, message: string, meta?: any) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            context: this.context,
            message,
            meta,
        };

        // Em produção, isso poderia ir para um serviço de logs (Datadog, CloudWatch)
        // Por enquanto, stdout/stderr formatado em JSON
        const output = JSON.stringify(entry);

        if (level === 'error') {
            console.error(output);
        } else {
            console.log(output);
        }
    }

    info(message: string, meta?: any) {
        this.log('info', message, meta);
    }

    warn(message: string, meta?: any) {
        this.log('warn', message, meta);
    }

    error(message: string, error?: any) {
        this.log('error', message, { error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
    }

    debug(message: string, meta?: any) {
        if (process.env.DEBUG === 'true') {
            this.log('debug', message, meta);
        }
    }
}
