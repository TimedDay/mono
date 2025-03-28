export function renderDailyCards(days: any, mostProductiveDay: any) {
    return days.map((day: any) => {
        const isMostProductive = mostProductiveDay && day.date === mostProductiveDay.date;
        return `
          <div class="day-card ${isMostProductive ? 'day-most-productive' : ''}">
            <p class="day-name">${day.dayName.slice(0, 3)}</p>
            <p class="day-date">${day.date.split('-')[2]}.${day.date.split('-')[1]}</p>
            <p class="day-time">${day.time}</p>
          </div>
        `;
    }).join('');
}