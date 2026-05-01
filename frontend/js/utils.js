// Shared utility functions

const api = {
  async get(url) {
    const res = await fetch(url, { credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },
  async post(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },
  async put(url, body) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },
  async delete(url) {
    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },
  async postForm(url, formData) {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }
};

function toast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const icons = { success: 'OK', error: 'X', info: '!' };

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = '0.3s ease';
    setTimeout(() => el.remove(), 300);
  }, 4000);
}

function createToastContainer() {
  const div = document.createElement('div');
  div.id = 'toast-container';
  document.body.appendChild(div);
  return div;
}

function showModal(html, onClose) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  document.body.appendChild(overlay);

  const closeModal = () => {
    overlay.remove();
    if (onClose) onClose();
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  overlay.querySelector('.modal-close')?.addEventListener('click', closeModal);

  return { overlay, close: closeModal };
}

async function requireLogin() {
  try {
    const user = await api.get('/api/auth/me');
    return user;
  } catch {
    window.location.href = '/login';
    return null;
  }
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') document.body.classList.add('light-mode');
}

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Copied to clipboard!', 'success');
  } catch {
    toast('Failed to copy.', 'error');
  }
}

function formatCoins(amount) {
  return `${Number(amount).toLocaleString()} credits`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function playBidSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.debug('Bid sound unavailable', e);
  }
}

function playSoldSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch (e) {
    console.debug('Sold sound unavailable', e);
  }
}

async function buildNavbar(user) {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const isWarLeader = user.role === 'war_leader';
  const navLinks = isWarLeader
    ? `
        <a href="/guild-war" class="btn btn-ghost btn-sm">Guild War</a>
        <div class="nav-user">
          <div class="nav-avatar">${user.avatar || 'R'}</div>
          <span class="d-none-sm">${user.name}</span>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="logout()">Logout</button>
      `
    : `
        <a href="/dashboard" class="btn btn-ghost btn-sm">Home</a>
        <a href="/guild-war" class="btn btn-ghost btn-sm">Guild War</a>
        <a href="/history" class="btn btn-ghost btn-sm">League Logs</a>
        <button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme"></button>
        <div class="nav-user">
          <div class="nav-avatar">${user.avatar || 'R'}</div>
          <span class="d-none-sm">${user.name}</span>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="logout()">Logout</button>
      `;

  nav.innerHTML = `
    <div class="nav-inner">
      <a href="/dashboard" class="nav-logo">RYUX <span>ESPORTS</span></a>
      <div class="nav-links">
        ${navLinks}
      </div>
    </div>
  `;
}

async function logout() {
  try {
    await api.post('/api/auth/logout', {});
    window.location.href = '/login';
  } catch {
    window.location.href = '/login';
  }
}

initTheme();
