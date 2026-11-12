async function loadContributions() {
  const calendar = document.querySelector('#calendar');
  try {
    const response = await fetch('https://github-contributions-api.jogruber.de/v4/jhadenn?y=last', {signal: AbortSignal.timeout(10000)});
    if (!response.ok) throw new Error('Contribution service unavailable');
    const data = await response.json();
    if (!Array.isArray(data.contributions) || !data.contributions.length) throw new Error('No contribution data');
    const grid = document.createElement('div'); grid.className = 'calendar-grid';
    const colors = ['#1c252b','#39494a','#68796b','#a4b393','#eeecc8'];
    const firstWeekday = new Date(data.contributions[0].date + 'T00:00:00Z').getUTCDay();
    for (let i=0;i<firstWeekday;i++) grid.append(document.createElement('span'));
    for (const day of data.contributions) {
      const square = document.createElement('span'); square.className = 'day';
      square.style.setProperty('--day-color',colors[Math.max(0,Math.min(4,day.level))]);
      square.title = `${day.count} contributions on ${day.date}`;
      square.setAttribute('aria-label',square.title); grid.append(square);
    }
    calendar.replaceChildren(grid); calendar.scrollLeft = calendar.scrollWidth;
    document.querySelector('#contribution-total').textContent = `${data.contributions.reduce((sum,day)=>sum+day.count,0).toLocaleString()} contributions in the last year`;
  } catch {
    const status = document.createElement('p'); status.className = 'calendar-status';
    status.append('Activity is unavailable right now. ');
    const link = document.createElement('a'); link.href = 'https://github.com/jhadenn'; link.textContent = 'View on GitHub ↗';
    status.append(link); calendar.replaceChildren(status);
  }
}
loadContributions();

