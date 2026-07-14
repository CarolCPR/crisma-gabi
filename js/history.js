/** @module history */
import { getSortedWeeks } from './weeks.js';

function formatWeekRange(week) {
  if (week.displayStartDate && week.displayEndDate) {
    return 'Semana de ' + week.displayStartDate + ' a ' + week.displayEndDate;
  }
  return 'Semana sem datas definidas';
}

function getVirtueLabel(week) {
  var virtue = week.virtue || { mode: 'none', value: '' };
  if (!virtue.value) return 'Não definida';
  return virtue.value;
}

function countCheckedMoments(week) {
  if (!week.checkboxes || typeof week.checkboxes !== 'object') return 0;
  return Object.keys(week.checkboxes).reduce(function (count, key) {
    return count + (week.checkboxes[key] === true ? 1 : 0);
  }, 0);
}

function getStatusLabel(status) {
  if (status === 'done') return 'Concluída';
  return 'Em andamento';
}

function buildHistoryCard(week, isActive, handlers) {
  var card = document.createElement('article');
  card.className = 'history-card';
  if (isActive) card.classList.add('active');

  var title = document.createElement('h3');
  title.textContent = formatWeekRange(week);
  card.appendChild(title);

  var meta = document.createElement('p');
  meta.className = 'history-meta';

  var virtueLabel = document.createElement('strong');
  virtueLabel.textContent = getVirtueLabel(week);
  meta.appendChild(document.createTextNode('Virtude: '));
  meta.appendChild(virtueLabel);
  meta.appendChild(document.createElement('br'));
  meta.appendChild(document.createTextNode(countCheckedMoments(week) + ' momentos registrados'));
  meta.appendChild(document.createElement('br'));
  meta.appendChild(document.createTextNode(getStatusLabel(week.status)));
  card.appendChild(meta);

  var actions = document.createElement('div');
  actions.className = 'history-actions';

  var openBtn = document.createElement('button');
  openBtn.type = 'button';
  openBtn.className = 'action-btn history-btn';
  openBtn.textContent = isActive ? 'Semana aberta' : 'Visualizar';
  openBtn.disabled = isActive;
  openBtn.addEventListener('click', function () { handlers.onOpen(week.id); });
  actions.appendChild(openBtn);

  var printBtn = document.createElement('button');
  printBtn.type = 'button';
  printBtn.className = 'action-btn history-btn history-btn-light';
  printBtn.textContent = 'Imprimir';
  printBtn.addEventListener('click', function () {
    handlers.onOpen(week.id);
    window.print();
  });
  actions.appendChild(printBtn);

  var deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'action-btn history-btn history-btn-light';
  deleteBtn.textContent = 'Excluir';
  deleteBtn.addEventListener('click', function () { handlers.onDelete(week.id); });
  actions.appendChild(deleteBtn);

  card.appendChild(actions);
  return card;
}

export function renderHistory(appData, handlers) {
  var container = document.getElementById('historyList');
  if (!container) return;

  container.innerHTML = '';

  var sortedWeeks = getSortedWeeks(appData);
  if (sortedWeeks.length === 0) {
    var empty = document.createElement('p');
    empty.className = 'history-empty';
    empty.textContent = 'Você ainda não possui semanas no histórico.';
    container.appendChild(empty);
    return;
  }

  sortedWeeks.forEach(function (week) {
    var card = buildHistoryCard(week, week.id === appData.activeWeekId, handlers);
    container.appendChild(card);
  });
}
