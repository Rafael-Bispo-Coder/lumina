import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

type QuizItem = {
  id: string;
  title: string;
  score?: number;
  statusLabel?: string;
};

export const StudentHistoryPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['student-history'],
    queryFn: () => apiFetch<QuizItem[]>('/content/quizzes'),
  });

  return (
    <div className="stack">
      <h2>Histórico de Pontuação</h2>
      {isLoading ? (
        <p>Carregando histórico...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Quiz</th>
                <th>Status</th>
                <th>Pontuação</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.statusLabel ?? 'not_started'}</td>
                  <td>{item.score ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
