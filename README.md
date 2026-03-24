# ❤️ Calendário do Casal

Aplicação web completa para casais registrarem, celebrarem e reviverem os momentos mais especiais do relacionamento.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router + Turbopack + PPR) |
| Linguagem | TypeScript 5+ |
| Banco de dados | PostgreSQL no NeonDB (serverless + RLS) |
| ORM | Drizzle ORM + drizzle-kit |
| Autenticação | Auth.js v5 (Credentials + Google OAuth) |
| Rate Limiting | Upstash Redis + @upstash/ratelimit |
| Fotos | Cloudinary (upload, CDN, transformação) |
| E-mails | Resend |
| Estilização | Tailwind CSS 4 + CSS Variables |
| Componentes | shadcn/ui + Radix UI |
| Animações | Framer Motion |
| i18n | next-intl (PT-BR, EN, ES) |
| Temas | next-themes (dark/light + 5 temas de cor) |
| Gráficos | Recharts |
| Deploy | Vercel + Edge CDN |
| Testes | Vitest + Playwright |

## Pré-requisitos

- Node.js 20+
- Conta no [NeonDB](https://neon.tech) (PostgreSQL serverless gratuito)
- Conta no [Upstash](https://upstash.com) (Redis serverless gratuito)
- Conta no [Cloudinary](https://cloudinary.com) (upload de fotos)
- Conta no [Resend](https://resend.com) (e-mails transacionais)
- Projeto no [Google Cloud Console](https://console.cloud.google.com) (OAuth)

## Setup

### 1. Clone e instale

```bash
git clone <repo-url>
cd calendario-do-casal
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha todas as variáveis no `.env.local`.

### 3. Configure o banco de dados

```bash
# Gere as migrations
npm run db:generate

# Aplique ao banco
npm run db:push

# (Opcional) Abra o Drizzle Studio
npm run db:studio
```

### 4. Execute em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/          # Login, registro, verificação
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-email/
│   │   └── reset-password/
│   ├── (app)/           # Área autenticada
│   │   ├── dashboard/
│   │   ├── calendar/
│   │   ├── timeline/
│   │   ├── gallery/
│   │   ├── about-us/
│   │   ├── achievements/
│   │   ├── stats/
│   │   ├── capsules/
│   │   ├── notifications/
│   │   └── settings/
│   ├── api/
│   │   ├── auth/        # Auth.js handler
│   │   ├── upload/      # Cloudinary upload
│   │   └── cron/        # Vercel Cron jobs
│   ├── actions/         # Server Actions
│   │   ├── auth.ts
│   │   └── events.ts
│   └── invite/          # Vínculo de casal
├── components/
│   ├── auth/            # LoginForm, RegisterForm, InviteFlow
│   ├── calendar/        # CalendarView, EventModal
│   ├── dashboard/
│   ├── gallery/         # GalleryGrid (com lightbox)
│   ├── timeline/
│   └── shared/          # AppSidebar, AppHeader, SettingsClient
├── lib/
│   ├── db/              # Schema Drizzle (16 tabelas) + conexão
│   ├── auth/            # Configuração Auth.js v5
│   ├── utils/           # cn, dates, email, ratelimit
│   └── validators/      # Schemas Zod
├── messages/            # i18n: pt-BR.json, en.json, es.json
├── styles/              # globals.css (design tokens + temas)
└── types/               # next-auth.d.ts
```

## Deploy na Vercel

```bash
npm install -g vercel
vercel deploy
```

Configure as variáveis de ambiente no painel da Vercel. O cron job de notificações (`/api/cron/reminders`) é agendado para rodar diariamente às 8h via `vercel.json`.

## Módulos implementados

| Módulo | Status | Descrição |
|---|---|---|
| M1 — Auth | ✅ MVP | Cadastro, login, OAuth Google, verificação e-mail, rate limiting |
| M2 — Casal | ✅ MVP | Código de convite, vínculo, desvincular |
| M3 — Calendário | ✅ MVP | CRUD eventos, visualização mensal/semanal/agenda |
| M4 — Fotos | ✅ MVP | Upload Cloudinary, galeria com lightbox, favoritos |
| M5 — Timeline | ✅ MVP | Linha do tempo, contador de dias |
| M6 — Notificações | ✅ V1 | E-mail via Resend, cron Vercel, in-app |
| M7 — Perfil | ✅ MVP | Dark/light mode, 5 temas de cor, "Sobre Nós" |
| M8 — PWA | 📋 V2 | Instalável, push notification |
| M9 — Conquistas | ✅ V1 | 12 badges, progresso |
| M10 — Estatísticas | 📋 V2 | Mapa de calor, gráficos |
| M11 — i18n | ✅ MVP | PT-BR, EN, ES desde o início |

## Segurança

- Todas as queries filtram por `couple_id` — isolamento total entre casais
- Row Level Security (RLS) habilitado no NeonDB
- Rate limiting via Upstash em rotas de auth e upload
- Verificação de MIME type real no upload de fotos
- Tokens de verificação com uso único e expiração
- Senhas com bcrypt (salt 12)
- Middleware Edge protege todas as rotas privadas

## Licença

MIT
