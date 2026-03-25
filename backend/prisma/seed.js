import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';

const prisma = new PrismaClient();

const videoQuestions = [
  {
    id: 'q1',
    text: 'Qual é a principal função da fotossíntese?',
    options: ['Produzir ATP', 'Gerar glicose e oxigênio', 'Converter glicose em CO2', 'Liberar nitrogênio'],
    answerIndex: 1,
  },
  {
    id: 'q2',
    text: 'Onde ocorre a fase clara?',
    options: ['Mitocôndria', 'Citoplasma', 'Tilacóides', 'Núcleo'],
    answerIndex: 2,
  },
];

async function main() {
  await prisma.refreshToken.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.videoView.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.video.deleteMany();
  await prisma.classStudent.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  const coordination = await prisma.user.create({
    data: {
      name: 'Clara Coordenação',
      email: 'coordenacao@lumina.local',
      role: 'COORDINATION',
      passwordHash: await hashPassword('Coord123!'),
    },
  });

  const teacher = await prisma.user.create({
    data: {
      name: 'Paulo Professor',
      email: 'professor@lumina.local',
      role: 'TEACHER',
      passwordHash: await hashPassword('Prof123!'),
    },
  });

  const studentA = await prisma.user.create({
    data: {
      name: 'Ana Aluna',
      email: 'aluno1@lumina.local',
      role: 'STUDENT',
      passwordHash: await hashPassword('Aluno123!'),
    },
  });

  const studentB = await prisma.user.create({
    data: {
      name: 'Bruno Aluno',
      email: 'aluno2@lumina.local',
      role: 'STUDENT',
      passwordHash: await hashPassword('Aluno123!'),
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Interno',
      email: 'admin@lumina.local',
      role: 'ADMIN',
      passwordHash: await hashPassword('Admin123!'),
    },
  });

  const classA = await prisma.class.create({
    data: {
      name: 'Turma 9A',
      subject: 'Ciências',
      period: 'Manhã',
      teacherId: teacher.id,
    },
  });

  await prisma.classStudent.createMany({
    data: [
      { classId: classA.id, studentId: studentA.id },
      { classId: classA.id, studentId: studentB.id },
    ],
  });

  const video = await prisma.video.create({
    data: {
      title: 'Introdução à Fotossíntese',
      description: 'Conceitos iniciais e etapas do processo.',
      url: 'https://example.com/video/fotossintese',
      durationSec: 600,
      classId: classA.id,
      createdById: teacher.id,
    },
  });

  const quiz = await prisma.quiz.create({
    data: {
      title: 'Quiz Fotossíntese',
      description: 'Avaliação rápida sobre o conteúdo da aula.',
      classId: classA.id,
      status: 'ACTIVE',
      maxScore: 10,
      questions: JSON.stringify(videoQuestions),
      createdById: teacher.id,
    },
  });

  await prisma.videoView.create({
    data: {
      videoId: video.id,
      studentId: studentA.id,
      watched: true,
      watchedAt: new Date(),
      progressPercent: 95,
      lastPositionSeconds: 590,
    },
  });

  await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      studentId: studentA.id,
      startedAt: new Date(Date.now() - 1000 * 60 * 10),
      finishedAt: new Date(),
      score: 8,
      maxScore: 10,
      status: 'SUBMITTED',
      answers: JSON.stringify([1, 2]),
    },
  });

  await prisma.activityLog.createMany({
    data: [
      {
        actorId: coordination.id,
        actorRole: 'COORDINATION',
        action: 'SEED_BOOTSTRAP',
        entity: 'System',
        metadata: JSON.stringify({ note: 'Dados iniciais criados' }),
      },
      {
        actorId: admin.id,
        actorRole: 'ADMIN',
        action: 'SEED_CHECK',
        entity: 'System',
        metadata: JSON.stringify({ note: 'Validação inicial' }),
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
