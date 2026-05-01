const GUILD_WAR_STORAGE_KEY = 'ryuxGuildWarStateV2';

async function initProgressPage() {
  const currentUser = await requireLogin();
  if (!currentUser) return;

  buildNavbar(currentUser);
  
  const state = await getGuildWarState();
  renderGuildLeaderboard(state);
}

function renderGuildLeaderboard(state) {
  const container = document.getElementById('guild-leaderboard-chart');
  if (!container) return;

  if (!state.teams || state.teams.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No teams available.</p></div>';
    return;
  }

  const teamData = state.teams.map(team => {
    const achieved = (team.members || []).reduce((sum, member) => sum + Number(member.achievedPoints || 0), 0);
    const target = (team.members || []).reduce((sum, member) => sum + Number(member.targetPoints || 0), 0);
    return { ...team, achieved, target };
  });

  teamData.sort((a, b) => b.achieved - a.achieved);

  const maxPoints = Math.max(...teamData.map(t => t.achieved), 1);

  // Render initial zero height
  container.innerHTML = teamData.map((team, index) => {
    const isLeader = index === 0 && team.achieved > 0;
    
    return `
      <div class="vertical-bar-container" style="${isLeader ? 'transform: scale(1.05); z-index: 10;' : ''}">
        <div class="vertical-bar-value" style="${isLeader ? 'color: var(--accent);' : ''}">${team.achieved}</div>
        <div class="vertical-bar-track">
          <div class="vertical-bar-fill" id="bar-${index}" data-height="${Math.max(4, Math.round((team.achieved / maxPoints) * 100))}" style="${isLeader ? 'background: linear-gradient(0deg, #ff9a9e, #fecfef); box-shadow: 0 0 20px rgba(255,154,158,0.5);' : ''}"></div>
        </div>
        <div class="vertical-bar-label" style="${isLeader ? 'color: var(--accent);' : ''}">
          ${isLeader ? '<span class="leader-badge">👑</span>' : ''}${escapeHtml(team.name)}
        </div>
      </div>
    `;
  }).join('');

  // Trigger animation after brief delay
  setTimeout(() => {
    teamData.forEach((_, index) => {
      const fill = document.getElementById(`bar-${index}`);
      if (fill) {
        fill.style.height = `${fill.dataset.height}%`;
      }
    });
  }, 100);
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
}

initProgressPage();
