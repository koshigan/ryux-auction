const GUILD_WAR_STORAGE_KEY = 'ryuxGuildWarStateV2';

const guildWarForces = [
  { id: 'sukuna', name: 'Sukuna & Co', post: 'Guild Leader', captain: 'Sukuna', teamIds: [1, 2, 3, 4, 5] },
  { id: 'alien', name: 'Alien Force', post: 'Acting Guild Leader', captain: 'Acting Guild Leader', teamIds: [6, 7, 8, 9] },
  { id: 'das', name: 'Das & Co', post: 'Supreme Leader', captain: 'Supreme Leader', teamIds: [10, 11, 12, 13] }
];

const fallbackGuildWarState = {
  teams: [
    {
      id: 1,
      name: 'Black Bulls',
      leaderName: 'Raiden',
      leaderEmail: 'blackbulls@ryuxesports.com',
      status: 'Active',
      members: [
        { id: 1001, name: 'Raiden', role: 'War Leader', targetPoints: 220, achievedPoints: 185 },
        { id: 1002, name: 'Ares', role: 'Player', targetPoints: 180, achievedPoints: 172 },
        { id: 1003, name: 'Nova', role: 'Player', targetPoints: 175, achievedPoints: 160 },
        { id: 1004, name: 'Kairo', role: 'Player', targetPoints: 190, achievedPoints: 188 }
      ]
    },
    {
      id: 2,
      name: 'Red Reapers',
      leaderName: 'Vortex',
      leaderEmail: 'redreapers@ryuxesports.com',
      status: 'Active',
      members: [
        { id: 2001, name: 'Vortex', role: 'War Leader', targetPoints: 210, achievedPoints: 194 },
        { id: 2002, name: 'Blaze', role: 'Player', targetPoints: 180, achievedPoints: 176 },
        { id: 2003, name: 'Shadow', role: 'Player', targetPoints: 170, achievedPoints: 159 },
        { id: 2004, name: 'Drift', role: 'Player', targetPoints: 165, achievedPoints: 151 }
      ]
    },
    {
      id: 3,
      name: 'Storm Hunters',
      leaderName: 'Cipher',
      leaderEmail: 'stormhunters@ryuxesports.com',
      status: 'Active',
      members: [
        { id: 3001, name: 'Cipher', role: 'War Leader', targetPoints: 230, achievedPoints: 205 },
        { id: 3002, name: 'Echo', role: 'Player', targetPoints: 185, achievedPoints: 181 },
        { id: 3003, name: 'Frost', role: 'Player', targetPoints: 175, achievedPoints: 163 },
        { id: 3004, name: 'Trigger', role: 'Player', targetPoints: 178, achievedPoints: 174 }
      ]
    },
    { id: 4, name: 'Iron Phantoms', leaderName: 'Awaiting Leader', leaderEmail: '-', status: 'Pending', members: [] },
    { id: 5, name: 'Crimson Wolves', leaderName: 'Awaiting Leader', leaderEmail: '-', status: 'Pending', members: [] },
    { id: 6, name: 'Toxic Ravens', leaderName: 'Awaiting Leader', leaderEmail: '-', status: 'Pending', members: [] },
    { id: 7, name: 'Royal Havoc', leaderName: 'Awaiting Leader', leaderEmail: '-', status: 'Pending', members: [] },
    { id: 8, name: 'Silent Vipers', leaderName: 'Awaiting Leader', leaderEmail: '-', status: 'Pending', members: [] },
    { id: 9, name: 'Night Raiders', leaderName: 'Awaiting Leader', leaderEmail: '-', status: 'Pending', members: [] },
    { id: 10, name: 'Rift Titans', leaderName: 'Awaiting Leader', leaderEmail: '-', status: 'Pending', members: [] },
    { id: 11, name: 'Omega Force', leaderName: 'Awaiting Leader', leaderEmail: '-', status: 'Pending', members: [] },
    { id: 12, name: 'Inferno Unit', leaderName: 'Awaiting Leader', leaderEmail: '-', status: 'Pending', members: [] },
    { id: 13, name: 'Dragon Sentinels', leaderName: 'Awaiting Leader', leaderEmail: '-', status: 'Pending', members: [] }
  ]
};

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

async function getGuildWarState() {
  try {
    const data = await api.get('/api/guild-war/state');
    if (data.state) return normalizeGuildWarState(data.state);
  } catch (error) {
    console.debug('Failed to fetch guild war state from server', error);
  }

  try {
    const stored = localStorage.getItem(GUILD_WAR_STORAGE_KEY);
    if (stored) return normalizeGuildWarState(JSON.parse(stored));
  } catch (error) {
    console.debug('Failed to parse guild war state', error);
  }

  return normalizeGuildWarState(JSON.parse(JSON.stringify(fallbackGuildWarState)));
}

function normalizeGuildWarState(state) {
  const teams = Array.isArray(state?.teams) ? state.teams : [];

  return {
    teams: fallbackGuildWarState.teams.map((fallbackTeam, index) => {
      const storedTeam = teams.find((team) => Number(team.id) === fallbackTeam.id) || teams[index] || {};
      return {
        ...fallbackTeam,
        ...storedTeam,
        id: Number(storedTeam.id || fallbackTeam.id),
        forceId: storedTeam.forceId || getDefaultForceId(fallbackTeam.id),
        imageData: storedTeam.imageData || fallbackTeam.imageData || '',
        members: Array.isArray(storedTeam.members) ? storedTeam.members : fallbackTeam.members
      };
    })
  };
}

function getDefaultForceId(teamId) {
  return guildWarForces.find((force) => force.teamIds.includes(Number(teamId)))?.id || guildWarForces[0].id;
}

function getForce(forceId) {
  return guildWarForces.find((force) => force.id === forceId) || guildWarForces[0];
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
  if (team.imageData) {
    return `<img src="${team.imageData}" alt="${escapeHtml(team.name)} team picture">`;
  }

  const initials = team.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return `<span>${escapeHtml(initials || `T${team.id}`)}</span>`;
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
}

initGuildWarTeamPage();
