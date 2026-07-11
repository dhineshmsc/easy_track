export const priorityColor = (p) => ({
  Critical: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  High:     { bg: '#fff7ed', color: '#ea580c', border: '#fdba74' },
  Medium:   { bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
  Low:      { bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
}[p] || { bg: '#f8fafc', color: '#64748b', border: '#cbd5e1' });

export const statusColor = (s) => ({
  'To Do':       { bg: '#f1f5f9', color: '#475569' },
  'In Progress': { bg: '#eff6ff', color: '#2563eb' },
  'Done':        { bg: '#f0fdf4', color: '#16a34a' },
}[s] || { bg: '#f1f5f9', color: '#64748b' });

export const getUserInitials = (userId, users = []) => {
  const u = users.find(u => (u._id || u.user_id) === userId);
  if (!u) return '?';
  return u.name ? u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
};

export const getAvatarColor = (str) => {
  const colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};
