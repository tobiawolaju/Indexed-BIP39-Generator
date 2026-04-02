<script>
  import { indexToMnemonic, MAX_INDEX } from 'index-to-mnemonic';

  const PAGE_SIZE = 1000n;
  const TOTAL_PAGES = (MAX_INDEX / PAGE_SIZE) + 1n;

  let page = 1n;
  let rows = [];
  let loading = false;
  let error = '';

  function formatPage(value) {
    return value.toString();
  }

  async function loadPage(targetPage) {
    loading = true;
    error = '';

    try {
      if (typeof targetPage !== 'bigint' || targetPage < 1n || targetPage > TOTAL_PAGES) {
        throw new Error(`Provide page between 1 and ${formatPage(TOTAL_PAGES)}`);
      }

      const startIndex = (targetPage - 1n) * PAGE_SIZE;
      const nextRows = [];

      for (let offset = 0n; offset < PAGE_SIZE; offset += 1n) {
        const index = startIndex + offset;
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
      rows = nextRows;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function nextPage() {
    if (page < TOTAL_PAGES && !loading) {
      loadPage(page + 1n);
    }
  }

  function previousPage() {
    if (page > 1n && !loading) {
      loadPage(page - 1n);
    }
  }

  loadPage(page);
</script>

<main>
  <h1>Indexed Wallet Browser</h1>
  <p>Viewing deterministic wallets in pages of {PAGE_SIZE.toString()} indexes.</p>

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
    <button on:click={previousPage} disabled={page === 1n || loading}>Previous</button>
    <span>Page {formatPage(page)} of {formatPage(TOTAL_PAGES)}</span>
    <button on:click={nextPage} disabled={page === TOTAL_PAGES || loading}>Next</button>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #f8fafc;
    color: #0f172a;
  }

  main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 1rem;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
    border: 1px solid #e2e8f0;
  }

  h1 {
    margin-top: 0;
  }

  .table-wrap {
    max-height: 70vh;
    overflow: auto;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th,
  td {
    border-bottom: 1px solid #e2e8f0;
    padding: 0.5rem;
    text-align: left;
    vertical-align: top;
    font-size: 0.88rem;
  }

  th {
    position: sticky;
    top: 0;
    background: #f8fafc;
  }

  .mnemonic {
    word-break: break-word;
  }

  .status {
    text-align: center;
    color: #2563eb;
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
    background: #94a3b8;
    cursor: not-allowed;
  }

  .error {
    color: #dc2626;
  }
</style>
