// guild-war-force.js
// Logic for the force-specific Guild War view.
// Depends on utils.js and guild-war-core.js

let currentUser = null;
let currentForce = null;
let forceTeams = [];
let guildWarState = null;

async function initForcePage() {
  currentUser = await requireLogin();
  if (!currentUser) return;

  buildNavbar(currentUser);

  guildWarState = await getGuildWarState();

  const pathParts = window.location.pathname.split('/');
  const forceId = pathParts[pathParts.length - 1];

  currentForce = getForce(forceId);
  
  if (!currentForce) {
    toast('Force not found.', 'error');
    setTimeout(() => window.location.href = '/guild-war', 2000);
    return;
  }

  // Find teams for this force
  forceTeams = getTeamsForForce(guildWarState, forceId);

  renderForceInfo();
  renderTeams();
}

function renderForceInfo() {
  document.getElementById('force-name').textContent = currentForce.name;
  document.getElementById('force-captain').textContent = `Captaincy: ${currentForce.captain} (${currentForce.post})`;
  
  const badge = document.getElementById('force-badge');
  badge.textContent = currentForce.post;
  badge.className = 'eyebrow';
}

function renderTeamImage(team) {
  const initials = team.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
  if (team.imageData) {
    return `<img src="${team.imageData}" alt="${escapeHtml(team.name)} team picture" onerror="handleImageError(this, '${initials}')">`;
  }
  return `<span>${escapeHtml(initials || `T${team.id}`)}</span>`;
}

function renderTeams() {
  const grid = document.getElementById('teams-grid');
  
  if (forceTeams.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p>No teams assigned to this force yet.</p></div>';
    return;
  }

  grid.innerHTML = forceTeams.map(team => {
    const achieved = team.members ? team.members.reduce((sum, member) => sum + Number(member.achievedPoints || 0), 0) : 0;
    const target = team.members ? team.members.reduce((sum, member) => sum + Number(member.targetPoints || 0), 0) : 0;
    const statusClass = team.status === 'Active' ? 'badge-green' : 'badge-muted';

    return `
      <div class="team-card" onclick="window.location.href='/guild-war/team/${team.id}'">
        <div class="team-card-image">${renderTeamImage(team)}</div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
          <span class="badge ${statusClass}">${team.status}</span>
          <span class="badge badge-muted">Slot ${team.id}</span>
        </div>
        <h3 style="margin-bottom: 4px;">${escapeHtml(team.name)}</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 4px;">War Leader: ${escapeHtml(team.leaderName)}</p>
        <p style="font-weight: bold; color: #fff;">Progress: ${achieved} / ${target}</p>
      </div>
    `;
  }).join('');
}



function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
}

initForcePage();
