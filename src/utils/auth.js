// Cookie-based auth helpers

const COOKIE_NAME = 'easy_track_session';

/**
 * Set auth cookie with user session data (expires in 7 days)
 */
export const setAuthCookie = (data) => {
  const session = JSON.stringify({
    username: data.name || '',
    user_id: data.user_id || '',
    token: data.token || '',
    company: data.company || 'default'
  });
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(session)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

/**
 * Get auth session from cookie. Returns null if not found/invalid.
 */
export const getAuthCookie = () => {
  const cookies = document.cookie.split(';');
  for (let c of cookies) {
    const [key, ...vals] = c.trim().split('=');
    if (key === COOKIE_NAME) {
      try {
        return JSON.parse(decodeURIComponent(vals.join('=')));
      } catch {
        return null;
      }
    }
  }
  return null;
};

/**
 * Clear auth cookie and localStorage on logout
 */
export const clearAuthCookie = () => {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  localStorage.removeItem('username');
  localStorage.removeItem('token');
  localStorage.removeItem('user_id');
};

/**
 * Returns true if user has a valid auth cookie
 */
export const isAuthenticated = () => {
  const session = getAuthCookie();
  return !!(session && session.token);
};
