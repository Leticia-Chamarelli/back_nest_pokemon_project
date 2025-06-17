# 🧩 NestJS Pokémon API com Autenticação JWT + PokéAPI

Uma API RESTful completa desenvolvida com [NestJS](https://nestjs.com/), com sistema de autenticação robusto via JWT + refresh token, integração com a PokéAPI para capturas, avistamentos e listagens de Pokémon, testes automatizados e foco em segurança e boas práticas.

---

## 📚 Sumário

- [📦 Tecnologias](#-tecnologias)
- [🚀 Como rodar localmente](#-como-rodar-localmente)
- [⚙️ Variáveis de ambiente](#️-variáveis-de-ambiente)
- [📜 Scripts disponíveis](#-scripts-disponíveis)
- [🧪 Testes e2e](#-testes-e2e)
- [🔁 Fluxo de autenticação](#-fluxo-de-autenticação)
- [🔎 Funcionalidades da PokéAPI](#-funcionalidades-da-pokéapi)
- [📬 Testes via Postman](#-testes-via-postman)
- [🧾 Documentação Swagger](#-documentação-swagger)
- [🛡️ Checklist de segurança](#️-checklist-de-segurança)
- [🏛️ Arquitetura](#-arquitetura)
- [☁️ Deploy e Produção](#️-deploy-e-produção)
- [🔗 Integrações Futuras](#-integrações-futuras)

---

## 📦 Tecnologias

- [NestJS](https://nestjs.com/)
- [Passport](http://www.passportjs.org/) + JWT Strategy
- [PostgreSQL](https://www.postgresql.org/) (via [DBeaver](https://dbeaver.io/))
- [TypeORM](https://typeorm.io/)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [HttpModule (PokéAPI)](https://docs.nestjs.com/techniques/http-module)
- [Supertest](https://www.npmjs.com/package/supertest)
- [Jest](https://jestjs.io/)
- [Swagger (OpenAPI)](https://swagger.io/)

---


## 🚀 Como rodar localmente

1. **Clone o repositório**␣

```bash
git clone https://github.com/Leticia-Chamarelli/back_nest_pokemon_project

cd back_nest_pokemon_project
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
DB_NAME=back_nest_pokemon
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
Fluxo de testes com supertest, incluindo:

- Login, refresh e logout

- Acesso a rota protegida

- Captura de Pokémon

- Avistamentos de Pokémon

- Listagens com paginação, por nome ou ID

```bash
npm run test:e2e
```

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

## 🔎 Funcionalidades da PokéAPI
A aplicação se conecta à PokéAPI para listar e interagir com Pokémon reais.

Rotas disponíveis:

📋 Listagem de Pokémons
GET /pokemon – Lista com paginação padrão

GET /pokemon/paginated?limit=20&offset=0 – Lista com paginação customizada

GET /pokemon/:id – Busca por ID

GET /pokemon/name/:name – Busca por nome

🎯 Capturas
POST /captured – Captura um Pokémon (com nome e ID)

GET /captured – Lista todos os Pokémon capturados do usuário

👀 Avistamentos
POST /sighted – Registra um Pokémon avistado

GET /sighted – Lista todos os Pokémon avistados


## 📬 Testes via Postman
Você pode importar a collection do Postman que está incluída no projeto em `back_nest_pokemon_project.postman_collection.json`

### Como usar:
- Abra o Postman

- Clique em Import → Upload Files.

- Selecione o arquivo `back_nest_pokemon_project.postman_collection.json`

- A collection será importada com todos os endpoints já configurados para teste.

- Atualize a variável de ambiente para ajustar a URL base do seu servidor local (ex: http://localhost:3000).

Assim, você pode testar todas as rotas rapidamente com exemplos prontos.

## 🧾 Documentação Swagger
Acesse em tempo de execução:
http://localhost:3000/api

Inclui:

- Endpoints de autenticação

- Endpoints Pokémon

- Modelos, tipos, descrições e respostas esperadas

## 🛡️ Checklist de segurança
✅ JWT com expiração curta
✅ Refresh token seguro e hasheado no DB
✅ Logout revoga refresh token
✅ Middleware com guards para rotas protegidas
✅ Senhas com hash (BCrypt)
✅ Variáveis sensíveis no .env
✅ Nada sensível versionado

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

- A aplicação foi feita PostgreSQL para compatibilidade com o ambiente do Render.

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
 - Frontend completo com Next.js

- Visualização de capturas, avistamentos e login pelo frontend

- Conexão ao backend via API REST

- Integração total com a PokéAPI

