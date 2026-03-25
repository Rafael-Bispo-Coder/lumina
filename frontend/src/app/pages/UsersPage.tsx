import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TEACHER');

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<UserItem[]>('/users'),
  });

  const createUser = useMutation({
    mutationFn: (payload: { name: string; email: string; password: string; role: string }) =>
      apiFetch<UserItem>('/users', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setName('');
      setEmail('');
      setPassword('');
    },
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name || !email || !password) return;
    createUser.mutate({ name, email, password, role });
  };

  return (
    <div className="stack">
      <h2>Gestão de Usuários</h2>
      <form className="inline-form" onSubmit={onSubmit}>
        <input placeholder="Nome" value={name} onChange={(event) => setName(event.target.value)} aria-label="Nome do usuário" />
        <input placeholder="E-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Email do usuário" />
        <input placeholder="Senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} aria-label="Senha do usuário" />
        <select value={role} onChange={(event) => setRole(event.target.value)} aria-label="Perfil do usuário">
          <option value="TEACHER">Professor</option>
          <option value="STUDENT">Aluno</option>
          <option value="COORDINATION">Coordenação</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit" className="primary-btn" disabled={createUser.isPending}>
          Criar usuário
        </button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(usersQuery.data ?? []).map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.active ? 'Ativo' : 'Inativo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
