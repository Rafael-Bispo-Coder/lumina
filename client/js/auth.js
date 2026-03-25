const auth = (() => {
  const TOKEN_KEY = 'lumina_token';
  const USER_KEY = 'lumina_user';

  async function login(email, password, role) {
    const data = await api.post('/auth/login', { email, password, role });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  }

  async function logout() {
    try { await api.post('/auth/logout', {}); } catch {}
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = 'index.html';
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  }

  function isLoggedIn() {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  function requireAuth() {
    if (!isLoggedIn()) window.location.href = 'index.html';
  }

  function requireRole(...roles) {
    const user = getUser();
    if (!user || !roles.includes(user.role)) window.location.href = 'index.html';
  }

  return { login, logout, getUser, isLoggedIn, requireAuth, requireRole };
})();
