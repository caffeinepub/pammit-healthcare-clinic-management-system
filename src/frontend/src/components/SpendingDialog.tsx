import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spending, SpendingCategory } from '../backend';

interface SpendingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spending?: Spending;
  onSave: (spending: Spending) => Promise<void>;
  isSaving: boolean;
}

export default function SpendingDialog({ open, onOpenChange, spending, onSave, isSaving }: SpendingDialogProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: SpendingCategory.misc,
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (spending) {
      setFormData({
        description: spending.description,
        amount: Number(spending.amount).toString(),
        category: spending.category,
        date: new Date(Number(spending.date) / 1000000).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        category: SpendingCategory.misc,
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [spending, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const spendingData: Spending = {
      id: spending?.id || `spending-${Date.now()}`,
      description: formData.description,
      amount: BigInt(formData.amount),
      category: formData.category,
      date: BigInt(new Date(formData.date).getTime() * 1000000),
    };

    await onSave(spendingData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{spending ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as SpendingCategory })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SpendingCategory.equipment}>Equipment</SelectItem>
                <SelectItem value={SpendingCategory.medications}>Medications</SelectItem>
                <SelectItem value={SpendingCategory.supplies}>Supplies</SelectItem>
                <SelectItem value={SpendingCategory.rent}>Rent</SelectItem>
                <SelectItem value={SpendingCategory.utilities}>Utilities</SelectItem>
                <SelectItem value={SpendingCategory.insurance}>Insurance</SelectItem>
                <SelectItem value={SpendingCategory.marketing}>Marketing</SelectItem>
                <SelectItem value={SpendingCategory.misc}>Miscellaneous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter expense description"
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
