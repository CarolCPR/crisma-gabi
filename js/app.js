/** @module app */
import { TOOLTIP_DELAY_MS, TOOLTIP_MARGIN_PX, VIRTUE_MODES } from './constants.js';
import { loadAppData, saveAppData } from './storage.js';
import { getActiveWeek, updateActiveWeek, clearActiveWeekData, createNewWeek } from './weeks.js';
import {
  showStatus,
  clearStatus,
  getFormElements,
  populateForm,
  getSelectedVirtueChip,
  collectCheckboxes,
  syncCheckboxes,
  positionTooltip,
} from './ui.js';

// ---------------------------------------------------------------------------
// Estado em memória
// ---------------------------------------------------------------------------

/** @type {import('./storage.js').AppData} */
var appData;

// ---------------------------------------------------------------------------
// Leitura do formulário → semana
// ---------------------------------------------------------------------------

function readFormIntoWeek() {
  var els = getFormElements();
  var virtueChip = getSelectedVirtueChip();
  var customVirtue = els.otherVirtue.value.trim();

  var virtueMode = VIRTUE_MODES.NONE;
  var virtueValue = '';

  // custom tem precedência se customVirtue preenchido
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

// ---------------------------------------------------------------------------
// Salvar estado atual
// ---------------------------------------------------------------------------

function save() {
  var els = getFormElements();
  // Atualiza nome no perfil raiz
  appData = Object.assign({}, appData, {
    profile: { name: els.name.value },
  });

  var weekChanges = readFormIntoWeek();
  appData = updateActiveWeek(appData, weekChanges);

  var result = saveAppData(appData);
  if (!result.ok) {
    showStatus('Não foi possível salvar as alterações. Verifique o espaço de armazenamento do navegador.', 'error');
  }
}

// ---------------------------------------------------------------------------
// Limpar plano (apenas semana ativa)
// ---------------------------------------------------------------------------

function handleClear() {
  if (!window.confirm('Deseja limpar o plano desta semana? O seu nome e a estrutura serão preservados. Esta ação não pode ser desfeita.')) return;

  appData = clearActiveWeekData(appData);

  // Garantir que existe semana ativa após limpar
  if (!appData.activeWeekId) {
    appData = createNewWeek(appData);
  }

  var result = saveAppData(appData);

  var activeWeek = getActiveWeek(appData);
  populateForm(activeWeek, appData.profile.name);

  if (!result.ok) {
    showStatus('Não foi possível salvar após limpar o plano.', 'error');
  } else {
    clearStatus();
  }
}

// ---------------------------------------------------------------------------
// Tabela responsiva + data-checkbox-key
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Eventos de checkboxes
// ---------------------------------------------------------------------------

function bindCheckboxEvents() {
  document.querySelectorAll('[data-checkbox-key]').forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
      syncCheckboxes(checkbox.dataset.checkboxKey, checkbox.checked, checkbox);
      save();
    });
  });
}

// ---------------------------------------------------------------------------
// Virtudes e tooltips
// ---------------------------------------------------------------------------

function initializeVirtues() {
  document.querySelectorAll('#virtueChips button.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var wasOn = chip.classList.contains('on');
      document.querySelectorAll('#virtueChips button.chip').forEach(function (item) {
        item.classList.remove('on');
      });
      if (!wasOn) chip.classList.add('on');
      // limpar campo de virtude customizada se selecionar chip predefinido
      var otherVirtue = document.getElementById('otherVirtueInput');
      if (!wasOn && otherVirtue) otherVirtue.value = '';
      save();
    });
  });

  document.getElementById('otherVirtueInput').addEventListener('input', function () {
    // limpar chips se usuário digitar virtude customizada
    if (this.value.trim()) {
      document.querySelectorAll('#virtueChips button.chip').forEach(function (chip) {
        chip.classList.remove('on');
      });
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

// ---------------------------------------------------------------------------
// Campos de texto e datas
// ---------------------------------------------------------------------------

function initializeInputs() {
  var els = getFormElements();
  [els.name, els.weekStart, els.weekEnd, els.intention].forEach(function (field) {
    field.addEventListener('input', save);
  });
  document.getElementById('clearBtn').addEventListener('click', handleClear);
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

function init() {
  // 1. Construir estrutura responsiva antes de restaurar dados
  initializeResponsiveWeek();

  // 2. Carregar dados (com migração automática se necessário)
  var loadResult = loadAppData();
  appData = loadResult.data;

  // 3. Garantir que existe ao menos uma semana ativa
  if (!appData.activeWeekId || !getActiveWeek(appData)) {
    appData = createNewWeek(appData);
    saveAppData(appData);
  }

  // 4. Popular formulário
  var activeWeek = getActiveWeek(appData);
  populateForm(activeWeek, appData.profile.name);

  // 5. Inicializar interações (após restaurar estado, para não disparar save() prematuro)
  initializeVirtues();
  initializeTooltips();
  initializeInputs();
  bindCheckboxEvents();

  // 6. Exibir avisos de armazenamento/migração ao usuário
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
