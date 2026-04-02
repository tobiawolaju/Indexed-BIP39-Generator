import { entropyToMnemonic, wordlists } from 'bip39';

const MAX_INDEX = (1n << 128n) - 1n;
const WORDLIST = wordlists.english;

function assertValidIndex(index) {
  if (typeof index !== 'bigint') {
    throw new TypeError('Index must be a BigInt. Example: 42n');
  }

  if (index < 0n || index > MAX_INDEX) {
    throw new RangeError(`Index must be between 0 and ${MAX_INDEX.toString()}.`);
  }
}

function indexToEntropyHex(index) {
  return index.toString(16).padStart(32, '0');
}

export function indexToMnemonic(index) {
  assertValidIndex(index);

  const entropyHex = indexToEntropyHex(index);
  return entropyToMnemonic(entropyHex, WORDLIST);
}

export { MAX_INDEX };
