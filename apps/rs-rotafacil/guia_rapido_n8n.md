# Guia de Inicialização: n8n e Evolution API

Seu n8n não abriu em `localhost:5678` porque o serviço ainda não foi iniciado. Como você tem o **Node.js** instalado, podemos resolver isso agora.

## 1. Como Iniciar o n8n Agora (Local)

Abra seu terminal e digite exatamente este comando:

```powershell
npx n8n
```

- **O que vai acontecer**: O Node vai baixar o n8n temporariamente e iniciá-lo.
- **Como acessar**: Assim que terminar, abra [http://localhost:5678](http://localhost:5678).

---

## 2. E a Evolution API? (WhatsApp)

A Evolution API é mais complexa de rodar no Windows sem o Docker. 

### Opção A: Usar Docker (Recomendado)
Para rodar tudo junto (n8n + Evolution) com um clique, você precisa instalar o **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**. Com ele instalado, eu consigo rodar aquele arquivo que criei para você.

### Opção B: Rodar na VPS (Profissional)
Se você quiser que tudo funcione 24h por dia:
1. Acesse o terminal da sua VPS (Hostinger).
2. Vá para a pasta do projeto.
3. Execute: `bash deploy-infra.sh`.

---

## Próximo Passo
Tente rodar o `npx n8n` no seu terminal e me mande uma foto do que aparecer! 👋
