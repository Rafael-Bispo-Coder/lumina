/**
 * app.js - Lumina dashboard application
 *
 * Handles all dashboard views: welcome, classes, videos, and quizzes.
 * Uses a simple client-side router based on a hash or data attribute.
 *
 * @module app
 */

'use strict';

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/**
 * Format an ISO date string to a human-readable Brazilian Portuguese date.
 * @param {string} iso
 * @returns {string}
 */
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

/**
 * Get classes that belong to the currently logged-in teacher.
 * @param {Object} teacher
 * @returns {import('./data.js').SchoolClass[]}
 */
function getTeacherClasses(teacher) {
  return AppData.classes.filter((c) => teacher.classIds.includes(c.id));
}

/**
 * Get videos posted by the currently logged-in teacher.
 * @param {Object} teacher
 * @returns {import('./data.js').Video[]}
 */
function getTeacherVideos(teacher) {
  return AppData.videos.filter((v) => v.teacherId === teacher.id);
}

/**
 * Get quizzes created by the currently logged-in teacher.
 * @param {Object} teacher
 * @returns {import('./data.js').Quiz[]}
 */
function getTeacherQuizzes(teacher) {
  return AppData.quizzes.filter((q) => q.teacherId === teacher.id);
}

/**
 * Return the class name for a given class ID.
 * @param {number} classId
 * @returns {string}
 */
function getClassName(classId) {
  const cls = AppData.classes.find((c) => c.id === classId);
  return cls ? cls.name : '—';
}

/**
 * Return students for a given class ID, sorted by points (descending).
 * @param {number} classId
 * @returns {import('./data.js').Student[]}
 */
function getTopStudents(classId) {
  return AppData.students
    .filter((s) => s.classId === classId)
    .sort((a, b) => b.points - a.points);
}

// ---------------------------------------------------------------------------
// View renderers
// ---------------------------------------------------------------------------

/**
 * Render the welcome / overview view.
 * @param {Object} teacher
 */
function renderWelcome(teacher) {
  const classes = getTeacherClasses(teacher);
  const videos  = getTeacherVideos(teacher);
  const quizzes = getTeacherQuizzes(teacher);

  const totalStudents = classes.reduce((sum, c) => sum + c.students, 0);

  return `
    <div class="welcome-header animate-fade-in">
      <div class="welcome-hero">
        <div class="welcome-text">
          <h1>Olá, ${teacher.name.split(' ')[0]}! 👋</h1>
          <p class="welcome-subtitle">Bem-vindo(a) de volta ao Lumina. Aqui está um resumo do seu dia.</p>
        </div>
        <div class="welcome-date">
          <span>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card animate-slide-up" style="--delay:0.05s">
          <div class="stat-icon stat-icon--blue">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">${totalStudents}</span>
            <span class="stat-label">Alunos</span>
          </div>
        </div>

        <div class="stat-card animate-slide-up" style="--delay:0.1s">
          <div class="stat-icon stat-icon--purple">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">${classes.length}</span>
            <span class="stat-label">Turmas</span>
          </div>
        </div>

        <div class="stat-card animate-slide-up" style="--delay:0.15s">
          <div class="stat-icon stat-icon--green">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">${videos.length}</span>
            <span class="stat-label">Vídeos</span>
          </div>
        </div>

        <div class="stat-card animate-slide-up" style="--delay:0.2s">
          <div class="stat-icon stat-icon--orange">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">${quizzes.length}</span>
            <span class="stat-label">Quizzes</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section-grid animate-fade-in" style="--delay:0.25s">
      <div class="recent-card">
        <h3 class="section-title">Minhas Turmas</h3>
        <ul class="mini-list">
          ${classes.map((c) => `
            <li class="mini-list-item">
              <span class="mini-badge">${c.grade}</span>
              <span class="mini-name">${c.name}</span>
              <span class="mini-meta">${c.students} alunos · ${c.shift}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="recent-card">
        <h3 class="section-title">Vídeos Recentes</h3>
        ${videos.length === 0
          ? '<p class="empty-state">Nenhum vídeo postado ainda.</p>'
          : `<ul class="mini-list">
              ${videos.slice(0, 3).map((v) => `
                <li class="mini-list-item">
                  <span class="mini-badge mini-badge--green">Vídeo</span>
                  <span class="mini-name">${v.title}</span>
                  <span class="mini-meta">${getClassName(v.classId)} · ${v.duration}</span>
                </li>
              `).join('')}
            </ul>`
        }
      </div>
    </div>
  `;
}

/**
 * Render the classes (turmas) list view.
 * @param {Object} teacher
 */
function renderClasses(teacher) {
  const classes = getTeacherClasses(teacher);

  return `
    <div class="page-header animate-fade-in">
      <h2>Minhas Turmas</h2>
      <p>Visualize e gerencie as turmas atribuídas a você.</p>
    </div>

    <div class="card-grid animate-fade-in">
      ${classes.map((cls) => {
        const topStudents = getTopStudents(cls.id);
        return `
          <div class="class-card">
            <div class="class-card-header">
              <div>
                <h3>${cls.name}</h3>
                <p class="class-meta">${cls.shift} &bull; ${cls.students} alunos</p>
              </div>
              <span class="shift-badge shift-badge--${cls.shift.toLowerCase()}">${cls.shift}</span>
            </div>

            <div class="class-subjects">
              ${cls.subjects.map((s) => `<span class="subject-pill">${s}</span>`).join('')}
            </div>

            <div class="ranking-section">
              <h4>🏆 Ranking de Pontos</h4>
              <ol class="ranking-list">
                ${topStudents.slice(0, 5).map((s, i) => `
                  <li class="ranking-item ${i === 0 ? 'ranking-item--gold' : i === 1 ? 'ranking-item--silver' : i === 2 ? 'ranking-item--bronze' : ''}">
                    <span class="ranking-pos">${i + 1}</span>
                    <span class="ranking-name">${s.name}</span>
                    <span class="ranking-points">${s.points} pts</span>
                  </li>
                `).join('')}
              </ol>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Render the videos view with a "post video" form.
 * @param {Object} teacher
 */
function renderVideos(teacher) {
  const videos = getTeacherVideos(teacher);
  const classes = getTeacherClasses(teacher);

  return `
    <div class="page-header animate-fade-in">
      <h2>Vídeos Didáticos</h2>
      <p>Poste e gerencie vídeos para suas turmas.</p>
    </div>

    <!-- Post new video form -->
    <div class="form-card animate-slide-up">
      <h3 class="form-title">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        Postar Novo Vídeo
      </h3>
      <form id="video-form" class="lumina-form" novalidate>
        <div class="form-row">
          <div class="form-group">
            <label for="video-title">Título do Vídeo <span class="required">*</span></label>
            <input type="text" id="video-title" placeholder="Ex.: Equações do 2º Grau" required maxlength="120" />
          </div>
          <div class="form-group">
            <label for="video-class">Turma <span class="required">*</span></label>
            <select id="video-class" required>
              <option value="">Selecione a turma…</option>
              ${classes.map((c) => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="video-subject">Matéria <span class="required">*</span></label>
            <input type="text" id="video-subject" placeholder="Ex.: Matemática" required maxlength="80" />
          </div>
          <div class="form-group">
            <label for="video-duration">Duração (mm:ss)</label>
            <input type="text" id="video-duration" placeholder="Ex.: 12:34" maxlength="8" pattern="^\\d{1,3}:\\d{2}$" />
          </div>
        </div>

        <div class="form-group">
          <label for="video-url">URL do Vídeo (YouTube embed) <span class="required">*</span></label>
          <input type="url" id="video-url" placeholder="https://www.youtube.com/embed/…" required />
        </div>

        <div class="form-group">
          <label for="video-desc">Descrição</label>
          <textarea id="video-desc" rows="3" placeholder="Descreva o conteúdo do vídeo…" maxlength="500"></textarea>
        </div>

        <div id="video-form-error" class="form-error" hidden></div>
        <button type="submit" class="btn btn--primary">Publicar Vídeo</button>
      </form>
    </div>

    <!-- Videos list -->
    <div class="page-header animate-fade-in" style="margin-top:2rem">
      <h3>Vídeos Publicados (${videos.length})</h3>
    </div>

    <div id="videos-list" class="video-grid animate-fade-in">
      ${videos.length === 0
        ? '<p class="empty-state">Nenhum vídeo postado ainda. Use o formulário acima para começar!</p>'
        : videos.map((v) => renderVideoCard(v)).join('')
      }
    </div>
  `;
}

/**
 * Render a single video card.
 * @param {import('./data.js').Video} v
 */
function renderVideoCard(v) {
  return `
    <div class="video-card" data-id="${v.id}">
      <div class="video-thumb">
        <iframe
          src="${sanitizeUrl(v.url)}"
          title="${escapeHtml(v.title)}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
      <div class="video-info">
        <span class="video-subject-pill">${escapeHtml(v.subject)}</span>
        <h4 class="video-title">${escapeHtml(v.title)}</h4>
        <p class="video-desc">${escapeHtml(v.description)}</p>
        <div class="video-meta">
          <span>📚 ${escapeHtml(getClassName(v.classId))}</span>
          <span>⏱ ${escapeHtml(v.duration)}</span>
          <span>👁 ${v.views} visualizações</span>
          <span>📅 ${formatDate(v.createdAt)}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render the quizzes view.
 * @param {Object} teacher
 */
function renderQuizzes(teacher) {
  const quizzes = getTeacherQuizzes(teacher);
  const classes  = getTeacherClasses(teacher);

  return `
    <div class="page-header animate-fade-in">
      <h2>Quizzes Interativos</h2>
      <p>Crie e gerencie quizzes que atribuem pontos aos seus alunos.</p>
    </div>

    <!-- Create quiz form -->
    <div class="form-card animate-slide-up">
      <h3 class="form-title">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        Criar Novo Quiz
      </h3>
      <form id="quiz-form" class="lumina-form" novalidate>
        <div class="form-row">
          <div class="form-group">
            <label for="quiz-title">Título do Quiz <span class="required">*</span></label>
            <input type="text" id="quiz-title" placeholder="Ex.: Quiz de Frações" required maxlength="120" />
          </div>
          <div class="form-group">
            <label for="quiz-class">Turma <span class="required">*</span></label>
            <select id="quiz-class" required>
              <option value="">Selecione a turma…</option>
              ${classes.map((c) => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="quiz-subject">Matéria <span class="required">*</span></label>
            <input type="text" id="quiz-subject" placeholder="Ex.: Matemática" required maxlength="80" />
          </div>
          <div class="form-group">
            <label for="quiz-desc">Descrição</label>
            <input type="text" id="quiz-desc" placeholder="Breve descrição do quiz…" maxlength="200" />
          </div>
        </div>

        <!-- Questions builder -->
        <div id="questions-builder">
          <div class="questions-header">
            <h4>Perguntas</h4>
            <button type="button" id="add-question-btn" class="btn btn--outline btn--sm">+ Adicionar Pergunta</button>
          </div>
          <div id="questions-list"></div>
        </div>

        <div id="quiz-form-error" class="form-error" hidden></div>
        <button type="submit" class="btn btn--primary" style="margin-top:1rem">Criar Quiz</button>
      </form>
    </div>

    <!-- Existing quizzes -->
    <div class="page-header animate-fade-in" style="margin-top:2rem">
      <h3>Quizzes Criados (${quizzes.length})</h3>
    </div>

    <div id="quizzes-list" class="quiz-grid animate-fade-in">
      ${quizzes.length === 0
        ? '<p class="empty-state">Nenhum quiz criado ainda. Use o formulário acima para começar!</p>'
        : quizzes.map((q) => renderQuizCard(q)).join('')
      }
    </div>
  `;
}

/**
 * Render a single quiz card.
 * @param {import('./data.js').Quiz} q
 */
function renderQuizCard(q) {
  const totalPoints = q.questions.reduce((s, qn) => s + qn.points, 0);
  return `
    <div class="quiz-card ${q.active ? 'quiz-card--active' : ''}" data-id="${q.id}">
      <div class="quiz-card-header">
        <span class="quiz-status-badge ${q.active ? 'badge--active' : 'badge--inactive'}">
          ${q.active ? '● Ativo' : '○ Inativo'}
        </span>
        <button class="btn btn--icon quiz-toggle-btn" data-quiz-id="${q.id}" title="${q.active ? 'Desativar' : 'Ativar'} quiz" aria-label="${q.active ? 'Desativar' : 'Ativar'} quiz">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </button>
      </div>
      <h4 class="quiz-title">${escapeHtml(q.title)}</h4>
      <p class="quiz-desc">${escapeHtml(q.description)}</p>
      <div class="quiz-meta">
        <span>📚 ${escapeHtml(getClassName(q.classId))}</span>
        <span>❓ ${q.questions.length} pergunta${q.questions.length !== 1 ? 's' : ''}</span>
        <span>⭐ ${totalPoints} pts totais</span>
        <span>📅 ${formatDate(q.createdAt)}</span>
      </div>
      <button class="btn btn--outline btn--sm quiz-preview-btn" data-quiz-id="${q.id}">
        Visualizar Quiz
      </button>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Security helpers
// ---------------------------------------------------------------------------

/**
 * Escape HTML special characters to prevent XSS when inserting user content.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Allow only http/https URLs to prevent javascript: injection.
 * @param {string} url
 * @returns {string}
 */
function sanitizeUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.protocol === 'https:' || u.protocol === 'http:') return url;
  } catch {
    // invalid URL
  }
  return '';
}

// ---------------------------------------------------------------------------
// Question builder (quiz form)
// ---------------------------------------------------------------------------

/** Counter for dynamic question indices in the quiz form. */
let questionCount = 0;

/**
 * Add a new blank question block to the quiz form.
 */
function addQuestion() {
  questionCount++;
  const idx = questionCount;
  const container = document.getElementById('questions-list');
  if (!container) return;

  const block = document.createElement('div');
  block.className = 'question-block';
  block.dataset.idx = idx;
  block.innerHTML = `
    <div class="question-block-header">
      <span class="question-block-num">Pergunta ${idx}</span>
      <button type="button" class="btn btn--icon remove-question-btn" data-idx="${idx}" aria-label="Remover pergunta ${idx}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="form-group">
      <label>Enunciado <span class="required">*</span></label>
      <input type="text" class="q-text" placeholder="Ex.: Quanto é 2 + 2?" required maxlength="300" />
    </div>
    <div class="form-group">
      <label>Pontos <span class="required">*</span></label>
      <input type="number" class="q-points" value="10" min="1" max="100" required />
    </div>
    <div class="options-list">
      ${[1,2,3,4].map((n) => `
        <div class="option-row">
          <input type="radio" name="correct-${idx}" value="${n}" id="opt-${idx}-${n}" />
          <label for="opt-${idx}-${n}" class="option-label">
            <input type="text" class="q-opt" data-opt="${n}" placeholder="Opção ${n}" required maxlength="200" />
          </label>
        </div>
      `).join('')}
    </div>
    <p class="option-hint">Selecione o botão ao lado da opção correta.</p>
  `;

  container.appendChild(block);

  // Remove-question handler
  block.querySelector('.remove-question-btn').addEventListener('click', () => {
    block.remove();
  });
}

// ---------------------------------------------------------------------------
// Video form handler
// ---------------------------------------------------------------------------

/**
 * Set up the video posting form submit handler.
 */
function setupVideoForm(teacher) {
  const form = document.getElementById('video-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('video-form-error');

    const title   = form.querySelector('#video-title').value.trim();
    const classId = parseInt(form.querySelector('#video-class').value, 10);
    const subject = form.querySelector('#video-subject').value.trim();
    const url     = form.querySelector('#video-url').value.trim();
    const desc    = form.querySelector('#video-desc').value.trim();
    const dur     = form.querySelector('#video-duration').value.trim();

    if (!title || !classId || !subject || !url) {
      errorEl.textContent = 'Preencha todos os campos obrigatórios (*)';
      errorEl.hidden = false;
      return;
    }

    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) {
      errorEl.textContent = 'URL inválida. Use apenas URLs https:// do YouTube.';
      errorEl.hidden = false;
      return;
    }

    errorEl.hidden = true;

    // Add to the local data store (prototype only)
    const newVideo = {
      id:          AppData.videos.length + 1,
      teacherId:   teacher.id,
      classId,
      title,
      description: desc,
      subject,
      url:         safeUrl,
      duration:    dur || '—',
      createdAt:   new Date().toISOString(),
      views:       0,
    };
    AppData.videos.push(newVideo);

    // Re-render videos list
    const listEl = document.getElementById('videos-list');
    if (listEl) {
      listEl.innerHTML = getTeacherVideos(teacher).map(renderVideoCard).join('');
    }

    // Update count header
    const countEl = listEl && listEl.previousElementSibling;
    if (countEl && countEl.querySelector('h3')) {
      countEl.querySelector('h3').textContent = `Vídeos Publicados (${getTeacherVideos(teacher).length})`;
    }

    form.reset();
    showToast('Vídeo publicado com sucesso!', 'success');
  });
}

// ---------------------------------------------------------------------------
// Quiz form handler
// ---------------------------------------------------------------------------

/**
 * Set up the quiz creation form submit handler.
 */
function setupQuizForm(teacher) {
  const form = document.getElementById('quiz-form');
  if (!form) return;

  const addBtn = document.getElementById('add-question-btn');
  if (addBtn) {
    addBtn.addEventListener('click', addQuestion);
    // Start with one blank question
    addQuestion();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('quiz-form-error');

    const title   = form.querySelector('#quiz-title').value.trim();
    const classId = parseInt(form.querySelector('#quiz-class').value, 10);
    const subject = form.querySelector('#quiz-subject').value.trim();
    const desc    = form.querySelector('#quiz-desc').value.trim();

    if (!title || !classId || !subject) {
      errorEl.textContent = 'Preencha todos os campos obrigatórios (*).';
      errorEl.hidden = false;
      return;
    }

    // Collect questions
    const questionBlocks = form.querySelectorAll('.question-block');
    if (questionBlocks.length === 0) {
      errorEl.textContent = 'Adicione pelo menos uma pergunta ao quiz.';
      errorEl.hidden = false;
      return;
    }

    const questions = [];
    let valid = true;

    questionBlocks.forEach((block) => {
      const text    = block.querySelector('.q-text').value.trim();
      const pts     = parseInt(block.querySelector('.q-points').value, 10);
      const opts    = block.querySelectorAll('.q-opt');
      const correct = block.querySelector('input[type=radio]:checked');

      if (!text || !pts || !correct) {
        valid = false;
        block.classList.add('block-error');
        return;
      }

      block.classList.remove('block-error');

      const options = Array.from(opts).map((o, i) => ({
        text:    o.value.trim() || `Opção ${i + 1}`,
        correct: parseInt(correct.value, 10) - 1 === i,
      }));

      questions.push({ question: text, options, points: pts });
    });

    if (!valid) {
      errorEl.textContent = 'Preencha todas as perguntas, incluindo a opção correta.';
      errorEl.hidden = false;
      return;
    }

    errorEl.hidden = true;

    // Add to local store
    const newQuiz = {
      id:          AppData.quizzes.length + 1,
      teacherId:   teacher.id,
      classId,
      title,
      subject,
      description: desc,
      questions,
      active:      true,
      createdAt:   new Date().toISOString(),
    };
    AppData.quizzes.push(newQuiz);

    // Re-render
    const listEl = document.getElementById('quizzes-list');
    if (listEl) {
      listEl.innerHTML = getTeacherQuizzes(teacher).map(renderQuizCard).join('');
      setupQuizCardHandlers(teacher);
    }
    const countEl = listEl && listEl.previousElementSibling;
    if (countEl && countEl.querySelector('h3')) {
      countEl.querySelector('h3').textContent = `Quizzes Criados (${getTeacherQuizzes(teacher).length})`;
    }

    // Reset form
    form.reset();
    document.getElementById('questions-list').innerHTML = '';
    questionCount = 0;
    addQuestion();

    showToast('Quiz criado com sucesso!', 'success');
  });
}

/**
 * Attach event handlers to quiz card buttons (toggle active, preview).
 * @param {Object} teacher
 */
function setupQuizCardHandlers(teacher) {
  // Toggle active/inactive
  document.querySelectorAll('.quiz-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id   = parseInt(btn.dataset.quizId, 10);
      const quiz = AppData.quizzes.find((q) => q.id === id);
      if (!quiz) return;
      quiz.active = !quiz.active;
      const listEl = document.getElementById('quizzes-list');
      if (listEl) {
        listEl.innerHTML = getTeacherQuizzes(teacher).map(renderQuizCard).join('');
        setupQuizCardHandlers(teacher);
      }
      showToast(`Quiz ${quiz.active ? 'ativado' : 'desativado'}.`, 'info');
    });
  });

  // Preview quiz (modal)
  document.querySelectorAll('.quiz-preview-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id   = parseInt(btn.dataset.quizId, 10);
      const quiz = AppData.quizzes.find((q) => q.id === id);
      if (!quiz) return;
      openQuizPreview(quiz);
    });
  });
}

// ---------------------------------------------------------------------------
// Quiz preview modal
// ---------------------------------------------------------------------------

/**
 * Open a modal showing the quiz with interactive answering.
 * @param {import('./data.js').Quiz} quiz
 */
function openQuizPreview(quiz) {
  // Remove any existing modal
  document.getElementById('quiz-modal')?.remove();

  let currentQ   = 0;
  let score      = 0;
  let answered   = new Array(quiz.questions.length).fill(null);

  const modal = document.createElement('div');
  modal.id        = 'quiz-modal';
  modal.className = 'modal-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modal-quiz-title');

  function renderQuestion() {
    const q   = quiz.questions[currentQ];
    const pct = Math.round(((currentQ + 1) / quiz.questions.length) * 100);

    modal.innerHTML = `
      <div class="modal-box">
        <div class="modal-header">
          <h3 id="modal-quiz-title">${escapeHtml(quiz.title)}</h3>
          <button class="btn btn--icon modal-close-btn" aria-label="Fechar quiz">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="quiz-progress">
          <div class="quiz-progress-bar" style="width:${pct}%"></div>
        </div>
        <p class="quiz-progress-label">Pergunta ${currentQ + 1} de ${quiz.questions.length}</p>

        <div class="quiz-question-block">
          <p class="quiz-q-text">${escapeHtml(q.question)}</p>
          <p class="quiz-q-points">Vale ${q.points} ponto${q.points !== 1 ? 's' : ''}</p>
          <ul class="quiz-options-list">
            ${q.options.map((opt, i) => `
              <li>
                <button class="quiz-opt-btn ${answered[currentQ] !== null ? (opt.correct ? 'opt--correct' : answered[currentQ] === i ? 'opt--wrong' : '') : ''}"
                        data-idx="${i}"
                        ${answered[currentQ] !== null ? 'disabled' : ''}>
                  ${escapeHtml(opt.text)}
                </button>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="modal-footer">
          <span class="quiz-score-label">Pontuação: <strong>${score}</strong> pts</span>
          <div class="modal-nav">
            <button class="btn btn--outline btn--sm" id="prev-q-btn" ${currentQ === 0 ? 'disabled' : ''}>← Anterior</button>
            ${currentQ < quiz.questions.length - 1
              ? `<button class="btn btn--primary btn--sm" id="next-q-btn">Próxima →</button>`
              : `<button class="btn btn--primary btn--sm" id="finish-q-btn">Concluir ✓</button>`
            }
          </div>
        </div>
      </div>
    `;

    // Option selection
    modal.querySelectorAll('.quiz-opt-btn:not([disabled])').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i   = parseInt(btn.dataset.idx, 10);
        const opt = q.options[i];
        answered[currentQ] = i;
        if (opt.correct) score += q.points;
        renderQuestion(); // re-render to show feedback
      });
    });

    // Navigation
    modal.querySelector('#prev-q-btn')?.addEventListener('click', () => {
      currentQ--;
      renderQuestion();
    });
    modal.querySelector('#next-q-btn')?.addEventListener('click', () => {
      currentQ++;
      renderQuestion();
    });
    modal.querySelector('#finish-q-btn')?.addEventListener('click', () => {
      renderResult();
    });

    // Close
    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
  }

  function renderResult() {
    const total = quiz.questions.reduce((s, q) => s + q.points, 0);
    const pct   = Math.round((score / total) * 100);
    modal.innerHTML = `
      <div class="modal-box modal-box--result">
        <div class="modal-header">
          <h3>Resultado do Quiz</h3>
          <button class="btn btn--icon modal-close-btn" aria-label="Fechar resultados">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="result-body">
          <div class="result-circle">
            <span class="result-pct">${pct}%</span>
            <span class="result-label">de acerto</span>
          </div>
          <p class="result-score">Pontuação total: <strong>${score} / ${total}</strong></p>
          <p class="result-msg">${pct >= 70 ? '🎉 Excelente desempenho!' : pct >= 40 ? '👍 Bom esforço, continue praticando!' : '📚 Revise o conteúdo e tente novamente!'}</p>
        </div>
        <button class="btn btn--primary" id="close-result-btn">Fechar</button>
      </div>
    `;
    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modal.querySelector('#close-result-btn').addEventListener('click', closeModal);
  }

  function closeModal() {
    modal.classList.add('modal-hide');
    modal.addEventListener('animationend', () => modal.remove(), { once: true });
  }

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape
  const onKeydown = (e) => {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);

  document.body.appendChild(modal);
  renderQuestion();
  requestAnimationFrame(() => modal.classList.add('modal-show'));
}

// ---------------------------------------------------------------------------
// Toast notifications
// ---------------------------------------------------------------------------

/**
 * Show a brief toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info') {
  const existing = document.getElementById('lumina-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id        = 'lumina-toast';
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast--show'));
  setTimeout(() => {
    toast.classList.remove('toast--show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3000);
}

// ---------------------------------------------------------------------------
// Router / navigation
// ---------------------------------------------------------------------------

const VIEWS = { welcome: renderWelcome, classes: renderClasses, videos: renderVideos, quizzes: renderQuizzes };

/**
 * Navigate to a named view.
 * @param {string}  viewId
 * @param {Object}  teacher
 */
function navigateTo(viewId, teacher) {
  if (!VIEWS[viewId]) viewId = 'welcome';

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach((el) => {
    el.classList.toggle('nav-item--active', el.dataset.view === viewId);
  });

  const content = document.getElementById('main-content');
  if (!content) return;

  // Transition out
  content.classList.add('view-exit');
  setTimeout(() => {
    content.innerHTML = VIEWS[viewId](teacher);
    content.classList.remove('view-exit');
    content.classList.add('view-enter');

    // Wire up any forms / card handlers after render
    if (viewId === 'videos')  setupVideoForm(teacher);
    if (viewId === 'quizzes') { setupQuizForm(teacher); setupQuizCardHandlers(teacher); }

    setTimeout(() => content.classList.remove('view-enter'), 300);
  }, 150);

  // Persist active view
  history.replaceState({}, '', `#${viewId}`);
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Guard: redirect to login if no session
  Auth.requireAuth();

  const teacher = Auth.getCurrentTeacher();

  // Populate teacher info in header
  document.querySelectorAll('[data-teacher-name]').forEach((el) => {
    el.textContent = teacher.name;
  });
  document.querySelectorAll('[data-teacher-subject]').forEach((el) => {
    el.textContent = teacher.subject;
  });
  document.querySelectorAll('[data-teacher-avatar]').forEach((el) => {
    el.textContent = teacher.avatar;
  });

  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach((el) => {
    el.addEventListener('click', () => {
      navigateTo(el.dataset.view, teacher);
      // Close mobile sidebar
      document.getElementById('sidebar')?.classList.remove('sidebar--open');
    });
  });

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar    = document.getElementById('sidebar');
  const overlay    = document.getElementById('sidebar-overlay');

  menuToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('sidebar--open');
    overlay?.classList.toggle('overlay--show');
  });
  overlay?.addEventListener('click', () => {
    sidebar?.classList.remove('sidebar--open');
    overlay?.classList.remove('overlay--show');
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => Auth.logout());

  // Determine initial view from URL hash
  const hashView = location.hash.replace('#', '') || 'welcome';
  navigateTo(hashView, teacher);
});
