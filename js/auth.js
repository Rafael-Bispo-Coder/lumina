/**
 * auth.js - Lumina authentication simulation
 *
 * Simulates teacher login using local data only.
 * In production, replace with a real authentication API call
 * and secure session management (JWT, httpOnly cookies, etc.).
 *
 * @module auth
 */

'use strict';

/** Session storage key used to persist the logged-in teacher. */
const SESSION_KEY = 'lumina_session';

const Auth = (() => {
  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Persist the authenticated teacher to sessionStorage.
   * @param {import('./data.js').Teacher} teacher
   */
  function _saveSession(teacher) {
    // Never store the password in the session – strip it out.
    const sessionData = { ...teacher, password: undefined };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Attempt to log in with the given credentials.
   *
   * @param {string} username
   * @param {string} password
   * @returns {{ success: boolean, teacher?: Object, error?: string }}
   */
  function login(username, password) {
    if (!username || !password) {
      return { success: false, error: 'Preencha todos os campos.' };
    }

    const teacher = AppData.teachers.find(
      (t) => t.username === username.trim() && t.password === password
    );

    if (!teacher) {
      return { success: false, error: 'Usuário ou senha inválidos.' };
    }

    _saveSession(teacher);
    return { success: true, teacher };
  }

  /**
   * Log out the current teacher and clear the session.
   */
  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  }

  /**
   * Retrieve the currently logged-in teacher from sessionStorage.
   *
   * @returns {Object|null} Teacher object (without password) or null.
   */
  function getCurrentTeacher() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Guard function – redirect to the login page if no session is found.
   * Call this at the top of every protected page.
   */
  function requireAuth() {
    if (!getCurrentTeacher()) {
      window.location.href = 'index.html';
    }
  }

  return { login, logout, getCurrentTeacher, requireAuth };
})();
