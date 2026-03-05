import { createHash } from 'node:crypto';
import { wordlists } from 'bip39';

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

function indexToEntropyBuffer(index) {
  const entropy = Buffer.alloc(16);
  let value = index;

  for (let i = 15; i >= 0; i -= 1) {
    entropy[i] = Number(value & 0xffn);
    value >>= 8n;
  }

  return entropy;
}

function checksumNibble(entropyBuffer) {
  const hash = createHash('sha256').update(entropyBuffer).digest();
  return BigInt(hash[0] >> 4);
}

export function indexToMnemonic(index) {
  assertValidIndex(index);

  const entropyBuffer = indexToEntropyBuffer(index);
  const checksum = checksumNibble(entropyBuffer);
  const combined = (index << 4n) | checksum;

  const words = [];
  for (let i = 0; i < 12; i += 1) {
    const shift = BigInt(132 - (i + 1) * 11);
    const wordIndex = Number((combined >> shift) & 0x7ffn);
    words.push(WORDLIST[wordIndex]);
  }

  return words.join(' ');
}

export { MAX_INDEX };
