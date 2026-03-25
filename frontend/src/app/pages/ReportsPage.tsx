import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

type VideoItem = { id: string; title: string; classId: string };
type QuizItem = { id: string; title: string; classId: string };
type StudentStatus = {
  studentId: string;
  studentName: string;
  watchedAt?: string | null;
  progressPercent?: number;
  attemptedAt?: string | null;
  score?: number | null;
  status?: string;
};

export const ReportsPage = () => {
  const [selectedVideo, setSelectedVideo] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('');

  const videosQuery = useQuery({ queryKey: ['videos'], queryFn: () => apiFetch<VideoItem[]>('/content/videos') });
  const quizzesQuery = useQuery({ queryKey: ['quizzes'], queryFn: () => apiFetch<QuizItem[]>('/content/quizzes') });

  const videoEngagementQuery = useQuery({
    queryKey: ['video-engagement', selectedVideo],
    queryFn: () => apiFetch<{ watched: StudentStatus[]; notWatched: StudentStatus[] }>(`/reports/engagement/videos/${selectedVideo}`),
    enabled: Boolean(selectedVideo),
  });

  const quizEngagementQuery = useQuery({
    queryKey: ['quiz-engagement', selectedQuiz],
    queryFn: () => apiFetch<{ done: StudentStatus[]; notDone: StudentStatus[] }>(`/reports/engagement/quizzes/${selectedQuiz}`),
    enabled: Boolean(selectedQuiz),
  });

  const watched = useMemo(() => videoEngagementQuery.data?.watched ?? [], [videoEngagementQuery.data]);
  const notWatched = useMemo(() => videoEngagementQuery.data?.notWatched ?? [], [videoEngagementQuery.data]);
  const done = useMemo(() => quizEngagementQuery.data?.done ?? [], [quizEngagementQuery.data]);
  const notDone = useMemo(() => quizEngagementQuery.data?.notDone ?? [], [quizEngagementQuery.data]);

  return (
    <div className="stack">
      <h2>Relatórios de Engajamento</h2>

      <div className="filters">
        <label>
          Vídeo
          <select value={selectedVideo} onChange={(event) => setSelectedVideo(event.target.value)} aria-label="Selecionar vídeo para relatório">
            <option value="">Selecione um vídeo</option>
            {(videosQuery.data ?? []).map((video) => (
              <option key={video.id} value={video.id}>
                {video.title}
              </option>
            ))}
          </select>
        </label>

        <label>
          Quiz
          <select value={selectedQuiz} onChange={(event) => setSelectedQuiz(event.target.value)} aria-label="Selecionar quiz para relatório">
            <option value="">Selecione um quiz</option>
            {(quizzesQuery.data ?? []).map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-2">
        <article className="card">
          <h3>Viram o vídeo</h3>
          <ul>
            {watched.map((item) => (
              <li key={item.studentId}>
                {item.studentName} — {item.progressPercent ?? 0}% — {item.watchedAt ? new Date(item.watchedAt).toLocaleString() : '-'}
              </li>
            ))}
          </ul>
          <h4>Não viram o vídeo</h4>
          <ul>
            {notWatched.map((item) => (
              <li key={item.studentId}>{item.studentName}</li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h3>Fizeram o quiz</h3>
          <ul>
            {done.map((item) => (
              <li key={item.studentId}>
                {item.studentName} — Nota: {item.score ?? 0} — {item.attemptedAt ? new Date(item.attemptedAt).toLocaleString() : '-'}
              </li>
            ))}
          </ul>
          <h4>Não fizeram o quiz</h4>
          <ul>
            {notDone.map((item) => (
              <li key={item.studentId}>{item.studentName}</li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
};
