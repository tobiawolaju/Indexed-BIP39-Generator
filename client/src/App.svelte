<script>
  import { indexToMnemonic, MAX_INDEX } from 'index-to-mnemonic';

  const PAGE_SIZE = 100n;
  const TOTAL_PAGES = (MAX_INDEX / PAGE_SIZE) + 1n;
  const QUICK_LINK_GROUP_SIZE = 100n;

  const SUPERSCRIPT_MAP = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    '-': '⁻'
  };

  let page = 1n;
  let rows = [];
  let loading = false;
  let error = '';
  let copyMessage = '';

  $: pageTotalBalance = rows.reduce((sum, row) => sum + row.balanceEth, 0);

  function toSuperscript(value) {
    return value
      .toString()
      .split('')
      .map((char) => SUPERSCRIPT_MAP[char] ?? char)
      .join('');
  }

  function formatBigNumber(value) {
    const text = value.toString();
    if (text.length <= 8) {
      return text;
    }

    const mantissa = `${text[0]}.${text.slice(1, 2)}`;
    const exponent = text.length - 1;
    return `${mantissa}${toSuperscript(exponent)}`;
  }

  function formatPage(value) {
    return formatBigNumber(value);
  }

  function formatPowerBase(value, base = 52n) {
    if (value < 1n) {
      return '0';
    }

    let exponent = 0n;
    let current = value;
    while (current >= base) {
      current /= base;
      exponent += 1n;
    }

    return `${base.toString()}${toSuperscript(exponent)}`;
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
          index,
          indexLabel: formatBigNumber(index),
          indexPowerLabel: formatPowerBase(index),
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
      <colgroup>
        <col class="index-col" />
        <col />
        <col class="balance-col" />
      </colgroup>
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
              <td>
                <div class="index-cell">
                  <span>{row.indexLabel}</span>
                  <span class="index-power">≈ {row.indexPowerLabel}</span>
                </div>
              </td>
              <td>
                <div class="mnemonic-wrap">
                  <div class="mnemonic-holder">
                    <span class="mnemonic">{row.mnemonic}</span>
                  </div>
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
    <p>Pages 1 to 100 (all available quick links)</p>
    <div class="shortcut-list">
      {#each startPages as quickPage}
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
    width: 100vw;
    margin: 0;
    padding: 0.5rem;
    box-sizing: border-box;
    background: #ffffff;
  }

  h1 {
    margin-top: 0;
  }

  .table-wrap {
    max-height: 68vh;
    overflow: auto;
    border: 1px solid #d1d5db;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .index-col {
    width: 8.5rem;
  }

  .balance-col {
    width: 7.5rem;
  }

  th,
  td {
    border-bottom: 1px solid #e5e7eb;
    padding: 0.2rem 0.3rem;
    text-align: left;
    vertical-align: top;
    font-size: 0.88rem;
  }

  th {
    position: sticky;
    top: 0;
    background: #ffffff;
  }

  .index-cell {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .index-power {
    color: #4b5563;
    font-size: 0.75rem;
  }

  .mnemonic-wrap {
    display: flex;
    gap: 0.4rem;
    align-items: flex-start;
  }

  .mnemonic-holder {
    display: flex;
    flex: 1;
    min-width: 0;
    max-height: 2.4rem;
    overflow: auto;
  }

  .mnemonic {
    overflow-wrap: anywhere;
    line-height: 1.2;
    flex: 1;
  }

  .copy-button {
    min-width: 1.7rem;
    height: 1.7rem;
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
    padding: 0.45rem 0.7rem;
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
    gap: 0.3rem;
    margin-bottom: 0.8rem;
  }

  .page-button {
    background: #ffffff;
    color: #1f2937;
    border: 1px solid #9ca3af;
    padding: 0.25rem 0.45rem;
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
    th,
    td {
      font-size: 0.78rem;
      padding: 0.2rem;
    }

    .index-col {
      width: 7.2rem;
    }

    .balance-col {
      width: 6.4rem;
    }

    .copy-button {
      min-width: 1.5rem;
      height: 1.5rem;
    }
  }
</style>
