/* =====================================================================
   Lumina SPA – app.js
   ===================================================================== */

auth.requireAuth();

const user = auth.getUser();
const content = document.getElementById('content');

// ── Header ──────────────────────────────────────────────────────────
document.getElementById('headerName').textContent = user.name;
const roleBadge = document.getElementById('headerRole');
roleBadge.textContent = { coordenacao: 'Coordenação', professor: 'Professor', aluno: 'Aluno' }[user.role] || user.role;
roleBadge.className = `role-badge badge-${user.role}`;
document.getElementById('logoutBtn').addEventListener('click', () => auth.logout());
document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ── Sidebar nav ──────────────────────────────────────────────────────
const NAV = {
  coordenacao: [
    { id: 'dashboard',  label: 'Dashboard',    icon: '📊' },
    { id: 'users',      label: 'Usuários',      icon: '👥' },
    { id: 'classes',    label: 'Turmas',        icon: '🏫' },
    { id: 'videos',     label: 'Vídeos',        icon: '🎬' },
    { id: 'quizzes',    label: 'Quizzes',       icon: '📝' },
    { id: 'reports',    label: 'Relatórios',    icon: '📈' },
  ],
  professor: [
    { id: 'teacher-dashboard', label: 'Dashboard',   icon: '📊' },
    { id: 'my-classes',        label: 'Minhas Turmas', icon: '🏫' },
    { id: 'my-videos',         label: 'Meus Vídeos',  icon: '🎬' },
    { id: 'my-quizzes',        label: 'Meus Quizzes', icon: '📝' },
  ],
  aluno: [
    { id: 'student-dashboard', label: 'Dashboard',  icon: '📊' },
    { id: 'my-content',        label: 'Conteúdo',   icon: '📚' },
    { id: 'grades',            label: 'Notas',      icon: '🎓' },
    { id: 'history',           label: 'Histórico',  icon: '📅' },
  ],
};

function renderNav(activeId) {
  const nav = document.getElementById('sidebarNav');
  const items = NAV[user.role] || [];
  nav.innerHTML = items.map(item =>
    `<a href="#" data-view="${item.id}" class="${item.id === activeId ? 'active' : ''}">
      <span class="nav-icon">${item.icon}</span>${item.label}
    </a>`
  ).join('');
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      navigate(a.dataset.view);
    });
  });
}

let currentView = null;
function navigate(viewId) {
  currentView = viewId;
  renderNav(viewId);
  document.getElementById('sidebar').classList.remove('open');
  VIEWS[viewId] ? VIEWS[viewId]() : (content.innerHTML = '<div class="empty-state"><span class="empty-icon">🚧</span><p>Vista não encontrada</p></div>');
}

// ── Utilities ────────────────────────────────────────────────────────
function loading() { content.innerHTML = '<div class="loading-spinner">Carregando...</div>'; }

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function badge(status) {
  return `<span class="badge badge-${status}">${status}</span>`;
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showModal(html) {
  const bd = document.createElement('div');
  bd.className = 'modal-backdrop';
  bd.innerHTML = `<div class="modal">${html}</div>`;
  bd.addEventListener('click', e => { if (e.target === bd) bd.remove(); });
  document.body.appendChild(bd);
  return bd;
}

function closeModal() { document.querySelector('.modal-backdrop')?.remove(); }

// ── VIEWS object ─────────────────────────────────────────────────────
const VIEWS = {};

/* ===================================================================
   COORDENAÇÃO VIEWS
   =================================================================== */

VIEWS['dashboard'] = async function() {
  loading();
  try {
    const [users, classes, videos, quizzes] = await Promise.all([
      api.get('/users'), api.get('/classes'), api.get('/videos'), api.get('/quizzes'),
    ]);
    content.innerHTML = `
      <div class="page-header"><div><h2>Dashboard</h2><p>Visão geral da plataforma</p></div></div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${users.length}</div><div class="stat-label">Usuários</div></div>
        <div class="stat-card"><div class="stat-value">${classes.length}</div><div class="stat-label">Turmas</div></div>
        <div class="stat-card"><div class="stat-value">${videos.length}</div><div class="stat-label">Vídeos</div></div>
        <div class="stat-card"><div class="stat-value">${quizzes.length}</div><div class="stat-label">Quizzes</div></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Usuários Recentes</span></div>
        <div class="table-wrapper">
          <table><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Criado em</th></tr></thead>
          <tbody>${users.slice(0,5).map(u => `<tr>
            <td>${escHtml(u.name)}</td><td>${escHtml(u.email)}</td>
            <td>${badge(u.role)}</td><td>${fmtDate(u.createdAt)}</td>
          </tr>`).join('')}</tbody></table>
        </div>
      </div>`;
  } catch(e) { content.innerHTML = `<div class="error-message">${e.message}</div>`; }
};

VIEWS['users'] = async function() {
  loading();
  try {
    let users = await api.get('/users');
    function render(list) {
      content.innerHTML = `
        <div class="page-header">
          <div><h2>Usuários</h2><p>Gerencie todos os usuários da plataforma</p></div>
          <button class="btn btn-primary" id="newUserBtn">+ Novo Usuário</button>
        </div>
        <div class="card">
          <div class="table-wrapper">
            <table><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Criado em</th><th>Ações</th></tr></thead>
            <tbody>${list.map(u => `<tr>
              <td>${escHtml(u.name)}</td><td>${escHtml(u.email)}</td>
              <td>${badge(u.role)}</td><td>${fmtDate(u.createdAt)}</td>
              <td><div class="actions">
                <button class="btn btn-outline btn-sm" data-edit="${escHtml(u.id)}">Editar</button>
                <button class="btn btn-danger btn-sm" data-del="${escHtml(u.id)}">Excluir</button>
              </div></td>
            </tr>`).join('')}</tbody></table>
          </div>
        </div>`;

      document.getElementById('newUserBtn').onclick = () => openUserModal(null, async () => {
        users = await api.get('/users'); render(users);
      });
      content.querySelectorAll('[data-edit]').forEach(btn => {
        const u = list.find(x => x.id === btn.dataset.edit);
        btn.onclick = () => openUserModal(u, async () => { users = await api.get('/users'); render(users); });
      });
      content.querySelectorAll('[data-del]').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm('Confirma exclusão?')) return;
          await api.delete(`/users/${btn.dataset.del}`);
          users = await api.get('/users'); render(users);
        };
      });
    }
    render(users);
  } catch(e) { content.innerHTML = `<div class="error-message">${e.message}</div>`; }
};

function openUserModal(user, onSave) {
  const isEdit = !!user;
  const bd = showModal(`
    <div class="modal-header">
      <span class="modal-title">${isEdit ? 'Editar' : 'Novo'} Usuário</span>
      <button class="modal-close" id="mClose">×</button>
    </div>
    <div class="form-group"><label>Nome</label><input id="mName" value="${escHtml(user?.name || '')}" /></div>
    <div class="form-group"><label>E-mail</label><input id="mEmail" type="email" value="${escHtml(user?.email || '')}" /></div>
    <div class="form-group"><label>Senha ${isEdit ? '(deixe em branco para manter)' : ''}</label><input id="mPass" type="password" /></div>
    <div class="form-group"><label>Perfil</label>
      <select id="mRole" ${isEdit ? 'disabled' : ''}>
        <option value="aluno" ${user?.role==='aluno'?'selected':''}>Aluno</option>
        <option value="professor" ${user?.role==='professor'?'selected':''}>Professor</option>
        <option value="coordenacao" ${user?.role==='coordenacao'?'selected':''}>Coordenação</option>
      </select>
    </div>
    <div id="mErr" class="error-message" style="display:none"></div>
    <div class="modal-footer">
      <button class="btn btn-outline" id="mCancel">Cancelar</button>
      <button class="btn btn-primary" id="mSave">Salvar</button>
    </div>`);

  bd.querySelector('#mClose').onclick = bd.querySelector('#mCancel').onclick = closeModal;
  bd.querySelector('#mSave').onclick = async () => {
    const body = {
      name: bd.querySelector('#mName').value.trim(),
      email: bd.querySelector('#mEmail').value.trim(),
      role: bd.querySelector('#mRole').value,
    };
    const pass = bd.querySelector('#mPass').value;
    if (pass) body.password = pass;
    if (!isEdit) { if (!pass) { showErr(bd, 'Senha obrigatória'); return; } }
    try {
      if (isEdit) await api.put(`/users/${user.id}`, body);
      else await api.post('/users', body);
      closeModal(); await onSave();
    } catch(e) { showErr(bd, e.message); }
  };
}

function showErr(bd, msg) {
  const el = bd.querySelector('#mErr');
  el.textContent = msg; el.style.display = 'block';
}

VIEWS['classes'] = async function() {
  loading();
  try {
    let [classes, allUsers] = await Promise.all([api.get('/classes'), api.get('/users')]);
    const teachers = allUsers.filter(u => u.role === 'professor');
    const students = allUsers.filter(u => u.role === 'aluno');

    function render(list) {
      content.innerHTML = `
        <div class="page-header">
          <div><h2>Turmas</h2><p>Gerenciar turmas e alunos</p></div>
          <button class="btn btn-primary" id="newClassBtn">+ Nova Turma</button>
        </div>
        <div class="card">
          <div class="table-wrapper">
            <table><thead><tr><th>Nome</th><th>Professor</th><th>Alunos</th><th>Disciplinas</th><th>Ações</th></tr></thead>
            <tbody>${list.map(c => {
              const t = teachers.find(t => t.id === c.teacherId);
              return `<tr>
                <td>${escHtml(c.name)}</td>
                <td>${t ? escHtml(t.name) : '—'}</td>
                <td>${c.studentIds?.length || 0}</td>
                <td>${(c.subjects||[]).map(s => `<span class="badge badge-enviado">${escHtml(s)}</span>`).join(' ')}</td>
                <td><div class="actions">
                  <button class="btn btn-outline btn-sm" data-edit="${escHtml(c.id)}">Editar</button>
                  <button class="btn btn-danger btn-sm" data-del="${escHtml(c.id)}">Excluir</button>
                </div></td>
              </tr>`;
            }).join('')}</tbody></table>
          </div>
        </div>`;

      document.getElementById('newClassBtn').onclick = () => openClassModal(null, teachers, students, async () => {
        [classes] = await Promise.all([api.get('/classes')]); render(classes);
      });
      content.querySelectorAll('[data-edit]').forEach(btn => {
        const c = list.find(x => x.id === btn.dataset.edit);
        btn.onclick = () => openClassModal(c, teachers, students, async () => {
          [classes] = await Promise.all([api.get('/classes')]); render(classes);
        });
      });
      content.querySelectorAll('[data-del]').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm('Confirma exclusão da turma?')) return;
          await api.delete(`/classes/${btn.dataset.del}`);
          classes = await api.get('/classes'); render(classes);
        };
      });
    }
    render(classes);
  } catch(e) { content.innerHTML = `<div class="error-message">${e.message}</div>`; }
};

function openClassModal(cls, teachers, students, onSave) {
  const isEdit = !!cls;
  const currentStudents = cls?.studentIds || [];
  const bd = showModal(`
    <div class="modal-header">
      <span class="modal-title">${isEdit ? 'Editar' : 'Nova'} Turma</span>
      <button class="modal-close" id="mClose">×</button>
    </div>
    <div class="form-group"><label>Nome da Turma</label><input id="mName" value="${escHtml(cls?.name||'')}" /></div>
    <div class="form-group"><label>Professor</label>
      <select id="mTeacher">
        <option value="">— Nenhum —</option>
        ${teachers.map(t => `<option value="${escHtml(t.id)}" ${cls?.teacherId===t.id?'selected':''}>${escHtml(t.name)}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Disciplinas (separadas por vírgula)</label>
      <input id="mSubjects" value="${escHtml((cls?.subjects||[]).join(', '))}" />
    </div>
    <div class="form-group"><label>Alunos</label>
      <div style="max-height:160px;overflow-y:auto;border:1.5px solid var(--border);border-radius:8px;padding:8px;">
        ${students.map(s => `
          <label style="display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer;">
            <input type="checkbox" value="${escHtml(s.id)}" ${currentStudents.includes(s.id)?'checked':''} />
            ${escHtml(s.name)}
          </label>`).join('')}
      </div>
    </div>
    <div id="mErr" class="error-message" style="display:none"></div>
    <div class="modal-footer">
      <button class="btn btn-outline" id="mCancel">Cancelar</button>
      <button class="btn btn-primary" id="mSave">Salvar</button>
    </div>`);

  bd.querySelector('#mClose').onclick = bd.querySelector('#mCancel').onclick = closeModal;
  bd.querySelector('#mSave').onclick = async () => {
    const studentIds = [...bd.querySelectorAll('input[type=checkbox]:checked')].map(c => c.value);
    const body = {
      name: bd.querySelector('#mName').value.trim(),
      teacherId: bd.querySelector('#mTeacher').value || null,
      subjects: bd.querySelector('#mSubjects').value.split(',').map(s => s.trim()).filter(Boolean),
      studentIds,
    };
    try {
      if (isEdit) await api.put(`/classes/${cls.id}`, body);
      else await api.post('/classes', body);
      closeModal(); await onSave();
    } catch(e) { showErr(bd, e.message); }
  };
}

VIEWS['videos'] = async function() {
  loading();
  try {
    let [videos, classes] = await Promise.all([api.get('/videos'), api.get('/classes')]);

    function render(list) {
      content.innerHTML = `
        <div class="page-header">
          <div><h2>Vídeos</h2><p>Gerenciar vídeos educacionais</p></div>
          <button class="btn btn-primary" id="newVideoBtn">+ Novo Vídeo</button>
        </div>
        <div class="card">
          <div class="table-wrapper">
            <table><thead><tr><th>Título</th><th>Turma</th><th>Disciplina</th><th>Criado em</th><th>Ações</th></tr></thead>
            <tbody>${list.map(v => {
              const c = classes.find(c => c.id === v.classId);
              return `<tr>
                <td>${escHtml(v.title)}</td>
                <td>${c ? escHtml(c.name) : '—'}</td>
                <td>${escHtml(v.subject||'—')}</td>
                <td>${fmtDate(v.createdAt)}</td>
                <td><div class="actions">
                  <button class="btn btn-outline btn-sm" data-edit="${escHtml(v.id)}">Editar</button>
                  <button class="btn btn-danger btn-sm" data-del="${escHtml(v.id)}">Excluir</button>
                </div></td>
              </tr>`;
            }).join('')}</tbody></table>
          </div>
        </div>`;

      document.getElementById('newVideoBtn').onclick = () => openVideoModal(null, classes, async () => {
        videos = await api.get('/videos'); render(videos);
      });
      content.querySelectorAll('[data-edit]').forEach(btn => {
        const v = list.find(x => x.id === btn.dataset.edit);
        btn.onclick = () => openVideoModal(v, classes, async () => { videos = await api.get('/videos'); render(videos); });
      });
      content.querySelectorAll('[data-del]').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm('Confirma exclusão?')) return;
          await api.delete(`/videos/${btn.dataset.del}`);
          videos = await api.get('/videos'); render(videos);
        };
      });
    }
    render(videos);
  } catch(e) { content.innerHTML = `<div class="error-message">${e.message}</div>`; }
};

function openVideoModal(video, classes, onSave) {
  const isEdit = !!video;
  const bd = showModal(`
    <div class="modal-header">
      <span class="modal-title">${isEdit ? 'Editar' : 'Novo'} Vídeo</span>
      <button class="modal-close" id="mClose">×</button>
    </div>
    <div class="form-group"><label>Título</label><input id="mTitle" value="${escHtml(video?.title||'')}" /></div>
    <div class="form-group"><label>URL</label><input id="mUrl" value="${escHtml(video?.url||'')}" placeholder="https://youtube.com/..." /></div>
    <div class="form-group"><label>Descrição</label><textarea id="mDesc">${escHtml(video?.description||'')}</textarea></div>
    <div class="form-group"><label>Turma</label>
      <select id="mClass">
        ${classes.map(c => `<option value="${escHtml(c.id)}" ${video?.classId===c.id?'selected':''}>${escHtml(c.name)}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label>Disciplina</label><input id="mSubject" value="${escHtml(video?.subject||'')}" /></div>
    <div id="mErr" class="error-message" style="display:none"></div>
    <div class="modal-footer">
      <button class="btn btn-outline" id="mCancel">Cancelar</button>
      <button class="btn btn-primary" id="mSave">Salvar</button>
    </div>`);
  bd.querySelector('#mClose').onclick = bd.querySelector('#mCancel').onclick = closeModal;
  bd.querySelector('#mSave').onclick = async () => {
    const body = {
      title: bd.querySelector('#mTitle').value.trim(),
      url: bd.querySelector('#mUrl').value.trim(),
      description: bd.querySelector('#mDesc').value.trim(),
      classId: bd.querySelector('#mClass').value,
      subject: bd.querySelector('#mSubject').value.trim(),
    };
    try {
      if (isEdit) await api.put(`/videos/${video.id}`, body);
      else await api.post('/videos', body);
      closeModal(); await onSave();
    } catch(e) { showErr(bd, e.message); }
  };
}

VIEWS['quizzes'] = async function() {
  loading();
  try {
    let [quizzes, classes] = await Promise.all([api.get('/quizzes'), api.get('/classes')]);

    function render(list) {
      content.innerHTML = `
        <div class="page-header">
          <div><h2>Quizzes</h2><p>Gerenciar avaliações</p></div>
          <button class="btn btn-primary" id="newQuizBtn">+ Novo Quiz</button>
        </div>
        <div class="card">
          <div class="table-wrapper">
            <table><thead><tr><th>Título</th><th>Turma</th><th>Disciplina</th><th>Questões</th><th>Prazo</th><th>Ações</th></tr></thead>
            <tbody>${list.map(q => {
              const c = classes.find(c => c.id === q.classId);
              return `<tr>
                <td>${escHtml(q.title)}</td>
                <td>${c ? escHtml(c.name) : '—'}</td>
                <td>${escHtml(q.subject||'—')}</td>
                <td>${q.questions?.length||0}</td>
                <td>${fmtDate(q.dueDate)}</td>
                <td><div class="actions">
                  <button class="btn btn-outline btn-sm" data-attempts="${escHtml(q.id)}">Tentativas</button>
                  <button class="btn btn-danger btn-sm" data-del="${escHtml(q.id)}">Excluir</button>
                </div></td>
              </tr>`;
            }).join('')}</tbody></table>
          </div>
        </div>`;

      document.getElementById('newQuizBtn').onclick = () => openQuizModal(null, classes, async () => {
        quizzes = await api.get('/quizzes'); render(quizzes);
      });
      content.querySelectorAll('[data-attempts]').forEach(btn => {
        btn.onclick = () => showAttempts(btn.dataset.attempts);
      });
      content.querySelectorAll('[data-del]').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm('Confirma exclusão?')) return;
          await api.delete(`/quizzes/${btn.dataset.del}`);
          quizzes = await api.get('/quizzes'); render(quizzes);
        };
      });
    }
    render(quizzes);
  } catch(e) { content.innerHTML = `<div class="error-message">${e.message}</div>`; }
};

async function showAttempts(quizId) {
  try {
    const attempts = await api.get(`/quizzes/${quizId}/attempts`);
    const bd = showModal(`
      <div class="modal-header"><span class="modal-title">Tentativas do Quiz</span><button class="modal-close" id="mClose">×</button></div>
      <div class="table-wrapper">
        <table><thead><tr><th>Aluno</th><th>Status</th><th>Nota</th><th>Data</th></tr></thead>
        <tbody>${attempts.map(a => `<tr>
          <td>${escHtml(a.studentName)}</td>
          <td>${badge(a.status)}</td>
          <td>${a.score !== null ? a.score + '%' : '—'}</td>
          <td>${fmtDate(a.submittedAt)}</td>
        </tr>`).join('')}</tbody></table>
      </div>
      <div class="modal-footer"><button class="btn btn-outline" id="mClose2">Fechar</button></div>`);
    bd.querySelector('#mClose').onclick = bd.querySelector('#mClose2').onclick = closeModal;
  } catch(e) { alert(e.message); }
}

function openQuizModal(quiz, classes, onSave) {
  const bd = showModal(`
    <div class="modal-header">
      <span class="modal-title">Novo Quiz</span>
      <button class="modal-close" id="mClose">×</button>
    </div>
    <div class="form-group"><label>Título</label><input id="mTitle" /></div>
    <div class="form-group"><label>Turma</label>
      <select id="mClass">${classes.map(c => `<option value="${escHtml(c.id)}">${escHtml(c.name)}</option>`).join('')}</select>
    </div>
    <div class="form-group"><label>Disciplina</label><input id="mSubject" /></div>
    <div class="form-group"><label>Prazo</label><input id="mDue" type="date" /></div>
    <div class="form-group"><label>Questões (JSON)</label>
      <textarea id="mQuestions" style="font-family:monospace;font-size:12px;" rows="6">[
  {"id":"q1","text":"Pergunta 1?","options":["A","B","C","D"],"correctIndex":0}
]</textarea>
    </div>
    <div id="mErr" class="error-message" style="display:none"></div>
    <div class="modal-footer">
      <button class="btn btn-outline" id="mCancel">Cancelar</button>
      <button class="btn btn-primary" id="mSave">Salvar</button>
    </div>`);
  bd.querySelector('#mClose').onclick = bd.querySelector('#mCancel').onclick = closeModal;
  bd.querySelector('#mSave').onclick = async () => {
    let questions;
    try { questions = JSON.parse(bd.querySelector('#mQuestions').value); } catch { showErr(bd, 'JSON de questões inválido'); return; }
    const due = bd.querySelector('#mDue').value;
    const body = {
      title: bd.querySelector('#mTitle').value.trim(),
      classId: bd.querySelector('#mClass').value,
      subject: bd.querySelector('#mSubject').value.trim(),
      questions,
      dueDate: due ? new Date(due).toISOString() : null,
    };
    try {
      await api.post('/quizzes', body);
      closeModal(); await onSave();
    } catch(e) { showErr(bd, e.message); }
  };
}

VIEWS['reports'] = async function() {
  loading();
  try {
    const [users, classes, videos, quizzes, grades] = await Promise.all([
      api.get('/users'), api.get('/classes'), api.get('/videos'),
      api.get('/quizzes'), api.get('/grades'),
    ]);
    const students = users.filter(u => u.role === 'aluno');
    const graded = grades.filter(g => g.status === 'corrigido');
    const avg = graded.length ? Math.round(graded.reduce((s, g) => s + g.score, 0) / graded.length) : 0;

    content.innerHTML = `
      <div class="page-header"><div><h2>Relatórios</h2><p>Visão geral da atividade</p></div></div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${students.length}</div><div class="stat-label">Alunos</div></div>
        <div class="stat-card"><div class="stat-value">${classes.length}</div><div class="stat-label">Turmas</div></div>
        <div class="stat-card"><div class="stat-value">${grades.length}</div><div class="stat-label">Avaliações</div></div>
        <div class="stat-card"><div class="stat-value">${avg}%</div><div class="stat-label">Média Geral</div></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Notas por Aluno</span></div>
        <div class="table-wrapper">
          <table><thead><tr><th>Aluno</th><th>Atividade</th><th>Disciplina</th><th>Nota</th><th>Status</th><th>Data</th></tr></thead>
          <tbody>${grades.map(g => {
            const s = students.find(u => u.id === g.studentId);
            return `<tr>
              <td>${s ? escHtml(s.name) : g.studentId}</td>
              <td>${escHtml(g.title)}</td>
              <td>${escHtml(g.subject||'—')}</td>
              <td>${g.score}/${g.maxScore}</td>
              <td>${badge(g.status)}</td>
              <td>${fmtDate(g.date)}</td>
            </tr>`;
          }).join('')}</tbody></table>
        </div>
      </div>`;
  } catch(e) { content.innerHTML = `<div class="error-message">${e.message}</div>`; }
};

/* ===================================================================
   PROFESSOR VIEWS
   =================================================================== */

VIEWS['teacher-dashboard'] = async function() {
  loading();
  try {
    const [classes, videos, quizzes] = await Promise.all([
      api.get('/classes'), api.get('/videos'), api.get('/quizzes'),
    ]);
    content.innerHTML = `
      <div class="page-header"><div><h2>Meu Dashboard</h2><p>Olá, ${escHtml(user.name)}!</p></div></div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${classes.length}</div><div class="stat-label">Minhas Turmas</div></div>
        <div class="stat-card"><div class="stat-value">${videos.length}</div><div class="stat-label">Vídeos</div></div>
        <div class="stat-card"><div class="stat-value">${quizzes.length}</div><div class="stat-label">Quizzes</div></div>
        <div class="stat-card"><div class="stat-value">${classes.reduce((s,c) => s+(c.studentIds?.length||0),0)}</div><div class="stat-label">Alunos Total</div></div>
      </div>`;
  } catch(e) { content.innerHTML = `<div class="error-message">${e.message}</div>`; }
};

VIEWS['my-classes'] = async function() {
  loading();
  try {
    const classes = await api.get('/classes');
    content.innerHTML = `
      <div class="page-header"><div><h2>Minhas Turmas</h2></div></div>
      <div class="stats-grid">
        ${classes.map(c => `
          <div class="stat-card" style="text-align:left;">
            <strong>${escHtml(c.name)}</strong>
            <div class="stat-label" style="margin-top:8px;">👥 ${c.studentIds?.length||0} alunos</div>
            <div style="margin-top:8px;">${(c.subjects||[]).map(s => `<span class="badge badge-enviado">${escHtml(s)}</span>`).join(' ')}</div>
            <button class="btn btn-outline btn-sm" style="margin-top:12px;" data-students="${escHtml(c.id)}">Ver Alunos</button>
          </div>`).join('')}
      </div>`;
    content.querySelectorAll('[data-students]').forEach(btn => {
      btn.onclick = async () => {
        const students = await api.get(`/classes/${btn.dataset.students}/students`);
        const cls = classes.find(c => c.id === btn.dataset.students);
        const bd = showModal(`
          <div class="modal-header"><span class="modal-title">Alunos – ${escHtml(cls?.name||'')}</span><button class="modal-close" id="mClose">×</button></div>
          ${students.length === 0
            ? '<div class="empty-state"><span class="empty-icon">👥</span><p>Nenhum aluno</p></div>'
            : `<ul>${students.map(s => `<li style="padding:8px 0;border-bottom:1px solid var(--border)">${escHtml(s.name)} – ${escHtml(s.email)}</li>`).join('')}</ul>`}
          <div class="modal-footer"><button class="btn btn-outline" id="mClose2">Fechar</button></div>`);
        bd.querySelector('#mClose').onclick = bd.querySelector('#mClose2').onclick = closeModal;
      };
    });
  } catch(e) { content.innerHTML = `<div class="error-message">${e.message}</div>`; }
};

VIEWS['my-videos'] = async function() {
  loading();
  try {
    let [videos, classes] = await Promise.all([api.get('/videos'), api.get('/classes')]);

    function render(list) {
      content.innerHTML = `
        <div class="page-header">
          <div><h2>Meus Vídeos</h2></div>
          <button class="btn btn-primary" id="newVideoBtn">+ Novo Vídeo</button>
        </div>
        ${list.length === 0 ? '<div class="empty-state"><span class="empty-icon">🎬</span><p>Nenhum vídeo</p></div>' : ''}
        <div class="video-grid">${list.map(v => {
          const c = classes.find(c => c.id === v.classId);
          return `<div class="video-card">
            <div class="video-thumb">▶</div>
            <div class="video-body">
              <div class="video-title">${escHtml(v.title)}</div>
              <div class="video-meta">${c ? escHtml(c.name) : ''} · ${escHtml(v.subject||'')}</div>
              <div class="actions">
                <a href="${escHtml(v.url)}" target="_blank" class="btn btn-outline btn-sm">Ver</a>
                <button class="btn btn-outline btn-sm" data-views="${escHtml(v.id)}">Visualizações</button>
                <button class="btn btn-danger btn-sm" data-del="${escHtml(v.id)}">Excluir</button>
              </div>
            </div>
          </div>`;
        }).join('')}</div>`;

      document.getElementById('newVideoBtn').onclick = () => openVideoModal(null, classes, async () => {
        videos = await api.get('/videos'); render(videos);
      });
      content.querySelectorAll('[data-views]').forEach(btn => {
        btn.onclick = () => showVideoViews(btn.dataset.views, list);
      });
      content.querySelectorAll('[data-del]').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm('Confirma exclusão?')) return;
          await api.delete(`/videos/${btn.dataset.del}`);
          videos = await api.get('/videos'); render(videos);
        };
      });
    }
    render(videos);
  } catch(e) { content.innerHTML = `<div class="error-message">${e.message}</div>`; }
};

async function showVideoViews(videoId, videos) {
  try {
    const views = await api.get(`/videos/${videoId}/views`);
    const video = videos.find(v => v.id === videoId);
    const bd = showModal(`
      <div class="modal-header"><span class="modal-title">Visualizações – ${escHtml(video?.title||videoId)}</span><button class="modal-close" id="mClose">×</button></div>
      <div class="table-wrapper">
        <table><thead><tr><th>Aluno</th><th>Visualizou</th><th>Progresso</th><th>Concluído</th><th>Data</th></tr></thead>
        <tbody>${views.map(v => `<tr>
          <td>${escHtml(v.studentName)}</td>
          <td>${v.viewed ? '✅' : '❌'}</td>
          <td>${v.progress}%</td>
          <td>${v.completed ? '✅' : '❌'}</td>
          <td>${fmtDate(v.viewedAt)}</td>
        </tr>`).join('')}</tbody></table>
      </div>
      <div class="modal-footer"><button class="btn btn-outline" id="mClose2">Fechar</button></div>`);
    bd.querySelector('#mClose').onclick = bd.querySelector('#mClose2').onclick = closeModal;
  } catch(e) { alert(e.message); }
}

VIEWS['my-quizzes'] = async function() {
  loading();
  try {
    let [quizzes, classes] = await Promise.all([api.get('/quizzes'), api.get('/classes')]);

    function render(list) {
      content.innerHTML = `
        <div class="page-header">
          <div><h2>Meus Quizzes</h2></div>
          <button class="btn btn-primary" id="newQuizBtn">+ Novo Quiz</button>
        </div>
        <div class="card">
          <div class="table-wrapper">
            <table><thead><tr><th>Título</th><th>Turma</th><th>Disciplina</th><th>Questões</th><th>Prazo</th><th>Ações</th></tr></thead>
            <tbody>${list.map(q => {
              const c = classes.find(c => c.id === q.classId);
              return `<tr>
                <td>${escHtml(q.title)}</td>
                <td>${c ? escHtml(c.name) : '—'}</td>
                <td>${escHtml(q.subject||'—')}</td>
                <td>${q.questions?.length||0}</td>
                <td>${fmtDate(q.dueDate)}</td>
                <td><div class="actions">
                  <button class="btn btn-outline btn-sm" data-attempts="${escHtml(q.id)}">Tentativas</button>
                  <button class="btn btn-danger btn-sm" data-del="${escHtml(q.id)}">Excluir</button>
                </div></td>
              </tr>`;
            }).join('')}</tbody></table>
          </div>
        </div>`;

      document.getElementById('newQuizBtn').onclick = () => openQuizModal(null, classes, async () => {
        quizzes = await api.get('/quizzes'); render(quizzes);
      });
      content.querySelectorAll('[data-attempts]').forEach(btn => {
        btn.onclick = () => showAttempts(btn.dataset.attempts);
      });
      content.querySelectorAll('[data-del]').forEach(btn => {
        btn.onclick = async () => {
          if (!confirm('Confirma exclusão?')) return;
          await api.delete(`/quizzes/${btn.dataset.del}`);
          quizzes = await api.get('/quizzes'); render(quizzes);
        };
      });
    }
    render(quizzes);
  } catch(e) { content.innerHTML = `<div class="error-message">${e.message}</div>`; }
};

/* ===================================================================
   ALUNO VIEWS
   =================================================================== */

VIEWS['student-dashboard'] = async function() {
  loading();
  try {
    const [videos, quizzes, grades, history] = await Promise.all([
      api.get('/videos'), api.get('/quizzes'),
      api.get('/grades'), api.get('/history'),
    ]);
    const pending = quizzes.filter(q => !grades.find(g => g.refId === q.id));
    const completed = grades.filter(g => g.status === 'corrigido');
    const avg = completed.length ? Math.round(completed.reduce((s, g) => s + g.score, 0) / completed.length) : 0;

    content.innerHTML = `
      <div class="page-header"><div><h2>Olá, ${escHtml(user.name)}!</h2><p>Aqui está seu resumo de hoje</p></div></div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${videos.length}</div><div class="stat-label">Vídeos Disponíveis</div></div>
        <div class="stat-card"><div class="stat-value">${pending.length}</div><div class="stat-label">Quizzes Pendentes</div></div>
        <div class="stat-card"><div class="stat-value">${completed.length}</div><div class="stat-label">Avaliações Concluídas</div></div>
        <div class="stat-card"><div class="stat-value">${avg}%</div><div class="stat-label">Média Geral</div></div>
      </div>
      ${pending.length > 0 ? `
        <div class="card">
          <div class="card-header"><span class="card-title">⚡ Quizzes Pendentes</span></div>
          <ul style="list-style:none;">${pending.map(q => `
            <li style="padding:10px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
              <span>${escHtml(q.title)} – <small>${escHtml(q.subject||'')}</small></span>
              <button class="btn btn-primary btn-sm" data-quiz="${escHtml(q.id)}">Responder</button>
            </li>`).join('')}</ul>
        </div>` : ''}`;

    content.querySelectorAll('[data-quiz]').forEach(btn => {
      btn.onclick = () => VIEWS['quiz-taker'](btn.dataset.quiz);
    });
  } catch(e) { content.innerHTML = `<div class="error-message">${e.message}</div>`; }
};

VIEWS['my-content'] = async function() {
  loading();
  try {
    const [videos, quizzes, grades] = await Promise.all([
      api.get('/videos'), api.get('/quizzes'), api.get('/grades'),
    ]);
    const doneQuizIds = new Set(grades.map(g => g.refId));

    content.innerHTML = `
      <div class="page-header"><div><h2>Meu Conteúdo</h2><p>Vídeos e quizzes da sua turma</p></div></div>
      <h3 style="margin-bottom:12px;">🎬 Vídeos</h3>
      ${videos.length === 0 ? '<div class="empty-state"><span class="empty-icon">🎬</span><p>Sem vídeos</p></div>' : ''}
      <div class="video-grid" style="margin-bottom:32px;">
        ${videos.map(v => `
          <div class="video-card">
            <div class="video-thumb">▶</div>
            <div class="video-body">
              <div class="video-title">${escHtml(v.title)}</div>
              <div class="video-meta">${escHtml(v.subject||'')} · ${fmtDate(v.createdAt)}</div>
              <div class="actions">
                <a href="${escHtml(v.url)}" target="_blank" class="btn btn-primary btn-sm" data-vid="${escHtml(v.id)}">Assistir</a>
              </div>
            </div>
          </div>`).join('')}
      </div>
      <h3 style="margin-bottom:12px;">📝 Quizzes</h3>
      <div class="card">
        <div class="table-wrapper">
          <table><thead><tr><th>Título</th><th>Disciplina</th><th>Prazo</th><th>Status</th><th></th></tr></thead>
          <tbody>${quizzes.map(q => {
            const done = doneQuizIds.has(q.id);
            return `<tr>
              <td>${escHtml(q.title)}</td>
              <td>${escHtml(q.subject||'—')}</td>
              <td>${fmtDate(q.dueDate)}</td>
              <td>${badge(done ? 'corrigido' : 'pendente')}</td>
              <td>${done ? '' : `<button class="btn btn-primary btn-sm" data-quiz="${escHtml(q.id)}">Responder</button>`}</td>
            </tr>`;
          }).join('')}</tbody></table>
        </div>
      </div>`;

    content.querySelectorAll('[data-vid]').forEach(a => {
      a.addEventListener('click', async () => {
        await api.post(`/videos/${a.dataset.vid}/views`, { progress: 100, completed: true }).catch(() => {});
      });
    });
    content.querySelectorAll('[data-quiz]').forEach(btn => {
      btn.onclick = () => VIEWS['quiz-taker'](btn.dataset.quiz);
    });
  } catch(e) { content.innerHTML = `<div class="error-message">${e.message}</div>`; }
};

VIEWS['grades'] = async function() {
  loading();
  try {
    const [grades, summary] = await Promise.all([
      api.get('/grades'), api.get('/grades/summary'),
    ]);

    function render(list, period, subject, type) {
      const subjects = [...new Set(grades.map(g => g.subject).filter(Boolean))];
      content.innerHTML = `
        <div class="page-header"><div><h2>Minhas Notas</h2></div></div>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-value">${summary.overall ?? 0}%</div><div class="stat-label">Média Geral</div></div>
          <div class="stat-card"><div class="stat-value">${grades.filter(g=>g.status==='corrigido').length}</div><div class="stat-label">Concluídas</div></div>
          <div class="stat-card"><div class="stat-value">${grades.filter(g=>g.status==='pendente').length}</div><div class="stat-label">Pendentes</div></div>
        </div>
        ${Object.keys(summary.bySubject||{}).length ? `
          <div class="card" style="margin-bottom:20px;">
            <div class="card-header"><span class="card-title">Média por Disciplina</span></div>
            <div class="stats-grid">${Object.entries(summary.bySubject).map(([s,v]) =>
              `<div class="stat-card"><div class="stat-value">${v}%</div><div class="stat-label">${escHtml(s)}</div></div>`
            ).join('')}</div>
          </div>` : ''}
        <div class="card">
          <div class="filters">
            <select id="fPeriod">
              <option value="">Todo período</option>
              <option value="7d" ${period==='7d'?'selected':''}>Últimos 7 dias</option>
              <option value="30d" ${period==='30d'?'selected':''}>Últimos 30 dias</option>
              <option value="90d" ${period==='90d'?'selected':''}>Últimos 90 dias</option>
            </select>
            <select id="fSubject">
              <option value="">Todas as disciplinas</option>
              ${subjects.map(s => `<option value="${escHtml(s)}" ${subject===s?'selected':''}>${escHtml(s)}</option>`).join('')}
            </select>
            <select id="fType">
              <option value="">Todos os tipos</option>
              <option value="quiz" ${type==='quiz'?'selected':''}>Quiz</option>
              <option value="prova" ${type==='prova'?'selected':''}>Prova</option>
            </select>
          </div>
          <div class="table-wrapper">
            <table><thead><tr><th>Atividade</th><th>Disciplina</th><th>Tipo</th><th>Nota</th><th>Status</th><th>Data</th></tr></thead>
            <tbody>${list.map(g => `<tr>
              <td>${escHtml(g.title)}</td>
              <td>${escHtml(g.subject||'—')}</td>
              <td>${escHtml(g.type||'—')}</td>
              <td>${g.score}/${g.maxScore}</td>
              <td>${badge(g.status)}</td>
              <td>${fmtDate(g.date)}</td>
            </tr>`).join('')}</tbody></table>
          </div>
        </div>`;

      ['fPeriod','fSubject','fType'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
          const p = document.getElementById('fPeriod').value;
          const s = document.getElementById('fSubject').value;
          const t = document.getElementById('fType').value;
          let filtered = grades;
          if (s) filtered = filtered.filter(g => g.subject === s);
          if (t) filtered = filtered.filter(g => g.type === t);
          if (p) {
            const cutoff = { '7d': 7, '30d': 30, '90d': 90 }[p];
            const since = new Date(Date.now() - cutoff * 86400000);
            filtered = filtered.filter(g => new Date(g.date) >= since);
          }
          render(filtered, p, s, t);
        });
      });
    }
    render(grades, '', '', '');
  } catch(e) { content.innerHTML = `<div class="error-message">${e.message}</div>`; }
};

VIEWS['history'] = async function() {
  loading();
  try {
    const events = await api.get('/history');
    const subjects = [...new Set(events.map(e => e.subject).filter(Boolean))];

    function render(list, period, subject, type) {
      content.innerHTML = `
        <div class="page-header"><div><h2>Histórico de Atividades</h2></div></div>
        <div class="card">
          <div class="filters">
            <select id="fPeriod">
              <option value="">Todo período</option>
              <option value="7d" ${period==='7d'?'selected':''}>Últimos 7 dias</option>
              <option value="30d" ${period==='30d'?'selected':''}>Últimos 30 dias</option>
              <option value="90d" ${period==='90d'?'selected':''}>Últimos 90 dias</option>
            </select>
            <select id="fSubject">
              <option value="">Todas as disciplinas</option>
              ${subjects.map(s => `<option value="${escHtml(s)}" ${subject===s?'selected':''}>${escHtml(s)}</option>`).join('')}
            </select>
            <select id="fType">
              <option value="">Todos os tipos</option>
              <option value="video_view" ${type==='video_view'?'selected':''}>Vídeo</option>
              <option value="quiz_attempt" ${type==='quiz_attempt'?'selected':''}>Quiz</option>
            </select>
          </div>
          ${list.length === 0
            ? '<div class="empty-state"><span class="empty-icon">📅</span><p>Nenhuma atividade encontrada</p></div>'
            : `<div class="table-wrapper">
                <table><thead><tr><th>Data</th><th>Atividade</th><th>Disciplina</th><th>Tipo</th><th>Status</th></tr></thead>
                <tbody>${list.map(e => `<tr>
                  <td>${fmtDate(e.date)}</td>
                  <td>${escHtml(e.title)}</td>
                  <td>${escHtml(e.subject||'—')}</td>
                  <td>${escHtml(e.type==='video_view'?'Vídeo':'Quiz')}</td>
                  <td>${badge(e.status)}</td>
                </tr>`).join('')}</tbody></table>
              </div>`}
        </div>`;

      ['fPeriod','fSubject','fType'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
          const p = document.getElementById('fPeriod').value;
          const s = document.getElementById('fSubject').value;
          const t = document.getElementById('fType').value;
          let filtered = events;
          if (s) filtered = filtered.filter(e => e.subject === s);
          if (t) filtered = filtered.filter(e => e.type === t);
          if (p) {
            const cutoff = { '7d': 7, '30d': 30, '90d': 90 }[p];
            const since = new Date(Date.now() - cutoff * 86400000);
            filtered = filtered.filter(e => new Date(e.date) >= since);
          }
          render(filtered, p, s, t);
        });
      });
    }
    render(events, '', '', '');
  } catch(e) { content.innerHTML = `<div class="error-message">${e.message}</div>`; }
};

VIEWS['quiz-taker'] = async function(quizId) {
  loading();
  try {
    const quizzes = await api.get('/quizzes');
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) { content.innerHTML = '<div class="error-message">Quiz não encontrado</div>'; return; }

    const answers = new Array(quiz.questions.length).fill(null);

    function render() {
      renderNav(currentView);
      content.innerHTML = `
        <div class="page-header">
          <div><h2>${escHtml(quiz.title)}</h2><p>${escHtml(quiz.subject||'')} · ${quiz.questions.length} questões</p></div>
        </div>
        <div class="card">
          <form id="quizForm">
            ${quiz.questions.map((q, qi) => `
              <div class="quiz-question">
                <div class="q-text">${qi+1}. ${escHtml(q.text)}</div>
                ${q.options.map((opt, oi) => `
                  <label class="quiz-option" id="opt-${qi}-${oi}">
                    <input type="radio" name="q${qi}" value="${oi}" />
                    ${escHtml(opt)}
                  </label>`).join('')}
              </div>`).join('')}
            <div id="submitErr" class="error-message" style="display:none"></div>
            <div style="text-align:right;margin-top:12px;">
              <button type="submit" class="btn btn-primary">Enviar Respostas</button>
            </div>
          </form>
        </div>`;

      content.querySelectorAll('input[type=radio]').forEach(radio => {
        radio.addEventListener('change', () => {
          const qIdx = parseInt(radio.name.replace('q',''));
          answers[qIdx] = parseInt(radio.value);
          content.querySelectorAll(`[id^="opt-${qIdx}-"]`).forEach(el => el.classList.remove('selected'));
          document.getElementById(`opt-${qIdx}-${radio.value}`)?.classList.add('selected');
        });
      });

      document.getElementById('quizForm').addEventListener('submit', async e => {
        e.preventDefault();
        if (answers.some(a => a === null)) {
          document.getElementById('submitErr').textContent = 'Responda todas as questões antes de enviar.';
          document.getElementById('submitErr').style.display = 'block';
          return;
        }
        try {
          const result = await api.post(`/quizzes/${quizId}/attempts`, { answers });
          content.innerHTML = `
            <div class="card" style="text-align:center;padding:48px;">
              <div style="font-size:3rem;">🎉</div>
              <h2 style="margin:16px 0 8px;">Quiz enviado!</h2>
              <p>Sua nota: <strong style="font-size:1.5rem;color:var(--primary)">${result.score}%</strong></p>
              <button class="btn btn-primary" style="margin-top:20px;" id="backBtn">Voltar ao Conteúdo</button>
            </div>`;
          document.getElementById('backBtn').onclick = () => navigate('my-content');
        } catch(err) {
          document.getElementById('submitErr').textContent = err.message;
          document.getElementById('submitErr').style.display = 'block';
        }
      });
    }
    render();
  } catch(e) { content.innerHTML = `<div class="error-message">${e.message}</div>`; }
};

/* ===================================================================
   INIT
   =================================================================== */
const defaultView = {
  coordenacao: 'dashboard',
  professor: 'teacher-dashboard',
  aluno: 'student-dashboard',
}[user.role] || 'dashboard';

navigate(defaultView);
