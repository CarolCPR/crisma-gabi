/** @module statistics */

function countCheckedMoments(week) {
  if (!week || !week.checkboxes || typeof week.checkboxes !== 'object') return 0;
  return Object.keys(week.checkboxes).reduce(function (count, key) {
    return count + (week.checkboxes[key] === true ? 1 : 0);
  }, 0);
}

function getMostChosenVirtue(weeks) {
  var frequency = {};
  weeks.forEach(function (week) {
    var virtueValue = week && week.virtue && typeof week.virtue.value === 'string' ? week.virtue.value.trim() : '';
    if (!virtueValue) return;
    frequency[virtueValue] = (frequency[virtueValue] || 0) + 1;
  });

  var virtues = Object.keys(frequency);
  if (!virtues.length) return 'Ainda não definida';

  return virtues.sort(function (a, b) {
    if (frequency[a] > frequency[b]) return -1;
    if (frequency[a] < frequency[b]) return 1;
    return a.localeCompare(b);
  })[0];
}

export function calculateStatistics(appData) {
  var weeks = Array.isArray(appData && appData.weeks) ? appData.weeks : [];
  var weeksCount = weeks.length;
  var totalMoments = weeks.reduce(function (sum, week) { return sum + countCheckedMoments(week); }, 0);
  var completedWeeks = weeks.reduce(function (sum, week) { return sum + (week.status === 'done' ? 1 : 0); }, 0);

  return {
    weeksCount: weeksCount,
    totalMoments: totalMoments,
    completedWeeks: completedWeeks,
    mostChosenVirtue: getMostChosenVirtue(weeks),
  };
}

export function renderStatistics(appData) {
  var container = document.getElementById('statisticsList');
  if (!container) return;

  var stats = calculateStatistics(appData);

  container.innerHTML = '';

  var items = [
    'Você já registrou ' + stats.weeksCount + ' semanas da sua caminhada.',
    'Você registrou ' + stats.totalMoments + ' momentos de oração e recolhimento.',
    'A virtude mais escolhida neste período foi ' + stats.mostChosenVirtue + '.',
    'Semanas concluídas: ' + stats.completedWeeks + '.',
  ];

  items.forEach(function (text) {
    var li = document.createElement('li');
    li.textContent = text;
    container.appendChild(li);
  });
}
