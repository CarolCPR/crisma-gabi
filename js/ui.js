/** @module ui */

/**
 * Exibe uma mensagem de status na região aria-live do app.
 * @param {string} message - Mensagem amigável para o usuário.
 * @param {'warn'|'error'|''} [type='warn'] - Nível visual da mensagem.
 */
export function showStatus(message, type) {
  var region = document.getElementById('appStatus');
  if (!region) return;
  type = type || 'warn';
  region.textContent = message;
  region.className = 'status-' + type;
}

/**
 * Limpa a região de status.
 */
export function clearStatus() {
  var region = document.getElementById('appStatus');
  if (!region) return;
  region.textContent = '';
  region.className = '';
}

/**
 * Lê os valores dos campos editáveis do formulário.
 * @returns {{ name: HTMLInputElement, weekStart: HTMLInputElement, weekEnd: HTMLInputElement, intention: HTMLTextAreaElement, otherVirtue: HTMLInputElement }}
 */
export function getFormElements() {
  return {
    name: document.getElementById('nameInput'),
    weekStart: document.getElementById('weekStartInput'),
    weekEnd: document.getElementById('weekEndInput'),
    intention: document.getElementById('intentionInput'),
    otherVirtue: document.getElementById('otherVirtueInput'),
  };
}

/**
 * Popula os campos do formulário com os dados de uma semana.
 * @param {import('./storage.js').WeekData|null} week
 * @param {string} profileName
 */
export function populateForm(week, profileName) {
  var els = getFormElements();
  els.name.value = profileName || '';

  if (!week) {
    els.weekStart.value = '';
    els.weekEnd.value = '';
    els.intention.value = '';
    els.otherVirtue.value = '';
    clearVirtueChips();
    return;
  }

  els.weekStart.value = week.displayStartDate || '';
  els.weekEnd.value = week.displayEndDate || '';
  els.intention.value = week.intention || '';

  // Virtude
  var virtue = week.virtue || { mode: 'none', value: '' };
  if (virtue.mode === 'predefined') {
    els.otherVirtue.value = '';
    setVirtueChip(virtue.value);
  } else if (virtue.mode === 'custom') {
    els.otherVirtue.value = virtue.value || '';
    clearVirtueChips();
  } else {
    els.otherVirtue.value = '';
    clearVirtueChips();
  }

  // Checkboxes
  restoreCheckboxes(week.checkboxes || {});
}

/**
 * Desmarca todos os chips de virtude.
 */
function clearVirtueChips() {
  document.querySelectorAll('#virtueChips button.chip').forEach(function (chip) {
    chip.classList.remove('on');
  });
}

/**
 * Marca o chip correspondente ao valor informado.
 * @param {string} value
 */
function setVirtueChip(value) {
  clearVirtueChips();
  if (!value) return;
  document.querySelectorAll('#virtueChips button.chip').forEach(function (chip) {
    chip.classList.toggle('on', chip.dataset.virtue === value);
  });
}

/**
 * Retorna a virtude selecionada via chip.
 * @returns {string}
 */
export function getSelectedVirtueChip() {
  var selected = document.querySelector('#virtueChips button.chip.on');
  return selected ? selected.dataset.virtue : '';
}

/**
 * Restaura os checkboxes a partir de um mapa chave→booleano.
 * @param {Object.<string, boolean>} checkboxState
 */
export function restoreCheckboxes(checkboxState) {
  if (!checkboxState) return;
  Object.keys(checkboxState).forEach(function (key) {
    document.querySelectorAll('[data-checkbox-key="' + key + '"]').forEach(function (cb) {
      cb.checked = Boolean(checkboxState[key]);
    });
  });
}

/**
 * Coleta o estado atual de todos os checkboxes mapeados.
 * @returns {Object.<string, boolean>}
 */
export function collectCheckboxes() {
  var state = {};
  document.querySelectorAll('[data-checkbox-key]').forEach(function (cb) {
    state[cb.dataset.checkboxKey] = cb.checked;
  });
  return state;
}

/**
 * Sincroniza checkboxes com mesma chave (desktop ↔ mobile).
 * @param {string} key
 * @param {boolean} checked
 * @param {HTMLInputElement} source - Elemento que disparou o evento.
 */
export function syncCheckboxes(key, checked, source) {
  document.querySelectorAll('[data-checkbox-key="' + key + '"]').forEach(function (cb) {
    if (cb !== source) cb.checked = checked;
  });
}

/**
 * Posiciona o tooltip próximo ao chip de referência.
 * @param {HTMLElement} chip
 * @param {HTMLElement} tooltip
 * @param {number} margin
 */
export function positionTooltip(chip, tooltip, margin) {
  var rect = chip.getBoundingClientRect();
  var maxLeft = window.innerWidth - tooltip.offsetWidth - margin;
  var left = Math.min(Math.max(rect.left, margin), maxLeft);
  var top = rect.top - tooltip.offsetHeight - margin;
  if (top < margin) top = rect.bottom + margin;
  if (top + tooltip.offsetHeight > window.innerHeight - margin) {
    top = window.innerHeight - tooltip.offsetHeight - margin;
  }
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
}
