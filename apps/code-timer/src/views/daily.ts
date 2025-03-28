import * as vscode from 'vscode';
import { TimeTracker } from '../extension';

export const dailySummaryCommand = vscode.commands.registerCommand('code-time-tracker.showDailySummary', () => {
    const timeTracker = new TimeTracker();
    const summary = timeTracker.generateDailySummary();
    
    // Einfache Ausgabe in einem Panel
    const panel = vscode.window.createWebviewPanel(
      'codeTimeTracker',
      'Code Time Summary',
      vscode.ViewColumn.One,
      {}
    );
    
    let content = `
      <h1>Code Time Summary for ${summary.date}</h1>
      <h2>Total Time: ${summary.totalTime}</h2>
      <h3>Time per Repository:</h3>
      <ul>
    `;
    
    for (const repo of summary.repos) {
      content += `<li><strong>${repo.name}</strong>: ${repo.time}</li>`;
    }
    
    content += `</ul>`;
    panel.webview.html = content;
  });