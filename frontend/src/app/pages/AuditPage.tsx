import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

type AuditItem = {
  id: string;
  action: string;
  entity: string;
  createdAt: string;
  actor: {
    name: string;
    email: string;
    role: string;
  };
};

export const AuditPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: () => apiFetch<AuditItem[]>('/audit'),
  });

  return (
    <div className="stack">
      <h2>Auditoria de Ações</h2>
      {isLoading ? (
        <p>Carregando logs...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Ator</th>
                <th>Ação</th>
                <th>Entidade</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>
                    {item.actor.name} ({item.actor.role})
                  </td>
                  <td>{item.action}</td>
                  <td>{item.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
