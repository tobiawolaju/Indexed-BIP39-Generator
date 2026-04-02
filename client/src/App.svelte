<script>
  import { indexToMnemonic, MAX_INDEX } from 'index-to-mnemonic';

  const PAGE_SIZE = 1000;
  const MAX_PAGE = Number(MAX_INDEX / BigInt(PAGE_SIZE));

  let page = 1;
  let totalPages = MAX_PAGE + 1;
  let rows = [];
  let loading = false;
  let error = '';

  async function loadPage(targetPage) {
    loading = true;
    error = '';

    try {
      if (!Number.isInteger(targetPage) || targetPage < 1 || targetPage > MAX_PAGE + 1) {
        throw new Error(`Provide page between 1 and ${MAX_PAGE + 1}`);
      }

      const startIndex = BigInt((targetPage - 1) * PAGE_SIZE);
      const nextRows = [];

      for (let offset = 0; offset < PAGE_SIZE; offset += 1) {
        const index = startIndex + BigInt(offset);
        if (index > MAX_INDEX) {
          break;
        }

        nextRows.push({
          index: index.toString(),
          mnemonic: indexToMnemonic(index),
          balanceEth: '0.000000'
        });
      }

      page = targetPage;
      totalPages = MAX_PAGE + 1;
      rows = nextRows;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function nextPage() {
    if (page < totalPages && !loading) {
      loadPage(page + 1);
    }
  }

  function previousPage() {
    if (page > 1 && !loading) {
      loadPage(page - 1);
    }
  }

  loadPage(page);
</script>

<main>
  <h1>Indexed Wallet Browser</h1>
  <p>Viewing deterministic wallets in pages of {PAGE_SIZE} indexes.</p>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Index</th>
          <th>Seed Phrase</th>
          <th>ETH Balance</th>
        </tr>
      </thead>
      <tbody>
        {#if loading && rows.length === 0}
          <tr>
            <td colspan="3" class="status">Loading page...</td>
          </tr>
        {:else}
          {#each rows as row}
            <tr>
              <td>{row.index}</td>
              <td class="mnemonic">{row.mnemonic}</td>
              <td>{row.balanceEth}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  <div class="pager">
    <button on:click={previousPage} disabled={page === 1 || loading}>Previous</button>
    <span>Page {page} of {totalPages}</span>
    <button on:click={nextPage} disabled={page === totalPages || loading}>Next</button>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #0b1220;
    color: #e5e7eb;
  }

  main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 1rem;
    background: #111827;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  h1 {
    margin-top: 0;
  }

  .table-wrap {
    max-height: 70vh;
    overflow: auto;
    border: 1px solid #374151;
    border-radius: 8px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th,
  td {
    border-bottom: 1px solid #1f2937;
    padding: 0.5rem;
    text-align: left;
    vertical-align: top;
    font-size: 0.88rem;
  }

  th {
    position: sticky;
    top: 0;
    background: #111827;
  }

  .mnemonic {
    word-break: break-word;
  }

  .status {
    text-align: center;
    color: #93c5fd;
    padding: 1.2rem;
  }

  .pager {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }

  button {
    background: #2563eb;
    border: none;
    color: white;
    border-radius: 8px;
    padding: 0.6rem 1rem;
    cursor: pointer;
  }

  button:disabled {
    background: #374151;
    cursor: not-allowed;
  }

  .error {
    color: #fca5a5;
  }
</style>
