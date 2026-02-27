import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Spending, MiscExpense, SpendingCategory } from '../backend';
import {
  useGetAllSpendings,
  useAddSpending,
  useEditSpending,
  useGetAllMiscExpenses,
  useAddMiscExpense,
  useUpdateMiscExpense,
  useDeleteMiscExpense,
  SPENDING_CATEGORIES,
  categoryLabel,
} from '../hooks/useQueries';
import SpendingDialog from '../components/SpendingDialog';
import MiscExpenseDialog from '../components/MiscExpenseDialog';
import CategoryReportSection from '../components/CategoryReportSection';
import FinanceSummarySection from '../components/FinanceSummarySection';
import { Skeleton } from '@/components/ui/skeleton';

export default function FinancePage() {
  const { data: spendings = [], isLoading: spendingsLoading } = useGetAllSpendings();
  const { data: miscExpenses = [], isLoading: miscLoading } = useGetAllMiscExpenses();

  const addSpending = useAddSpending();
  const editSpending = useEditSpending();
  const addMiscExpense = useAddMiscExpense();
  const updateMiscExpense = useUpdateMiscExpense();
  const deleteMiscExpense = useDeleteMiscExpense();

  // Spending dialog state
  const [spendingDialogOpen, setSpendingDialogOpen] = useState(false);
  const [editingSpending, setEditingSpending] = useState<Spending | null>(null);

  // Misc expense dialog state
  const [miscDialogOpen, setMiscDialogOpen] = useState(false);
  const [editingMisc, setEditingMisc] = useState<MiscExpense | null>(null);

  // ─── Spending handlers ────────────────────────────────────────────────────

  const handleSaveSpending = async (spending: Spending) => {
    try {
      if (editingSpending) {
        await editSpending.mutateAsync({ id: spending.id, spending });
        toast.success('Expense updated');
      } else {
        await addSpending.mutateAsync(spending);
        toast.success('Expense added');
      }
      setSpendingDialogOpen(false);
      setEditingSpending(null);
    } catch {
      toast.error('Failed to save expense');
    }
  };

  // ─── Misc expense handlers ────────────────────────────────────────────────

  const handleSaveMisc = async (expense: MiscExpense) => {
    try {
      if (editingMisc) {
        await updateMiscExpense.mutateAsync({ id: expense.id, expense });
        toast.success('Misc expense updated');
      } else {
        await addMiscExpense.mutateAsync(expense);
        toast.success('Misc expense added');
      }
      setMiscDialogOpen(false);
      setEditingMisc(null);
    } catch {
      toast.error('Failed to save misc expense');
    }
  };

  const handleDeleteMisc = async (id: string) => {
    try {
      await deleteMiscExpense.mutateAsync(id);
      toast.success('Misc expense deleted');
    } catch {
      toast.error('Failed to delete misc expense');
    }
  };

  const isSpendingSaving = addSpending.isPending || editSpending.isPending;
  const isMiscSaving = addMiscExpense.isPending || updateMiscExpense.isPending;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage expenses, view category reports, and export financial data
          </p>
        </div>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          {SPENDING_CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {categoryLabel(cat)}
            </TabsTrigger>
          ))}
          <TabsTrigger value="misc">Misc Expenses</TabsTrigger>
        </TabsList>

        {/* ── Total Finance Summary ── */}
        <TabsContent value="summary">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Total Finance Summary</h2>
              <Button
                size="sm"
                onClick={() => {
                  setEditingSpending(null);
                  setSpendingDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Expense
              </Button>
            </div>
            {spendingsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <FinanceSummarySection spendings={spendings} />
            )}
          </div>
        </TabsContent>

        {/* ── Per-Category Reports ── */}
        {SPENDING_CATEGORIES.map((cat) => (
          <TabsContent key={cat} value={cat}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{categoryLabel(cat)} Expenses</h2>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingSpending(null);
                    setSpendingDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Expense
                </Button>
              </div>
              {spendingsLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <CategoryReportSection
                  category={cat}
                  categoryName={categoryLabel(cat)}
                  spendings={spendings}
                />
              )}
            </div>
          </TabsContent>
        ))}

        {/* ── Misc Expenses ── */}
        <TabsContent value="misc">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Miscellaneous Expenses</h2>
              <Button
                size="sm"
                onClick={() => {
                  setEditingMisc(null);
                  setMiscDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Misc Expense
              </Button>
            </div>
            {miscLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : miscExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No miscellaneous expenses recorded yet.
              </p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                      <th className="text-left px-4 py-3 font-medium">Description</th>
                      <th className="text-left px-4 py-3 font-medium">Category</th>
                      <th className="text-right px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 w-20" />
                    </tr>
                  </thead>
                  <tbody>
                    {miscExpenses
                      .slice()
                      .sort((a, b) => Number(b.date) - Number(a.date))
                      .map((expense) => (
                        <tr key={expense.id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            {new Date(Number(expense.date) / 1_000_000).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3">{expense.description}</td>
                          <td className="px-4 py-3 capitalize">{expense.category}</td>
                          <td className="px-4 py-3 text-right font-mono">
                            ${Number(expense.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingMisc(expense);
                                  setMiscDialogOpen(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteMisc(expense.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot className="bg-muted/50 border-t">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 font-semibold">
                        Total ({miscExpenses.length} entries)
                      </td>
                      <td className="px-4 py-3 text-right font-bold font-mono">
                        ${miscExpenses
                          .reduce((sum, e) => sum + Number(e.amount), 0)
                          .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Spending dialog (add / edit) */}
      <SpendingDialog
        open={spendingDialogOpen}
        onOpenChange={(open) => {
          setSpendingDialogOpen(open);
          if (!open) setEditingSpending(null);
        }}
        spending={editingSpending ?? undefined}
        onSave={handleSaveSpending}
        isSaving={isSpendingSaving}
      />

      {/* Misc expense dialog (add / edit) */}
      <MiscExpenseDialog
        open={miscDialogOpen}
        onOpenChange={(open) => {
          setMiscDialogOpen(open);
          if (!open) setEditingMisc(null);
        }}
        expense={editingMisc ?? undefined}
        onSave={handleSaveMisc}
        isSaving={isMiscSaving}
      />
    </div>
  );
}
