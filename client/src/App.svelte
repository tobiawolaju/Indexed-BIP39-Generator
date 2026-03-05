<script>
  import { indexToMnemonic, MAX_INDEX } from 'index-to-mnemonic';

  let indexInput = '0';
  let mnemonic = indexToMnemonic(0n);
  let error = '';

  function generateMnemonic() {
    error = '';
    mnemonic = '';

    try {
      if (!/^\d+$/.test(indexInput.trim())) {
        throw new Error('Please enter a non-negative integer.');
      }

      const index = BigInt(indexInput.trim());
      mnemonic = indexToMnemonic(index);
    } catch (err) {
      error = err.message;
    }
  }
</script>

<main>
  <h1>Indexed BIP39 Generator Demo</h1>
  <p>Generate a deterministic BIP39 12-word mnemonic for an index from 0 to {MAX_INDEX.toString()}.</p>

  <div class="form-row">
    <label for="index">Index</label>
    <input id="index" bind:value={indexInput} placeholder="e.g. 42" />
  </div>

  <button on:click={generateMnemonic}>Generate</button>

  {#if mnemonic}
    <section>
      <h2>Mnemonic</h2>
      <p class="mnemonic">{mnemonic}</p>
    </section>
  {/if}

  {#if error}
    <p class="error">{error}</p>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #0b1220;
    color: #e5e7eb;
  }

  main {
    max-width: 720px;
    margin: 3rem auto;
    padding: 1.5rem;
    background: #111827;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .form-row {
    display: grid;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  input {
    padding: 0.65rem;
    border-radius: 8px;
    border: 1px solid #374151;
    background: #1f2937;
    color: #fff;
  }

  button {
    background: #2563eb;
    border: none;
    color: white;
    border-radius: 8px;
    padding: 0.7rem 1rem;
    cursor: pointer;
  }

  .mnemonic {
    font-size: 1.1rem;
    line-height: 1.5;
    background: #1f2937;
    padding: 0.75rem;
    border-radius: 8px;
  }

  .error {
    color: #fca5a5;
    margin-top: 1rem;
  }
</style>
