// Extension-Hauptdatei (extension.ts)
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Klasse zur Verwaltung des Zeittrackings
export class TimeTracker {
  private isTracking: boolean = false;
  private currentRepo: string | null = null;
  private currentBranch: string | null = null;
  private lastActivity: number = Date.now();
  private sessionData: any = {};
  private statusBarItem: vscode.StatusBarItem;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    // Status-Bar-Element erstellen, um den Tracking-Status anzuzeigen
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.statusBarItem.text = "$(clock) Tracking: Off";
    this.statusBarItem.command = 'code-time-tracker.toggleTracking';
    this.statusBarItem.show();

    // Daten aus vorherigen Sitzungen laden
    this.loadSessionData();
  }

  // Tracking starten
  public start() {
    if (this.isTracking) {
      return;
    }

    this.isTracking = true;
    this.lastActivity = Date.now();
    this.updateRepoInfo();
    this.statusBarItem.text = "$(clock) Tracking: On";

    // Timer für regelmäßige Updates (alle 30 Sekunden)
    this.timer = setInterval(() => this.updateSession(), 30000);

    console.log('Time tracking started');
  }

  // Tracking stoppen
  public stop() {
    if (!this.isTracking) {
      return;
    }

    this.isTracking = false;
    this.statusBarItem.text = "$(clock) Tracking: Off";

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    // Letzte Sitzungsdaten speichern
    this.updateSession();
    this.saveSessionData();

    console.log('Time tracking stopped');
  }

  // Tracking umschalten
  public toggle() {
    if (this.isTracking) {
      this.stop();
    } else {
      this.start();
    }
  }

  // Aktuelle Repository-Informationen abrufen
  private async updateRepoInfo() {
    try {
      const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
      if (gitExtension) {
        const api = gitExtension.getAPI(1);
        if (api.repositories.length > 0) {
          const repo = api.repositories[0];
          this.currentRepo = repo.rootUri.fsPath;
          this.currentBranch = repo.state.HEAD?.name || 'unknown';
          return;
        }
      }

      // Fallback, wenn die Git-Extension nicht verfügbar ist
      if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        this.currentRepo = vscode.workspace.workspaceFolders[0].uri.fsPath;
        this.currentBranch = 'unknown';
      } else {
        this.currentRepo = null;
        this.currentBranch = null;
      }
    } catch (error) {
      console.error('Error getting repo info:', error);
      this.currentRepo = null;
      this.currentBranch = null;
    }
  }

  // Sitzungsdaten aktualisieren
  private updateSession() {
    if (!this.isTracking || !this.currentRepo) {
      return;
    }

    // Prüfen, ob der Benutzer inaktiv ist (5 Minuten ohne Aktivität)
    const now = Date.now();
    if (now - this.lastActivity > 5 * 60 * 1000) {
      console.log('User inactive, pausing tracking');
      return;
    }

    // Zeit für das aktuelle Repo und den Branch erfassen
    const repoKey = this.currentRepo;
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD Format

    if (!this.sessionData[date]) {
      this.sessionData[date] = {};
    }

    if (!this.sessionData[date][repoKey]) {
      this.sessionData[date][repoKey] = {
        totalSeconds: 0,
        branches: {}
      };
    }

    // 30 Sekunden zum Gesamtzähler hinzufügen (Intervall des Timers)
    this.sessionData[date][repoKey].totalSeconds += 30;

    // Branch-spezifische Zeit erfassen
    if (this.currentBranch) {
      if (!this.sessionData[date][repoKey].branches[this.currentBranch]) {
        this.sessionData[date][repoKey].branches[this.currentBranch] = 0;
      }
      this.sessionData[date][repoKey].branches[this.currentBranch] += 30;
    }

    // Daten periodisch speichern
    this.saveSessionData();
  }

  // Aktivitätsereignis registrieren
  public registerActivity() {
    this.lastActivity = Date.now();
    if (this.isTracking) {
      this.updateRepoInfo();
    }
  }

  // Sitzungsdaten speichern
  private saveSessionData() {
    try {
      const dataDir = path.join(os.homedir(), '.code-time-tracker');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const dataPath = path.join(dataDir, 'session-data.json');
      fs.writeFileSync(dataPath, JSON.stringify(this.sessionData, null, 2));
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  }

  // Sitzungsdaten laden
  private loadSessionData() {
    try {
      const dataPath = path.join(os.homedir(), '.code-time-tracker', 'session-data.json');
      if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf8');
        this.sessionData = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading session data:', error);
      this.sessionData = {};
    }
  }

  // Tägliche Zusammenfassung generieren
  public generateDailySummary() {
    const date = new Date().toISOString().split('T')[0];
    const summary = this.sessionData[date] || {};

    let totalTime = 0;
    const repoTimes = [];

    for (const repo in summary) {
      const repoData = summary[repo];
      totalTime += repoData.totalSeconds;

      const repoName = path.basename(repo);
      const hours = Math.floor(repoData.totalSeconds / 3600);
      const minutes = Math.floor((repoData.totalSeconds % 3600) / 60);

      repoTimes.push({
        name: repoName,
        time: `${hours}h ${minutes}m`,
        seconds: repoData.totalSeconds
      });
    }

    // Nach Zeit sortieren (absteigend)
    repoTimes.sort((a, b) => b.seconds - a.seconds);

    return {
      date,
      totalTime: `${Math.floor(totalTime / 3600)}h ${Math.floor((totalTime % 3600) / 60)}m`,
      repos: repoTimes
    };
  }

  // Wöchentliche Zusammenfassung generieren
  public generateWeeklySummary() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);

    // Zurück zum Anfang der Woche (Sonntag = 0, Montag = 1, etc.)
    // Für eine Woche, die am Montag beginnt, würde man hier anpassen:
    // weekStart.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    weekStart.setDate(today.getDate() - dayOfWeek);

    return this.generatePeriodSummary(weekStart, today);
  }

  // Monatliche Zusammenfassung generieren
  public generateMonthlySummary() {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return this.generatePeriodSummary(monthStart, today);
  }

  // Generische Funktion für Zeitraumanalyse
  private generatePeriodSummary(startDate: Date, endDate: Date) {
    const dateRangeStr = `${startDate.toISOString().split('T')[0]} bis ${endDate.toISOString().split('T')[0]}`;

    // Alle Tage im Zeitraum durchgehen
    const allDays: string[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      allDays.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Gesamtzeiten für alle Repos
    let totalTimeSeconds = 0;
    const repoSummary: { [repo: string]: number } = {};
    const dailyTotals: { [date: string]: number } = {};

    // Daten für jeden Tag sammeln
    for (const day of allDays) {
      const dayData = this.sessionData[day] || {};
      dailyTotals[day] = 0;

      for (const repo in dayData) {
        const repoData = dayData[repo];
        const repoName = path.basename(repo);

        // Repo-Zeiten aktualisieren
        if (!repoSummary[repoName]) {
          repoSummary[repoName] = 0;
        }

        repoSummary[repoName] += repoData.totalSeconds;
        totalTimeSeconds += repoData.totalSeconds;
        dailyTotals[day] += repoData.totalSeconds;
      }
    }

    // Nach Zeiten sortieren
    const sortedRepos = Object.entries(repoSummary)
      .map(([name, seconds]) => ({
        name,
        seconds,
        time: this.formatTime(seconds)
      }))
      .sort((a, b) => b.seconds - a.seconds);

    // Tageszeiten formatieren
    const formattedDailyTotals = Object.entries(dailyTotals)
      .map(([date, seconds]) => ({
        date,
        dayName: new Date(date).toLocaleDateString('de-DE', { weekday: 'long' }),
        seconds,
        time: this.formatTime(seconds)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      period: dateRangeStr,
      totalTime: this.formatTime(totalTimeSeconds),
      repos: sortedRepos,
      dailyBreakdown: formattedDailyTotals,
      // Wochentag mit höchster Produktivität
      mostProductiveDay: formattedDailyTotals.length > 0
        ? formattedDailyTotals.reduce((a, b) => a.seconds > b.seconds ? a : b)
        : null,
      // Durchschnittliche tägliche Arbeitszeit
      averageDailyTime: formattedDailyTotals.length > 0
        ? this.formatTime(totalTimeSeconds / formattedDailyTotals.length)
        : "0h 0m"
    };
  }

  // Sekunden in lesbare Zeit umwandeln
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  // Aufräumen bei Deaktivierung der Extension
  public dispose() {
    this.stop();
    this.statusBarItem.dispose();
  }
}

// Importieren des TreeView-Providers
import { ReportsTreeViewProvider } from './reportsTreeView';
import { monthlySummaryCommand } from './views/monthly';
import { weeklySummaryCommand } from './views/weekly';
import { dailySummaryCommand } from './views/daily';

// Extension aktivieren
export function activate(context: vscode.ExtensionContext) {
  console.log('Code Time Tracker aktiviert');

  // TreeView für Reports registrieren
  const reportsProvider = new ReportsTreeViewProvider();
  vscode.window.registerTreeDataProvider('codeTimeReports', reportsProvider);

  const timeTracker = new TimeTracker();

  // Befehl zum Umschalten des Trackings registrieren
  const toggleCommand = vscode.commands.registerCommand('code-time-tracker.toggleTracking', () => {
    timeTracker.toggle();
  });

  // Event-Listener für Benutzeraktivität
  const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(() => {
    timeTracker.registerActivity();
  });

  const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(() => {
    timeTracker.registerActivity();
  });

  // In extension.ts, füge diese Hilfsfunktion hinzu:





  // Tracking automatisch starten
  timeTracker.start();

  // Extension-Kontext aktualisieren
  context.subscriptions.push(
    toggleCommand,
    dailySummaryCommand(timeTracker),
    weeklySummaryCommand(timeTracker, context),
    monthlySummaryCommand(timeTracker, context),
    onDidChangeTextDocument,
    onDidChangeActiveTextEditor,
    timeTracker
  );
}

// Extension deaktivieren
export function deactivate() {
  console.log('Code Time Tracker deaktiviert');
}

// Hilfsfunktion für Nonce-Generierung (für CSP)
function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
   * Erstellt ein Webview mit korrekter Theme-Unterstützung
   */
export function createThemedWebviewPanel(
  viewType: string,
  title: string,
  column: vscode.ViewColumn,
  extensionUri: vscode.Uri
): vscode.WebviewPanel {
  const panel = vscode.window.createWebviewPanel(
    viewType,
    title,
    column,
    {
      enableScripts: true,
      localResourceRoots: [extensionUri]
    }
  );

  // Theme-CSS als lokale Ressource verfügbar machen
  const styleResetUri = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'media', 'reset.css')
  );
  const styleVSCodeUri = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'media', 'vscode.css')
  );
  const styleMainUri = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'media', 'main.css')
  );

  // Nonce zur Absicherung von Inline-Skripts
  const nonce = getNonce();

  // Base HTML für alle Webviews
  panel.webview.html = `<!DOCTYPE html>
  <html lang="de">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <link href="${styleResetUri}" rel="stylesheet">
    <link href="${styleVSCodeUri}" rel="stylesheet">
    <link href="${styleMainUri}" rel="stylesheet">
    <title>${title}</title>
  </head>
  <body class="code-time-tracker">
    <div id="content">
      <div class="loading">Lade Daten...</div>
    </div>
    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi();
      
      // Theme-Wechsel abfangen
      window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
          case 'updateContent':
            document.getElementById('content').innerHTML = message.html;
            break;
        }
      });
      
      // Initiale Anfrage nach Daten
      vscode.postMessage({ command: 'requestData' });
    </script>
  </body>
  </html>`;

  return panel;
}