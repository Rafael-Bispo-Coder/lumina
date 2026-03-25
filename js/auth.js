/**
 * auth.js - Lumina authentication simulation
 *
 * Supports three roles: teacher, student, coordination.
 * In production, replace with a real authentication API call
 * and secure session management (JWT, httpOnly cookies, etc.).
 *
 * @module auth
 */

'use strict';

/** Session storage keys per role. */
const SESSION_KEYS = {
  teacher:     'lumina_teacher',
  student:     'lumina_student',
  coordination: 'lumina_coord',
};

/** Dashboard URLs per role. */
const ROLE_DASHBOARDS = {
  teacher:     'dashboard.html',
  student:     'student-dashboard.html',
  coordination: 'coordination.html',
};

const Auth = (() => {
  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  function _saveSession(role, user) {
    // Never store the password in the session.
    const { password, ...sessionData } = user; // eslint-disable-line no-unused-vars
    sessionStorage.setItem(SESSION_KEYS[role], JSON.stringify(sessionData));
  }

  function _getSession(role) {
    const key = SESSION_KEYS[role];
    if (!key) return null;
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  // ---------------------------------------------------------------------------
  // Role-specific login helpers
  // ---------------------------------------------------------------------------

  function loginTeacher(username, password) {
    if (!username || !password) {
      return { success: false, error: 'Preencha todos os campos.' };
    }
    const teacher = AppData.teachers.find(
      (t) => t.username === username.trim() && t.password === password
    );
    if (!teacher) {
      return { success: false, error: 'Usuário ou senha inválidos.' };
    }
    _saveSession('teacher', teacher);
    return { success: true, user: teacher };
  }

  function loginStudent(username, password) {
    if (!username || !password) {
      return { success: false, error: 'Preencha todos os campos.' };
    }
    const student = AppData.students.find(
      (s) => s.username === username.trim() && s.password === password
    );
    if (!student) {
      return { success: false, error: 'Usuário ou senha inválidos.' };
    }
    if (student.status !== 'active') {
      return { success: false, error: 'Cadastro pendente ou inativo. Contacte a coordenação.' };
    }
    _saveSession('student', student);
    return { success: true, user: student };
  }

  function loginCoord(username, password) {
    if (!username || !password) {
      return { success: false, error: 'Preencha todos os campos.' };
    }
    const coord = AppData.coordination.find(
      (c) => c.username === username.trim() && c.password === password
    );
    if (!coord) {
      return { success: false, error: 'Usuário ou senha inválidos.' };
    }
    _saveSession('coordination', coord);
    return { success: true, user: coord };
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Unified login dispatcher.
   * @param {string} username
   * @param {string} password
   * @param {string} [role='teacher'] - 'teacher' | 'student' | 'coordination'
   */
  function login(username, password, role) {
    role = role || 'teacher';
    if (role === 'student')      return loginStudent(username, password);
    if (role === 'coordination') return loginCoord(username, password);
    return loginTeacher(username, password);
  }

  /**
   * Log out the user for the given role and redirect to login page.
   * @param {string} [role='teacher']
   */
  function logout(role) {
    role = role || 'teacher';
    const key = SESSION_KEYS[role];
    if (key) sessionStorage.removeItem(key);
    window.location.href = 'index.html';
  }

  /**
   * Get current user for a given role.
   * @param {string} [role='teacher']
   * @returns {Object|null}
   */
  function getCurrentUser(role) {
    return _getSession(role || 'teacher');
  }

  /** Backward-compat alias for getCurrentUser('teacher'). */
  function getCurrentTeacher() {
    return _getSession('teacher');
  }

  /**
   * Guard function – redirect to login if no session for the given role.
   * If redirectIfRole is provided and a session for that role exists, redirect
   * to that role's dashboard instead.
   *
   * @param {string} [role='teacher']
   * @param {string} [redirectIfRole]
   */
  function requireAuth(role, redirectIfRole) {
    role = role || 'teacher';
    if (redirectIfRole && _getSession(redirectIfRole)) {
      window.location.replace(ROLE_DASHBOARDS[redirectIfRole] || 'index.html');
      return;
    }
    if (!_getSession(role)) {
      window.location.href = 'index.html';
    }
  }

  return {
    loginTeacher,
    loginStudent,
    loginCoord,
    login,
    logout,
    getCurrentUser,
    getCurrentTeacher,
    requireAuth,
  };
})();
