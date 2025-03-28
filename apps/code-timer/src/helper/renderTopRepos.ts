export function renderTopRepos(repos: any): string {
    if (repos.length === 0) {
        return '<p>Keine Daten verfügbar</p>';
    }

    return repos.map((repo: any, index: any) => {
        return `
        <div class="day-card">
          <p class="day-name">#${index + 1}</p>
          <p class="repo-name">${repo.name}</p>
          <p class="stat-value">${repo.time}</p>
        </div>
      `;
    }).join('');
}