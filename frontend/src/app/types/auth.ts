export type Profile = 'professor' | 'aluno' | 'coordenacao';

export type Role = 'COORDINATION' | 'TEACHER' | 'STUDENT' | 'ADMIN';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active?: boolean;
}

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}
