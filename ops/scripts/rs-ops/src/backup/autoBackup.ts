/**
 * Sistema de Backup Automático
 * RS Prólipsi - Automatic Backup System
 * 
 * Realiza backups automáticos do Supabase
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface BackupConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  backupPath: string;
  retentionDays: number;
  compress: boolean;
}

interface BackupResult {
  success: boolean;
  filename: string;
  size: number;
  duration: number;
  error?: string;
}

/**
 * Sistema de Backup Automático
 */
export class AutoBackup {
  private config: BackupConfig;

  constructor(config: BackupConfig) {
    this.config = config;
    this.ensureBackupDirectory();
  }

  /**
   * Garante que diretório de backup existe
   */
  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.config.backupPath)) {
      fs.mkdirSync(this.config.backupPath, { recursive: true });
    }
  }

  /**
   * Executa backup completo
   */
  public async executeBackup(): Promise<BackupResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.sql${this.config.compress ? '.gz' : ''}`;
    const filepath = path.join(this.config.backupPath, filename);

    try {
      // Comando pg_dump
      let command = `PGPASSWORD="${this.config.password}" pg_dump `;
      command += `-h ${this.config.host} `;
      command += `-p ${this.config.port} `;
      command += `-U ${this.config.user} `;
      command += `-d ${this.config.database} `;
      command += `--format=plain `;
      command += `--no-owner `;
      command += `--no-acl `;

      if (this.config.compress) {
        command += `| gzip > "${filepath}"`;
      } else {
        command += `> "${filepath}"`;
      }

      // Executar backup
      await execAsync(command);

      // Verificar arquivo criado
      const stats = fs.statSync(filepath);
      const duration = Date.now() - startTime;

      // Limpar backups antigos
      await this.cleanOldBackups();

      return {
        success: true,
        filename,
        size: stats.size,
        duration
      };

    } catch (error) {
      return {
        success: false,
        filename,
        size: 0,
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * Limpa backups antigos
   */
  private async cleanOldBackups(): Promise<number> {
    const files = fs.readdirSync(this.config.backupPath);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    let deletedCount = 0;

    for (const file of files) {
      if (!file.startsWith('backup_')) continue;

      const filepath = path.join(this.config.backupPath, file);
      const stats = fs.statSync(filepath);

      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filepath);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Lista backups disponíveis
   */
  public listBackups(): Array<{filename: string; size: number; date: Date}> {
    const files = fs.readdirSync(this.config.backupPath);
    const backups = [];

    for (const file of files) {
      if (!file.startsWith('backup_')) continue;

      const filepath = path.join(this.config.backupPath, file);
      const stats = fs.statSync(filepath);

      backups.push({
        filename: file,
        size: stats.size,
        date: stats.mtime
      });
    }

    return backups.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Restaura backup
   */
  public async restoreBackup(filename: string): Promise<boolean> {
    const filepath = path.join(this.config.backupPath, filename);

    if (!fs.existsSync(filepath)) {
      throw new Error(`Backup não encontrado: ${filename}`);
    }

    try {
      let command = `PGPASSWORD="${this.config.password}" psql `;
      command += `-h ${this.config.host} `;
      command += `-p ${this.config.port} `;
      command += `-U ${this.config.user} `;
      command += `-d ${this.config.database} `;

      if (filename.endsWith('.gz')) {
        command = `gunzip -c "${filepath}" | ` + command;
      } else {
        command += `< "${filepath}"`;
      }

      await execAsync(command);
      return true;

    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return false;
    }
  }

  /**
   * Gera relatório de backups
   */
  public generateReport(): string {
    const backups = this.listBackups();
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);

    let report = '\n';
    report += '='.repeat(70) + '\n';
    report += '💾 RELATÓRIO DE BACKUPS\n';
    report += '='.repeat(70) + '\n\n';
    report += `Total de Backups: ${backups.length}\n`;
    report += `Tamanho Total: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`;
    report += `Retenção: ${this.config.retentionDays} dias\n\n`;

    if (backups.length > 0) {
      report += 'Backups Recentes:\n';
      backups.slice(0, 10).forEach(backup => {
        const sizeMB = (backup.size / 1024 / 1024).toFixed(2);
        const date = backup.date.toLocaleString('pt-BR');
        report += `  📦 ${backup.filename} (${sizeMB} MB) - ${date}\n`;
      });
    }

    report += '\n' + '='.repeat(70) + '\n';

    return report;
  }
}

/**
 * Execução via cron (diária às 3h)
 */
export async function runDailyBackup() {
  const backup = new AutoBackup({
    host: process.env.SUPABASE_HOST || 'db.rptkhrboejbwexseikuo.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_PASSWORD || 'Yannis784512@',
    backupPath: './backups',
    retentionDays: 30,
    compress: true
  });

  const result = await backup.executeBackup();
  
  if (result.success) {
    console.log(`✅ Backup realizado: ${result.filename} (${(result.size / 1024 / 1024).toFixed(2)} MB)`);
  } else {
    console.error(`❌ Erro no backup: ${result.error}`);
  }

  return result;
}

export default AutoBackup;
