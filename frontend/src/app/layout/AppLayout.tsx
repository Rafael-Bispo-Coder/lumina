import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { apiFetch } from '../services/api';

const menuByRole: Record<string, Array<{ to: string; label: string }>> = {
  COORDINATION: [
    { to: '/coordenacao', label: 'Dashboard' },
    { to: '/coordenacao/usuarios', label: 'Usuários' },
    { to: '/coordenacao/turmas', label: 'Turmas' },
    { to: '/coordenacao/conteudos', label: 'Conteúdos' },
    { to: '/coordenacao/relatorios', label: 'Relatórios' },
    { to: '/coordenacao/auditoria', label: 'Auditoria' },
  ],
  TEACHER: [
    { to: '/professor', label: 'Dashboard' },
    { to: '/professor/turmas', label: 'Minhas Turmas' },
    { to: '/professor/videos', label: 'Vídeos' },
    { to: '/professor/quizzes', label: 'Quizzes' },
    { to: '/professor/relatorios', label: 'Engajamento' },
  ],
  STUDENT: [
    { to: '/aluno', label: 'Dashboard' },
    { to: '/aluno/turmas', label: 'Minhas Turmas' },
    { to: '/aluno/videos', label: 'Vídeos' },
    { to: '/aluno/quizzes', label: 'Quizzes' },
    { to: '/aluno/historico', label: 'Histórico' },
  ],
  ADMIN: [{ to: '/coordenacao', label: 'Dashboard' }],
};

export const AppLayout = () => {
  const { user, refreshToken, clear } = useSession();
  const navigate = useNavigate();

  if (!user) return null;

  const menu = menuByRole[user.role] ?? [];

  const handleLogout = async () => {
    if (refreshToken) {
      try {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // ignore logout failure
      }
    }

    clear();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegação principal">
        <div className="brand">Lumina</div>
        <nav>
          {menu.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="welcome">Olá, {user.name}</p>
            <small>{user.role}</small>
          </div>
          <button type="button" className="logout-btn" onClick={handleLogout} aria-label="Sair do sistema">
            Sair
          </button>
        </header>
        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};
