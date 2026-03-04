import test from 'node:test';
import assert from 'node:assert/strict';
import bip39 from 'bip39';
import { indexToMnemonic, MAX_INDEX } from '../src/index.js';

test('generates a valid mnemonic for index 0', () => {
  const mnemonic = indexToMnemonic(0n);
  assert.equal(mnemonic.split(' ').length, 12);
  assert.equal(bip39.validateMnemonic(mnemonic), true);
});

test('is deterministic for same input', () => {
  const first = indexToMnemonic(42n);
  const second = indexToMnemonic(42n);
  assert.equal(first, second);
});

test('supports maximum index', () => {
  const mnemonic = indexToMnemonic(MAX_INDEX);
  assert.equal(bip39.validateMnemonic(mnemonic), true);
});

test('throws for out-of-range input', () => {
  assert.throws(() => indexToMnemonic(-1n), RangeError);
  assert.throws(() => indexToMnemonic(MAX_INDEX + 1n), RangeError);
});

test('throws for non-bigint input', () => {
  assert.throws(() => indexToMnemonic(42), TypeError);
});
