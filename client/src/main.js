import App from './App.svelte';

if (!globalThis.Buffer) {
  class BufferPolyfill extends Uint8Array {
    static from(value, encoding = 'utf8') {
      if (typeof value === 'string') {
        if (encoding === 'hex') {
          const normalized = value.trim();
          if (normalized.length % 2 !== 0) {
            throw new TypeError('Hex string must have an even length');
          }

          const bytes = new BufferPolyfill(normalized.length / 2);
          for (let i = 0; i < normalized.length; i += 2) {
            bytes[i / 2] = Number.parseInt(normalized.slice(i, i + 2), 16);
          }
          return bytes;
        }

        return new BufferPolyfill(new TextEncoder().encode(value));
      }

      return new BufferPolyfill(value);
    }

    static isBuffer(value) {
      return value instanceof BufferPolyfill;
    }

    toString(encoding = 'utf8') {
      if (encoding === 'hex') {
        return Array.from(this, (byte) => byte.toString(16).padStart(2, '0')).join('');
      }

      return new TextDecoder().decode(this);
    }
  }

  globalThis.Buffer = BufferPolyfill;
}

const app = new App({
  target: document.getElementById('app')
});

export default app;
