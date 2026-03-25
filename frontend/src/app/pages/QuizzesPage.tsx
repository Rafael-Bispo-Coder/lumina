import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../services/api';
import { useSession } from '../hooks/useSession';

type QuizItem = {
  id: string;
  title: string;
  description: string;
  classId: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  statusLabel?: string;
  score?: number;
};

type ClassItem = { id: string; name: string };

const defaultQuestions = [
  { id: '1', text: 'Pergunta 1', options: ['A', 'B'], answerIndex: 0 },
  { id: '2', text: 'Pergunta 2', options: ['A', 'B'], answerIndex: 1 },
];

export const QuizzesPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');

  const classesQuery = useQuery({ queryKey: ['classes'], queryFn: () => apiFetch<ClassItem[]>('/classes') });
  const quizzesQuery = useQuery({ queryKey: ['quizzes'], queryFn: () => apiFetch<QuizItem[]>('/content/quizzes') });

  const createQuiz = useMutation({
    mutationFn: () =>
      apiFetch('/content/quizzes', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          classId,
          maxScore: 10,
          status: 'ACTIVE',
          questions: defaultQuestions,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      setTitle('');
      setDescription('');
    },
  });

  const startAttempt = useMutation({
    mutationFn: (quizId: string) => apiFetch(`/content/quizzes/${quizId}/attempt/start`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quizzes'] }),
  });

  const submitAttempt = useMutation({
    mutationFn: (quizId: string) =>
      apiFetch(`/content/quizzes/${quizId}/attempt/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: [0, 1] }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quizzes'] }),
  });

  const canCreate = user?.role === 'COORDINATION' || user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title || !description || !classId) return;
    createQuiz.mutate();
  };

  return (
    <div className="stack">
      <h2>{user?.role === 'STUDENT' ? 'Quizzes Disponíveis' : 'Gestão de Quizzes'}</h2>

      {canCreate && (
        <form className="inline-form" onSubmit={onSubmit}>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" aria-label="Título do quiz" />
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição" aria-label="Descrição do quiz" />
          <select value={classId} onChange={(event) => setClassId(event.target.value)} aria-label="Turma do quiz">
            <option value="">Selecione turma</option>
            {(classesQuery.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <button type="submit" className="primary-btn" disabled={createQuiz.isPending}>
            Publicar quiz
          </button>
        </form>
      )}

      <div className="grid-2">
        {(quizzesQuery.data ?? []).map((quiz) => (
          <article key={quiz.id} className="card">
            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>
            <p className="muted">Status: {quiz.statusLabel ?? quiz.status}</p>
            {user?.role === 'STUDENT' ? (
              <div className="row-actions">
                <button type="button" className="secondary-btn" onClick={() => startAttempt.mutate(quiz.id)}>
                  Iniciar
                </button>
                <button type="button" className="primary-btn" onClick={() => submitAttempt.mutate(quiz.id)}>
                  Enviar
                </button>
              </div>
            ) : (
              <p className="muted">Turma: {quiz.classId}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};
