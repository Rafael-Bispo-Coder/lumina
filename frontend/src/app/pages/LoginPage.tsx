import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useSession } from '../hooks/useSession';
import type { Profile, SessionData } from '../types/auth';

const profileOptions: Array<{ key: Profile; label: string; hint: string }> = [
  { key: 'professor', label: 'Professor', hint: 'Acesse suas turmas, vídeos e quizzes.' },
  { key: 'aluno', label: 'Aluno', hint: 'Veja conteúdos e faça avaliações da sua turma.' },
  { key: 'coordenacao', label: 'Coordenação', hint: 'Gerencie usuários, turmas, conteúdos e relatórios.' },
];

const routeByRole: Record<string, string> = {
  COORDINATION: '/coordenacao',
  ADMIN: '/coordenacao',
  TEACHER: '/professor',
  STUDENT: '/aluno',
};

export const LoginPage = () => {
  const [profile, setProfile] = useState<Profile>('professor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setSession } = useSession();

  const selectedHint = useMemo(() => profileOptions.find((option) => option.key === profile)?.hint ?? '', [profile]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const session = await apiFetch<SessionData>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ profile, email, password }),
      });
      setSession(session);
      navigate(routeByRole[session.user.role] ?? '/login', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-card" aria-label="Login da plataforma Lumina">
        <h1>Lumina</h1>
        <p>Plataforma educacional multi-perfil.</p>

        <div className="profile-tabs" role="tablist" aria-label="Selecionar perfil de login">
          {profileOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={profile === option.key}
              className={profile === option.key ? 'tab active' : 'tab'}
              onClick={() => setProfile(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="profile-hint">{selectedHint}</p>

        <form onSubmit={onSubmit} className="login-form">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

          <label htmlFor="password">Senha</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />

          {error ? <div className="error-box">{error}</div> : null}

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </div>
  );
};
