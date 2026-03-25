/**
 * data.js - Lumina prototype mock data
 *
 * This module contains all static sample data used to simulate
 * the application flow without a real backend. Replace these
 * arrays with API calls when integrating a real backend.
 *
 * @module data
 */

'use strict';

// ---------------------------------------------------------------------------
// Teachers
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Teacher
 * @property {number}   id        - Unique teacher identifier
 * @property {string}   username  - Login username
 * @property {string}   password  - Plain-text password (prototype only – hash in production)
 * @property {string}   name      - Display name
 * @property {string}   email     - E-mail address
 * @property {string}   avatar    - Initials used for the avatar badge
 * @property {string}   subject   - Primary subject
 * @property {number[]} classIds  - IDs of classes assigned to this teacher
 */

/** @type {Teacher[]} */
/**
 * WARNING: Passwords are stored as plain text here for prototype purposes ONLY.
 * In production, NEVER store or compare plain-text passwords.
 * Use a secure hashing algorithm (e.g., bcrypt) on the server side.
 */
const TEACHERS = [
  {
    id: 1,
    username: 'ana.silva',
    password: 'senha123',
    name: 'Ana Silva',
    email: 'ana.silva@escola.edu.br',
    avatar: 'AS',
    subject: 'Matemática',
    classIds: [1, 2, 3],
  },
  {
    id: 2,
    username: 'carlos.mendes',
    password: 'senha456',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@escola.edu.br',
    avatar: 'CM',
    subject: 'Física',
    classIds: [2, 4],
  },
  {
    id: 3,
    username: 'beatriz.costa',
    password: 'senha789',
    name: 'Beatriz Costa',
    email: 'beatriz.costa@escola.edu.br',
    avatar: 'BC',
    subject: 'Língua Portuguesa',
    classIds: [1, 3, 5],
  },
];

// ---------------------------------------------------------------------------
// Classes (Turmas)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} SchoolClass
 * @property {number}   id       - Unique class identifier
 * @property {string}   name     - Class name (e.g. "7º Ano A")
 * @property {string}   grade    - School grade
 * @property {string}   shift    - "Manhã" | "Tarde" | "Noite"
 * @property {number}   students - Number of students enrolled
 * @property {string[]} subjects - Subjects taught in this class
 */

/** @type {SchoolClass[]} */
const CLASSES = [
  { id: 1, name: '7º Ano A', grade: '7º Ano', shift: 'Manhã',  students: 30, subjects: ['Matemática', 'Língua Portuguesa'] },
  { id: 2, name: '8º Ano B', grade: '8º Ano', shift: 'Tarde',  students: 28, subjects: ['Matemática', 'Física'] },
  { id: 3, name: '9º Ano C', grade: '9º Ano', shift: 'Manhã',  students: 32, subjects: ['Matemática', 'Língua Portuguesa'] },
  { id: 4, name: '1º EM A',  grade: '1º EM',  shift: 'Noite',  students: 35, subjects: ['Física'] },
  { id: 5, name: '2º EM B',  grade: '2º EM',  shift: 'Tarde',  students: 27, subjects: ['Língua Portuguesa'] },
];

// ---------------------------------------------------------------------------
// Students (Alunos)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Student
 * @property {number}  id       - Unique student identifier
 * @property {string}  name     - Student full name
 * @property {number}  classId  - Class the student belongs to
 * @property {number}  points   - Accumulated quiz points
 */

/** @type {Student[]} */
const STUDENTS = [
  { id: 1,  name: 'Lucas Almeida',      username: 'aluno.lucas',     password: 'aluno123', classId: 1, points: 120, enrollmentYear: 2026, status: 'active' },
  { id: 2,  name: 'Marina Souza',       username: 'aluno.marina',    password: 'aluno123', classId: 1, points: 95,  enrollmentYear: 2026, status: 'active' },
  { id: 3,  name: 'Pedro Oliveira',     username: 'aluno.pedro',     password: 'aluno123', classId: 1, points: 140, enrollmentYear: 2026, status: 'active' },
  { id: 4,  name: 'Fernanda Lima',      username: 'aluno.fernanda',  password: 'aluno123', classId: 2, points: 80,  enrollmentYear: 2026, status: 'active' },
  { id: 5,  name: 'Rafael Santos',      username: 'aluno.rafael',    password: 'aluno123', classId: 2, points: 110, enrollmentYear: 2026, status: 'active' },
  { id: 6,  name: 'Juliana Ferreira',   username: 'aluno.juliana',   password: 'aluno123', classId: 2, points: 75,  enrollmentYear: 2026, status: 'active' },
  { id: 7,  name: 'Gabriel Costa',      username: 'aluno.gabriel',   password: 'aluno123', classId: 3, points: 160, enrollmentYear: 2026, status: 'active' },
  { id: 8,  name: 'Isabela Rodrigues',  username: 'aluno.isabela',   password: 'aluno123', classId: 3, points: 130, enrollmentYear: 2026, status: 'active' },
  { id: 9,  name: 'Thiago Carvalho',    username: 'aluno.thiago',    password: 'aluno123', classId: 4, points: 50,  enrollmentYear: 2026, status: 'active' },
  { id: 10, name: 'Camila Martins',     username: 'aluno.camila',    password: 'aluno123', classId: 4, points: 90,  enrollmentYear: 2026, status: 'active' },
  { id: 11, name: 'Diego Nascimento',   username: 'aluno.diego',     password: 'aluno123', classId: 5, points: 70,  enrollmentYear: 2026, status: 'active' },
  { id: 12, name: 'Larissa Barbosa',    username: 'aluno.larissa',   password: 'aluno123', classId: 5, points: 115, enrollmentYear: 2026, status: 'active' },
];

// ---------------------------------------------------------------------------
// Videos
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Video
 * @property {number}   id          - Unique video identifier
 * @property {number}   teacherId   - ID of the teacher who posted the video
 * @property {number}   classId     - Target class ID
 * @property {string}   title       - Video title
 * @property {string}   description - Short description
 * @property {string}   subject     - Related subject
 * @property {string}   url         - Embed URL (YouTube or placeholder)
 * @property {string}   duration    - Duration string (e.g. "12:34")
 * @property {string}   createdAt   - ISO date string
 * @property {number}   views       - View count
 */

/** @type {Video[]} */
const VIDEOS = [
  {
    id: 1,
    teacherId: 1,
    classId: 1,
    title: 'Introdução às Equações do 1º Grau',
    description: 'Aprenda a resolver equações simples de primeiro grau com exemplos práticos do cotidiano.',
    subject: 'Matemática',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '14:32',
    createdAt: '2025-03-01T09:00:00Z',
    views: 45,
  },
  {
    id: 2,
    teacherId: 1,
    classId: 2,
    title: 'Geometria Plana – Área e Perímetro',
    description: 'Revisão completa sobre cálculo de área e perímetro das principais figuras planas.',
    subject: 'Matemática',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '18:07',
    createdAt: '2025-03-05T10:30:00Z',
    views: 38,
  },
  {
    id: 3,
    teacherId: 1,
    classId: 3,
    title: 'Sistemas de Equações',
    description: 'Métodos de substituição e adição para resolver sistemas lineares.',
    subject: 'Matemática',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '22:15',
    createdAt: '2025-03-10T08:00:00Z',
    views: 52,
  },
];

// ---------------------------------------------------------------------------
// Quizzes
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} QuizOption
 * @property {string}  text      - Option text
 * @property {boolean} correct   - Whether this is the correct answer
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {string}       question - Question text
 * @property {QuizOption[]} options  - Answer options
 * @property {number}       points   - Points awarded for a correct answer
 */

/**
 * @typedef {Object} Quiz
 * @property {number}          id          - Unique quiz identifier
 * @property {number}          teacherId   - ID of the teacher who created the quiz
 * @property {number}          classId     - Target class ID
 * @property {string}          title       - Quiz title
 * @property {string}          subject     - Related subject
 * @property {string}          description - Short description
 * @property {QuizQuestion[]}  questions   - Array of questions
 * @property {string}          createdAt   - ISO date string
 * @property {boolean}         active      - Whether the quiz is currently active
 */

/** @type {Quiz[]} */
const QUIZZES = [
  {
    id: 1,
    teacherId: 1,
    classId: 1,
    title: 'Quiz: Equações do 1º Grau',
    subject: 'Matemática',
    description: 'Teste seus conhecimentos sobre equações do primeiro grau.',
    active: true,
    createdAt: '2025-03-08T10:00:00Z',
    questions: [
      {
        question: 'Qual é o valor de x em: 2x + 4 = 10?',
        options: [
          { text: 'x = 2', correct: false },
          { text: 'x = 3', correct: true  },
          { text: 'x = 4', correct: false },
          { text: 'x = 5', correct: false },
        ],
        points: 10,
      },
      {
        question: 'Resolva: 5x – 15 = 0. O valor de x é:',
        options: [
          { text: 'x = 2', correct: false },
          { text: 'x = 5', correct: false },
          { text: 'x = 3', correct: true  },
          { text: 'x = 1', correct: false },
        ],
        points: 10,
      },
      {
        question: 'Se 3x = 9, então x vale:',
        options: [
          { text: 'x = 1', correct: false },
          { text: 'x = 3', correct: true  },
          { text: 'x = 6', correct: false },
          { text: 'x = 9', correct: false },
        ],
        points: 10,
      },
    ],
  },
  {
    id: 2,
    teacherId: 1,
    classId: 2,
    title: 'Quiz: Geometria Plana',
    subject: 'Matemática',
    description: 'Perguntas sobre área e perímetro de figuras planas.',
    active: false,
    createdAt: '2025-03-12T14:00:00Z',
    questions: [
      {
        question: 'Qual é a área de um retângulo de base 5 m e altura 3 m?',
        options: [
          { text: '8 m²',  correct: false },
          { text: '15 m²', correct: true  },
          { text: '16 m²', correct: false },
          { text: '12 m²', correct: false },
        ],
        points: 15,
      },
      {
        question: 'O perímetro de um quadrado com lado 4 cm é:',
        options: [
          { text: '8 cm',  correct: false },
          { text: '12 cm', correct: false },
          { text: '16 cm', correct: true  },
          { text: '20 cm', correct: false },
        ],
        points: 15,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Coordination
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} CoordUser
 * @property {number} id       - Unique identifier
 * @property {string} username - Login username
 * @property {string} password - Plain-text password (prototype only)
 * @property {string} name     - Display name
 * @property {string} email    - E-mail address
 * @property {string} avatar   - Initials used for the avatar badge
 * @property {string} role     - Always 'coordination'
 */

/** @type {CoordUser[]} */
const COORDINATION = [
  { id: 1, username: 'coord', password: 'coord123', name: 'Coordenação Geral', email: 'coord@escola.edu.br', avatar: 'CG', role: 'coordination' },
];

// ---------------------------------------------------------------------------
// Exports (available globally in non-module scripts)
// ---------------------------------------------------------------------------

/**
 * Central data store – all prototype data lives here.
 * In production, replace with real API calls.
 */
const AppData = {
  teachers:     TEACHERS,
  classes:      CLASSES,
  students:     STUDENTS,
  videos:       VIDEOS,
  quizzes:      QUIZZES,
  coordination: COORDINATION,
  currentYear:  2026,
};
