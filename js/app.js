/** @module app */
import { TOOLTIP_DELAY_MS, TOOLTIP_MARGIN_PX, VIRTUE_MODES } from './constants.js';
import { loadAppData, saveAppData } from './storage.js';
import {
  getActiveWeek,
  getCurrentWeekId,
  updateActiveWeek,
  clearActiveWeekData,
  createNewWeek,
  ensureCurrentWeek,
  setActiveWeek,
  deleteWeek,
  markWeekDone,
} from './weeks.js';
import { renderHistory } from './history.js';
import { renderStatistics } from './statistics.js';
import { exportBackup, importBackupFile } from './backup.js';
import {
  showStatus,
  clearStatus,
  getFormElements,
  populateForm,
  getSelectedVirtueChip,
  collectCheckboxes,
  syncCheckboxes,
  positionTooltip,
  showConfirmDialog,
} from './ui.js';

/** @type {import('./storage.js').AppData} */
var appData;

function readFormIntoWeek() {
  var els = getFormElements();
  var virtueChip = getSelectedVirtueChip();
  var customVirtue = els.otherVirtue.value.trim();

  var virtueMode = VIRTUE_MODES.NONE;
  var virtueValue = '';

  if (customVirtue) {
    virtueMode = VIRTUE_MODES.CUSTOM;
    virtueValue = customVirtue;
  } else if (virtueChip) {
    virtueMode = VIRTUE_MODES.PREDEFINED;
    virtueValue = virtueChip;
  }

  return {
    displayStartDate: els.weekStart.value,
    displayEndDate: els.weekEnd.value,
    intention: els.intention.value,
    virtue: { mode: virtueMode, value: virtueValue },
    checkboxes: collectCheckboxes(),
  };
}

function renderCurrentWeekBanner() {
  var banner = document.getElementById('historyViewBanner');
  if (!banner) return;

  var activeWeek = getActiveWeek(appData);
  if (!activeWeek) {
    banner.hidden = true;
    return;
  }

  var currentWeekId = getCurrentWeekId(appData);
  if (!currentWeekId || currentWeekId === activeWeek.id) {
    banner.hidden = true;
    return;
  }

  banner.hidden = false;
  banner.textContent = 'Você está visualizando a semana de ' + (activeWeek.displayStartDate || '--/--') + ' a ' + (activeWeek.displayEndDate || '--/--') + '.';
}

function refreshUi() {
  var activeWeek = getActiveWeek(appData);
  populateForm(activeWeek, appData.profile.name);
  renderHistory(appData, {
    onOpen: handleOpenWeek,
    onDelete: handleDeleteWeek,
  });
  renderStatistics(appData);
  renderCurrentWeekBanner();
}

function persistCurrentState() {
  var result = saveAppData(appData);
  if (!result.ok) {
    showStatus('Não foi possível salvar as alterações. Verifique o espaço de armazenamento do navegador.', 'error');
    return false;
  }
  return true;
}

function save() {
  var els = getFormElements();
  appData = Object.assign({}, appData, {
    profile: { name: els.name.value },
  });

  var weekChanges = readFormIntoWeek();
  appData = updateActiveWeek(appData, weekChanges);
  persistCurrentState();
  renderHistory(appData, {
    onOpen: handleOpenWeek,
    onDelete: handleDeleteWeek,
  });
  renderStatistics(appData);
}

async function handleClear() {
  var confirmed = await showConfirmDialog('Deseja limpar os dados desta semana (intenção, virtude e checkboxes)? Seu nome será preservado. Esta ação não pode ser desfeita.');
  if (!confirmed) return;

  appData = clearActiveWeekData(appData);

  if (!appData.activeWeekId) {
    appData = createNewWeek(appData);
  }

  persistCurrentState();
  refreshUi();
  clearStatus();
}

function handleOpenWeek(weekId) {
  appData = setActiveWeek(appData, weekId);
  persistCurrentState();
  refreshUi();
}

async function handleDeleteWeek(weekId) {
  var confirmed = await showConfirmDialog('Deseja excluir esta semana do histórico? Esta ação não pode ser desfeita.');
  if (!confirmed) return;

  appData = deleteWeek(appData, weekId);
  persistCurrentState();
  refreshUi();
}

function handleBackToCurrentWeek() {
  var currentWeekId = getCurrentWeekId(appData);
  if (!currentWeekId) {
    showStatus('A semana atual ainda não existe. Inicie uma nova semana para continuar.', 'warn');
    return;
  }
  appData = setActiveWeek(appData, currentWeekId);
  persistCurrentState();
  refreshUi();
  clearStatus();
}

async function handleNewWeek() {
  var activeWeek = getActiveWeek(appData);
  if (activeWeek && activeWeek.status !== 'done') {
    var shouldConclude = await showConfirmDialog('Deseja concluir a semana atual antes de iniciar uma nova?');
    if (shouldConclude) {
      appData = markWeekDone(appData, activeWeek.id);
    }
  }

  appData = createNewWeek(appData);
  persistCurrentState();
  refreshUi();
  clearStatus();
}

async function handleImport(event) {
  var file = event.target.files && event.target.files[0];
  event.target.value = '';

  if (!file) return;

  try {
    var result = await importBackupFile(file, appData);
    if (result.canceled) return;

    appData = ensureCurrentWeek(result.data);
    if (!persistCurrentState()) return;

    refreshUi();
    showStatus('Backup importado com sucesso.', 'success');
  } catch (error) {
    showStatus(error && error.message ? error.message : 'Falha ao importar backup.', 'error');
  }
}

function initializeResponsiveWeek() {
  var table = document.querySelector('table.week');
  var dayHeaders = Array.from(table.querySelectorAll('thead th')).slice(1).map(function (th) { return th.textContent.trim(); });
  var rows = Array.from(table.querySelectorAll('tbody tr'));
  var cardsContainer = document.getElementById('weekCards');

  rows.forEach(function (row, rowIndex) {
    var activity = row.querySelector('th').textContent.trim();
    var inputs = row.querySelectorAll('td input[type="checkbox"]');
    inputs.forEach(function (input, dayIndex) {
      var key = 'routine-' + rowIndex + '-' + dayIndex;
      input.dataset.checkboxKey = key;
      input.id = key;
      var srLabel = document.createElement('label');
      srLabel.className = 'sr-only';
      srLabel.setAttribute('for', key);
      srLabel.textContent = activity + ' - ' + dayHeaders[dayIndex];
      input.parentElement.appendChild(srLabel);
    });
  });

  dayHeaders.forEach(function (day, dayIndex) {
    var card = document.createElement('article');
    card.className = 'week-card';
    var title = document.createElement('h3');
    title.textContent = day;
    card.appendChild(title);

    var list = document.createElement('ul');
    list.className = 'week-card-list';

    rows.forEach(function (row, rowIndex) {
      var activity = row.querySelector('th').textContent.trim();
      var key = 'routine-' + rowIndex + '-' + dayIndex;

      var li = document.createElement('li');
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.checkboxKey = key;
      checkbox.id = 'mobile-' + key;

      var label = document.createElement('label');
      label.setAttribute('for', checkbox.id);
      label.textContent = activity;

      li.appendChild(checkbox);
      li.appendChild(label);
      list.appendChild(li);
    });

    card.appendChild(list);
    cardsContainer.appendChild(card);
  });

  document.querySelectorAll('.exame-list input[type="checkbox"]').forEach(function (checkbox) {
    checkbox.dataset.checkboxKey = checkbox.id;
  });
}

function bindCheckboxEvents() {
  document.querySelectorAll('[data-checkbox-key]').forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
      syncCheckboxes(checkbox.dataset.checkboxKey, checkbox.checked, checkbox);
      save();
    });
  });
}

function initializeVirtues() {
  var chips = Array.from(document.querySelectorAll('#virtueChips button.chip'));

  function clearChipSelection() {
    chips.forEach(function (item) {
      item.classList.remove('on');
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var wasOn = chip.classList.contains('on');
      clearChipSelection();
      if (!wasOn) chip.classList.add('on');
      var otherVirtue = document.getElementById('otherVirtueInput');
      if (!wasOn && otherVirtue) otherVirtue.value = '';
      save();
    });
  });

  document.getElementById('otherVirtueInput').addEventListener('input', function () {
    if (this.value.trim()) {
      clearChipSelection();
    }
    save();
  });
}

function initializeTooltips() {
  var descriptions = {
    'Paciência': 'Aprender a esperar com serenidade, acolher as dificuldades e tratar os outros com calma.',
    'Justiça': 'Dar a cada pessoa aquilo que lhe é devido, agindo com honestidade e respeito.',
    'Verdade': 'Falar e viver com sinceridade, evitando mentiras e falsidades.',
    'Pureza': 'Buscar pensamentos, palavras e atitudes que aproximem de Deus e respeitem a dignidade das pessoas.',
    'Mansidão': 'Responder com calma mesmo diante das dificuldades ou provocações.',
    'Temperança': 'Usar com equilíbrio tudo aquilo que faz parte da vida, sem exageros.',
    'Caridade': 'Amar concretamente o próximo através de atitudes, ajuda, perdão e cuidado.'
  };

  var tooltip = document.createElement('div');
  tooltip.className = 'virtue-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.id = 'virtue-tooltip';
  document.body.appendChild(tooltip);
  var activeTooltipChip = null;
  var tooltipTimeout = null;

  function showTooltip(chip) {
    if (activeTooltipChip === chip && tooltip.classList.contains('show')) return;
    var virtue = chip.dataset.virtue;
    tooltip.textContent = descriptions[virtue] || '';
    if (activeTooltipChip) activeTooltipChip.removeAttribute('aria-describedby');
    chip.setAttribute('aria-describedby', tooltip.id);
    activeTooltipChip = chip;
    tooltip.classList.add('show');
    positionTooltip(chip, tooltip, TOOLTIP_MARGIN_PX);
  }

  function hideTooltip(optionalChip) {
    tooltip.classList.remove('show');
    var targetChip = optionalChip || activeTooltipChip;
    if (targetChip) targetChip.removeAttribute('aria-describedby');
    activeTooltipChip = null;
  }

  document.querySelectorAll('#virtueChips button.chip').forEach(function (chip) {
    chip.addEventListener('mouseenter', function () { showTooltip(chip); });
    chip.addEventListener('mouseleave', function () { hideTooltip(chip); });
    chip.addEventListener('focus', function () { showTooltip(chip); });
    chip.addEventListener('blur', function () { hideTooltip(chip); });
    chip.addEventListener('touchstart', function () {
      tooltipTimeout = setTimeout(function () { showTooltip(chip); }, TOOLTIP_DELAY_MS);
    }, { passive: true });
    chip.addEventListener('touchend', function () {
      clearTimeout(tooltipTimeout);
      hideTooltip(chip);
    }, { passive: true });
    chip.addEventListener('touchcancel', function () {
      clearTimeout(tooltipTimeout);
      hideTooltip(chip);
    }, { passive: true });
  });

  window.addEventListener('scroll', function () { hideTooltip(); }, { passive: true });
  window.addEventListener('resize', function () { hideTooltip(); });
}

function initializeInputs() {
  var els = getFormElements();
  [els.name, els.weekStart, els.weekEnd, els.intention].forEach(function (field) {
    field.addEventListener('input', save);
  });

  document.getElementById('clearBtn').addEventListener('click', handleClear);
  document.getElementById('newWeekBtn').addEventListener('click', handleNewWeek);
  document.getElementById('backToCurrentBtn').addEventListener('click', handleBackToCurrentWeek);

  document.getElementById('exportBtn').addEventListener('click', function () {
    exportBackup(appData);
    showStatus('Backup exportado com sucesso. Guarde o arquivo em local seguro.', 'success');
  });

  var importInput = document.getElementById('importFileInput');
  importInput.addEventListener('change', handleImport);
  document.getElementById('importBtn').addEventListener('click', function () {
    importInput.click();
  });
}

function init() {
  initializeResponsiveWeek();

  var loadResult = loadAppData();
  appData = ensureCurrentWeek(loadResult.data);

  if (!persistCurrentState()) {
    appData = loadResult.data;
  }

  refreshUi();
  initializeVirtues();
  initializeTooltips();
  initializeInputs();
  bindCheckboxEvents();

  if (!loadResult.storageAvailable) {
    showStatus('O armazenamento local não está disponível. Os dados não serão salvos entre sessões.', 'error');
  } else if (loadResult.warnings.length > 0) {
    showStatus(loadResult.warnings[0], 'warn');
  }

  if (loadResult.migrated) {
    console.info('[app] Dados do MVP1 migrados com sucesso para o formato v2.');
  }
}

document.addEventListener('DOMContentLoaded', init);
