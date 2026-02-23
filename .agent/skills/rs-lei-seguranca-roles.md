---
name: rs-lei-seguranca-roles
description: Lei de segurança do RS. Governa papéis, permissões, segregação de acesso e limites entre usuários, backend, IA e infraestrutura.
---

# RS — Lei de Segurança, Roles & Permissões

## Princípio
🔐 Acesso mínimo necessário.  
Quem pode tudo é risco.

---

## Papéis fundamentais
- usuário
- afiliado
- lojista
- admin
- operador financeiro
- IA (restrito)
- service (backend)

---

## Regras críticas
- frontend nunca tem role de escrita financeira
- IA não acessa service_role diretamente
- backend valida tudo

---

## Segregação
- leitura ≠ escrita
- financeiro ≠ operacional
- humano ≠ IA

---

## Auditoria obrigatória
Eventos:
- ROLE_ASSIGNED
- PERMISSION_GRANTED
- PERMISSION_REVOKED
- ACCESS_DENIED
