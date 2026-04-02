<script>
  import { indexToMnemonic, MAX_INDEX } from 'index-to-mnemonic';

  const PAGE_SIZE = 100n;
  const TOTAL_PAGES = (MAX_INDEX / PAGE_SIZE) + 1n;
  const QUICK_LINK_GROUP_SIZE = 100n;

  let page = 1n;
  let rows = [];
  let loading = false;
  let error = '';
  let copyMessage = '';

  $: pageTotalBalance = rows.reduce((sum, row) => sum + row.balanceEth, 0);

  function formatPage(value) {
    return value.toString();
  }

  function formatBalance(value) {
    return value.toFixed(6);
  }

  function buildQuickPageList(start, end) {
    const safeStart = start < 1n ? 1n : start;
    const safeEnd = end > TOTAL_PAGES ? TOTAL_PAGES : end;
    const list = [];

    for (let current = safeStart; current <= safeEnd; current += 1n) {
      list.push(current);
    }

    return list;
  }

  $: startPages = buildQuickPageList(1n, QUICK_LINK_GROUP_SIZE);
  $: endPages = buildQuickPageList(TOTAL_PAGES - QUICK_LINK_GROUP_SIZE + 1n, TOTAL_PAGES);

  async function loadPage(targetPage) {
    loading = true;
    error = '';
    copyMessage = '';

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
          balanceEth: 0
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

  async function copySeedPhrase(mnemonic) {
    try {
      await navigator.clipboard.writeText(mnemonic);
      copyMessage = 'Seed phrase copied.';
    } catch {
      copyMessage = 'Unable to copy seed phrase in this browser.';
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

  {#if copyMessage}
    <p class="copy-message">{copyMessage}</p>
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
              <td>
                <div class="mnemonic-wrap">
                  <span class="mnemonic">{row.mnemonic}</span>
                  <button class="copy-button" on:click={() => copySeedPhrase(row.mnemonic)} aria-label="Copy seed phrase" title="Copy seed phrase">
                    📋
                  </button>
                </div>
              </td>
              <td>{formatBalance(row.balanceEth)}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  <div class="summary">
    <span>Results on this page: {rows.length}</span>
    <span>Total page balance: {formatBalance(pageTotalBalance)} ETH</span>
  </div>

  <div class="pager">
    <button on:click={previousPage} disabled={page === 1n || loading}>Previous</button>
    <span>Page {formatPage(page)} of {formatPage(TOTAL_PAGES)}</span>
    <button on:click={nextPage} disabled={page === TOTAL_PAGES || loading}>Next</button>
  </div>

  <div class="page-shortcuts">
    <p>Pages 1 to +100</p>
    <div class="shortcut-list">
      {#each startPages as quickPage}
        <button class="page-button" on:click={() => loadPage(quickPage)} disabled={loading || quickPage === page}>{formatPage(quickPage)}</button>
      {/each}
    </div>

    <p>End -100 to End -0</p>
    <div class="shortcut-list">
      {#each endPages as quickPage}
        <button class="page-button" on:click={() => loadPage(quickPage)} disabled={loading || quickPage === page}>{formatPage(quickPage)}</button>
      {/each}
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #ffffff;
    color: #111827;
  }

  main {
    max-width: 1200px;
    margin: 1rem auto;
    padding: 1rem;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #d1d5db;
  }

  h1 {
    margin-top: 0;
  }

  .table-wrap {
    max-height: 62vh;
    overflow: auto;
    border: 1px solid #d1d5db;
    border-radius: 12px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th,
  td {
    border-bottom: 1px solid #e5e7eb;
    padding: 0.6rem;
    text-align: left;
    vertical-align: top;
    font-size: 0.9rem;
  }

  th {
    position: sticky;
    top: 0;
    background: #ffffff;
  }

  .mnemonic-wrap {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .mnemonic {
    word-break: normal;
    overflow-wrap: anywhere;
    line-height: 1.4;
    flex: 1;
  }

  .copy-button {
    min-width: 2rem;
    height: 2rem;
    border: 1px solid #d1d5db;
    border-radius: 999px;
    background: #f3f4f6;
    color: #111827;
    padding: 0;
  }

  .status {
    text-align: center;
    color: #2563eb;
    padding: 1.2rem;
  }

  .summary {
    margin-top: 0.8rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: 0.95rem;
  }

  .pager {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  button {
    background: #2563eb;
    border: 1px solid #2563eb;
    color: #ffffff;
    border-radius: 10px;
    padding: 0.55rem 0.9rem;
    cursor: pointer;
  }

  button:disabled {
    background: #9ca3af;
    border-color: #9ca3af;
    cursor: not-allowed;
  }

  .page-shortcuts {
    margin-top: 1rem;
  }

  .shortcut-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: 0.8rem;
  }

  .page-button {
    background: #ffffff;
    color: #1f2937;
    border: 1px solid #9ca3af;
    padding: 0.35rem 0.55rem;
    border-radius: 8px;
  }

  .page-button:disabled {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
  }

  .copy-message {
    color: #065f46;
  }

  .error {
    color: #b91c1c;
  }

  @media (max-width: 700px) {
    main {
      margin: 0;
      border-radius: 0;
      border-left: 0;
      border-right: 0;
    }

    th,
    td {
      font-size: 0.8rem;
      padding: 0.45rem;
    }

    .mnemonic-wrap {
      align-items: center;
    }

    .copy-button {
      min-width: 1.8rem;
      height: 1.8rem;
    }
  }
</style>
