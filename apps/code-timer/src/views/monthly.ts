import * as vscode from 'vscode';
import { TimeTracker } from '../extension';
import { renderRepoChart } from '../helper/renderRepoChart';
import { renderTopRepos } from '../helper/renderTopRepos';
import { renderDailyBarChart } from '../helper/renderDailyBarChart';
import { createThemedWebviewPanel } from '../helper/createThemedWebviewPanel';

export const monthlySummaryCommand = (timeTracker: TimeTracker, context: vscode.ExtensionContext) => vscode.commands.registerCommand('code-time-tracker.showMonthlySummary', () => {
  const summary = timeTracker.generateMonthlySummary();

  const panel = createThemedWebviewPanel(
    'codeTimeTracker',
    'Monthly Code Time Summary',
    vscode.ViewColumn.One,
    context.extensionUri
  );


  const generateHtml = () => {
    return `
    <div class="summary-container">
          <h1>Weekly Code Time Summary</h1>
          <h2>Period: ${summary.period}</h2>
          
          <div class="stats-grid">
            <div class="stats-card">
              <h3>Total Coding Time</h3>
              <p class="stat-value">${summary.totalTime}</p>
            </div>
            <div class="stats-card">
              <h3>Average Daily Time</h3>
              <p class="stat-value">${summary.averageDailyTime}</p>
            </div>
          </div>
          
          <h3>Zeit nach Repository</h3>
          ${renderRepoChart(summary.repos)}

          <h3>Tägliche Aktivität</h3>
      <div class="chart-container">
        ${renderDailyBarChart(summary.dailyBreakdown)}
      </div>

          <h3>Produktivster Tag</h3>
          <div class="stats-card">
            ${summary.mostProductiveDay ?
        `<p class="day-name">${summary.mostProductiveDay.dayName}</p>
              <p class="day-date">${summary.mostProductiveDay.date}</p>
              <p class="stat-value">${summary.mostProductiveDay.time}</p>` :
        '<p>Keine Daten verfügbar</p>'}
          </div>
          
          <h3>Top-3 Repositories des Monats</h3>
          <div class="daily-grid" style="grid-template-columns: repeat(3, 1fr);">
            ${renderTopRepos(summary.repos.slice(0, 3))}
          </div>
        </div>
    `
  }
  // Ähnlicher Inhalt wie für die Wochenzusammenfassung, aber mit Monatsüberschrift
  let content = `
      
        <div class="summary-container">
          <h1>Monthly Code Time Summary</h1>
          <h2>Period: ${summary.period}</h2>
          
          <div class="stats-grid">
            <div class="stats-card">
              <h3>Total Coding Time</h3>
              <p style="font-size: 24px; font-weight: bold;">${summary.totalTime}</p>
            </div>
            <div class="stats-card">
              <h3>Average Daily Time</h3>
              <p style="font-size: 24px; font-weight: bold;">${summary.averageDailyTime}</p>
            </div>
          </div>
          
          <h3>Time by Repository</h3>
    `;

  // Berechnen des maximalen Werts für die Balkendiagramme
  const maxSeconds = summary.repos.length > 0 ? summary.repos[0].seconds : 0;

  for (const repo of summary.repos) {
    const percentage = maxSeconds > 0 ? (repo.seconds / maxSeconds * 100) : 0;
    content += `
        <div>
          <p><strong>${repo.name}</strong>: ${repo.time}</p>
          <div class="repo-bar">
            <div class="repo-bar-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
  }

  // Balkendiagramm für tägliche Zeiten
  content += `
          <h3>Daily Activity</h3>
          <div class="chart-container">
    `;

  // Maximaler Wert für das Balkendiagramm
  const maxDailySeconds = Math.max(...summary.dailyBreakdown.map(day => day.seconds));

  // Balken für jeden Tag
  summary.dailyBreakdown.forEach((day, index) => {
    const height = maxDailySeconds > 0 ? (day.seconds / maxDailySeconds * 100) : 0;
    const leftPosition = (index / summary.dailyBreakdown.length * 100);

    content += `
        <div class="chart-bar" style="left: ${leftPosition}%; height: ${height}%; "></div>
        <div class="chart-label" style="left: ${leftPosition}%;">${day.date.split('-')[2]}</div>
      `;
  });

  content += `
          </div>
          
          <h3>Most Productive Day</h3>
          <p>${summary.mostProductiveDay ? `${summary.mostProductiveDay.dayName}, ${summary.mostProductiveDay.date} (${summary.mostProductiveDay.time})` : 'No data'}</p>
        </div>
      </body>
      </html>
    `;

  // Sende den Inhalt ans Webview
  panel.webview.postMessage({
    command: 'updateContent',
    html: generateHtml()
  });

  // Reagiere auf Theme-Änderungen (optional)
  panel.webview.onDidReceiveMessage(message => {
    if (message.command === 'requestData') {
      panel.webview.postMessage({
        command: 'updateContent',
        html: generateHtml()
      });
    }
  });
});