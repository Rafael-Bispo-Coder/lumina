import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RoleHomePage } from './pages/RoleHomePage';
import { UsersPage } from './pages/UsersPage';
import { ClassesPage } from './pages/ClassesPage';
import { VideosPage } from './pages/VideosPage';
import { QuizzesPage } from './pages/QuizzesPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditPage } from './pages/AuditPage';
import { StudentHistoryPage } from './pages/StudentHistoryPage';

export const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route element={<ProtectedRoute roles={['COORDINATION', 'ADMIN', 'TEACHER', 'STUDENT']} />}>
      <Route element={<AppLayout />}>
        <Route path="/coordenacao" element={<RoleHomePage />} />
        <Route path="/coordenacao/usuarios" element={<UsersPage />} />
        <Route path="/coordenacao/turmas" element={<ClassesPage />} />
        <Route path="/coordenacao/conteudos" element={<VideosPage />} />
        <Route path="/coordenacao/relatorios" element={<ReportsPage />} />
        <Route path="/coordenacao/auditoria" element={<AuditPage />} />

        <Route path="/professor" element={<RoleHomePage />} />
        <Route path="/professor/turmas" element={<ClassesPage />} />
        <Route path="/professor/videos" element={<VideosPage />} />
        <Route path="/professor/quizzes" element={<QuizzesPage />} />
        <Route path="/professor/relatorios" element={<ReportsPage />} />

        <Route path="/aluno" element={<RoleHomePage />} />
        <Route path="/aluno/turmas" element={<ClassesPage />} />
        <Route path="/aluno/videos" element={<VideosPage />} />
        <Route path="/aluno/quizzes" element={<QuizzesPage />} />
        <Route path="/aluno/historico" element={<StudentHistoryPage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);
