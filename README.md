# Lumina - Plataforma Educacional Multi-Perfil

Projeto web completo com frontend e backend para operação educacional com 4 perfis: **Coordenação**, **Professor**, **Aluno** e **Admin interno**.

## Stack

- **Frontend:** React + Vite + TypeScript + React Query + Zustand
- **Backend:** Node.js + Express + Prisma
- **Banco:** SQLite (para rodar localmente sem dependências externas)
- **Auth:** JWT (access + refresh), hash com bcryptjs
- **Validação:** Zod

## Estrutura de pastas

```txt
/home/runner/work/lumina/lumina
├── backend
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src
│   │   ├── config
│   │   ├── lib
│   │   ├── middleware
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend
│   ├── src
│   │   ├── app
│   │   │   ├── components
│   │   │   ├── hooks
│   │   │   ├── layout
│   │   │   ├── pages
│   │   │   ├── services
│   │   │   ├── store
│   │   │   ├── styles
│   │   │   └── types
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
├── package.json
└── README.md
```

## Instalação

No diretório do repositório:

```bash
npm install
```

## Configuração de ambiente

### Backend

```bash
cp /home/runner/work/lumina/lumina/backend/.env.example /home/runner/work/lumina/lumina/backend/.env
```

### Frontend

```bash
cp /home/runner/work/lumina/lumina/frontend/.env.example /home/runner/work/lumina/lumina/frontend/.env
```

## Preparar banco e seed

```bash
cd /home/runner/work/lumina/lumina/backend
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

## Rodar o projeto

### Backend

```bash
cd /home/runner/work/lumina/lumina
npm run dev:backend
```

API: `http://localhost:4000`

### Frontend

```bash
cd /home/runner/work/lumina/lumina
npm run dev:frontend
```

App: `http://localhost:5173`

## Credenciais de teste

- **Coordenação**
  - perfil: `coordenacao`
  - e-mail: `coordenacao@lumina.local`
  - senha: `Coord123!`
- **Professor**
  - perfil: `professor`
  - e-mail: `professor@lumina.local`
  - senha: `Prof123!`
- **Aluno**
  - perfil: `aluno`
  - e-mail: `aluno1@lumina.local`
  - senha: `Aluno123!`
- **Admin (técnico opcional)**
  - e-mail: `admin@lumina.local`
  - senha: `Admin123!`

## Decisões de arquitetura

1. **Monorepo npm workspaces** para isolar frontend e backend com scripts simples.
2. **Prisma + SQLite** para experiência local imediata e seed reproduzível.
3. **RBAC no backend** por rota e ação (middlewares + checks de posse de turma).
4. **Tracking separado** em `VideoView` e `QuizAttempt`, com listas de engajamento por vídeo/quiz.
5. **Sessão persistida no frontend** com refresh token e renovação automática do access token.

## Segurança e boas práticas implementadas

- Hash de senha com bcryptjs
- JWT access/refresh com revogação de refresh token
- Controle de acesso por rota e por ação no backend
- Validação de payload com Zod
- Helmet + CORS configurado
- Log de ações sensíveis (auditoria)
- Seed com usuários de todos os perfis

## Scripts principais

### Raiz

- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run lint`
- `npm run build`
- `npm run test`

### Backend

- `npm run prisma:generate`
- `npm run prisma:push`
- `npm run prisma:seed`

## Checklist final dos requisitos

- [x] Login com seletor de perfil (Professor / Aluno / Coordenação)
- [x] Redirecionamento para dashboards corretos por perfil
- [x] Persistência de sessão, logout e proteção de rotas
- [x] RBAC real no backend para Coordenação, Professor e Aluno
- [x] Coordenação com gestão de usuários, turmas, conteúdos, relatórios e auditoria
- [x] Professor com gestão das próprias turmas/conteúdos e visão de engajamento
- [x] Aluno limitado às próprias turmas, vídeos, quizzes e histórico
- [x] Tracking com `VideoView` (watched, watchedAt, progressPercent, lastPositionSeconds)
- [x] Tracking com `QuizAttempt` (status, score, answers, timestamps)
- [x] Listas de “viram/não viram” e “fizeram/não fizeram” para vídeo/quiz
- [x] Filtros de relatório por turma, matéria e período no endpoint completo
- [x] Estrutura completa frontend/backend
- [x] `.env.example` incluído
- [x] Seed inicial incluído
- [x] Projeto roda local após seguir este README
