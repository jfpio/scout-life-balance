import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { content } from '../i18n';
import type { Card, CustomGameDocument, GameOverReasons, Resources } from '../types/game';
import { getFirebaseDb } from './firebase';

const CARDS_SHEET_NAME = 'Cards';
const CUSTOM_GAME_TTL_DAYS = 14;
const MAX_ACTIVE_CARDS = 200;
const MAX_SCENARIO_LENGTH = 500;
const MAX_CHOICE_LENGTH = 160;
const MAX_ICON_LENGTH = 16;
const REQUIRED_COLUMNS = [
  'card_id',
  'icon',
  'scenario_text',
  'left_choice_text',
  'left_family',
  'left_scouting',
  'left_school',
  'left_energy',
  'right_choice_text',
  'right_family',
  'right_scouting',
  'right_school',
  'right_energy',
  'status',
] as const;
const RESOURCES = ['family', 'scouting', 'school', 'energy'] as const;

type RequiredColumn = (typeof REQUIRED_COLUMNS)[number];
type ResourceKey = keyof Resources;

export interface CreateCustomGameResult {
  slug: string;
  url: string;
  expiresAt: string;
  cardCount: number;
}

export interface CreateCustomGameValidationError {
  row: number | null;
  message: string;
}

export class CustomGameApiError extends Error {
  code: string;
  errors: CreateCustomGameValidationError[];

  constructor(code: string, message: string, errors: CreateCustomGameValidationError[] = []) {
    super(message);
    this.name = 'CustomGameApiError';
    this.code = code;
    this.errors = errors;
  }
}

export const createCustomGame = async (sheetUrl: string) => {
  const spreadsheetId = extractSpreadsheetId(sheetUrl);
  const csvText = await fetchCardsCsv(spreadsheetId);
  const cards = parseCardsCsv(csvText);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CUSTOM_GAME_TTL_DAYS * 24 * 60 * 60 * 1000);
  const slug = await generateUniqueSlug();
  const document = {
    slug,
    cards,
    gameOverReasons: content.game.gameOverReasons,
    createdAt: Timestamp.fromDate(now),
    expiresAt: Timestamp.fromDate(expiresAt),
    sourceSheetUrl: sheetUrl,
    sourceSpreadsheetId: spreadsheetId,
    cardCount: cards.length,
  };

  await setDoc(doc(getFirebaseDb(), 'customGames', slug), document);

  return {
    slug,
    url: `${window.location.origin}/custom/${slug}`,
    expiresAt: expiresAt.toISOString(),
    cardCount: cards.length,
  };
};

export const loadCustomGame = async (slug: string): Promise<CustomGameDocument | null> => {
  const snapshot = await getDoc(doc(getFirebaseDb(), 'customGames', slug));
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  const expiresAt = toDate(data.expiresAt);
  if (!expiresAt || expiresAt.getTime() <= Date.now()) return null;

  if (!Array.isArray(data.cards)) return null;

  return {
    slug: String(data.slug || snapshot.id),
    cards: data.cards as Card[],
    gameOverReasons: data.gameOverReasons as GameOverReasons,
    createdAt: toDate(data.createdAt),
    expiresAt,
    sourceSheetUrl: typeof data.sourceSheetUrl === 'string' ? data.sourceSheetUrl : '',
    cardCount: typeof data.cardCount === 'number' ? data.cardCount : data.cards.length,
  };
};

const fetchCardsCsv = async (spreadsheetId: string) => {
  const sheetName = encodeURIComponent(CARDS_SHEET_NAME);
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
  const response = await fetch(csvUrl);

  if (!response.ok) {
    throw new CustomGameApiError(
      'sheet_not_accessible',
      'The Cards tab is not publicly accessible. Share the spreadsheet as anyone with the link can view.',
    );
  }

  const csvText = await response.text();
  if (csvText.trim().startsWith('<')) {
    throw new CustomGameApiError(
      'sheet_not_accessible',
      'The Cards tab did not export as CSV. Check that the sheet is public and has a Cards tab.',
    );
  }

  return csvText;
};

const parseCardsCsv = (csvText: string) => {
  const rows = parseCsv(csvText);
  const headerIndex = findHeaderIndex(rows);
  const headers = rows[headerIndex].map(normalizeHeader);
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));

  if (missingColumns.length > 0) {
    throw new CustomGameApiError('template_missing_columns', 'The Cards tab is missing required columns.', [
      { row: headerIndex + 1, message: `Missing columns: ${missingColumns.join(', ')}` },
    ]);
  }

  const columnIndex = new Map(headers.map((header, index) => [header, index]));
  const cards: Card[] = [];
  const seenIds = new Set<number>();
  const errors: CreateCustomGameValidationError[] = [];

  rows.slice(headerIndex + 1).forEach((row, index) => {
    const rowNumber = headerIndex + index + 2;
    const values = readRequiredValues(row, columnIndex);
    if (!Object.values(values).some(Boolean)) return;
    if (values.status !== 'Active') return;

    const card = parseCardRow(rowNumber, values, seenIds, errors);
    if (card) cards.push(card);
  });

  if (errors.length > 0) {
    throw new CustomGameApiError('validation_errors', 'Some active rows in the Cards tab need fixes.', errors);
  }

  if (cards.length < 1) {
    throw new CustomGameApiError('validation_errors', 'The Cards tab must contain at least one Active card.', [
      { row: null, message: 'Add at least one Active card.' },
    ]);
  }

  if (cards.length > MAX_ACTIVE_CARDS) {
    throw new CustomGameApiError('validation_errors', `Keep at most ${MAX_ACTIVE_CARDS} active cards.`, [
      { row: null, message: `Found ${cards.length} active cards.` },
    ]);
  }

  return cards;
};

const parseCardRow = (
  rowNumber: number,
  values: Record<RequiredColumn, string>,
  seenIds: Set<number>,
  errors: CreateCustomGameValidationError[],
) => {
  const rowErrors: string[] = [];
  const cardId = parseInteger(values.card_id);

  if (cardId === null) {
    rowErrors.push('card_id must be a whole number.');
  } else if (seenIds.has(cardId)) {
    rowErrors.push(`card_id ${cardId} is duplicated.`);
  } else {
    seenIds.add(cardId);
  }

  validateText(rowErrors, 'scenario_text', values.scenario_text, MAX_SCENARIO_LENGTH, true);
  validateText(rowErrors, 'left_choice_text', values.left_choice_text, MAX_CHOICE_LENGTH, true);
  validateText(rowErrors, 'right_choice_text', values.right_choice_text, MAX_CHOICE_LENGTH, true);
  validateText(rowErrors, 'icon', values.icon, MAX_ICON_LENGTH, false);

  const leftEffects = parseEffects('left', values, rowErrors);
  const rightEffects = parseEffects('right', values, rowErrors);

  if (rowErrors.length > 0 || cardId === null) {
    errors.push({ row: rowNumber, message: rowErrors.join(' ') });
    return null;
  }

  const card: Card = {
    id: cardId,
    description: values.scenario_text,
    leftChoice: { text: values.left_choice_text, effects: leftEffects },
    rightChoice: { text: values.right_choice_text, effects: rightEffects },
  };

  if (values.icon) card.image = values.icon;
  return card;
};

const parseEffects = (
  prefix: 'left' | 'right',
  values: Record<RequiredColumn, string>,
  rowErrors: string[],
) => {
  const effects: Partial<Resources> = {};

  RESOURCES.forEach((resource) => {
    const column = `${prefix}_${resource}` as RequiredColumn;
    const value = parseInteger(values[column]);
    if (value === null) {
      rowErrors.push(`${column} must be a whole number from -3 to 3.`);
      return;
    }
    if (value < -3 || value > 3) {
      rowErrors.push(`${column} must be between -3 and 3.`);
      return;
    }
    effects[resource as ResourceKey] = value;
  });

  return effects;
};

const extractSpreadsheetId = (sheetUrl: string) => {
  let parsed: URL;
  try {
    parsed = new URL(sheetUrl.trim());
  } catch {
    throw new CustomGameApiError('invalid_sheet_url', 'Use a public Google Sheets link from docs.google.com.');
  }

  if (parsed.protocol !== 'https:' || parsed.hostname !== 'docs.google.com') {
    throw new CustomGameApiError('invalid_sheet_url', 'Use a public Google Sheets link from docs.google.com.');
  }

  const match = parsed.pathname.match(/^\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match?.[1]) {
    throw new CustomGameApiError(
      'invalid_sheet_url',
      'The link must look like https://docs.google.com/spreadsheets/d/<spreadsheet_id>/...',
    );
  }

  return match[1];
};

const generateUniqueSlug = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = generateSlug();
    const existing = await getDoc(doc(getFirebaseDb(), 'customGames', slug));
    if (!existing.exists()) return slug;
  }
  throw new CustomGameApiError('slug_generation_failed', 'Could not create a unique custom game link.');
};

const generateSlug = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
};

const parseCsv = (csvText: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') index += 1;
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  rows.push(row);
  return rows.filter((parsedRow) => parsedRow.some((value) => value !== ''));
};

const findHeaderIndex = (rows: string[][]) => {
  const headerIndex = rows.slice(0, 10).findIndex((row) => {
    const headers = row.map(normalizeHeader);
    return headers.includes('card_id') && headers.includes('scenario_text');
  });

  if (headerIndex === -1) {
    throw new CustomGameApiError(
      'template_missing_columns',
      'Could not find the Cards header row. Keep the template header with card_id and scenario_text.',
    );
  }

  return headerIndex;
};

const readRequiredValues = (row: string[], columnIndex: Map<string, number>) => {
  return REQUIRED_COLUMNS.reduce<Record<RequiredColumn, string>>((values, column) => {
    const index = columnIndex.get(column);
    values[column] = index === undefined ? '' : row[index]?.trim() ?? '';
    return values;
  }, {} as Record<RequiredColumn, string>);
};

const validateText = (
  rowErrors: string[],
  field: string,
  value: string,
  maxLength: number,
  required: boolean,
) => {
  if (required && !value) rowErrors.push(`${field} is required.`);
  if (value.length > maxLength) rowErrors.push(`${field} must be ${maxLength} characters or less.`);
};

const parseInteger = (value: string) => {
  if (!/^-?\d+$/.test(value.trim())) return null;
  return Number(value);
};

const normalizeHeader = (value: string) => {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ');
  const matchingColumn = REQUIRED_COLUMNS.find((column) => {
    const columnPattern = new RegExp(`(^|\\s)${column}(\\s|$)`);
    return columnPattern.test(normalized);
  });
  return matchingColumn ?? normalized;
};

const toDate = (value: unknown) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate() as Date;
  }
  return null;
};
