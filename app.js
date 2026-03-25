const STORAGE_KEY = 'lumina-db-v1';
const SESSION_KEY = 'lumina-session-v1';

const state = {
  db: null,
  user: null,
  view: null
};

const refs = {
  authCard: document.getElementById('auth-card'),
  dashboard: document.getElementById('dashboard'),
  authMessage: document.getElementById('auth-message'),
  welcomeTitle: document.getElementById('welcome-title'),
  welcomeSubtitle: document.getElementById('welcome-subtitle'),
  nav: document.getElementById('dashboard-nav'),
  content: document.getElementById('dashboard-content')
};

function nowIso() {
  return new Date().toISOString();
}

function uuid() {
  return crypto.randomUUID();
}

function toB64(arrBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(arrBuffer)));
}

async function hashPassword(password, saltB64) {
  const encoder = new TextEncoder();
  const salt = saltB64 ? Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0)) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 120000 },
    keyMaterial,
    256
  );
  return { hash: toB64(bits), salt: toB64(salt) };
}

function validateStrongPassword(password) {
  return (
    password.length >= 8
    && /[A-Z]/.test(password)
    && /[a-z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password)
  );
}

function seedDb() {
  return {
    users: [],
    invites: [
      {
        id: uuid(),
        code: 'LUMINA-ALUNO-001',
        role: 'aluno',
        status: 'aberto',
        createdAt: nowIso(),
        usedBy: null
      }
    ],
    videos: [],
    watchEvents: [],
    quizzes: [],
    submissions: [],
    grades: [],
    audit: []
  };
}

function audit(action, byUserId, details) {
  state.db.audit.unshift({ id: uuid(), action, byUserId, details, at: nowIso() });
}

function saveDb() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.db));
}

function getUserById(id) {
  return state.db.users.find((u) => u.id === id) || null;
}

function getUserSafe(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, active: u.active };
}

async function ensureBootUsers() {
  if (state.db.users.length > 0) return;
  const coord = await createUser({
    name: 'Coordenação Lumina',
    email: 'coord@lumina.local',
    password: 'Coord#1234',
    role: 'coordenacao',
    active: true,
    byUserId: null
  });

  await createUser({
    name: 'Professor Demo',
    email: 'prof@lumina.local',
    password: 'Prof#1234',
    role: 'professor',
    active: true,
    byUserId: coord.id
  });
}

async function createUser({ name, email, password, role, active = true, byUserId = null }) {
  const lower = email.trim().toLowerCase();
  if (state.db.users.some((u) => u.email === lower)) throw new Error('E-mail já cadastrado.');
  if (!validateStrongPassword(password)) throw new Error('Senha fraca. Use 8+ caracteres com maiúscula, minúscula, número e símbolo.');

  const { hash, salt } = await hashPassword(password);
  const user = {
    id: uuid(),
    name: name.trim(),
    email: lower,
    role,
    active,
    createdAt: nowIso(),
    passwordHash: hash,
    passwordSalt: salt,
    failedAttempts: 0,
    lockUntil: null
  };

  state.db.users.push(user);
  audit('user.create', byUserId, { userId: user.id, role: user.role, email: user.email });
  saveDb();
  return user;
}

function loadDb() {
  const raw = localStorage.getItem(STORAGE_KEY);
  state.db = raw ? JSON.parse(raw) : seedDb();
}

function openTab(tab) {
  const loginTab = document.getElementById('tab-login');
  const inviteTab = document.getElementById('tab-invite');
  const loginPanel = document.getElementById('login-form');
  const invitePanel = document.getElementById('invite-form');

  if (tab === 'login') {
    loginTab.classList.add('active');
    inviteTab.classList.remove('active');
    loginPanel.classList.add('active');
    invitePanel.classList.remove('active');
  } else {
    inviteTab.classList.add('active');
    loginTab.classList.remove('active');
    invitePanel.classList.add('active');
    loginPanel.classList.remove('active');
  }
}

function setAuthMessage(msg, type = '') {
  refs.authMessage.textContent = msg;
  refs.authMessage.className = `message ${type}`.trim();
}

function setSession(userId) {
  const session = {
    token: uuid(),
    userId,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 8 * 60 * 60 * 1000
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function getCurrentSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (!session.token || !session.userId || Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

function requireRole(roles) {
  if (!state.user || !roles.includes(state.user.role)) throw new Error('Acesso negado para este recurso.');
}

async function login(email, password) {
  const lower = email.trim().toLowerCase();
  const user = state.db.users.find((u) => u.email === lower);
  if (!user) throw new Error('Credenciais inválidas.');
  if (!user.active) throw new Error('Usuário inativo. Contate a coordenação.');

  if (user.lockUntil && Date.now() < user.lockUntil) {
    throw new Error('Conta temporariamente bloqueada por tentativas inválidas.');
  }

  const { hash } = await hashPassword(password, user.passwordSalt);
  if (hash !== user.passwordHash) {
    user.failedAttempts += 1;
    if (user.failedAttempts >= 5) {
      user.lockUntil = Date.now() + 5 * 60 * 1000;
      user.failedAttempts = 0;
    }
    saveDb();
    throw new Error('Credenciais inválidas.');
  }

  user.failedAttempts = 0;
  user.lockUntil = null;
  saveDb();

  setSession(user.id);
  state.user = getUserSafe(user);
  audit('auth.login', user.id, { role: user.role });
  saveDb();
}

function logout() {
  if (state.user) {
    audit('auth.logout', state.user.id, { role: state.user.role });
    saveDb();
  }
  state.user = null;
  clearSession();
  refs.dashboard.classList.add('hidden');
  refs.authCard.classList.remove('hidden');
}

function asDate(iso) {
  return new Date(iso).toLocaleString('pt-BR');
}

function viewHome() {
  const roleText = {
    coordenacao: 'Coordenação',
    professor: 'Professor(a)',
    aluno: 'Aluno(a)'
  }[state.user.role];

  refs.content.innerHTML = `
    <h3>Resumo</h3>
    <div class="grid-2">
      <article class="item">
        <strong>Perfil</strong>
        <p>${roleText}</p>
      </article>
      <article class="item">
        <strong>Usuários</strong>
        <p>${state.db.users.length}</p>
      </article>
      <article class="item">
        <strong>Vídeos publicados</strong>
        <p>${state.db.videos.length}</p>
      </article>
      <article class="item">
        <strong>Provas criadas</strong>
        <p>${state.db.quizzes.length}</p>
      </article>
    </div>
  `;
}

function viewCoordUsers() {
  requireRole(['coordenacao']);
  refs.content.innerHTML = `
    <h3>Gestão de usuários</h3>
    <form id="coord-user-form" class="grid-2">
      <label>Nome<input name="name" required /></label>
      <label>Email<input name="email" type="email" required /></label>
      <label>Senha provisória<input name="password" type="password" required minlength="8" /></label>
      <label>Perfil
        <select name="role" required>
          <option value="professor">Professor</option>
          <option value="aluno">Aluno</option>
          <option value="coordenacao">Coordenação</option>
        </select>
      </label>
      <button class="btn primary" type="submit">Criar login</button>
    </form>
    <div class="list" id="coord-user-list"></div>
  `;

  const list = refs.content.querySelector('#coord-user-list');
  list.innerHTML = state.db.users.map((u) => `
    <article class="item" data-user-id="${u.id}">
      <strong>${u.name}</strong> <span class="small">${u.email}</span>
      <div class="small">Perfil: ${u.role} • Ativo: ${u.active ? 'sim' : 'não'}</div>
      <div style="display:flex;gap:.5rem; margin-top:.5rem;">
        <button class="btn" data-action="toggle">${u.active ? 'Desativar' : 'Ativar'}</button>
        <button class="btn" data-action="promote">Alternar professor/aluno</button>
      </div>
    </article>
  `).join('');

  refs.content.querySelector('#coord-user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await createUser({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
        role: form.get('role'),
        byUserId: state.user.id
      });
      renderView('users');
    } catch (err) {
      alert(err.message);
    }
  });

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const card = e.target.closest('[data-user-id]');
    const user = state.db.users.find((u) => u.id === card.dataset.userId);
    if (!user) return;

    if (btn.dataset.action === 'toggle') {
      user.active = !user.active;
      audit('user.update.active', state.user.id, { userId: user.id, active: user.active });
    }

    if (btn.dataset.action === 'promote' && user.role !== 'coordenacao') {
      user.role = user.role === 'professor' ? 'aluno' : 'professor';
      audit('user.update.role', state.user.id, { userId: user.id, role: user.role });
    }

    saveDb();
    renderView('users');
  });
}

function viewCoordInvites() {
  requireRole(['coordenacao']);
  refs.content.innerHTML = `
    <h3>Convites de aluno</h3>
    <form id="invite-create-form" class="grid-2">
      <label>Código do convite<input name="code" required pattern="[A-Za-z0-9-]{6,}" /></label>
      <button class="btn primary" type="submit">Criar convite</button>
    </form>
    <div class="list">
      ${state.db.invites.map((inv) => `
        <article class="item">
          <strong>${inv.code}</strong>
          <div class="small">Status: ${inv.status} • Criado em ${asDate(inv.createdAt)}</div>
          <div class="small">Usado por: ${inv.usedBy || '-'}</div>
        </article>
      `).join('')}
    </div>
  `;

  refs.content.querySelector('#invite-create-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = new FormData(e.currentTarget).get('code').toString().trim();
    if (state.db.invites.some((i) => i.code === code)) {
      alert('Código já existe.');
      return;
    }
    state.db.invites.unshift({ id: uuid(), code, role: 'aluno', status: 'aberto', createdAt: nowIso(), usedBy: null });
    audit('invite.create', state.user.id, { code });
    saveDb();
    renderView('invites');
  });
}

function viewAudit() {
  requireRole(['coordenacao']);
  const users = Object.fromEntries(state.db.users.map((u) => [u.id, u]));
  refs.content.innerHTML = `
    <h3>Auditoria</h3>
    <div class="list">
      ${state.db.audit.slice(0, 120).map((a) => `
        <article class="item">
          <strong>${a.action}</strong>
          <div class="small">Por: ${users[a.byUserId]?.name || 'sistema'} • ${asDate(a.at)}</div>
          <pre class="small">${JSON.stringify(a.details, null, 2)}</pre>
        </article>
      `).join('')}
    </div>
  `;
}

function viewProfessorVideos() {
  requireRole(['professor']);
  refs.content.innerHTML = `
    <h3>Vídeos didáticos</h3>
    <form id="video-form" class="grid-2">
      <label>Título<input name="title" required /></label>
      <label>URL do vídeo<input name="url" type="url" required /></label>
      <label style="grid-column:1/-1;">Descrição<textarea name="description" rows="3"></textarea></label>
      <button class="btn primary" type="submit">Publicar vídeo</button>
    </form>
    <div class="list">
      ${state.db.videos.filter((v) => v.professorId === state.user.id).map((v) => {
        const watched = state.db.watchEvents.filter((w) => w.videoId === v.id).length;
        return `
          <article class="item">
            <strong>${v.title}</strong> <span class="pill">${v.published ? 'Publicado' : 'Rascunho'}</span>
            <div class="small">${v.description || 'Sem descrição'}</div>
            <a href="${v.url}" target="_blank" rel="noopener noreferrer">Abrir vídeo</a>
            <div class="small">Assistido por ${watched} aluno(s).</div>
          </article>
        `;
      }).join('')}
    </div>
  `;

  refs.content.querySelector('#video-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    state.db.videos.unshift({
      id: uuid(),
      title: form.get('title').toString().trim(),
      url: form.get('url').toString().trim(),
      description: form.get('description').toString().trim(),
      professorId: state.user.id,
      published: true,
      createdAt: nowIso()
    });
    audit('video.create', state.user.id, { title: form.get('title') });
    saveDb();
    renderView('videos');
  });
}

function viewProfessorQuizzes() {
  requireRole(['professor']);
  refs.content.innerHTML = `
    <h3>Provas e atividades</h3>
    <form id="quiz-form" class="grid-2">
      <label>Título<input name="title" required /></label>
      <label>Pergunta<input name="question" required /></label>
      <label>Resposta correta<input name="answer" required /></label>
      <button class="btn primary" type="submit">Criar prova</button>
    </form>
    <div class="list">
      ${state.db.quizzes.filter((q) => q.professorId === state.user.id).map((q) => {
        const subs = state.db.submissions.filter((s) => s.quizId === q.id);
        const avg = subs.length ? (subs.reduce((acc, s) => acc + s.score, 0) / subs.length).toFixed(1) : '0.0';
        return `
          <article class="item">
            <strong>${q.title}</strong>
            <div class="small">Respostas: ${subs.length} • Média: ${avg}</div>
          </article>
        `;
      }).join('')}
    </div>
  `;

  refs.content.querySelector('#quiz-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    state.db.quizzes.unshift({
      id: uuid(),
      professorId: state.user.id,
      title: form.get('title').toString().trim(),
      question: form.get('question').toString().trim(),
      answer: form.get('answer').toString().trim().toLowerCase(),
      createdAt: nowIso()
    });
    audit('quiz.create', state.user.id, { title: form.get('title') });
    saveDb();
    renderView('quizzes');
  });
}

function viewProfessorGrades() {
  requireRole(['professor']);
  const mine = state.db.submissions.filter((s) => {
    const quiz = state.db.quizzes.find((q) => q.id === s.quizId);
    return quiz?.professorId === state.user.id;
  });

  refs.content.innerHTML = `
    <h3>Correções e notas</h3>
    <div class="list">
      ${mine.map((s) => {
        const quiz = state.db.quizzes.find((q) => q.id === s.quizId);
        const aluno = getUserById(s.studentId);
        return `
          <article class="item">
            <strong>${quiz?.title || 'Prova removida'}</strong>
            <div class="small">Aluno: ${aluno?.name || 'desconhecido'} • Nota: ${s.score}</div>
            <div class="small">Resposta: ${s.answer}</div>
          </article>
        `;
      }).join('') || '<p class="small">Ainda não há envios.</p>'}
    </div>
  `;
}

function viewStudentVideos() {
  requireRole(['aluno']);
  refs.content.innerHTML = `
    <h3>Aulas em vídeo</h3>
    <div class="list">
      ${state.db.videos.map((v) => {
        const watched = state.db.watchEvents.some((w) => w.videoId === v.id && w.studentId === state.user.id);
        return `
          <article class="item" data-video-id="${v.id}">
            <strong>${v.title}</strong>
            <div class="small">${v.description || 'Sem descrição'}</div>
            <a href="${v.url}" target="_blank" rel="noopener noreferrer">Assistir</a>
            <div style="margin-top:.5rem;">
              <button class="btn" data-action="watch">${watched ? 'Assistido' : 'Marcar como assistido'}</button>
            </div>
          </article>
        `;
      }).join('') || '<p class="small">Sem vídeos publicados.</p>'}
    </div>
  `;

  refs.content.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action="watch"]');
    if (!btn) return;
    const article = e.target.closest('[data-video-id]');
    const videoId = article.dataset.videoId;
    if (state.db.watchEvents.some((w) => w.videoId === videoId && w.studentId === state.user.id)) return;

    state.db.watchEvents.push({ id: uuid(), videoId, studentId: state.user.id, watchedAt: nowIso() });
    audit('video.watch', state.user.id, { videoId });
    saveDb();
    renderView('student-videos');
  });
}

function viewStudentQuizzes() {
  requireRole(['aluno']);
  refs.content.innerHTML = `
    <h3>Provas e atividades</h3>
    <div class="list">
      ${state.db.quizzes.map((q) => {
        const submission = state.db.submissions.find((s) => s.quizId === q.id && s.studentId === state.user.id);
        return `
          <article class="item" data-quiz-id="${q.id}">
            <strong>${q.title}</strong>
            <div class="small">Pergunta: ${q.question}</div>
            ${submission ? `
              <div class="small">Resposta enviada: ${submission.answer}</div>
              <div class="small">Nota: ${submission.score}</div>
            ` : `
              <form class="quiz-submit-form">
                <label>Sua resposta<input name="answer" required /></label>
                <button type="submit" class="btn primary">Enviar resposta</button>
              </form>
            `}
          </article>
        `;
      }).join('') || '<p class="small">Sem provas publicadas.</p>'}
    </div>
  `;

  refs.content.querySelectorAll('.quiz-submit-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const article = e.currentTarget.closest('[data-quiz-id]');
      const quizId = article.dataset.quizId;
      const quiz = state.db.quizzes.find((q) => q.id === quizId);
      const answer = new FormData(e.currentTarget).get('answer').toString().trim();
      const score = answer.toLowerCase() === quiz.answer ? 10 : 0;

      state.db.submissions.push({
        id: uuid(),
        quizId,
        studentId: state.user.id,
        answer,
        score,
        submittedAt: nowIso()
      });

      state.db.grades.push({
        id: uuid(),
        studentId: state.user.id,
        professorId: quiz.professorId,
        quizId,
        value: score,
        createdAt: nowIso()
      });

      audit('quiz.submit', state.user.id, { quizId, score });
      saveDb();
      renderView('student-quizzes');
    });
  });
}

function viewStudentGrades() {
  requireRole(['aluno']);
  const grades = state.db.grades.filter((g) => g.studentId === state.user.id);
  refs.content.innerHTML = `
    <h3>Minhas notas</h3>
    <div class="list">
      ${grades.map((g) => {
        const quiz = state.db.quizzes.find((q) => q.id === g.quizId);
        const prof = getUserById(g.professorId);
        return `
          <article class="item">
            <strong>${quiz?.title || 'Atividade'}</strong>
            <div class="small">Professor: ${prof?.name || '-'}</div>
            <div class="small">Nota: ${g.value}</div>
          </article>
        `;
      }).join('') || '<p class="small">Sem notas ainda.</p>'}
    </div>
  `;
}

const roleViews = {
  coordenacao: [
    { key: 'home', label: 'Início', render: viewHome },
    { key: 'users', label: 'Usuários', render: viewCoordUsers },
    { key: 'invites', label: 'Convites', render: viewCoordInvites },
    { key: 'audit', label: 'Auditoria', render: viewAudit }
  ],
  professor: [
    { key: 'home', label: 'Início', render: viewHome },
    { key: 'videos', label: 'Vídeos', render: viewProfessorVideos },
    { key: 'quizzes', label: 'Provas', render: viewProfessorQuizzes },
    { key: 'grades', label: 'Notas', render: viewProfessorGrades }
  ],
  aluno: [
    { key: 'home', label: 'Início', render: viewHome },
    { key: 'student-videos', label: 'Vídeos', render: viewStudentVideos },
    { key: 'student-quizzes', label: 'Provas', render: viewStudentQuizzes },
    { key: 'student-grades', label: 'Notas', render: viewStudentGrades }
  ]
};

function renderNav() {
  const views = roleViews[state.user.role] || [];
  refs.nav.innerHTML = views.map((v) => `<button class="btn ${state.view === v.key ? 'active' : ''}" data-view="${v.key}">${v.label}</button>`).join('');

  refs.nav.querySelectorAll('button[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => renderView(btn.dataset.view));
  });
}

function renderView(viewKey) {
  state.view = viewKey;
  renderNav();
  const view = (roleViews[state.user.role] || []).find((v) => v.key === viewKey) || roleViews[state.user.role][0];
  view.render();
}

function renderDashboard() {
  refs.authCard.classList.add('hidden');
  refs.dashboard.classList.remove('hidden');

  refs.welcomeTitle.textContent = `Olá, ${state.user.name}`;
  refs.welcomeSubtitle.textContent = `Perfil: ${state.user.role} • Sessão expira em até 8 horas`;
  renderView('home');
}

async function handleInviteSignup(formData) {
  const code = formData.get('code').toString().trim();
  const invite = state.db.invites.find((i) => i.code === code && i.status === 'aberto');
  if (!invite) throw new Error('Convite inválido ou já utilizado.');

  const user = await createUser({
    name: formData.get('name').toString(),
    email: formData.get('email').toString(),
    password: formData.get('password').toString(),
    role: invite.role,
    active: true,
    byUserId: null
  });

  invite.status = 'usado';
  invite.usedBy = user.email;
  audit('invite.use', user.id, { code });
  saveDb();
  setAuthMessage('Conta criada com sucesso. Faça login.', 'success');
  openTab('login');
}

function wireAuthUi() {
  document.getElementById('tab-login').addEventListener('click', () => openTab('login'));
  document.getElementById('tab-invite').addEventListener('click', () => openTab('invite'));

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
      await login(email, password);
      setAuthMessage('');
      renderDashboard();
    } catch (err) {
      setAuthMessage(err.message, 'error');
    }
  });

  document.getElementById('invite-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await handleInviteSignup(new FormData(e.currentTarget));
      e.currentTarget.reset();
    } catch (err) {
      setAuthMessage(err.message, 'error');
    }
  });

  document.getElementById('logout-btn').addEventListener('click', logout);
}

async function bootstrap() {
  loadDb();
  await ensureBootUsers();
  wireAuthUi();

  const session = getCurrentSession();
  if (!session) return;

  const user = getUserById(session.userId);
  if (!user || !user.active) {
    clearSession();
    return;
  }

  state.user = getUserSafe(user);
  renderDashboard();
}

bootstrap().catch((err) => {
  console.error(err);
  setAuthMessage('Erro ao iniciar a aplicação.', 'error');
});
