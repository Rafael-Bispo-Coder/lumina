import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import type { Role } from '../types/auth';

interface ProtectedRouteProps {
  roles?: Role[];
}

export const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useSession();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'STUDENT' ? '/aluno' : user.role === 'TEACHER' ? '/professor' : '/coordenacao'} replace />;
  }

  return <Outlet />;
};
