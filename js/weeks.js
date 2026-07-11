/** @module weeks */
import { WEEK_STATUS, VIRTUE_MODES } from './constants.js';
import { createEmptyWeek } from './storage.js';

/**
 * Localiza a semana ativa no objeto AppData.
 * @param {import('./storage.js').AppData} appData
 * @returns {import('./storage.js').WeekData|null}
 */
export function getActiveWeek(appData) {
  if (!appData || !Array.isArray(appData.weeks)) return null;
  if (!appData.activeWeekId) return null;
  return appData.weeks.find(function (w) { return w.id === appData.activeWeekId; }) || null;
}

/**
 * Cria uma semana nova e define-a como ativa.
 * Não apaga semanas anteriores.
 * @param {import('./storage.js').AppData} appData
 * @returns {import('./storage.js').AppData} novo appData (não mutado)
 */
export function createNewWeek(appData) {
  var week = createEmptyWeek();
  var updated = Object.assign({}, appData, {
    activeWeekId: week.id,
    weeks: appData.weeks.concat([week]),
  });
  return updated;
}

/**
 * Atualiza os campos editáveis da semana ativa.
 * @param {import('./storage.js').AppData} appData
 * @param {Partial<import('./storage.js').WeekData>} changes
 * @returns {import('./storage.js').AppData}
 */
export function updateActiveWeek(appData, changes) {
  if (!appData.activeWeekId) return appData;
  var now = new Date().toISOString();
  var updatedWeeks = appData.weeks.map(function (w) {
    if (w.id !== appData.activeWeekId) return w;
    return Object.assign({}, w, changes, { updatedAt: now });
  });
  return Object.assign({}, appData, { weeks: updatedWeeks });
}

/**
 * Limpa apenas os dados da semana ativa (intenção, virtude, checkboxes, datas),
 * preservando o id, createdAt e o perfil raiz.
 * @param {import('./storage.js').AppData} appData
 * @returns {import('./storage.js').AppData}
 */
export function clearActiveWeekData(appData) {
  if (!appData.activeWeekId) {
    // sem semana ativa: criar semana nova limpa
    return createNewWeek(appData);
  }
  var now = new Date().toISOString();
  var updatedWeeks = appData.weeks.map(function (w) {
    if (w.id !== appData.activeWeekId) return w;
    return {
      id: w.id,
      startDate: '',
      endDate: '',
      displayStartDate: '',
      displayEndDate: '',
      status: WEEK_STATUS.IN_PROGRESS,
      intention: '',
      virtue: { mode: VIRTUE_MODES.NONE, value: '' },
      checkboxes: {},
      createdAt: w.createdAt,
      updatedAt: now,
    };
  });
  return Object.assign({}, appData, { weeks: updatedWeeks });
}
