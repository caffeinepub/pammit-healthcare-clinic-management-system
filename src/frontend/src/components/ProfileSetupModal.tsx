import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProfileSetupModalProps {
  onSave: (name: string) => Promise<void>;
  isSaving: boolean;
}

export default function ProfileSetupModal({ onSave, isSaving }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setError('');
    await onSave(name.trim());
  };

  return (
    <Dialog open={true}>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => e.preventDefault()}
        aria-labelledby="profile-setup-title"
        aria-describedby="profile-setup-description"
      >
        <DialogHeader>
          <DialogTitle id="profile-setup-title">Welcome to MedManage</DialogTitle>
          <DialogDescription id="profile-setup-description">
            Please enter your name to complete your profile setup.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              disabled={isSaving}
              autoFocus
              required
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? 'name-error' : undefined}
            />
            {error && (
              <p id="name-error" className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!name.trim() || isSaving}
            aria-label={isSaving ? 'Saving profile, please wait' : 'Continue with profile setup'}
          >
            {isSaving ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
