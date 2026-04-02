<script>
  const PAGE_SIZE = 1000;

  let page = 1;
  let totalPages = 1;
  let rows = [];
  let loading = false;
  let error = '';

  async function loadPage(targetPage) {
    loading = true;
    error = '';

    try {
      const response = await fetch(`http://localhost:3000/page?page=${targetPage}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load page');
      }

      const data = await response.json();
      page = data.page;
      totalPages = data.totalPages;
      rows = data.rows;
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
