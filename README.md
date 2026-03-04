# Indexed-BIP39-Generator

A **deterministic BIP39 12-word mnemonic generator** with indexing.  
This project allows you to generate any valid 12-word mnemonic phrase based on an **index number**. Each index corresponds to a unique and valid BIP39 wallet, enabling a theoretical enumeration of all 12-word wallets.

> ⚠️ Note: The total number of possible 12-word mnemonics is **2¹²⁸ ≈ 3.4 × 10³⁸**. This generator is for **educational and research purposes only**.

---

## Table of Contents

- [Introduction](#introduction)  
- [How It Works](#how-it-works)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Examples](#examples)  
- [Important Notes](#important-notes)  
- [License](#license)  

---

## Introduction

BIP39 defines how to generate mnemonic phrases for deterministic wallets. A **12-word mnemonic** is generated from:

- 128 bits of entropy  
- 4 bits checksum (first 4 bits of SHA256(entropy))  
- Total: 132 bits → split into 12 groups of 11 bits  
- Each 11-bit chunk indexes the **BIP39 wordlist (2048 words)**

The **Indexed-BIP39-Generator** allows you to generate a mnemonic by supplying a **unique index**, which maps deterministically to the 128-bit entropy:

```

Index → 128-bit entropy → checksum → 12-word mnemonic

````

---

## How It Works

1. **Input**: An index number (0 to 2¹²⁸ - 1)  
2. **Convert**: Index → 128-bit entropy  
3. **Add Checksum**: SHA256(entropy) → first 4 bits → append to entropy  
4. **Split**: 132 bits → 12 chunks of 11 bits  
5. **Map to Words**: Each 11-bit value selects a word from the BIP39 wordlist  
6. **Output**: A valid 12-word mnemonic  

> Every valid output is a legitimate BIP39 wallet seed.

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/tobiawolaju/Indexed-BIP39-Generator.git
cd Indexed-BIP39-Generator
````

2. Install dependencies (Node.js 18+ recommended):

```bash
npm install
```

Dependencies may include:

* `bip39` – for validating mnemonics
* `bigint-buffer` – for handling 128-bit integers

---

## Usage

```javascript
import { indexToMnemonic } from './index.js';

// Example index
const index = 42n; // BigInt is recommended for large indices

const mnemonic = indexToMnemonic(index);
console.log('Mnemonic for index', index.toString(), ':', mnemonic);
```

---

## Examples

```javascript
indexToMnemonic(0n);
// Output: first valid 12-word mnemonic

indexToMnemonic(1n);
// Output: second valid 12-word mnemonic

indexToMnemonic(340282366920938463463374607431768211455n);
// Output: last valid 12-word mnemonic
```

> All outputs are guaranteed to be **valid BIP39 12-word mnemonics**.

---

## Important Notes

* Maximum index: `2^128 - 1`
* Any index outside this range is invalid
* **This generator is deterministic**: the same index always produces the same mnemonic
* Enumerating all mnemonics is **theoretically possible**, but practically impossible due to the enormous keyspace

---

## License

MIT License © [Tobia Wolaju](https://github.com/tobiawolaju)

---

This repository is for **learning and experimentation** with BIP39 mnemonics and deterministic wallet generation.
