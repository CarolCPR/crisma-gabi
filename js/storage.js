/** @module storage */
import { LEGACY_KEY, APP_KEY, DATA_VERSION, VIRTUE_MODES, WEEK_STATUS } from './constants.js';

// ---------------------------------------------------------------------------
// Utilitários internos
// ---------------------------------------------------------------------------

/**
 * Verifica se o localStorage está disponível e funcional.
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    var probe = '__crisma_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Gera um ID único para uma semana.
 * Usa crypto.randomUUID quando disponível; caso contrário usa fallback baseado em
 * timestamp + número aleatório.
 * @returns {string}
 */
export function generateWeekId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // fallback moderno sem Math.random puro
  var arr = new Uint32Array(4);
  crypto.getRandomValues(arr);
  return (
    arr[0].toString(16).padStart(8, '0') + '-' +
    arr[1].toString(16).padStart(8, '0') + '-' +
    arr[2].toString(16).padStart(8, '0') + '-' +
    arr[3].toString(16).padStart(8, '0')
  );
}

// ---------------------------------------------------------------------------
// Modelos vazios
// ---------------------------------------------------------------------------

/**
 * Retorna um objeto de dados raiz vazio no formato v2.
 * @returns {AppData}
 */
export function createEmptyAppData() {
  return {
    version: DATA_VERSION,
    activeWeekId: null,
    profile: { name: '' },
    weeks: [],
    meta: {
      migratedFrom: null,
      migratedAt: null,
      lastExportAt: null,
    },
  };
}

/**
 * Retorna um objeto de semana vazio no formato v2.
 * @param {string} [id]
 * @returns {WeekData}
 */
export function createEmptyWeek(id) {
  var now = new Date().toISOString();
  return {
    id: id || generateWeekId(),
    startDate: '',
    endDate: '',
    displayStartDate: '',
    displayEndDate: '',
    status: WEEK_STATUS.IN_PROGRESS,
    intention: '',
    virtue: { mode: VIRTUE_MODES.NONE, value: '' },
    checkboxes: {},
    createdAt: now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// Validação defensiva
// ---------------------------------------------------------------------------

/**
 * Valida a estrutura mínima de um objeto AppData.
 * Retorna true se o objeto é utilizável; false caso contrário.
 * @param {unknown} obj
 * @returns {boolean}
 */
export function validateAppData(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.version !== DATA_VERSION) return false;
  if (!Array.isArray(obj.weeks)) return false;
  if (typeof obj.profile !== 'object' || obj.profile === null) return false;
  if (typeof obj.meta !== 'object' || obj.meta === null) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Leitura e escrita
// ---------------------------------------------------------------------------

/**
 * Lê a chave legada do MVP1 sem apagá-la.
 * @returns {{ raw: string|null, parsed: object|null, parseError: boolean }}
 */
export function readLegacyData() {
  try {
    var raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return { raw: null, parsed: null, parseError: false };
    try {
      var parsed = JSON.parse(raw);
      return { raw: raw, parsed: parsed, parseError: false };
    } catch (_) {
      return { raw: raw, parsed: null, parseError: true };
    }
  } catch (e) {
    console.warn('[storage] Erro ao ler chave legada:', e);
    return { raw: null, parsed: null, parseError: false };
  }
}

/**
 * Cria um backup em memória do estado atual (APP_KEY + LEGACY_KEY).
 * Útil para desfazer uma migração com falha.
 * @returns {{ appRaw: string|null, legacyRaw: string|null }}
 */
export function createSafeBackupInMemory() {
  var appRaw = null;
  var legacyRaw = null;
  try { appRaw = localStorage.getItem(APP_KEY); } catch (_) { /* silencioso */ }
  try { legacyRaw = localStorage.getItem(LEGACY_KEY); } catch (_) { /* silencioso */ }
  return { appRaw: appRaw, legacyRaw: legacyRaw };
}

/**
 * Salva o objeto AppData na chave principal.
 * @param {AppData} data
 * @returns {{ ok: boolean, error: Error|null }}
 */
export function saveAppData(data) {
  try {
    localStorage.setItem(APP_KEY, JSON.stringify(data));
    return { ok: true, error: null };
  } catch (e) {
    console.warn('[storage] Falha ao salvar dados:', e);
    return { ok: false, error: e };
  }
}

/**
 * Carrega o AppData da chave principal.
 * Executa migração se necessário.
 *
 * @returns {{
 *   data: AppData,
 *   warnings: string[],
 *   migrated: boolean,
 *   storageAvailable: boolean
 * }}
 */
export function loadAppData() {
  var warnings = [];
  var migrated = false;

  if (!isStorageAvailable()) {
    console.warn('[storage] localStorage indisponível.');
    return {
      data: createEmptyAppData(),
      warnings: ['O armazenamento local não está disponível neste navegador. Os dados não serão salvos.'],
      migrated: false,
      storageAvailable: false,
    };
  }

  // Tenta ler a chave v2
  var raw = null;
  try {
    raw = localStorage.getItem(APP_KEY);
  } catch (e) {
    warnings.push('Não foi possível acessar os dados salvos.');
    console.warn('[storage] Erro ao ler APP_KEY:', e);
    return { data: createEmptyAppData(), warnings: warnings, migrated: false, storageAvailable: true };
  }

  if (raw) {
    var parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      warnings.push('Os dados salvos estão em formato inválido. Um novo plano foi iniciado. Os dados anteriores foram preservados no armazenamento do navegador e podem ser recuperados via DevTools (Application → Local Storage → ' + APP_KEY + ').');
      console.warn('[storage] JSON inválido em APP_KEY — mantendo chave intacta:', e);
      return { data: createEmptyAppData(), warnings: warnings, migrated: false, storageAvailable: true };
    }

    if (validateAppData(parsed)) {
      return { data: parsed, warnings: warnings, migrated: false, storageAvailable: true };
    } else {
      warnings.push('Os dados salvos são de uma versão incompatível. Um novo plano foi iniciado.');
      console.warn('[storage] Objeto APP_KEY inválido — mantendo chave intacta:', parsed);
      return { data: createEmptyAppData(), warnings: warnings, migrated: false, storageAvailable: true };
    }
  }

  // Chave v2 ausente — tentar migração do MVP1
  var migrationResult = migrateLegacyData();
  if (migrationResult.migrated) {
    migrated = true;
    if (migrationResult.warnings.length) {
      warnings = warnings.concat(migrationResult.warnings);
    }
    return { data: migrationResult.data, warnings: warnings, migrated: true, storageAvailable: true };
  }

  if (migrationResult.warnings.length) {
    warnings = warnings.concat(migrationResult.warnings);
  }

  // Nenhum dado encontrado — começar do zero
  return { data: createEmptyAppData(), warnings: warnings, migrated: false, storageAvailable: true };
}

// ---------------------------------------------------------------------------
// Migração MVP1 → MVP2
// ---------------------------------------------------------------------------

/**
 * Detecta se um objeto legado contém dados relevantes preenchidos pelo usuário.
 * @param {object} parsed
 * @returns {boolean}
 */
function hasRelevantLegacyData(parsed) {
  if (!parsed || typeof parsed !== 'object') return false;
  if (parsed.name && parsed.name.trim()) return true;
  if (parsed.intention && parsed.intention.trim()) return true;
  if (parsed.weekStart && parsed.weekStart.trim()) return true;
  if (parsed.weekEnd && parsed.weekEnd.trim()) return true;
  if (parsed.selectedVirtue && parsed.selectedVirtue.trim()) return true;
  if (parsed.customVirtue && parsed.customVirtue.trim()) return true;
  if (parsed.checkboxes && typeof parsed.checkboxes === 'object') {
    var keys = Object.keys(parsed.checkboxes);
    for (var i = 0; i < keys.length; i++) {
      if (parsed.checkboxes[keys[i]] === true) return true;
    }
  }
  return false;
}

/**
 * Tenta converter uma string de data no formato "dd/mm" para ISO "YYYY-MM-DD"
 * usando o ano atual quando não há ambiguidade.
 * Retorna string vazia se não for possível converter com segurança.
 * @param {string} value
 * @returns {string}
 */
function tryConvertDateToISO(value) {
  if (!value || typeof value !== 'string') return '';
  var trimmed = value.trim();
  // aceita apenas "dd/mm" (sem ano) — não inventar ano diferente
  var match = trimmed.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!match) return '';
  var day = parseInt(match[1], 10);
  var month = parseInt(match[2], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return '';
  var year = new Date().getFullYear();
  var iso = year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  // Validar usando UTC para evitar deslocamentos de fuso horário
  var d = new Date(iso + 'T00:00:00Z');
  if (isNaN(d.getTime()) || d.getUTCMonth() + 1 !== month || d.getUTCDate() !== day) return '';
  return iso;
}

/**
 * Executa a migração dos dados do MVP1 para o formato v2.
 * Idempotente: verifica se já existe APP_KEY antes de migrar.
 *
 * @returns {{
 *   migrated: boolean,
 *   data: AppData,
 *   warnings: string[]
 * }}
 */
export function migrateLegacyData() {
  var warnings = [];

  var legacy = readLegacyData();

  if (legacy.parseError) {
    warnings.push('O plano anterior estava com um formato inválido e não pôde ser recuperado automaticamente. Seus dados antigos foram preservados.');
    console.warn('[storage] Erro ao parsear chave legada — dados mantidos intactos.');
    return { migrated: false, data: createEmptyAppData(), warnings: warnings };
  }

  if (!legacy.parsed || !hasRelevantLegacyData(legacy.parsed)) {
    return { migrated: false, data: createEmptyAppData(), warnings: warnings };
  }

  var backup = createSafeBackupInMemory();
  var src = legacy.parsed;

  // Determinar virtude
  var hasCustom = src.customVirtue && typeof src.customVirtue === 'string' && src.customVirtue.trim() !== '';
  var hasSelected = src.selectedVirtue && typeof src.selectedVirtue === 'string' && src.selectedVirtue.trim() !== '';

  var virtueMode = VIRTUE_MODES.NONE;
  var virtueValue = '';

  if (hasCustom && hasSelected) {
    console.warn('[storage] Migração: customVirtue e selectedVirtue ambos preenchidos — customVirtue tem precedência.');
    warnings.push('O plano anterior tinha uma virtude escolhida e uma virtude personalizada ao mesmo tempo. A virtude personalizada foi mantida.');
  }
  if (hasCustom) {
    virtueMode = VIRTUE_MODES.CUSTOM;
    virtueValue = src.customVirtue.trim();
  } else if (hasSelected) {
    virtueMode = VIRTUE_MODES.PREDEFINED;
    virtueValue = src.selectedVirtue.trim();
  }

  var weekId = generateWeekId();
  var now = new Date().toISOString();

  var week = createEmptyWeek(weekId);
  week.displayStartDate = (src.weekStart && typeof src.weekStart === 'string') ? src.weekStart.trim() : '';
  week.displayEndDate = (src.weekEnd && typeof src.weekEnd === 'string') ? src.weekEnd.trim() : '';
  week.startDate = tryConvertDateToISO(week.displayStartDate);
  week.endDate = tryConvertDateToISO(week.displayEndDate);
  week.intention = (src.intention && typeof src.intention === 'string') ? src.intention : '';
  week.virtue = { mode: virtueMode, value: virtueValue };
  week.checkboxes = (src.checkboxes && typeof src.checkboxes === 'object') ? Object.assign({}, src.checkboxes) : {};
  week.createdAt = now;
  week.updatedAt = now;

  var appData = createEmptyAppData();
  appData.activeWeekId = weekId;
  appData.profile.name = (src.name && typeof src.name === 'string') ? src.name.trim() : '';
  appData.weeks = [week];
  appData.meta.migratedFrom = 'mvp1';
  appData.meta.migratedAt = now;

  var saveResult = saveAppData(appData);
  if (!saveResult.ok) {
    warnings.push('Não foi possível salvar os dados migrados. Os dados anteriores foram preservados.');
    console.warn('[storage] Falha ao salvar dados migrados — mantendo backup:', backup);
    return { migrated: false, data: createEmptyAppData(), warnings: warnings };
  }

  // Reler e validar para garantir integridade
  var verification = null;
  try {
    var verifyRaw = localStorage.getItem(APP_KEY);
    verification = verifyRaw ? JSON.parse(verifyRaw) : null;
  } catch (_) { /* ignorar */ }

  if (!validateAppData(verification)) {
    warnings.push('A migração foi concluída mas a verificação falhou. Os dados anteriores foram preservados.');
    console.warn('[storage] Verificação pós-migração falhou — dados mantidos.');
    return { migrated: false, data: createEmptyAppData(), warnings: warnings };
  }

  console.info('[storage] Migração MVP1 → MVP2 concluída com sucesso. Chave legada preservada.');
  return { migrated: true, data: appData, warnings: warnings };
}

/**
 * @typedef {Object} AppData
 * @property {number} version
 * @property {string|null} activeWeekId
 * @property {{ name: string }} profile
 * @property {WeekData[]} weeks
 * @property {{ migratedFrom: string|null, migratedAt: string|null, lastExportAt: string|null }} meta
 */

/**
 * @typedef {Object} WeekData
 * @property {string} id
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} displayStartDate
 * @property {string} displayEndDate
 * @property {string} status
 * @property {string} intention
 * @property {{ mode: string, value: string }} virtue
 * @property {Object.<string, boolean>} checkboxes
 * @property {string} createdAt
 * @property {string} updatedAt
 */
