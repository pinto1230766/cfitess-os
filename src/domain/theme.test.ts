import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACCENT_COLOR_OPTIONS,
  getAccentColorOption,
  getNextAccentColor,
  isValidAccentColor,
  isValidThemeMode,
} from './theme';

test('ACCENT_COLOR_OPTIONS exposes 6 distinct display color palettes', () => {
  assert.equal(ACCENT_COLOR_OPTIONS.length, 6);
  const ids = new Set(ACCENT_COLOR_OPTIONS.map((o) => o.id));
  assert.equal(ids.size, 6);
  assert.equal(ids.has('violet'), true);
  assert.equal(ids.has('blue'), true);
  assert.equal(ids.has('emerald'), true);
  assert.equal(ids.has('rose'), true);
  assert.equal(ids.has('amber'), true);
  assert.equal(ids.has('cyan'), true);
});

test('isValidAccentColor and isValidThemeMode validate persisted preferences', () => {
  assert.equal(isValidAccentColor('emerald'), true);
  assert.equal(isValidAccentColor('invalid-color'), false);
  assert.equal(isValidAccentColor(null), false);

  assert.equal(isValidThemeMode('dark'), true);
  assert.equal(isValidThemeMode('light'), true);
  assert.equal(isValidThemeMode('sepia'), false);
});

test('getNextAccentColor cycles through all 6 accent colors deterministically', () => {
  assert.equal(getNextAccentColor('violet'), 'blue');
  assert.equal(getNextAccentColor('blue'), 'emerald');
  assert.equal(getNextAccentColor('cyan'), 'violet');
});

test('getAccentColorOption returns matching option metadata', () => {
  const rose = getAccentColorOption('rose');
  assert.equal(rose.label, 'Rose Énergie');
  assert.equal(rose.hexPrimary, '#E11D48');
});
