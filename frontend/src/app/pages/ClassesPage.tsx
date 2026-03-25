import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../services/api';
import { useSession } from '../hooks/useSession';

type ClassItem = {
  id: string;
  name: string;
  subject: string;
  period: string;
  teacherId?: string | null;
};

export const ClassesPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [period, setPeriod] = useState('');

  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: () => apiFetch<ClassItem[]>('/classes'),
  });

  const createClass = useMutation({
    mutationFn: (payload: { name: string; subject: string; period: string }) =>
      apiFetch<ClassItem>('/classes', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setName('');
      setSubject('');
      setPeriod('');
    },
  });

  const onCreate = (event: FormEvent) => {
    event.preventDefault();
    if (!name || !subject || !period) return;
    createClass.mutate({ name, subject, period });
  };

  return (
    <div className="stack">
      <header>
        <h2>{user?.role === 'STUDENT' ? 'Minhas Turmas' : 'Gestão de Turmas'}</h2>
      </header>

      {(user?.role === 'COORDINATION' || user?.role === 'ADMIN') && (
        <form className="inline-form" onSubmit={onCreate}>
          <input placeholder="Nome da turma" value={name} onChange={(event) => setName(event.target.value)} aria-label="Nome da turma" />
          <input placeholder="Matéria" value={subject} onChange={(event) => setSubject(event.target.value)} aria-label="Matéria" />
          <input placeholder="Período" value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Período" />
          <button type="submit" className="primary-btn" disabled={createClass.isPending}>
            Criar turma
          </button>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Turma</th>
              <th>Matéria</th>
              <th>Período</th>
            </tr>
          </thead>
          <tbody>
            {(classesQuery.data ?? []).map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.subject}</td>
                <td>{item.period}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
