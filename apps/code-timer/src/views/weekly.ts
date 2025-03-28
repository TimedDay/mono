import * as vscode from 'vscode';
import { TimeTracker } from '../extension';

 export const weeklySummaryCommand = vscode.commands.registerCommand('code-time-tracker.showWeeklySummary', () => {
    const timeTracker = new TimeTracker();
    const summary = timeTracker.generateWeeklySummary();
    
    const panel = vscode.window.createWebviewPanel(
      'codeTimeTracker',
      'Weekly Code Time Summary',
      vscode.ViewColumn.One,
      {}
    );
    
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
          .daily-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
          .day-card { background: #f5f5f5; border-radius: 8px; padding: 10px; text-align: center; }
          .day-most-productive { background: #d4edda; }
        </style>
      </head>
      <body>
        <div class="summary-container">
          <h1>Weekly Code Time Summary</h1>
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
    
    content += `
          <h3>Daily Breakdown</h3>
          <div class="daily-grid">
    `;
    
    for (const day of summary.dailyBreakdown) {
      const isMostProductive = summary.mostProductiveDay && day.date === summary.mostProductiveDay.date;
      content += `
        <div class="day-card ${isMostProductive ? 'day-most-productive' : ''}">
          <p><strong>${day.dayName.slice(0, 3)}</strong></p>
          <p>${day.date.split('-')[2]}.${day.date.split('-')[1]}</p>
          <p>${day.time}</p>
        </div>
      `;
    }
    
    content += `
          </div>
        </div>
      </body>
      </html>
    `;
    
    panel.webview.html = content;
  });