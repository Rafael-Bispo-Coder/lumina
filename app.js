(() => {
  const LOGIN_USERS = [
    { username: 'ana.silva', password: 'senha123', name: 'Ana' },
    { username: 'carlos.mendes', password: 'senha456', name: 'Carlos' }
  ];

  const TURMAS_FIXAS = [
    {
      id: '7A',
      nome: '7º Ano A',
      turno: 'Manhã',
      alunos: 30,
      materias: ['Matemática', 'História', 'Ciências'],
      ranking: [
        { nome: 'Julia Costa', pontos: 980 },
        { nome: 'Mateus Lima', pontos: 940 },
        { nome: 'Sofia Rocha', pontos: 900 },
        { nome: 'Heitor Alves', pontos: 860 }
      ],
      estudantes: ['Julia Costa', 'Mateus Lima', 'Sofia Rocha', 'Heitor Alves', 'Laura Mendes']
    },
    {
      id: '8B',
      nome: '8º Ano B',
      turno: 'Tarde',
      alunos: 28,
      materias: ['Português', 'Geografia', 'Inglês'],
      ranking: [
        { nome: 'Bruno Neri', pontos: 970 },
        { nome: 'Livia Ramos', pontos: 935 },
        { nome: 'Diego Sales', pontos: 888 },
        { nome: 'Amanda Luz', pontos: 850 }
      ],
      estudantes: ['Bruno Neri', 'Livia Ramos', 'Diego Sales', 'Amanda Luz', 'Nina Castro']
    },
    {
      id: '9C',
      nome: '9º Ano C',
      turno: 'Integral',
      alunos: 32,
      materias: ['Física', 'Química', 'Redação'],
      ranking: [
        { nome: 'Caio Nunes', pontos: 995 },
        { nome: 'Vitor Sena', pontos: 960 },
        { nome: 'Sara Pinheiro', pontos: 918 },
        { nome: 'Clara Maia', pontos: 882 }
      ],
      estudantes: ['Caio Nunes', 'Vitor Sena', 'Sara Pinheiro', 'Clara Maia', 'Otávio Melo']
    }
  ];

  const VIDEOS_INICIAIS = [
    {
      id: crypto.randomUUID(),
      titulo: 'Introdução às Equações',
      turma: '7A',
      materia: 'Matemática',
      duracao: '12:30',
      url: 'https://exemplo.com/video/equacoes',
      descricao: 'Conceitos iniciais e exercícios práticos.',
      views: {}
    },
    {
      id: crypto.randomUUID(),
      titulo: 'Mapa do Brasil e Regiões',
      turma: '8B',
      materia: 'Geografia',
      duracao: '09:40',
      url: 'https://exemplo.com/video/mapa-brasil',
      descricao: 'Revisão completa das regiões brasileiras.',
      views: {}
    },
    {
      id: crypto.randomUUID(),
      titulo: 'Balanceamento Químico',
      turma: '9C',
      materia: 'Química',
      duracao: '15:10',
      url: 'https://exemplo.com/video/balanceamento',
      descricao: 'Método prático para balancear reações.',
      views: {}
    }
  ];

  const QUIZZES_INICIAIS = [
    {
      id: crypto.randomUUID(),
      titulo: 'Quiz de Matemática Básica',
      turma: '7A',
      materia: 'Matemática',
      perguntas: [
        {
          enunciado: 'Quanto é 12 + 7?',
          alternativas: ['17', '18', '19', '20'],
          correta: '19',
          pontos: 10
        }
      ]
    },
    {
      id: crypto.randomUUID(),
      titulo: 'Quiz de Geografia',
      turma: '8B',
      materia: 'Geografia',
      perguntas: [
        {
          enunciado: 'Qual é a capital de Minas Gerais?',
          alternativas: ['Belo Horizonte', 'Curitiba', 'Vitória', 'Salvador'],
          correta: 'Belo Horizonte',
          pontos: 10
        }
      ]
    }
  ];

  const state = {
    user: null,
    videos: [],
    quizzes: [],
    currentView: 'dashboard'
  };

  const els = {
    loginScreen: document.getElementById('login-screen'),
    appShell: document.getElementById('app-shell'),
    loginForm: document.getElementById('login-form'),
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    loginError: document.getElementById('login-error'),
    loginCard: document.getElementById('login-card'),
    togglePassword: document.getElementById('toggle-password'),
    menu: document.getElementById('menu'),
    viewContainer: document.getElementById('view-container'),
    viewTitle: document.getElementById('view-title'),
    teacherPill: document.getElementById('teacher-pill'),
    logoutBtn: document.getElementById('logout-btn'),
    toast: document.getElementById('toast')
  };

  const storageKeys = {
    session: 'luminaSession',
    videos: 'luminaVideos',
    quizzes: 'luminaQuizzes'
  };

  function init() {
    bootstrapData();
    bindEvents();

    const savedSession = JSON.parse(localStorage.getItem(storageKeys.session) || 'null');
    if (savedSession) {
      state.user = savedSession;
      showApp();
      renderView('dashboard');
    } else {
      showLogin();
    }
  }

  function bootstrapData() {
    const savedVideos = JSON.parse(localStorage.getItem(storageKeys.videos) || 'null');
    const savedQuizzes = JSON.parse(localStorage.getItem(storageKeys.quizzes) || 'null');

    state.videos = Array.isArray(savedVideos) ? savedVideos : VIDEOS_INICIAIS;
    state.quizzes = Array.isArray(savedQuizzes) ? savedQuizzes : QUIZZES_INICIAIS;

    persistData();
  }

  function persistData() {
    localStorage.setItem(storageKeys.videos, JSON.stringify(state.videos));
    localStorage.setItem(storageKeys.quizzes, JSON.stringify(state.quizzes));
  }

  function bindEvents() {
    els.loginForm.addEventListener('submit', onLoginSubmit);
    els.togglePassword.addEventListener('click', togglePasswordVisibility);
    els.menu.addEventListener('click', onMenuClick);
    els.logoutBtn.addEventListener('click', logout);

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.matches('[data-action="save-video"]')) {
        onCreateVideo();
      }

      if (target.matches('[data-action="save-quiz"]')) {
        onCreateQuiz();
      }

      if (target.matches('[data-action="add-question"]')) {
        addQuestionForm();
      }

      if (target.matches('[data-action="remove-question"]')) {
        target.closest('.question-card')?.remove();
      }

      if (target.matches('[data-action="set-view-status"]')) {
        const videoId = target.getAttribute('data-video-id');
        const student = target.getAttribute('data-student');
        const status = target.getAttribute('data-status');
        if (videoId && student && status) {
          setStudentViewStatus(videoId, student, status);
        }
      }
    });
  }

  function togglePasswordVisibility() {
    const isPassword = els.password.type === 'password';
    els.password.type = isPassword ? 'text' : 'password';
    els.togglePassword.textContent = isPassword ? 'Ocultar' : 'Mostrar';
  }

  function onLoginSubmit(event) {
    event.preventDefault();
    const username = els.username.value.trim();
    const password = els.password.value.trim();

    const found = LOGIN_USERS.find((user) => user.username === username && user.password === password);

    if (!found) {
      els.loginError.textContent = 'Credenciais inválidas. Tente novamente.';
      els.loginCard.classList.remove('error-shake');
      void els.loginCard.offsetWidth;
      els.loginCard.classList.add('error-shake');
      return;
    }

    state.user = { username: found.username, name: found.name };
    localStorage.setItem(storageKeys.session, JSON.stringify(state.user));
    els.loginForm.reset();
    els.loginError.textContent = '';
    showApp();
    renderView('dashboard');
    showToast(`Login realizado com sucesso, ${found.name}.`);
  }

  function showLogin() {
    els.loginScreen.classList.remove('hidden');
    els.appShell.classList.add('hidden');
  }

  function showApp() {
    els.loginScreen.classList.add('hidden');
    els.appShell.classList.remove('hidden');
    els.teacherPill.textContent = `Professor(a): ${state.user?.name || ''}`;
  }

  function logout() {
    localStorage.removeItem(storageKeys.session);
    state.user = null;
    showLogin();
    showToast('Sessão encerrada.');
  }

  function onMenuClick(event) {
    const btn = event.target.closest('.menu-item');
    if (!btn) return;

    const view = btn.getAttribute('data-view');
    if (!view) return;

    renderView(view);
  }

  function setActiveMenu(view) {
    els.menu.querySelectorAll('.menu-item').forEach((item) => {
      item.classList.toggle('active', item.getAttribute('data-view') === view);
    });
  }

  function renderView(view) {
    state.currentView = view;
    setActiveMenu(view);

    const titles = {
      dashboard: 'Dashboard',
      turmas: 'Turmas',
      videos: 'Vídeos',
      quizzes: 'Quizzes'
    };

    els.viewTitle.textContent = titles[view] || 'Lumina';

    const htmlByView = {
      dashboard: renderDashboard(),
      turmas: renderTurmas(),
      videos: renderVideos(),
      quizzes: renderQuizzes()
    };

    els.viewContainer.classList.remove('fade-in');
    void els.viewContainer.offsetWidth;
    els.viewContainer.classList.add('fade-in');
    els.viewContainer.innerHTML = htmlByView[view] || '<p>Tela não encontrada.</p>';
  }

  function renderDashboard() {
    const qtdAlunos = TURMAS_FIXAS.reduce((sum, turma) => sum + turma.alunos, 0);
    const qtdTurmas = TURMAS_FIXAS.length;
    const qtdVideos = state.videos.length;
    const qtdQuizzes = state.quizzes.length;

    return `
      <section class="grid" style="gap:16px">
        <div class="card">
          <h3 class="section-title">Olá, ${state.user?.name || 'Professor'} 👋</h3>
          <p class="muted">Aqui está um resumo rápido da sua plataforma hoje.</p>
        </div>

        <div class="grid kpi-grid">
          <article class="card kpi-card"><h3>Alunos</h3><p>${qtdAlunos}</p></article>
          <article class="card kpi-card"><h3>Turmas</h3><p>${qtdTurmas}</p></article>
          <article class="card kpi-card"><h3>Vídeos</h3><p>${qtdVideos}</p></article>
          <article class="card kpi-card"><h3>Quizzes</h3><p>${qtdQuizzes}</p></article>
        </div>

        <div class="grid" style="grid-template-columns:2fr 1fr; gap:14px;">
          <article class="card">
            <h3 class="section-title">Minhas Turmas</h3>
            <div class="list">
              ${TURMAS_FIXAS.map(
                (turma) => `
                  <div class="list-item">
                    <strong>${turma.nome}</strong>
                    <span class="muted">${turma.alunos} alunos • ${turma.turno}</span>
                  </div>`
              ).join('')}
            </div>
          </article>

          <article class="card">
            <h3 class="section-title">Vídeos Recentes</h3>
            <div class="list">
              ${state.videos
                .slice(-3)
                .reverse()
                .map(
                  (video) => `
                  <div class="list-item">
                    <span>${video.titulo}</span>
                    <span class="muted">${video.duracao}</span>
                  </div>
              `
                )
                .join('')}
            </div>
          </article>
        </div>
      </section>
    `;
  }

  function renderTurmas() {
    return `
      <section class="grid" style="gap:14px">
        <div class="grid class-grid">
          ${TURMAS_FIXAS.map(
            (turma) => `
            <article class="card">
              <h3 class="section-title">${turma.nome}</h3>
              <p class="muted">Turno: ${turma.turno}</p>
              <p class="muted">Alunos: ${turma.alunos}</p>
              <p class="muted">Matérias: ${turma.materias.join(', ')}</p>
            </article>
          `
          ).join('')}
        </div>

        <article class="card">
          <h3 class="section-title">Ranking de alunos (destaques)</h3>
          <div class="grid" style="grid-template-columns:repeat(3, minmax(200px,1fr)); gap:10px;">
            ${TURMAS_FIXAS.map(
              (turma) => `
              <div>
                <h4 style="margin:0 0 8px">${turma.nome}</h4>
                <div class="list">
                  ${turma.ranking
                    .map(
                      (aluno, idx) => `
                    <div class="rank-item ${idx === 0 ? 'top1' : idx === 1 ? 'top2' : idx === 2 ? 'top3' : ''}">
                      <span>${idx + 1}º ${aluno.nome}</span>
                      <strong>${aluno.pontos} pts</strong>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
            ).join('')}
          </div>
        </article>
      </section>
    `;
  }

  function renderVideos() {
    return `
      <section class="grid" style="gap:14px">
        <article class="card">
          <h3 class="section-title">Criar vídeo</h3>
          <div class="form-grid" id="video-form">
            <div>
              <label class="small" for="video-titulo">Título</label>
              <input id="video-titulo" placeholder="Ex: Revolução Francesa" />
            </div>
            <div>
              <label class="small" for="video-turma">Turma</label>
              <select id="video-turma">
                ${TURMAS_FIXAS.map((t) => `<option value="${t.id}">${t.nome}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="small" for="video-materia">Matéria</label>
              <input id="video-materia" placeholder="História" />
            </div>
            <div>
              <label class="small" for="video-duracao">Duração</label>
              <input id="video-duracao" placeholder="10:30" />
            </div>
            <div class="full">
              <label class="small" for="video-url">URL</label>
              <input id="video-url" placeholder="https://..." />
            </div>
            <div class="full">
              <label class="small" for="video-desc">Descrição</label>
              <textarea id="video-desc" placeholder="Resumo do conteúdo..."></textarea>
            </div>
            <div class="full">
              <button class="submit-btn" data-action="save-video">Adicionar vídeo</button>
            </div>
          </div>
        </article>

        <article class="card">
          <h3 class="section-title">Vídeos cadastrados</h3>
          <div class="grid" style="gap:12px">
            ${state.videos
              .map((video) => {
                const turma = TURMAS_FIXAS.find((t) => t.id === video.turma);
                const estudantes = turma?.estudantes || [];
                const assistiram = estudantes.filter((nome) => video.views?.[nome] === 'assistiu').length;
                const porcentagem = estudantes.length ? Math.round((assistiram / estudantes.length) * 100) : 0;

                return `
                  <div class="card" style="padding:12px">
                    <div style="display:flex; justify-content:space-between; gap:8px; flex-wrap:wrap;">
                      <strong>${video.titulo}</strong>
                      <span class="muted">${video.materia} • ${video.duracao}</span>
                    </div>
                    <p class="muted" style="margin:6px 0 10px">${video.descricao}</p>
                    <a href="${video.url}" target="_blank" rel="noopener noreferrer">Abrir vídeo</a>
                    <p class="muted" style="margin:10px 0 6px">${turma?.nome || ''} — progresso da turma: ${porcentagem}%</p>
                    <div class="progress"><span style="width:${porcentagem}%"></span></div>

                    <div class="grid" style="margin-top:10px; gap:8px;">
                      ${estudantes
                        .map((aluno) => {
                          const status = video.views?.[aluno] || 'nao-assistiu';
                          return `
                            <div class="student-line">
                              <span>${aluno}</span>
                              <div class="student-actions">
                                <span class="badge ${status === 'assistiu' ? 'success' : 'danger'}">
                                  ${status === 'assistiu' ? 'Assistiu' : 'Não assistiu'}
                                </span>
                                <button
                                  class="small-btn ${status === 'assistiu' ? 'active success' : ''}"
                                  data-action="set-view-status"
                                  data-video-id="${video.id}"
                                  data-student="${aluno}"
                                  data-status="assistiu"
                                >Assistiu</button>
                                <button
                                  class="small-btn ${status !== 'assistiu' ? 'active danger' : ''}"
                                  data-action="set-view-status"
                                  data-video-id="${video.id}"
                                  data-student="${aluno}"
                                  data-status="nao-assistiu"
                                >Não assistiu</button>
                              </div>
                            </div>
                          `;
                        })
                        .join('')}
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </article>
      </section>
    `;
  }

  function onCreateVideo() {
    const titulo = getValue('video-titulo');
    const turma = getValue('video-turma');
    const materia = getValue('video-materia');
    const duracao = getValue('video-duracao');
    const url = getValue('video-url');
    const descricao = getValue('video-desc');

    if (!titulo || !turma || !materia || !duracao || !url || !descricao) {
      showToast('Preencha todos os campos para criar o vídeo.');
      return;
    }

    state.videos.unshift({
      id: crypto.randomUUID(),
      titulo,
      turma,
      materia,
      duracao,
      url,
      descricao,
      views: {}
    });

    persistData();
    renderView('videos');
    showToast('Vídeo criado com sucesso.');
  }

  function setStudentViewStatus(videoId, student, status) {
    const video = state.videos.find((item) => item.id === videoId);
    if (!video) return;

    if (!video.views) video.views = {};
    video.views[student] = status;
    persistData();
    renderView('videos');
  }

  function renderQuizzes() {
    return `
      <section class="grid" style="gap:14px">
        <article class="card">
          <h3 class="section-title">Criar quiz</h3>
          <div class="form-grid" id="quiz-form">
            <div>
              <label class="small" for="quiz-titulo">Título</label>
              <input id="quiz-titulo" placeholder="Quiz de revisão" />
            </div>
            <div>
              <label class="small" for="quiz-turma">Turma</label>
              <select id="quiz-turma">
                ${TURMAS_FIXAS.map((t) => `<option value="${t.id}">${t.nome}</option>`).join('')}
              </select>
            </div>
            <div class="full">
              <label class="small" for="quiz-materia">Matéria</label>
              <input id="quiz-materia" placeholder="Ciências" />
            </div>

            <div class="full" id="questions-wrap">
              ${renderQuestionForm(1)}
            </div>

            <div class="full" style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="small-btn" data-action="add-question">+ Adicionar pergunta</button>
              <button class="submit-btn" data-action="save-quiz">Salvar quiz</button>
            </div>
          </div>
        </article>

        <article class="card">
          <h3 class="section-title">Quizzes criados</h3>
          <div class="grid quiz-grid">
            ${state.quizzes
              .map(
                (quiz) => `
              <article class="card" style="padding:12px">
                <h4 style="margin:0 0 8px">${quiz.titulo}</h4>
                <p class="muted" style="margin:0 0 6px">Turma: ${resolveTurmaNome(quiz.turma)}</p>
                <p class="muted" style="margin:0 0 6px">Matéria: ${quiz.materia}</p>
                <p class="muted" style="margin:0">Perguntas: ${quiz.perguntas.length}</p>
              </article>
            `
              )
              .join('')}
          </div>
        </article>
      </section>
    `;
  }

  function renderQuestionForm(index) {
    return `
      <div class="question-card" data-question-index="${index}">
        <strong>Pergunta ${index}</strong>
        <div class="form-grid" style="margin-top:8px;">
          <div class="full">
            <label class="small">Enunciado</label>
            <input data-q="enunciado" placeholder="Digite o enunciado" />
          </div>
          <div>
            <label class="small">Alternativa A</label>
            <input data-q="altA" placeholder="Opção A" />
          </div>
          <div>
            <label class="small">Alternativa B</label>
            <input data-q="altB" placeholder="Opção B" />
          </div>
          <div>
            <label class="small">Alternativa C</label>
            <input data-q="altC" placeholder="Opção C" />
          </div>
          <div>
            <label class="small">Alternativa D</label>
            <input data-q="altD" placeholder="Opção D" />
          </div>
          <div>
            <label class="small">Resposta correta</label>
            <select data-q="correta">
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
          <div>
            <label class="small">Pontuação</label>
            <input data-q="pontos" type="number" min="1" value="10" />
          </div>
          <div class="full" style="display:flex; justify-content:flex-end;">
            <button class="small-btn" data-action="remove-question">Remover</button>
          </div>
        </div>
      </div>
    `;
  }

  function addQuestionForm() {
    const wrap = document.getElementById('questions-wrap');
    if (!wrap) return;

    const nextIndex = wrap.querySelectorAll('.question-card').length + 1;
    wrap.insertAdjacentHTML('beforeend', renderQuestionForm(nextIndex));
  }

  function onCreateQuiz() {
    const titulo = getValue('quiz-titulo');
    const turma = getValue('quiz-turma');
    const materia = getValue('quiz-materia');

    if (!titulo || !turma || !materia) {
      showToast('Preencha título, turma e matéria do quiz.');
      return;
    }

    const cards = Array.from(document.querySelectorAll('.question-card'));
    if (!cards.length) {
      showToast('Adicione ao menos uma pergunta.');
      return;
    }

    const perguntas = cards
      .map((card) => {
        const enunciado = card.querySelector('[data-q="enunciado"]')?.value.trim();
        const altA = card.querySelector('[data-q="altA"]')?.value.trim();
        const altB = card.querySelector('[data-q="altB"]')?.value.trim();
        const altC = card.querySelector('[data-q="altC"]')?.value.trim();
        const altD = card.querySelector('[data-q="altD"]')?.value.trim();
        const correta = card.querySelector('[data-q="correta"]')?.value;
        const pontos = Number(card.querySelector('[data-q="pontos"]')?.value || 0);

        if (!enunciado || !altA || !altB || !altC || !altD || !correta || !pontos) {
          return null;
        }

        const alternativas = [altA, altB, altC, altD];
        const corretaTexto = alternativas['ABCD'.indexOf(correta)] || altA;

        return {
          enunciado,
          alternativas,
          correta: corretaTexto,
          pontos
        };
      })
      .filter(Boolean);

    if (!perguntas.length) {
      showToast('Complete os campos de pelo menos uma pergunta válida.');
      return;
    }

    state.quizzes.unshift({
      id: crypto.randomUUID(),
      titulo,
      turma,
      materia,
      perguntas
    });

    persistData();
    renderView('quizzes');
    showToast('Quiz criado com sucesso.');
  }

  function resolveTurmaNome(id) {
    return TURMAS_FIXAS.find((turma) => turma.id === id)?.nome || id;
  }

  function getValue(id) {
    const input = document.getElementById(id);
    return input ? input.value.trim() : '';
  }

  let toastTimer;
  function showToast(text) {
    els.toast.textContent = text;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.remove('show');
    }, 2200);
  }

  init();
})();
