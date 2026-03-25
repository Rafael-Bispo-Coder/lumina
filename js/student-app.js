/**
 * student-app.js – Lumina student dashboard
 */
'use strict';

// Security helpers (same as app.js)
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeUrl(url) {
  if (!url) return '#';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return '#';
}

// In-memory quiz results for this session
var studentQuizResults = [];

function getStudentClass(student) {
  return AppData.classes.find(function(c) { return c.id === student.classId; }) || null;
}

function renderStudentWelcome(student) {
  var cls = getStudentClass(student);
  var className = cls ? escapeHtml(cls.name) : '—';
  var firstName = escapeHtml(student.name.split(' ')[0]);
  var rank = AppData.students
    .filter(function(s) { return s.classId === student.classId; })
    .sort(function(a,b) { return b.points - a.points; })
    .findIndex(function(s) { return s.id === student.id; }) + 1;
  return '<div class="welcome-header animate-fade-in">' +
    '<div class="welcome-hero">' +
      '<div class="welcome-text">' +
        '<h1>Olá, ' + firstName + '! 👋</h1>' +
        '<p class="welcome-subtitle">Bem-vindo(a) de volta ao Lumina. Continue assim! 🌟</p>' +
      '</div>' +
    '</div>' +
    '<div class="stats-grid" style="margin-top:2rem">' +
      '<div class="stat-card">' +
        '<div class="stat-icon" style="background:var(--color-accent-green-light)"><span aria-hidden="true">⭐</span></div>' +
        '<div class="stat-info"><div class="stat-value">' + escapeHtml(String(student.points)) + '</div><div class="stat-label">Pontos acumulados</div></div>' +
      '</div>' +
      '<div class="stat-card">' +
        '<div class="stat-icon" style="background:var(--color-accent-blue-light)"><span aria-hidden="true">🏆</span></div>' +
        '<div class="stat-info"><div class="stat-value">#' + rank + '</div><div class="stat-label">Posição na turma</div></div>' +
      '</div>' +
      '<div class="stat-card">' +
        '<div class="stat-icon" style="background:var(--color-primary-light)"><span aria-hidden="true">📚</span></div>' +
        '<div class="stat-info"><div class="stat-value">' + className + '</div><div class="stat-label">Sua turma</div></div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function renderStudentVideos(student) {
  var videos = AppData.videos.filter(function(v) { return v.classId === student.classId; });
  if (videos.length === 0) {
    return '<div class="view-header"><h2>Meus Vídeos</h2></div><div class="empty-state">Nenhum vídeo disponível para sua turma.</div>';
  }
  // Group by subject
  var bySubject = {};
  videos.forEach(function(v) {
    if (!bySubject[v.subject]) bySubject[v.subject] = [];
    bySubject[v.subject].push(v);
  });
  var html = '<div class="view-header"><h2>Meus Vídeos</h2><p class="view-subtitle">Vídeos disponíveis para sua turma</p></div>';
  Object.keys(bySubject).forEach(function(subj) {
    html += '<h3 style="margin:1.5rem 0 1rem;color:var(--color-text-muted);font-size:0.85rem;text-transform:uppercase;letter-spacing:0.05em">' + escapeHtml(subj) + '</h3>';
    html += '<div class="video-grid">';
    bySubject[subj].forEach(function(v) {
      html += '<div class="video-card">' +
        '<div class="video-thumb"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>' +
        '<div class="video-info">' +
          '<div class="video-title">' + escapeHtml(v.title) + '</div>' +
          '<div class="video-meta">' +
            '<span>' + escapeHtml(v.subject) + '</span>' +
            '<span>⏱ ' + escapeHtml(v.duration) + '</span>' +
            '<span>👁 ' + escapeHtml(String(v.views)) + ' views</span>' +
          '</div>' +
          '<button class="btn btn-primary" onclick="openVideoModal(' + v.id + ')" style="margin-top:0.75rem;width:100%">▶ Assistir</button>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
  });
  return html;
}

function openVideoModal(videoId) {
  var v = AppData.videos.find(function(x) { return x.id === videoId; });
  if (!v) return;
  v.views = (v.views || 0) + 1;
  var safeUrl = sanitizeUrl(v.url);
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay modal-overlay--active';
  overlay.innerHTML = '<div class="modal-box" style="max-width:720px;padding:1.5rem">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">' +
      '<h3 style="margin:0">' + escapeHtml(v.title) + '</h3>' +
      '<button onclick="this.closest(\'.modal-overlay\').remove()" style="background:none;border:none;cursor:pointer;font-size:1.5rem;color:var(--color-text-muted)">✕</button>' +
    '</div>' +
    '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:var(--radius-md)">' +
      '<iframe src="' + safeUrl + '" style="position:absolute;top:0;left:0;width:100%;height:100%" frameborder="0" allowfullscreen title="' + escapeHtml(v.title) + '"></iframe>' +
    '</div>' +
    '<p style="margin-top:1rem;color:var(--color-text-muted);font-size:0.9rem">' + escapeHtml(v.description) + '</p>' +
  '</div>';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function renderStudentQuizzes(student) {
  var quizzes = AppData.quizzes.filter(function(q) { return q.classId === student.classId && q.active; });
  if (quizzes.length === 0) {
    return '<div class="view-header"><h2>Quizzes</h2></div><div class="empty-state">Nenhum quiz ativo no momento.</div>';
  }
  var html = '<div class="view-header"><h2>Quizzes</h2><p class="view-subtitle">Quizzes disponíveis para sua turma</p></div><div class="quiz-grid">';
  quizzes.forEach(function(q) {
    var totalPts = q.questions.reduce(function(s, qu) { return s + qu.points; }, 0);
    var done = studentQuizResults.find(function(r) { return r.quizId === q.id; });
    html += '<div class="quiz-card">' +
      '<div class="quiz-header"><span class="quiz-subject-badge">' + escapeHtml(q.subject) + '</span>' +
      (done ? '<span class="status-badge status-badge--active">Feito</span>' : '') +
      '</div>' +
      '<h3 class="quiz-title">' + escapeHtml(q.title) + '</h3>' +
      '<p class="quiz-desc">' + escapeHtml(q.description) + '</p>' +
      '<div class="quiz-meta">' +
        '<span>❓ ' + q.questions.length + ' questões</span>' +
        '<span>⭐ ' + totalPts + ' pts</span>' +
      '</div>' +
      '<button class="btn btn-primary" style="margin-top:1rem;width:100%" onclick="openStudentQuiz(' + q.id + ')">' +
        (done ? 'Ver Resultado' : 'Fazer Quiz') +
      '</button>' +
    '</div>';
  });
  html += '</div>';
  return html;
}

function openStudentQuiz(quizId) {
  var q = AppData.quizzes.find(function(x) { return x.id === quizId; });
  if (!q) return;
  var currentStudent = Auth.getCurrentUser('student');
  var studentRecord = AppData.students.find(function(s) { return s.id === currentStudent.id; });
  var done = studentQuizResults.find(function(r) { return r.quizId === quizId; });
  if (done) {
    showStudentQuizResult(q, done.score, done.total);
    return;
  }
  var answers = new Array(q.questions.length).fill(null);
  var currentQ = 0;

  function buildQuizModal() {
    var existing = document.getElementById('student-quiz-modal');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'student-quiz-modal';
    overlay.className = 'modal-overlay modal-overlay--active';
    var qObj = q.questions[currentQ];
    var optionsHtml = qObj.options.map(function(opt, i) {
      var sel = answers[currentQ] === i ? 'style="border-color:var(--color-primary);background:var(--color-primary-light)"' : '';
      return '<button class="quiz-option" ' + sel + ' onclick="selectStudentAnswer(' + i + ')">' + escapeHtml(opt.text) + '</button>';
    }).join('');
    overlay.innerHTML = '<div class="modal-box" style="max-width:600px">' +
      '<div class="quiz-progress" style="margin-bottom:1rem"><span style="color:var(--color-text-muted);font-size:0.85rem">Questão ' + (currentQ+1) + ' de ' + q.questions.length + '</span>' +
        '<div style="background:var(--color-border);height:6px;border-radius:3px;margin-top:0.5rem"><div style="background:var(--color-primary);height:6px;border-radius:3px;width:' + Math.round((currentQ+1)/q.questions.length*100) + '%"></div></div>' +
      '</div>' +
      '<h3 style="margin-bottom:1.5rem">' + escapeHtml(qObj.question) + '</h3>' +
      '<div class="quiz-options" id="quiz-options">' + optionsHtml + '</div>' +
      '<div style="display:flex;justify-content:space-between;margin-top:1.5rem">' +
        '<button class="btn btn-secondary" onclick="document.getElementById(\'student-quiz-modal\').remove()">Cancelar</button>' +
        (currentQ < q.questions.length - 1
          ? '<button class="btn btn-primary" onclick="nextStudentQuestion()">Próxima →</button>'
          : '<button class="btn btn-primary" onclick="submitStudentQuiz()">Enviar Quiz</button>') +
      '</div>' +
    '</div>';
    document.body.appendChild(overlay);
  }

  window.selectStudentAnswer = function(idx) {
    answers[currentQ] = idx;
    buildQuizModal();
  };
  window.nextStudentQuestion = function() {
    if (answers[currentQ] === null) { showToastStudent('Selecione uma resposta!', 'error'); return; }
    currentQ++;
    buildQuizModal();
  };
  window.submitStudentQuiz = function() {
    if (answers[currentQ] === null) { showToastStudent('Selecione uma resposta!', 'error'); return; }
    var score = 0;
    q.questions.forEach(function(qu, i) {
      if (answers[i] !== null && qu.options[answers[i]].correct) score += qu.points;
    });
    var total = q.questions.reduce(function(s, qu) { return s + qu.points; }, 0);
    studentQuizResults.push({ quizId: quizId, score: score, total: total, title: q.title });
    if (studentRecord) studentRecord.points += score;
    var modal = document.getElementById('student-quiz-modal');
    if (modal) modal.remove();
    showStudentQuizResult(q, score, total);
  };

  buildQuizModal();
}

function showStudentQuizResult(q, score, total) {
  var pct = total > 0 ? Math.round(score/total*100) : 0;
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay modal-overlay--active';
  overlay.innerHTML = '<div class="modal-box" style="max-width:480px;text-align:center">' +
    '<div style="font-size:3rem;margin-bottom:1rem">' + (pct >= 70 ? '🏆' : pct >= 40 ? '👍' : '📚') + '</div>' +
    '<h2 style="margin-bottom:0.5rem">Resultado</h2>' +
    '<p style="color:var(--color-text-muted);margin-bottom:1.5rem">' + escapeHtml(q.title) + '</p>' +
    '<div style="font-size:2.5rem;font-weight:800;color:var(--color-primary)">' + score + '<span style="font-size:1rem;color:var(--color-text-muted)">/' + total + ' pts</span></div>' +
    '<div style="color:var(--color-text-muted);margin:0.5rem 0 1.5rem">' + pct + '% de acerto</div>' +
    '<button class="btn btn-primary" onclick="this.closest(\'.modal-overlay\').remove()">Fechar</button>' +
  '</div>';
  document.body.appendChild(overlay);
}

function renderStudentPerformance(student) {
  var classStudents = AppData.students
    .filter(function(s) { return s.classId === student.classId; })
    .sort(function(a,b) { return b.points - a.points; });
  var rank = classStudents.findIndex(function(s) { return s.id === student.id; }) + 1;
  var maxPts = classStudents.length > 0 ? classStudents[0].points : 1;

  var barsHtml = classStudents.map(function(s, i) {
    var pct = maxPts > 0 ? Math.round(s.points / maxPts * 100) : 0;
    var isMe = s.id === student.id;
    return '<div class="bar-chart-item">' +
      '<div class="bar-chart-label">' + (i+1) + '. ' + escapeHtml(s.name.split(' ')[0]) + (isMe ? ' (você)' : '') + '</div>' +
      '<div class="bar-chart-bar-wrap">' +
        '<div class="bar-chart-bar" style="width:' + pct + '%;background:' + (isMe ? 'var(--color-primary)' : 'var(--color-border)') + '"></div>' +
        '<span class="bar-chart-value">' + s.points + ' pts</span>' +
      '</div>' +
    '</div>';
  }).join('');

  var resultsHtml = studentQuizResults.length > 0
    ? '<table class="data-table" style="margin-top:1rem"><thead><tr><th>Quiz</th><th>Pontos</th><th>%</th></tr></thead><tbody>' +
      studentQuizResults.map(function(r) {
        var pct = r.total > 0 ? Math.round(r.score/r.total*100) : 0;
        return '<tr><td>' + escapeHtml(r.title) + '</td><td>' + r.score + '/' + r.total + '</td><td>' + pct + '%</td></tr>';
      }).join('') + '</tbody></table>'
    : '<p style="color:var(--color-text-muted)">Nenhum quiz realizado ainda.</p>';

  return '<div class="view-header"><h2>Meu Desempenho</h2><p class="view-subtitle">Acompanhe sua evolução</p></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem">' +
      '<div class="stat-card">' +
        '<div style="text-align:center;padding:1rem">' +
          '<div style="font-size:3rem;font-weight:800;color:var(--color-primary)">' + escapeHtml(String(student.points)) + '</div>' +
          '<div style="color:var(--color-text-muted);font-size:0.9rem">Pontos Totais</div>' +
        '</div>' +
      '</div>' +
      '<div class="stat-card">' +
        '<div style="text-align:center;padding:1rem">' +
          '<div style="font-size:3rem;font-weight:800;color:var(--color-accent-orange)">#' + rank + '</div>' +
          '<div style="color:var(--color-text-muted);font-size:0.9rem">Posição na Turma</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="section-card" style="margin-bottom:2rem">' +
      '<h3 style="margin-bottom:1rem">Ranking da Turma</h3>' +
      '<div class="bar-chart">' + barsHtml + '</div>' +
    '</div>' +
    '<div class="section-card">' +
      '<h3 style="margin-bottom:0.5rem">Histórico de Quizzes</h3>' +
      resultsHtml +
    '</div>';
}

function showToastStudent(msg, type) {
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

// ---------------------------------------------------------------------------
// Router & Init
// ---------------------------------------------------------------------------

(function() {
  Auth.requireAuth('student');

  var currentStudent = null;
  var currentView = 'welcome';

  function init() {
    var user = Auth.getCurrentUser('student');
    currentStudent = AppData.students.find(function(s) { return s.id === user.id; });
    if (!currentStudent) { Auth.logout('student'); return; }

    var cls = getStudentClass(currentStudent);

    // Populate sidebar/topbar
    document.querySelectorAll('[data-student-avatar]').forEach(function(el) {
      el.textContent = currentStudent.name.split(' ').slice(0,2).map(function(n){ return n[0]; }).join('').toUpperCase();
    });
    document.querySelectorAll('[data-student-name]').forEach(function(el) {
      el.textContent = currentStudent.name;
    });
    document.querySelectorAll('[data-student-class]').forEach(function(el) {
      el.textContent = cls ? cls.name : '—';
    });

    // Logout
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', function() { Auth.logout('student'); });

    // Nav
    document.querySelectorAll('.nav-item[data-view]').forEach(function(item) {
      item.addEventListener('click', function() {
        navigate(item.dataset.view);
      });
    });

    // Mobile sidebar
    var menuToggle = document.getElementById('menu-toggle');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('sidebar--open');
      });
    }
    if (overlay && sidebar) {
      overlay.addEventListener('click', function() {
        sidebar.classList.remove('sidebar--open');
      });
    }

    navigate('welcome');
  }

  function navigate(view) {
    currentView = view;
    document.querySelectorAll('.nav-item[data-view]').forEach(function(item) {
      item.classList.toggle('nav-item--active', item.dataset.view === view);
    });
    var content = document.getElementById('main-content');
    if (!content) return;
    switch(view) {
      case 'welcome':     content.innerHTML = renderStudentWelcome(currentStudent); break;
      case 'videos':      content.innerHTML = renderStudentVideos(currentStudent); break;
      case 'quizzes':     content.innerHTML = renderStudentQuizzes(currentStudent); break;
      case 'performance': content.innerHTML = renderStudentPerformance(currentStudent); break;
      default:            content.innerHTML = renderStudentWelcome(currentStudent);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
