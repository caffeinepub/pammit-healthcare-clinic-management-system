import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Database,
  AlertTriangle,
  Loader2,
  FileJson,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useExportAllData,
  useImportBackupData,
  useMergeBackupData,
  useResetAllData,
  useGetBackupMetadata,
} from '../hooks/useQueries';
import type { BackupData } from '../backend';

export default function DataBackupPage() {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<BackupData | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: metadata, isLoading: metadataLoading } = useGetBackupMetadata();
  const exportMutation = useExportAllData();
  const importMutation = useImportBackupData();
  const mergeMutation = useMergeBackupData();
  const resetMutation = useResetAllData();

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const handleExport = async () => {
    try {
      setUploadProgress(10);
      toast.info('Exporting data...', { description: 'Please wait while we prepare your backup' });

      const backupData = await exportMutation.mutateAsync();
      setUploadProgress(50);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `pammit-clinic-backup-${timestamp}.json`;

      const jsonString = JSON.stringify(
        backupData,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value),
        2
      );

      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setUploadProgress(100);
      toast.success('Backup exported successfully', { description: `File: ${filename}` });
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error: any) {
      setUploadProgress(0);
      toast.error('Export failed', { description: error.message || 'Failed to export backup data' });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    try {
      toast.info('Loading backup file...', { description: 'Validating file format' });

      const text = await file.text();
      const parsed = JSON.parse(text, (key, value) => {
        if (
          key === 'timestamp' || key === 'date' || key === 'startDate' || key === 'endDate' ||
          key === 'clockIn' || key === 'clockOut' || key === 'checkIn' || key === 'checkOut'
        ) {
          return typeof value === 'string' ? BigInt(value) : value;
        }
        if (
          key === 'price' || key === 'paid' || key === 'debt' || key === 'amount' ||
          key === 'payRate' || key === 'hoursWorked' || key === 'totalPay' ||
          key === 'duration' || key === 'visitNumber' || key === 'progressPercentage'
        ) {
          return typeof value === 'string' ? BigInt(value) : value;
        }
        return value;
      });

      if (!parsed.patients || !parsed.staff || !parsed.spendings || !parsed.attendances || !parsed.sessions) {
        throw new Error('Invalid backup file format - missing required data sections');
      }

      setParsedBackup(parsed);
      toast.success('Backup file loaded successfully', {
        description: `${parsed.patients.length} patients, ${parsed.staff.length} staff, ${parsed.spendings.length} expenses, ${parsed.attendances.length} attendance records, ${parsed.sessions.length} sessions`,
      });
    } catch (error: any) {
      toast.error('Invalid backup file', { description: error.message || 'Failed to parse backup file' });
      setSelectedFile(null);
      setParsedBackup(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!parsedBackup) return;
    try {
      setUploadProgress(10);
      toast.info('Restoring backup...', { description: 'This may take a moment' });
      await importMutation.mutateAsync(parsedBackup);
      setUploadProgress(100);
      toast.success('Data restored successfully', { description: 'All data has been replaced with the backup' });
      setShowImportDialog(false);
      setSelectedFile(null);
      setParsedBackup(null);
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error: any) {
      setUploadProgress(0);
      toast.error('Import failed', { description: error.message || 'Failed to import backup data' });
    }
  };

  const handleMerge = async () => {
    if (!parsedBackup) return;
    try {
      setUploadProgress(10);
      toast.info('Merging data...', { description: 'Combining backup with existing records' });
      await mergeMutation.mutateAsync(parsedBackup);
      setUploadProgress(100);
      toast.success('Data merged successfully', { description: 'Backup data has been merged with existing data' });
      setShowMergeDialog(false);
      setSelectedFile(null);
      setParsedBackup(null);
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error: any) {
      setUploadProgress(0);
      toast.error('Merge failed', { description: error.message || 'Failed to merge backup data' });
    }
  };

  const handleResetAll = async () => {
    try {
      setUploadProgress(10);
      toast.info('Resetting all data...', { description: 'Deleting all records' });
      await resetMutation.mutateAsync();
      setUploadProgress(100);
      toast.success('All data reset', { description: 'All clinic data has been permanently deleted' });
      setShowResetDialog(false);
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error: any) {
      setUploadProgress(0);
      toast.error('Reset failed', { description: error.message || 'Failed to reset data' });
    }
  };

  const isProcessing =
    exportMutation.isPending ||
    importMutation.isPending ||
    mergeMutation.isPending ||
    resetMutation.isPending;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <img
            src="/assets/generated/backup-icon-transparent.dim_64x64.png"
            alt="Data Backup"
            className="h-12 w-12 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold text-primary">Data Backup & Restore</h1>
            <p className="text-muted-foreground">Manage your clinic data backups and restore operations</p>
          </div>
        </div>
      </div>

      {uploadProgress > 0 && (
        <div className="mb-6">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Processing... {uploadProgress}%
          </p>
        </div>
      )}

      <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-sm">
          <strong>Important:</strong> Backup and restore operations affect all clinic data including patients,
          staff, treatments, financial records, attendance with location data, and patient sessions. Always
          create a backup before performing restore operations.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Current Data Status
            </CardTitle>
            <CardDescription>Real-time overview of your clinic database</CardDescription>
          </CardHeader>
          <CardContent>
            {metadataLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : metadata ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Patients</span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{metadata.patientCount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Staff Members</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">{metadata.staffCount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Expense Records</span>
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{metadata.spendingCount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Attendance Records</span>
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{metadata.attendanceCount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Patient Sessions</span>
                  <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">{metadata.sessionCount}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last Modified
                  </span>
                  <span className="text-sm text-muted-foreground">{formatTimestamp(metadata.lastModified)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-green-500" />
              Selected Backup File
            </CardTitle>
            <CardDescription>Information about the loaded backup</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedFile && parsedBackup ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">File Name</span>
                  <span className="text-sm text-muted-foreground truncate max-w-[200px]" title={selectedFile.name}>
                    {selectedFile.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Patients</span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{parsedBackup.patients.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Staff Members</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">{parsedBackup.staff.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Expense Records</span>
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{parsedBackup.spendings.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Attendance Records</span>
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{parsedBackup.attendances.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Patient Sessions</span>
                  <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">{parsedBackup.sessions.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Backup Date
                  </span>
                  <span className="text-sm text-muted-foreground">{formatTimestamp(parsedBackup.timestamp)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileJson className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mb-4">No backup file loaded</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select Backup File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Export */}
        <Card className="hover:shadow-lg transition-shadow border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" />
              Export Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Download all clinic data as a timestamped JSON file for safekeeping
            </p>
            <Button onClick={handleExport} disabled={isProcessing} className="w-full">
              {exportMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Import & Replace */}
        <Card className="hover:shadow-lg transition-shadow border-green-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-green-500" />
              Import & Replace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Replace all current data with backup file contents (full restore)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => {
                if (parsedBackup) {
                  setShowImportDialog(true);
                } else {
                  fileInputRef.current?.click();
                }
              }}
              disabled={isProcessing}
              variant={parsedBackup ? 'default' : 'outline'}
              className="w-full"
            >
              {parsedBackup ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore Backup
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Merge */}
        <Card className="hover:shadow-lg transition-shadow border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-500" />
              Merge Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Merge backup data with existing records (overwrites duplicates by ID)
            </p>
            <Button
              onClick={() => setShowMergeDialog(true)}
              disabled={isProcessing || !parsedBackup}
              variant="outline"
              className="w-full"
            >
              {mergeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Merge Backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Reset */}
        <Card className="hover:shadow-lg transition-shadow border-red-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Reset All Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete all clinic data. This action cannot be undone.
            </p>
            <Button
              onClick={() => setShowResetDialog(true)}
              disabled={isProcessing}
              variant="destructive"
              className="w-full"
            >
              {resetMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset All Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Import Confirm Dialog */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Data Restore</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently replace ALL current clinic data with the backup file contents.
              This action cannot be undone. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Restore Backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Confirm Dialog */}
      <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Data Merge</AlertDialogTitle>
            <AlertDialogDescription>
              This will merge the backup data with your existing records. Records with matching IDs
              will be overwritten. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMerge}>
              Yes, Merge Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirm Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Permanently Delete All Data
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete ALL clinic data including patients, staff, treatments,
              financial records, attendance records, and patient sessions. This action CANNOT be undone.
              Please ensure you have a backup before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
