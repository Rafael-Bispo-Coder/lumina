import { prisma } from '../lib/prisma.js';

export const roleMap = {
  professor: 'TEACHER',
  aluno: 'STUDENT',
  coordenacao: 'COORDINATION',
  admin: 'ADMIN',
};

export const canManageClass = async (userId, role, classId) => {
  if (role === 'COORDINATION' || role === 'ADMIN') return true;
  if (role === 'TEACHER') {
    const found = await prisma.class.findFirst({ where: { id: classId, teacherId: userId }, select: { id: true } });
    return Boolean(found);
  }
  return false;
};

export const canAccessClassAsStudent = async (userId, classId) => {
  const enrollment = await prisma.classStudent.findFirst({
    where: { classId, studentId: userId },
    select: { id: true },
  });
  return Boolean(enrollment);
};
