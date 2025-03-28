export function renderRepoChart(repos: any) {
    const maxSeconds = repos.length > 0 ? repos[0].seconds : 0;

    return repos.map((repo: any) => {
        const percentage = maxSeconds > 0 ? (repo.seconds / maxSeconds * 100) : 0;
        return `
          <div class="repo-item">
            <div class="repo-header">
              <span class="repo-name">${repo.name}</span>
              <span class="repo-time">${repo.time}</span>
            </div>
            <div class="repo-bar">
              <div class="repo-bar-fill" style="width: ${percentage}%"></div>
            </div>
          </div>
        `;
    }).join('');
}