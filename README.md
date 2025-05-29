# 🔐 NestJS Auth API with JWT & Refresh Token

Uma API de autenticação robusta desenvolvida com [NestJS](https://nestjs.com/), utilizando tokens JWT e refresh tokens com revogação real, escrita com foco em segurança, testes e boas práticas.

---

## 📚 Sumário

- [📦 Tecnologias](#-tecnologias)
- [🚀 Como rodar localmente](#-como-rodar-localmente)
- [⚙️ Variáveis de ambiente](#️-variáveis-de-ambiente)
- [📜 Scripts disponíveis](#-scripts-disponíveis)
- [🧪 Testes e2e](#-testes-e2e)
- [🔁 Fluxo de autenticação](#-fluxo-de-autenticação)
- [📬 Testes via Postman](#-testes-via-postman)
- [🧾 Documentação Swagger](#-documentação-swagger)
- [🛡️ Checklist de segurança](#️-checklist-de-segurança)
- [🏛️ Arquitetura](#-arquitetura)
- [☁️ Deploy e Produção](#️-deploy-e-produção)

---

## 📦 Tecnologias

- [NestJS](https://nestjs.com/)
- [Passport](http://www.passportjs.org/) + JWT Strategy
- [MySQL](https://www.mysql.com/) (via [DBeaver](https://dbeaver.io/))
- [TypeORM](https://typeorm.io/)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [Supertest](https://www.npmjs.com/package/supertest)
- [Jest](https://jestjs.io/)
- [Swagger (OpenAPI)](https://swagger.io/)

---

## 🚀 Como rodar localmente

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/nest-auth-jwt.git
cd nest-auth-jwt

2. **Instale as dependências**
npm install

3. **Configure seu .env**
Crie um arquivo .env com base no .env.example.

4. **Configure o MySQL**
Use o DBeaver ou outro cliente para:

Criar o banco de dados

Rodar as migrations (se houver)

5. **Inicie o projeto**
npm run start:dev

⚙️ Variáveis de ambiente
Crie um arquivo .env com o seguinte conteúdo:
JWT_SECRET=suachavesecreta
JWT_REFRESH_SECRET=suarefreshsecreta
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
DATABASE_URL=mysql://usuario:senha@localhost:3306/seubanco

📜 Scripts disponíveis
Comando	Descrição
npm run start:dev	  Inicia o servidor em modo dev
npm run test	      Roda os testes unitários
npm run test:e2e	  Roda os testes de integração e2e
npm run build	      Compila o projeto para produção
npm run start:prod	Inicia a versão buildada

🧪 Testes e2e
Utiliza o supertest para simular o fluxo real de login, refresh, acesso e logout.

npm run test:e2e

Casos cobertos:
Login com credenciais válidas e inválidas
Acesso à rota protegida com/sem token
Refresh token válido, expirado ou revogado
Logout invalida o refresh token

🔁 Fluxo de autenticação
1. POST /auth/login
   → access_token (curto)
   → refresh_token (longo)

2. GET /auth/profile
   → precisa do access_token válido

3. POST /auth/refresh
   → envia refresh_token
   → recebe novo par de tokens

4. POST /auth/logout
   → refresh_token revogado


📬 Testes via Postman
Você pode importar a collection Postman incluída na pasta /docs/postman_collection.json
Ou seguir os exemplos acima para testar manualmente.

🧾 Documentação Swagger
Acesse em tempo de execução:
http://localhost:3000/api

Inclui:
Todas as rotas disponíveis
Parâmetros e tipos
Status code esperados
Descrições úteis

🛡️ Checklist de segurança
✅ Senhas com hash (BCrypt)
✅ Refresh tokens também são hasheados
✅ Tokens com expiração curta (access) e longa (refresh)
✅ Logout revoga o refresh
✅ Middleware protege rotas privadas
✅ Variáveis sensíveis fora do código (.env)
✅ Nenhum segredo commitado

🏛️ Arquitetura
src/
│
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   ├── strategies/
│   ├── guards/
│
├── user/
├── common/
│   ├── guards/
│   └── interfaces/
├── config/
├── main.ts
└── app.module.ts

🔐 Estratégia de autenticação:
JWT (Access token curto)
Refresh token armazenado hasheado no DB
Guard com Passport verifica token JWT

☁️ Deploy e Produção
Você pode preparar este projeto para produção com:

 ✅ Build com npm run build
 🔒 Adicionar HTTPS em produção
 ☁️ Docker (opcional)
 🚀 Procfile (Heroku)
 🧪 CI/CD (GitHub Actions)

Projeto feito como base para futuras integrações com frontend (ex: Next.js) e uso de APIs externas como PokéAPI.

