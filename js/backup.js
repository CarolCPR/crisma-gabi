/** @module backup */
import { DATA_VERSION } from './constants.js';
import { validateAppData } from './storage.js';

function buildBackupPayload(appData) {
  return {
    version: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    data: appData,
  };
}

function downloadJsonFile(content, filename) {
  var blob = new Blob([content], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildFilename() {
  var date = new Date();
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, '0');
  var d = String(date.getDate()).padStart(2, '0');
  return 'plano-crisma-backup-' + y + '-' + m + '-' + d + '.json';
}

export function exportBackup(appData) {
  var payload = buildBackupPayload(appData);
  var json = JSON.stringify(payload, null, 2);
  downloadJsonFile(json, buildFilename());
}

function readJsonFile(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () { resolve(String(reader.result || '')); };
    reader.onerror = function () { reject(new Error('Falha ao ler arquivo.')); };
    reader.readAsText(file);
  });
}

function parseImportedPayload(jsonText) {
  var parsed = JSON.parse(jsonText);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Formato inválido.');
  }

  if (parsed.version !== DATA_VERSION) {
    throw new Error('Versão do backup incompatível.');
  }

  if (!parsed.data || typeof parsed.data !== 'object' || !validateAppData(parsed.data)) {
    throw new Error('Estrutura de dados inválida no backup.');
  }

  return parsed.data;
}

function mergeWeeks(currentWeeks, incomingWeeks) {
  var byId = {};

  currentWeeks.forEach(function (week) {
    byId[week.id] = week;
  });

  incomingWeeks.forEach(function (week) {
    var existing = byId[week.id];
    if (!existing) {
      byId[week.id] = week;
      return;
    }

    var existingUpdatedAt = existing.updatedAt || '';
    var incomingUpdatedAt = week.updatedAt || '';
    byId[week.id] = incomingUpdatedAt >= existingUpdatedAt ? week : existing;
  });

  return Object.keys(byId).map(function (id) { return byId[id]; });
}

function mergeAppData(currentData, importedData) {
  var mergedWeeks = mergeWeeks(currentData.weeks, importedData.weeks);
  var importedActiveExists = mergedWeeks.some(function (week) { return week.id === importedData.activeWeekId; });

  return {
    version: DATA_VERSION,
    activeWeekId: importedActiveExists ? importedData.activeWeekId : currentData.activeWeekId,
    profile: {
      name: importedData.profile && importedData.profile.name ? importedData.profile.name : currentData.profile.name,
    },
    weeks: mergedWeeks,
    meta: Object.assign({}, currentData.meta, importedData.meta),
  };
}

export async function importBackupFile(file, currentData) {
  var text = await readJsonFile(file);
  var importedData = parseImportedPayload(text);

  var mode = window.prompt('Backup encontrado. Digite "substituir" para trocar todos os dados ou "mesclar" para combinar com os dados atuais.');
  if (!mode) {
    return { canceled: true, data: currentData };
  }

  var normalized = mode.trim().toLowerCase();
  if (normalized !== 'substituir' && normalized !== 'mesclar') {
    throw new Error('Opção inválida. Digite substituir ou mesclar.');
  }

  if (normalized === 'substituir') {
    if (!window.confirm('Tem certeza de que deseja substituir os dados atuais pelo backup?')) {
      return { canceled: true, data: currentData };
    }
    return { canceled: false, data: importedData };
  }

  return { canceled: false, data: mergeAppData(currentData, importedData) };
}
