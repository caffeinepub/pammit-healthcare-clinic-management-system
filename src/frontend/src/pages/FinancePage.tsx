import { useState } from 'react';
import { useGetAllSpendings, useAddSpending, useUpdateSpending, useDeleteSpending, useResetAllSpendings, useGetSummaryData, useGetAllPatients, useGetAllMiscExpenses, useAddMiscExpense, useUpdateMiscExpense, useDeleteMiscExpense } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, RefreshCw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Spending, SpendingCategory, MiscExpense } from '../backend';
import SpendingDialog from '../components/SpendingDialog';
import MiscExpenseDialog from '../components/MiscExpenseDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function FinancePage() {
  const { data: spendings = [], isLoading: spendingsLoading } = useGetAllSpendings();
  const { data: miscExpenses = [], isLoading: miscExpensesLoading } = useGetAllMiscExpenses();
  const { data: summaryData } = useGetSummaryData();
  const { data: patients = [] } = useGetAllPatients();
  const addSpendingMutation = useAddSpending();
  const updateSpendingMutation = useUpdateSpending();
  const deleteSpendingMutation = useDeleteSpending();
  const resetAllMutation = useResetAllSpendings();
  const addMiscExpenseMutation = useAddMiscExpense();
  const updateMiscExpenseMutation = useUpdateMiscExpense();
  const deleteMiscExpenseMutation = useDeleteMiscExpense();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingSpending, setEditingSpending] = useState<Spending | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [editingMiscExpense, setEditingMiscExpense] = useState<MiscExpense | null>(null);
  const [isAddMiscExpenseDialogOpen, setIsAddMiscExpenseDialogOpen] = useState(false);
  const [deleteMiscExpenseConfirmId, setDeleteMiscExpenseConfirmId] = useState<string | null>(null);

  const filteredSpendings = spendings.filter((spending) =>
    spending.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMiscExpenses = miscExpenses.filter((expense) =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = spendings.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalMiscExpenses = miscExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalAllExpenses = totalExpenses + totalMiscExpenses;
  const totalRevenue = Number(summaryData?.totalPayments || 0);
  const totalDebt = patients.reduce((sum, p) => sum + Number(p.debt), 0);
  const netIncome = totalRevenue - totalAllExpenses;

  const handleAddSpending = async (spending: Spending) => {
    try {
      await addSpendingMutation.mutateAsync(spending);
      toast.success('Expense added successfully');
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add expense');
    }
  };

  const handleUpdateSpending = async (spending: Spending) => {
    try {
      await updateSpendingMutation.mutateAsync({ id: spending.id, spending });
      toast.success('Expense updated successfully');
      setEditingSpending(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update expense');
    }
  };

  const handleDeleteSpending = async (id: string) => {
    try {
      await deleteSpendingMutation.mutateAsync(id);
      toast.success('Expense deleted successfully');
      setDeleteConfirmId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete expense');
    }
  };

  const handleResetAll = async () => {
    try {
      await resetAllMutation.mutateAsync();
      toast.success('All expenses reset successfully');
      setShowResetConfirm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset expenses');
    }
  };

  const handleAddMiscExpense = async (expense: MiscExpense) => {
    try {
      await addMiscExpenseMutation.mutateAsync(expense);
      toast.success('Miscellaneous expense added successfully');
      setIsAddMiscExpenseDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add miscellaneous expense');
    }
  };

  const handleUpdateMiscExpense = async (expense: MiscExpense) => {
    try {
      await updateMiscExpenseMutation.mutateAsync({ id: expense.id, expense });
      toast.success('Miscellaneous expense updated successfully');
      setEditingMiscExpense(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update miscellaneous expense');
    }
  };

  const handleDeleteMiscExpense = async (id: string) => {
    try {
      await deleteMiscExpenseMutation.mutateAsync(id);
      toast.success('Miscellaneous expense deleted successfully');
      setDeleteMiscExpenseConfirmId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete miscellaneous expense');
    }
  };

  const getCategoryLabel = (category: SpendingCategory) => {
    const labels: Record<SpendingCategory, string> = {
      [SpendingCategory.equipment]: 'Equipment',
      [SpendingCategory.medications]: 'Medications',
      [SpendingCategory.supplies]: 'Supplies',
      [SpendingCategory.rent]: 'Rent',
      [SpendingCategory.utilities]: 'Utilities',
      [SpendingCategory.insurance]: 'Insurance',
      [SpendingCategory.marketing]: 'Marketing',
      [SpendingCategory.misc]: 'Miscellaneous',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: SpendingCategory) => {
    const colors: Record<SpendingCategory, string> = {
      [SpendingCategory.equipment]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      [SpendingCategory.medications]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      [SpendingCategory.supplies]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      [SpendingCategory.rent]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      [SpendingCategory.utilities]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      [SpendingCategory.insurance]: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      [SpendingCategory.marketing]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      [SpendingCategory.misc]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[category] || colors[SpendingCategory.misc];
  };

  return (
    <div className="container py-8 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
          <p className="text-muted-foreground">Track revenue, expenses, and financial health</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From patient payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${totalAllExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Operational + misc costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              ${netIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue minus expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              ${totalDebt.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending from patients
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search expenses by description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="regular" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="regular">Regular Expenses</TabsTrigger>
          <TabsTrigger value="misc">Miscellaneous</TabsTrigger>
        </TabsList>

        <TabsContent value="regular" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Regular Expenses</h2>
              <p className="text-sm text-muted-foreground">Categorized operational expenses</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(true)}
                disabled={spendings.length === 0}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset All
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spendingsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading expenses...
                    </TableCell>
                  </TableRow>
                ) : filteredSpendings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No expenses found matching your search' : 'No expenses yet. Add your first expense!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSpendings.map((spending) => (
                    <TableRow key={spending.id}>
                      <TableCell>
                        {new Date(Number(spending.date) / 1000000).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(spending.category)}>
                          {getCategoryLabel(spending.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{spending.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(spending.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingSpending(spending)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmId(spending.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="misc" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Miscellaneous Expenses</h2>
              <p className="text-sm text-muted-foreground">Other uncategorized expenses</p>
            </div>
            <Button onClick={() => setIsAddMiscExpenseDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Misc Expense
            </Button>
          </div>

          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {miscExpensesLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading miscellaneous expenses...
                    </TableCell>
                  </TableRow>
                ) : filteredMiscExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No miscellaneous expenses found matching your search' : 'No miscellaneous expenses yet. Add your first one!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMiscExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {new Date(Number(expense.date) / 1000000).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(expense.category)}>
                          {getCategoryLabel(expense.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(expense.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingMiscExpense(expense)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteMiscExpenseConfirmId(expense.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <SpendingDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddSpending}
        isSaving={addSpendingMutation.isPending}
      />

      <SpendingDialog
        open={!!editingSpending}
        onOpenChange={(open) => !open && setEditingSpending(null)}
        spending={editingSpending || undefined}
        onSave={handleUpdateSpending}
        isSaving={updateSpendingMutation.isPending}
      />

      <MiscExpenseDialog
        open={isAddMiscExpenseDialogOpen}
        onOpenChange={setIsAddMiscExpenseDialogOpen}
        onSave={handleAddMiscExpense}
        isSaving={addMiscExpenseMutation.isPending}
      />

      <MiscExpenseDialog
        open={!!editingMiscExpense}
        onOpenChange={(open) => !open && setEditingMiscExpense(null)}
        expense={editingMiscExpense || undefined}
        onSave={handleUpdateMiscExpense}
        isSaving={updateMiscExpenseMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDeleteSpending(deleteConfirmId)}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        isLoading={deleteSpendingMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteMiscExpenseConfirmId}
        onOpenChange={(open) => !open && setDeleteMiscExpenseConfirmId(null)}
        onConfirm={() => deleteMiscExpenseConfirmId && handleDeleteMiscExpense(deleteMiscExpenseConfirmId)}
        title="Delete Miscellaneous Expense"
        description="Are you sure you want to delete this miscellaneous expense? This action cannot be undone."
        isLoading={deleteMiscExpenseMutation.isPending}
      />

      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleResetAll}
        title="Reset All Expenses"
        description="Are you sure you want to delete all expense records? This action cannot be undone."
        isLoading={resetAllMutation.isPending}
      />
    </div>
  );
}
