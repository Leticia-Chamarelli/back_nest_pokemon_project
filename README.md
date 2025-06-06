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
- [PostgreSQL](https://www.postgresql.org/) (via [DBeaver](https://dbeaver.io/))
- [TypeORM](https://typeorm.io/)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [Supertest](https://www.npmjs.com/package/supertest)
- [Jest](https://jestjs.io/)
- [Swagger (OpenAPI)](https://swagger.io/)


---

## 🚀 Como rodar localmente

1. **Clone o repositório**␣

```bash
git clone https://github.com/seu-usuario/nest-auth-jwt.git

cd nest-auth-jwt
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure seu `.env`**

   Crie um arquivo `.env` com base no arquivo `.env.example`.


4. **Configure o PostgreSQL**

   Use o DBeaver ou outro cliente para:
   - Criar o banco de dados; e

   - Rodar as migrations, se houver.

 
5. **Inicie o projeto**
```bash
npm run start:dev
```

## ⚙️ Variáveis de ambiente

Crie um arquivo `.env` com base no `.env.example`:

```bash
# JWT
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_jwt_secret_here

# DATABASE
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=back_nest_auth
```

## 📜 Scripts disponíveis

| Comando               | Descrição                             |
|-----------------------|---------------------------------------|
| `npm run start:dev`   | Inicia o servidor em modo dev         |
| `npm run test`        | Roda os testes unitários              |
| `npm run test:e2e`    | Roda os testes de integração e2e      |
| `npm run build`       | Compila o projeto para produção       |
| `npm run start:prod`  | Inicia a versão buildada              |


## 🧪 Testes e2e
Utiliza o supertest para simular o fluxo real de login, refresh, acesso e logout.

```bash
npm run test:e2e
```

Casos cobertos:

- Login com credenciais válidas e inválidas

-  Acesso à rota protegida com/sem token

- Refresh token válido, expirado ou revogado

- Logout invalida o refresh token

## 🔁 Fluxo de autenticação
1. POST /auth/register  
   → Cria um novo usuário

2. POST /auth/login  
   → Recebe access_token (curto)  
   → Recebe refresh_token (longo)

3. GET /auth/profile  
   → Requer access_token válido

4. POST /auth/refresh  
   → Envia refresh_token  
   → Recebe novo par de tokens

5. POST /auth/logout  
   → Refresh_token revogado


## 📬 Testes via Postman
Você pode importar a collection do Postman que está incluída no projeto em `/docs/back_nest_auth.postman_collection.json`

### Como usar:
- Abra o Postman

- Clique em Import → Upload Files.

- Selecione o arquivo `/docs/back_nest_auth.postman_collection.json`

- A collection será importada com todos os endpoints já configurados para teste.

- Atualize a variável de ambiente (se houver) para ajustar a URL base do seu servidor local (ex: http://localhost:3000).

Assim, você pode testar todas as rotas rapidamente com exemplos prontos.

## 🧾 Documentação Swagger
Acesse em tempo de execução:
http://localhost:3000/api

Inclui:

- Todas as rotas disponíveis

- Parâmetros e tipos de dados

- Códigos de status esperados

- Descrições e exemplos úteis

## 🛡️ Checklist de segurança
✅ Senhas com hash (BCrypt)

✅ Refresh tokens também são hasheados

✅ Tokens com expiração curta (access) e longa (refresh)

✅ Logout revoga o refresh

✅ Middleware protege rotas privadas

✅ Variáveis sensíveis fora do código (.env)

✅ Nenhum segredo commitado

## 🏛️ Arquitetura
```bash
📁 src
│
├── 📁 .vscode
│   └── settings.json
├── 📁 auth
│   ├── 📁 dto
│   │   ├── login.dto.ts
│   │   └── refresh.dto.ts
│   ├── 📁 strategies
│   │   └── jwt.strategy.ts
│   ├── auth.controller.spec.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.spec.ts
│   ├── auth.service.ts
│
├── 📁 common
│   ├── 📁 filters
│   │   └── http-exception.filter.ts
│   ├── 📁 guards
│   │   └── jwt-auth.guard.ts
│   └── 📁 interfaces
│       └── request-with-user.interface.ts
│
├── 📁 migrations
│   └── [timestamp]-AddRefreshTokenToUser.ts
│
├── 📁 users
│   ├── user.entity.ts
│   ├── users.controller.spec.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   ├── users.service.spec.ts
│   └── users.service.ts
│
├── app.controller.spec.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
└── swagger.ts
📁 test
├── app.e2e-spec.ts
└── jest-e2e.json
📄 .env.example
📄 .gitignore
📄 .prettierrc
📄 back_nest_auth.postman_collection.json
📄 data-source.ts
📄 eslint.config.mjs
📄 nest-cli.json
📄 package-lock.json
📄 package.json
📄 README.md
📄 tsconfig.build.json
📄 tsconfig.build.tsbuildinfo
📄 tsconfig.json
```
🚫 Ignorados pelo Git:
```bash
- .env
- dist/
- node_modules/
```

## 🔐 Estratégia de autenticação:

- JWT (Access token curto)

- Refresh token armazenado hasheado no DB

- Guard com Passport verifica token JWT

## ☁️ Deploy e Produção
Este projeto está configurado para deploy na plataforma Render, que oferece hospedagem simples para aplicações Node.js.

### Passos para deploy no Render:

1. Configurar repositório Git

- Certifique-se que seu código esteja versionado e no GitHub (ou outro repositório suportado).

2. Criar um novo Web Service no Render

- Escolha o repositório da API NestJS.

- Configure o ambiente para Node.js.

- Configure a porta da aplicação (por padrão, Render define a variável PORT, que sua aplicação deve respeitar).

- Ajuste a variável PORT no NestJS para usar process.env.PORT (exemplo abaixo).

3. Configurar variáveis de ambiente no Render
- Adicione todas as variáveis .env necessárias, incluindo:

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` para PostgreSQL

- `JWT_SECRET`, `JWT_REFRESH_SECRET`

- `PORT` (se necessário)

4. Banco de dados

- A aplicação foi migrada de MySQL para PostgreSQL para compatibilidade com o ambiente do Render.

- Você pode usar o banco de dados PostgreSQL oferecido pelo próprio Render ou outro serviço externo.

- Configure as variáveis do banco no painel do Render.

5. Adaptação da aplicação para a porta do Render
no `seu main.ts`, certifique-se que a aplicação escute a porta da variável de ambiente PORT, assim:

```bash
const port = process.env.PORT || 3000;
await app.listen(port);
```

6. Deploy automático ou manual

- O Render pode disparar deploy automático a cada push na branch principal.

- Ou você pode fazer deploy manual via painel.

### Testes pós-deploy
- As rotas da API podem ser testadas via Postman usando a URL pública fornecida pelo Render, por exemplo:
https://back-nest-auth.onrender.com/auth/login

- O endpoint raiz [/](https://back-nest-auth.onrender.com/) retorna uma mensagem simples para verificar que a API está no ar.

- Caso receba erro 404, verifique as rotas e a configuração da aplicação.

## 🧩  Integrações futuras

Este projeto foi desenvolvido como base para integração com um frontend (ex: Next.js) e consumo de APIs externas (ex: PokeAPI).

