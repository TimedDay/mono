// src/reportsTreeView.ts
import * as vscode from 'vscode';
import * as path from 'path';

export class ReportsTreeViewProvider implements vscode.TreeDataProvider<ReportItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ReportItem | undefined | null | void> = new vscode.EventEmitter<ReportItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ReportItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor() {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ReportItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ReportItem): Thenable<ReportItem[]> {
    // Root level items
    if (!element) {
      return Promise.resolve([
        new ReportItem(
          'Today',
          vscode.TreeItemCollapsibleState.None,
          {
            command: 'code-time-tracker.showDailySummary',
            title: 'Show Daily Summary',
            arguments: []
          },
          'today.svg'
        ),
        new ReportItem(
          'This Week',
          vscode.TreeItemCollapsibleState.None,
          {
            command: 'code-time-tracker.showWeeklySummary',
            title: 'Show Weekly Summary',
            arguments: []
          },
          'week.svg'
        ),
        new ReportItem(
          'This Month',
          vscode.TreeItemCollapsibleState.None,
          {
            command: 'code-time-tracker.showMonthlySummary',
            title: 'Show Monthly Summary',
            arguments: []
          },
          'month.svg'
        )
      ]);
    }

    // No children for leaf nodes
    return Promise.resolve([]);
  }
}

class ReportItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly iconName?: string
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
    
    if (iconName) {
      this.iconPath = {
        light: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'light', iconName)),
        dark: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'dark', iconName))
      };
    }
  }
}