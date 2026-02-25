// Simple toast notification utility
function ensureContainer() {
  const id = 'toastContainer';
  let c = document.getElementById(id);
  if (c) return c;
  c = document.createElement('div');
  c.id = id;
  c.className = 'fixed top-4 right-4 flex flex-col gap-2 items-end';
  c.style.zIndex = '9999';
  document.body.appendChild(c);
  return c;
}

export function showToast(message, { duration = 3000, type = 'success' } = {}) {
  const container = ensureContainer();
  const t = document.createElement('div');
  t.className = 'px-4 py-2 rounded shadow-md text-white';
  t.style.background = type === 'error' ? '#ef4444' : '#16a34a';
  t.style.opacity = '0';
  t.style.transform = 'translateY(-6px)';
  t.style.transition = 'opacity .2s ease, transform .2s ease';
  t.textContent = message;
  container.appendChild(t);

  // animate in
  requestAnimationFrame(() => {
    t.style.opacity = '1';
    t.style.transform = 'translateY(0)';
  });

  // remove after timeout
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(-6px)';
    setTimeout(() => t.remove(), 200);
  }, duration);
}

export default { showToast };
