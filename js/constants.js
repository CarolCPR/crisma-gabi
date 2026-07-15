/** @module constants */

/** Chave legada do MVP1 — nunca apagar */
export const LEGACY_KEY = 'crismaWeekPlanData';

/** Chave principal do MVP2 */
export const APP_KEY = 'crismaAppData';

/** Versão atual do modelo de dados */
export const DATA_VERSION = 2;

/** Modos possíveis para virtude */
export const VIRTUE_MODES = /** @type {const} */ ({
  NONE: 'none',
  PREDEFINED: 'predefined',
  CUSTOM: 'custom',
});

/** Status possíveis de uma semana */
export const WEEK_STATUS = /** @type {const} */ ({
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
});

/** Delay do tooltip em milissegundos */
export const TOOLTIP_DELAY_MS = 450;

/** Margem do tooltip em pixels */
export const TOOLTIP_MARGIN_PX = 10;
