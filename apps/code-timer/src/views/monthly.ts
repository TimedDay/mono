import * as vscode from 'vscode';
import { TimeTracker } from '../extension';

export const monthlySummaryCommand = vscode.commands.registerCommand('code-time-tracker.showMonthlySummary', () => {
    const timeTracker = new TimeTracker();
    const summary = timeTracker.generateMonthlySummary();
    
    const panel = vscode.window.createWebviewPanel(
      'codeTimeTracker',
      'Monthly Code Time Summary',
      vscode.ViewColumn.One,
      {}
    );
    
    // Ähnlicher Inhalt wie für die Wochenzusammenfassung, aber mit Monatsüberschrift
    let content = `
      <html>
      <head>
        <style>
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; }
          .summary-container { max-width: 800px; margin: 0 auto; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .stats-card { background: #f5f5f5; border-radius: 8px; padding: 15px; }
          .repo-bar { margin: 10px 0; background: #e0e0e0; border-radius: 4px; }
          .repo-bar-fill { background: #007acc; height: 20px; border-radius: 4px; }
          .chart-container { height: 200px; margin: 20px 0; position: relative; }
          .chart-bar { position: absolute; bottom: 0; width: 12px; background: #007acc; border-radius: 4px 4px 0 0; }
          .chart-label { position: absolute; bottom: -25px; text-align: center; transform: translateX(-50%); font-size: 12px; }
        </style>
      </head>
      <body>
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
    
    panel.webview.html = content;
  });