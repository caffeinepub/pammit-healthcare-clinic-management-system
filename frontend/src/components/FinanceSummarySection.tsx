import React from 'react';
import { Spending, SpendingCategory } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, FileSpreadsheet, Printer } from 'lucide-react';
import {
  exportFinanceSummaryToPDF,
  exportFinanceSummaryToExcel,
  CategorySummaryRow,
} from '../utils/reportExport';
import { SPENDING_CATEGORIES, categoryLabel } from '../hooks/useQueries';

interface Props {
  spendings: Spending[];
}

export default function FinanceSummarySection({ spendings }: Props) {
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const filtered = React.useMemo(() => {
    return spendings.filter((s) => {
      const ms = Number(s.date) / 1_000_000;
      const d = new Date(ms);
      if (startDate && d < new Date(startDate)) return false;
      if (endDate && d > new Date(endDate + 'T23:59:59')) return false;
      return true;
    });
  }, [spendings, startDate, endDate]);

  const summaryRows: CategorySummaryRow[] = React.useMemo(() => {
    return SPENDING_CATEGORIES.map((cat) => ({
      category: categoryLabel(cat),
      total: filtered
        .filter((s) => s.category === cat)
        .reduce((sum, s) => sum + Number(s.amount), 0),
    }));
  }, [filtered]);

  const grandTotal = summaryRows.reduce((sum, r) => sum + r.total, 0);

  const handlePrint = () => {
    const printContent = document.getElementById('finance-summary-print');
    if (!printContent) return;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Finance Summary Report</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 32px; }
  h2 { font-size: 20px; margin-bottom: 4px; }
  .subtitle { color: #555; margin-bottom: 20px; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th { background: #1a3a5c; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; }
  td { padding: 7px 10px; border-bottom: 1px solid #e0e0e0; font-size: 11px; }
  tr:nth-child(even) td { background: #f7f9fc; }
  .total-row td { font-weight: bold; background: #eef2f7; border-top: 2px solid #1a3a5c; }
  .amount { text-align: right; }
</style></head><body>${printContent.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end no-print">
        <div className="flex flex-col gap-1">
          <Label htmlFor="summary-start">From</Label>
          <Input
            id="summary-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="summary-end">To</Label>
          <Input
            id="summary-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportFinanceSummaryToPDF(summaryRows, grandTotal, startDate, endDate)
            }
          >
            <FileText className="w-4 h-4 mr-1" /> PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportFinanceSummaryToExcel(summaryRows, grandTotal, startDate, endDate)
            }
          >
            <FileSpreadsheet className="w-4 h-4 mr-1" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
        </div>
      </div>

      {/* Printable content */}
      <div id="finance-summary-print">
        <h2 className="text-lg font-semibold mb-1">Total Finance Summary</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Period: {startDate || 'All time'} – {endDate || 'All time'}
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryRows.map((row) => (
              <TableRow key={row.category}>
                <TableCell>{row.category}</TableCell>
                <TableCell className="text-right font-mono">
                  ${row.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-bold">Grand Total</TableCell>
              <TableCell className="text-right font-bold font-mono">
                ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
