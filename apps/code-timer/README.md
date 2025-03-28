# Code Time Tracker

Track your coding time across different repositories and branches directly within VS Code. Understand where you spend your time and optimize your workflow.

![Code Time Tracker Screenshot](https://raw.githubusercontent.com/TimedDay/mono/refs/heads/main/apps/code-timer/images/screenshot.png)

## Features

- **Automatic Time Tracking**: Tracks time spent in different repositories automatically
- **Git Integration**: Understands which branches you're working on
- **Detailed Reports**:
  - Daily summaries
  - Weekly analysis with productivity patterns
  - Monthly overviews with trends and insights
- **Sidebar Integration**: Quick access to all reports right from VS Code's sidebar
- **Low Overhead**: Runs efficiently in the background without impacting performance

## Usage

After installation, Code Time Tracker will automatically start tracking your coding activity. The time tracker appears in the status bar at the bottom of VS Code.

### Viewing Reports

There are several ways to access your time reports:

1. **Via the Sidebar**: Click on the clock icon in the activity bar to see report options
2. **Via Commands**: Open the command palette (Ctrl+Shift+P / Cmd+Shift+P) and type:
   - `Show Daily Time Summary`
   - `Show Weekly Time Summary`
   - `Show Monthly Time Summary`

### Understanding Reports

- **Daily Reports**: Show today's coding activity across all repositories
- **Weekly Reports**: Display patterns throughout the week, highlighting your most productive days
- **Monthly Reports**: Provide a broader view of your coding habits and project focus

## Extension Settings

This extension contributes the following settings:

* `codeTimeTracker.autoStart`: Enable/disable automatic tracking on VS Code startup (default: true)
* `codeTimeTracker.inactivityThreshold`: Number of seconds of inactivity before tracking pauses (default: 300)

## Data Privacy

All tracking data is stored locally on your machine. This extension does not send any usage data to remote servers.

## Feedback and Contributions

- File bugs, feature requests in [our issue tracker](https://github.com/TimedDay/mono/issues)
- [GitHub Repository](https://github.com/TimedDay/mono)

## Release Notes

### 0.1.2
- fix README.md screenshot

### 0.1.1
- Add marketplace icon

### 0.1.0

Initial release of Code Time Tracker:
- Automatic time tracking for repositories
- Daily, weekly, and monthly reports
- Sidebar integration with quick actions

---

**Enjoy coding with insights!**