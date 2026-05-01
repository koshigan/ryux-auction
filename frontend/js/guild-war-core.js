/**
 * guild-war-core.js
 * Centralized data and logic for Guild War state management.
 */

const GUILD_WAR_STORAGE_KEY = 'ryuxGuildWarStateV2';

const guildWarForces = [
  { id: 'sukuna', name: 'Sukuna & Co', post: 'Guild Leader', captain: 'Sukuna', teamIds: [1, 2, 3, 4, 5] },
  { id: 'alien', name: 'Alien Force', post: 'Acting Guild Leader', captain: 'Acting Guild Leader', teamIds: [6, 7, 8, 9] },
  { id: 'das', name: 'Das & Co', post: 'Supreme Leader', captain: 'Supreme Leader', teamIds: [10, 11, 12, 13] }
];

const fallbackGuildWarState = {
  currentRound: 1,
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

/**
 * Normalizes the state to ensure it has all required properties and preserves all teams.
 */
function normalizeGuildWarState(state) {
  if (!state) return JSON.parse(JSON.stringify(fallbackGuildWarState));

  const normalized = {
    currentRound: Number(state.currentRound || 1),
    teams: []
  };

  // Combine stored teams with fallback teams to ensure we have at least the minimum slots,
  // but also preserve any NEW teams added beyond the fallback count.
  const storedTeams = Array.isArray(state.teams) ? state.teams : [];
  const fallbackTeams = fallbackGuildWarState.teams;

  // Use a Map to deduplicate teams by ID, prioritizing stored data
  const teamsMap = new Map();

  // 1. Start with fallback teams
  fallbackTeams.forEach(t => teamsMap.set(Number(t.id), { ...t }));

  // 2. Overwrite with stored teams (preserves additions and updates)
  storedTeams.forEach(t => {
    const id = Number(t.id);
    const existing = teamsMap.get(id) || {};
    teamsMap.set(id, {
      ...existing,
      ...t,
      id: id,
      forceId: t.forceId || existing.forceId || getDefaultForceId(id),
      members: Array.isArray(t.members) ? t.members : (existing.members || [])
    });
  });

  normalized.teams = Array.from(teamsMap.values()).sort((a, b) => a.id - b.id);
  
  return normalized;
}

function getDefaultForceId(teamId) {
  const force = guildWarForces.find((f) => f.teamIds.includes(Number(teamId)));
  return force ? force.id : guildWarForces[0].id;
}

async function getGuildWarState() {
  // 1. Try Server
  try {
    const data = await api.get('/api/guild-war/state');
    if (data.state) return normalizeGuildWarState(data.state);
  } catch (error) {
    console.debug('[GuildWar] Server fetch failed, trying local storage...', error);
  }

  // 2. Try Local Storage
  try {
    const stored = localStorage.getItem(GUILD_WAR_STORAGE_KEY);
    if (stored) return normalizeGuildWarState(JSON.parse(stored));
  } catch (error) {
    console.debug('[GuildWar] Local storage parse failed', error);
  }

  // 3. Fallback to default
  return normalizeGuildWarState(null);
}

async function saveGuildWarState(state) {
  if (!state) return;
  
  // 1. Save to Server
  try {
    await api.post('/api/guild-war/state', state);
  } catch (error) {
    console.error('[GuildWar] Server save failed:', error);
    if (typeof toast === 'function') {
      toast(`Sync failed: ${error.message}. Saved locally.`, 'error');
    }
  }

  // 2. Save to Local Storage
  localStorage.setItem(GUILD_WAR_STORAGE_KEY, JSON.stringify(state));
}

function getForce(forceId) {
  return guildWarForces.find((f) => f.id === forceId) || guildWarForces[0];
}

function getTeamsForForce(state, forceId) {
  if (!state || !state.teams) return [];
  return state.teams.filter(t => t.forceId === forceId);
}

function getTeamForceId(state, teamId) {
  const team = state.teams.find(t => t.id === Number(teamId));
  return team ? team.forceId : getDefaultForceId(teamId);
}

// Global error handler for images to fix broken icons
function handleImageError(img, initials = '') {
  img.style.display = 'none';
  const parent = img.parentElement;
  if (parent) {
    const span = document.createElement('span');
    span.textContent = initials || 'T';
    parent.appendChild(span);
  }
}
