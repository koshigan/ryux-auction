// guild-war-team.js
// Logic for the team-specific Guild War view.
// Depends on utils.js and guild-war-core.js

async function initGuildWarTeamPage() {
  const currentUser = await requireLogin();
  if (!currentUser) return;

  buildNavbar(currentUser);

  const teamId = Number(window.location.pathname.split('/').pop());
  const state = await getGuildWarState();
  const team = state.teams.find((entry) => entry.id === teamId);

  if (!team) {
    toast('Team not found.', 'error');
    window.location.href = '/guild-war';
    return;
  }

  if (!canOpenTeam(currentUser, team)) {
    toast('You can only open teams under your access.', 'error');
    window.location.href = '/guild-war';
    return;
  }

  renderTeamScreen(team);
}

function canOpenTeam(user, team) {
  if (['admin', 'guild_leader'].includes(user.role)) return true;
  if (user.role === 'force_captain') return user.guildForceId === team.forceId;
  if (user.role === 'war_leader') return user.guildTeamId === team.id;
  return false;
}

function renderTeamScreen(team) {
  const achieved = team.members.reduce((sum, member) => sum + Number(member.achievedPoints || 0), 0);
  const target = team.members.reduce((sum, member) => sum + Number(member.targetPoints || 0), 0);
  const force = getForce(team.forceId);

  document.title = `RYUX ESPORTS - ${team.name}`;
  document.getElementById('team-screen').style.setProperty(
    '--team-bg',
    team.imageData ? `url("${team.imageData}")` : 'radial-gradient(circle at top, rgba(255, 59, 59, 0.24), transparent 45%)'
  );
  document.getElementById('team-art').innerHTML = renderTeamImage(team);
  document.getElementById('team-status').textContent = team.status;
  document.getElementById('team-status').className = `badge ${team.status === 'Active' ? 'badge-green' : 'badge-muted'}`;
  document.getElementById('team-slot').textContent = `Slot ${team.id}`;
  document.getElementById('team-name').textContent = team.name;
  document.getElementById('team-summary').textContent = `${team.name} belongs to ${force.name}, under the ${force.post} post.`;
  document.getElementById('team-leader').textContent = `${team.leaderName} (${team.leaderEmail})`;
  document.getElementById('team-player-count').textContent = String(team.members.length);
  document.getElementById('team-achieved').textContent = String(achieved);
  document.getElementById('team-target').textContent = String(target);
  document.getElementById('team-point-chart').innerHTML = renderMemberPointGraph(team);

  const roster = document.getElementById('team-roster');
  if (!team.members.length) {
    roster.innerHTML = '<div class="empty-state" style="padding: 24px 0;"><p>No members added yet.</p></div>';
    return;
  }

  roster.innerHTML = team.members.map((member) => `
    <div class="team-member">
      <div>
        <strong>${escapeHtml(member.name)}</strong>
        <span>${escapeHtml(member.role)}</span>
      </div>
      <div>
        <span class="badge badge-muted">Target ${member.targetPoints}</span>
        <span class="badge ${Number(member.achievedPoints) >= Number(member.targetPoints) ? 'badge-green' : 'badge-red'}">${member.achievedPoints} achieved</span>
      </div>
    </div>
  `).join('');
}

function renderMemberPointGraph(team) {
  if (!team.members.length) {
    return '<div class="empty-state" style="padding: 14px 0;"><p>No points to graph yet.</p></div>';
  }

  const maxPoints = Math.max(...team.members.map((member) => Number(member.achievedPoints || 0)), 1);
  return team.members.map((member) => {
    const achieved = Number(member.achievedPoints || 0);
    const height = Math.max(4, Math.round((achieved / maxPoints) * 100));
    return `
      <div class="team-chart-col">
        <div class="team-chart-value">${achieved}</div>
        <div class="team-chart-track"><div class="team-chart-fill" style="height:${height}%"></div></div>
        <div class="team-chart-name">${escapeHtml(member.name)}</div>
      </div>
    `;
  }).join('');
}

function renderTeamImage(team) {
  const initials = team.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (team.imageData) {
    return `<img src="${team.imageData}" alt="${escapeHtml(team.name)} team picture" onerror="handleImageError(this, '${initials}')">`;
  }

  return `<span>${escapeHtml(initials || `T${team.id}`)}</span>`;
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
}

initGuildWarTeamPage();
