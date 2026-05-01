const GUILD_WAR_STORAGE_KEY = 'ryuxGuildWarStateV2';
let currentUser = null;
let currentForce = null;
let forceTeams = [];

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

function getDefaultForceId(teamId) {
  return guildWarForces.find((force) => force.teamIds.includes(Number(teamId)))?.id || guildWarForces[0].id;
}

function normalizeGuildWarState(state) {
  const fallbackTeams = fallbackGuildWarState.teams;
  const teams = Array.isArray(state?.teams) ? state.teams : [];

  return {
    teams: fallbackTeams.map((fallbackTeam, index) => {
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

let guildWarState = null;

async function initForcePage() {
  currentUser = await requireLogin();
  if (!currentUser) return;

  buildNavbar(currentUser);

  guildWarState = await getGuildWarState();

  const pathParts = window.location.pathname.split('/');
  const forceId = pathParts[pathParts.length - 1];

  currentForce = guildWarForces.find(f => f.id === forceId);
  
  if (!currentForce) {
    toast('Force not found.', 'error');
    setTimeout(() => window.location.href = '/guild-war', 2000);
    return;
  }

  // Find teams for this force
  forceTeams = guildWarState.teams.filter(t => t.forceId === forceId || (!t.forceId && currentForce.teamIds.includes(t.id)));

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
  if (team.imageData) {
    return `<img src="${team.imageData}" alt="${escapeHtml(team.name)} team picture">`;
  }
  const initials = team.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
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
