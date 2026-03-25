import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../services/api';
import { useSession } from '../hooks/useSession';

type VideoItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  classId: string;
  progressPercent?: number;
  status?: string;
};

type ClassItem = { id: string; name: string };

export const VideosPage = () => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [classId, setClassId] = useState('');

  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: () => apiFetch<ClassItem[]>('/classes'),
  });

  const videosQuery = useQuery({
    queryKey: ['videos'],
    queryFn: () => apiFetch<VideoItem[]>('/content/videos'),
  });

  const createVideo = useMutation({
    mutationFn: (payload: { title: string; description: string; url: string; classId: string; durationSec: number }) =>
      apiFetch<VideoItem>('/content/videos', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setTitle('');
      setDescription('');
      setUrl('');
    },
  });

  const markView = useMutation({
    mutationFn: (videoId: string) =>
      apiFetch(`/content/videos/${videoId}/view`, {
        method: 'POST',
        body: JSON.stringify({ progressPercent: 100, lastPositionSeconds: 999 }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos'] }),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title || !description || !url || !classId) return;
    createVideo.mutate({ title, description, url, classId, durationSec: 600 });
  };

  const canCreate = user?.role === 'COORDINATION' || user?.role === 'ADMIN' || user?.role === 'TEACHER';

  return (
    <div className="stack">
      <h2>{user?.role === 'STUDENT' ? 'Vídeos da Turma' : 'Gestão de Vídeos'}</h2>

      {canCreate && (
        <form className="inline-form" onSubmit={onSubmit}>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" aria-label="Título do vídeo" />
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição" aria-label="Descrição do vídeo" />
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="URL" aria-label="URL do vídeo" />
          <select value={classId} onChange={(event) => setClassId(event.target.value)} aria-label="Turma do vídeo">
            <option value="">Selecione turma</option>
            {(classesQuery.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <button type="submit" className="primary-btn" disabled={createVideo.isPending}>
            Publicar vídeo
          </button>
        </form>
      )}

      <div className="grid-2">
        {(videosQuery.data ?? []).map((video) => (
          <article key={video.id} className="card">
            <h3>{video.title}</h3>
            <p>{video.description}</p>
            {user?.role === 'STUDENT' ? (
              <>
                <p className="muted">Status: {video.status ?? 'not_started'}</p>
                <p className="muted">Progresso: {video.progressPercent ?? 0}%</p>
                <button className="primary-btn" type="button" onClick={() => markView.mutate(video.id)}>
                  Marcar como assistido
                </button>
              </>
            ) : (
              <p className="muted">Turma: {video.classId}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};
