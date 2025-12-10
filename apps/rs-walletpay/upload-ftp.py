#!/usr/bin/env python3
"""
Script para fazer upload do WalletPay via FTP
Usa as credenciais da Hostinger
"""

import os
import ftplib
from pathlib import Path

# Configurações
FTP_HOST = "ftp.rsprolipsi.com.br"  # ou "191.252.92.55"
FTP_USER = "u172569559"
FTP_PASS = input("Digite a senha FTP: ")  # Você digita a senha
REMOTE_DIR = "/domains/walletpay.rsprolipsi.com.br/public_html"
LOCAL_DIR = "dist"

def upload_directory(ftp, local_path, remote_path):
    """Upload recursivo de diretório"""
    for item in os.listdir(local_path):
        local_item = os.path.join(local_path, item)
        remote_item = f"{remote_path}/{item}"
        
        if os.path.isfile(local_item):
            print(f"📤 Enviando: {item}")
            with open(local_item, 'rb') as f:
                ftp.storbinary(f'STOR {remote_item}', f)
        elif os.path.isdir(local_item):
            print(f"📁 Criando pasta: {item}")
            try:
                ftp.mkd(remote_item)
            except:
                pass  # Pasta já existe
            upload_directory(ftp, local_item, remote_item)

def main():
    print("🚀 Iniciando upload do RS WalletPay...")
    print("=" * 50)
    
    try:
        # Conectar ao FTP
        print("🔌 Conectando ao servidor FTP...")
        ftp = ftplib.FTP(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        print("✅ Conectado!")
        
        # Ir para o diretório remoto
        print(f"📂 Navegando para {REMOTE_DIR}...")
        ftp.cwd(REMOTE_DIR)
        
        # Limpar diretório (opcional)
        print("🧹 Limpando diretório remoto...")
        try:
            for item in ftp.nlst():
                if item not in ['.', '..']:
                    try:
                        ftp.delete(item)
                    except:
                        # É um diretório, tentar remover recursivamente
                        try:
                            ftp.rmd(item)
                        except:
                            pass
        except:
            pass
        
        # Upload dos arquivos
        print("📤 Enviando arquivos...")
        upload_directory(ftp, LOCAL_DIR, REMOTE_DIR)
        
        # Criar .htaccess
        print("⚙️  Criando .htaccess...")
        htaccess_content = """<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
"""
        ftp.storbinary('STOR .htaccess', open('.htaccess.tmp', 'wb').write(htaccess_content.encode()))
        
        # Fechar conexão
        ftp.quit()
        
        print("")
        print("=" * 50)
        print("✅ DEPLOY CONCLUÍDO COM SUCESSO!")
        print("=" * 50)
        print("")
        print("🌐 URL: https://walletpay.rsprolipsi.com.br")
        print("")
        print("💛🖤 RS PRÓLIPSI - WALLETPAY ONLINE!")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
