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
import { FileText, FileSpreadsheet, Printer, Pencil } from 'lucide-react';
import {
  exportCategoryReportToPDF,
  exportCategoryReportToExcel,
} from '../utils/reportExport';
import SpendingDialog from './SpendingDialog';
import { useEditSpending } from '../hooks/useQueries';
import { toast } from 'sonner';

interface Props {
  category: SpendingCategory;
  categoryName: string;
  spendings: Spending[];
}

export default function CategoryReportSection({ category, categoryName, spendings }: Props) {
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [editingSpending, setEditingSpending] = React.useState<Spending | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const editSpending = useEditSpending();

  const filtered = React.useMemo(() => {
    return spendings
      .filter((s) => s.category === category)
      .filter((s) => {
        const ms = Number(s.date) / 1_000_000;
        const d = new Date(ms);
        if (startDate && d < new Date(startDate)) return false;
        if (endDate && d > new Date(endDate + 'T23:59:59')) return false;
        return true;
      })
      .sort((a, b) => Number(b.date) - Number(a.date));
  }, [spendings, category, startDate, endDate]);

  const subtotal = filtered.reduce((sum, s) => sum + Number(s.amount), 0);

  const handleEdit = (spending: Spending) => {
    setEditingSpending(spending);
    setDialogOpen(true);
  };

  const handleSave = async (spending: Spending) => {
    try {
      await editSpending.mutateAsync({ id: spending.id, spending });
      toast.success('Expense updated successfully');
      setDialogOpen(false);
      setEditingSpending(null);
    } catch (err) {
      toast.error('Failed to update expense');
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById(`cat-report-print-${category}`);
    if (!printContent) return;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>${categoryName} Report</title>
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
  .edit-col { display: none; }
</style></head><body>${printContent.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-card">
      {/* Header + actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">{categoryName}</h3>
        <div className="flex gap-2 no-print">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCategoryReportToPDF(categoryName, filtered, subtotal, startDate, endDate)}
          >
            <FileText className="w-4 h-4 mr-1" /> PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCategoryReportToExcel(categoryName, filtered, subtotal, startDate, endDate)}
          >
            <FileSpreadsheet className="w-4 h-4 mr-1" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
        </div>
      </div>

      {/* Date filters */}
      <div className="flex flex-wrap gap-4 items-end no-print">
        <div className="flex flex-col gap-1">
          <Label htmlFor={`start-${category}`}>From</Label>
          <Input
            id={`start-${category}`}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-36"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`end-${category}`}>To</Label>
          <Input
            id={`end-${category}`}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-36"
          />
        </div>
        {(startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setStartDate(''); setEndDate(''); }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Printable table */}
      <div id={`cat-report-print-${category}`}>
        <h2 className="text-lg font-semibold mb-1 hidden print:block">{categoryName} Expense Report</h2>
        <p className="text-sm text-muted-foreground mb-2 hidden print:block">
          Period: {startDate || 'All time'} – {endDate || 'All time'}
        </p>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No expenses found for this period.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="edit-col no-print w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-sm">
                    {new Date(Number(s.date) / 1_000_000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-sm">{s.description}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    ${Number(s.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="edit-col no-print">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(s)}
                      title="Edit expense"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-semibold">
                  Subtotal ({filtered.length} entries)
                </TableCell>
                <TableCell className="text-right font-bold font-mono">
                  ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="no-print" />
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </div>

      {/* Edit dialog */}
      {editingSpending && (
        <SpendingDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingSpending(null);
          }}
          spending={editingSpending}
          onSave={handleSave}
          isSaving={editSpending.isPending}
        />
      )}
    </div>
  );
}
