import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatNumber } from '../src/game/format.js';

test('small number uses thousands separators', () => {
  assert.equal(formatNumber(12345), '12,345');
});

test('large number uses mantissa and scale word', () => {
  assert.equal(formatNumber(1234567), '1.235 million');
  assert.equal(formatNumber(2.5e9), '2.500 billion');
  assert.equal(formatNumber(1e12), '1.000 trillion');
});

test('fractional rate shows one decimal', () => {
  assert.equal(formatNumber(0.1), '0.1');
  assert.equal(formatNumber(0.1 + 0.2), '0.3');
  assert.equal(formatNumber(12.34), '12.3');
});

test('whole numbers below 1000 show no decimals', () => {
  assert.equal(formatNumber(0), '0');
  assert.equal(formatNumber(999), '999');
});
