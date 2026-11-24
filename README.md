# QuadraPass — Controle da Quadra Fatec Franca

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.

## Estrutura do repositório

- Raiz: versão web (React + Express + tRPC + Drizzle/MySQL) — é o que a Vercel publica.
- `mobile/`: app React Native/Expo (veja `mobile/README.md`). Tem `package.json` e lockfile próprios e **não** entra no deploy da Vercel.

## Publicar na Vercel

O `vercel.json` já define o build (`pnpm build:vercel`). Esse script (`scripts/build-vercel.mjs`) gera o front-end estático e empacota a API Express/tRPC como uma única função serverless em `.vercel/output` (Build Output API). Em tempo de execução, `/api/*` vai para a função e o resto cai no `index.html` (SPA).

1. Crie um banco MySQL acessível pela internet (por exemplo TiDB Cloud, Aiven ou Railway).
2. Na Vercel, importe o repositório (Framework Preset: **Other**; deixe Build/Install/Output como o `vercel.json` define).
3. Em **Settings → Environment Variables**, crie `DATABASE_URL` (veja `.env.example`).
4. Aplique as migrações no banco uma vez, a partir do seu computador: `pnpm db:migrate` com `DATABASE_URL` apontando para o banco de produção.
5. Faça o deploy e teste `https://SEU-PROJETO.vercel.app/api/health`.

Se o provedor exigir SSL, use na URL algo como `?ssl={"rejectUnauthorized":true}` (URL-encoded, se necessário).

**Painel interno (admin):** o login administrativo usa o OAuth da plataforma Manus (`MANUS_*`) e o login local só funciona em `NODE_ENV=development` em `localhost`. Na Vercel, o fluxo de reservas dos alunos funciona normalmente, mas o painel interno exige configurar um método de login próprio para produção.

## Local administrator test login

The local username/password flow exists only when `NODE_ENV=development` and both `LOCAL_ADMIN_USERNAME` and `LOCAL_ADMIN_PASSWORD` are set. It is also restricted to requests over loopback (`localhost`, `127.0.0.1` or `::1`); production keeps the configured Manus OAuth flow and has no default password.

For a disposable local test in Windows CMD, set these values in the same terminal before starting `pnpm dev`:

```cmd
set LOCAL_ADMIN_USERNAME=admin
set LOCAL_ADMIN_PASSWORD=ESCOLHA_UMA_SENHA_LOCAL
```

No PowerShell, use a sintaxe de ambiente própria dele, no mesmo terminal em que iniciará `pnpm dev`:

```powershell
$env:LOCAL_ADMIN_USERNAME = "admin"
$env:LOCAL_ADMIN_PASSWORD = "SENHA_LOCAL"
```

Também é possível salvar esses nomes em `.env`, que é lido por `dotenv/config` e está excluído pelo `.gitignore` do projeto. Em qualquer caso, reinicie o servidor depois de definir as variáveis.

The local session is signed with a random per-process key and expires after two hours. Keep the password out of source control and do not publish the app with a test password. For production, configure Manus OAuth and an approved administrative account.
