/**
 * coordination-app.js – Lumina coordination portal
 */
'use strict';

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(msg, type) {
  type = type || 'info';
  var toast = document.createElement('div');
  toast.className = 'toast toast--' + type;
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(function() { toast.classList.add('toast--show'); });
  setTimeout(function() {
    toast.classList.remove('toast--show');
    setTimeout(function() { toast.remove(); }, 400);
  }, 3000);
}

function openModal(html) {
  var modal = document.getElementById('coord-modal');
  var box = document.getElementById('coord-modal-box');
  box.innerHTML = html;
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  modal.onclick = function(e) { if (e.target === modal) closeModal(); };
}

function closeModal() {
  var modal = document.getElementById('coord-modal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
}

function statusBadge(status) {
  var labels = { active: 'Ativo', pending: 'Pendente', inactive: 'Inativo' };
  var cls = { active: 'status-badge--active', pending: 'status-badge--pending', inactive: 'status-badge--inactive' };
  return '<span class="status-badge ' + (cls[status] || '') + '">' + escapeHtml(labels[status] || status) + '</span>';
}

// ---- Views ----

function renderCoordWelcome() {
  var totalTeachers = AppData.teachers.length;
  var totalStudents = AppData.students.length;
  var totalClasses = AppData.classes.length;
  var activeQuizzes = AppData.quizzes.filter(function(q){ return q.active; }).length;
  var active = AppData.students.filter(function(s){ return s.status === 'active'; }).length;
  var pending = AppData.students.filter(function(s){ return s.status === 'pending'; }).length;
  var inactive = AppData.students.filter(function(s){ return s.status === 'inactive'; }).length;
  var year = AppData.currentYear || 2026;

  return '<div class="welcome-header animate-fade-in">' +
    '<div class="welcome-hero"><div class="welcome-text">' +
      '<h1>Painel de Coordenação 📋</h1>' +
      '<p class="welcome-subtitle">Ano Letivo: <strong>' + year + '</strong></p>' +
    '</div></div>' +
    '<div class="stats-grid" style="margin-top:2rem">' +
      '<div class="stat-card"><div class="stat-icon">👨‍🏫</div><div class="stat-info"><div class="stat-value">' + totalTeachers + '</div><div class="stat-label">Professores</div></div></div>' +
      '<div class="stat-card"><div class="stat-icon">👨‍🎓</div><div class="stat-info"><div class="stat-value">' + totalStudents + '</div><div class="stat-label">Alunos</div></div></div>' +
      '<div class="stat-card"><div class="stat-icon">🏫</div><div class="stat-info"><div class="stat-value">' + totalClasses + '</div><div class="stat-label">Turmas</div></div></div>' +
      '<div class="stat-card"><div class="stat-icon">📝</div><div class="stat-info"><div class="stat-value">' + activeQuizzes + '</div><div class="stat-label">Quizzes Ativos</div></div></div>' +
    '</div>' +
    '<div class="section-card" style="margin-top:2rem">' +
      '<h3>Matrículas ' + year + '</h3>' +
      '<div style="display:flex;gap:1rem;margin-top:1rem;flex-wrap:wrap">' +
        '<div style="flex:1;min-width:120px;text-align:center;padding:1rem;background:var(--color-surface);border-radius:var(--radius-md)"><div style="font-size:2rem;font-weight:800;color:var(--color-accent-green)">' + active + '</div><div style="color:var(--color-text-muted);font-size:0.85rem">Ativos</div></div>' +
        '<div style="flex:1;min-width:120px;text-align:center;padding:1rem;background:var(--color-surface);border-radius:var(--radius-md)"><div style="font-size:2rem;font-weight:800;color:var(--color-accent-orange)">' + pending + '</div><div style="color:var(--color-text-muted);font-size:0.85rem">Pendentes</div></div>' +
        '<div style="flex:1;min-width:120px;text-align:center;padding:1rem;background:var(--color-surface);border-radius:var(--radius-md)"><div style="font-size:2rem;font-weight:800;color:var(--color-text-muted)">' + inactive + '</div><div style="color:var(--color-text-muted);font-size:0.85rem">Inativos</div></div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function renderCoordTeachers() {
  var html = '<div class="view-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">' +
    '<div><h2>Professores</h2><p class="view-subtitle">Gerencie o corpo docente</p></div>' +
    '<button class="btn btn-primary" onclick="openNewTeacherModal()">+ Novo Professor</button>' +
  '</div>';

  html += '<table class="data-table"><thead><tr><th>Nome</th><th>Usuário</th><th>Disciplina</th><th>Turmas</th><th>Ações</th></tr></thead><tbody>';
  AppData.teachers.forEach(function(t) {
    var classNames = (t.classIds || []).map(function(id) {
      var c = AppData.classes.find(function(x){ return x.id === id; });
      return c ? escapeHtml(c.name) : '?';
    }).join(', ');
    html += '<tr>' +
      '<td><strong>' + escapeHtml(t.name) + '</strong></td>' +
      '<td><code>' + escapeHtml(t.username) + '</code></td>' +
      '<td>' + escapeHtml(t.subject) + '</td>' +
      '<td>' + (classNames || '—') + '</td>' +
      '<td><button class="btn btn-sm btn-secondary" onclick="openEditTeacherModal(' + t.id + ')">Editar</button> ' +
           '<button class="btn btn-sm btn-danger" onclick="removeTeacher(' + t.id + ')">Remover</button></td>' +
    '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function openNewTeacherModal() {
  openModal('<h3 style="margin-bottom:1.5rem">Novo Professor</h3>' +
    '<form onsubmit="saveNewTeacher(event)" class="modal-form-grid">' +
      '<div class="form-group"><label>Nome</label><input class="form-control" id="nt-name" required /></div>' +
      '<div class="form-group"><label>Usuário</label><input class="form-control" id="nt-username" required /></div>' +
      '<div class="form-group"><label>E-mail</label><input class="form-control" id="nt-email" type="email" /></div>' +
      '<div class="form-group"><label>Senha</label><input class="form-control" id="nt-password" required /></div>' +
      '<div class="form-group"><label>Disciplina</label><input class="form-control" id="nt-subject" /></div>' +
      '<div style="display:flex;gap:1rem;justify-content:flex-end;grid-column:1/-1;margin-top:1rem">' +
        '<button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>' +
        '<button type="submit" class="btn btn-primary">Salvar</button>' +
      '</div>' +
    '</form>');
}

function saveNewTeacher(e) {
  e.preventDefault();
  var name = document.getElementById('nt-name').value.trim();
  var username = document.getElementById('nt-username').value.trim();
  var email = document.getElementById('nt-email').value.trim();
  var password = document.getElementById('nt-password').value;
  var subject = document.getElementById('nt-subject').value.trim();
  if (!name || !username || !password) { showToast('Preencha os campos obrigatórios.', 'error'); return; }
  var newId = AppData.teachers.reduce(function(m, t){ return Math.max(m, t.id); }, 0) + 1;
  AppData.teachers.push({ id: newId, username: username, password: password, name: name, email: email, avatar: name.split(' ').slice(0,2).map(function(n){ return n[0]; }).join('').toUpperCase(), subject: subject, classIds: [] });
  closeModal();
  showToast('Professor adicionado com sucesso!', 'success');
  navigate('teachers');
}

function openEditTeacherModal(id) {
  var t = AppData.teachers.find(function(x){ return x.id === id; });
  if (!t) return;
  openModal('<h3 style="margin-bottom:1.5rem">Editar Professor</h3>' +
    '<form onsubmit="saveEditTeacher(event,' + id + ')" class="modal-form-grid">' +
      '<div class="form-group"><label>Nome</label><input class="form-control" id="et-name" value="' + escapeHtml(t.name) + '" required /></div>' +
      '<div class="form-group"><label>Usuário</label><input class="form-control" id="et-username" value="' + escapeHtml(t.username) + '" required /></div>' +
      '<div class="form-group"><label>E-mail</label><input class="form-control" id="et-email" type="email" value="' + escapeHtml(t.email) + '" /></div>' +
      '<div class="form-group"><label>Nova Senha (deixe em branco para manter)</label><input class="form-control" id="et-password" /></div>' +
      '<div class="form-group"><label>Disciplina</label><input class="form-control" id="et-subject" value="' + escapeHtml(t.subject) + '" /></div>' +
      '<div style="display:flex;gap:1rem;justify-content:flex-end;grid-column:1/-1;margin-top:1rem">' +
        '<button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>' +
        '<button type="submit" class="btn btn-primary">Salvar</button>' +
      '</div>' +
    '</form>');
}

function saveEditTeacher(e, id) {
  e.preventDefault();
  var t = AppData.teachers.find(function(x){ return x.id === id; });
  if (!t) return;
  t.name = document.getElementById('et-name').value.trim();
  t.username = document.getElementById('et-username').value.trim();
  t.email = document.getElementById('et-email').value.trim();
  var pw = document.getElementById('et-password').value;
  if (pw) t.password = pw;
  t.subject = document.getElementById('et-subject').value.trim();
  closeModal();
  showToast('Professor atualizado!', 'success');
  navigate('teachers');
}

function removeTeacher(id) {
  if (!confirm('Remover este professor?')) return;
  var idx = AppData.teachers.findIndex(function(t){ return t.id === id; });
  if (idx > -1) AppData.teachers.splice(idx, 1);
  showToast('Professor removido.', 'info');
  navigate('teachers');
}

// Students

function renderCoordStudents(filterClass, filterStatus) {
  filterClass = filterClass || '';
  filterStatus = filterStatus || '';
  var students = AppData.students.filter(function(s) {
    var ok = true;
    if (filterClass) ok = ok && String(s.classId) === filterClass;
    if (filterStatus) ok = ok && s.status === filterStatus;
    return ok;
  });

  var classOptions = '<option value="">Todas as turmas</option>' +
    AppData.classes.map(function(c){ return '<option value="' + c.id + '"' + (String(c.id)===filterClass?' selected':'') + '>' + escapeHtml(c.name) + '</option>'; }).join('');
  var statusOptions = '<option value="">Todos os status</option>' +
    ['active','pending','inactive'].map(function(s){ var labels={active:'Ativo',pending:'Pendente',inactive:'Inativo'}; return '<option value="' + s + '"' + (s===filterStatus?' selected':'') + '>' + labels[s] + '</option>'; }).join('');

  var html = '<div class="view-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:1rem">' +
    '<div><h2>Alunos</h2><p class="view-subtitle">Gerencie os alunos</p></div>' +
    '<div style="display:flex;gap:0.5rem;flex-wrap:wrap">' +
      '<button class="btn btn-primary" onclick="openNewStudentModal()">+ Novo Aluno</button>' +
      '<button class="btn btn-secondary" onclick="bulkReenroll()">Re-Matrícula em Massa</button>' +
      '<button class="btn btn-secondary" onclick="renewEnrollments()">Renovar Matrículas</button>' +
    '</div>' +
  '</div>';

  html += '<div style="display:flex;gap:1rem;margin-bottom:1rem;flex-wrap:wrap">' +
    '<select class="form-control" style="width:auto" onchange="reRenderStudents(this.value, \'' + escapeHtml(filterStatus) + '\')">' + classOptions + '</select>' +
    '<select class="form-control" style="width:auto" onchange="reRenderStudents(\'' + escapeHtml(filterClass) + '\', this.value)">' + statusOptions + '</select>' +
  '</div>';

  html += '<table class="data-table"><thead><tr><th>Nome</th><th>Usuário</th><th>Turma</th><th>Ano</th><th>Status</th><th>Pontos</th><th>Ações</th></tr></thead><tbody>';
  students.forEach(function(s) {
    var cls = AppData.classes.find(function(c){ return c.id === s.classId; });
    html += '<tr>' +
      '<td><strong>' + escapeHtml(s.name) + '</strong></td>' +
      '<td><code>' + escapeHtml(s.username) + '</code></td>' +
      '<td>' + (cls ? escapeHtml(cls.name) : '—') + '</td>' +
      '<td>' + (s.enrollmentYear || '—') + '</td>' +
      '<td>' + statusBadge(s.status) + '</td>' +
      '<td>' + s.points + '</td>' +
      '<td><button class="btn btn-sm btn-secondary" onclick="openEditStudentModal(' + s.id + ')">Editar</button> ' +
           '<button class="btn btn-sm btn-danger" onclick="removeStudent(' + s.id + ')">Remover</button></td>' +
    '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function reRenderStudents(fc, fs) {
  document.getElementById('main-content').innerHTML = renderCoordStudents(fc, fs);
}

function openNewStudentModal() {
  var classOptions = AppData.classes.map(function(c){ return '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>'; }).join('');
  openModal('<h3 style="margin-bottom:1.5rem">Novo Aluno</h3>' +
    '<form onsubmit="saveNewStudent(event)" class="modal-form-grid">' +
      '<div class="form-group"><label>Nome</label><input class="form-control" id="ns-name" required /></div>' +
      '<div class="form-group"><label>Usuário</label><input class="form-control" id="ns-username" required /></div>' +
      '<div class="form-group"><label>Senha</label><input class="form-control" id="ns-password" required /></div>' +
      '<div class="form-group"><label>Turma</label><select class="form-control" id="ns-class">' + classOptions + '</select></div>' +
      '<div class="form-group"><label>Ano de Matrícula</label><input class="form-control" id="ns-year" type="number" value="' + (AppData.currentYear||2026) + '" /></div>' +
      '<div class="form-group"><label>Status</label><select class="form-control" id="ns-status"><option value="active">Ativo</option><option value="pending">Pendente</option><option value="inactive">Inativo</option></select></div>' +
      '<div style="display:flex;gap:1rem;justify-content:flex-end;grid-column:1/-1;margin-top:1rem">' +
        '<button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>' +
        '<button type="submit" class="btn btn-primary">Salvar</button>' +
      '</div>' +
    '</form>');
}

function saveNewStudent(e) {
  e.preventDefault();
  var name = document.getElementById('ns-name').value.trim();
  var username = document.getElementById('ns-username').value.trim();
  var password = document.getElementById('ns-password').value;
  var classId = parseInt(document.getElementById('ns-class').value, 10);
  var enrollmentYear = parseInt(document.getElementById('ns-year').value, 10);
  var status = document.getElementById('ns-status').value;
  if (!name || !username || !password) { showToast('Preencha os campos obrigatórios.', 'error'); return; }
  var newId = AppData.students.reduce(function(m, s){ return Math.max(m, s.id); }, 0) + 1;
  AppData.students.push({ id: newId, name: name, username: username, password: password, classId: classId, points: 0, enrollmentYear: enrollmentYear, status: status });
  closeModal();
  showToast('Aluno adicionado!', 'success');
  navigate('students');
}

function openEditStudentModal(id) {
  var s = AppData.students.find(function(x){ return x.id === id; });
  if (!s) return;
  var classOptions = AppData.classes.map(function(c){ return '<option value="' + c.id + '"' + (c.id===s.classId?' selected':'') + '>' + escapeHtml(c.name) + '</option>'; }).join('');
  openModal('<h3 style="margin-bottom:1.5rem">Editar Aluno</h3>' +
    '<form onsubmit="saveEditStudent(event,' + id + ')" class="modal-form-grid">' +
      '<div class="form-group"><label>Nome</label><input class="form-control" id="es-name" value="' + escapeHtml(s.name) + '" required /></div>' +
      '<div class="form-group"><label>Usuário</label><input class="form-control" id="es-username" value="' + escapeHtml(s.username) + '" required /></div>' +
      '<div class="form-group"><label>Nova Senha</label><input class="form-control" id="es-password" placeholder="Deixe em branco para manter" /></div>' +
      '<div class="form-group"><label>Turma</label><select class="form-control" id="es-class">' + classOptions + '</select></div>' +
      '<div class="form-group"><label>Ano de Matrícula</label><input class="form-control" id="es-year" type="number" value="' + (s.enrollmentYear||2026) + '" /></div>' +
      '<div class="form-group"><label>Status</label><select class="form-control" id="es-status">' +
        ['active','pending','inactive'].map(function(st){ var labels={active:'Ativo',pending:'Pendente',inactive:'Inativo'}; return '<option value="'+st+'"'+(s.status===st?' selected':'')+'>'+labels[st]+'</option>'; }).join('') +
      '</select></div>' +
      '<div style="display:flex;gap:1rem;justify-content:flex-end;grid-column:1/-1;margin-top:1rem">' +
        '<button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>' +
        '<button type="submit" class="btn btn-primary">Salvar</button>' +
      '</div>' +
    '</form>');
}

function saveEditStudent(e, id) {
  e.preventDefault();
  var s = AppData.students.find(function(x){ return x.id === id; });
  if (!s) return;
  s.name = document.getElementById('es-name').value.trim();
  s.username = document.getElementById('es-username').value.trim();
  var pw = document.getElementById('es-password').value;
  if (pw) s.password = pw;
  s.classId = parseInt(document.getElementById('es-class').value, 10);
  s.enrollmentYear = parseInt(document.getElementById('es-year').value, 10);
  s.status = document.getElementById('es-status').value;
  closeModal();
  showToast('Aluno atualizado!', 'success');
  navigate('students');
}

function removeStudent(id) {
  if (!confirm('Remover este aluno?')) return;
  var idx = AppData.students.findIndex(function(s){ return s.id === id; });
  if (idx > -1) AppData.students.splice(idx, 1);
  showToast('Aluno removido.', 'info');
  navigate('students');
}

function bulkReenroll() {
  if (!confirm('Isso irá definir todos os alunos como "pendente" para re-matrícula. Confirmar?')) return;
  AppData.students.forEach(function(s){ s.status = 'pending'; });
  showToast('Todos os alunos marcados como pendentes.', 'info');
  navigate('students');
}

function renewEnrollments() {
  if (!confirm('Isso irá ativar todos os alunos para o novo ano. Confirmar?')) return;
  var year = AppData.currentYear || 2026;
  AppData.students.forEach(function(s){ s.status = 'active'; s.enrollmentYear = year; });
  showToast('Matrículas renovadas para ' + year + '!', 'success');
  navigate('students');
}

// Classes

function renderCoordClasses() {
  var html = '<div class="view-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">' +
    '<div><h2>Turmas</h2><p class="view-subtitle">Gerencie as turmas da escola</p></div>' +
    '<button class="btn btn-primary" onclick="openNewClassModal()">+ Nova Turma</button>' +
  '</div>';
  html += '<table class="data-table"><thead><tr><th>Nome</th><th>Série</th><th>Turno</th><th>Alunos</th><th>Disciplinas</th><th>Ações</th></tr></thead><tbody>';
  AppData.classes.forEach(function(c) {
    var studentCount = AppData.students.filter(function(s){ return s.classId === c.id; }).length;
    html += '<tr>' +
      '<td><strong>' + escapeHtml(c.name) + '</strong></td>' +
      '<td>' + escapeHtml(c.grade) + '</td>' +
      '<td>' + escapeHtml(c.shift) + '</td>' +
      '<td>' + studentCount + '</td>' +
      '<td>' + (c.subjects||[]).map(function(s){ return escapeHtml(s); }).join(', ') + '</td>' +
      '<td><button class="btn btn-sm btn-secondary" onclick="openEditClassModal(' + c.id + ')">Editar</button> ' +
           '<button class="btn btn-sm btn-danger" onclick="removeClass(' + c.id + ')">Remover</button></td>' +
    '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function openNewClassModal() {
  openModal('<h3 style="margin-bottom:1.5rem">Nova Turma</h3>' +
    '<form onsubmit="saveNewClass(event)" class="modal-form-grid">' +
      '<div class="form-group"><label>Nome</label><input class="form-control" id="nc-name" placeholder="Ex: 7º Ano A" required /></div>' +
      '<div class="form-group"><label>Série</label><input class="form-control" id="nc-grade" placeholder="Ex: 7º Ano" /></div>' +
      '<div class="form-group"><label>Turno</label><select class="form-control" id="nc-shift"><option>Manhã</option><option>Tarde</option><option>Noite</option></select></div>' +
      '<div class="form-group"><label>Disciplinas (separadas por vírgula)</label><input class="form-control" id="nc-subjects" /></div>' +
      '<div style="display:flex;gap:1rem;justify-content:flex-end;grid-column:1/-1;margin-top:1rem">' +
        '<button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>' +
        '<button type="submit" class="btn btn-primary">Salvar</button>' +
      '</div>' +
    '</form>');
}

function saveNewClass(e) {
  e.preventDefault();
  var name = document.getElementById('nc-name').value.trim();
  var grade = document.getElementById('nc-grade').value.trim();
  var shift = document.getElementById('nc-shift').value;
  var subjects = document.getElementById('nc-subjects').value.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
  if (!name) { showToast('Nome obrigatório.', 'error'); return; }
  var newId = AppData.classes.reduce(function(m, c){ return Math.max(m, c.id); }, 0) + 1;
  AppData.classes.push({ id: newId, name: name, grade: grade, shift: shift, students: 0, subjects: subjects });
  closeModal();
  showToast('Turma criada!', 'success');
  navigate('classes');
}

function openEditClassModal(id) {
  var c = AppData.classes.find(function(x){ return x.id === id; });
  if (!c) return;
  openModal('<h3 style="margin-bottom:1.5rem">Editar Turma</h3>' +
    '<form onsubmit="saveEditClass(event,' + id + ')" class="modal-form-grid">' +
      '<div class="form-group"><label>Nome</label><input class="form-control" id="ec-name" value="' + escapeHtml(c.name) + '" required /></div>' +
      '<div class="form-group"><label>Série</label><input class="form-control" id="ec-grade" value="' + escapeHtml(c.grade) + '" /></div>' +
      '<div class="form-group"><label>Turno</label><select class="form-control" id="ec-shift">' +
        ['Manhã','Tarde','Noite'].map(function(s){ return '<option'+(s===c.shift?' selected':'')+'>'+s+'</option>'; }).join('') +
      '</select></div>' +
      '<div class="form-group"><label>Disciplinas (separadas por vírgula)</label><input class="form-control" id="ec-subjects" value="' + escapeHtml((c.subjects||[]).join(', ')) + '" /></div>' +
      '<div style="display:flex;gap:1rem;justify-content:flex-end;grid-column:1/-1;margin-top:1rem">' +
        '<button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>' +
        '<button type="submit" class="btn btn-primary">Salvar</button>' +
      '</div>' +
    '</form>');
}

function saveEditClass(e, id) {
  e.preventDefault();
  var c = AppData.classes.find(function(x){ return x.id === id; });
  if (!c) return;
  c.name = document.getElementById('ec-name').value.trim();
  c.grade = document.getElementById('ec-grade').value.trim();
  c.shift = document.getElementById('ec-shift').value;
  c.subjects = document.getElementById('ec-subjects').value.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
  closeModal();
  showToast('Turma atualizada!', 'success');
  navigate('classes');
}

function removeClass(id) {
  if (!confirm('Remover esta turma?')) return;
  var idx = AppData.classes.findIndex(function(c){ return c.id === id; });
  if (idx > -1) AppData.classes.splice(idx, 1);
  showToast('Turma removida.', 'info');
  navigate('classes');
}

// Settings

function renderCoordSettings() {
  return '<div class="view-header"><h2>Configurações</h2><p class="view-subtitle">Opções gerais do sistema</p></div>' +
    '<div class="section-card" style="margin-bottom:2rem">' +
      '<h3>Ano Letivo Atual</h3>' +
      '<div style="display:flex;gap:1rem;align-items:center;margin-top:1rem">' +
        '<input type="number" class="form-control" id="settings-year" value="' + (AppData.currentYear||2026) + '" style="max-width:140px" />' +
        '<button class="btn btn-primary" onclick="saveSettingsYear()">Salvar Ano</button>' +
      '</div>' +
    '</div>' +
    '<div class="section-card">' +
      '<h3>Operações em Massa</h3>' +
      '<div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:1rem">' +
        '<button class="btn btn-secondary" onclick="bulkReenroll()">Re-Matrícula em Massa</button>' +
        '<button class="btn btn-secondary" onclick="renewEnrollments()">Renovar Todas as Matrículas</button>' +
      '</div>' +
    '</div>';
}

function saveSettingsYear() {
  var val = parseInt(document.getElementById('settings-year').value, 10);
  if (isNaN(val)) { showToast('Ano inválido.', 'error'); return; }
  AppData.currentYear = val;
  showToast('Ano letivo atualizado para ' + val + '!', 'success');
}

// ---- Router & Init ----

var _currentView = 'welcome';

function navigate(view) {
  _currentView = view;
  document.querySelectorAll('.nav-item[data-view]').forEach(function(item) {
    item.classList.toggle('nav-item--active', item.dataset.view === view);
  });
  var content = document.getElementById('main-content');
  if (!content) return;
  switch(view) {
    case 'welcome':  content.innerHTML = renderCoordWelcome(); break;
    case 'teachers': content.innerHTML = renderCoordTeachers(); break;
    case 'students': content.innerHTML = renderCoordStudents(); break;
    case 'classes':  content.innerHTML = renderCoordClasses(); break;
    case 'settings': content.innerHTML = renderCoordSettings(); break;
    default:         content.innerHTML = renderCoordWelcome();
  }
}

(function() {
  Auth.requireAuth('coordination');

  document.addEventListener('DOMContentLoaded', function() {
    var user = Auth.getCurrentUser('coordination');

    document.querySelectorAll('[data-coord-avatar]').forEach(function(el) {
      el.textContent = user.avatar || 'CG';
    });
    document.querySelectorAll('[data-coord-name]').forEach(function(el) {
      el.textContent = user.name || 'Coordenação';
    });

    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', function() { Auth.logout('coordination'); });

    document.querySelectorAll('.nav-item[data-view]').forEach(function(item) {
      item.addEventListener('click', function() { navigate(item.dataset.view); });
    });

    var menuToggle = document.getElementById('menu-toggle');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', function() { sidebar.classList.toggle('sidebar--open'); });
    }
    if (overlay && sidebar) {
      overlay.addEventListener('click', function() { sidebar.classList.remove('sidebar--open'); });
    }

    navigate('welcome');
  });
})();
