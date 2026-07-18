export const priorityColor = (p) => ({
  Critical: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  High:     { bg: '#fff7ed', color: '#ea580c', border: '#fdba74' },
  Medium:   { bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
  Low:      { bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
}[p] || { bg: '#f8fafc', color: '#64748b', border: '#cbd5e1' });

export const statusColor = (s) => {
  const statusMap = {
    // Existing/Task statuses
    'To Do':       { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
    'Todo':        { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
    'In Progress': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    'Code Review': { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
    'Testing':     { bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
    'Deploy':      { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
    'Done':        { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    
    // New Project/Story statuses
    'Not Started': { bg: '#f8fafc', color: '#64748b', border: '#cbd5e1' },
    'Planning':    { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
    'Developing':  { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
    'On Hold':     { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
    'Closed':      { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' },
    'Cancelled':   { bg: '#fef2f2', color: '#b91c1c', border: '#fca5a5' }
  };
  return statusMap[s] || statusMap[s?.trim()] || { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
};

export const getUserInitials = (userId, users = []) => {
  const u = users.find(u => (u._id || u.user_id) === userId);
  if (!u) return '?';
  return u.name ? u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
};

export const getAvatarColor = (str) => {
  const colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
  const normalized = (str || '').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};
