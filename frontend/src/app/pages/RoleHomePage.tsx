import { useQuery } from '@tanstack/react-query';
import { KpiGrid } from '../components/KpiGrid';
import { apiFetch } from '../services/api';
import { useSession } from '../hooks/useSession';

type Kpis = {
  classesCount: number;
  videosCount: number;
  quizzesCount: number;
  studentsCount: number;
};

export const RoleHomePage = () => {
  const { user } = useSession();
  const { data, isLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: () => apiFetch<Kpis>('/reports/kpis'),
  });

  if (!user) return null;

  return (
    <div className="stack">
      <header>
        <h2>Dashboard {user.role === 'COORDINATION' || user.role === 'ADMIN' ? 'Coordenação' : user.role === 'TEACHER' ? 'Professor' : 'Aluno'}</h2>
        <p className="muted">Indicadores centrais do seu perfil.</p>
      </header>

      {isLoading || !data ? (
        <p>Carregando KPIs...</p>
      ) : (
        <KpiGrid
          data={[
            { label: 'Turmas', value: data.classesCount },
            { label: 'Vídeos', value: data.videosCount },
            { label: 'Quizzes', value: data.quizzesCount },
            { label: 'Alunos', value: data.studentsCount },
          ]}
        />
      )}
    </div>
  );
};
