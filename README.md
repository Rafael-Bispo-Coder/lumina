# Lumina – Plataforma Educacional

A fullstack educational platform with Node.js/Express backend and Vanilla JS frontend.

## Tech Stack
- **Backend**: Node.js + Express, JSON file persistence, JWT auth, bcryptjs
- **Frontend**: HTML + CSS + Vanilla JavaScript (no framework)
- **Auth**: JWT (24h expiry), bcrypt password hashing
- **RBAC**: 3 roles – `coordenacao`, `professor`, `aluno`

## Quick Start

```bash
# 1. Copy env file
cp .env.example server/.env

# 2. Install server dependencies
cd server && npm install

# 3. Start the API server (port 3001)
npm start
# or for development with auto-reload:
npm run server:dev

# 4. Open client/index.html in a browser (or serve with Live Server)
```

## Demo Credentials

| Role         | Email               | Password  |
|--------------|---------------------|-----------|
| Coordenação  | coord@lumina.com    | coord123  |
| Professor    | prof@lumina.com     | prof123   |
| Aluno        | aluno@lumina.com    | aluno123  |

## API Endpoints

| Method | Endpoint                        | Roles                          |
|--------|---------------------------------|--------------------------------|
| POST   | /api/auth/login                 | Public                         |
| POST   | /api/auth/logout                | All                            |
| GET    | /api/auth/me                    | All                            |
| GET    | /api/users                      | coordenacao                    |
| POST   | /api/users                      | coordenacao                    |
| PUT    | /api/users/:id                  | coordenacao                    |
| DELETE | /api/users/:id                  | coordenacao                    |
| GET    | /api/classes                    | All (filtered by role)         |
| POST   | /api/classes                    | coordenacao                    |
| PUT    | /api/classes/:id                | coordenacao                    |
| DELETE | /api/classes/:id                | coordenacao                    |
| GET    | /api/classes/:id/students       | coordenacao, professor         |
| GET    | /api/videos                     | All (filtered by role)         |
| POST   | /api/videos                     | professor, coordenacao         |
| PUT    | /api/videos/:id                 | professor (own), coordenacao   |
| DELETE | /api/videos/:id                 | professor (own), coordenacao   |
| GET    | /api/videos/:id/views           | professor, coordenacao         |
| POST   | /api/videos/:id/views           | aluno                          |
| GET    | /api/quizzes                    | All (filtered by role)         |
| POST   | /api/quizzes                    | professor, coordenacao         |
| PUT    | /api/quizzes/:id                | professor (own), coordenacao   |
| DELETE | /api/quizzes/:id                | professor (own), coordenacao   |
| GET    | /api/quizzes/:id/attempts       | professor, coordenacao         |
| POST   | /api/quizzes/:id/attempts       | aluno                          |
| GET    | /api/grades                     | All (filtered by role)         |
| GET    | /api/grades/summary             | aluno                          |
| GET    | /api/history                    | aluno                          |

## Directory Structure

```
lumina/
├── server/               # Express API
│   ├── data/             # JSON seed files (persistence)
│   ├── middlewares/      # auth, rbac, errorHandler
│   ├── repositories/     # JSON file I/O layer
│   ├── services/         # Business logic
│   ├── controllers/      # Route handlers
│   └── routes/           # Express routers
└── client/               # Frontend SPA
    ├── index.html        # Login page
    ├── dashboard.html    # Main SPA
    ├── css/styles.css
    └── js/
        ├── api.js        # Fetch wrapper
        ├── auth.js       # Auth helpers
        └── app.js        # SPA router + all views
```