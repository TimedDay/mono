import * as vscode from 'vscode';
import { createThemedWebviewPanel, TimeTracker } from '../extension';
import { renderRepoChart } from '../helper/renderRepoChart';
import { renderDailyCards } from '../helper/renderDailyCards';

export const weeklySummaryCommand = (timeTracker: TimeTracker, context: vscode.ExtensionContext) => vscode.commands.registerCommand('code-time-tracker.showWeeklySummary', () => {
  const summary = timeTracker.generateWeeklySummary();

  // Erstelle Panel mit Theme-Unterstützung
  const panel = createThemedWebviewPanel(
    'codeTimeTracker',
    'Weekly Code Time Summary',
    vscode.ViewColumn.One,
    context.extensionUri
  );

  // Generiere HTML-Inhalt mit Theme-Variablen
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
          
          <h3>Time by Repository</h3>
          ${renderRepoChart(summary.repos)}
          
          <h3>Daily Breakdown</h3>
          <div class="daily-grid">
            ${renderDailyCards(summary.dailyBreakdown, summary.mostProductiveDay)}
          </div>
        </div>
      `;
  };

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