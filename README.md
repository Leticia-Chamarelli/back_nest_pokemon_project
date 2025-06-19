# 🧩 NestJS Pokémon API com JWT Auth e integração com PokéAPI

API RESTful completa desenvolvida com [NestJS](https://nestjs.com/), JWT (access e refresh tokens), PostgreSQL e integração com a PokéAPI para capturas, avistamentos e listagens de Pokémon. Inclui testes automatizados, documentação Swagger e arquitetura escalável.

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

1. **Clone o repositório**

```bash
git clone https://github.com/Leticia-Chamarelli/back_nest_pokemon_project

cd back_nest_pokemon_project
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure seu arquivo `.env`**

   Crie um arquivo `.env` com base no arquivo `.env.example`.


4. **Configure o PostgreSQL**

   Use o DBeaver ou outro cliente para:
   - Criar o banco de dados; e

   - Rodar as migrations para criar as tabelas necessárias (recomendado sempre que houver mudanças no esquema). Para isso, execute:

   ```bash
   npm run migration:run
    ```

5. **Inicie o projeto**
```bash
npm run start:dev
```

## ⚙️ Variáveis de ambiente

Consulte o `.env.example` para as chaves necessárias e crie seu `.env`:

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
| `npm run test`        | Executa os testes unitários           |
| `npm run test:e2e`    | Executa os testes de integração e2e   |
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
- GET /pokemon – Lista com paginação padrão

- GET /pokemon/paginated?limit=20&offset=0 – Lista com paginação personalizada

- GET /pokemon/:id – Busca por ID

- GET /pokemon/name/:name – Busca por nome

🎯 Capturas
- POST /captured – Captura um Pokémon (com nome e ID)

- GET /captured – Lista todos os Pokémon capturados do usuário

👀 Avistamentos
- POST /sighted – Registra um Pokémon avistado

- GET /sighted – Lista todos os Pokémon avistados


## 📬 Testes via Postman
Você pode importar a collection do Postman que está fornecida no arquivo `back_nest_pokemon_project.postman_collection.json`

### Como usar:
- Abra o Postman

- Clique em Import → Upload Files.

- Selecione o arquivo `back_nest_pokemon_project.postman_collection.json`

- A collection contém todos os endpoints prontos para uso com exemplos de requisição.

- Atualize a variável de ambiente para ajustar a URL base do seu servidor local (ex: http://localhost:3000).

Assim, você pode testar todas as rotas rapidamente com exemplos prontos.

## 🧾 Documentação Swagger
Ao rodar localmente, acesse [http://localhost:3000/api](http://localhost:3000/api) para visualizar a documentação interativa da API.

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
📁 .vscode
│   └── settings.json
│
📁 src
│
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
│   └── auth.service.ts
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
│   └── [timestamp]-YourMigrationName.ts
│
├── 📁 pokeapi
│   ├── 📁 dto
│   │   └── pokemon-query.dto
│   ├── pokeapi.controller.ts
│   ├── pokeapi.module.ts
│   └── pokeapi.service.ts
│
├── 📁 pokemons
│   ├── 📁 dto
│   │   ├── create-captured.dto.ts
│   │   ├── create-sighted.dto.ts
│   │   └── list-pokemon.dto.ts
│   ├── captured-pokemon.entity.ts
│   ├── captured.controller.ts
│   ├── captured.service.ts
│   ├── pokemons.module.ts
│   ├── sighted-pokemon.entity.ts
│   ├── sighted.controller.ts
│   └── sighted.service.ts
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
📄 back_nest_pokemon_project.postman_collection.json
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
Este projeto está configurado para deploy na plataforma **Render**, que oferece hospedagem gratuita e simples para aplicações Node.js.

### ✅ Passos para deploy no Render:

1. **Configure o repositório Git**  
   Certifique-se de que o código está versionado e hospedado no GitHub (ou outro serviço suportado).

2. **Crie um novo Web Service no Render**  
   - Escolha o repositório da API NestJS.  
   - Configure o ambiente como **Node.js**.  
   - O Render define automaticamente a variável de ambiente `PORT`.  
   - A aplicação já está pronta para usá-la (ver passo 5).

3. **Adicione variáveis de ambiente no painel da Render**  
   Inclua todas as variáveis do seu `.env`, como:

   - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`  
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`

4. **Configure o banco de dados**  
   - Use o PostgreSQL do próprio Render ou outro serviço externo.  
   - Certifique-se de que as credenciais estejam corretas no painel de variáveis.  

5. **Ajuste da porta para produção**  
   O arquivo `main.ts` já está configurado corretamente:

   ```ts
   await app.listen(process.env.PORT || 3000);
    ```

6. **Deploy automático ou manual**

- O Render pode fazer deploy automático a cada push na branch principal.

- Ou você pode fazer deploy manual clicando em “Manual Deploy” no painel.

### 🔍 Testes pós-deploy

- Todas as rotas da API podem ser testadas via **Postman** usando a URL pública do Render:  
  👉 [https://back-nest-pokemon-project.onrender.com](https://back-nest-pokemon-project.onrender.com)

- Exemplo de rota de autenticação (POST login):  
  [https://back-nest-pokemon-project.onrender.com/auth/login](https://back-nest-pokemon-project.onrender.com/auth/login)

- O endpoint raiz `/` retorna uma mensagem simples para verificar que a API está no ar:  
  [https://back-nest-pokemon-project.onrender.com](https://back-nest-pokemon-project.onrender.com)

- ⚠️ Se você receber erro `404`, verifique:
  - Se está utilizando o **método HTTP correto** (ex: POST para `/auth/login`);
  - Se a URL corresponde exatamente à rota da documentação;
  - Se o deploy terminou com sucesso no painel do Render.


## 🔗  Integrações futuras
 - Frontend completo com Next.js

- Visualização de capturas, avistamentos e login pelo frontend

- Conexão ao backend via API REST

- Integração total com a PokéAPI

