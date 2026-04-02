# Indexed-BIP39-Generator

A monorepo with:

- `indexToMnemonic`: publishable JavaScript npm package that converts an index (`0..2^128-1`) into a valid deterministic BIP39 12-word mnemonic.
- `client`: Svelte + HTML demo app that uses the package and computes paginated rows directly in the browser (serverless).

## Project Structure

- `indexToMnemonic/` – main package (`index-to-mnemonic`)
- `client/` – Svelte demo UI

## How it works

For a given index:

1. Convert index to 128-bit entropy (16 bytes)
2. Compute SHA256(entropy)
3. Append first 4 bits of hash as checksum
4. Split 132 bits into 12 chunks of 11 bits
5. Map each chunk to a BIP39 word (English wordlist)

This guarantees deterministic and valid BIP39 12-word mnemonics.

## Install

From repo root:

```bash
npm install
```

## Use the npm package (`indexToMnemonic`)

```js
import { indexToMnemonic, MAX_INDEX } from 'index-to-mnemonic';

const mnemonic = indexToMnemonic(42n);
console.log(mnemonic);
console.log(MAX_INDEX.toString());
```

### Package development commands

```bash
npm run test -w index-to-mnemonic
npm run build -w index-to-mnemonic
```

## Run demo client (Svelte + HTML)

```bash
npm run dev -w indexed-bip39-demo-client
```

Then open the local Vite URL. The app calculates mnemonics in-browser and displays 1,000 wallets per page with seed phrase and ETH balance.

### Client build

```bash
npm run build -w indexed-bip39-demo-client
```

## Notes

- Index must be passed as a `BigInt` (`42n`)
- Supported range is `0` to `2^128 - 1`
- Same index always returns the same mnemonic

## License

MIT
