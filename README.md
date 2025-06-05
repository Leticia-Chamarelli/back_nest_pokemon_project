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


4. **Configure o MySQL**

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
JWT_SECRET=suachavesecreta
JWT_REFRESH_SECRET=suarefreshsecreta
TYPEORM_CONNECTION=mysql
TYPEORM_HOST=localhost
TYPEORM_PORT=3306
TYPEORM_USERNAME=seu_usuario
TYPEORM_PASSWORD=sua_senha
TYPEORM_DATABASE=seu_banco
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
Este projeto pode ser hospedado gratuitamente no Render, uma plataforma moderna para deploy de aplicações Node.js.

Etapas de Deploy no Render:

1. Crie um repositório no GitHub com este projeto.

2. Acesse o painel da Render e clique em New Web Service.

3. Configure o serviço com as seguintes opções:

- Environment: `Node`

- Build Command: 
```bash
npm install && npm run build
```

- Start Command: 
```bash
npm run start:prod
```

- Branch: escolha a que deseja usar para o deploy automático

- Region: a mais próxima da sua base de usuários

- Environment Variables: adicione todas as variáveis do seu `.env.example`

### 🗄️ Banco de Dados

Você pode criar um banco diretamente na Render (MySQL ou PostgreSQL).

- Copie o host, usuário, senha e nome do banco e configure nas variáveis de ambiente do serviço na Render.

- Atualize seu arquivo `data-source.ts` para ler as variáveis de ambiente.

- Ajuste o `main.ts` para usar a porta do Render:

```bash
const port = process.env.PORT || 3000;
await app.listen(port);
```

Pronto! O Render cuidará do build e deploy automático sempre que houver push para a branch configurada.

### ✅ Após o Deploy
- Acesse https://nome-do-seu-app.onrender.com/api para visualizar a documentação Swagger.

- Atualize a URL base no Postman para testar os endpoints no ambiente em nuvem.

### ⚙️ Extras opcionais para produção
Gere uma versão otimizada do projeto:
```bash
npm run build
```
- HTTPS já é ativado automaticamente no Render.

- Deploy contínuo com push no GitHub.

- Execute os testes localmente antes de subir: 
```bash
npm run test 
npm run test:e2e
```

## 🧩  Integrações futuras

Este projeto foi desenvolvido como base para integração com um frontend (ex: Next.js) e consumo de APIs externas (ex: PokeAPI).

