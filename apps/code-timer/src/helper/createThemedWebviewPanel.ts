import * as vscode from 'vscode';
import { getNonce } from './getNonce';

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