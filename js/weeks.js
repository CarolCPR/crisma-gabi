/** @module weeks */
import { WEEK_STATUS, VIRTUE_MODES } from './constants.js';
import { createEmptyWeek } from './storage.js';

function pad(num) {
  return String(num).padStart(2, '0');
}

function toISODate(date) {
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}

function toDisplayDate(date) {
  return pad(date.getDate()) + '/' + pad(date.getMonth() + 1);
}

function fromISODate(isoDate) {
  if (!isoDate || typeof isoDate !== 'string') return null;
  var match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  var date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (isNaN(date.getTime())) return null;
  if (toISODate(date) !== isoDate) return null;
  return date;
}

export function getCurrentWeekRange() {
  var today = new Date();
  var day = today.getDay();
  var deltaToMonday = day === 0 ? -6 : 1 - day;
  var monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() + deltaToMonday);
  var sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startDate: toISODate(monday),
    endDate: toISODate(sunday),
    displayStartDate: toDisplayDate(monday),
    displayEndDate: toDisplayDate(sunday),
  };
}

function getNextWeekRange(baseStartISO) {
  var baseStart = fromISODate(baseStartISO);
  if (!baseStart) return getCurrentWeekRange();
  var monday = new Date(baseStart);
  monday.setDate(monday.getDate() + 7);
  var sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    startDate: toISODate(monday),
    endDate: toISODate(sunday),
    displayStartDate: toDisplayDate(monday),
    displayEndDate: toDisplayDate(sunday),
  };
}

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

export function getWeekById(appData, weekId) {
  if (!appData || !Array.isArray(appData.weeks) || !weekId) return null;
  return appData.weeks.find(function (w) { return w.id === weekId; }) || null;
}

export function getCurrentWeekId(appData) {
  if (!appData || !Array.isArray(appData.weeks)) return null;
  var current = getCurrentWeekRange();
  var found = appData.weeks.find(function (w) {
    return w.startDate === current.startDate && w.endDate === current.endDate;
  });
  return found ? found.id : null;
}

/**
 * Cria uma semana nova e define-a como ativa.
 * Não apaga semanas anteriores.
 * @param {import('./storage.js').AppData} appData
 * @returns {import('./storage.js').AppData} novo appData (não mutado)
 */
export function createNewWeek(appData) {
  var activeWeek = getActiveWeek(appData);
  var range = activeWeek && activeWeek.startDate ? getNextWeekRange(activeWeek.startDate) : getCurrentWeekRange();

  var existing = appData.weeks.find(function (w) {
    return w.startDate === range.startDate && w.endDate === range.endDate;
  });

  if (existing) {
    return Object.assign({}, appData, { activeWeekId: existing.id });
  }

  var week = createEmptyWeek();
  week.startDate = range.startDate;
  week.endDate = range.endDate;
  week.displayStartDate = range.displayStartDate;
  week.displayEndDate = range.displayEndDate;

  return Object.assign({}, appData, {
    activeWeekId: week.id,
    weeks: appData.weeks.concat([week]),
  });
}

export function ensureCurrentWeek(appData) {
  var currentWeekId = getCurrentWeekId(appData);
  if (currentWeekId) {
    return Object.assign({}, appData, { activeWeekId: currentWeekId });
  }

  var range = getCurrentWeekRange();
  var week = createEmptyWeek();
  week.startDate = range.startDate;
  week.endDate = range.endDate;
  week.displayStartDate = range.displayStartDate;
  week.displayEndDate = range.displayEndDate;

  return Object.assign({}, appData, {
    activeWeekId: week.id,
    weeks: appData.weeks.concat([week]),
  });
}

export function setActiveWeek(appData, weekId) {
  if (!getWeekById(appData, weekId)) return appData;
  return Object.assign({}, appData, { activeWeekId: weekId });
}

export function deleteWeek(appData, weekId) {
  var weekExists = getWeekById(appData, weekId);
  if (!weekExists) return appData;

  var remainingWeeks = appData.weeks.filter(function (w) { return w.id !== weekId; });

  if (remainingWeeks.length === 0) {
    return ensureCurrentWeek(Object.assign({}, appData, { activeWeekId: null, weeks: [] }));
  }

  var nextActiveId = appData.activeWeekId === weekId ? remainingWeeks[0].id : appData.activeWeekId;
  return Object.assign({}, appData, {
    activeWeekId: nextActiveId,
    weeks: remainingWeeks,
  });
}

export function getSortedWeeks(appData) {
  if (!appData || !Array.isArray(appData.weeks)) return [];
  return appData.weeks.slice().sort(function (a, b) {
    var dateA = a.startDate || '';
    var dateB = b.startDate || '';
    if (dateA > dateB) return -1;
    if (dateA < dateB) return 1;

    var updatedA = a.updatedAt || '';
    var updatedB = b.updatedAt || '';
    if (updatedA > updatedB) return -1;
    if (updatedA < updatedB) return 1;
    return 0;
  });
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

    var range = w.startDate ? {
      startDate: w.startDate,
      endDate: w.endDate,
      displayStartDate: w.displayStartDate,
      displayEndDate: w.displayEndDate,
    } : getCurrentWeekRange();

    return {
      id: w.id,
      startDate: range.startDate,
      endDate: range.endDate,
      displayStartDate: range.displayStartDate,
      displayEndDate: range.displayEndDate,
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

export function markWeekDone(appData, weekId) {
  var now = new Date().toISOString();
  var updatedWeeks = appData.weeks.map(function (week) {
    if (week.id !== weekId) return week;
    return Object.assign({}, week, { status: WEEK_STATUS.DONE, updatedAt: now });
  });
  return Object.assign({}, appData, { weeks: updatedWeeks });
}
