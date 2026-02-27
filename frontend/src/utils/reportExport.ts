import { Spending, MiscExpense, SpendingCategory } from '../backend';

export interface CategorySummaryRow {
  category: string;
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts: bigint | number): string {
  const ms = typeof ts === 'bigint' ? Number(ts) / 1_000_000 : ts;
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── CSV / Excel export ───────────────────────────────────────────────────────

function downloadCSV(filename: string, rows: string[][]): void {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '');
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCategoryReportToExcel(
  categoryName: string,
  entries: Spending[],
  subtotal: number,
  startDate: string,
  endDate: string
): void {
  const header = ['Date', 'Description', 'Category', 'Amount'];
  const dataRows = entries.map((e) => [
    formatDate(e.date),
    e.description,
    categoryName,
    formatCurrency(Number(e.amount)),
  ]);
  const totalRow = ['', '', 'SUBTOTAL', formatCurrency(subtotal)];
  const metaRow = [`Report: ${categoryName}`, `Period: ${startDate || 'All'} – ${endDate || 'All'}`, '', ''];

  const rows = [metaRow, header, ...dataRows, totalRow];
  const filename = `${categoryName.replace(/\s+/g, '_')}_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(filename, rows);
}

export function exportFinanceSummaryToExcel(
  summaryRows: CategorySummaryRow[],
  grandTotal: number,
  startDate: string,
  endDate: string
): void {
  const header = ['Category', 'Total Amount'];
  const dataRows = summaryRows.map((r) => [r.category, formatCurrency(r.total)]);
  const totalRow = ['GRAND TOTAL', formatCurrency(grandTotal)];
  const metaRow = [`Finance Summary Report`, `Period: ${startDate || 'All'} – ${endDate || 'All'}`];

  const rows = [metaRow, header, ...dataRows, totalRow];
  downloadCSV(`Finance_Summary_${new Date().toISOString().slice(0, 10)}.csv`, rows);
}

// ─── PDF (print-to-PDF via new window) ───────────────────────────────────────

function buildPrintWindow(title: string, htmlBody: string): void {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 32px; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .subtitle { color: #555; margin-bottom: 20px; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { background: #1a3a5c; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; }
    td { padding: 7px 10px; border-bottom: 1px solid #e0e0e0; font-size: 11px; }
    tr:nth-child(even) td { background: #f7f9fc; }
    .total-row td { font-weight: bold; background: #eef2f7; border-top: 2px solid #1a3a5c; }
    .amount { text-align: right; }
    @media print {
      body { padding: 16px; }
      button { display: none; }
    }
  </style>
</head>
<body>
  ${htmlBody}
  <br/>
  <button onclick="window.print()" style="margin-top:16px;padding:8px 20px;background:#1a3a5c;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px;">
    Print / Save as PDF
  </button>
</body>
</html>`);
  win.document.close();
}

export function exportCategoryReportToPDF(
  categoryName: string,
  entries: Spending[],
  subtotal: number,
  startDate: string,
  endDate: string
): void {
  const rows = entries
    .map(
      (e) => `<tr>
      <td>${formatDate(e.date)}</td>
      <td>${e.description}</td>
      <td class="amount">${formatCurrency(Number(e.amount))}</td>
    </tr>`
    )
    .join('');

  const html = `
    <h1>${categoryName} Expense Report</h1>
    <div class="subtitle">Period: ${startDate || 'All time'} – ${endDate || 'All time'} &nbsp;|&nbsp; Generated: ${new Date().toLocaleDateString()}</div>
    <table>
      <thead><tr><th>Date</th><th>Description</th><th class="amount">Amount</th></tr></thead>
      <tbody>
        ${rows}
        <tr class="total-row"><td colspan="2">Subtotal</td><td class="amount">${formatCurrency(subtotal)}</td></tr>
      </tbody>
    </table>`;

  buildPrintWindow(`${categoryName} Report`, html);
}

export function exportFinanceSummaryToPDF(
  summaryRows: CategorySummaryRow[],
  grandTotal: number,
  startDate: string,
  endDate: string
): void {
  const rows = summaryRows
    .map(
      (r) => `<tr>
      <td>${r.category}</td>
      <td class="amount">${formatCurrency(r.total)}</td>
    </tr>`
    )
    .join('');

  const html = `
    <h1>Total Finance Summary Report</h1>
    <div class="subtitle">Period: ${startDate || 'All time'} – ${endDate || 'All time'} &nbsp;|&nbsp; Generated: ${new Date().toLocaleDateString()}</div>
    <table>
      <thead><tr><th>Category</th><th class="amount">Total Amount</th></tr></thead>
      <tbody>
        ${rows}
        <tr class="total-row"><td>Grand Total</td><td class="amount">${formatCurrency(grandTotal)}</td></tr>
      </tbody>
    </table>`;

  buildPrintWindow('Finance Summary Report', html);
}
