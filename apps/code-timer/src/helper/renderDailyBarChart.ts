export function renderDailyBarChart(days: any): string {
    // Wenn keine Daten vorhanden sind, zeige eine entsprechende Nachricht
    if (days.length === 0) {
        return '<p class="no-data">Keine Daten für diesen Zeitraum verfügbar</p>';
    }

    // Bestimme den maximalen Sekundenwert für die relative Höhe der Balken
    const maxSeconds = Math.max(...days.map((day: any) => day.seconds));

    // Balkenbreite basierend auf der Anzahl der Tage berechnen
    const barWidth = days.length <= 10 ? 20 : days.length <= 20 ? 12 : 8;

    let chartContent = '';

    // Erstelle für jeden Tag einen Balken und ein Label
    days.forEach((day: any, index: any) => {
        // Berechne die Höhe des Balkens relativ zum Maximum (in Prozent)
        const height = maxSeconds > 0 ? (day.seconds / maxSeconds * 80) : 0; // 80% maximale Höhe

        // Berechne die horizontale Position basierend auf der Gesamtzahl der Tage
        const leftPosition = (index / (days.length - 1) * 100);

        // Füge den Balken zum Chart hinzu
        chartContent += `
        <div class="chart-bar" style="left: ${leftPosition}%; height: ${height}%; width: ${barWidth}px;"></div>
        <div class="chart-label" style="left: ${leftPosition}%;">
          <span class="chart-day">${day.date.split('-')[2]}</span>
        </div>
      `;

        // Füge optionale Tooltips oder Hover-Effekte hinzu
        if (index % 5 === 0 || index === days.length - 1) {
            chartContent += `
          <div class="chart-month-label" style="left: ${leftPosition}%;">
            ${day.date.split('-')[2]}.${day.date.split('-')[1]}
          </div>
        `;
        }
    });

    // Wrapper für das gesamte Chart
    return `
      <div class="chart-inner">
        ${chartContent}
        <div class="chart-baseline"></div>
      </div>
    `;
}